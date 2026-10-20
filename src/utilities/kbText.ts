/**
 * The ./stdout side column and empty-state wording, set in the admin (./stdout → Settings → Side
 * column / Empty pages). Defaults here; empty admin fields fall back to them.
 */
export type KbSide = {
  searchPlaceholder: string
  browse: string
  allPosts: string
  yourChannels: string
  channels: string
  you: string
  signIn: string
  signInRest: string
  newChannel: string
  newChannelPlaceholder: string
  mineHint: string
  privacy: string
  openSections: ('browse' | 'mine' | 'channels' | 'you')[]
  openCurrent: boolean
  itemsPerChannel: number
  showCounts: boolean
}
export type KbEmptyText = { indexCommand: string; indexLine: string; searchLine: string; channelLine: string; indexEyebrow: string; channelEyebrow: string }

export const SIDE_DEFAULTS: KbSide = {
  searchPlaceholder: 'Search notes',
  browse: 'Browse',
  allPosts: 'All posts',
  yourChannels: 'Your channels',
  channels: 'Channels',
  you: 'You',
  signIn: 'Sign in',
  signInRest: 'to comment, like and star channels.',
  newChannel: '+ New channel',
  newChannelPlaceholder: 'Channel name',
  mineHint: 'Save posts into your own channels with the Save button on any post.',
  privacy: 'Privacy',
  openSections: ['browse', 'mine', 'channels', 'you'],
  openCurrent: true,
  itemsPerChannel: 50,
  showCounts: true,
}
export const EMPTY_DEFAULTS: KbEmptyText = {
  indexCommand: './stdout',
  indexLine: 'waiting for the first note…',
  searchLine: '(no matches)',
  channelLine: '(empty: nothing here yet)',
  indexEyebrow: 'Notes',
  channelEyebrow: 'channel',
}

const str = (v: unknown, d: string) => (typeof v === 'string' && v.trim() ? v.trim() : d)

export function toKbSide(g: Record<string, unknown> | null | undefined): KbSide {
  const s = (g?.side ?? {}) as Record<string, unknown>
  const d = SIDE_DEFAULTS
  const sections = Array.isArray(s.openSections) ? (s.openSections as string[]).filter((x): x is KbSide['openSections'][number] => ['browse', 'mine', 'channels', 'you'].includes(x)) : d.openSections
  const n = Number(s.itemsPerChannel)
  return {
    searchPlaceholder: str(s.searchPlaceholder, d.searchPlaceholder),
    browse: str(s.browse, d.browse),
    allPosts: str(s.allPosts, d.allPosts),
    yourChannels: str(s.yourChannels, d.yourChannels),
    channels: str(s.channels, d.channels),
    you: str(s.you, d.you),
    signIn: str(s.signIn, d.signIn),
    signInRest: str(s.signInRest, d.signInRest),
    newChannel: str(s.newChannel, d.newChannel),
    newChannelPlaceholder: str(s.newChannelPlaceholder, d.newChannelPlaceholder),
    mineHint: str(s.mineHint, d.mineHint),
    privacy: str(s.privacy, d.privacy),
    openSections: sections,
    openCurrent: s.openCurrent !== false,
    itemsPerChannel: Number.isFinite(n) && n >= 0 ? Math.min(200, Math.floor(n)) : d.itemsPerChannel,
    showCounts: s.showCounts !== false,
  }
}

export function toKbEmpty(g: Record<string, unknown> | null | undefined): KbEmptyText {
  const e = (g?.empty ?? {}) as Record<string, unknown>
  const d = EMPTY_DEFAULTS
  return {
    indexCommand: str(e.indexCommand, d.indexCommand),
    indexLine: str(e.indexLine, d.indexLine),
    searchLine: str(e.searchLine, d.searchLine),
    channelLine: str(e.channelLine, d.channelLine),
    indexEyebrow: str(e.indexEyebrow, d.indexEyebrow),
    channelEyebrow: str(e.channelEyebrow, d.channelEyebrow),
  }
}
