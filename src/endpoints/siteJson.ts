import type { Endpoint } from 'payload'
import { exportSite, importSite, type SiteJson } from '@/utilities/siteData'
import { getServerSideURL } from '@/utilities/getURL'

/**
 * /api/site-json: GET downloads every setting and piece of content as one file; POST imports one
 * (`?dryRun=1` only reports what would change). Signed-in admins only.
 */
export const siteJson: Endpoint[] = [
  {
    path: '/site-json',
    method: 'get',
    handler: async (req) => {
      if (!req.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
      const json = await exportSite(req.payload, getServerSideURL())
      return new Response(JSON.stringify(json, null, 2), {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Disposition': `attachment; filename="site-${new Date().toISOString().slice(0, 10)}.json"`,
          'Cache-Control': 'no-store',
        },
      })
    },
  },
  {
    path: '/site-json',
    method: 'post',
    handler: async (req) => {
      if (!req.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
      let json: SiteJson
      try {
        json = (await req.json?.()) as SiteJson
      } catch {
        return Response.json({ error: 'That file is not valid JSON.' }, { status: 400 })
      }
      try {
        const report = await importSite(req.payload, json, { dryRun: req.searchParams.get('dryRun') === '1', base: getServerSideURL() })
        return Response.json(report, { headers: { 'Cache-Control': 'no-store' } })
      } catch (e) {
        return Response.json({ error: (e as Error).message }, { status: 400 })
      }
    },
  },
]
