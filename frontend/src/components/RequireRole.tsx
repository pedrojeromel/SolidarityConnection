import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'
import type { UserRole } from '../types'

interface RequireRoleProps {
  role: UserRole
  children: ReactNode
}

/**
 * Guarda de rota no cliente: melhora a experiencia escondendo telas.
 * A autorizacao real continua no backend, via [Authorize(Roles = ...)].
 */
export function RequireRole({ role, children }: RequireRoleProps) {
  const { session } = useAuth()
  const location = useLocation()

  if (!session) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (session.role !== role) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
