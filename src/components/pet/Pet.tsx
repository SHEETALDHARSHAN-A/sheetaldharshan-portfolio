'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { SearchDoc } from '@/data/types'
import { DEFAULT_BEHAVIOUR, HOLDABLE, type PetBehaviour } from './behaviour'
import { PetController } from './controller'
import { PetBubble, type Activity } from './PetBubble'
import { loadEngine } from './search'
import { SHEET } from './sprite'
import styles from './Pet.module.css'

export type Anchor = { x: number; y: number; w: number; h: number }

const MOBILE = '(max-width: 960px)'
const storageKey = (mobile: boolean) => `pet:pos:${mobile ? 'm' : 'd'}`

function read(key: string): { x: number; y: number } | null {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as { x: number; y: number }) : null
  } catch {
    return null
  }
}

function write(key: string, value: { x: number; y: number } | null) {
  try {
    if (value) window.localStorage.setItem(key, JSON.stringify(value))
    else window.localStorage.removeItem(key)
  } catch {
    /* storage can be blocked; the pet just forgets where it was */
  }
}

/**
 * The site's companion: a Codex-style sprite pet that lives in the sidebar (bottom-right on
 * phones). It runs when dragged anywhere and opens a chat bubble with site search when clicked
 * (or with / and ⌘K). What it does when idle, clicked, dropped or searching is set in the admin.
 */
