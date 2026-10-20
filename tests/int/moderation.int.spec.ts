import { describe, expect, it } from 'vitest'
import { moderate } from '@/utilities/moderation'

describe('Field Notes moderation', () => {
  it('publishes ordinary comments, including words that only look rude', () => {
    for (const t of ['Great explanation, thanks!', 'The cockpit analogy works.', 'I live in Essex and use Sussex data.', 'Therapist-style prompts', 'Shiitake and grapes', 'The Sunni and Shia sections', 'Is this Pakistan-specific?', 'The pundit was wrong']) {
      expect(moderate(t).action, t).toBe('publish')
    }
  })
  it('refuses slurs and severe abuse, including disguised spellings', () => {
    for (const t of ['you are a madarch0d', 'b h e n c h o d', 'thevidiya', 'kys', 'kill your self', 'F.A.G.G.O.T']) {
      expect(moderate(t).action, t).toBe('reject')
    }
  })
  it('holds swearing, link spam and shouting for approval', () => {
    expect(moderate('this is fucking great').action).toBe('hold')
    expect(moderate('sh1t happens').action).toBe('hold')
    expect(moderate('see https://a.example and https://b.example').action).toBe('hold')
    expect(moderate('THIS IS THE WORST POST I HAVE EVER READ').action).toBe('hold')
    expect(moderate('cheap viagra here').action).toBe('hold')
  })
  it('refuses the extra words set in the admin, and can hold everything', () => {
    expect(moderate('this mentions badword', { blocked: ['badword'] }).action).toBe('reject')
    expect(moderate('a clean comment', { holdAll: true }).action).toBe('hold')
  })
})
