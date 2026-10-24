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
    if (!open) return
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open, isLoading])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

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
      <Button
        type="button"
        variant="ink"
        aria-label={open ? 'Close AI chat' : 'Open AI chat'}
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-2xl p-0 shadow-lg shadow-ink/25 ring-4 ring-white/80"
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
          className="animate-overlay-in fixed inset-0 z-40 bg-[#0f1c24]/35 backdrop-blur-[2px]"
          onClick={() => setOpen(false)}
        />
      )}

      {open && (
        <aside
          className="animate-drawer-in shadow-drawer fixed inset-y-0 right-0 z-50 flex w-[min(100vw,400px)] flex-col overflow-hidden bg-white sm:rounded-l-[28px]"
          role="dialog"
          aria-modal="true"
          aria-label="TaskFlow AI chat"
        >
          <div className="relative overflow-hidden border-b border-black/[0.05] px-5 pb-4 pt-5">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#0073ea]/10 via-transparent to-[#14b8a6]/10" />
            <div className="relative flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-ink text-white shadow-md shadow-ink/20">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M12 3l1.2 3.6L17 8l-3.8 1.4L12 13l-1.2-3.6L7 8l3.8-1.4L12 3Z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="font-display text-base font-bold tracking-tight text-ink">TaskFlow AI</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-ink-soft/70">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#00c875]" />
                    Local Ollama · qwen3:4b
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label="Close"
                onClick={() => setOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-xl bg-white/80 px-0 shadow-sm"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </Button>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-gradient-to-b from-muted/40 to-white px-4 py-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={[
                  'max-w-[90%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm',
                  msg.role === 'user'
                    ? 'ml-auto rounded-br-md bg-ink text-white'
                    : 'mr-auto rounded-bl-md border border-black/[0.04] bg-white text-ink',
                ].join(' ')}
              >
                {msg.content}
              </div>
            ))}
            {isLoading && (
              <div className="mr-auto flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-black/[0.04] bg-white px-3.5 py-3 text-sm text-ink-soft shadow-sm">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink-soft/50" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink-soft/50 [animation-delay:120ms]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink-soft/50 [animation-delay:240ms]" />
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-black/[0.05] bg-white px-4 py-3.5">
            <div className="mb-2.5 flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((tip) => (
                <Button
                  key={tip}
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={isLoading}
                  onClick={() => void sendMessage(tip)}
                  className="rounded-full border-transparent bg-muted px-2.5 py-1 text-[11px] font-medium text-ink-soft hover:bg-[#e8ecf0]"
                >
                  {tip}
                </Button>
              ))}
            </div>
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 rounded-2xl border border-black/[0.07] bg-muted p-1.5 focus-within:border-brand/35 focus-within:bg-white focus-within:ring-4 focus-within:ring-brand/10"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask something or give a command…"
                disabled={isLoading}
                className="min-w-0 flex-1 bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-ink-soft/45"
              />
              <Button
                type="submit"
                variant="ink"
                disabled={isLoading || !input.trim()}
                className="shrink-0 rounded-xl px-3.5"
              >
                Send
              </Button>
            </form>
          </div>
        </aside>
      )}
    </>
  )
}
