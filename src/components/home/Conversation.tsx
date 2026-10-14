'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { ConversationMessage } from '@/data/site'

export function Conversation({ messages }: { messages: ConversationMessage[] }) {
  const [visibleCount, setVisibleCount] = useState(1)
  const [typing, setTyping] = useState(true)

  useEffect(() => {
    if (visibleCount >= messages.length) {
      setTyping(false)
      return
    }
    setTyping(true)
    const timer = window.setTimeout(() => setVisibleCount((count) => count + 1), messages[visibleCount]?.delay ?? 800)
    return () => window.clearTimeout(timer)
  }, [messages, visibleCount])

  return (
    <section className="conversation" aria-label="Introduction">
      <div className="conversation-topline"><span>01</span><span>INTRODUCTION</span><span className="topline-rule" /></div>
      <div className="conversation-stream">
        {messages.slice(0, visibleCount).map((message) => (
          <div className={`message-wrap ${message.tone ?? ''}`} key={message.id}>
            <div className="message-bubble">{message.content}</div>
            {message.links && (
              <div className="conversation-actions">
                {message.links.map((link) => <Link key={link.href} href={link.href}>{link.label}<span aria-hidden="true">↗</span></Link>)}
              </div>
            )}
          </div>
        ))}
        {typing && <div className="typing" aria-label="Typing"><span /><span /><span /></div>}
      </div>
      <p className="conversation-footnote">A small introduction, rendered one message at a time.</p>
    </section>
  )
}
