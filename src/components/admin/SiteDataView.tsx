import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import type { AdminViewServerProps } from 'payload'
import { SITE_JSON_PROMPT } from '@/utilities/siteJsonPrompt'
import { SiteDataPanel } from './SiteDataPanel'

/** Admin panel → Import & export: the whole site as one JSON file, out and back in. */
export function SiteDataView({ initPageResult, params, searchParams }: AdminViewServerProps) {
  const { req, locale, permissions, visibleEntities } = initPageResult
  return (
    <DefaultTemplate
      i18n={req.i18n}
      locale={locale}
      params={params}
      payload={req.payload}
      permissions={permissions}
      searchParams={searchParams}
      user={req.user || undefined}
      visibleEntities={visibleEntities}
    >
      <Gutter>
        {req.user ? <SiteDataPanel prompt={SITE_JSON_PROMPT} /> : <p style={{ marginTop: 40 }}>Please sign in.</p>}
      </Gutter>
    </DefaultTemplate>
  )
}
