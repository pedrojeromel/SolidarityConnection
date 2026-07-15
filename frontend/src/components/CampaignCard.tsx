import type { ReactNode } from 'react'
import { ProgressBar } from './ProgressBar'
import { Card, currency } from './ui'
import type { ActiveCampaign } from '../types'

interface CampaignCardProps {
  campaign: ActiveCampaign
  pending?: boolean
  children?: ReactNode
}

export function CampaignCard({
  campaign,
  pending = false,
  children,
}: CampaignCardProps) {
  return (
    <Card className="animate-rise flex h-full flex-col gap-4 p-5 transition-colors hover:border-line-2">
      <h3 className="text-base font-medium tracking-tight text-fg">
        {campaign.title}
      </h3>

      <div>
        <p className="tnum text-2xl text-fg">{currency(campaign.totalRaised)}</p>
        <p className="mt-0.5 font-mono text-xs text-dim">
          meta {currency(campaign.financialGoal)}
        </p>
      </div>

      <ProgressBar
        raised={campaign.totalRaised}
        goal={campaign.financialGoal}
        pending={pending}
      />

      {children && <div className="mt-auto space-y-3 pt-1">{children}</div>}
    </Card>
  )
}
