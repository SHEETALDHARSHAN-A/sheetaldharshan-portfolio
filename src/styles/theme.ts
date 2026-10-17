/**
 * Appearance presets map to data attributes on <html>. The CSS in globals.css reads them.
 * Only values listed here are ever applied, so CMS input can never inject arbitrary CSS.
 */
export type ThemeSettings = {
  theme: 'dark' | 'light'
  accent: 'blue' | 'orange' | 'green' | 'violet' | 'neutral'
  fontPreset: 'inter' | 'geist' | 'system'
  headingScale: 'compact' | 'regular' | 'large'
  spacing: 'tight' | 'regular' | 'airy'
  radius: 'pill' | 'rounded' | 'square'
  linkStyle: 'underline' | 'plain'
  bubbleStyle: 'pill' | 'rounded'
  animationIntensity: 'reduced' | 'normal' | 'expressive'
  animationSpeed: 'slow' | 'normal' | 'fast'
  projectDisplayStyle: 'explorer' | 'grid'
  /** Custom colours from the admin (#rrggbb only); empty keys keep the preset. */
  colors: Partial<Record<'background' | 'surface' | 'text' | 'muted' | 'accent' | 'line', string>>
  bodyFont: keyof typeof BODY_FONTS | 'preset'
  headingFont: keyof typeof HEADING_FONTS
}

/** Fonts the admin can pick, loaded from Google Fonts only when chosen. */
export const BODY_FONTS = {
  'ibm-plex-sans': { family: 'IBM Plex Sans', query: 'IBM+Plex+Sans:wght@400;500;600;700' },
  'dm-sans': { family: 'DM Sans', query: 'DM+Sans:wght@400;500;600;700' },
  manrope: { family: 'Manrope', query: 'Manrope:wght@400;500;600;700' },
  'work-sans': { family: 'Work Sans', query: 'Work+Sans:wght@400;500;600;700' },
  'source-sans-3': { family: 'Source Sans 3', query: 'Source+Sans+3:wght@400;500;600;700' },
} as const
export const HEADING_FONTS = {
  'barlow-condensed': { family: 'Barlow Condensed', query: '' },
  oswald: { family: 'Oswald', query: 'Oswald:wght@300;400;500;600;700' },
  'bebas-neue': { family: 'Bebas Neue', query: 'Bebas+Neue' },
  anton: { family: 'Anton', query: 'Anton' },
  'archivo-narrow': { family: 'Archivo Narrow', query: 'Archivo+Narrow:wght@400;500;600;700' },
  'inter-tight': { family: 'Inter Tight', query: 'Inter+Tight:wght@300;400;500;600;700' },
} as const

export const HEX = /^#[0-9a-fA-F]{6}$/

export const defaultTheme: ThemeSettings = {
  theme: 'dark',
  accent: 'blue',
  fontPreset: 'inter',
  headingScale: 'regular',
  spacing: 'regular',
  radius: 'pill',
  linkStyle: 'underline',
  bubbleStyle: 'pill',
  animationIntensity: 'normal',
  animationSpeed: 'normal',
  projectDisplayStyle: 'explorer',
  colors: {},
  bodyFont: 'preset',
  headingFont: 'barlow-condensed',
}

const allowed: { [K in Exclude<keyof ThemeSettings, 'colors' | 'bodyFont' | 'headingFont'>]: readonly ThemeSettings[K][] } = {
  theme: ['dark', 'light'],
  accent: ['blue', 'orange', 'green', 'violet', 'neutral'],
  fontPreset: ['inter', 'geist', 'system'],
  headingScale: ['compact', 'regular', 'large'],
  spacing: ['tight', 'regular', 'airy'],
  radius: ['pill', 'rounded', 'square'],
  linkStyle: ['underline', 'plain'],
  bubbleStyle: ['pill', 'rounded'],
  animationIntensity: ['reduced', 'normal', 'expressive'],
  animationSpeed: ['slow', 'normal', 'fast'],
  projectDisplayStyle: ['explorer', 'grid'],
}

