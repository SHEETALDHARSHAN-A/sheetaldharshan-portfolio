# site.json: the whole site in one file

Every setting and every piece of content (name and profiles, theme, sidebar, pet, homepage conversation, About, projects, experience, education, certifications, publications, posts, categories, pages, admin look and sign-in options) can be exported to one JSON file, edited, and imported back. User accounts and passwords are never included.

[`content/site.json`](../content/site.json) is a full example: this site as it is.

## Export

- **Admin:** Admin panel → **Import & export** → *Download site.json*.
- **Command line:** `pnpm content:export` writes `content/site.json` (or `pnpm content:export my-site.json`). It reads the database in `DATABASE_URL`.

## The format

```jsonc
{
  "version": 1,
  "globals": {                       // one object per settings page
    "site-settings": { "fullName": "…", "email": "…", "socialLinks": [{ "label": "GitHub", "href": "https://…" }] },
    "about": { "intro": "Markdown text…", "photo": { "url": "https://…/me.jpg", "alt": "Portrait of …" } }
  },
  "collections": {                   // lists of entries
    "projects": [{ "slug": "my-app", "title": "My App", "summary": "…", "_status": "published" }],
    "experience": [{ "role": "Engineer", "company": "…", "startDate": "2024-01-01T00:00:00.000Z" }]
  }
}
```

- **Rich text** is Markdown. Text that uses special blocks (code, embeds, banners) is kept as the editor's own JSON (an object with `"root"`) so nothing is lost; you can replace it with Markdown.
- **Images** are `{ "url", "alt" }`. On import, a URL whose file name is already in the media library reuses that image; anything else is downloaded into it.
- **Links between entries** (a post's categories, related projects) use the other entry's slug, or its title when it has no slug.
- **Matching:** entries are matched by slug (or title). The same slug updates that entry; a new slug creates one. **Nothing is ever deleted** by an import; delete in the admin.
- Settings pages are replaced by what the file contains; keys you leave out keep their current value.
- `"_status": "draft"` keeps an entry private; anything else publishes it.
- New fields added to the CMS later are exported and imported automatically.

## Fill it in with an AI

1. Export the current site (above).
2. Give an AI assistant (Claude, ChatGPT…) the prompt below, the exported file, and your details: résumé, LinkedIn text, project notes, links and image URLs.
3. Import what it returns. Always **Preview changes** first.

The same prompt is on the Import & export page, with a copy button.

```text
You are filling in site.json, the single file that holds every setting and every piece of content of a personal portfolio website. I will give you (1) the current site.json, exported from the site, and (2) my own details (résumé, LinkedIn text, project notes, links).

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

Reply with the JSON only, no commentary.
```

## Import

- **Admin:** Admin panel → **Import & export**. Choose the file (or paste the JSON), **Preview changes** to see what will be created, updated or downloaded, then **Import**. The public site refreshes within a few minutes.
- **Command line:** `pnpm content:import content/site.json --dry-run` to preview, then without `--dry-run` to apply. It writes to the database in `DATABASE_URL`; restart or redeploy afterwards, or wait for the five-minute page refresh.

Tip: export before every import. The export is your backup.
