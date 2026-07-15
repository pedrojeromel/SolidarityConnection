import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

export function Layout() {
  const { pathname } = useLocation()

  // Trocar de rota volta ao topo: sem isso o usuario cai no meio da pagina nova.
  // O corpo precisa de chaves: uma arrow sem chaves devolveria o retorno de
  // window.scrollTo, e o React trata o retorno do efeito como funcao de limpeza.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden">
      <div className="brand-glow" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  )
}
