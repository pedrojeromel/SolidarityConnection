import { API_URL } from './config'
import { clearSession, getToken } from './session'

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)

    this.name = 'ApiError'
    this.status = status
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  auth?: boolean
  // Permite apontar para outro microsservico (ex.: pagamentos), mantendo o
  // mesmo tratamento de token e de erro.
  baseUrl?: string
}

/**
 * Ponto unico de acesso a API. Concentra base URL, token JWT e tratamento
 * de erro para que as telas nao conhecam detalhes de transporte.
 */
export async function request<T>(
  path: string,
  { method = 'GET', body, auth = false, baseUrl = API_URL }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {}

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  if (auth) {
    const token = getToken()

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  // Token expirado ou invalido: derruba a sessao para o usuario reautenticar.
  if (response.status === 401) {
    await clearSession()

    throw new ApiError('Sessão expirada. Faça login novamente.', 401)
  }

  if (!response.ok) {
    throw new ApiError(
      (await response.text()) || 'Não foi possível concluir a operação.',
      response.status,
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  const text = await response.text()

  return (text ? JSON.parse(text) : undefined) as T
}
