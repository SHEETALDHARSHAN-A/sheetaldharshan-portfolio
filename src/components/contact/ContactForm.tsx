'use client'

import { useEffect, useRef, useState } from 'react'
import { checkAnswer, fillIn, type ContactField, type ContactSettings } from '@/utilities/contactFields'
import { sendMessage } from './send'

/** The Contact page form, built from the questions set in the admin, with inline checks and a thank-you. */
export function ContactForm({ settings, email }: { settings: ContactSettings; email?: string }) {
  const { fields } = settings
  const startedAt = useRef(0)
  const [round, setRound] = useState(0)
  const [choices, setChoices] = useState<Record<string, string>>(() => Object.fromEntries(fields.filter((f) => f.type === 'choice' && f.options[0]).map((f) => [f.key, f.options[0]])))
  const [lengths, setLengths] = useState<Record<string, number>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [problem, setProblem] = useState('')
  const [sent, setSent] = useState<Record<string, string> | null>(null)

  useEffect(() => {
    startedAt.current = Date.now()
  }, [round])

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const answers: Record<string, string> = {}
    const local: Record<string, string> = {}
    for (const f of fields) {
      const raw = f.type === 'choice' ? (choices[f.key] ?? '') : String(form.get(f.key) ?? '')
      const result = checkAnswer(f, raw)
      if (result.ok) answers[f.key] = result.value
      else local[f.key] = result.error
    }
    setErrors(local)
    if (Object.keys(local).length) return
    setStatus('sending')
    setProblem('')
    const result = await sendMessage(answers, { startedAt: startedAt.current, website: String(form.get('website') ?? '') })
    if (result.ok) {
      setSent(answers)
      setStatus('sent')
      return
    }
    if (result.errors) setErrors(result.errors)
    setProblem(result.error ?? '')
    setStatus('error')
  }

  if (status === 'sent' && sent) {
    return (
      <div className="cf-done" role="status">
        <span className="cf-done-mark" aria-hidden="true">
          ✓
        </span>
        <h2>Message sent</h2>
        <p>{fillIn(settings.doneMessage, sent, fields)}</p>
        <button
          type="button"
          className="btn ghost"
          onClick={() => {
            setStatus('idle')
            setSent(null)
            setLengths({})
            setRound((r) => r + 1)
          }}
        >
          Send another message
        </button>
      </div>
    )
  }

  const input = (f: ContactField) => {
    const common = { name: f.key, placeholder: f.placeholder, 'aria-invalid': Boolean(errors[f.key]) }
    if (f.type === 'textarea')
      return <textarea {...common} rows={6} maxLength={5000} onChange={(e) => setLengths((l) => ({ ...l, [f.key]: e.target.value.length }))} />
    const kind = { name: { type: 'text', autoComplete: 'name' }, email: { type: 'email', autoComplete: 'email' }, phone: { type: 'tel', autoComplete: 'tel' }, text: { type: 'text', autoComplete: 'off' } }[f.type as 'name' | 'email' | 'phone' | 'text'] ?? { type: 'text' }
    return <input {...common} {...kind} maxLength={f.type === 'email' ? 200 : 300} />
  }

  // Short fields sit two to a row; choices and long text take the full width.
  const pairable = (f: ContactField) => f.type !== 'textarea' && f.type !== 'choice'

  return (
    <form className="cf" onSubmit={submit} noValidate>
      {fields.map((f) =>
        f.type === 'choice' ? (
          <fieldset key={f.key} className="cf-topics">
            <legend>
              {f.label}
              {f.required ? '' : <small> (optional)</small>}
            </legend>
            <div className="cf-chips">
              {f.options.map((o) => (
                <label key={o} className="cf-chip" data-on={choices[f.key] === o ? 'true' : undefined}>
                  <input type="radio" name={f.key} value={o} checked={choices[f.key] === o} onChange={() => setChoices((c) => ({ ...c, [f.key]: o }))} />
                  {o}
                </label>
              ))}
            </div>
            {errors[f.key] ? <em className="cf-error" role="alert">{errors[f.key]}</em> : null}
          </fieldset>
        ) : (
          <label key={f.key} className={`cf-field${pairable(f) ? ' cf-half' : ''}`}>
            <span>
              {f.label}
              <small>{f.type === 'textarea' && lengths[f.key] ? `${lengths[f.key].toLocaleString()} / 5,000` : f.required ? '' : 'optional'}</small>
            </span>
            {input(f)}
            {errors[f.key] ? <em role="alert">{errors[f.key]}</em> : null}
          </label>
        ),
      )}

      {/* A field only bots fill in. */}
      <label className="cf-trap" aria-hidden="true">
        Website <input name="website" tabIndex={-1} autoComplete="off" />
      </label>

      <div className="cf-foot">
        <button type="submit" className="btn cf-send" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : 'Send message'}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M5 12h14m-6-6 6 6-6 6" />
          </svg>
        </button>
        <p className="cf-note">
          {problem ? (
            <span role="alert" className="cf-problem">
              {problem}
              {email ? (
                <>
                  {' '}
                  You can also email <a href={`mailto:${email}`}>{email}</a>.
                </>
              ) : null}
            </span>
          ) : (
            settings.formNote
          )}
        </p>
      </div>
    </form>
  )
}
