import { useEffect, useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native'
import { lookupCep } from '../services/cep.service'
import { paymentService } from '../services/payment.service'
import { ApiError } from '../services/http'
import { Alert, Button, Card, Field } from '../components/ui'
import { maskCard, maskCep, maskMoney, onlyDigits, parseMoney } from '../utils/masks'
import { colors } from '../theme'
import type { Nav, RootStackParamList } from '../navigation'

const MIN_AMOUNT = 5
const TEST_CARD = '4242 4242 4242 4242'

type Status = 'form' | 'processing' | 'approved'

export function CheckoutScreen() {
  const navigation = useNavigation<Nav>()
  const route = useRoute<RouteProp<RootStackParamList, 'Checkout'>>()
  const { campaign } = route.params

  const [status, setStatus] = useState<Status>('form')
  const [error, setError] = useState('')

  const [amount, setAmount] = useState('')
  const [card, setCard] = useState('')
  const [holder, setHolder] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')

  const [cep, setCep] = useState('')
  const [street, setStreet] = useState('')
  const [number, setNumber] = useState('')
  const [city, setCity] = useState('')
  const [uf, setUf] = useState('')
  const [cepLoading, setCepLoading] = useState(false)
  const [cepError, setCepError] = useState('')

  // Preenche rua, cidade e UF automaticamente ao completar o CEP (ViaCEP).
  useEffect(() => {
    const digits = onlyDigits(cep)

    if (digits.length !== 8) {
      setCepLoading(false)
      setCepError('')
      return
    }

    let cancelled = false

    async function resolve() {
      setCepLoading(true)
      setCepError('')

      const address = await lookupCep(digits)

      if (cancelled) return

      setCepLoading(false)

      if (!address) {
        setCepError('CEP não encontrado. Preencha o endereço manualmente.')
        return
      }

      setStreet(address.street)
      setCity(address.city)
      setUf(address.state)
    }

    void resolve()

    return () => {
      cancelled = true
    }
  }, [cep])

  async function pay() {
    setError('')

    const value = parseMoney(amount)
    if (value < MIN_AMOUNT) {
      setError(`O valor mínimo da doação é R$ ${MIN_AMOUNT},00.`)
      return
    }

    const [expiryMonth, expiryYear] = expiry.split('/')
    if (!expiryMonth || !expiryYear) {
      setError('Informe a validade do cartão no formato MM/AA.')
      return
    }

    setStatus('processing')

    try {
      const result = await paymentService.checkout({
        campaignId: campaign.id,
        amount: value,
        card: {
          number: onlyDigits(card),
          holder,
          expiryMonth,
          expiryYear: `20${onlyDigits(expiryYear).slice(0, 2)}`,
          cvv: onlyDigits(cvv),
        },
        address: {
          zipCode: onlyDigits(cep),
          street,
          number,
          city,
          state: uf,
        },
      })

      if (result.status === 'approved') {
        setStatus('approved')
        return
      }

      setError(result.message)
      setStatus('form')
    } catch (err) {
      // 402 = recusado pela operadora; demais erros de rede/servidor.
      setError(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível processar o pagamento.',
      )
      setStatus('form')
    }
  }

  if (status === 'approved') {
    return (
      <View style={styles.approvedContainer}>
        <Card style={styles.approvedCard}>
          <Text style={styles.approvedIcon}>✓</Text>
          <Text style={styles.approvedTitle}>Pagamento aprovado</Text>
          <Text style={styles.approvedText}>
            Sua doação para {campaign.title} foi confirmada. Enviamos um
            e-mail de comprovante e o valor será somado à campanha em
            instantes.
          </Text>
          <Button
            title="Concluir"
            variant="brand"
            onPress={() => navigation.goBack()}
          />
        </Card>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card style={styles.card}>
          <View>
            <Text style={styles.donatingTo}>Você está doando para</Text>
            <Text style={styles.campaignTitle}>{campaign.title}</Text>
          </View>

          {error !== '' && <Alert kind="error" message={error} />}

          <Field
            label="Valor da doação (R$)"
            value={amount}
            onChangeText={(v) => setAmount(maskMoney(v))}
            keyboardType="numeric"
            placeholder="0,00"
          />

          <Text style={styles.sectionTitle}>DADOS DO CARTÃO</Text>

          <Field
            label="Número do cartão"
            value={card}
            onChangeText={(v) => setCard(maskCard(v))}
            keyboardType="numeric"
            placeholder="0000 0000 0000 0000"
          />

          <Field
            label="Nome impresso no cartão"
            value={holder}
            onChangeText={(v) => setHolder(v.toUpperCase())}
            autoCapitalize="characters"
          />

          <View style={styles.row}>
            <View style={styles.rowItem}>
              <Field
                label="Validade (MM/AA)"
                value={expiry}
                onChangeText={(v) => {
                  const d = onlyDigits(v, 4)
                  setExpiry(d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d)
                }}
                keyboardType="numeric"
                placeholder="12/30"
              />
            </View>
            <View style={styles.rowItem}>
              <Field
                label="CVV"
                value={cvv}
                onChangeText={(v) => setCvv(onlyDigits(v, 4))}
                keyboardType="numeric"
                placeholder="123"
              />
            </View>
          </View>

          <Text style={styles.sectionTitle}>ENDEREÇO DE COBRANÇA</Text>

          <Field
            label={cepLoading ? 'CEP (buscando…)' : 'CEP'}
            value={cep}
            onChangeText={(v) => setCep(maskCep(v))}
            keyboardType="numeric"
            placeholder="00000-000"
          />

          {cepError !== '' && <Text style={styles.cepError}>{cepError}</Text>}

          <Field label="Rua" value={street} onChangeText={setStreet} />

          <View style={styles.row}>
            <View style={styles.rowItem}>
              <Field label="Número" value={number} onChangeText={setNumber} />
            </View>
            <View style={[styles.rowItem, { flex: 2 }]}>
              <Field label="Cidade" value={city} onChangeText={setCity} />
            </View>
            <View style={styles.rowItem}>
              <Field
                label="UF"
                value={uf}
                onChangeText={(v) => setUf(v.toUpperCase())}
                maxLength={2}
                autoCapitalize="characters"
              />
            </View>
          </View>

          <View style={styles.testNote}>
            <Text style={styles.testNoteText}>
              Ambiente de teste. Use o cartão {TEST_CARD} para aprovar;
              qualquer outro é recusado.
            </Text>
          </View>

          <Button
            title={status === 'processing' ? 'Processando…' : 'Pagar e doar'}
            variant="brand"
            loading={status === 'processing'}
            onPress={() => void pay()}
          />

          <Button
            title="Cancelar"
            variant="default"
            disabled={status === 'processing'}
            onPress={() => navigation.goBack()}
          />
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
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
  },
  card: {
    gap: 14,
  },
  donatingTo: {
    fontSize: 12,
    color: colors.dim,
  },
  campaignTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.fg,
  },
  sectionTitle: {
    fontSize: 11,
    letterSpacing: 1.2,
    color: colors.dim,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  rowItem: {
    flex: 1,
  },
  cepError: {
    fontSize: 12,
    color: colors.danger,
  },
  testNote: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.bg2,
    padding: 12,
  },
  testNoteText: {
    fontSize: 12,
    color: colors.dim,
    lineHeight: 17,
  },
  approvedContainer: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    padding: 16,
  },
  approvedCard: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 32,
  },
  approvedIcon: {
    fontSize: 34,
    color: colors.ok,
    fontWeight: '700',
  },
  approvedTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.fg,
  },
  approvedText: {
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 19,
  },
})
