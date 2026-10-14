'use client'

import { usePathname } from 'next/navigation'
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import styles from './InteractiveAvatar.module.css'
import { AVATAR_EVENT, type Expression } from './expressions'

export type { Expression }
export { setExpression } from './expressions'

export type AvatarHandle = { setExpression: (expression: Expression, options?: { hold?: boolean; duration?: number }) => void }

const TRANSIENT: Partial<Record<Expression, number>> = { happy: 1400, excited: 1500, wave: 1900, curious: 1300, surprised: 900 }
const SLEEP_AFTER = 30000

/**
 * A chibi, Memoji-style avatar in inline SVG (about 7 KB gzipped, no images or WebGL).
 * The head is built from parallax layers (ears, skull, hair, face) that slide by different
 * amounts, so it appears to turn in 3D toward the cursor; the pupils track it too. It reacts to
 * the page: hovering links makes it curious, clicking makes it excited, typing makes it think,
 * route changes and long inactivity have their own faces. Animation work happens only while the
 * pointer is moving, and stops offscreen, in hidden tabs and under reduced motion.
 */
export const InteractiveAvatar = forwardRef<AvatarHandle, { size?: number; className?: string; label?: string; variant?: 'bust' | 'full' }>(function InteractiveAvatar(
  { size = 150, className, label = 'Animated avatar of Sheetaldharshan', variant = 'bust' },
  ref,
) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [expression, setExpr] = useState<Expression>('idle')
  const [blink, setBlink] = useState(false)
  const [bounce, setBounce] = useState(0)
  const resetTimer = useRef<number | undefined>(undefined)
  const sleepTimer = useRef<number | undefined>(undefined)
  const s = useRef({ tx: 0, ty: 0, x: 0, y: 0, raf: 0, visible: true, reduced: false, held: false, expr: 'idle' as Expression })
  const pathname = usePathname()

  const apply = useCallback((next: Expression, options: { hold?: boolean; duration?: number } = {}) => {
    window.clearTimeout(resetTimer.current)
    s.current.held = !!options.hold
    s.current.expr = next
    setExpr(next)
    if (next === 'happy' || next === 'excited') setBounce((n) => n + 1)
    const ms = options.duration ?? TRANSIENT[next]
    if (!options.hold && ms) {
      resetTimer.current = window.setTimeout(() => {
        s.current.expr = 'idle'
        setExpr('idle')
      }, ms)
    }
  }, [])

  useImperativeHandle(ref, () => ({ setExpression: apply }), [apply])

  /* programmatic API */
  useEffect(() => {
    const onEvent = (e: Event) => {
      const d = (e as CustomEvent<{ expression: Expression; hold?: boolean; duration?: number }>).detail
      if (d?.expression) apply(d.expression, d)
    }
    window.addEventListener(AVATAR_EVENT, onEvent)
    return () => window.removeEventListener(AVATAR_EVENT, onEvent)
  }, [apply])

  /* route reactions */
  useEffect(() => {
    if (!pathname) return
    if (pathname === '/projects') apply('excited')
    else if (pathname.startsWith('/projects/')) apply('curious', { duration: 1600 })
    else if (pathname === '/contact') apply('wave')
    else if (pathname.startsWith('/blog')) apply('thinking', { duration: 1600 })
    else if (pathname === '/about') apply('happy')
  }, [pathname, apply])

  /* page reactions: hover links, click anything, type, go idle */
  useEffect(() => {
    const interactive = 'a[href], button, summary, .project-row, input, textarea'
    const field = 'input, textarea, [contenteditable="true"]'
    let lastHover: Element | null = null
    const wake = () => {
      window.clearTimeout(sleepTimer.current)
      if (s.current.expr === 'sleepy') apply('surprised')
      sleepTimer.current = window.setTimeout(() => !s.current.held && apply('sleepy', { hold: true }), SLEEP_AFTER)
    }
    const onOver = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.(interactive) ?? null
      if (el && el !== lastHover && !rootRef.current?.contains(el) && !s.current.held && s.current.expr === 'idle') apply('curious', { duration: 900 })
      lastHover = el
    }
    const onClick = (e: MouseEvent) => {
      if (rootRef.current?.contains(e.target as Node)) return
      const el = (e.target as Element | null)?.closest?.('a[href], button, .project-row')
      if (el && !s.current.held) apply('excited', { duration: 900 })
    }
    const onKey = (e: KeyboardEvent) => {
      wake()
      if ((e.target as Element | null)?.matches?.(field)) apply('thinking', { hold: true })
    }
    const onFocusOut = (e: FocusEvent) => (e.target as Element | null)?.matches?.(field) && apply('idle')
    window.addEventListener('pointerover', onOver, { passive: true })
    window.addEventListener('click', onClick, true)
    window.addEventListener('keydown', onKey)
    document.addEventListener('focusout', onFocusOut)
    window.addEventListener('pointermove', wake, { passive: true })
    window.addEventListener('scroll', wake, { passive: true, capture: true })
    wake()
    return () => {
      window.removeEventListener('pointerover', onOver)
      window.removeEventListener('click', onClick, true)
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('focusout', onFocusOut)
      window.removeEventListener('pointermove', wake)
      window.removeEventListener('scroll', wake, true)
      window.clearTimeout(sleepTimer.current)
    }
  }, [apply])

  /* blinks */
  useEffect(() => {
    let t: number
    const loop = () => {
      t = window.setTimeout(() => {
        if (s.current.visible && s.current.expr !== 'sleepy') {
          setBlink(true)
          window.setTimeout(() => setBlink(false), 120)
          if (Math.random() < 0.22) window.setTimeout(() => { setBlink(true); window.setTimeout(() => setBlink(false), 110) }, 240)
        }
        loop()
      }, 2200 + Math.random() * 3600)
    }
    loop()
    return () => window.clearTimeout(t)
  }, [])

  /* pointer → --x/--y (−1..1), eased in a rAF loop that runs only while settling */
  useEffect(() => {
    const st = s.current
    const root = rootRef.current
    if (!root) return
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    st.reduced = media.matches || document.documentElement.dataset.motion === 'reduced'
    const onMedia = () => (st.reduced = media.matches)
    media.addEventListener('change', onMedia)
    const render = () => {
      st.x += (st.tx - st.x) * 0.12
      st.y += (st.ty - st.y) * 0.12
      root.style.setProperty('--x', st.x.toFixed(3))
      root.style.setProperty('--y', st.y.toFixed(3))
      st.raf = Math.abs(st.tx - st.x) > 0.002 || Math.abs(st.ty - st.y) > 0.002 ? requestAnimationFrame(render) : 0
    }
    const kick = () => {
      if (!st.raf && st.visible && !st.reduced) st.raf = requestAnimationFrame(render)
    }
    let last = 0
    const onMove = (e: PointerEvent) => {
      const now = performance.now()
      if (now - last < 16) return
      last = now
      const r = root.getBoundingClientRect()
      const dx = (e.clientX - (r.left + r.width / 2)) / Math.max(260, window.innerWidth * 0.45)
      const dy = (e.clientY - (r.top + r.height * 0.42)) / Math.max(260, window.innerHeight * 0.45)
      st.tx = Math.max(-1, Math.min(1, dx))
      st.ty = Math.max(-1, Math.min(1, dy))
      kick()
    }
    const onLeave = () => {
      st.tx = 0
      st.ty = 0
      kick()
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    const setVisible = (v: boolean) => {
      st.visible = v
      root.dataset.paused = v ? 'false' : 'true'
    }
    const io = new IntersectionObserver(([en]) => setVisible(en.isIntersecting && document.visibilityState === 'visible'))
    io.observe(root)
    const onVis = () => setVisible(document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', onVis)
    return () => {
      cancelAnimationFrame(st.raf)
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('visibilitychange', onVis)
      media.removeEventListener('change', onMedia)
      io.disconnect()
    }
  }, [])

  useEffect(() => () => window.clearTimeout(resetTimer.current), [])

  return (
    <div
      ref={rootRef}
      className={`${styles.root}${className ? ` ${className}` : ''}`}
      data-expression={expression}
      data-blink={blink ? 'true' : 'false'}
      data-paused="false"
      data-variant={variant}
      style={{ width: size, height: variant === 'full' ? size * 1.6 : size }}
      onPointerEnter={() => !s.current.held && apply('curious', { duration: 99999 })}
      onPointerLeave={() => !s.current.held && s.current.expr === 'curious' && apply('idle')}
      onClick={() => apply('happy')}
      role="img"
      aria-label={label}
    >
      <svg viewBox={variant === 'full' ? '-25 0 250 400' : '0 0 200 200'} className={styles.svg} key={bounce} data-bounce={bounce > 0 ? 'true' : 'false'} aria-hidden="true">
        <defs>
          <radialGradient id="mj-skin" cx="38%" cy="30%" r="80%">
            <stop offset="0" stopColor="#d9a07c" />
            <stop offset=".5" stopColor="#b47a58" />
            <stop offset="1" stopColor="#8a573d" />
          </radialGradient>
          <radialGradient id="mj-ear" cx="40%" cy="40%" r="70%">
            <stop offset="0" stopColor="#c48a68" />
            <stop offset="1" stopColor="#8f5c41" />
          </radialGradient>
          <radialGradient id="mj-hair" cx="35%" cy="25%" r="85%">
            <stop offset="0" stopColor="#5a4033" />
            <stop offset=".45" stopColor="#2c1f19" />
            <stop offset="1" stopColor="#140e0b" />
          </radialGradient>
          <radialGradient id="mj-curl" cx="35%" cy="30%" r="70%">
            <stop offset="0" stopColor="#6a4c3d" />
            <stop offset=".6" stopColor="#2a1d17" />
            <stop offset="1" stopColor="#170f0c" />
          </radialGradient>
          <radialGradient id="mj-iris" cx="38%" cy="32%" r="75%">
            <stop offset="0" stopColor="#8a5a34" />
            <stop offset=".55" stopColor="#4a2a16" />
            <stop offset="1" stopColor="#1e1008" />
          </radialGradient>
          <linearGradient id="mj-hood" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3a3d46" />
            <stop offset="1" stopColor="#15161b" />
          </linearGradient>
          <linearGradient id="mj-stubble" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3b261b" stopOpacity="0" />
            <stop offset=".3" stopColor="#24160f" stopOpacity=".6" />
            <stop offset="1" stopColor="#170e09" stopOpacity=".9" />
          </linearGradient>
          <radialGradient id="mj-gloss" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#fff" stopOpacity=".42" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g className={styles.breathe}>
          {variant === 'full' && (
            <g className={styles.fullBody}>
              <defs>
                <linearGradient id="fb-fleece" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#3a383b" />
                  <stop offset=".55" stopColor="#262427" />
                  <stop offset="1" stopColor="#151416" />
                </linearGradient>
                <linearGradient id="fb-sleeve" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#1b1a1c" />
                  <stop offset=".45" stopColor="#343235" />
                  <stop offset="1" stopColor="#1d1c1e" />
                </linearGradient>
                <linearGradient id="fb-jogger" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#1e1d1f" />
                  <stop offset=".5" stopColor="#323033" />
                  <stop offset="1" stopColor="#1c1b1d" />
                </linearGradient>
                <linearGradient id="fb-shoe" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#ffffff" />
                  <stop offset="1" stopColor="#dcdcd8" />
                </linearGradient>
              </defs>

              <ellipse cx="100" cy="391" rx="62" ry="6" fill="#000" opacity=".4" />

              {/* joggers with ribbed cuffs */}
              <path d="M60 228h40l-3 130H70c-4-40-8-86-10-130z" fill="url(#fb-jogger)" />
              <path d="M100 228h40c-2 44-6 90-10 130h-27z" fill="url(#fb-jogger)" />
              <path d="M92 228h16l-4 52h-8z" fill="#1d1c1e" />
              <path d="M100 236v26M78 288c4 3 10 3 14 0M108 300c4 3 10 3 14 0" stroke="#151416" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity=".7" />
              <rect x="69" y="350" width="29" height="13" rx="4" fill="#232224" />
              <rect x="102" y="350" width="29" height="13" rx="4" fill="#232224" />
              <path d="M74 352v9M79 352v9M84 352v9M89 352v9M94 352v9M107 352v9M112 352v9M117 352v9M122 352v9M127 352v9" stroke="#000" strokeWidth=".8" opacity=".25" />

              {/* white low-top sneakers */}
              <path d="M66 366c0-4 3-6 7-6h20c3 0 5 2 6 5l2 11c1 5-2 9-7 9H65c-5 0-7-3-6-7z" fill="url(#fb-shoe)" />
              <path d="M134 366c0-4-3-6-7-6h-20c-3 0-5 2-6 5l-2 11c-1 5 2 9 7 9h29c5 0 7-3 6-7z" fill="url(#fb-shoe)" />
              <path d="M60 380h40M100 380h40" stroke="#cfcfca" strokeWidth="3" strokeLinecap="round" />
              <path d="M78 364l8 3M80 368l8 3M122 364l-8 3M120 368l-8 3" stroke="#c4c4bf" strokeWidth="1.3" strokeLinecap="round" />

              {/* arms hang from the shoulders and rotate there for the expressions */}
              <g className={`${styles.arm} ${styles.armL}`}>
                <path d="M56 116c-12 4-17 16-18 32l-6 68h23l4-66c1-14-1-26-3-34z" fill="url(#fb-sleeve)" />
                <rect x="31" y="210" width="25" height="14" rx="5" fill="#1f1e20" />
                <path d="M35 212v10M40 212v10M45 212v10M50 212v10" stroke="#000" strokeWidth=".8" opacity=".3" />
                <path d="M33 224c-3 10-2 22 4 28 5 4 12 3 15-2 3-7 3-17 1-26z" fill="url(#mj-ear)" />
                <path d="M39 238c0 5 1 9 3 12M45 238c0 5 0 9 1 12" stroke="#8a573d" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity=".6" />
              </g>
              <g className={`${styles.arm} ${styles.armR}`}>
                <path d="M144 116c12 4 17 16 18 32l6 68h-23l-4-66c-1-14 1-26 3-34z" fill="url(#fb-sleeve)" />
                <rect x="144" y="210" width="25" height="14" rx="5" fill="#1f1e20" />
                <path d="M150 212v10M155 212v10M160 212v10M165 212v10" stroke="#000" strokeWidth=".8" opacity=".3" />
                <path d="M167 224c3 10 2 22-4 28-5 4-12 3-15-2-3-7-3-17-1-26z" fill="url(#mj-ear)" />
                <path d="M161 238c0 5-1 9-3 12M155 238c0 5 0 9-1 12" stroke="#8a573d" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity=".6" />
              </g>

              {/* hoodie body */}
              <path d="M62 114c10-6 22-9 38-9s28 3 38 9c8 5 11 14 11 26l-5 82H56l-5-82c0-12 3-21 11-26z" fill="url(#fb-fleece)" />
              <path d="M62 120c-2 30-3 60-2 96M138 120c2 30 3 60 2 96" stroke="#000" strokeWidth="1.4" fill="none" opacity=".35" />
              {/* kangaroo pocket */}
              <path d="M72 170h56l9 38H63z" fill="#2b292c" />
              <path d="M72 170h56l9 38H63z" fill="none" stroke="#000" strokeWidth="1.2" opacity=".35" />
              <path d="M72 170l-7 30M128 170l7 30" stroke="#000" strokeWidth="1.5" opacity=".35" />
              {/* ribbed hem */}
              <rect x="55" y="214" width="90" height="18" rx="6" fill="#222123" />
              <path d="M62 216v14M68 216v14M74 216v14M80 216v14M86 216v14M92 216v14M98 216v14M104 216v14M110 216v14M116 216v14M122 216v14M128 216v14M134 216v14M140 216v14" stroke="#000" strokeWidth=".8" opacity=".28" />

              {/* neck and the crossover hood */}
              <path d="M88 86h24v20c0 6-6 9-12 9s-12-3-12-9z" fill="#9a6447" />
              <path d="M68 112c2-12 12-20 22-22l10 26 10-26c10 2 20 10 22 22-8 8-20 12-32 12s-24-4-32-12z" fill="#2f2d30" />
              <path d="M90 90l10 26 10-26" fill="none" stroke="#1a191b" strokeWidth="2" strokeLinejoin="round" />
              {/* drawstrings with metal eyelets and aglets */}
              <circle cx="91" cy="120" r="2.4" fill="#a9a9a6" /><circle cx="109" cy="120" r="2.4" fill="#a9a9a6" />
              <path d="M91 121c-1 10-1 20 0 30M109 121c1 10 1 20 0 30" stroke="#121113" strokeWidth="2.6" fill="none" strokeLinecap="round" />
              <rect x="89" y="150" width="4" height="8" rx="1.6" fill="#0b0b0c" /><rect x="107" y="150" width="4" height="8" rx="1.6" fill="#0b0b0c" />
              <path d="M90 151v6M108 151v6" stroke="#fff" strokeWidth=".7" opacity=".35" />

              {/* raised right arm for the wave */}
              <g className={styles.waveArm}>
                <path d="M146 124c14 8 22 20 22 34 0-22 2-44 4-58" fill="none" stroke="#141315" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M146 124c14 8 22 20 22 34 0-22 2-44 4-58" fill="none" stroke="url(#fb-sleeve)" strokeWidth="19" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="162" y="90" width="21" height="11" rx="4" fill="#1f1e20" />
                <g className={styles.fbPalm}>
                  <path d="M164 88c-2-6-1-14 2-18M169 86c0-8 1-15 3-19M175 86c1-8 3-14 5-17M180 89c2-5 4-9 7-10" stroke="#c48a68" strokeWidth="5" strokeLinecap="round" fill="none" />
                  <ellipse cx="173" cy="86" rx="10" ry="8" fill="url(#mj-ear)" />
                  <path d="M164 86c-4-3-6-6-6-9" stroke="#c48a68" strokeWidth="5" strokeLinecap="round" fill="none" />
                </g>
              </g>
              {/* right hand to the chin while thinking */}
              <g className={styles.thinkArm}>
                <path d="M146 124c6 22 8 46 4 64-12-18-24-46-36-74" fill="none" stroke="#141315" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M146 124c6 22 8 46 4 64-12-18-24-46-36-74" fill="none" stroke="url(#fb-sleeve)" strokeWidth="19" strokeLinecap="round" strokeLinejoin="round" />
                <ellipse cx="111" cy="104" rx="9" ry="8" fill="url(#mj-ear)" />
                <path d="M104 101c3-2 7-2 10 0M104 106c3-2 7-2 10 0" stroke="#8a573d" strokeWidth="1.2" fill="none" opacity=".6" />
                <path d="M109 97c-1-5 1-9 4-11" stroke="#c48a68" strokeWidth="4.5" strokeLinecap="round" fill="none" />
              </g>
            </g>
          )}

          {/* small body */}
          <g className={styles.body}>
            <path d="M40 200c2-26 26-44 60-44s58 18 60 44z" fill="url(#mj-hood)" />
            <path d="M78 160c6 9 13 13 22 13s16-4 22-13" fill="none" stroke="#4b4f5a" strokeWidth="5" strokeLinecap="round" />
            <path d="M90 172v16M110 172v16" stroke="#e8e6e0" strokeWidth="2.6" strokeLinecap="round" />
            <circle cx="90" cy="190" r="2.6" fill="#e8e6e0" /><circle cx="110" cy="190" r="2.6" fill="#e8e6e0" />
            <path d="M88 148h24v12c0 5-6 8-12 8s-12-3-12-8z" fill="#9a6447" />
          </g>

          <g transform={variant === 'full' ? 'translate(40 0) scale(0.6)' : undefined}>
          {/* head: parallax layers turn it toward the cursor */}
          <g className={styles.head}>
            <g className={styles.ears}>
              <ellipse cx="33" cy="98" rx="11" ry="14" fill="url(#mj-ear)" />
              <ellipse cx="167" cy="98" rx="11" ry="14" fill="url(#mj-ear)" />
              <ellipse cx="34" cy="99" rx="5" ry="7.5" fill="#8a573d" opacity=".55" />
              <ellipse cx="166" cy="99" rx="5" ry="7.5" fill="#8a573d" opacity=".55" />
            </g>
            <g className={styles.skull}>
              <ellipse cx="100" cy="96" rx="67" ry="64" fill="url(#mj-skin)" />
              <ellipse cx="78" cy="66" rx="28" ry="16" fill="url(#mj-gloss)" />
              {/* soft stubble on the jaw */}
              <path d="M40 104c4 32 28 54 60 54s56-22 60-54c-8 18-26 30-60 30S48 122 40 104z" fill="url(#mj-stubble)" />
            </g>

            <g className={styles.face}>
              <ellipse className={styles.cheek} cx="58" cy="118" rx="12" ry="7" fill="#e07a6a" />
              <ellipse className={styles.cheek} cx="142" cy="118" rx="12" ry="7" fill="#e07a6a" />

              <g className={styles.eyes}>
                <ellipse cx="74" cy="101" rx="15" ry="16.5" fill="#fbf8f4" />
                <ellipse cx="126" cy="101" rx="15" ry="16.5" fill="#fbf8f4" />
                <g className={styles.pupils}>
                  <circle cx="74" cy="103" r="10.5" fill="url(#mj-iris)" />
                  <circle cx="126" cy="103" r="10.5" fill="url(#mj-iris)" />
                  <circle cx="74" cy="103" r="5" fill="#0c0604" />
                  <circle cx="126" cy="103" r="5" fill="#0c0604" />
                  <circle cx="78" cy="98" r="3.4" fill="#fff" />
                  <circle cx="130" cy="98" r="3.4" fill="#fff" />
                  <circle cx="70.5" cy="107" r="1.5" fill="#fff" opacity=".8" />
                  <circle cx="122.5" cy="107" r="1.5" fill="#fff" opacity=".8" />
                </g>
                <rect className={styles.lid} x="57" y="83" width="34" height="36" rx="16" fill="#bf8463" />
                <rect className={styles.lid} x="109" y="83" width="34" height="36" rx="16" fill="#bf8463" />
              </g>

              <path className={`${styles.brow} ${styles.browL}`} d="M60 80c6-6 16-7 26-3" fill="none" stroke="#2a1b14" strokeWidth="7.5" strokeLinecap="round" />
              <path className={`${styles.brow} ${styles.browR}`} d="M114 77c10-4 20-3 26 3" fill="none" stroke="#2a1b14" strokeWidth="7.5" strokeLinecap="round" />

              <ellipse cx="100" cy="117" rx="6" ry="4" fill="#9a6447" opacity=".7" />
              <ellipse cx="98.5" cy="115.5" rx="2" ry="1.2" fill="#fff" opacity=".35" />

              {/* moustache, soft */}
              <path d="M83 128c6-5 12-5 17-2 5-3 11-3 17 2-3 3-8 3-11 2-2 1-4 1-6 1s-4 0-6-1c-3 1-8 1-11-2z" fill="#1c110c" opacity=".85" />
              <path d="M84 129c-2 8-1 14 2 18M116 129c2 8 1 14-2 18" stroke="#1c110c" strokeWidth="4" strokeLinecap="round" fill="none" opacity=".55" />

              <path className={`${styles.mouth} ${styles.mIdle}`} d="M88 133c6 3 18 3 24 0-2 6-7 8-12 8s-10-2-12-8z" fill="#c26f68" />
              <g className={`${styles.mouth} ${styles.mHappy}`}>
                <path d="M84 131c4 15 28 15 32 0z" fill="#5a1d18" />
                <path d="M87 131.5h26c-1 3-5 4.5-13 4.5s-12-1.5-13-4.5z" fill="#fff" />
                <ellipse cx="100" cy="141" rx="7" ry="3.5" fill="#e66f68" />
              </g>
              <g className={`${styles.mouth} ${styles.mExcited}`}>
                <ellipse cx="100" cy="137" rx="10" ry="10" fill="#5a1d18" />
                <ellipse cx="100" cy="142" rx="6.5" ry="3.8" fill="#e66f68" />
              </g>
              <ellipse className={`${styles.mouth} ${styles.mSurprised}`} cx="100" cy="136" rx="5.5" ry="6.5" fill="#5a1d18" />
              <path className={`${styles.mouth} ${styles.mThinking}`} d="M93 137c5-3 11-3 16 0" fill="none" stroke="#6b2f26" strokeWidth="3.4" strokeLinecap="round" />
              <ellipse className={`${styles.mouth} ${styles.mCurious}`} cx="102" cy="135" rx="4" ry="3.6" fill="#5a1d18" />
              <path className={`${styles.mouth} ${styles.mSleepy}`} d="M93 135c4 2 10 2 14 0" fill="none" stroke="#6b2f26" strokeWidth="3" strokeLinecap="round" />
            </g>

            {/* curly hair, soft and rounded, faded at the sides */}
            <g className={styles.hair}>
              <path d="M36 72c-4 10-5 22-2 32 3-3 7-5 11-5-2-9-1-19 3-27zM164 72c4 10 5 22 2 32-3-3-7-5-11-5 2-9 1-19-3-27z" fill="#2a1d17" opacity=".6" />
              <path d="M33 92c-4-40 26-66 67-66s71 26 67 66c-6-14-16-24-30-30-12 8-26 10-37 8-11 2-25 0-37-8-14 6-24 16-30 30z" fill="url(#mj-hair)" />
              <g fill="url(#mj-curl)">
                <circle cx="44" cy="62" r="17" /><circle cx="64" cy="40" r="19" /><circle cx="90" cy="28" r="20" />
                <circle cx="116" cy="29" r="20" /><circle cx="140" cy="40" r="19" /><circle cx="158" cy="62" r="17" />
                <circle cx="76" cy="58" r="13" /><circle cx="100" cy="52" r="14" /><circle cx="124" cy="58" r="13" />
                <circle cx="38" cy="82" r="12" /><circle cx="163" cy="82" r="12" />
              </g>
              <g fill="#fff" opacity=".12">
                <ellipse cx="60" cy="33" rx="7" ry="4" /><ellipse cx="86" cy="20" rx="7" ry="4" /><ellipse cx="112" cy="21" rx="7" ry="4" />
                <ellipse cx="137" cy="33" rx="7" ry="4" /><ellipse cx="97" cy="46" rx="5" ry="3" />
              </g>
            </g>
          </g>

          {/* waving hand */}
          <g className={styles.hand}>
            <path className={styles.handSleeve} d="M156 200c2-18 6-30 12-40" stroke="#2a2c33" strokeWidth="15" strokeLinecap="round" fill="none" />
            <g className={styles.palm}>
              <circle cx="170" cy="150" r="13" fill="#c48a68" />
              <path d="M161 141c-1-9 2-14 5-14s4 5 3 12M168 138c0-10 2-15 5-15s4 5 3 14M175 140c1-9 4-13 7-12s3 5 0 13M181 145c3-6 6-8 8-7s2 5-2 10" stroke="#c48a68" strokeWidth="6.5" strokeLinecap="round" fill="none" />
            </g>
          </g>

          {/* sleepy z */}
          <g className={styles.zzz} fill="#9aa4b8" fontFamily="system-ui, sans-serif" fontWeight="700">
            <text x="150" y="40" fontSize="14">z</text>
            <text x="160" y="28" fontSize="11">z</text>
          </g>
          </g>
        </g>
      </svg>
    </div>
  )
})
