'use client'

import { FieldDescription, FieldLabel, useField } from '@payloadcms/ui'
import type { TextFieldClientComponent } from 'payload'

/** A colour picker next to the hex code. Empty means "use the theme default". */
export const ColorField: TextFieldClientComponent = ({ path, field }) => {
  const { value, setValue, showError, errorMessage } = useField<string>({ path })
  const label = typeof field.label === 'string' ? field.label : field.name
  const description = typeof field.admin?.description === 'string' ? field.admin.description : undefined
  return (
    <div className="field-type text" style={{ marginBottom: 24 }}>
      <FieldLabel label={label} path={path} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <input
          type="color"
          aria-label={`${label} picker`}
          value={value && /^#[0-9a-fA-F]{6}$/.test(value) ? value : '#000000'}
          onChange={(e) => setValue(e.target.value)}
          style={{ width: 44, height: 36, padding: 2, border: '1px solid var(--theme-elevation-150)', borderRadius: 6, background: 'transparent', cursor: 'pointer' }}
        />
        <input
          type="text"
          value={value ?? ''}
          placeholder="Theme default"
          onChange={(e) => setValue(e.target.value.trim())}
          style={{ flex: 1, height: 36, padding: '0 10px', fontFamily: 'monospace', border: '1px solid var(--theme-elevation-150)', borderRadius: 6, background: 'var(--theme-input-bg)', color: 'var(--theme-text)' }}
        />
        {value ? (
          <button type="button" onClick={() => setValue('')} style={{ height: 36, padding: '0 12px', border: '1px solid var(--theme-elevation-150)', borderRadius: 6, background: 'transparent', color: 'var(--theme-elevation-800)', cursor: 'pointer' }}>
            Reset
          </button>
        ) : null}
      </div>
      {showError ? <div style={{ color: 'var(--theme-error-500)', marginTop: 4, fontSize: 13 }}>{errorMessage}</div> : null}
      {description ? <FieldDescription description={description} path={path} /> : null}
    </div>
  )
}
