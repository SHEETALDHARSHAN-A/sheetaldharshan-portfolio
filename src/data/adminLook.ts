import { cache } from 'react'
import configPromise from '@payload-config'
import { getPayload, type Payload } from 'payload'
import { toMediaRef } from '@/data/media'
import { BODY_FONTS, HEX } from '@/styles/theme'

export type AdminLookSettings = {
  logo?: string
  logoText: string
  icon?: string
  avatar?: string
  css: string
  fontHref?: string
}

const RADIUS = { round: ['6px', '10px', '16px'], square: ['0px', '0px', '0px'] } as const

/** Admin look (Site-wide → Admin look), checked: only #rrggbb colours and listed fonts reach the CSS. */
export const getAdminLook = cache(async (given?: Payload): Promise<AdminLookSettings> => {
  const payload = given ?? (await getPayload({ config: configPromise }))
  const doc = (await payload.findGlobal({ slug: 'admin-look', depth: 1, overrideAccess: true }).catch(() => null)) as Record<string, unknown> | null
  const hex = (v: unknown) => (typeof v === 'string' && HEX.test(v) ? v : undefined)
  const logo = toMediaRef(doc?.logo)?.url
  const icon = toMediaRef(doc?.icon)?.url ?? logo
  const font = typeof doc?.font === 'string' && doc.font in BODY_FONTS ? BODY_FONTS[doc.font as keyof typeof BODY_FONTS] : undefined
  const radius = doc?.radius === 'round' || doc?.radius === 'square' ? RADIUS[doc.radius] : undefined
  const accent = hex(doc?.accentColor)
  const root = [
    accent && `--theme-success-500:${accent};--theme-success-400:${accent};--theme-success-600:${accent};--color-success-500:${accent}`,
    font && `--font-body:'${font.family}',system-ui,sans-serif`,
    radius && `--style-radius-s:${radius[0]};--style-radius-m:${radius[1]};--style-radius-l:${radius[2]}`,
  ]
    .filter(Boolean)
    .join(';')
  const bg = (v?: string) => (v ? `--theme-bg:${v};--theme-elevation-0:${v}` : '')
  const css = [
    root && `:root{${root}}`,
    hex(doc?.backgroundLight) && `html[data-theme=light]{${bg(hex(doc?.backgroundLight))}}`,
    hex(doc?.backgroundDark) && `html[data-theme=dark]{${bg(hex(doc?.backgroundDark))}}`,
  ]
    .filter(Boolean)
    .join('\n')
  return {
    logo,
    logoText: typeof doc?.logoText === 'string' ? doc.logoText : doc ? '' : 'sheetaldharshan.me',
    icon,
    avatar: toMediaRef(doc?.avatar)?.url ?? icon,
    css,
    fontHref: font ? `https://fonts.googleapis.com/css2?family=${font.query}&display=swap` : undefined,
  }
})
