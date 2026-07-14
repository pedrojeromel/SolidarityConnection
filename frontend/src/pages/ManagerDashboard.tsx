import { useCallback, useEffect, useState } from 'react'
import { campaignService } from '../services/campaign.service'
import { ProgressBar } from '../components/ProgressBar'
import { Alert, Button, Card, Field, currency } from '../components/ui'
import { ApiError } from '../services/http'
import { CampaignStatus, type Campaign, type CreateCampaignInput } from '../types'

const STATUS_LABEL: Record<number, string> = {
  [CampaignStatus.Active]: 'Ativa',
  [CampaignStatus.Completed]: 'Concluída',
  [CampaignStatus.Cancelled]: 'Cancelada',
}

const STATUS_STYLE: Record<number, string> = {
  [CampaignStatus.Active]: 'border-neon/40 bg-neon/10 text-neon',
  [CampaignStatus.Completed]: 'border-success/40 bg-success/10 text-success',
  [CampaignStatus.Cancelled]: 'border-danger/40 bg-danger/10 text-danger',
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

const emptyForm = {
  title: '',
  description: '',
  startDate: isoDate(new Date()),
  endDate: isoDate(new Date(Date.now() + 30 * 86_400_000)),
  financialGoal: '',
}

export function ManagerDashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      setCampaigns(await campaignService.listAll())
    } catch {
      setError('Não foi possível carregar as campanhas.')
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  function reset() {
    setForm(emptyForm)
    setEditingId(null)
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()

    setSaving(true)
    setError('')
    setSuccess('')

    const input: CreateCampaignInput = {
      title: form.title,
      description: form.description,
      // A API espera datetime; o input date entrega apenas a data.
      startDate: new Date(`${form.startDate}T00:00:00`).toISOString(),
      endDate: new Date(`${form.endDate}T23:59:59`).toISOString(),
      financialGoal: Number(form.financialGoal.replace(',', '.')),
    }

    try {
      if (editingId) {
        await campaignService.update(editingId, input)
        setSuccess('Campanha atualizada.')
      } else {
        await campaignService.create(input)
        setSuccess('Campanha criada.')
      }

      reset()
      await load()
    } catch (err) {
      // Regras do backend: data fim no passado e meta <= 0 sao rejeitadas.
      setError(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível salvar a campanha.',
      )
    } finally {
      setSaving(false)
    }
  }

  function edit(campaign: Campaign) {
    setEditingId(campaign.id)
    setSuccess('')
    setError('')

    setForm({
      title: campaign.title,
      description: campaign.description,
      startDate: campaign.startDate.slice(0, 10),
      endDate: campaign.endDate.slice(0, 10),
      financialGoal: String(campaign.financialGoal),
    })
  }

  async function cancel(id: string) {
    try {
      await campaignService.cancel(id)
      setSuccess('Campanha cancelada.')

      await load()
    } catch {
      setError('Não foi possível cancelar a campanha.')
    }
  }

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-semibold tracking-[0.3em] text-violet uppercase">
          Área do Gestor
        </p>

        <h1 className="text-glow text-3xl font-bold text-white">
          Gestão de campanhas
        </h1>
      </header>

      {error && <Alert kind="error" message={error} />}
      {success && <Alert kind="success" message={success} />}

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <Card className="animate-rise h-fit space-y-4">
          <h2 className="font-semibold text-white">
            {editingId ? 'Editar campanha' : 'Nova campanha'}
          </h2>

          <form onSubmit={submit} className="space-y-4">
            <Field
              id="title"
              label="Título"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />

            <Field
              id="description"
              label="Descrição"
              required
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />

            <div className="grid grid-cols-2 gap-3">
              <Field
                id="startDate"
                label="Início"
                type="date"
                required
                value={form.startDate}
                onChange={(e) =>
                  setForm({ ...form, startDate: e.target.value })
                }
              />

              <Field
                id="endDate"
                label="Término"
                type="date"
                required
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>

            <Field
              id="financialGoal"
              label="Meta financeira (R$)"
              inputMode="decimal"
              required
              placeholder="10000"
              value={form.financialGoal}
              onChange={(e) =>
                setForm({ ...form, financialGoal: e.target.value })
              }
            />

            <div className="flex gap-2">
              <Button type="submit" loading={saving} className="flex-1">
                {editingId ? 'Salvar' : 'Criar campanha'}
              </Button>

              {editingId && (
                <Button type="button" variant="ghost" onClick={reset}>
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </Card>

        <div className="space-y-4">
          {campaigns.length === 0 ? (
            <Card>
              <p className="text-slate-400">Nenhuma campanha cadastrada.</p>
            </Card>
          ) : (
            campaigns.map((campaign) => (
              <Card key={campaign.id} className="animate-rise space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-white">
                      {campaign.title}
                    </h3>

                    <p className="text-sm text-slate-400">
                      {campaign.description}
                    </p>
                  </div>

                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_STYLE[campaign.status]}`}
                  >
                    {STATUS_LABEL[campaign.status]}
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-neon">
                    {currency(campaign.totalRaised)}
                  </span>

                  <span className="text-xs text-slate-500">
                    de {currency(campaign.financialGoal)}
                  </span>
                </div>

                <ProgressBar
                  raised={campaign.totalRaised}
                  goal={campaign.financialGoal}
                />

                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => edit(campaign)}>
                    Editar
                  </Button>

                  {campaign.status === CampaignStatus.Active && (
                    <Button
                      variant="danger"
                      onClick={() => void cancel(campaign.id)}
                    >
                      Cancelar campanha
                    </Button>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
