export type SendResult = { ok: true } | { ok: false; error?: string; errors?: Record<string, string> }

/** Posts answers (by question key) to /api/contact (src/endpoints/contact.ts). */
export async function sendMessage(answers: Record<string, string>, extra: { startedAt: number; website?: string }): Promise<SendResult> {
  try {
    const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ answers, ...extra, page: window.location.pathname }) })
    const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; errors?: Record<string, string> }
    if (res.ok && body.ok) return { ok: true }
    return { ok: false, error: body.error ?? (body.errors ? undefined : 'Your message could not be sent just now.'), errors: body.errors }
  } catch {
    return { ok: false, error: 'You seem to be offline. Please check your connection and try again.' }
  }
}
