import {
  createContext,
  useCallback,
  useContext,
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
  /** true enquanto a sessão persistida ainda está sendo restaurada. */
  restoring: boolean
  isAuthenticated: boolean
  isManager: boolean
  isDonor: boolean
  login: (credentials: Credentials) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [restoring, setRestoring] = useState(true)

  // AsyncStorage é assíncrono: expõe "restoring" para as telas aguardarem
  // em vez de tratarem o usuário como deslogado no primeiro render.
  useEffect(() => {
    let cancelled = false

    loadSession()
      .then((restored) => {
        if (!cancelled) {
          setSession(restored)
        }
      })
      .finally(() => {
        if (!cancelled) {
          setRestoring(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (credentials: Credentials) => {
    const { token } = await authService.login(credentials)

    const next = createSession(token)

    if (!next) {
      throw new Error('Token inválido recebido da API.')
    }

    await saveSession(next)
    setSession(next)
  }, [])

  const logout = useCallback(async () => {
    await clearSession()
    setSession(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      restoring,
      isAuthenticated: session !== null,
      isManager: session?.role === 'NgoManager',
      isDonor: session?.role === 'Donor',
      login,
      logout,
    }),
    [session, restoring, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth precisa estar dentro de <AuthProvider>.')
  }

  return context
}
