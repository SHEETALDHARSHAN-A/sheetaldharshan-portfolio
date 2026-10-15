'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { SearchDoc } from '@/data/types'
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
 * phones). It follows the cursor with its eyes, wanders, can be dragged anywhere, reacts to
 * navigation, and opens a chat bubble with site search when clicked (or with / and ⌘K).
 */
export function Pet() {
  const router = useRouter()
  const pathname = usePathname()
  const elRef = useRef<HTMLButtonElement>(null)
  const ctl = useRef<PetController | null>(null)
  const wasDrag = useRef(false)
  const lastPath = useRef<string | null>(null)
  const openRef = useRef(false)
  const lastHop = useRef(0)
  const lastOutcome = useRef<Activity | null>(null)
  const [mounted, setMounted] = useState(false)
  const [ready, setReady] = useState(false)
  const [open, setOpen] = useState(false)
  const [anchor, setAnchor] = useState<Anchor | null>(null)
  const [away, setAway] = useState(false)
  const [mobile, setMobile] = useState(false)
  openRef.current = open

  useEffect(() => setMounted(true), [])

  /* controller, layout, gaze and lifecycle */
  useEffect(() => {
    const el = elRef.current
    if (!mounted || !el) return
    const c = new PetController(el)
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

    const layout = () => {
      const isMobile = mq.matches
      setMobile(isMobile)
      c.setSize(isMobile ? 76 : 184)
      if (isMobile) {
        const bar = document.querySelector('.tabbar')?.getBoundingClientRect()
        const floor = bar && bar.height > 0 ? bar.top : window.innerHeight
        c.setHome(window.innerWidth - c.w - 6, floor - c.h + 4, 0)
      } else {
        const slot = document.querySelector('.sidebar-avatar')?.getBoundingClientRect()
        if (slot && slot.width > 0) {
          // The figure fills the middle of its cell, so it can stroll a little past the cell edges.
          // The figure is about 45% of its cell, so it may stroll until it nearly reaches the sidebar edges.
          const sidebar = document.querySelector('.sidebar')?.getBoundingClientRect() ?? slot
          c.setHome(slot.left + (slot.width - c.w) / 2, slot.top + (slot.height - c.h) / 2, Math.max(0, sidebar.width / 2 - c.w * 0.25 - 14))
        }
      }
      c.setWander(!isMobile)
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
    img.src = SHEET.src
    let alive = true
    const start = () => {
      if (!alive) return
      setReady(true)
      let greeted = false
      try {
        greeted = window.sessionStorage.getItem('pet:greeted') === '1'
        window.sessionStorage.setItem('pet:greeted', '1')
      } catch {
        /* ignore */
      }
      if (greeted) c.rest()
      else c.react('waving')
    }
    img.decode().then(start, start)

    let lastLook = 0
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
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
  }, [mounted])

  /* the bubble follows the pet while it is open */
  useEffect(() => {
    const c = ctl.current
    if (open && c) setAnchor({ x: c.pos.x, y: c.pos.y, w: c.w, h: c.h })
  }, [open])

  /* reactions to navigation */
  useEffect(() => {
    if (!pathname || !ready) return
    if (lastPath.current === null || lastPath.current === pathname) {
      lastPath.current = pathname
      return
    }
    lastPath.current = pathname
    const c = ctl.current
    if (!c || openRef.current) return
    // Only the Contact page gets a greeting; elsewhere the pet stays calm.
    if (pathname === '/contact') c.react('waving')
  }, [pathname, ready])

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

  const onActivity = useCallback((activity: Activity) => {
    const c = ctl.current
    if (!c) return
    if (activity === 'opened') {
      c.setMode('waiting')
      c.react('waving')
    } else if (activity === 'typing') c.setMode('working')
    else if (activity === 'waiting') {
      lastOutcome.current = null
      c.setMode('waiting')
    } else if (activity !== lastOutcome.current) {
      // React once per change of outcome (found ↔ nothing), not after every pause.
      lastOutcome.current = activity
      c.setMode('waiting')
      c.react(activity === 'found' ? 'review' : 'failed')
    }
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
        data-ready={ready ? 'true' : 'false'}
        aria-label="Search the site"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="pet-bubble"
        title="Click to search · drag to move"
        style={{ backgroundImage: ready ? `url(${SHEET.src})` : undefined, viewTransitionName: 'site-pet' }}
        onPointerDown={(e) => ctl.current?.pointerDown(e.nativeEvent)}
        onPointerMove={(e) => ctl.current?.pointerMove(e.nativeEvent)}
        onPointerUp={(e) => {
          wasDrag.current = ctl.current?.pointerUp(e.nativeEvent) ?? false
        }}
        onPointerCancel={(e) => {
          wasDrag.current = ctl.current?.pointerUp(e.nativeEvent) ?? false
        }}
        onPointerEnter={(e) => {
          void loadEngine().catch(() => undefined)
          if (e.pointerType !== 'mouse' || openRef.current || performance.now() - lastHop.current < 30000) return
          lastHop.current = performance.now()
          ctl.current?.react('jumping')
        }}
        onClick={() => {
          if (wasDrag.current) {
            wasDrag.current = false
            return
          }
          if (open) close()
          else setOpen(true)
        }}
        onDoubleClick={() => away && ctl.current?.goHome()}
      />
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
