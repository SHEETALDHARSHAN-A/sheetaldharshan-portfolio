'use client'

import { usePathname } from 'next/navigation'
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import styles from './InteractiveAvatar.module.css'
import { AVATAR_EVENT, type Expression } from './expressions'

export type { Expression }
export { setExpression } from './expressions'

export type AvatarHandle = { setExpression: (expression: Expression, options?: { hold?: boolean; duration?: number }) => void }

const TRANSIENT: Partial<Record<Expression, number>> = { happy: 1400, excited: 1600, wave: 1900, curious: 1800 }
const MAX_EYE = 4.2 // px the pupils may travel
const MAX_TILT = 6 // degrees of head tilt
const MAX_SHIFT = 3 // px of head drift

/**
 * An original Memoji-style 2.5D avatar drawn in inline SVG (~6 KB, no images, no WebGL).
 * Idle: random blinks, breathing, occasional smile. Eyes and head follow the pointer with
 * eased interpolation in a requestAnimationFrame loop that only runs while something moves.
 * Hover: curious. Click: happy bounce. Reacts to route changes and typing. Pauses offscreen,
 * when the tab is hidden, and under prefers-reduced-motion.
 */
export const InteractiveAvatar = forwardRef<AvatarHandle, { size?: number; className?: string; label?: string }>(function InteractiveAvatar(
  { size = 160, className, label = 'Animated avatar of Sheetaldharshan' },
  ref,
) {
  const rootRef = useRef<HTMLDivElement>(null)
  const headRef = useRef<SVGGElement>(null)
  const pupilsRef = useRef<SVGGElement>(null)
  const [expression, setExpr] = useState<Expression>('idle')
  const [blink, setBlink] = useState(false)
  const [bounce, setBounce] = useState(0)
  const resetTimer = useRef<number | undefined>(undefined)
  const state = useRef({ tx: 0, ty: 0, x: 0, y: 0, raf: 0, visible: true, reduced: false, held: false })
  const pathname = usePathname()

  const apply = useCallback((next: Expression, options: { hold?: boolean; duration?: number } = {}) => {
    window.clearTimeout(resetTimer.current)
    state.current.held = !!options.hold
    setExpr(next)
    if (next === 'happy' || next === 'excited') setBounce((n) => n + 1)
    const ms = options.duration ?? TRANSIENT[next]
    if (!options.hold && ms) resetTimer.current = window.setTimeout(() => setExpr('idle'), ms)
  }, [])

  useImperativeHandle(ref, () => ({ setExpression: apply }), [apply])

  // Programmatic API: window event from setExpression()
  useEffect(() => {
    const onEvent = (e: Event) => {
      const d = (e as CustomEvent<{ expression: Expression; hold?: boolean; duration?: number }>).detail
      if (d?.expression) apply(d.expression, d)
    }
    window.addEventListener(AVATAR_EVENT, onEvent)
    return () => window.removeEventListener(AVATAR_EVENT, onEvent)
  }, [apply])

  // Site reactions: projects → excited, contact → wave, a project page → curious
  useEffect(() => {
    if (!pathname) return
    if (pathname === '/projects') apply('excited')
    else if (pathname.startsWith('/projects/')) apply('curious')
    else if (pathname === '/contact') apply('wave')
  }, [pathname, apply])

  // Typing anywhere on the page → thinking; leaving the field → idle
  useEffect(() => {
    const isField = (t: EventTarget | null) => t instanceof HTMLElement && (t.matches('input, textarea, [contenteditable="true"]'))
    const onIn = (e: FocusEvent) => isField(e.target) && apply('thinking', { hold: true })
    const onOut = (e: FocusEvent) => isField(e.target) && apply('idle')
    document.addEventListener('focusin', onIn)
    document.addEventListener('focusout', onOut)
    return () => {
      document.removeEventListener('focusin', onIn)
      document.removeEventListener('focusout', onOut)
    }
  }, [apply])

  // Random blinks (sometimes double) and the occasional idle smile
  useEffect(() => {
    let blinkTimer: number
    let smileTimer: number
    const scheduleBlink = () => {
      blinkTimer = window.setTimeout(() => {
        if (state.current.visible) {
          setBlink(true)
          window.setTimeout(() => setBlink(false), 130)
          if (Math.random() < 0.2) window.setTimeout(() => { setBlink(true); window.setTimeout(() => setBlink(false), 120) }, 260)
        }
        scheduleBlink()
      }, 2400 + Math.random() * 3800)
    }
    const scheduleSmile = () => {
      smileTimer = window.setTimeout(() => {
        if (state.current.visible && !state.current.held) setExpr((e) => (e === 'idle' ? 'happy' : e))
        window.setTimeout(() => setExpr((e) => (e === 'happy' && !state.current.held ? 'idle' : e)), 1500)
        scheduleSmile()
      }, 9000 + Math.random() * 7000)
    }
    scheduleBlink()
    scheduleSmile()
    return () => {
      window.clearTimeout(blinkTimer)
      window.clearTimeout(smileTimer)
    }
  }, [])

  // Pointer tracking: eased, rAF only while moving, paused offscreen / hidden / reduced motion
  useEffect(() => {
    const s = state.current
    const root = rootRef.current
    if (!root) return
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    s.reduced = media.matches || document.documentElement.dataset.motion === 'reduced'
    const onMedia = () => (s.reduced = media.matches)
    media.addEventListener('change', onMedia)

    const render = () => {
      s.x += (s.tx - s.x) * 0.14
      s.y += (s.ty - s.y) * 0.14
      if (pupilsRef.current) pupilsRef.current.style.transform = `translate(${(s.x * MAX_EYE).toFixed(2)}px, ${(s.y * MAX_EYE).toFixed(2)}px)`
      if (headRef.current) headRef.current.style.transform = `translate(${(s.x * MAX_SHIFT).toFixed(2)}px, ${(s.y * MAX_SHIFT * 0.6).toFixed(2)}px) rotate(${(s.x * MAX_TILT).toFixed(2)}deg)`
      if (Math.abs(s.tx - s.x) > 0.002 || Math.abs(s.ty - s.y) > 0.002) s.raf = requestAnimationFrame(render)
      else s.raf = 0
    }
    const kick = () => {
      if (!s.raf && s.visible && !s.reduced) s.raf = requestAnimationFrame(render)
    }
    let last = 0
    const onMove = (e: PointerEvent) => {
      const now = performance.now()
      if (now - last < 16) return // ~60 Hz throttle
      last = now
      const r = root.getBoundingClientRect()
      const cx = r.left + r.width / 2
      const cy = r.top + r.height * 0.45
      const dx = (e.clientX - cx) / Math.max(240, window.innerWidth * 0.5)
      const dy = (e.clientY - cy) / Math.max(240, window.innerHeight * 0.5)
      s.tx = Math.max(-1, Math.min(1, dx))
      s.ty = Math.max(-1, Math.min(1, dy))
      kick()
    }
    const onLeave = () => {
      s.tx = 0
      s.ty = 0
      kick()
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)

    const io = new IntersectionObserver(([entry]) => {
      s.visible = entry.isIntersecting && document.visibilityState === 'visible'
      root.dataset.paused = s.visible ? 'false' : 'true'
    })
    io.observe(root)
    const onVis = () => {
      s.visible = document.visibilityState === 'visible'
      root.dataset.paused = s.visible ? 'false' : 'true'
    }
    document.addEventListener('visibilitychange', onVis)

    return () => {
      cancelAnimationFrame(s.raf)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
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
      style={{ width: size, height: size * 1.1 }}
      onPointerEnter={() => !state.current.held && expression === 'idle' && apply('curious', { duration: 99999 })}
      onPointerLeave={() => !state.current.held && expression === 'curious' && apply('idle')}
      onClick={() => apply('happy')}
      role="img"
      aria-label={label}
    >
      <svg viewBox="0 0 200 220" className={styles.svg} key={bounce} data-bounce={bounce > 0 ? 'true' : 'false'} aria-hidden="true">
        <defs>
          <radialGradient id="av-skin" cx="42%" cy="34%" r="72%">
            <stop offset="0" stopColor="#b98262" />
            <stop offset=".55" stopColor="#97654a" />
            <stop offset="1" stopColor="#6e4733" />
          </radialGradient>
          <radialGradient id="av-hair" cx="40%" cy="30%" r="75%">
            <stop offset="0" stopColor="#3a2a22" />
            <stop offset=".6" stopColor="#1c1411" />
            <stop offset="1" stopColor="#0f0b09" />
          </radialGradient>
          <linearGradient id="av-hood" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2b2d33" />
            <stop offset="1" stopColor="#111216" />
          </linearGradient>
          <radialGradient id="av-iris" cx="40%" cy="35%" r="70%">
            <stop offset="0" stopColor="#6b4428" />
            <stop offset="1" stopColor="#2a170c" />
          </radialGradient>
          <radialGradient id="av-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#000" stopOpacity=".35" />
            <stop offset="1" stopColor="#000" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g className={styles.breathe}>
          {/* hoodie and shoulders */}
          <path d="M28 220c0-34 26-58 72-58s72 24 72 58z" fill="url(#av-hood)" />
          <path d="M76 168c6 12 15 18 24 18s18-6 24-18" fill="none" stroke="#3a3d45" strokeWidth="5" strokeLinecap="round" />
          <path d="M88 182v22M112 182v22" stroke="#d9d9d4" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="88" cy="205" r="2.4" fill="#d9d9d4" />
          <circle cx="112" cy="205" r="2.4" fill="#d9d9d4" />
          {/* neck */}
          <path d="M84 150h32v20c0 6-7 10-16 10s-16-4-16-10z" fill="#7d523b" />
          <ellipse cx="100" cy="152" rx="20" ry="5" fill="url(#av-shadow)" />

          {/* head (follows the pointer) */}
          <g ref={headRef} className={styles.head}>
            {/* ears */}
            <ellipse cx="44" cy="102" rx="9" ry="13" fill="#8a5a41" />
            <ellipse cx="156" cy="102" rx="9" ry="13" fill="#8a5a41" />
            <ellipse cx="45" cy="103" rx="4.5" ry="7" fill="#6e4733" />
            <ellipse cx="155" cy="103" rx="4.5" ry="7" fill="#6e4733" />
            {/* face */}
            <path d="M46 92c0-32 24-52 54-52s54 20 54 52c0 34-20 62-54 62S46 126 46 92z" fill="url(#av-skin)" />
            {/* short beard and moustache */}
            <path d="M52 108c4 28 22 46 48 46s44-18 48-46c-6 12-14 20-22 22-8 2-14-4-26-4s-18 6-26 4c-8-2-16-10-22-22z" fill="#1d1410" opacity=".88" />
            <path d="M82 124c6-5 12-6 18-3 6-3 12-2 18 3-6 1-12 2-18 0-6 2-12 1-18 0z" fill="#1d1410" />
            {/* cheeks */}
            <ellipse className={styles.cheek} cx="68" cy="116" rx="9" ry="5" fill="#c86b5a" />
            <ellipse className={styles.cheek} cx="132" cy="116" rx="9" ry="5" fill="#c86b5a" />

            {/* eyes */}
            <g className={styles.eyes}>
              <g className={styles.eye}>
                <ellipse cx="78" cy="100" rx="11" ry="10" fill="#f6f2ec" />
              </g>
              <g className={styles.eye}>
                <ellipse cx="122" cy="100" rx="11" ry="10" fill="#f6f2ec" />
              </g>
              <g ref={pupilsRef} className={styles.pupils}>
                <circle cx="78" cy="101" r="6.2" fill="url(#av-iris)" />
                <circle cx="122" cy="101" r="6.2" fill="url(#av-iris)" />
                <circle cx="78" cy="101" r="3" fill="#0d0705" />
                <circle cx="122" cy="101" r="3" fill="#0d0705" />
                <circle cx="80" cy="98.6" r="1.7" fill="#fff" />
                <circle cx="124" cy="98.6" r="1.7" fill="#fff" />
              </g>
              {/* eyelids for blinking (cover the eye from the top) */}
              <rect className={styles.lid} x="65" y="88" width="26" height="24" rx="11" fill="#8f5f45" />
              <rect className={styles.lid} x="109" y="88" width="26" height="24" rx="11" fill="#8f5f45" />
            </g>

            {/* eyebrows */}
            <path className={`${styles.brow} ${styles.browL}`} d="M65 86c5-5 13-6 22-3" fill="none" stroke="#1a110d" strokeWidth="5" strokeLinecap="round" />
            <path className={`${styles.brow} ${styles.browR}`} d="M113 83c9-3 17-2 22 3" fill="none" stroke="#1a110d" strokeWidth="5" strokeLinecap="round" />

            {/* nose */}
            <path d="M97 104c-2 7-4 11-1 13 2 1 6 1 8 0" fill="none" stroke="#6a432f" strokeWidth="2.4" strokeLinecap="round" />

            {/* mouths: one per expression, cross-faded */}
            <path className={`${styles.mouth} ${styles.mIdle}`} d="M88 131c7 4 17 4 24 0" fill="none" stroke="#c98a7a" strokeWidth="3" strokeLinecap="round" />
            <g className={`${styles.mouth} ${styles.mHappy}`}>
              <path d="M84 129c4 11 28 11 32 0z" fill="#3b1612" />
              <path d="M87 129.5h26c-1 3-4 4-13 4s-12-1-13-4z" fill="#fbf7f2" />
            </g>
            <g className={`${styles.mouth} ${styles.mExcited}`}>
              <ellipse cx="100" cy="133" rx="9" ry="8" fill="#3b1612" />
              <path d="M93 136c4-3 10-3 14 0-2 3-12 3-14 0z" fill="#c45a4f" />
            </g>
            <path className={`${styles.mouth} ${styles.mThinking}`} d="M92 133c5-2 12-3 18 1" fill="none" stroke="#c98a7a" strokeWidth="3" strokeLinecap="round" />
            <path className={`${styles.mouth} ${styles.mCurious}`} d="M90 131c6 3 14 3 21-1" fill="none" stroke="#c98a7a" strokeWidth="3" strokeLinecap="round" />

            {/* curly hair: a cloud of curls over the crown */}
            <g fill="url(#av-hair)">
              <path d="M44 88c-6-30 16-58 56-60 40 2 62 30 56 60-6-12-14-20-24-24-10 6-22 8-32 6-10 2-22 0-32-6-10 4-18 12-24 24z" />
              <circle cx="58" cy="54" r="15" /><circle cx="76" cy="40" r="16" /><circle cx="98" cy="34" r="17" />
              <circle cx="121" cy="38" r="16" /><circle cx="140" cy="52" r="15" /><circle cx="150" cy="70" r="12" />
              <circle cx="50" cy="72" r="12" /><circle cx="66" cy="30" r="10" /><circle cx="88" cy="22" r="11" />
              <circle cx="112" cy="22" r="11" /><circle cx="133" cy="30" r="10" /><circle cx="84" cy="58" r="10" />
              <circle cx="104" cy="54" r="11" /><circle cx="122" cy="58" r="10" />
            </g>
            <g fill="none" stroke="#4a372d" strokeWidth="2" strokeLinecap="round" opacity=".55">
              <path d="M70 34c4-4 9-4 12 0" /><path d="M93 26c4-4 9-4 12 0" /><path d="M116 30c4-4 9-4 12 0" />
              <path d="M54 50c3-4 8-5 11-2" /><path d="M136 46c3-3 8-2 10 2" /><path d="M98 48c4-3 8-3 11 1" />
            </g>
          </g>

          {/* waving hand */}
          <g className={styles.hand}>
            <path d="M158 220c2-22 6-38 14-50" stroke="#1a1b20" strokeWidth="16" strokeLinecap="round" fill="none" />
            <g className={styles.palm}>
              <ellipse cx="174" cy="160" rx="13" ry="15" fill="#97654a" />
              <path d="M164 150c-1-10 2-16 5-16s4 5 4 14M171 147c0-11 2-17 5-17s4 6 3 16M178 149c1-10 4-15 7-14s3 6 1 15M184 154c3-7 6-9 8-8s2 5-1 11" stroke="#97654a" strokeWidth="6.5" strokeLinecap="round" fill="none" />
            </g>
          </g>
        </g>
      </svg>
    </div>
  )
})
