/** Builds the draft-mode preview URL used by the admin live preview for globals. */
export const previewUrl = (path: string) => {
  const params = new URLSearchParams({ path, previewSecret: process.env.PREVIEW_SECRET || '' })
  return `/next/preview?${params.toString()}`
}
