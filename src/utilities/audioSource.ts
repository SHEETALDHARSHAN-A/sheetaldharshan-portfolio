export type AudioSource = { kind: 'embed'; src: string; height: number } | { kind: 'file'; src: string }

/** Spotify and SoundCloud links → their embedded players; a direct https audio file → a native player. */
export function audioSource(url: string): AudioSource | null {
  try {
    const u = new URL(url)
    if (u.protocol !== 'https:') return null
    if (u.hostname === 'open.spotify.com') {
      const [type, id] = u.pathname.replace(/^\/(intl-[a-z]+\/)?/, '').split('/')
      if (['track', 'episode', 'show', 'album', 'playlist'].includes(type) && id) return { kind: 'embed', src: `https://open.spotify.com/embed/${type}/${id}`, height: type === 'track' || type === 'episode' ? 152 : 352 }
      return null
    }
    if (u.hostname === 'soundcloud.com' || u.hostname === 'on.soundcloud.com') {
      return { kind: 'embed', src: `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff3400&visual=false`, height: 166 }
    }
    if (/\.(mp3|m4a|aac|ogg|oga|opus|wav|flac)$/i.test(u.pathname)) return { kind: 'file', src: url }
  } catch {
    return null
  }
  return null
}
