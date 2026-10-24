import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'ink'
export type ButtonSize = 'sm' | 'md' | 'lg'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-[#0073ea] text-white shadow-sm hover:bg-[#0060c2]',
  secondary:
    'border border-black/10 bg-white text-ink-soft hover:bg-[#f6f7fb] hover:text-ink',
  ghost: 'bg-transparent text-ink-soft hover:bg-[#f6f7fb] hover:text-ink',
  danger: 'bg-transparent text-danger hover:underline',
  ink: 'bg-ink text-white hover:bg-black',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'rounded-md px-2.5 py-1 text-xs font-semibold',
  md: 'rounded-lg px-4 py-2.5 text-sm font-semibold',
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
    'inline-flex items-center justify-center gap-1.5 transition cursor-pointer',
    'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60',
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
