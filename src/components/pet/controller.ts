import { SHEET, STATES, lookCell, type PetState } from './sprite'

/** What the pet does when nothing else is going on: rest, wait for input, or look busy. */
export type Mode = 'idle' | 'waiting' | 'working'

const BASE: Record<Mode, PetState> = { idle: 'idle', waiting: 'waiting', working: 'running' }
const WALK_SPEED = 62 // px per second: an unhurried stroll
const STRIDE = 0.05 // share of the pet's width covered per walk frame, so the feet keep pace with the ground
const GAZE_HOLD = 4500 // ms the pet keeps looking after the cursor stops
const GAZE_STEP = 260 // ms between gaze changes, so the head turns calmly
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

  private el: HTMLElement
  private home = { x: 0, y: 0 }
  private range = 0
  private offset = 0
  private mode: Mode = 'idle'
  private reduced = false
  private hidden = false
  private wanders = false
  private busy: 'none' | 'oneshot' | 'walk' | 'drag' = 'none'
  private current: { state: PetState; frame: number; loops: number; then?: () => void } | null = null
  private frameTimer = 0
  private lookTimer = 0
  private wanderTimer = 0
  private walkRaf = 0
  private gaze: { step: number; at: number } | null = null
  private drag: { id: number; sx: number; sy: number; ox: number; oy: number; lx: number; ly: number; moved: boolean; dir: number; run: number; still: number } | null = null

  constructor(el: HTMLElement) {
    this.el = el
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

  setWander(on: boolean) {
    this.wanders = on
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
    this.el.style.backgroundPosition = `${(col / (SHEET.columns - 1)) * 100}% ${(row / (SHEET.rows - 1)) * 100}%`
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
      if (current.state === 'idle' || current.state === 'waiting') {
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
    this.play(BASE[this.mode])
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
    const stride = Math.max(6, this.w * STRIDE)
    const start = performance.now()
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const e = 0.5 - Math.cos(Math.PI * t) / 2
      this.place(from.x + (x - from.x) * e, from.y + (y - from.y) * e)
      // Legs advance with distance travelled, so steps slow down and speed up with the body.
      this.show(gait.row, Math.floor((total * e) / stride) % gait.frames)
      if (t >= 1) {
        this.walkRaf = 0
        return done()
      }
      this.walkRaf = requestAnimationFrame(step)
    }
    this.walkRaf = requestAnimationFrame(step)
  }

  goHome() {
    this.atHome = true
    this.onDrop?.(true)
    const x = this.home.x + this.offset
    // Long trips home take about a second and a half; short ones keep the stroll pace.
    this.walkTo(x, this.home.y, undefined, clamp(Math.hypot(x - this.pos.x, this.home.y - this.pos.y) / 2.2, WALK_SPEED * 2, 420))
  }

  private scheduleWander() {
    window.clearTimeout(this.wanderTimer)
    this.wanderTimer = window.setTimeout(() => {
      if (this.wanders && !this.hidden && !this.reduced && this.atHome && this.busy === 'none' && this.mode === 'idle' && this.range > 6) {
        // Always a proper stroll to the other side, never a shuffle of a few pixels.
        const next = (this.offset > 0 ? -1 : 1) * this.range * (0.6 + Math.random() * 0.4)
        this.walkTo(this.home.x + next, this.home.y, () => {
          this.offset = next
          this.rest()
        })
      }
      this.scheduleWander()
    }, 28000 + Math.random() * 22000)
  }

  /* ------------------------------------------------------------ dragging */

  pointerDown(e: PointerEvent) {
    if (e.button !== 0) return
    this.drag = { id: e.pointerId, sx: e.clientX, sy: e.clientY, ox: e.clientX - this.pos.x, oy: e.clientY - this.pos.y, lx: e.clientX, ly: e.clientY, moved: false, dir: 1, run: 0, still: 0 }
    this.el.setPointerCapture?.(e.pointerId)
  }

  pointerMove(e: PointerEvent) {
    const d = this.drag
    if (!d || e.pointerId !== d.id) return
    if (!d.moved) {
      if (Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < 6) return
      d.moved = true
      this.cancelWalk()
      window.clearTimeout(this.lookTimer)
      this.busy = 'drag'
      this.atHome = false
      this.el.dataset.dragging = 'true'
      this.onDragStart?.()
    }
    this.place(e.clientX - d.ox, e.clientY - d.oy)
    const vx = e.clientX - d.lx
    const moved = Math.hypot(vx, e.clientY - d.ly)
    d.lx = e.clientX
    d.ly = e.clientY
    if (Math.abs(vx) > 1) d.dir = vx > 0 ? 1 : -1
    // Running: the legs cycle with how far the pointer travels, so a quick drag is a sprint and
    // a slow one a jog. When the pointer pauses, the pet stops mid-air on its feet.
    d.run += moved
    const gait = STATES[d.dir > 0 ? 'running-right' : 'running-left']
    window.clearTimeout(this.frameTimer)
    this.current = null
    this.show(gait.row, Math.floor(d.run / Math.max(4, this.w * 0.028)) % gait.frames)
    window.clearTimeout(d.still)
    d.still = window.setTimeout(() => this.drag?.moved && this.show(STATES.idle.row, 0), 180)
  }

  /** Returns true when the gesture was a drag, so the caller can ignore the click that follows. */
  pointerUp(e: PointerEvent): boolean {
    const d = this.drag
    if (!d || e.pointerId !== d.id) return false
    this.drag = null
    window.clearTimeout(d.still)
    this.el.releasePointerCapture?.(e.pointerId)
    if (!d.moved) return false
    this.el.dataset.dragging = 'false'
    this.busy = 'none'
    const nearHome = Math.hypot(this.pos.x - this.home.x, this.pos.y - this.home.y) < Math.max(70, this.w * 0.6)
    if (nearHome) {
      this.offset = clamp(this.pos.x - this.home.x, -this.range, this.range)
      this.goHome()
    } else {
      this.atHome = false
      this.onDrop?.(false)
      this.rest()
    }
    return true
  }

  destroy() {
    window.clearTimeout(this.frameTimer)
    window.clearTimeout(this.lookTimer)
    window.clearTimeout(this.wanderTimer)
    cancelAnimationFrame(this.walkRaf)
  }
}
