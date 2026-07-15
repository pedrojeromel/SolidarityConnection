export const PASSWORD_RULES = [
  {
    label: 'Mínimo de 8 caracteres',
    test: (value: string) => value.length >= 8,
  },
  {
    label: 'Ao menos uma letra',
    test: (value: string) => /\p{L}/u.test(value),
  },
  {
    label: 'Ao menos um número',
    test: (value: string) => /\d/.test(value),
  },
  {
    label: 'Ao menos um caractere especial (!@#$%...)',
    test: (value: string) => /[^\p{L}\d\s]/u.test(value),
  },
]

export function isPasswordStrong(value: string): boolean {
  return PASSWORD_RULES.every((rule) => rule.test(value))
}

/** Espelha na tela as mesmas regras que a API aplica no cadastro. */
export function PasswordRules({ value }: { value: string }) {
  return (
    <ul className="space-y-1 rounded-lg border border-line bg-bg-2 px-4 py-3">
      {PASSWORD_RULES.map((rule) => {
        const ok = rule.test(value)

        return (
          <li
            key={rule.label}
            className={`flex items-center gap-2 text-xs transition-colors ${
              ok ? 'text-ok' : 'text-dim'
            }`}
          >
            <span
              aria-hidden
              className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border text-[9px] ${
                ok ? 'border-ok bg-ok/20' : 'border-line-2 bg-transparent'
              }`}
            >
              {ok ? '✓' : ''}
            </span>

            {rule.label}
          </li>
        )
      })}
    </ul>
  )
}
