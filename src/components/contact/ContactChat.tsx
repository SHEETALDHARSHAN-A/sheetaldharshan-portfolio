'use client'

import { useEffect, useRef, useState } from 'react'
import { checkAnswer, fillIn, type ContactSettings } from '@/utilities/contactFields'
import { sendMessage } from './send'

type Line = { id: number; from: 'me' | 'you'; text: string }
const TYPING_MS = 650

/**
 * The Contact page as a conversation, in the homepage's bubble style. It asks the questions set in
 * the admin one at a time, checks each answer, and kindly asks again when one does not fit (say, a
 * sentence where a phone number should be) before confirming and sending.
 */
export function ContactChat({ settings, email: ownerEmail }: { settings: ContactSettings; email?: string }) {
  const { fields } = settings
  const [lines, setLines] = useState<Line[]>([])
  const [typing, setTyping] = useState(false)
  const [index, setIndex] = useState(0) // the question being asked; fields.length = confirm
  const [phase, setPhase] = useState<'asking' | 'confirm' | 'sending' | 'sent'>('asking')
  const [input, setInput] = useState('')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [round, setRound] = useState(0)
  const ids = useRef(0)
  const startedAt = useRef(0)
  const box = useRef<HTMLDivElement>(null)
  const field = useRef<HTMLTextAreaElement>(null)
  const timers = useRef<number[]>([])
  // An answer sent while the bot is still "typing" waits here instead of being lost.
  const queued = useRef<string[]>([])

  /** The bot "types", then says each line in turn. */
  const say = (...texts: string[]) => {
    const lines = texts.filter(Boolean)
    setTyping(true)
    lines.forEach((text, i) => {
      timers.current.push(
        window.setTimeout(() => {
          setLines((l) => [...l, { id: ++ids.current, from: 'me', text }])
          if (i === lines.length - 1) setTyping(false)
        }, TYPING_MS * (i + 1)),
      )
    })
  }
  const hear = (text: string) => setLines((l) => [...l, { id: ++ids.current, from: 'you', text }])

  useEffect(() => {
    startedAt.current = Date.now()
  }, [round])

  useEffect(() => {
    say(settings.greeting, fields[0]?.question ?? '')
    const t = timers.current
    return () => t.forEach((id) => window.clearTimeout(id))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- greet once, when the chat opens
  }, [])

  // Keep the newest bubble in view, and the cursor in the box.
  useEffect(() => {
    box.current?.scrollTo({ top: box.current.scrollHeight, behavior: 'smooth' })
    if (!typing) field.current?.focus({ preventScroll: true })
  }, [lines, typing])

  const restart = () => {
    timers.current.forEach((id) => window.clearTimeout(id))
    setLines([])
    setAnswers({})
    setIndex(0)
    setPhase('asking')
    setRound((r) => r + 1)
    say("No problem, let's start over.", fields[0]?.question ?? '')
  }

  /** "Ada Lovelace · ada@example.com · +91 …", then "Topic: …" lines, then the message in quotes. */
  const summary = (all: Record<string, string>) => {
    const filled = fields.filter((f) => all[f.key])
    const contact = filled.filter((f) => f.type === 'name' || f.type === 'email' || f.type === 'phone').map((f) => all[f.key])
    const human = (key: string) => key.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase())
    const rest = filled.filter((f) => f.type === 'choice' || f.type === 'text').map((f) => `${human(f.key)}: ${all[f.key]}`)
    const long = filled.filter((f) => f.type === 'textarea').map((f) => `“${all[f.key].length > 160 ? `${all[f.key].slice(0, 157)}…` : all[f.key]}”`)
    return [contact.join(' · '), ...rest, ...long].filter(Boolean).join('\n')
  }

  const send = async (all: Record<string, string>) => {
    setPhase('sending')
    say('Sending…')
    const result = await sendMessage(all, { startedAt: startedAt.current })
    if (result.ok) {
      setPhase('sent')
      say(fillIn(settings.doneMessage, all, fields))
      return
    }
    // The server disagreed with an answer: ask that question again.
    const wrong = fields.findIndex((f) => result.errors?.[f.key])
    if (wrong >= 0) {
      setIndex(wrong)
      setPhase('asking')
      say(result.errors![fields[wrong].key], fields[wrong].question)
      return
    }
    setPhase('confirm')
    say(result.error ?? 'It was not sent.', ownerEmail ? `Try again, or email me at ${ownerEmail}.` : 'Want to try again?')
  }

  const answer = (raw: string) => {
    const text = raw.trim()
    if (!text) return
    if (typing) {
      queued.current.push(text)
      setInput('')
      return
    }
    hear(text)
    setInput('')
    if (phase === 'confirm') {
      if (/^(y|yes|yeah|yep|sure|send|ok|okay|send it)\b/i.test(text)) void send(answers)
      else if (/^(n|no|edit|change|start over|restart)\b/i.test(text)) restart()
      else say('Just say "send it", or "start over" to change something.')
      return
    }
    const current = fields[index]
    if (!current) return
    const result = checkAnswer(current, text, { chat: true })
    if (!result.ok) {
      say(result.error)
      return
    }
    const next = { ...answers, [current.key]: result.value }
    setAnswers(next)
    const reply = result.value ? fillIn(current.reply ?? '', next, fields, result.value) : 'No problem.'
    if (index + 1 < fields.length) {
      setIndex(index + 1)
      say(reply, fields[index + 1].question)
    } else {
      setIndex(fields.length)
      setPhase('confirm')
      say(reply, `Here's what I'll send:\n${summary(next)}`, 'Shall I send it?')
    }
  }

  // Answer anything typed while the bot was still talking, one at a time, as soon as it has finished.
  useEffect(() => {
    if (typing) return
    const text = queued.current.shift()
    if (text !== undefined) answer(text)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs when the bot stops typing
  }, [typing])

  const current = phase === 'asking' ? fields[index] : undefined
  const chips: { label: string; onPick: () => void }[] = typing
    ? []
    : phase === 'confirm'
      ? [
          { label: 'Send it', onPick: () => answer('Send it') },
          { label: 'Start over', onPick: () => answer('Start over') },
        ]
      : phase === 'sent'
        ? [{ label: 'Send another message', onPick: restart }]
        : current?.type === 'choice'
          ? current.options.map((o) => ({ label: o, onPick: () => answer(o) }))
          : current && !current.required
            ? [{ label: 'Skip', onPick: () => answer('Skip') }]
            : []

  const placeholder =
    phase === 'confirm' ? '"send it" or "start over"' : current ? (current.type === 'choice' ? 'Or type it in a few words' : (current.placeholder ?? current.label) + (current.required ? '' : ', or "skip"')) : ''

  return (
    <div className="cc">
      <div className="cc-lines" ref={box} aria-live="polite">
        {lines.map((l, i) => (
          <div key={l.id} className={`cc-line cc-${l.from}`}>
            <span className={`cc-bubble${lines[i + 1]?.from !== l.from ? ' cc-tail' : ''}`}>{l.text}</span>
          </div>
        ))}
        {typing ? (
          <div className="cc-line cc-me">
            <span className="cc-bubble cc-tail cc-typing" aria-label="Typing">
              <b />
              <b />
              <b />
            </span>
          </div>
        ) : null}
      </div>
      {chips.length ? (
        <div className="cc-chips">
          {chips.map((c) => (
            <button key={c.label} type="button" className="cc-chip" onClick={c.onPick}>
              {c.label}
            </button>
          ))}
        </div>
      ) : null}
      {phase === 'asking' || phase === 'confirm' ? (
        <form
          className="cc-input"
          onSubmit={(e) => {
            e.preventDefault()
            answer(input)
          }}
        >
          <textarea
            ref={field}
            value={input}
            rows={current?.type === 'textarea' ? 3 : 1}
            placeholder={placeholder}
            aria-label={current?.question ?? 'Your reply'}
            maxLength={current?.type === 'textarea' ? 5000 : 300}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                answer(input)
              }
            }}
          />
          <button type="submit" aria-label="Send" disabled={!input.trim()}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <path d="M12 19V5m0 0-6 6m6-6 6 6" />
            </svg>
          </button>
        </form>
      ) : null}
    </div>
  )
}
