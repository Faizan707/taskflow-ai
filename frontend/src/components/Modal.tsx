import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Button } from './Button'

interface ModalProps {
  title?: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
  onClose: () => void
}

export function Modal({ title, subtitle, children, footer, onClose }: ModalProps) {
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
        <button
          type="button"
          aria-label="Close dialog backdrop"
          className="animate-overlay-in fixed inset-0 bg-[#0f1c24]/40 backdrop-blur-[3px]"
          onClick={onClose}
        />

        <div
          role="dialog"
          aria-modal="true"
          className="animate-modal-in shadow-modal relative z-10 my-6 w-full max-w-md overflow-hidden rounded-[24px] bg-white"
        >
          <div className="h-1 w-full bg-gradient-to-r from-[#0073ea] via-[#14b8a6] to-[#fdab3d]" />

          {(title || subtitle) && (
            <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-4">
              <div className="min-w-0">
                {title ? (
                  <h2 className="font-display text-lg font-bold tracking-tight text-ink">{title}</h2>
                ) : null}
                {subtitle ? (
                  <p className="mt-1 text-sm leading-snug text-ink-soft/80">{subtitle}</p>
                ) : null}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClose}
                aria-label="Close"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-muted px-0 text-ink-soft transition hover:bg-black/[0.07] hover:text-ink"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </Button>
            </div>
          )}

          <div className="px-5 pb-5 pt-1">{children}</div>

          {footer ? (
            <div className="flex items-center justify-end gap-2 border-t border-black/[0.05] bg-gradient-to-b from-muted/80 to-muted px-5 py-3.5">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  )
}

/** Muted section label + content */
export function ModalSection({
  label,
  children,
  className = '',
}: {
  label?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={['space-y-3', className].filter(Boolean).join(' ')}>
      {label ? (
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft/55">
          {label}
        </p>
      ) : null}
      {children}
    </div>
  )
}

export const modalFieldClass =
  'w-full rounded-xl border border-black/[0.07] bg-muted px-3.5 py-3 text-sm text-ink outline-none transition placeholder:text-ink-soft/45 hover:border-black/12 focus:border-brand/40 focus:bg-white focus:ring-4 focus:ring-brand/10'
