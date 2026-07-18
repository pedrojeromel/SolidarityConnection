import AsyncStorage from '@react-native-async-storage/async-storage'
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

// Decodificador base64 proprio: nao dependemos de atob, que nem sempre
// existe no runtime do React Native.
const B64 =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

function base64Decode(input: string): string {
  const clean = input.replace(/=+$/, '')
  let bits = 0
  let buffer = 0
  const bytes: number[] = []

  for (const char of clean) {
    const value = B64.indexOf(char)

    if (value === -1) {
      continue
    }

    buffer = (buffer << 6) | value
    bits += 6

    if (bits >= 8) {
      bits -= 8
      bytes.push((buffer >> bits) & 0xff)
    }
  }

  // UTF-8 -> string
  let result = ''
  let i = 0

  while (i < bytes.length) {
    const byte = bytes[i]

    if (byte < 0x80) {
      result += String.fromCharCode(byte)
      i += 1
    } else if (byte < 0xe0) {
      result += String.fromCharCode(
        ((byte & 0x1f) << 6) | (bytes[i + 1] & 0x3f),
      )
      i += 2
    } else if (byte < 0xf0) {
      result += String.fromCharCode(
        ((byte & 0x0f) << 12) |
          ((bytes[i + 1] & 0x3f) << 6) |
          (bytes[i + 2] & 0x3f),
      )
      i += 3
    } else {
      const codePoint =
        (((byte & 0x07) << 18) |
          ((bytes[i + 1] & 0x3f) << 12) |
          ((bytes[i + 2] & 0x3f) << 6) |
          (bytes[i + 3] & 0x3f)) -
        0x10000
      result += String.fromCharCode(
        0xd800 + (codePoint >> 10),
        0xdc00 + (codePoint & 0x3ff),
      )
      i += 4
    }
  }

  return result
}

function decode(token: string): JwtPayload | null {
  try {
    const payload = token.split('.')[1]

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')

    return JSON.parse(base64Decode(normalized)) as JwtPayload
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

// Cache em memoria: o http.ts precisa do token de forma sincrona,
// e o AsyncStorage e assincrono por natureza.
let current: Session | null = null

export async function saveSession(session: Session): Promise<void> {
  current = session
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export async function loadSession(): Promise<Session | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY)

  if (!raw) {
    current = null
    return null
  }

  try {
    const session = JSON.parse(raw) as Session

    // Revalida o token guardado: JWT expirado nao ressuscita a sessao.
    const restored = createSession(session.token)

    if (!restored) {
      await clearSession()
      return null
    }

    current = restored
    return restored
  } catch {
    await clearSession()
    return null
  }
}

export async function clearSession(): Promise<void> {
  current = null
  await AsyncStorage.removeItem(STORAGE_KEY)
}

export function getToken(): string | null {
  return current?.token ?? null
}
