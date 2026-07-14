import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button } from './ui'

function navClass({ isActive }: { isActive: boolean }) {
  return `text-sm font-medium transition ${
    isActive ? 'text-neon' : 'text-slate-400 hover:text-white'
  }`
}

export function Layout() {
  const { session, isManager, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Camadas de fundo: malha animada + halos de cor. */}
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" />

      <div className="pointer-events-none absolute -top-40 -left-32 h-96 w-96 rounded-full bg-neon/20 blur-[120px]" />

      <div className="pointer-events-none absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-violet/20 blur-[120px]" />

      <div className="relative z-10">
        <header className="glass sticky top-0 z-20 border-x-0 border-t-0">
          <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="animate-pulse-glow h-2.5 w-2.5 rounded-full bg-neon shadow-[0_0_12px_3px_rgba(34,211,238,0.8)]" />

              <span className="text-glow text-lg font-bold tracking-tight text-white">
                Conexão Solidária
              </span>
            </Link>

            <div className="flex items-center gap-5">
              <NavLink to="/" className={navClass} end>
                Campanhas
              </NavLink>

              {isManager && (
                <NavLink to="/gestor" className={navClass}>
                  Gestão
                </NavLink>
              )}

              {session ? (
                <div className="flex items-center gap-3">
                  <span className="hidden text-xs text-slate-500 sm:inline">
                    {session.email}
                  </span>

                  <Button
                    variant="ghost"
                    onClick={() => {
                      logout()
                      navigate('/')
                    }}
                  >
                    Sair
                  </Button>
                </div>
              ) : (
                <Button onClick={() => navigate('/login')}>Entrar</Button>
              )}
            </div>
          </nav>
        </header>

        <main className="mx-auto max-w-7xl px-6 py-12">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
