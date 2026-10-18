import { emailAlertsReady } from '@/utilities/emailAlert'
import { SendTestEmail } from './SendTestEmail'

/** Contact page → Email alerts: whether alerts can go out, how to switch them on, and a test button. */
export function EmailAlertStatus() {
  const ready = emailAlertsReady()
  const box: React.CSSProperties = { margin: '0 0 18px', padding: '12px 14px', borderRadius: 8, border: '1px solid var(--theme-elevation-150)', fontSize: 13, lineHeight: 1.5, display: 'grid', gap: 8 }
  return (
    <div style={box}>
      {ready ? (
        <span>
          <strong style={{ color: 'var(--theme-success-500)' }}>Email alerts are ready.</strong> Each new message is emailed to you, and replying to it answers the visitor.
        </span>
      ) : (
        <span>
          <strong style={{ color: 'var(--theme-warning-500, #d9a400)' }}>Email alerts are not switched on yet.</strong> Messages are still saved under Contact page → Messages. To get them by email:
          create a free account at resend.com with the address you want alerts at, create an API key, and add it in Vercel as <code>RESEND_API_KEY</code> (then redeploy).
        </span>
      )}
      <SendTestEmail />
    </div>
  )
}
