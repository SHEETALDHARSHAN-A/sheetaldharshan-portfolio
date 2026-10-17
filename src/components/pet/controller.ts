import type { PetIdleAction } from './behaviour'
import { SHEET, STATES, lookCell, type PetState } from './sprite'

/** What the pet does when nothing else is going on: rest, wait for input, or look busy. */
export type Mode = 'idle' | 'waiting' | 'working'

const BASE: Record<Mode, PetState> = { idle: 'idle', waiting: 'waiting', working: 'running' }
const WALK_SPEED = 55 // px per second: an unhurried stroll
const STEP_FPS = 6 // walk-cycle frames per second: a calm, natural step
const GAZE_HOLD = 4500 // ms the pet keeps looking after the cursor stops
const GAZE_STEP = 260 // ms between gaze changes, so the head turns calmly
// Emotions that can be held as a loop while the visitor is away; the rest play once.
const LOOPS: Partial<Record<PetIdleAction, PetState>> = { wait: 'waiting', think: 'review', work: 'running' }
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

/**
 * Drives the sprite outside React: frame timing, gaze, one-shot reactions, walking, wandering and
 * dragging. Every frame is a background-position change and every move a transform, so nothing
 * here causes a React render or a layout.
 */
export class PetController {
  w = 150
  h = 162
  pos = { x: -1000, y: -1000 }
  atHome = true
  onMove?: () => void
  onDragStart?: () => void
  onDrop?: (atHome: boolean) => void
  /** After being dragged somewhere and set down (once it has walked home, if dropped near it). */
  onLand?: () => void

  private el: HTMLElement
  private sprite: HTMLElement
  private home = { x: 0, y: 0 }
  private range = 0
  private offset = 0
  private mode: Mode = 'idle'
  private reduced = false
  private hidden = false
  private wanders = false
  private wanderEvery = 40000
  private hold: PetState | null = null
  private busy: 'none' | 'oneshot' | 'walk' | 'drag' = 'none'
  private current: { state: PetState; frame: number; loops: number; then?: () => void } | null = null
  private frameTimer = 0
  private lookTimer = 0
  private wanderTimer = 0
  private walkRaf = 0
  private gaze: { step: number; at: number } | null = null
  private drag: { id: number; sx: number; sy: number; ox: number; oy: number; tx: number; ty: number; moved: boolean; dir: number; phase: number; tilt: number } | null = null
  private dragRaf = 0

  /** `el` is positioned on screen; `sprite` (inside it) shows the frame and leans, bobs and squashes. */
  constructor(el: HTMLElement, sprite: HTMLElement) {
    this.el = el
    this.sprite = sprite
  }

  /* ------------------------------------------------------------ layout */

  setSize(width: number) {
    this.w = width
    this.h = Math.round((width * SHEET.cellHeight) / SHEET.cellWidth)
    this.el.style.width = `${this.w}px`
    this.el.style.height = `${this.h}px`
  }

  /** Where the pet lives, and how far it may stroll either side of that spot. */
  setHome(x: number, y: number, range: number) {
    this.home = { x, y }
    this.range = range
    this.offset = clamp(this.offset, -range, range)
    if (this.atHome && this.busy !== 'drag' && this.busy !== 'walk') this.place(x + this.offset, y)
    else if (!this.atHome) this.place(this.pos.x, this.pos.y)
  }

  place(x: number, y: number) {
    const maxX = window.innerWidth - this.w * 0.75
    const maxY = window.innerHeight - this.h * 0.9
    this.pos = { x: clamp(x, -this.w * 0.25, maxX), y: clamp(y, -this.h * 0.1, maxY) }
    this.el.style.transform = `translate3d(${Math.round(this.pos.x)}px, ${Math.round(this.pos.y)}px, 0)`
    this.onMove?.()
  }

  restore(x: number, y: number) {
    this.atHome = false
    this.place(x, y)
  }

  setReduced(reduced: boolean) {
    this.reduced = reduced
    if (reduced) this.cancelWalk()
    this.rest()
  }

  setWander(on: boolean, everyMs = this.wanderEvery) {
    this.wanders = on
    this.wanderEvery = everyMs
    window.clearTimeout(this.wanderTimer)
    if (on) this.scheduleWander()
  }

  setHidden(hidden: boolean) {
    this.hidden = hidden
    if (hidden) {
      window.clearTimeout(this.frameTimer)
    } else if (this.current) {
      this.schedule()
    }
  }

  /* ------------------------------------------------------------ animation */

  private show(row: number, col: number) {
    this.sprite.style.backgroundPosition = `${(col / (SHEET.columns - 1)) * 100}% ${(row / (SHEET.rows - 1)) * 100}%`
  }

