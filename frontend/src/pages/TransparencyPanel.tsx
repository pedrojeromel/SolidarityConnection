import { useCallback, useEffect, useRef, useState } from 'react'
import { campaignService } from '../services/campaign.service'
import { donationService } from '../services/donation.service'
import { useAuth } from '../hooks/useAuth'
import { ProgressBar } from '../components/ProgressBar'
import { Alert, Button, Card, Field, currency } from '../components/ui'
import { ApiError } from '../services/http'
import type { ActiveCampaign } from '../types'

/**
 * Enquanto o Worker nao consumir o evento da fila, o valor arrecadado
 * ainda nao mudou no banco. Recarregamos o painel algumas vezes para que
 * a barra suba sozinha assim que o consumo acontecer.
 */
const REFRESH_INTERVAL_MS = 1500
const REFRESH_ATTEMPTS = 8

export function TransparencyPanel() {
  const { isAuthenticated, isDonor } = useAuth()

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

  useEffect(
    () => () => timers.current.forEach(window.clearTimeout),
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
    const value = Number(amount.replace(',', '.'))

    if (!Number.isFinite(value) || value <= 0) {
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
        'Doação enviada! O evento foi publicado na fila — acompanhe a barra subir.',
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
        <p className="text-xs font-semibold tracking-[0.3em] text-neon uppercase">
          Painel de Transparência
        </p>

        <h1 className="text-glow text-4xl font-bold text-white sm:text-5xl">
          Campanhas ativas
        </h1>

        <p className="max-w-2xl text-slate-400">
          Todo valor arrecadado é atualizado de forma assíncrona pelo Worker,
          após o processamento da fila de doações.
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
        <p className="animate-pulse-glow text-slate-500">Carregando campanhas...</p>
      ) : campaigns.length === 0 ? (
        <Card>
          <p className="text-slate-400">
            Nenhuma campanha ativa no momento.
          </p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {campaigns.map((campaign, index) => (
            <Card
              key={campaign.id}
              className="glass-hover animate-rise flex flex-col gap-5"
            >
              <div style={{ animationDelay: `${index * 60}ms` }}>
                <h2 className="text-lg font-semibold text-white">
                  {campaign.title}
                </h2>
              </div>

              <div className="space-y-1">
                <p className="text-2xl font-bold text-neon">
                  {currency(campaign.totalRaised)}
                </p>

                <p className="text-xs text-slate-500">
                  de {currency(campaign.financialGoal)} de meta
                </p>
              </div>

              <ProgressBar
                raised={campaign.totalRaised}
                goal={campaign.financialGoal}
                pending={pendingIds.includes(campaign.id)}
              />

              {isDonor && selectedId !== campaign.id && (
                <Button onClick={() => setSelectedId(campaign.id)}>
                  Doar agora
                </Button>
              )}

              {isDonor && selectedId === campaign.id && (
                <div className="space-y-3 border-t border-white/10 pt-4">
                  <Field
                    id={`amount-${campaign.id}`}
                    label="Valor da doação (R$)"
                    inputMode="decimal"
                    placeholder="150,00"
                    value={amount}
                    autoFocus
                    onChange={(e) => setAmount(e.target.value)}
                  />

                  <div className="flex gap-2">
                    <Button
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

              {!isAuthenticated && (
                <p className="text-xs text-slate-500">
                  Faça login como doador para contribuir.
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}
