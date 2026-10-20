import type { PostAudioBlock, PostPhotoBlock, PostVideoBlock } from '@/payload-types'
import { MediaAny, Picture } from '@/components/Media/Picture'
import { Embed } from '@/components/blocks/RenderProjectBlocks'
import { toMediaRef } from '@/data/media'
import { audioSource } from '@/utilities/audioSource'
import { videoSource } from '@/utilities/videoSource'

/** Only https links are rendered, whatever was saved. */
const httpsOnly = (u?: string | null) => (u && /^https:\/\//i.test(u) ? u : undefined)

/** A video in a post: YouTube/Vimeo in their player, a direct link or uploaded file in a native one. */
export function PostVideo({ url, file, caption }: PostVideoBlock) {
  const upload = toMediaRef(file)
  const source = url ? videoSource(url) : null
  if (source?.kind === 'embed') return <Embed url={url!} caption={caption} />
  const src = source?.src ?? upload?.url
  if (!src) return null
  return (
    <figure className="media-figure post-media">
      {upload && !source ? <MediaAny media={upload} /> : <video controls playsInline preload="metadata" src={src} />}
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  )
}

/** Audio in a post: Spotify or SoundCloud in their player, a file in the browser's own player. */
export function PostAudio({ title, url, file, caption }: PostAudioBlock) {
  const upload = toMediaRef(file)
  const source = url ? audioSource(url) : upload?.url ? ({ kind: 'file', src: upload.url } as const) : null
  if (!source) return null
  return (
    <figure className="post-audio">
      {title ? <p className="post-audio-title">{title}</p> : null}
      {source.kind === 'embed' ? (
        <iframe src={source.src} height={source.height} loading="lazy" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" title={title || caption || 'Audio player'} />
      ) : (
        <audio controls preload="metadata" src={source.src} />
      )}
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  )
}

/** A photo in a post, uploaded or linked, optionally clickable. */
export function PostPhoto({ image, imageUrl: rawImage, alt, href: rawHref, caption, size }: PostPhotoBlock) {
  const upload = toMediaRef(image)
  const imageUrl = httpsOnly(rawImage)
  const href = httpsOnly(rawHref)
  const img = upload ? (
    <Picture media={alt ? { ...upload, alt } : upload} sizes={size === 'wide' ? '(max-width: 960px) 100vw, 1000px' : '(max-width: 960px) 100vw, 720px'} />
  ) : imageUrl ? (
    // An outside image: shown as is, since its size is unknown to the image optimiser.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={imageUrl} alt={alt ?? ''} loading="lazy" />
  ) : null
  if (!img) return null
  return (
    <figure className={`media-figure post-photo post-photo-${size ?? 'normal'}`}>
      {href ? (
        <a href={href} target="_blank" rel="noreferrer">
          {img}
        </a>
      ) : (
        img
      )}
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  )
}