  private play(state: PetState, options: { loops?: number; then?: () => void } = {}) {
    window.clearTimeout(this.frameTimer)
    window.clearTimeout(this.lookTimer)
    this.current = { state, frame: 0, loops: options.loops ?? Infinity, then: options.then }
    this.show(STATES[state].row, 0)
    if (this.reduced) {
      // One still frame per state; one-shots still finish so the sequence moves on.
      if (Number.isFinite(this.current.loops)) this.frameTimer = window.setTimeout(() => this.finish(), 700)
      return
    }
    this.schedule()
  }

  private schedule(pause = 0) {
    const current = this.current
    if (!current || this.hidden || this.reduced) return
    window.clearTimeout(this.frameTimer)
    this.frameTimer = window.setTimeout(() => this.tick(), 1000 / STATES[current.state].fps + pause)
  }

  private tick() {
    const current = this.current
    if (!current) return
    const def = STATES[current.state]
    current.frame += 1
    if (current.frame >= def.frames) {
      current.loops -= 1
      if (current.loops <= 0) return this.finish()
      current.frame = 0
      // Resting loops hold still for a beat between cycles, like a breath.
      if (current.state === 'idle' || current.state === 'waiting' || current.state === this.hold) {
        this.show(def.row, 0)
        return this.schedule(1600 + Math.random() * 2400)
      }
    }
    this.show(def.row, current.frame)
    this.schedule()
  }

  private finish() {
    const then = this.current?.then
    this.current = null
    if (this.busy === 'oneshot') this.busy = 'none'
    if (then) then()
    else this.rest()
  }

  /** Back to the resting loop for the current mode. */
  rest() {
    if (this.busy !== 'none') return
    this.play(this.mode === 'idle' && this.hold ? this.hold : BASE[this.mode])
  }

  /**
   * Acts out an emotion picked in the admin. With `hold`, a loopable one (wait, think, work) becomes
   * the resting loop until `release()`; others play once.
   */
  perform(action: PetIdleAction, hold = false) {
    if (action === 'none' || this.busy === 'drag') return
    const loop = LOOPS[action]
    if (hold && loop) {
      this.hold = loop
      if (this.busy === 'none') this.play(loop)
      return
    }
    switch (action) {
      case 'wave':
        return this.sayHi()
      case 'jump':
        return this.react('jumping', 1)
      case 'sad':
        return this.react('failed', 1)
      case 'look':
        return this.lookAround()
      case 'stroll':
        return void this.stroll()
      default:
        return this.react(loop!, action === 'wait' ? 1 : 2)
    }
  }

  /** Ends a held loop from `perform(…, true)`. */
  release() {
    if (!this.hold) return
    this.hold = null
    if (this.busy === 'none') this.rest()
  }

  /** Glances left, then right, then back at you. */
  lookAround() {
    if (this.busy !== 'none' || this.hidden) return
    window.clearTimeout(this.frameTimer)
    window.clearTimeout(this.lookTimer)
    this.current = null
    this.gaze = null
    this.busy = 'oneshot'
    const steps = [lookCell(270), lookCell(247.5), lookCell(90), lookCell(112.5), { row: 0, col: 0 }]
    const next = (i: number) => {
      if (i >= steps.length) {
        this.busy = 'none'
        return this.rest()
      }
      this.show(steps[i].row, steps[i].col)
      this.frameTimer = window.setTimeout(() => next(i + 1), i % 2 ? 900 : 260)
    }
    next(0)
  }

  setMode(mode: Mode) {
    if (mode === this.mode) return
    this.mode = mode
    this.rest()
  }

  /** A one-off reaction (wave, jump, review…) that returns to the resting loop when done. */
  react(state: PetState, loops = 1) {
    if (this.busy === 'drag') return
    if (this.busy === 'walk') {
      // Stop where it is; a stroll interrupted at home keeps that spot.
      this.cancelWalk()
      if (this.atHome) this.offset = clamp(this.pos.x - this.home.x, -this.range, this.range)
    }
    this.busy = 'oneshot'
    this.play(state, { loops })
  }

  /**
   * Says hi: raises the hand (frame 1 of the waving row), waves it gently by rocking from the
   * feet, then lowers it. The row's third frame is an open-palm "what?" gesture, so it is skipped.
   */
  sayHi() {
    if (this.busy === 'drag') return
    if (this.busy === 'walk') {
      this.cancelWalk()
      if (this.atHome) this.offset = clamp(this.pos.x - this.home.x, -this.range, this.range)
    }
    window.clearTimeout(this.frameTimer)
    window.clearTimeout(this.lookTimer)
    this.current = null
    this.gaze = null
    this.busy = 'oneshot'
    const row = STATES.waving.row
    this.show(row, 1)
    if (!this.reduced && typeof this.sprite.animate === 'function') {
      this.sprite.animate(
        [{ transform: 'rotate(0deg)' }, { transform: 'rotate(-1.6deg)' }, { transform: 'rotate(1.4deg)' }, { transform: 'rotate(-1.2deg)' }, { transform: 'rotate(0deg)' }],
        { duration: 1100, easing: 'ease-in-out' },
      )
    }
    this.frameTimer = window.setTimeout(() => {
      this.show(row, 0)
      this.frameTimer = window.setTimeout(() => {
        this.busy = 'none'
        this.rest()
      }, 180)
    }, 1250)
  }

