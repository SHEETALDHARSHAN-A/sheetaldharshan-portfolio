/** Atlas for the "curly-hoodie" Codex pet: 8 columns × 11 rows of 192×208 cells. */
export const SHEET = { src: '/pet/curly-hoodie.webp', columns: 8, rows: 11, cellWidth: 192, cellHeight: 208 } as const

export type PetState = 'idle' | 'running-right' | 'running-left' | 'waving' | 'jumping' | 'failed' | 'waiting' | 'running' | 'review'

/** Row, frame count and playback speed for each animation. */
export const STATES: Record<PetState, { row: number; frames: number; fps: number }> = {
  idle: { row: 0, frames: 6, fps: 3 },
  'running-right': { row: 1, frames: 8, fps: 8 },
  'running-left': { row: 2, frames: 8, fps: 8 },
  waving: { row: 3, frames: 4, fps: 4 },
  jumping: { row: 4, frames: 5, fps: 7 },
  failed: { row: 5, frames: 8, fps: 6 },
  waiting: { row: 6, frames: 6, fps: 2.5 },
  running: { row: 7, frames: 6, fps: 4 },
  review: { row: 8, frames: 6, fps: 4 },
}

/** Frame for a gaze direction in degrees (0 = up, clockwise): rows 9 and 10 hold 16 directions at 22.5° steps. */
export function lookCell(degrees: number): { row: number; col: number } {
  const step = Math.round((((degrees % 360) + 360) % 360) / 22.5) % 16
  return { row: step < 8 ? 9 : 10, col: step % 8 }
}
