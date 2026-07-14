import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react'

export function Card({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`glass rounded-2xl p-6 ${className}`}>{children}</div>
  )
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger'
  loading?: boolean
}

export function Button({
  variant = 'primary',
  loading = false,
  children,
  className = '',
  disabled,
  ...rest
}: ButtonProps) {
  const styles: Record<string, string> = {
    primary:
      'bg-gradient-to-r from-neon to-violet text-void shadow-[0_10px_30px_-12px_rgba(34,211,238,0.9)] hover:brightness-110',
    ghost:
      'border border-white/15 bg-white/5 text-slate-200 hover:border-neon/50 hover:text-white',
    danger:
      'border border-danger/40 bg-danger/10 text-danger hover:bg-danger/20',
  }

  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
      {...rest}
    >
      {loading ? 'Processando...' : children}
    </button>
  )
}

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export function Field({ label, id, ...rest }: FieldProps) {
  return (
    <label htmlFor={id} className="block space-y-1.5">
      <span className="text-xs font-medium tracking-wide text-slate-400 uppercase">
        {label}
      </span>

      <input
        id={id}
        className="w-full rounded-xl border border-white/12 bg-void/60 px-4 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-neon/60 focus:ring-2 focus:ring-neon/25"
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
      : 'border-success/40 bg-success/10 text-success'

  return (
    <p
      role="status"
      className={`rounded-xl border px-4 py-2.5 text-sm ${styles}`}
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
