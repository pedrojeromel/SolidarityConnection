import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { campaignService } from '../services/campaign.service'
import { useAuth } from '../hooks/useAuth'
import { CampaignCard } from '../components/CampaignCard'
import { CheckoutModal } from '../components/CheckoutModal'
import { Alert, Badge, Button, Card } from '../components/ui'
import type { ActiveCampaign } from '../types'

/**
 * Enquanto o Worker nao consumir o evento da fila, o valor arrecadado
 * ainda nao mudou no banco. Recarregamos o painel algumas vezes para que
 * a barra suba sozinha assim que o consumo acontecer.
 */
const REFRESH_INTERVAL_MS = 1500
const REFRESH_ATTEMPTS = 8

export function TransparencyPanel() {
  const { isAuthenticated, isDonor, isManager } = useAuth()
  const navigate = useNavigate()

  const [campaigns, setCampaigns] = useState<ActiveCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [checkout, setCheckout] = useState<ActiveCampaign | null>(null)
  const [feedback, setFeedback] = useState('')
  const [pendingIds, setPendingIds] = useState<string[]>([])

  const timers = useRef<number[]>([])

  const load = useCallback(async () => {
    try {
      setCampaigns(await campaignService.listActive())
      setError('')
    } catch {
      setError('Não foi possível carregar as campanhas. A API está no ar?')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  // Passar window.clearTimeout desacoplado do window quebra em alguns contextos
  // (o metodo nativo perde o "this"). Chamamos dentro de uma arrow.
  useEffect(
    () => () => {
      timers.current.forEach((id) => window.clearTimeout(id))
      timers.current = []
    },
    [],
  )

  const watchWorker = useCallback(
    (campaignId: string) => {
      setPendingIds((ids) => [...ids, campaignId])

      for (let attempt = 1; attempt <= REFRESH_ATTEMPTS; attempt++) {
        const timer = window.setTimeout(() => {
          void load()

          if (attempt === REFRESH_ATTEMPTS) {
            setPendingIds((ids) => ids.filter((id) => id !== campaignId))
          }
        }, REFRESH_INTERVAL_MS * attempt)

        timers.current.push(timer)
      }
    },
    [load],
  )

  function onApproved(campaignId: string) {
    setFeedback(
      'Pagamento aprovado! O valor aparece na barra da campanha em instantes.',
    )
    watchWorker(campaignId)
  }

  return (
    <section className="space-y-8">
      <header className="space-y-3">
        <Badge tone="brand">Painel de transparência</Badge>

        <h1 className="text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
          Campanhas ativas
        </h1>

        <p className="max-w-2xl text-muted">
          Acompanhe em tempo real quanto cada campanha já arrecadou. Toda doação é
          confirmada em instantes e o valor aparece aqui automaticamente.
        </p>
      </header>

      {error && <Alert kind="error" message={error} />}

      {feedback && (
        <Alert
          kind={feedback.startsWith('Pagamento aprovado') ? 'success' : 'error'}
          message={feedback}
        />
      )}

      {loading ? (
        <p className="animate-pulse font-mono text-sm text-dim">
          Carregando campanhas…
        </p>
      ) : campaigns.length === 0 ? (
        <Card className="p-6">
          <p className="text-muted">Nenhuma campanha ativa no momento.</p>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              pending={pendingIds.includes(campaign.id)}
            >
              {isDonor && (
                <Button variant="brand" onClick={() => setCheckout(campaign)}>
                  Doar agora
                </Button>
              )}

              {/* Visitante: leva direto ao login, em vez de so esconder o botao. */}
              {!isAuthenticated && (
                <Button onClick={() => navigate('/login')}>
                  Entrar para doar
                </Button>
              )}

              {/* Gestor nao doa: a API restringe doacoes ao perfil Doador. */}
              {isManager && (
                <p className="rounded-lg border border-line bg-bg-2 px-4 py-2.5 text-xs text-muted">
                  Você está conectado como <strong className="text-fg">gestor</strong>.
                  Doações são feitas por contas de{' '}
                  <strong className="text-fg">doador</strong>.
                </p>
              )}
            </CampaignCard>
          ))}
        </div>
      )}

      {checkout && (
        <CheckoutModal
          campaign={checkout}
          onClose={() => setCheckout(null)}
          onApproved={onApproved}
        />
      )}
    </section>
  )
}
