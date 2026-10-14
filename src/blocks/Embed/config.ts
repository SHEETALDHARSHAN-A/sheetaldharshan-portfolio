import type { Block } from 'payload'

export const ALLOWED_EMBED_HOSTS = ['www.youtube.com', 'youtube.com', 'youtu.be', 'player.vimeo.com', 'vimeo.com']

export const Embed: Block = {
  slug: 'embed',
  interfaceName: 'EmbedBlock',
  fields: [
    {
      name: 'url',
      type: 'text',
      required: true,
      admin: { description: 'YouTube or Vimeo URL only. Other hosts are not rendered.' },
      validate: (value: unknown) => {
        if (typeof value !== 'string') return 'Enter a URL'
        try {
          const host = new URL(value).hostname
          return ALLOWED_EMBED_HOSTS.includes(host) ? true : 'Only YouTube and Vimeo embeds are allowed.'
        } catch {
          return 'Enter a valid URL'
        }
      },
    },
    { name: 'caption', type: 'text' },
  ],
}
