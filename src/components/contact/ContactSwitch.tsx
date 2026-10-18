'use client'

import { useEffect, useState } from 'react'
import type { ContactSettings } from '@/utilities/contactFields'
import { ContactChat } from './ContactChat'
import { ContactForm } from './ContactForm'

// v2: the default became the form, so choices remembered before that are not reused.
const KEY = 'contact-mode-v2'

/** Chat, form, or a switch between them (set in the admin). A visitor's choice is remembered. */
export function ContactSwitch({ settings, email }: { settings: ContactSettings; email?: string }) {
  const [mode, setMode] = useState<'chat' | 'form'>(settings.mode === 'both' ? settings.firstMode : settings.mode)
  useEffect(() => {
    if (settings.mode !== 'both') return
    try {
      const saved = window.localStorage.getItem(KEY)
      if (saved === 'chat' || saved === 'form') setMode(saved)
    } catch {
      /* storage blocked */
    }
  }, [settings.mode])
  const pick = (next: 'chat' | 'form') => {
    setMode(next)
    try {
      window.localStorage.setItem(KEY, next)
    } catch {
      /* storage blocked */
    }
  }
  return (
    <div className="cs">
      {settings.mode === 'both' ? (
        <div className="cs-switch" role="tablist" aria-label="How would you like to write?">
          {(['chat', 'form'] as const).map((m) => (
            <button key={m} type="button" role="tab" aria-selected={mode === m} className="cs-tab" onClick={() => pick(m)}>
              {m === 'chat' ? 'Chat' : 'Form'}
            </button>
          ))}
          <span className="cs-pill" data-mode={mode} aria-hidden="true" />
        </div>
      ) : null}
      <section className="contact-card" aria-label="Send a message">
        {mode === 'chat' ? <ContactChat settings={settings} email={email} /> : <ContactForm settings={settings} email={email} />}
      </section>
    </div>
  )
}
