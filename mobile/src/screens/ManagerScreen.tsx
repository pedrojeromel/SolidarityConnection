import { useCallback, useState } from 'react'
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { campaignService } from '../services/campaign.service'
import { ApiError } from '../services/http'
import { Alert, Badge, Button, Card, Field, ProgressBar } from '../components/ui'
import {
  currency,
  isoToMaskedDate,
  maskDate,
  maskMoney,
  parseDate,
  parseMoney,
  toMoneyInput,
} from '../utils/masks'
import { colors } from '../theme'
import { CampaignStatus, type Campaign, type CreateCampaignInput } from '../types'

const STATUS_LABEL: Record<number, string> = {
  [CampaignStatus.Active]: 'Ativa',
  [CampaignStatus.Completed]: 'Concluída',
  [CampaignStatus.Cancelled]: 'Cancelada',
}

const STATUS_COLOR: Record<number, string> = {
  [CampaignStatus.Active]: colors.brand2,
  [CampaignStatus.Completed]: colors.ok,
  [CampaignStatus.Cancelled]: colors.danger,
}

function maskedToday(offsetDays = 0): string {
  const date = new Date(Date.now() + offsetDays * 86_400_000)
  const dd = date.getDate().toString().padStart(2, '0')
  const mm = (date.getMonth() + 1).toString().padStart(2, '0')

  return `${dd}/${mm}/${date.getFullYear()}`
}

const emptyForm = {
  title: '',
  description: '',
  startDate: maskedToday(),
  endDate: maskedToday(30),
  financialGoal: '',
}

export function ManagerScreen() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)

    try {
      setCampaigns(await campaignService.listAll())
    } catch {
      setError('Não foi possível carregar as campanhas.')
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      void load()
    }, [load]),
  )

  function reset() {
    setForm(emptyForm)
    setEditingId(null)
  }

  async function submit() {
    setError('')
    setSuccess('')

    const start = parseDate(form.startDate)
    const end = parseDate(form.endDate)

    if (!start || !end) {
      setError('Informe as datas no formato DD/MM/AAAA.')
      return
    }

    setSaving(true)

    const input: CreateCampaignInput = {
      title: form.title,
      description: form.description,
      // A API espera datetime; inicio a 00:00 e fim a 23:59 locais.
      startDate: start.toISOString(),
      endDate: new Date(
        end.getFullYear(),
        end.getMonth(),
        end.getDate(),
        23,
        59,
        59,
      ).toISOString(),
      financialGoal: parseMoney(form.financialGoal),
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
      startDate: isoToMaskedDate(campaign.startDate),
      endDate: isoToMaskedDate(campaign.endDate),
      financialGoal: toMoneyInput(campaign.financialGoal),
    })
  }

  async function complete(campaign: Campaign) {
    const goalMet =
      Number(campaign.totalRaised) >= Number(campaign.financialGoal)

    setError('')
    setSuccess('')

    try {
      await campaignService.complete(campaign.id)
      setSuccess(goalMet ? 'Campanha concluída.' : 'Campanha encerrada.')

      await load()
    } catch {
      setError(
        goalMet
          ? 'Não foi possível concluir a campanha.'
          : 'Não foi possível encerrar a campanha.',
      )
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scroll}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={() => void load()}
          tintColor={colors.brand2}
        />
      }
    >
      <Badge label="Área do gestor" />
      <Text style={styles.title}>Gestão de campanhas</Text>

      {error !== '' && <Alert kind="error" message={error} />}
      {success !== '' && <Alert kind="success" message={success} />}

      <Card style={styles.formCard}>
        <Text style={styles.formTitle}>
          {editingId ? 'Editar campanha' : 'Nova campanha'}
        </Text>

        <Field
          label="Título"
          value={form.title}
          onChangeText={(v) => setForm({ ...form, title: v })}
          autoCapitalize="sentences"
        />

        <Field
          label="Descrição"
          value={form.description}
          onChangeText={(v) => setForm({ ...form, description: v })}
          autoCapitalize="sentences"
        />

        <View style={styles.row}>
          <View style={styles.rowItem}>
            <Field
              label="Início"
              value={form.startDate}
              onChangeText={(v) => setForm({ ...form, startDate: maskDate(v) })}
              keyboardType="numeric"
              placeholder="DD/MM/AAAA"
            />
          </View>
          <View style={styles.rowItem}>
            <Field
              label="Término"
              value={form.endDate}
              onChangeText={(v) => setForm({ ...form, endDate: maskDate(v) })}
              keyboardType="numeric"
              placeholder="DD/MM/AAAA"
            />
          </View>
        </View>

        <Field
          label="Meta financeira (R$)"
          value={form.financialGoal}
          onChangeText={(v) => setForm({ ...form, financialGoal: maskMoney(v) })}
          keyboardType="numeric"
          placeholder="0,00"
        />

        <Button
          title={editingId ? 'Salvar' : 'Criar campanha'}
          variant="brand"
          loading={saving}
          onPress={() => void submit()}
        />

        {editingId && (
          <Button title="Cancelar edição" variant="ghost" onPress={reset} />
        )}
      </Card>

      {campaigns.length === 0 && !loading ? (
        <Card>
          <Text style={styles.empty}>Nenhuma campanha cadastrada.</Text>
        </Card>
      ) : (
        campaigns.map((campaign) => {
          const status = Number(campaign.status)
          const isActive = status === CampaignStatus.Active
          const goalMet =
            Number(campaign.totalRaised) >= Number(campaign.financialGoal)

          return (
            <Card key={campaign.id} style={styles.campaignCard}>
              <View style={styles.campaignHeader}>
                <View style={styles.campaignHeaderText}>
                  <Text style={styles.campaignTitle}>{campaign.title}</Text>
                  <Text style={styles.campaignDescription}>
                    {campaign.description}
                  </Text>
                </View>

                <Badge
                  label={STATUS_LABEL[status] ?? '—'}
                  color={STATUS_COLOR[status] ?? colors.dim}
                />
              </View>

              <View style={styles.amountRow}>
                <Text style={styles.amount}>
                  {currency(campaign.totalRaised)}
                </Text>
                <Text style={styles.goal}>
                  de {currency(campaign.financialGoal)}
                </Text>
              </View>

              <ProgressBar
                raised={campaign.totalRaised}
                goal={campaign.financialGoal}
              />

              {isActive && (
                <View style={styles.actions}>
                  <Button
                    title="Editar"
                    variant="ghost"
                    onPress={() => edit(campaign)}
                    style={styles.actionButton}
                  />

                  {goalMet ? (
                    <Button
                      title="Concluir"
                      variant="brand"
                      onPress={() => void complete(campaign)}
                      style={styles.actionButton}
                    />
                  ) : (
                    <Button
                      title="Encerrar"
                      variant="default"
                      onPress={() => void complete(campaign)}
                      style={styles.actionButton}
                    />
                  )}
                </View>
              )}
            </Card>
          )
        })
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.fg,
    letterSpacing: -0.5,
  },
  formCard: {
    gap: 12,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.fg,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  rowItem: {
    flex: 1,
  },
  empty: {
    color: colors.muted,
    fontSize: 14,
  },
  campaignCard: {
    gap: 12,
  },
  campaignHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  campaignHeaderText: {
    flex: 1,
    gap: 2,
  },
  campaignTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.fg,
  },
  campaignDescription: {
    fontSize: 13,
    color: colors.muted,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  amount: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.fg,
    fontVariant: ['tabular-nums'],
  },
  goal: {
    fontSize: 12,
    color: colors.dim,
    fontVariant: ['tabular-nums'],
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
})