  /** Turns to look at a point on screen; settles back after a short while without movement. */
  lookAt(x: number, y: number) {
    if (this.busy !== 'none' || this.mode !== 'idle' || this.hidden) return
    const cx = this.pos.x + this.w / 2
    const cy = this.pos.y + this.h * 0.32
    const dx = x - cx
    const dy = y - cy
    // -1 means "facing you": the cursor is over the pet itself.
    const degrees = (Math.atan2(dx, -dy) * 180) / Math.PI
    const step = Math.hypot(dx, dy) < this.w * 0.4 ? -1 : Math.round((((degrees % 360) + 360) % 360) / 22.5) % 16
    window.clearTimeout(this.lookTimer)
    this.lookTimer = window.setTimeout(() => {
      this.gaze = null
      this.rest()
    }, GAZE_HOLD)
    const now = performance.now()
    const g = this.gaze
    if (g) {
      if (now - g.at < GAZE_STEP) return
      // Hysteresis: ignore small wobbles around a direction boundary.
      if (step !== -1 && g.step !== -1) {
        const diff = Math.abs(((degrees - g.step * 22.5 + 540) % 360) - 180)
        if (diff < 18) return
      } else if (step === g.step) return
    }
    this.gaze = { step, at: now }
    const cell = step === -1 ? { row: 0, col: 0 } : lookCell(step * 22.5)
    window.clearTimeout(this.frameTimer)
    this.current = null
    this.show(cell.row, cell.col)
  }

  /* ------------------------------------------------------------ movement */

  private cancelWalk() {
    cancelAnimationFrame(this.walkRaf)
    this.walkRaf = 0
    if (this.busy === 'walk') this.busy = 'none'
  }

