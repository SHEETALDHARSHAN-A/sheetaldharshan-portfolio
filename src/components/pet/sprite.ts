/** Atlas for the "curly-hoodie" Codex pet: 8 columns × 11 rows of 192×208 cells. */
export const SHEET = { src: '/pet/curly-hoodie.webp', columns: 8, rows: 11, cellWidth: 192, cellHeight: 208 } as const

export type PetState = 'idle' | 'running-right' | 'running-left' | 'waving' | 'jumping' | 'failed' | 'waiting' | 'running' | 'review'

/** Row, frame count and playback speed for each animation. */
export const STATES: Record<PetState, { row: number; frames: number; fps: number }> = {
  idle: { row: 0, frames: 6, fps: 5 },
  'running-right': { row: 1, frames: 8, fps: 12 },
  'running-left': { row: 2, frames: 8, fps: 12 },
  waving: { row: 3, frames: 4, fps: 6 },
  jumping: { row: 4, frames: 5, fps: 9 },
  failed: { row: 5, frames: 8, fps: 8 },
  waiting: { row: 6, frames: 6, fps: 4 },
  running: { row: 7, frames: 6, fps: 7 },
  review: { row: 8, frames: 6, fps: 6 },
}

/**
 * Frame for a gaze direction in degrees (0 = up, clockwise). Rows 9 and 10 hold 16 directions
 * at 22.5° steps. The sheet draws "down" and the two down-left steps as back views, which reads
 * as turning away from the visitor, so those use the front-facing frame or the lowered left profile.
 */
export function lookCell(degrees: number): { row: number; col: number } {
  const step = Math.round((((degrees % 360) + 360) % 360) / 22.5) % 16
  if (step === 8) return { row: 0, col: 0 }
  if (step === 9 || step === 10) return { row: 10, col: 3 }
  return { row: step < 8 ? 9 : 10, col: step % 8 }
}
