import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'ink'
export type ButtonSize = 'sm' | 'md' | 'lg'

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-brand text-white shadow-sm shadow-brand/25 hover:bg-[#0060c2] active:bg-[#0052a8]',
  secondary:
    'border border-black/[0.08] bg-white text-ink-soft shadow-sm shadow-black/[0.02] hover:border-black/15 hover:bg-muted hover:text-ink',
  ghost: 'bg-transparent text-ink-soft hover:bg-muted hover:text-ink',
  danger: 'bg-transparent text-danger hover:bg-danger/8',
  ink: 'bg-ink text-white shadow-sm shadow-ink/20 hover:bg-[#1a2e3a] active:bg-black',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'rounded-lg px-2.5 py-1.5 text-xs font-semibold',
  md: 'rounded-xl px-4 py-2.5 text-sm font-semibold',
  lg: 'rounded-xl px-4 py-3 text-sm font-semibold',
}

export type ButtonClassOptions = {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  className?: string
}

/** Shared styles for `<Button>` and button-looking `<Link>`s. */
export function buttonClassName({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
}: ButtonClassOptions = {}) {
  return [
    'inline-flex items-center justify-center gap-1.5 transition duration-150 cursor-pointer',
    'active:scale-[0.98] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-55 disabled:active:scale-100',
    variants[variant],
    sizes[size],
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  type = 'button',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClassName({ variant, size, fullWidth, className })}
      {...props}
    >
      {children}
    </button>
  )
}
