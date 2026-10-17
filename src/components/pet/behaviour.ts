/** Emotions the admin can pick (Sidebar → Pet → Behaviour); each maps to an animation in the sprite sheet. */
export type PetEmotion = 'none' | 'wave' | 'jump' | 'think' | 'work' | 'wait' | 'sad' | 'look'
export type PetIdleAction = PetEmotion | 'stroll'

export type PetBehaviour = {
  idleAfter: number
  idleAction: PetIdleAction
  idleRepeat: boolean
  returnAction: PetEmotion
  clickAction: PetEmotion
  dropAction: PetEmotion
  foundAction: PetEmotion
  emptyAction: PetEmotion
  followCursor: boolean
  stroll: boolean
  strollEvery: number
}

export const DEFAULT_BEHAVIOUR: PetBehaviour = {
  idleAfter: 30,
  idleAction: 'wait',
  idleRepeat: true,
  returnAction: 'wave',
  clickAction: 'wave',
  dropAction: 'none',
  foundAction: 'none',
  emptyAction: 'none',
  followCursor: true,
  stroll: true,
  strollEvery: 40,
}

const EMOTIONS: PetEmotion[] = ['none', 'wave', 'jump', 'think', 'work', 'wait', 'sad', 'look']

/** Admin values, checked: unknown emotions fall back to the defaults and numbers stay in range. */
export function toBehaviour(doc: Record<string, unknown> | null | undefined): PetBehaviour {
  const d = DEFAULT_BEHAVIOUR
  const emotion = (v: unknown, fallback: PetEmotion) => (EMOTIONS.includes(v as PetEmotion) ? (v as PetEmotion) : fallback)
  const num = (v: unknown, fallback: number, lo: number, hi: number) => (typeof v === 'number' && Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : fallback)
  const bool = (v: unknown, fallback: boolean) => (typeof v === 'boolean' ? v : fallback)
  return {
    idleAfter: num(doc?.idleAfter, d.idleAfter, 5, 600),
    idleAction: doc?.idleAction === 'stroll' ? 'stroll' : emotion(doc?.idleAction, d.idleAction as PetEmotion),
    idleRepeat: bool(doc?.idleRepeat, d.idleRepeat),
    returnAction: emotion(doc?.returnAction, d.returnAction),
    clickAction: emotion(doc?.clickAction, d.clickAction),
    dropAction: emotion(doc?.dropAction, d.dropAction),
    foundAction: emotion(doc?.foundAction, d.foundAction),
    emptyAction: emotion(doc?.emptyAction, d.emptyAction),
    followCursor: bool(doc?.followCursor, d.followCursor),
    stroll: bool(doc?.stroll, d.stroll),
    strollEvery: num(doc?.strollEvery, d.strollEvery, 10, 600),
  }
}

/** Idle actions that can be held as a loop; the others repeat now and then instead. */
export const HOLDABLE: ReadonlySet<PetIdleAction> = new Set(['wait', 'think', 'work'])
