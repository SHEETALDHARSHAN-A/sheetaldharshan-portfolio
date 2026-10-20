/**
 * Writes only from pages on this site, sent as JSON. Browsers mark cross-site requests (Origin,
 * Sec-Fetch-Site) and a plain HTML form cannot send JSON, so another site cannot post on a
 * reader's behalf even though the session cookie travels with same-site requests.
 */
export function sameOrigin(req: { headers: Headers }): boolean {
  if (!(req.headers.get('content-type') ?? '').includes('application/json')) return false
  const fetchSite = req.headers.get('sec-fetch-site')
  if (fetchSite && fetchSite !== 'same-origin') return false
  const origin = req.headers.get('origin')
  if (!origin) return fetchSite === 'same-origin'
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host')
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}
