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
}

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
}

const allowed: { [K in keyof ThemeSettings]: readonly ThemeSettings[K][] } = {
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
  for (const key of Object.keys(allowed) as (keyof ThemeSettings)[]) {
    const value = input[key]
    if (typeof value === 'string' && (allowed[key] as readonly string[]).includes(value)) {
      ;(out as Record<string, string>)[key] = value
    }
  }
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
