import { Link } from 'react-router-dom'

const APP_VERSION = import.meta.env.VITE_APP_VERSION ?? '1.0.0'

const NAV = [
  { to: '/campanhas', label: 'Campanhas ativas' },
  { to: '/sobre', label: 'Sobre a instituição' },
  { to: '/contato', label: 'Contato' },
  { to: '/cadastro', label: 'Seja um doador' },
]

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-gradient-to-br from-brand to-brand-2">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-white">
                <path d="M12 21s-7-4.35-9.33-8.4C.9 9.35 2.3 5.5 5.7 4.6c2-.53 4 .3 5.1 2 1.1-1.7 3.1-2.53 5.1-2 3.4.9 4.8 4.75 3.03 8C19.6 16.6 12 21 12 21Z" />
              </svg>
            </span>
            <span className="font-semibold text-fg">Conexão Solidária</span>
          </div>

          <p className="max-w-xs text-sm text-muted">
            Plataforma de arrecadação auditável da ONG Esperança Solidária.
            Cada doação registrada, conciliada e publicada.
          </p>

          <p className="font-mono text-xs text-dim">
            CNPJ 12.345.678/0001-90 · Organização sem fins lucrativos
          </p>
        </div>

        <nav className="space-y-3">
          <h3 className="font-mono text-[11px] tracking-widest text-dim uppercase">
            Navegação
          </h3>
          <ul className="space-y-2">
            {NAV.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="text-sm text-muted transition hover:text-fg"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-3">
          <h3 className="font-mono text-[11px] tracking-widest text-dim uppercase">
            Contato
          </h3>
          <ul className="space-y-2 text-sm text-muted">
            <li>Rua das Acácias, 120 — São Paulo/SP</li>
            <li>contato@esperancasolidaria.org</li>
            <li>(11) 4002-8922</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 font-mono text-xs text-dim sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} ONG Esperança Solidária</p>
          <p>Conexão Solidária · v{APP_VERSION}</p>
        </div>
      </div>
    </footer>
  )
}
