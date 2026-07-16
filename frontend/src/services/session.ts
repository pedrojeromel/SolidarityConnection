import type { Session, UserRole } from '../types'

const STORAGE_KEY = 'solidarity.session'

const ROLE_CLAIMS = [
  'role',
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
]

const EMAIL_CLAIMS = [
  'email',
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
]

interface JwtPayload {
  exp?: number
  [claim: string]: unknown
}

function decode(token: string): JwtPayload | null {
  try {
    const payload = token.split('.')[1]

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')

    return JSON.parse(atob(normalized)) as JwtPayload
  } catch {
    return null
  }
}

function readClaim(
  payload: JwtPayload,
  candidates: string[],
): string | undefined {
  for (const claim of candidates) {
    const value = payload[claim]

    if (typeof value === 'string') {
      return value
    }
  }

  return undefined
}

function isExpired(payload: JwtPayload): boolean {
  if (typeof payload.exp !== 'number') {
    return false
  }

  return payload.exp * 1000 <= Date.now()
}

export function createSession(token: string): Session | null {
  const payload = decode(token)

  if (!payload || isExpired(payload)) {
    return null
  }

  const role = readClaim(payload, ROLE_CLAIMS) as UserRole | undefined

  if (!role) {
    return null
  }

  return {
    token,
    role,
    email: readClaim(payload, EMAIL_CLAIMS) ?? '',
  }
}

export function saveSession(session: Session): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export function loadSession(): Session | null {
  const raw = localStorage.getItem(STORAGE_KEY)

  if (!raw) {
    return null
  }

  try {
    const session = JSON.parse(raw) as Session

    // Revalida o token guardado: um JWT expirado no localStorage
    // nao pode ressuscitar a sessao ao dar F5.
    return createSession(session.token)
  } catch {
    return null
  }
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function getToken(): string | null {
  return loadSession()?.token ?? null
}
