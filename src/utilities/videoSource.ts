import { ALLOWED_EMBED_HOSTS } from '@/blocks/Embed/config'

export type VideoSource = { kind: 'embed'; src: string } | { kind: 'file'; src: string }

/** YouTube or Vimeo page link → embeddable player URL (no-cookie YouTube), or null. */
export function embedSrc(url: string): string | null {
  try {
    const u = new URL(url)
    if (!ALLOWED_EMBED_HOSTS.includes(u.hostname)) return null
    if (u.hostname.includes('youtube.com')) {
      const id = u.searchParams.get('v') ?? u.pathname.split('/').filter(Boolean).pop()
      return id ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}` : null
    }
    if (u.hostname === 'youtu.be') {
      const id = u.pathname.slice(1)
      return id ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}` : null
    }
    if (u.hostname.includes('vimeo.com')) {
      const id = u.pathname.split('/').filter(Boolean).pop()
      return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : null
    }
  } catch {
    return null
  }
  return null
}

/** A YouTube/Vimeo link plays in their player; a direct .mp4/.webm link streams in a native player. */
export function videoSource(url: string, autoplay = false): VideoSource | null {
  const embed = embedSrc(url)
  if (embed) {
    // rel=0 keeps end-of-video suggestions to the same channel; playsinline stops iPhones going fullscreen.
    const params = embed.includes('youtube') ? `rel=0&playsinline=1${autoplay ? '&autoplay=1' : ''}` : autoplay ? 'autoplay=1' : ''
    return { kind: 'embed', src: params ? `${embed}?${params}` : embed }
  }
  try {
    const u = new URL(url)
    if (u.protocol === 'https:' && /\.(mp4|webm|m4v)$/i.test(u.pathname)) return { kind: 'file', src: url }
  } catch {
    return null
  }
  return null
}
