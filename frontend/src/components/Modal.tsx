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
    <div className="fixed inset-0 z-[100] overflow-y-auto animate-fade">
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
        <button
          type="button"
          aria-label="Close dialog backdrop"
          className="fixed inset-0 bg-black/25 backdrop-blur-[1px]"
          onClick={onClose}
        />

        <div
          role="dialog"
          aria-modal="true"
          className="relative z-10 my-6 w-full max-w-md overflow-hidden rounded-[28px] border border-black/[0.06] bg-white shadow-[0_28px_80px_-24px_rgba(0,0,0,0.35)]"
        >
          {(title || subtitle) && (
            <div className="flex items-start justify-between gap-3 border-b border-black/[0.06] px-5 py-4">
              <div className="min-w-0">
                {title ? (
                  <h2 className="text-base font-semibold tracking-tight text-ink">{title}</h2>
                ) : null}
                {subtitle ? (
                  <p className="mt-0.5 text-sm text-black/45">{subtitle}</p>
                ) : null}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClose}
                aria-label="Close"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#f3f3f3] px-0 text-black/50 hover:bg-black/10 hover:text-ink"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                >
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </Button>
            </div>
          )}

          <div className="px-5 py-4">{children}</div>

          {footer ? (
            <div className="flex items-center justify-end gap-2 border-t border-black/[0.06] bg-[#f6f6f6] px-5 py-3.5">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  )
}

/** Muted section label + content, like “General access” / “People with access”. */
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
        <p className="text-[11px] font-medium uppercase tracking-wide text-black/40">{label}</p>
      ) : null}
      {children}
    </div>
  )
}

export const modalFieldClass =
  'w-full rounded-xl border border-black/[0.08] bg-[#f6f6f6] px-3.5 py-3 text-sm text-ink outline-none transition placeholder:text-black/35 focus:border-black/20 focus:bg-white focus:ring-4 focus:ring-black/[0.04]'
