'use client'

import { useForm, useFormFields } from '@payloadcms/ui'

type Colors = { background: string; surface: string; text: string; muted: string; accent: string; line: string }
type Theme = { name: string; note: string; dark: Colors; light: Colors }

const KEYS = ['background', 'surface', 'text', 'muted', 'accent', 'line'] as const
const field = (mode: 'dark' | 'light', key: (typeof KEYS)[number]) => `${mode === 'dark' ? 'color' : 'light'}${key[0].toUpperCase()}${key.slice(1)}`
const FIELDS = (['dark', 'light'] as const).flatMap((m) => KEYS.map((k) => ({ path: field(m, k), mode: m, key: k })))

/** Each theme has a dark and a light version, so the visitor switch always has a matching pair. */
const THEMES: Theme[] = [
  {
    name: 'Yakudoo',
    note: 'Cream paper, ink and a red accent',
    dark: { background: '#1b1b1b', surface: '#262624', text: '#f1f2e9', muted: '#9b9c94', accent: '#ff3400', line: '#34342f' },
    light: { background: '#f1f2e9', surface: '#e5e6dc', text: '#1b1b1b', muted: '#6a6d6a', accent: '#ff3400', line: '#c7c8bf' },
  },
  {
    name: 'Midnight',
    note: 'Black and white with blue (the default)',
    dark: { background: '#000000', surface: '#1c1c1e', text: '#f2f2f2', muted: '#8a8a8e', accent: '#3d8bff', line: '#1f1f22' },
    light: { background: '#f3f2ee', surface: '#e6e5e0', text: '#121212', muted: '#6b6b6b', accent: '#2f6fec', line: '#d9d8d2' },
  },
  {
    name: 'Graphite',
    note: 'Cool greys with periwinkle',
    dark: { background: '#111214', surface: '#1e2024', text: '#ececec', muted: '#8b9099', accent: '#7c9cff', line: '#2b2e33' },
    light: { background: '#f4f5f7', surface: '#e8eaee', text: '#16181c', muted: '#6b717c', accent: '#4f6bed', line: '#d6d9df' },
  },
  {
    name: 'Forest',
    note: 'Deep greens',
    dark: { background: '#0d1210', surface: '#18211c', text: '#e8efe9', muted: '#8aa092', accent: '#3ecf8e', line: '#25302a' },
    light: { background: '#f2f6f3', surface: '#e3ece6', text: '#13201a', muted: '#5f7568', accent: '#1f9d63', line: '#cfdcd3' },
  },
  {
    name: 'Ember',
    note: 'Warm browns with orange',
    dark: { background: '#120d0b', surface: '#221915', text: '#f4ece6', muted: '#a8958a', accent: '#ff6a3d', line: '#33261f' },
    light: { background: '#faf4ef', surface: '#f0e6de', text: '#22160f', muted: '#846e60', accent: '#e8551f', line: '#e3d3c6' },
  },
  {
    name: 'Ocean',
    note: 'Navy and sky blue',
    dark: { background: '#07111c', surface: '#10202f', text: '#e6f0f7', muted: '#86a0b4', accent: '#38bdf8', line: '#1c3042' },
    light: { background: '#f1f7fb', surface: '#e1edf5', text: '#0d1b28', muted: '#5a7488', accent: '#0b8fd3', line: '#cbdbe7' },
  },
]

/** A small picture of the site in one mode: the sidebar, a heading, text, a card and a link. */
function Half({ c, label }: { c: Colors; label: string }) {
  return (
    <span style={{ display: 'grid', gridTemplateColumns: '28% 1fr', background: c.background, color: c.text, minHeight: 92 }}>
      <span style={{ borderRight: `1px solid ${c.line}`, padding: '8px 6px', display: 'grid', alignContent: 'start', gap: 4 }}>
        <span style={{ fontSize: 9, fontWeight: 800 }}>
          Aa<span style={{ color: c.accent }}>.</span>
        </span>
        <span style={{ height: 3, width: '80%', borderRadius: 2, background: c.accent }} />
        <span style={{ height: 3, width: '65%', borderRadius: 2, background: c.muted }} />
        <span style={{ height: 3, width: '70%', borderRadius: 2, background: c.muted }} />
      </span>
      <span style={{ padding: 8, display: 'grid', alignContent: 'start', gap: 5 }}>
        <span style={{ fontSize: 9, letterSpacing: '.08em', textTransform: 'uppercase', color: c.muted }}>{label}</span>
        <span style={{ height: 5, width: '75%', borderRadius: 2, background: c.text }} />
        <span style={{ height: 3, width: '90%', borderRadius: 2, background: c.muted, opacity: 0.7 }} />
        <span style={{ height: 14, width: '70%', borderRadius: 4, background: c.surface, border: `1px solid ${c.line}` }} />
        <span style={{ fontSize: 9, color: c.accent, textDecoration: 'underline' }}>link</span>
      </span>
    </span>
  )
}

/**
 * One-click colour themes for Site-wide → Theme. Picking one fills both the dark and the light colours
 * below; each can still be fine-tuned with its own picker or hex code. Save to apply.
 */
export function ThemePresets() {
  const { dispatchFields, setModified } = useForm()
  const current = useFormFields(([fields]) => FIELDS.map((f) => String(fields[f.path]?.value ?? '').toLowerCase()).join('|'))
  const values = current.split('|')

  const apply = (t: Theme | null) => {
    for (const f of FIELDS) dispatchFields({ type: 'UPDATE', path: f.path, value: t ? t[f.mode][f.key] : '' })
    setModified(true)
  }
  const active = THEMES.find((t) => FIELDS.every((f, i) => values[i] === t[f.mode][f.key].toLowerCase()))

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>Colour themes</div>
      <div style={{ fontSize: 13, color: 'var(--theme-elevation-500)', marginBottom: 12 }}>
        Each theme has a dark and a light version (left and right), so the visitor switch always looks right. Pick one, fine-tune any colour below, then Save.
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
        {THEMES.map((t) => {
          const on = active === t
          return (
            <button
              key={t.name}
              type="button"
              onClick={() => apply(t)}
              aria-pressed={on}
              style={{
                display: 'grid',
                padding: 0,
                overflow: 'hidden',
                textAlign: 'left',
                borderRadius: 10,
                cursor: 'pointer',
                background: 'var(--theme-elevation-50)',
                color: 'var(--theme-text)',
                border: `2px solid ${on ? t.light.accent : 'var(--theme-elevation-150)'}`,
                boxShadow: on ? `0 0 0 3px ${t.light.accent}33` : 'none',
              }}
            >
              <span style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                <Half c={t.dark} label="Dark" />
                <Half c={t.light} label="Light" />
              </span>
              <span style={{ display: 'grid', gap: 2, padding: '8px 10px' }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>
                  {t.name}
                  {on ? ' · in use' : ''}
                </span>
                <span style={{ fontSize: 11.5, color: 'var(--theme-elevation-500)' }}>{t.note}</span>
              </span>
            </button>
          )
        })}
        <button
          type="button"
          onClick={() => apply(null)}
          style={{ padding: 10, borderRadius: 10, cursor: 'pointer', border: '2px dashed var(--theme-elevation-200)', background: 'transparent', color: 'var(--theme-elevation-800)', fontSize: 13, fontWeight: 600 }}
        >
          Clear: back to the built-in colours
        </button>
      </div>
    </div>
  )
}
