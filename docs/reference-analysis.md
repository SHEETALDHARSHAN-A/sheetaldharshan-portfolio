# Reference analysis

Observed 14 October 2026 from the live sites, the two screen recordings on the Desktop (`Screen Recording 2026-10-12 at 6.03.18 PM.mov`, 17 s, and `… 6.07.58 PM.mov`, 64 s), and the public source of juliangarnier.com.

## juliangarnier.com (homepage reference)

Structure: a single `.messages` container of inline-block `.bubble` elements, each followed by a `<br>`. Nothing else on the page: no header, no footer, no navigation outside the bubbles.

Measured values (from `css/styles.css`):

| Property | Value |
|---|---|
| Font | `system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif` plus emoji fallbacks |
| Root size | 18px, 24px ≥ 600px, 28px ≥ 900px, 32px ≥ 1200px |
| Background (dark) | `#000`; bubble `rgba(206,206,206,.125)`; text `#fff`; muted `rgba(206,206,206,.5)`; link `#0076FF` |
| Background (light) | `#fff`; bubble `rgba(206,206,206,.5)`; text `#000` |
| Container | `width: 100vw; max-height: 100vh; overflow: auto; padding: 1rem .9rem` |
| Bubble | `padding: .5rem .85rem; line-height: 1.25rem; border-radius: 1.25rem; margin-bottom: .125rem; transform-origin: 0 100%` |
| Newest bubble | `border-bottom-left-radius: 0` (class `cornered`), released when the next message arrives |
| Loading dots | three `•` at `1.625rem`, colour `rgba(206,206,206,.5)`, absolutely positioned inside the bubble |

Sequence (from `js/scripts.js`, anime.js): for each message, a 4rem × 2.25rem loading pill pops in from the bottom-left (`width 0 → 4rem`, `marginTop 2.5rem → 0`, `marginLeft -2.5rem → 0`, 800 ms, easeOutElastic with the build's default elasticity 50, which gives a period of 95 % of the duration: one slow overshoot) and pulses (`scale 1.05 ↔ .95`, 1100 ms) while the dots pulse (`scale 1 → 1.25`, `opacity .5 → 1`, 300 ms, staggered 100 ms). After `characters × 20 ms + 500 ms` the dots shrink out, the bubble stretches to the measured message size (800 ms, elastic) and the text fades in (300 ms). The next message starts after `characters × 20 ms + random(900, 1200) ms`.

The recording confirms this: each pill appears at the width of the message that will replace it, the text fades in, and the sequence ends with the last bubble keeping its squared corner.

## yakudoo.com (projects reference)

From the 14 October recording (`Screen Recording 2026-10-14 at 9.19.07 PM.mov`, 70 s, 3680×2288), frame by frame:

Index page
- A narrow left sidebar with the wordmark top-left and a numbered nav bottom-left (01 PROJECTS in the accent colour, 02 ABOUT, 03 CONTACT, a tiny PRIVACY POLICY under it).
- Right of it, a vertical strip of square thumbnails with two-digit numbers in the gutter to their left.
- Each project title sits in a condensed-uppercase tab to the right of its thumbnail. The tabs have the page background and fit their text, so together they form a stair-step edge laid over the visual.
- The visual is full-bleed behind everything right of the thumbnail strip, often a looping video or animated scene.
- Hover: the tab grows into a large dark card with a big number, the title in bold condensed uppercase, the category underneath, and a small accent triangle at the right. The previous card collapses back to a tab (a brief grey intermediate state).
- Visual change: the new visual wipes in from the right edge toward the left over roughly 0.7 s with a strong ease-in-out, the old one staying in place beneath it.
- A click opens the project; the list collapses while the project page loads.

Project page
- Sidebar unchanged. A sticky info column (about 200 px): accent condensed eyebrow with the category, the title in a regular sans, a short description, then small condensed labels (YEAR, CLIENT, ROLE, COLLABORATORS) with values, a hairline, and "← BACK TO PROJECTS" in the accent colour.
- A wide media column: the hero (an image with a "WATCH THE FILM" play overlay that loads the video host on click), then sections with a plain sans heading and one line of text followed by full-width media, an "Interface" section as a two-column grid of screenshots, and a "NEXT PROJECT" footer with a small thumbnail and the next title.

## What was carried over and what was not

Carried over to this site: the homepage structure, measurements and timing above, implemented independently in React with the MIT-licensed anime.js package; the stair-step list, hover card, right-to-left wipe and the two-column case study with play overlay, re-coloured on black per the owner's request (the reference's cream becomes black, its dark hover card becomes white).

Not carried over: any source file, image, favicon, icon, copy, name or project from either reference. juliangarnier.com is licensed CC BY-NC 4.0; its files are not included in this repository.
