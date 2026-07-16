import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react'

export function Card({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-xl border border-line bg-panel ${className}`}
    >
      {children}
    </div>
  )
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'brand' | 'default' | 'ghost' | 'danger'
  loading?: boolean
}

export function Button({
  variant = 'default',
  loading = false,
  children,
  className = '',
  disabled,
  ...rest
}: ButtonProps) {
  const styles: Record<string, string> = {
    brand: 'bg-brand text-white hover:bg-[#5457e0] border border-brand',
    default:
      'border border-line-2 bg-transparent text-fg hover:bg-[#12151c]',
    ghost: 'text-muted hover:text-fg hover:bg-[#12151c]',
    danger:
      'border border-danger/40 bg-danger/10 text-danger hover:bg-danger/15',
  }

  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
      {...rest}
    >
      {loading ? 'Processando…' : children}
    </button>
  )
}

export function Badge({
  children,
  tone = 'brand',
}: {
  children: ReactNode
  tone?: 'brand' | 'ok' | 'muted'
}) {
  const tones: Record<string, string> = {
    brand: 'border-brand/30 text-brand-2',
    ok: 'border-ok/30 text-ok',
    muted: 'border-line-2 text-dim',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[10.5px] tracking-wider uppercase ${tones[tone]}`}
    >
      {children}
    </span>
  )
}

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export function Field({ label, id, ...rest }: FieldProps) {
  return (
    <label htmlFor={id} className="block space-y-1.5">
      <span className="text-xs font-medium text-muted">{label}</span>

      <input
        id={id}
        className="w-full rounded-lg border border-line-2 bg-bg-2 px-3.5 py-2.5 text-sm text-fg outline-none transition placeholder:text-dim focus:border-brand/70 focus:ring-2 focus:ring-brand/20"
        {...rest}
      />
    </label>
  )
}

export function Alert({
  kind,
  message,
}: {
  kind: 'error' | 'success'
  message: string
}) {
  const styles =
    kind === 'error'
      ? 'border-danger/40 bg-danger/10 text-danger'
      : 'border-ok/40 bg-ok/10 text-ok'

  return (
    <p
      role="status"
      className={`rounded-lg border px-4 py-2.5 text-sm ${styles}`}
    >
      {message}
    </p>
  )
}

export const currency = (value: number) =>
  value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