  walkTo(x: number, y: number, then?: () => void, speed = WALK_SPEED) {
    this.cancelWalk()
    const done = () => {
      this.busy = 'none'
      this.current = null
      if (then) then()
      else this.rest()
    }
    if (this.reduced || Math.hypot(x - this.pos.x, y - this.pos.y) < 2) {
      this.place(x, y)
      return done()
    }
    this.busy = 'walk'
    this.gaze = null
    window.clearTimeout(this.frameTimer)
    window.clearTimeout(this.lookTimer)
    this.current = null
    const gait = STATES[x >= this.pos.x ? 'running-right' : 'running-left']
    // Eased start and stop, so it sets off and arrives gently instead of sliding at a constant speed.
    const from = { ...this.pos }
    const total = Math.hypot(x - from.x, y - from.y)
    const duration = (total / speed) * 1000 * 1.25
    // Faster trips (walking home) step a little quicker, never frantically.
    const fps = STEP_FPS * Math.min(1.5, Math.max(1, speed / WALK_SPEED / 2))
    const start = performance.now()
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const e = 0.5 - Math.cos(Math.PI * t) / 2
      this.place(from.x + (x - from.x) * e, from.y + (y - from.y) * e)
      this.show(gait.row, Math.floor(((now - start) / 1000) * fps) % gait.frames)
      if (t >= 1) {
        this.walkRaf = 0
        return done()
      }
      this.walkRaf = requestAnimationFrame(step)
    }
    this.walkRaf = requestAnimationFrame(step)
  }

  goHome(then?: () => void) {
    this.atHome = true
    this.onDrop?.(true)
    const x = this.home.x + this.offset
    // Long trips home take about a second and a half; short ones keep the stroll pace.
    this.walkTo(x, this.home.y, then, clamp(Math.hypot(x - this.pos.x, this.home.y - this.pos.y) / 3, WALK_SPEED * 1.5, 180))
  }

  /** A stroll to the other side of its spot; false when it can't go (away, busy, or no room). */
  stroll(): boolean {
    if (this.hidden || this.reduced || !this.atHome || this.busy !== 'none' || this.mode !== 'idle' || this.range <= 6) return false
    // Always a proper stroll to the other side, never a shuffle of a few pixels.
    const next = (this.offset > 0 ? -1 : 1) * this.range * (0.6 + Math.random() * 0.4)
    this.walkTo(this.home.x + next, this.home.y, () => {
      this.offset = next
      this.rest()
    })
    return true
  }

  private scheduleWander() {
    window.clearTimeout(this.wanderTimer)
    this.wanderTimer = window.setTimeout(() => {
      if (this.wanders) this.stroll()
      this.scheduleWander()
    }, this.wanderEvery * (0.7 + Math.random() * 0.6))
  }

  /* ------------------------------------------------------------ dragging */

  pointerDown(e: PointerEvent) {
    if (e.button !== 0) return
    const ox = e.clientX - this.pos.x
    const oy = e.clientY - this.pos.y
    this.drag = { id: e.pointerId, sx: e.clientX, sy: e.clientY, ox, oy, tx: this.pos.x, ty: this.pos.y, moved: false, dir: 1, phase: 0, tilt: 0 }
    this.el.setPointerCapture?.(e.pointerId)
  }

  pointerMove(e: PointerEvent) {
    const d = this.drag
    if (!d || e.pointerId !== d.id) return
    d.tx = e.clientX - d.ox
    d.ty = e.clientY - d.oy
    if (d.moved || Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < 6) return
    d.moved = true
    this.cancelWalk()
    window.clearTimeout(this.frameTimer)
    window.clearTimeout(this.lookTimer)
    this.current = null
    this.gaze = null
    this.busy = 'drag'
    this.atHome = false
    this.el.dataset.dragging = 'true'
    this.onDragStart?.()
    let last = performance.now()
    const loop = (now: number) => {
      const dd = this.drag
      if (!dd) return
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000))
      last = now
      // Carried, not glued: the body trails the pointer a little and catches up.
      const k = this.reduced ? 1 : 1 - Math.pow(0.00002, dt)
      const nx = this.pos.x + (dd.tx - this.pos.x) * k
      const ny = this.pos.y + (dd.ty - this.pos.y) * k
      const vx = (nx - this.pos.x) / dt
      const speed = Math.hypot(vx, (ny - this.pos.y) / dt)
      this.place(nx, ny)
      if (Math.abs(vx) > 25) dd.dir = vx > 0 ? 1 : -1
      // Legs keep moving while held, at a steady pace that quickens a little with a fast drag.
      dd.phase += dt * (7 + Math.min(5, speed / 150))
      const gait = STATES[dd.dir > 0 ? 'running-right' : 'running-left']
      this.show(gait.row, Math.floor(dd.phase) % gait.frames)
      if (!this.reduced) {
        // A gentle lean into the direction of travel and a soft bounce on each step (four frames).
        const lean = dd.dir * (4 + Math.min(4, speed / 200))
        dd.tilt += (lean - dd.tilt) * Math.min(1, dt * 6)
        const bob = -Math.abs(Math.sin((dd.phase * Math.PI) / 4)) * 3
        this.sprite.style.transform = `translateY(${bob.toFixed(2)}px) rotate(${dd.tilt.toFixed(2)}deg) scale(1.06)`
      }
      this.dragRaf = requestAnimationFrame(loop)
    }
    this.dragRaf = requestAnimationFrame(loop)
  }

  /** Returns true when the gesture was a drag, so the caller can ignore the click that follows. */
  pointerUp(e: PointerEvent): boolean {
    const d = this.drag
    if (!d || e.pointerId !== d.id) return false
    this.drag = null
    cancelAnimationFrame(this.dragRaf)
    this.el.releasePointerCapture?.(e.pointerId)
    if (!d.moved) return false
    this.el.dataset.dragging = 'false'
    this.busy = 'none'
    this.land(d.tilt)
    const nearHome = Math.hypot(this.pos.x - this.home.x, this.pos.y - this.home.y) < Math.max(70, this.w * 0.6)
    if (nearHome) {
      this.offset = clamp(this.pos.x - this.home.x, -this.range, this.range)
      this.goHome(() => {
        this.rest()
        this.onLand?.()
      })
    } else {
      this.atHome = false
      this.onDrop?.(false)
      this.rest()
      // After the landing squash.
      window.setTimeout(() => this.onLand?.(), 450)
    }
    return true
  }

  /** A small squash and rebound when set down. */
  private land(tilt: number) {
    this.sprite.style.transform = ''
    if (this.reduced || typeof this.sprite.animate !== 'function') return
    this.sprite.animate(
      [
        { transform: `rotate(${tilt.toFixed(2)}deg) scale(1.06)` },
        { transform: 'scale(1.09, 0.9)', offset: 0.35 },
        { transform: 'scale(0.97, 1.04)', offset: 0.7 },
        { transform: 'none' },
      ],
      { duration: 420, easing: 'cubic-bezier(0.3, 0.7, 0.4, 1)' },
    )
  }

  destroy() {
    window.clearTimeout(this.frameTimer)
    window.clearTimeout(this.lookTimer)
    window.clearTimeout(this.wanderTimer)
    cancelAnimationFrame(this.walkRaf)
    cancelAnimationFrame(this.dragRaf)
  }
}