export function Pet({
  sprite,
  showOnPhones = true,
  behaviour = DEFAULT_BEHAVIOUR,
}: { sprite?: string; showOnPhones?: boolean; behaviour?: PetBehaviour } = {}) {
  const sheet = sprite || SHEET.src
  const router = useRouter()
  const elRef = useRef<HTMLButtonElement>(null)
  const spriteRef = useRef<HTMLSpanElement>(null)
  const ctl = useRef<PetController | null>(null)
  const wasDrag = useRef(false)
  const openRef = useRef(false)
  const behaviourRef = useRef(behaviour)
  const [mounted, setMounted] = useState(false)
  const [ready, setReady] = useState(false)
  const [open, setOpen] = useState(false)
  const [anchor, setAnchor] = useState<Anchor | null>(null)
  const [away, setAway] = useState(false)
  const [mobile, setMobile] = useState(false)
  openRef.current = open
  behaviourRef.current = behaviour

  useEffect(() => setMounted(true), [])

  /* controller, layout, gaze and lifecycle */
  useEffect(() => {
    const el = elRef.current
    const sprite = spriteRef.current
    if (!mounted || !el || !sprite) return
    const c = new PetController(el, sprite)
    ctl.current = c
    const mq = window.matchMedia(MOBILE)
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    c.setReduced(motion.matches || document.documentElement.dataset.motion === 'reduced')

    let raf = 0
    const syncAnchor = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        if (openRef.current) setAnchor({ x: c.pos.x, y: c.pos.y, w: c.w, h: c.h })
      })
    }
    c.onMove = syncAnchor
    c.onDrop = (atHome) => {
      setAway(!atHome)
      write(storageKey(mq.matches), atHome ? null : { x: c.pos.x / window.innerWidth, y: c.pos.y / window.innerHeight })
    }
    c.onLand = () => c.perform(behaviourRef.current.dropAction)

    const layout = () => {
      const isMobile = mq.matches
      setMobile(isMobile)
      if (isMobile) {
        c.setSize(76)
        const bar = document.querySelector('.tabbar')?.getBoundingClientRect()
        const floor = bar && bar.height > 0 ? bar.top : window.innerHeight
        c.setHome(window.innerWidth - c.w - 6, floor - c.h + 4, 0)
      } else {
        const slot = document.querySelector('.sidebar-avatar')?.getBoundingClientRect()
        if (slot && slot.width > 0) {
          // Fill the space left above the optional cards: full size with none, smaller with one or two.
          c.setSize(Math.round(Math.max(84, Math.min(184, slot.height * 0.96 * (SHEET.cellWidth / SHEET.cellHeight)))))
          // The figure fills the middle of its cell, so it can stroll a little past the cell edges.
          // The figure is about 45% of its cell, so it may stroll until it nearly reaches the sidebar edges.
          const sidebar = document.querySelector('.sidebar')?.getBoundingClientRect() ?? slot
          c.setHome(slot.left + (slot.width - c.w) / 2, slot.top + (slot.height - c.h) / 2, Math.max(0, sidebar.width / 2 - c.w * 0.25 - 14))
        }
      }
      syncAnchor()
    }

    const restoreSaved = () => {
      const saved = read(storageKey(mq.matches))
      if (saved) {
        c.restore(saved.x * window.innerWidth, saved.y * window.innerHeight)
        setAway(true)
      } else {
        c.atHome = true
        setAway(false)
      }
    }

    layout()
    restoreSaved()

    const img = new Image()
    img.decoding = 'async'
    img.src = sheet
    let alive = true
    const start = () => {
      if (!alive) return
      setReady(true)
      c.rest()
    }
    img.decode().then(start, start)

    let lastLook = 0
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || !behaviourRef.current.followCursor) return
      const now = performance.now()
      if (now - lastLook < 120) return
      lastLook = now
      c.lookAt(e.clientX, e.clientY)
    }
    const onVisibility = () => c.setHidden(document.visibilityState !== 'visible')
    const onMq = () => {
      layout()
      restoreSaved()
    }
    const onMotion = () => c.setReduced(motion.matches)
    const ro = new ResizeObserver(layout)
    const slot = document.querySelector('.sidebar-avatar')
    if (slot) ro.observe(slot)
    window.addEventListener('resize', layout)
    window.addEventListener('pointermove', onPointer, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)
    mq.addEventListener('change', onMq)
    motion.addEventListener('change', onMotion)
    return () => {
      alive = false
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('resize', layout)
      window.removeEventListener('pointermove', onPointer)
      document.removeEventListener('visibilitychange', onVisibility)
      mq.removeEventListener('change', onMq)
      motion.removeEventListener('change', onMotion)
      c.destroy()
      ctl.current = null
    }
  }, [mounted, sheet])

  /* strolling, from the admin; desktop only, where it has the sidebar to walk across */
  useEffect(() => {
    ctl.current?.setWander(ready && !mobile && behaviour.stroll, behaviour.strollEvery * 1000)
  }, [ready, mobile, behaviour.stroll, behaviour.strollEvery])

  /* the visitor going idle and coming back, from the admin */
  const { idleAfter, idleAction, idleRepeat, returnAction } = behaviour
  useEffect(() => {
    if (!ready) return
    let idle = false
    let timer = 0
    let again = 0
    let last = 0
    const arm = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(goIdle, idleAfter * 1000)
    }
    function goIdle() {
      const c = ctl.current
      if (!c || openRef.current || document.visibilityState !== 'visible') return arm()
      idle = true
      c.perform(idleAction, idleRepeat)
      // One-off actions come round again while the visitor stays away; loops simply keep going.
      if (idleRepeat && !HOLDABLE.has(idleAction)) again = window.setInterval(() => ctl.current?.perform(idleAction), Math.max(12, idleAfter) * 1000)
    }
    const onActive = () => {
      if (idle) {
        idle = false
        window.clearInterval(again)
        ctl.current?.release()
        ctl.current?.perform(returnAction)
      } else if (performance.now() - last < 400) return
      last = performance.now()
      arm()
    }
    const events = ['pointermove', 'pointerdown', 'keydown', 'wheel', 'scroll', 'touchstart'] as const
    for (const name of events) window.addEventListener(name, onActive, { passive: true, capture: true })
    arm()
    return () => {
      for (const name of events) window.removeEventListener(name, onActive, { capture: true })
      window.clearTimeout(timer)
      window.clearInterval(again)
      ctl.current?.release()
    }
  }, [ready, idleAfter, idleAction, idleRepeat, returnAction])

  /* the bubble follows the pet while it is open */
  useEffect(() => {
    const c = ctl.current
    if (open && c) setAnchor({ x: c.pos.x, y: c.pos.y, w: c.w, h: c.h })
  }, [open])

  /* keyboard: "/" or ⌘K / Ctrl+K opens search */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const typing = target?.closest?.('input, textarea, select, [contenteditable="true"]')
      if ((e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey)) {
        e.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const close = useCallback(() => {
    setOpen(false)
    ctl.current?.setMode('idle')
  }, [])

  // Reactions to the search bubble, as set in the admin.
  const onActivity = useCallback((activity: Activity) => {
    const b = behaviourRef.current
    const action = activity === 'opened' ? b.clickAction : activity === 'found' ? b.foundAction : activity === 'empty' ? b.emptyAction : 'none'
    ctl.current?.perform(action)
  }, [])

  const go = useCallback(
    (doc: SearchDoc) => {
      close()
      if (doc.external) {
        if (doc.href.startsWith('mailto:')) window.location.href = doc.href
        else window.open(doc.href, '_blank', 'noopener,noreferrer')
      } else {
        router.push(doc.href)
      }
    },
    [close, router],
  )

  if (!mounted) return null

  return createPortal(
    <>
      <button
        ref={elRef}
        type="button"
        className={styles.pet}
        data-pet=""
        data-phones={showOnPhones ? 'on' : 'off'}
        data-ready={ready ? 'true' : 'false'}
        aria-label="Search the site"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="pet-bubble"
        title="Click to search · drag to move"
        style={{ viewTransitionName: 'site-pet' }}
        onPointerDown={(e) => ctl.current?.pointerDown(e.nativeEvent)}
        onPointerMove={(e) => ctl.current?.pointerMove(e.nativeEvent)}
        onPointerUp={(e) => {
          wasDrag.current = ctl.current?.pointerUp(e.nativeEvent) ?? false
        }}
        onPointerCancel={(e) => {
          wasDrag.current = ctl.current?.pointerUp(e.nativeEvent) ?? false
        }}
        onPointerEnter={() => void loadEngine().catch(() => undefined)}
        onClick={() => {
          if (wasDrag.current) {
            wasDrag.current = false
            return
          }
          if (open) close()
          else setOpen(true)
        }}
        onDoubleClick={() => away && ctl.current?.goHome()}
      >
        <span ref={spriteRef} className={styles.sprite} style={{ backgroundImage: ready ? `url(${sheet})` : undefined }} />
      </button>
      <PetBubble
        open={open}
        anchor={anchor}
        mobile={mobile}
        away={away}
        onClose={close}
        onActivity={onActivity}
        onGo={go}
        onHome={() => ctl.current?.goHome()}
      />
    </>,
    document.body,
  )
}
