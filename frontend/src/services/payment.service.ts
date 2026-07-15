import { request } from './http'

const PAYMENT_URL =
  import.meta.env.VITE_PAYMENT_URL ?? 'http://localhost:8090'

export interface CardInput {
  number: string
  holder: string
  expiryMonth: string
  expiryYear: string
  cvv: string
}

export interface AddressInput {
  zipCode: string
  street: string
  number: string
  city: string
  state: string
}

export interface CheckoutInput {
  campaignId: string
  amount: number
  card: CardInput
  address: AddressInput
}

export interface CheckoutResult {
  status: string
  message: string
}

export const paymentService = {
  /** Processa o pagamento no microsserviço de pagamentos. */
  checkout(input: CheckoutInput): Promise<CheckoutResult> {
    return request<CheckoutResult>('/api/payments', {
      method: 'POST',
      body: input,
      auth: true,
      baseUrl: PAYMENT_URL,
    })
  },
}
