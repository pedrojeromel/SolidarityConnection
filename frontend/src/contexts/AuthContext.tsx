import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { authService } from '../services/auth.service'
import {
  clearSession,
  createSession,
  loadSession,
  saveSession,
} from '../services/session'
import type { Credentials, Session } from '../types'

interface AuthContextValue {
  session: Session | null
  isAuthenticated: boolean
  isManager: boolean
  isDonor: boolean
  login: (credentials: Credentials) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    setSession(loadSession())
  }, [])

  const login = useCallback(async (credentials: Credentials) => {
    const { token } = await authService.login(credentials)

    const next = createSession(token)

    if (!next) {
      throw new Error('Token inválido recebido da API.')
    }

    saveSession(next)
    setSession(next)
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setSession(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: session !== null,
      isManager: session?.role === 'NgoManager',
      isDonor: session?.role === 'Donor',
      login,
      logout,
    }),
    [session, login, logout],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
