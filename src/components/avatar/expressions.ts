/** Expression API shared by the avatar and the rest of the site. Works without importing React. */
export type Expression = 'idle' | 'happy' | 'curious' | 'thinking' | 'excited' | 'wave' | 'sleepy' | 'surprised'

export const AVATAR_EVENT = 'avatar:expression'

/**
 * Trigger an expression from anywhere. Transient expressions return to idle on their own;
 * pass `hold: true` to keep one until the next call.
 */
export function setExpression(expression: Expression, options: { hold?: boolean; duration?: number } = {}) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(AVATAR_EVENT, { detail: { expression, ...options } }))
}
