import type { Payload } from 'payload'
import { getAdminLook } from '@/data/adminLook'
import { toMediaRef } from '@/data/media'

/**
 * The admin's logo, menu icon, avatar and theme, all set in Site-wide → Admin look. Without uploads
 * they show the SD logo, drawn in the admin's text colour so it suits light and dark themes.
 */
function Mark({ size }: { size: number }) {
  return (
    <svg viewBox="560 560 800 800" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d="M579 643L944 854V960L670 802V854L944 1012V1276L579 1064V958L852 1116V1064L579 906Z" />
      <path fillRule="evenodd" d="M975 854L1340 643V1064L975 1276ZM1067 906V1116L1249 1012V802Z" />
    </svg>
  )
}

type ServerProps = { payload?: Payload; user?: Record<string, unknown> | null }

/** Login page. */
export async function AdminLogo({ payload }: ServerProps) {
  const look = await getAdminLook(payload)
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 14, color: 'var(--theme-text)' }}>
      {look.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={look.logo} alt="" style={{ height: 52, width: 'auto', maxWidth: 220, objectFit: 'contain' }} />
      ) : (
        <Mark size={52} />
      )}
      {look.logoText ? <span style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em' }}>{look.logoText}</span> : null}
    </span>
  )
}

/** Admin menu and breadcrumbs. */
export async function AdminIcon({ payload }: ServerProps) {
  const look = await getAdminLook(payload)
  return (
    <span style={{ display: 'inline-flex', color: 'var(--theme-text)' }}>
      {look.icon ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={look.icon} alt="" style={{ width: 26, height: 26, objectFit: 'contain', borderRadius: 6 }} />
      ) : (
        <Mark size={26} />
      )}
    </span>
  )
}

/** Account button (top right): the signed-in user's photo, else the default avatar, else the logo. */
export async function AdminAvatar({ payload, user }: ServerProps & { active?: boolean }) {
  let photo = toMediaRef(user?.photo)?.url
  if (!photo && user?.photo != null && payload) {
    const media = await payload.findByID({ collection: 'media', id: user.photo as number, depth: 0 }).catch(() => null)
    photo = toMediaRef(media)?.url
  }
  const src = photo ?? (await getAdminLook(payload)).avatar
  return (
    <span
      style={{
        display: 'grid',
        placeItems: 'center',
        width: 25,
        height: 25,
        borderRadius: '50%',
        overflow: 'hidden',
        background: '#0a0a0b',
        color: '#fff',
        boxShadow: '0 0 0 1px var(--theme-elevation-250)',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {src ? <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Mark size={16} />}
    </span>
  )
}

/** Colours, font and corners for the admin; rendered in the header and on the login page. */
export async function AdminTheme({ payload }: ServerProps) {
  const look = await getAdminLook(payload)
  if (!look.css && !look.fontHref) return null
  return (
    <>
      {look.fontHref ? <link rel="stylesheet" href={look.fontHref} /> : null}
      {look.css ? <style dangerouslySetInnerHTML={{ __html: look.css }} /> : null}
    </>
  )
}
