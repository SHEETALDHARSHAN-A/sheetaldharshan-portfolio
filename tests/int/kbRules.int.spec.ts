import { describe, expect, it } from 'vitest'
import { postRules, siteRules } from '@/utilities/kbRules'
import { safeNext } from '@/utilities/readerSession'

describe('Field Notes rules', () => {
  it('uses the site switches unless a post overrides them', () => {
    const site = siteRules({ comments: true, likes: false, reviews: true })
    expect(postRules(site, {})).toMatchObject({ comments: 'on', likes: false, ratings: true })
    expect(postRules(site, { comments: 'locked', likes: 'on', ratings: 'off' })).toMatchObject({ comments: 'locked', likes: true, ratings: false })
    expect(postRules(siteRules({ comments: false }), { comments: 'on' }).comments).toBe('on')
  })
  it('stops likes and ratings when sign-in is off', () => {
    expect(postRules(siteRules({ signIn: false }), { likes: 'on', ratings: 'on' })).toMatchObject({ likes: false, ratings: false })
  })
})

describe('sign-in redirects', () => {
  it('only returns to pages on this site', () => {
    expect(safeNext('/notes/a-post')).toBe('/notes/a-post')
    expect(safeNext('//evil.example')).toBe('/notes')
    expect(safeNext('https://evil.example')).toBe('/notes')
    expect(safeNext('/\\evil')).toBe('/notes')
  })
})
