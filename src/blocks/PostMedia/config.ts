import type { Block, Validate } from 'payload'
import { videoSource } from '@/utilities/videoSource'
import { audioSource } from '@/utilities/audioSource'

/**
 * Media for ./stdout posts, placed anywhere in the text: a video (YouTube, Vimeo, a direct .mp4
 * link or an uploaded file), audio (an uploaded file, a direct link, Spotify or SoundCloud) and a
 * photo (uploaded or linked, optionally clickable). Stored inside the post's text, so adding one
 * needs no database change.
 */

const https: Validate = (value: unknown) => {
  if (!value) return true
  try {
    return new URL(String(value)).protocol === 'https:' ? true : 'Use an https:// link.'
  } catch {
    return 'Enter a full link, starting with https://'
  }
}

export const PostVideo: Block = {
  slug: 'video',
  labels: { singular: 'Video', plural: 'Videos' },
  interfaceName: 'PostVideoBlock',
  fields: [
    {
      name: 'url',
      type: 'text',
      label: 'Video link',
      admin: { description: 'A YouTube or Vimeo link, or a direct https link to an .mp4/.webm file. Or upload a file below instead.' },
      validate: (value: unknown) => (!value ? true : videoSource(String(value)) ? true : 'Use a YouTube or Vimeo link, or a direct https link ending in .mp4 or .webm.'),
    },
    { name: 'file', type: 'upload', relationTo: 'media', label: 'Or upload a video', filterOptions: { mimeType: { contains: 'video' } } },
    { name: 'caption', type: 'text' },
  ],
}

export const PostAudio: Block = {
  slug: 'audio',
  labels: { singular: 'Audio', plural: 'Audio' },
  interfaceName: 'PostAudioBlock',
  fields: [
    { name: 'title', type: 'text', admin: { description: 'Optional, e.g. "Listen: the 5-minute version".' } },
    {
      name: 'url',
      type: 'text',
      label: 'Audio link',
      admin: { description: 'A Spotify or SoundCloud link, or a direct https link to an .mp3/.m4a/.ogg/.wav file. Or upload a file below instead.' },
      validate: (value: unknown) => (!value ? true : audioSource(String(value)) ? true : 'Use a Spotify or SoundCloud link, or a direct https link to an audio file.'),
    },
    { name: 'file', type: 'upload', relationTo: 'media', label: 'Or upload audio', filterOptions: { mimeType: { contains: 'audio' } } },
    { name: 'caption', type: 'text' },
  ],
}

export const PostPhoto: Block = {
  slug: 'photo',
  labels: { singular: 'Photo', plural: 'Photos' },
  interfaceName: 'PostPhotoBlock',
  fields: [
    { name: 'image', type: 'upload', relationTo: 'media', filterOptions: { mimeType: { contains: 'image' } } },
    { name: 'imageUrl', type: 'text', label: 'Or an image link', validate: https, admin: { description: 'A direct https link to an image, used when nothing is uploaded.' } },
    {
      type: 'row',
      fields: [
        { name: 'alt', type: 'text', label: 'Describe the image', admin: { width: '50%', description: 'For screen readers and search. Uploaded images use their own alt text when empty.' } },
        { name: 'href', type: 'text', label: 'Link when clicked', validate: https, admin: { width: '50%', description: 'Optional, e.g. the source or a larger version.' } },
      ],
    },
    { name: 'caption', type: 'text' },
    {
      name: 'size',
      type: 'select',
      defaultValue: 'normal',
      options: [
        { label: 'Text width', value: 'normal' },
        { label: 'Small, centred', value: 'small' },
        { label: 'Wide', value: 'wide' },
      ],
    },
  ],
}
