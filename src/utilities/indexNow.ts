import { after } from 'next/server'
import { getServerSideURL } from './getURL'

/** IndexNow key; public by design (served at /<key>.txt so search engines can verify it). */
export const INDEXNOW_KEY = 'a7effa954b134cea94d4128c57f50bef'

/**
 * Tells Bing and the other IndexNow engines which pages just changed, so they recrawl in minutes
 * instead of days. Bing's index also feeds ChatGPT search, DuckDuckGo and Yahoo. Production only.
 */
export function pingIndexNow(paths: string[]) {
  if (process.env.VERCEL_ENV !== 'production') return
  const base = getServerSideURL().replace(/\/$/, '')
  const urlList = [...new Set(paths.filter((p) => p.startsWith('/') && !/\.(xml|txt)$/.test(p)).map((p) => `${base}${p}`))]
  if (!urlList.length) return
  const send = () =>
    fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: new URL(base).host, key: INDEXNOW_KEY, keyLocation: `${base}/${INDEXNOW_KEY}.txt`, urlList }),
    }).catch(() => undefined)
  try {
    // Run after the admin's save response, so publishing never waits on it.
    after(send)
  } catch {
    void send()
  }
}
