export const CampaignStatus = {
  Active: 1,
  Completed: 2,
  Cancelled: 3,
} as const

export type CampaignStatusValue =
  (typeof CampaignStatus)[keyof typeof CampaignStatus]

export type UserRole = 'NgoManager' | 'Donor'

export interface ActiveCampaign {
  id: string
  title: string
  financialGoal: number
  totalRaised: number
}

export interface Campaign extends ActiveCampaign {
  description: string
  startDate: string
  endDate: string
  status: CampaignStatusValue
}

export interface CreateCampaignInput {
  title: string
  description: string
  startDate: string
  endDate: string
  financialGoal: number
}

export interface RegisterInput {
  fullName: string
  email: string
  cpf: string
  password: string
}

export interface Credentials {
  email: string
  password: string
}

export interface Session {
  token: string
  role: UserRole
  email: string
}
