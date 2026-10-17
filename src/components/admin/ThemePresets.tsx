'use client'

import { useForm, useFormFields } from '@payloadcms/ui'

type Palette = { name: string; mode: 'dark' | 'light'; colors: Record<string, string> }

const FIELDS = ['colorBackground', 'colorSurface', 'colorText', 'colorMuted', 'colorAccent', 'colorLine'] as const

const PALETTES: Palette[] = [
  { name: 'Midnight (current look)', mode: 'dark', colors: { colorBackground: '#000000', colorSurface: '#1c1c1e', colorText: '#f2f2f2', colorMuted: '#8a8a8e', colorAccent: '#3d8bff', colorLine: '#1f1f22' } },
  { name: 'Graphite', mode: 'dark', colors: { colorBackground: '#111214', colorSurface: '#1e2024', colorText: '#ececec', colorMuted: '#8b9099', colorAccent: '#7c9cff', colorLine: '#2b2e33' } },
  { name: 'Forest', mode: 'dark', colors: { colorBackground: '#0d1210', colorSurface: '#18211c', colorText: '#e8efe9', colorMuted: '#8aa092', colorAccent: '#3ecf8e', colorLine: '#25302a' } },
  { name: 'Ember', mode: 'dark', colors: { colorBackground: '#120d0b', colorSurface: '#221915', colorText: '#f4ece6', colorMuted: '#a8958a', colorAccent: '#ff6a3d', colorLine: '#33261f' } },
  { name: 'Ocean', mode: 'dark', colors: { colorBackground: '#07111c', colorSurface: '#10202f', colorText: '#e6f0f7', colorMuted: '#86a0b4', colorAccent: '#38bdf8', colorLine: '#1c3042' } },
  { name: 'Paper (light)', mode: 'light', colors: { colorBackground: '#f6f4ef', colorSurface: '#ebe8e1', colorText: '#1a1a1a', colorMuted: '#6b6b6b', colorAccent: '#2f6fec', colorLine: '#dcd8cf' } },
]

/**
 * One-click colour themes for Site-wide → Theme. Picking one fills every colour field below (and the
 * light/dark setting); each colour can still be fine-tuned with its own picker or hex code. Save to apply.
 */
export function ThemePresets() {
  const { dispatchFields, setModified } = useForm()
  const current = useFormFields(([fields]) => FIELDS.map((f) => (fields[f]?.value as string | undefined) ?? ''))

  const apply = (p: Palette | null) => {
    for (const f of FIELDS) dispatchFields({ type: 'UPDATE', path: f, value: p ? p.colors[f] : '' })
    if (p) dispatchFields({ type: 'UPDATE', path: 'theme', value: p.mode })
    setModified(true)
  }
  const active = PALETTES.find((p) => FIELDS.every((f, i) => p.colors[f].toLowerCase() === current[i]?.toLowerCase()))

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>Colour themes</div>
      <div style={{ fontSize: 13, color: 'var(--theme-elevation-500)', marginBottom: 12 }}>
        Pick one to fill all the colours below, adjust any of them if you like, then press Save.
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
        {PALETTES.map((p) => (
          <button
            key={p.name}
            type="button"
            onClick={() => apply(p)}
            style={{
              display: 'grid',
              gap: 8,
              padding: 10,
              textAlign: 'left',
              borderRadius: 10,
              cursor: 'pointer',
              background: p.colors.colorBackground,
              color: p.colors.colorText,
              border: `2px solid ${active === p ? p.colors.colorAccent : p.colors.colorLine}`,
              boxShadow: active === p ? `0 0 0 3px ${p.colors.colorAccent}33` : 'none',
            }}
          >
            <span style={{ display: 'flex', gap: 4 }}>
              {[p.colors.colorSurface, p.colors.colorText, p.colors.colorMuted, p.colors.colorAccent].map((c) => (
                <span key={c} style={{ width: 18, height: 18, borderRadius: 5, background: c, border: '1px solid rgba(127,127,127,.35)' }} />
              ))}
            </span>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</span>
            <span style={{ fontSize: 11, color: p.colors.colorAccent }}>Link colour</span>
          </button>
        ))}
        <button
          type="button"
          onClick={() => apply(null)}
          style={{ padding: 10, borderRadius: 10, cursor: 'pointer', border: '2px dashed var(--theme-elevation-200)', background: 'transparent', color: 'var(--theme-elevation-800)', fontSize: 13, fontWeight: 600 }}
        >
          Reset to the preset colours
        </button>
      </div>
    </div>
  )
}