/** Validate a loosely typed Appearance document against the whitelist. */
export function resolveTheme(input: Partial<Record<keyof ThemeSettings, unknown>> | null | undefined): ThemeSettings {
  const out = { ...defaultTheme }
  if (!input) return out
  for (const key of Object.keys(allowed) as (keyof typeof allowed)[]) {
    const value = input[key]
    if (typeof value === 'string' && (allowed[key] as readonly string[]).includes(value)) {
      ;(out as Record<string, unknown>)[key] = value
    }
  }
  const raw = input as Record<string, unknown>
  const colors: ThemeSettings['colors'] = {}
  for (const [key, field] of [['background', 'colorBackground'], ['surface', 'colorSurface'], ['text', 'colorText'], ['muted', 'colorMuted'], ['accent', 'colorAccent'], ['line', 'colorLine']] as const) {
    const v = raw[field]
    if (typeof v === 'string' && HEX.test(v)) colors[key] = v
  }
  out.colors = colors
  if (typeof raw.bodyFont === 'string' && raw.bodyFont in BODY_FONTS) out.bodyFont = raw.bodyFont as ThemeSettings['bodyFont']
  if (typeof raw.headingFont === 'string' && raw.headingFont in HEADING_FONTS) out.headingFont = raw.headingFont as ThemeSettings['headingFont']
  return out
}

export function themeAttributes(theme: ThemeSettings): Record<string, string> {
  return {
    'data-theme': theme.theme,
    'data-accent': theme.accent,
    'data-font': theme.fontPreset,
    'data-heading': theme.headingScale,
    'data-spacing': theme.spacing,
    'data-radius': theme.radius,
    'data-links': theme.linkStyle,
    'data-bubbles': theme.bubbleStyle,
    'data-motion': theme.animationIntensity,
    'data-speed': theme.animationSpeed,
  }
}

/**
 * CSS for the admin's custom colours and fonts. Values were validated above (#rrggbb and whitelisted
 * font keys), so nothing arbitrary reaches the stylesheet. The doubled :root outranks the presets.
 */
export function themeCss(theme: ThemeSettings): string {
  const c = theme.colors
  const vars: string[] = []
  if (c.background) vars.push(`--bg: ${c.background}`, `--bg-elevated: color-mix(in srgb, ${c.background} 94%, #fff)`)
  if (c.surface) vars.push(`--surface: ${c.surface}`, `--surface-hover: color-mix(in srgb, ${c.surface} 88%, #fff)`, `--surface-strong: color-mix(in srgb, ${c.surface} 80%, #fff)`)
  if (c.text) vars.push(`--text: ${c.text}`, `--text-soft: color-mix(in srgb, ${c.text} 80%, transparent)`)
  if (c.muted) vars.push(`--muted: ${c.muted}`, `--faint: color-mix(in srgb, ${c.muted} 65%, transparent)`)
  if (c.accent) vars.push(`--accent: ${c.accent}`, `--accent-soft: color-mix(in srgb, ${c.accent} 18%, transparent)`)
  if (c.line) vars.push(`--line: ${c.line}`, `--line-strong: color-mix(in srgb, ${c.line} 100%, #fff 12%)`)
  if (theme.bodyFont !== 'preset') vars.push(`--font-sans: '${BODY_FONTS[theme.bodyFont].family}', -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif`)
  if (theme.headingFont !== 'barlow-condensed') vars.push(`--font-condensed: '${HEADING_FONTS[theme.headingFont].family}', 'Arial Narrow', Impact, sans-serif`)
  return vars.length ? `:root:root:root { ${vars.join('; ')}; }` : ''
}

/** Google Fonts stylesheet for any chosen non-default fonts, or null. */
export function themeFontsHref(theme: ThemeSettings): string | null {
  const q = [theme.bodyFont !== 'preset' ? BODY_FONTS[theme.bodyFont].query : '', HEADING_FONTS[theme.headingFont].query].filter(Boolean)
  return q.length ? `https://fonts.googleapis.com/css2?${q.map((x) => `family=${x}`).join('&')}&display=swap` : null
}
