import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from './Button'
import { getErrorMessage, useAiChatMutation } from '../store/api'
import type { AiChatMessage } from '../types'

const SUGGESTIONS = [
  'How many projects do I have?',
  'Create a project: Website Redesign',
  'How many tasks do I have?',
]

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function AiSidebar() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Hi — I’m TaskFlow AI (local Ollama / Qwen). Ask me to create projects, assign tasks, or check counts.',
    },
  ])
  const [aiChat, { isLoading }] = useAiChatMutation()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, open, isLoading])

  async function sendMessage(text: string) {
    const trimmed = text.trim()
    if (!trimmed || isLoading) return

    setInput('')
    setMessages((prev) => [...prev, { id: newId(), role: 'user', content: trimmed }])

    try {
      const result = await aiChat({ message: trimmed }).unwrap()
      setMessages((prev) => [
        ...prev,
        { id: newId(), role: 'assistant', content: result.reply },
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: newId(),
          role: 'assistant',
          content: getErrorMessage(err) || 'Could not get an AI reply. Is Ollama running?',
        },
      ])
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    void sendMessage(input)
  }

  return (
    <>
      {/* Floating AI button — right edge */}
      <Button
        type="button"
        variant="ink"
        aria-label={open ? 'Close AI chat' : 'Open AI chat'}
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-40 grid h-12 w-12 place-items-center rounded-2xl p-0 shadow-lg"
      >
        {open ? (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 3l1.2 3.6L17 8l-3.8 1.4L12 13l-1.2-3.6L7 8l3.8-1.4L12 3Z" />
            <path d="M5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14Z" />
            <path d="M17 14l.7 1.8L19.5 16l-1.8.7L17 18.5l-.7-1.8L14.5 16l1.8-.7L17 14Z" />
          </svg>
        )}
      </Button>

      {open && (
        <button
          type="button"
          aria-label="Close AI panel backdrop"
          className="fixed inset-0 z-40 bg-black/20 lg:pointer-events-none lg:bg-transparent"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={[
          'fixed inset-y-0 right-0 z-50 flex w-[min(100vw,360px)] flex-col border-l border-black/[0.06] bg-white shadow-[-12px_0_40px_-20px_rgba(0,0,0,0.25)] transition-transform duration-300',
          open ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
      >
        <div className="flex items-center justify-between border-b border-black/[0.06] px-4 py-3.5">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink">TaskFlow AI</p>
            <p className="text-[11px] text-black/40">Local Ollama · qwen3:4b</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="grid h-8 w-8 place-items-center rounded-lg bg-[#f3f3f3] px-0"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </Button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={[
                'max-w-[92%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                msg.role === 'user'
                  ? 'ml-auto bg-ink text-white'
                  : 'mr-auto bg-[#f6f6f6] text-ink',
              ].join(' ')}
            >
              {msg.content}
            </div>
          ))}
          {isLoading && (
            <div className="mr-auto rounded-2xl bg-[#f6f6f6] px-3.5 py-2.5 text-sm text-black/45">
              Thinking…
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-black/[0.06] px-4 py-3">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((tip) => (
              <Button
                key={tip}
                type="button"
                variant="secondary"
                size="sm"
                disabled={isLoading}
                onClick={() => void sendMessage(tip)}
                className="rounded-full border-transparent bg-[#f3f3f3] px-2.5 py-1 text-[11px] font-medium text-ink-soft"
              >
                {tip}
              </Button>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask something or give a command…"
              disabled={isLoading}
              className="min-w-0 flex-1 rounded-xl border border-black/[0.08] bg-[#f6f6f6] px-3 py-2.5 text-sm outline-none focus:border-black/20 focus:bg-white"
            />
            <Button type="submit" variant="ink" disabled={isLoading || !input.trim()} className="px-3">
              Send
            </Button>
          </form>
        </div>
      </aside>
    </>
  )
}
