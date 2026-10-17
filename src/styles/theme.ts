/**
 * Appearance presets map to data attributes on <html>. The CSS in globals.css reads them.
 * Only values listed here are ever applied, so CMS input can never inject arbitrary CSS.
 */
export type ThemeSettings = {
  /** The default mode; 'system' follows the visitor's device. */
  theme: 'dark' | 'light' | 'system'
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
  /** Custom colours from the admin (#rrggbb only), for dark and for light mode; empty keys keep the preset. */
  colors: Palette
  lightColors: Palette
  /** Show the visitor light/dark switch in the sidebar. */
  toggle: boolean
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

type Palette = Partial<Record<'background' | 'surface' | 'text' | 'muted' | 'accent' | 'line', string>>

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
  lightColors: {},
  toggle: true,
  bodyFont: 'preset',
  headingFont: 'barlow-condensed',
}

const allowed: { [K in Exclude<keyof ThemeSettings, 'colors' | 'lightColors' | 'toggle' | 'bodyFont' | 'headingFont'>]: readonly ThemeSettings[K][] } = {
  theme: ['dark', 'light', 'system'],
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
  const palette = (prefix: 'color' | 'light'): Palette => {
    const colors: Palette = {}
    for (const key of ['background', 'surface', 'text', 'muted', 'accent', 'line'] as const) {
      const v = raw[`${prefix}${key[0].toUpperCase()}${key.slice(1)}`]
      if (typeof v === 'string' && HEX.test(v)) colors[key] = v
    }
    return colors
  }
  out.colors = palette('color')
  out.lightColors = palette('light')
  out.toggle = raw.themeToggle !== false
  if (typeof raw.bodyFont === 'string' && raw.bodyFont in BODY_FONTS) out.bodyFont = raw.bodyFont as ThemeSettings['bodyFont']
  if (typeof raw.headingFont === 'string' && raw.headingFont in HEADING_FONTS) out.headingFont = raw.headingFont as ThemeSettings['headingFont']
  return out
}

export function themeAttributes(theme: ThemeSettings): Record<string, string> {
  return {
    // "system" renders dark on the server; the head script switches it before the first paint.
    'data-theme': theme.theme === 'system' ? 'dark' : theme.theme,
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
function paletteVars(c: Palette, mode: 'dark' | 'light'): string[] {
  // Hover and stronger shades go lighter in dark mode and darker in light mode.
  const lift = mode === 'dark' ? '#fff' : '#000'
  const vars: string[] = []
  if (c.background) vars.push(`--bg: ${c.background}`, `--bg-elevated: color-mix(in srgb, ${c.background} 94%, #fff)`)
  if (c.surface) vars.push(`--surface: ${c.surface}`, `--surface-hover: color-mix(in srgb, ${c.surface} 92%, ${lift})`, `--surface-strong: color-mix(in srgb, ${c.surface} 85%, ${lift})`)
  if (c.text) vars.push(`--text: ${c.text}`, `--text-soft: color-mix(in srgb, ${c.text} 80%, transparent)`)
  if (c.muted) vars.push(`--muted: ${c.muted}`, `--faint: color-mix(in srgb, ${c.muted} 65%, transparent)`)
  if (c.accent) vars.push(`--accent: ${c.accent}`, `--accent-soft: color-mix(in srgb, ${c.accent} 18%, transparent)`)
  if (c.line) vars.push(`--line: ${c.line}`, `--line-strong: color-mix(in srgb, ${c.line} 85%, ${mode === 'dark' ? '#fff' : '#000'})`)
  return vars
}

export function themeCss(theme: ThemeSettings): string {
  const vars: string[] = []
  const css: string[] = []
  const dark = paletteVars(theme.colors, 'dark')
  const light = paletteVars(theme.lightColors, 'light')
  if (dark.length) css.push(`:root:root:root[data-theme='dark'] { ${dark.join('; ')}; }`)
  if (light.length) css.push(`:root:root:root[data-theme='light'] { ${light.join('; ')}; }`)
  if (theme.bodyFont !== 'preset') vars.push(`--font-sans: '${BODY_FONTS[theme.bodyFont].family}', -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif`)
  if (theme.headingFont !== 'barlow-condensed') vars.push(`--font-condensed: '${HEADING_FONTS[theme.headingFont].family}', 'Arial Narrow', Impact, sans-serif`)
  if (vars.length) css.push(`:root:root:root { ${vars.join('; ')}; }`)
  return css.join('\n')
}

/**
 * Runs in <head> before the first paint: applies the visitor's saved light/dark choice (when the
 * switch is on) or the device setting (default mode "system"), so the page never flashes the wrong mode.
 */
export function themeBootScript(theme: ThemeSettings): string {
  const def = JSON.stringify(theme.theme)
  return `(function(){try{var d=document.documentElement,s=${theme.toggle ? "localStorage.getItem('site-theme')" : 'null'},m=${def};var t=s==='dark'||s==='light'?s:m==='system'?(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'):m;d.dataset.theme=t;d.style.colorScheme=t;var w=+localStorage.getItem('site-sidebar-w');if(w>=200&&w<=420)d.style.setProperty('--sidebar-w',w+'px')}catch(e){}})()`
}

/** Google Fonts stylesheet for any chosen non-default fonts, or null. */
export function themeFontsHref(theme: ThemeSettings): string | null {
  const q = [theme.bodyFont !== 'preset' ? BODY_FONTS[theme.bodyFont].query : '', HEADING_FONTS[theme.headingFont].query].filter(Boolean)
  return q.length ? `https://fonts.googleapis.com/css2?${q.map((x) => `family=${x}`).join('&')}&display=swap` : null
}
