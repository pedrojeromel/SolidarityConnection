import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Layout } from './components/Layout'
import { RequireRole } from './components/RequireRole'
import { Home } from './pages/Home'
import { About } from './pages/About'
import { Contact } from './pages/Contact'
import { TransparencyPanel } from './pages/TransparencyPanel'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { ManagerDashboard } from './pages/ManagerDashboard'

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="campanhas" element={<TransparencyPanel />} />
              <Route path="sobre" element={<About />} />
              <Route path="contato" element={<Contact />} />
              <Route path="login" element={<Login />} />
              <Route path="cadastro" element={<Register />} />

              <Route
                path="gestor"
                element={
                  <RequireRole role="NgoManager">
                    <ManagerDashboard />
                  </RequireRole>
                }
              />

              {/* Rota desconhecida cai na home, em vez de tela vazia. */}
              <Route path="*" element={<Home />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  )
}
