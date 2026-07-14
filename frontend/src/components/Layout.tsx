import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

export function Layout() {
  const { pathname } = useLocation()

  // Trocar de rota volta ao topo: sem isso o usuario cai no meio da pagina nova.
  // O corpo precisa de chaves: uma arrow sem chaves devolveria o retorno de
  // window.scrollTo, e o React trata o retorno do efeito como funcao de limpeza
  // — chamando-o depois e quebrando com "... is not a function".
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden">
      {/* Camadas de fundo: malha animada + halos de cor. */}
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" />

      <div className="pointer-events-none absolute -top-40 -left-32 h-72 w-72 rounded-full bg-neon/20 blur-[120px] sm:h-96 sm:w-96" />

      <div className="pointer-events-none absolute top-1/3 -right-32 h-72 w-72 rounded-full bg-violet/20 blur-[120px] sm:h-96 sm:w-96" />

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
