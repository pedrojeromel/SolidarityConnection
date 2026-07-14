import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { Layout } from './components/Layout'
import { RequireRole } from './components/RequireRole'
import { TransparencyPanel } from './pages/TransparencyPanel'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { ManagerDashboard } from './pages/ManagerDashboard'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<TransparencyPanel />} />
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
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
