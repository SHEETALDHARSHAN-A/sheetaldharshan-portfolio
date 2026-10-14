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
      style={{ width: size, height: variant === 'full' ? size * 1.9 : size }}
      onPointerEnter={() => !s.current.held && apply('curious', { duration: 99999 })}
      onPointerLeave={() => !s.current.held && s.current.expr === 'curious' && apply('idle')}
      onClick={() => apply('happy')}
      role="img"
      aria-label={label}
    >
      <svg viewBox={variant === 'full' ? '0 0 200 380' : '0 0 200 200'} className={styles.svg} key={bounce} data-bounce={bounce > 0 ? 'true' : 'false'} aria-hidden="true">
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
            <stop offset=".35" stopColor="#3b261b" stopOpacity=".38" />
            <stop offset="1" stopColor="#2a1a12" stopOpacity=".55" />
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
                <linearGradient id="mj-jeans" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#3b4d6e" />
                  <stop offset="1" stopColor="#24324a" />
                </linearGradient>
                <linearGradient id="mj-hoodie" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#3a3d46" />
                  <stop offset="1" stopColor="#15161b" />
                </linearGradient>
              </defs>
              {/* ground shadow */}
              <ellipse cx="100" cy="372" rx="58" ry="7" fill="#000" opacity=".35" />
              {/* legs */}
              <path d="M70 270h28l-2 84H74z" fill="url(#mj-jeans)" />
              <path d="M102 270h28l-4 84h-22z" fill="url(#mj-jeans)" />
              <path d="M98 272v60" stroke="#1b2538" strokeWidth="2" opacity=".6" />
              {/* sneakers */}
              <path d="M64 352c0-6 6-9 14-9h20c3 0 4 3 4 6v9c0 4-3 7-7 7H70c-4 0-6-3-6-6z" fill="#f2f2ee" />
              <path d="M102 352c0-3 1-6 4-6h20c8 0 14 3 14 9v4c0 3-2 6-6 6h-25c-4 0-7-3-7-7z" fill="#f2f2ee" />
              <path d="M64 360h38M102 360h38" stroke="#c9c9c2" strokeWidth="3" />
              {/* hoodie torso */}
              <path d="M52 200c0-26 20-40 48-40s48 14 48 40l4 72c0 6-4 10-10 10H58c-6 0-10-4-10-10z" fill="url(#mj-hoodie)" />
              <path d="M58 262h84v14c0 5-4 8-9 8H67c-5 0-9-3-9-8z" fill="#2a2c33" />
              <path d="M76 232h48v20c0 4-3 6-6 6H82c-3 0-6-2-6-6z" fill="#2c2f37" opacity=".85" />
              <path d="M78 164c6 10 13 14 22 14s16-4 22-14" fill="none" stroke="#4b4f5a" strokeWidth="5" strokeLinecap="round" />
              <path d="M90 176v26M110 176v26" stroke="#e8e6e0" strokeWidth="2.6" strokeLinecap="round" />
              <circle cx="90" cy="204" r="3" fill="#e8e6e0" /><circle cx="110" cy="204" r="3" fill="#e8e6e0" />
              {/* left arm resting */}
              <path d="M56 186c-14 10-18 40-14 74" stroke="url(#mj-hoodie)" strokeWidth="22" strokeLinecap="round" fill="none" />
              <circle cx="44" cy="266" r="11" fill="#c48a68" />
              {/* right arm resting (hidden while waving) */}
              <g className={styles.restArm}>
                <path d="M144 186c14 10 18 40 14 74" stroke="url(#mj-hoodie)" strokeWidth="22" strokeLinecap="round" fill="none" />
                <circle cx="156" cy="266" r="11" fill="#c48a68" />
              </g>
              {/* right arm raised from the shoulder (shown while waving) */}
              <path className={styles.waveArm} d="M146 194c14-2 22-14 23-34" stroke="url(#mj-hoodie)" strokeWidth="20" strokeLinecap="round" fill="none" />
              <path d="M88 150h24v14c0 5-6 8-12 8s-12-3-12-8z" fill="#9a6447" />
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

              <path className={`${styles.brow} ${styles.browL}`} d="M60 80c6-6 16-7 26-3" fill="none" stroke="#2a1b14" strokeWidth="6.5" strokeLinecap="round" />
              <path className={`${styles.brow} ${styles.browR}`} d="M114 77c10-4 20-3 26 3" fill="none" stroke="#2a1b14" strokeWidth="6.5" strokeLinecap="round" />

              <ellipse cx="100" cy="117" rx="6" ry="4" fill="#9a6447" opacity=".7" />
              <ellipse cx="98.5" cy="115.5" rx="2" ry="1.2" fill="#fff" opacity=".35" />

              {/* moustache, soft */}
              <path d="M86 127c5-3 10-3 14-1 4-2 9-2 14 1-5 2-10 2-14 1-4 1-9 1-14-1z" fill="#3b261b" opacity=".6" />

              <path className={`${styles.mouth} ${styles.mIdle}`} d="M89 134c6 4 16 4 22 0" fill="none" stroke="#6b2f26" strokeWidth="3.4" strokeLinecap="round" />
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

            {/* curly hair, soft and rounded */}
            <g className={styles.hair}>
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
      </svg>
    </div>
  )
})
