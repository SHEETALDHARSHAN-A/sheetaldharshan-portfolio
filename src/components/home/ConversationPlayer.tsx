'use client'

import { useEffect } from 'react'
import { animate, utils, type JSAnimation } from 'animejs'

type Props = { preset: 'calm' | 'snappy' | 'instant'; typing: 'dots' | 'none'; startDelay: number }

/**
 * The reference site runs a 2016 anime.js build whose easeOutElastic takes an "elasticity"
 * setting (default 50). That makes the spring period 95 % of the animation duration, so the
 * pop-in is one slow overshoot that settles, not a quick wobble. This is that curve, normalised.
 */
const PERIOD = 1 - 50 / 1000
export const legacyOutElastic = (t: number): number => {
  if (t <= 0) return 0
  if (t >= 1) return 1
  return Math.pow(2, -10 * t) * Math.sin(((t - PERIOD / 4) * (2 * Math.PI)) / PERIOD) + 1
}

/** easeInOutQuad from the same build, used by the loading pulse. */
const legacyInOutQuad = (t: number): number => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t)

/**
 * Plays the server-rendered bubbles in sequence. The timing and motion follow the
 * reference site exactly: a loading pill pops in from the bottom-left with an elastic
 * ease, pulses while "typing" for (characters × 20 ms + 500 ms), then stretches to the
 * message size while the dots shrink away and the text fades in. The next bubble starts
 * after (characters × 20 ms + 900–1200 ms).
 */
export function ConversationPlayer({ preset, typing, startDelay }: Props) {
  useEffect(() => {
    const container = document.querySelector<HTMLElement>('.jg-messages')
    if (!container) return
    const bubbles = Array.from(container.querySelectorAll<HTMLElement>('.jg-bubble'))
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.motion === 'reduced'

    const showAll = () => {
      for (const bubble of bubbles) {
        bubble.classList.add('jg-shown')
        bubble.classList.remove('is-loading')
        const message = bubble.querySelector<HTMLElement>('.jg-message')
        if (message) message.style.opacity = '1'
        const loading = bubble.querySelector<HTMLElement>('.jg-loading')
        if (loading) loading.style.display = 'none'
      }
      const last = bubbles[bubbles.length - 1]
      bubbles.forEach((bubble) => bubble.classList.toggle('cornered', bubble === last))
    }

    if (reduced || preset === 'instant') {
      showAll()
      return
    }

    const typingSpeed = preset === 'snappy' ? 10 : 20
    const timers: number[] = []
    const running: JSAnimation[] = []
    let index = 0
    let cancelled = false

    const fontSize = () => parseFloat(getComputedStyle(container).fontSize) || 18
    const pxToEm = (px: number) => `${px / fontSize()}em`

    const sendMessage = (bubble: HTMLElement) => {
      const message = bubble.querySelector<HTMLElement>('.jg-message')!
      const loading = bubble.querySelector<HTMLElement>('.jg-loading')!
      const length = Number(bubble.dataset.length ?? message.textContent?.length ?? 0)
      const override = Number(bubble.dataset.typingMs)
      const loadingDuration = typing === 'none' ? 0 : override > 0 ? override : length * typingSpeed + 500

      bubble.classList.add('jg-shown', 'is-loading', 'cornered')
      bubble.style.opacity = '0'
      const style = getComputedStyle(bubble)
      const paddingTop = Math.ceil(parseFloat(style.paddingTop))
      const paddingLeft = Math.ceil(parseFloat(style.paddingLeft))
      // Measure the message at its natural size, capped so the bubble never leaves the viewport.
      const containerStyle = getComputedStyle(container)
      const available = container.clientWidth - parseFloat(containerStyle.paddingLeft) - parseFloat(containerStyle.paddingRight) - paddingLeft * 2 - 2
      message.style.display = 'inline-block'
      message.style.maxWidth = `${Math.max(40, available)}px`
      const messageW = Math.min(message.offsetWidth + 2, Math.max(40, available))
      const messageH = message.offsetHeight
      const dims = {
        loading: { w: '4em', h: '2.25em' },
        bubble: { w: pxToEm(messageW + paddingLeft * 2), h: pxToEm(messageH + paddingTop * 2) },
        message: { w: pxToEm(messageW), h: pxToEm(messageH) },
      }
      message.style.display = 'block'
      message.style.width = dims.message.w
      message.style.height = dims.message.h
      bubble.style.width = '0em'
      bubble.style.height = dims.loading.h
      bubble.style.opacity = '1'

      const bubbleOffset = bubble.offsetTop + bubble.offsetHeight
      if (bubbleOffset > container.offsetHeight) {
        running.push(animate(container, { scrollTop: bubbleOffset, duration: 750, ease: legacyInOutQuad }))
      }

      running.push(animate(bubble, { width: ['0ch', dims.loading.w], marginTop: ['2.5em', '0em'], marginLeft: ['-2.5em', '0em'], duration: 800, ease: legacyOutElastic }))
      const loadingLoop = animate(bubble, { scale: [1.05, 0.95], duration: 1100, loop: true, alternate: true, ease: legacyInOutQuad })
      running.push(loadingLoop)
      running.push(animate(loading, { translateX: ['-2em', '0em'], scale: [0.5, 1], duration: 400, delay: 25, ease: legacyOutElastic }))
      const dots = loading.querySelectorAll('b')
      const dotsPulse = animate(dots, { scale: [1, 1.25], opacity: [0.5, 1], duration: 300, loop: true, alternate: true, ease: legacyInOutQuad, delay: (_: unknown, i = 0) => i * 100 + 50 })
      running.push(dotsPulse)

      const reveal = () => {
        if (cancelled) return
        loadingLoop.pause()
        dotsPulse.pause()
        let revealed = false
        running.push(
          animate(dots, {
            opacity: 0,
            scale: 0,
            duration: 300,
            ease: legacyInOutQuad,
            onUpdate: (self) => {
              if (!revealed && self.progress >= 0.65) {
                revealed = true
                bubble.classList.remove('is-loading')
                running.push(animate(message, { opacity: [0, 1], duration: 300, ease: legacyInOutQuad }))
              }
            },
          }),
        )
        running.push(
          animate(bubble, {
            scale: 1,
            width: [dims.loading.w, dims.bubble.w],
            height: [dims.loading.h, dims.bubble.h],
            marginTop: '0em',
            marginLeft: '0em',
            duration: 800,
            ease: legacyOutElastic,
            onBegin: () => {
              if (index < bubbles.length) bubble.classList.remove('cornered')
            },
            onComplete: () => {
              // Let the bubble reflow naturally from here on (viewport resize, rotation).
              bubble.style.width = ''
              bubble.style.height = ''
              bubble.style.transform = ''
              message.style.width = ''
              message.style.height = ''
              message.style.maxWidth = ''
            },
          }),
        )
      }
      timers.push(window.setTimeout(reveal, Math.max(0, loadingDuration - 50)))
      return length
    }

    const sendMessages = () => {
      if (cancelled) return
      const bubble = bubbles[index]
      if (!bubble) return
      const length = sendMessage(bubble) ?? 0
      index += 1
      timers.push(window.setTimeout(sendMessages, length * typingSpeed + utils.random(900, 1200)))
    }

    timers.push(window.setTimeout(sendMessages, startDelay))

    return () => {
      cancelled = true
      timers.forEach((timer) => window.clearTimeout(timer))
      running.forEach((animation) => animation.pause())
    }
  }, [preset, typing, startDelay])

  return null
}
