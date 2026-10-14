import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from 'payload'
import { revalidatePath, revalidateTag } from 'next/cache'

/**
 * Revalidation helpers. Every public page reads from Payload at request time, so these
 * mainly clear Next's data cache and keep sitemaps fresh. Publishing in the admin is
 * visible on the next request; there is no scheduled delay.
 */
const safeRevalidate = (paths: string[], tags: string[] = []) => {
  try {
    for (const path of paths) revalidatePath(path)
    for (const tag of tags) revalidateTag(tag, 'max')
  } catch {
    // Revalidation is unavailable outside a Next request context (seed scripts, CLI). That is fine.
  }
}

export const revalidateGlobalPaths =
  (paths: string[]): GlobalAfterChangeHook =>
  ({ doc, req: { context } }) => {
    if (!context.disableRevalidate) safeRevalidate(paths)
    return doc
  }

export const revalidateCollectionPaths =
  (paths: string[], tags: string[] = []): CollectionAfterChangeHook =>
  ({ doc, req: { context } }) => {
    if (!context.disableRevalidate) safeRevalidate(paths, tags)
    return doc
  }

export const revalidateCollectionDelete =
  (paths: string[], tags: string[] = []): CollectionAfterDeleteHook =>
  ({ doc, req: { context } }) => {
    if (!context.disableRevalidate) safeRevalidate(paths, tags)
    return doc
  }

export const revalidateProject: CollectionAfterChangeHook = ({ doc, previousDoc, req: { context } }) => {
  if (!context.disableRevalidate) {
    const paths = ['/', '/projects', '/about', '/sitemap.xml']
    if (doc?.slug) paths.push(`/projects/${doc.slug}`)
    if (previousDoc?.slug && previousDoc.slug !== doc?.slug) paths.push(`/projects/${previousDoc.slug}`)
    safeRevalidate(paths, ['projects-sitemap'])
  }
  return doc
}

export const revalidateProjectDelete: CollectionAfterDeleteHook = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) safeRevalidate(['/projects', `/projects/${doc?.slug}`, '/sitemap.xml'], ['projects-sitemap'])
  return doc
}
