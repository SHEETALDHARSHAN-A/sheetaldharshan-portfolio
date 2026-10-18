'use client'

import { useAllFormFields } from '@payloadcms/ui'
import { reduceFieldsToValues } from 'payload/shared'
import { useEffect, useState } from 'react'
import { toContactSettings } from '@/utilities/contactFields'
import { fill, renderEmail, SAMPLE } from '@/utilities/emailTemplate'
import { SendTestEmail } from './SendTestEmail'

/** A live preview of one Contact page email, with sample answers, as it will look in an inbox. */
export function EmailPreview({ kind = 'alert' }: { kind?: 'alert' | 'confirm' }) {
  const [fields] = useAllFormFields()
  const [site, setSite] = useState({ name: 'My website', url: '' })
  useEffect(() => {
    fetch('/api/globals/site-settings?depth=0', { credentials: 'include' })
      .then((r) => r.json())
      .then((s: { fullName?: string; displayName?: string; canonicalUrl?: string }) => setSite({ name: s.fullName || s.displayName || 'My website', url: (s.canonicalUrl || '').replace(/\/$/, '') }))
      .catch(() => undefined)
  }, [])

  const settings = toContactSettings(reduceFieldsToValues(fields, true) as Record<string, unknown>)
  const vars = { name: SAMPLE.name, email: SAMPLE.email, topic: SAMPLE.topic, site: site.name, url: site.url }
  const thanks = kind === 'confirm'
  const email = renderEmail(thanks ? settings.confirmEmail : settings.alertEmail, vars, SAMPLE.answers, {
    look: { accent: settings.accent },
    buttonHref: thanks ? site.url || '#' : `mailto:${SAMPLE.email}`,
  })
  const from = `${fill(settings.fromName, vars) || site.name} <${settings.fromEmail || 'CONTACT_FROM_EMAIL'}>`
  const meta: React.CSSProperties = { fontSize: 12.5, color: 'var(--theme-elevation-600)', display: 'grid', gap: 2, padding: '10px 12px', borderBottom: '1px solid var(--theme-elevation-150)' }

  return (
    <div style={{ margin: '4px 0 24px', display: 'grid', gap: 10 }}>
      <div style={{ fontWeight: 600, fontSize: 13 }}>Preview, with sample answers</div>
      <div style={{ border: '1px solid var(--theme-elevation-150)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={meta}>
          <span>
            <strong>From</strong> {from}
          </span>
          <span>
            <strong>To</strong> {thanks ? SAMPLE.email : settings.notifyEmail || 'your email (Site-wide → Name & profiles)'}
          </span>
          <span>
            <strong>Subject</strong> {email.subject}
          </span>
        </div>
        <iframe title={`${kind} email preview`} srcDoc={email.html} sandbox="" style={{ width: '100%', height: 560, border: 0, display: 'block', background: '#f1f2e9' }} />
      </div>
      <SendTestEmail kind={kind} />
    </div>
  )
}
