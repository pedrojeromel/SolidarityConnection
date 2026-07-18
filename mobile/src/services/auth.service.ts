import { request } from './http'
import type { Credentials, RegisterInput } from '../types'

interface LoginResponse {
  token: string
}

export const authService = {
  login(credentials: Credentials): Promise<LoginResponse> {
    return request<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: credentials,
    })
  },

  register(input: RegisterInput): Promise<void> {
    return request<void>('/api/auth/register', {
      method: 'POST',
      body: input,
    })
  },
}
