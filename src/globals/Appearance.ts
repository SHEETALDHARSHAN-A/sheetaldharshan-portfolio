import type { GlobalConfig } from 'payload'
import { authenticated } from '@/access/authenticated'

export const Appearance: GlobalConfig = {
  slug: 'appearance',
  access: { read: () => true, update: authenticated },
  fields: [
    { name: 'primaryColor', type: 'select', defaultValue: 'ink', options: ['ink', 'navy', 'forest'] },
    { name: 'accentColor', type: 'select', defaultValue: 'acid', options: ['acid', 'orange', 'blue'] },
    { name: 'fontPreset', type: 'select', defaultValue: 'editorial', options: ['editorial', 'technical', 'quiet'] },
    { name: 'animationIntensity', type: 'select', defaultValue: 'restrained', options: ['reduced', 'restrained', 'expressive'] },
    { name: 'projectDisplayStyle', type: 'select', defaultValue: 'stage', options: ['stage', 'list'] },
  ],
}
