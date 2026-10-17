/** The instructions to give an AI along with an exported site.json and your own details. */
export const SITE_JSON_PROMPT = `You are filling in site.json, the single file that holds every setting and every piece of content of a personal portfolio website. I will give you (1) the current site.json, exported from the site, and (2) my own details (résumé, LinkedIn text, project notes, links).

Return a complete site.json in exactly the same structure, with my details in place of the current owner's.

Rules:
- Keep every key and the overall shape. Do not invent new keys; leave a key out only if it has no value for me.
- Use only facts from my details. Never invent jobs, dates, numbers, achievements or links. If something is unknown, leave that field empty ("" or null) or drop that list item.
- Rich text fields are Markdown strings (paragraphs, **bold**, *italic*, [links](https://…), lists, headings). Fields that hold an object with "root" are special blocks: keep them as they are, or replace them with Markdown.
- Images are {"url": "https://…", "alt": "…"}. Use URLs I give you; otherwise keep the existing image or set null. Always write a short, descriptive alt text.
- Links to other entries (for example a post's categories) use that entry's slug or title, exactly as written in its own entry.
- Each entry in "collections" is matched by its slug (or title when it has no slug): the same slug updates that entry, a new slug creates a new one. Entries are never deleted by an import.
- Dates are ISO 8601 (2026-06-01T00:00:00.000Z). Colours are #rrggbb. Keep "_status": "published" unless I say an entry is a draft.
- Write in plain, clear English, first person where the current text is first person, and keep it concise.

Reply with the JSON only, no commentary.`
