import Constants from 'expo-constants'

/**
 * O celular nao enxerga "localhost" do PC. Em desenvolvimento, o Expo Go
 * carrega o bundle pelo IP da maquina na rede local (hostUri) — usamos o
 * mesmo IP para chegar na API e no servico de pagamentos.
 *
 * Para apontar para outro lugar, defina EXPO_PUBLIC_API_URL e
 * EXPO_PUBLIC_PAYMENT_URL (ver .env.example).
 */
function devHost(): string | null {
  const uri = Constants.expoConfig?.hostUri

  if (!uri) {
    return null
  }

  const host = uri.split(':')[0]

  return host || null
}

const host = devHost()

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  (host ? `http://${host}:8080` : 'http://localhost:8080')

export const PAYMENT_URL =
  process.env.EXPO_PUBLIC_PAYMENT_URL ??
  (host ? `http://${host}:8090` : 'http://localhost:8090')
