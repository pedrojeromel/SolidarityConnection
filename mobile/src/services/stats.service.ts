import { request } from './http'

export interface DailyPoint {
  date: string
  amount: number
}

export interface PlatformStats {
  totalRaised: number
  activeCampaigns: number
  totalDonations: number
  averageTicket: number
  daily: DailyPoint[]
}

export const statsService = {
  /** Indicadores públicos da plataforma, calculados no backend. */
  get(): Promise<PlatformStats> {
    return request<PlatformStats>('/api/stats')
  },
}
