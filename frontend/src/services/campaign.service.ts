import { request } from './http'
import type { ActiveCampaign, Campaign, CreateCampaignInput } from '../types'

export const campaignService = {
  /** Painel de transparencia: endpoint publico, sem token. */
  listActive(): Promise<ActiveCampaign[]> {
    return request<ActiveCampaign[]>('/api/campaigns/active')
  },

  listAll(): Promise<Campaign[]> {
    return request<Campaign[]>('/api/campaigns', { auth: true })
  },

  create(input: CreateCampaignInput): Promise<string> {
    return request<string>('/api/campaigns', {
      method: 'POST',
      body: input,
      auth: true,
    })
  },

  update(id: string, input: CreateCampaignInput): Promise<void> {
    return request<void>(`/api/campaigns/${id}`, {
      method: 'PUT',
      body: input,
      auth: true,
    })
  },

  cancel(id: string): Promise<void> {
    return request<void>(`/api/campaigns/${id}`, {
      method: 'DELETE',
      auth: true,
    })
  },
}
