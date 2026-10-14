# Visual QA report

Date: 14 October 2026. Captures in `references/screenshots/` were taken with Chrome at 1440×900 and 390×844. Homepage captures used a real-time browser (Playwright, system Chrome) because the sequence is driven by timers and animation frames; virtual-time captures freeze mid-animation and are not representative.

## Homepage vs juliangarnier.com

| Check | Reference | Implementation | Result |
|---|---|---|---|
| Font | system-ui stack (renders as SF Pro on macOS) | same stack | match |
| Root size at 1440 | 32px (2rem) | 32px (`.jg` ≥ 1200px) | match |
| Bubble background | rgba(206,206,206,.125) on #000 | same | match |
| Bubble padding / radius | .5rem .85rem / 1.25rem | .5em .85em / 1.25em | match |
| Newest bubble corner | bottom-left 0 on the last bubble | same, released on the next message | match |
| Link colour | #0076FF underlined | same | match |
| Container padding | 1rem .9rem | same | match |
| Loading pill | 4rem × 2.25rem, pops in from bottom-left, pulses | same values; the 2016 easeOutElastic (elasticity 50) ported as a custom ease | match by inspection of `home-1440-mid.png` and the browser |
| Typing time | chars × 20 ms + 500 ms | same (CMS can override per message) | match |
| Gap to next message | chars × 20 ms + random(900, 1200) | same | match |
| Text fade-in | 300 ms when the dots pass 65 % | same | match |
| Message widths | bubble fitted to measured text | same; capped to the viewport so long lines wrap instead of overflowing on phones | differs on purpose |
| Content | "Hey there 👋", Julian's links, time-of-day greeting | the owner's approved messages; no emoji per the writing rules; no time-of-day message | content only |
| Theme | follows `prefers-color-scheme` | Appearance global (dark default, light preset uses the reference's light values) | differs on purpose |

The easing curve is the reference's own formula (normalised), so the spring shape matches rather than approximates. The dots are rendered as text bullets as in the reference; glyph metrics depend on the viewer's system font.

## Projects vs yakudoo.com (14 October recording)

| Check | Reference | Implementation | Result |
|---|---|---|---|
| Page structure | sidebar, thumbnail strip with numbers, title tabs over a full-bleed visual | same (`projects-1440.png`) | match |
| Tab shape | page-coloured tabs fitting their text, stair-step edge | same, black on black theme | match |
| Hover card | slate card spanning the row: thin large number, thumbnail squeezed to a sliver, Barlow Condensed 600 32/35 title in #f3f3eb, category, thin accent arrow | same elements and font; the card is the owner's slate swatch #3a3d44; digits roll one step each like a clock, the thumbnail squeezes, titles cross-fade (`projects-cards-sheet.png`, `projects-1440-hover.png`) | match |
| Visual transition | new visual wipes in from the right | clip-path wipe from the right, 820 ms (`projects-1440-wipe-mid.png`) | match |
| Project page | sticky info column, hero with play overlay, sections, two-column interface grid, next project | same (`project-exasol-studio-1440.png`) | match |
| Colours | cream page, dark text | black page, light text, as requested | differs on purpose |
| Moving visuals | looping videos and 3D scenes | both projects carry an original full-frame artwork (`references/artwork/*.html`, rendered at 2× to 3840×2400 JPEG q95, background filled edge to edge, bold panels and large type so it reads behind the list); the stage shows the still with a slow one-shot zoom | match in kind; artwork is illustrative, not a screenshot of the products |

## Responsive
- 390px homepage: bubbles wrap inside the viewport (`home-390.png`).
- 390px inner pages: sticky top bar with a no-JavaScript `<details>` menu; the project list scrolls horizontally with snap points above the stage; case-study columns stack. Earlier overflow at 390px was fixed by `minmax(0, 1fr)` grid tracks and `min-width: 0` on the columns.

## Accessibility and motion
- Skip link, semantic landmarks, `aria-current` on navigation, keyboard selection in the explorer (arrow keys, focus), visible focus rings.
- `prefers-reduced-motion` and the Appearance "reduced" preset show all bubbles at once and disable stage transitions.
- Without JavaScript the full conversation is visible server-rendered.

## Open items
- Real project media (screenshots, short loops) and a profile photo are needed for the intended visual weight.
- The admin "N" badge in the bottom-left of captures is the Next.js development overlay; it does not exist in production builds.
