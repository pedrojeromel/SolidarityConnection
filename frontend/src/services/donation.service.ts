import { request } from './http'

export const donationService = {
  /**
   * A API responde 202 Accepted: a doacao vira um evento na fila.
   * Quem soma o valor na campanha e o Worker, de forma assincrona.
   */
  donate(campaignId: string, amount: number): Promise<void> {
    return request<void>('/api/donations', {
      method: 'POST',
      body: { campaignId, amount },
      auth: true,
    })
  },
}
