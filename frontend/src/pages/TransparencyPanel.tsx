import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { campaignService } from '../services/campaign.service'
import { donationService } from '../services/donation.service'
import { useAuth } from '../hooks/useAuth'
import { CampaignCard } from '../components/CampaignCard'
import { Alert, Badge, Button, Card, Field } from '../components/ui'
import { ApiError } from '../services/http'
import { maskMoney, parseMoney } from '../utils/masks'
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

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [amount, setAmount] = useState('')
  const [donating, setDonating] = useState(false)
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

  async function donate(campaignId: string) {
    const value = parseMoney(amount)

    if (value <= 0) {
      setFeedback('Informe um valor maior que zero.')
      return
    }

    setDonating(true)
    setFeedback('')

    try {
      await donationService.donate(campaignId, value)

      setSelectedId(null)
      setAmount('')
      setFeedback(
        'Doação recebida! Estamos confirmando o pagamento — o valor aparece na barra em instantes.',
      )

      watchWorker(campaignId)
    } catch (err) {
      setFeedback(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível registrar a doação.',
      )
    } finally {
      setDonating(false)
    }
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
          kind={feedback.startsWith('Doação') ? 'success' : 'error'}
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
              {isDonor && selectedId !== campaign.id && (
                <Button variant="brand" onClick={() => setSelectedId(campaign.id)}>
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

              {isDonor && selectedId === campaign.id && (
                <div className="space-y-3 border-t border-line pt-4">
                  <Field
                    id={`amount-${campaign.id}`}
                    label="Valor da doação (R$)"
                    inputMode="numeric"
                    placeholder="0,00"
                    value={amount}
                    autoFocus
                    onChange={(e) => setAmount(maskMoney(e.target.value))}
                  />

                  <div className="flex gap-2">
                    <Button
                      variant="brand"
                      loading={donating}
                      onClick={() => void donate(campaign.id)}
                      className="flex-1"
                    >
                      Confirmar
                    </Button>

                    <Button
                      variant="ghost"
                      onClick={() => setSelectedId(null)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </CampaignCard>
          ))}
        </div>
      )}
    </section>
  )
}
