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
  { to: '/sobre', label: 'Instituição' },
  { to: '/contato', label: 'Contato' },
]

export function Navbar() {
  const { session, isManager, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [open, setOpen] = useState(false)

  // Navegar fecha o menu mobile: sem isso o painel fica aberto sobre a tela nova.
  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  const links = isManager
    ? [...PUBLIC_LINKS, { to: '/gestor', label: 'Gestão' }]
    : PUBLIC_LINKS

  function navClass({ isActive }: { isActive: boolean }) {
    return `text-sm transition-colors ${
      isActive ? 'text-fg' : 'text-muted hover:text-fg'
    }`
  }

  function signOut() {
    logout()
    setOpen(false)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur-lg">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-gradient-to-br from-brand to-brand-2">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-white">
              <path d="M12 21s-7-4.35-9.33-8.4C.9 9.35 2.3 5.5 5.7 4.6c2-.53 4 .3 5.1 2 1.1-1.7 3.1-2.53 5.1-2 3.4.9 4.8 4.75 3.03 8C19.6 16.6 12 21 12 21Z" />
            </svg>
          </span>

          <span className="font-semibold tracking-tight text-fg">
            Conexão Solidária
          </span>
        </Link>

        {/* ---------- Desktop ---------- */}
        <div className="hidden items-center gap-7 lg:flex">
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
            <div className="flex items-center gap-3 border-l border-line pl-6">
              <span className="max-w-[160px] truncate font-mono text-xs text-dim">
                {session.email}
              </span>

              <Button variant="ghost" onClick={signOut}>
                Sair
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 border-l border-line pl-6">
              <Button variant="ghost" onClick={() => navigate('/login')}>
                Entrar
              </Button>
              <Button variant="brand" onClick={() => navigate('/campanhas')}>
                Doar
              </Button>
            </div>
          )}
        </div>

        {/* ---------- Botão do menu (mobile) ---------- */}
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={open}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line-2 text-muted transition hover:text-fg lg:hidden"
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
        <div className="border-t border-line bg-bg-2 px-4 py-4 lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2.5 text-sm transition ${
                    isActive
                      ? 'bg-brand-soft text-fg'
                      : 'text-muted hover:bg-[#12151c]'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}

            <div className="mt-3 border-t border-line pt-3">
              {session ? (
                <div className="space-y-3">
                  <p className="truncate px-3 font-mono text-xs text-dim">
                    {session.email}
                  </p>
                  <Button variant="default" onClick={signOut} className="w-full">
                    Sair
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Button
                    variant="default"
                    onClick={() => navigate('/login')}
                    className="w-full"
                  >
                    Entrar
                  </Button>
                  <Button
                    variant="brand"
                    onClick={() => navigate('/campanhas')}
                    className="w-full"
                  >
                    Doar
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
