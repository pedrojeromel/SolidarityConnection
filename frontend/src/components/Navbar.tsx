import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button } from './ui'

interface NavItem {
  to: string
  label: string
}

const PUBLIC_LINKS: NavItem[] = [
  { to: '/', label: 'Início' },
  { to: '/campanhas', label: 'Campanhas' },
  { to: '/sobre', label: 'Sobre' },
  { to: '/contato', label: 'Contato' },
]

export function Navbar() {
  const { session, isManager, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [open, setOpen] = useState(false)

  // Navegar fecha o menu mobile: sem isso o painel fica aberto sobre a tela nova.
  // Chaves obrigatorias: o retorno de um efeito e tratado como funcao de limpeza.
  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  const links = isManager
    ? [...PUBLIC_LINKS, { to: '/gestor', label: 'Gestão' }]
    : PUBLIC_LINKS

  function navClass({ isActive }: { isActive: boolean }) {
    return `text-sm font-medium transition ${
      isActive ? 'text-neon' : 'text-slate-400 hover:text-white'
    }`
  }

  function signOut() {
    logout()
    setOpen(false)
    navigate('/')
  }

  return (
    <header className="glass sticky top-0 z-30 border-x-0 border-t-0">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="animate-pulse-glow h-2.5 w-2.5 shrink-0 rounded-full bg-neon shadow-[0_0_12px_3px_rgba(34,211,238,0.8)]" />

          <span className="text-glow text-base font-bold tracking-tight text-white sm:text-lg">
            Conexão Solidária
          </span>
        </Link>

        {/* ---------- Desktop ---------- */}
        <div className="hidden items-center gap-6 lg:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={navClass}
            >
              {link.label}
            </NavLink>
          ))}

          {session ? (
            <div className="flex items-center gap-3">
              <span className="max-w-[180px] truncate text-xs text-slate-500">
                {session.email}
              </span>

              <Button variant="ghost" onClick={signOut}>
                Sair
              </Button>
            </div>
          ) : (
            <Button onClick={() => navigate('/login')}>Entrar</Button>
          )}
        </div>

        {/* ---------- Botão do menu (mobile) ---------- */}
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={open}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-slate-200 transition hover:border-neon/50 lg:hidden"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* ---------- Painel do menu (mobile) ---------- */}
      {open && (
        <div className="animate-rise border-t border-white/10 bg-deep/95 px-4 py-4 backdrop-blur-xl lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? 'bg-neon/10 text-neon'
                      : 'text-slate-300 hover:bg-white/5'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}

            <div className="mt-3 border-t border-white/10 pt-3">
              {session ? (
                <div className="space-y-3">
                  <p className="truncate px-4 text-xs text-slate-500">
                    {session.email}
                  </p>

                  <Button variant="ghost" onClick={signOut} className="w-full">
                    Sair
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => navigate('/login')}
                  className="w-full"
                >
                  Entrar
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
