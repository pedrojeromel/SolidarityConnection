import { useEffect, useState } from 'react'
import { paymentService } from '../services/payment.service'
import { ApiError } from '../services/http'
import { Alert, Button, Field } from './ui'
import { maskCard, maskCep, maskMoney, onlyDigits, parseMoney } from '../utils/masks'
import type { ActiveCampaign } from '../types'

const MIN_AMOUNT = 5
const TEST_CARD = '4242 4242 4242 4242'

type Status = 'form' | 'processing' | 'approved'

interface CheckoutModalProps {
  campaign: ActiveCampaign
  onClose: () => void
  onApproved: (campaignId: string) => void
}

export function CheckoutModal({
  campaign,
  onClose,
  onApproved,
}: CheckoutModalProps) {
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

  // Fecha no ESC; bloqueia o scroll do fundo enquanto a modal está aberta.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && status !== 'processing') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose, status])

  async function pay(event: React.FormEvent) {
    event.preventDefault()
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
        onApproved(campaign.id)
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={() => status !== 'processing' && onClose()}
    >
      <div
        className="animate-rise max-h-[92vh] w-full max-w-md overflow-y-auto rounded-2xl border border-line-2 bg-panel shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho: identidade de "área segura" */}
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-ok">
              <path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Zm-1 13-3.5-3.5 1.4-1.4L11 12.2l4.1-4.1 1.4 1.4L11 15Z" />
            </svg>
            <span className="text-sm font-medium text-fg">Pagamento seguro</span>
          </div>
          {status !== 'processing' && (
            <button
              onClick={onClose}
              aria-label="Cancelar"
              className="text-dim transition hover:text-fg"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          )}
        </div>

        {status === 'approved' ? (
          <div className="space-y-4 px-6 py-10 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-ok/15">
              <svg viewBox="0 0 24 24" className="h-7 w-7 fill-ok">
                <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-fg">Pagamento aprovado</h2>
            <p className="text-sm text-muted">
              Sua doação para <strong className="text-fg">{campaign.title}</strong>{' '}
              foi confirmada. Enviamos um e-mail de comprovante e o valor será
              somado à campanha em instantes.
            </p>
            <Button variant="brand" onClick={onClose} className="w-full">
              Concluir
            </Button>
          </div>
        ) : (
          <form onSubmit={pay} className="space-y-4 px-5 py-5">
            <div>
              <p className="text-xs text-dim">Você está doando para</p>
              <p className="font-medium text-fg">{campaign.title}</p>
            </div>

            {error && <Alert kind="error" message={error} />}

            <Field
              id="amount"
              label="Valor da doação (R$)"
              inputMode="numeric"
              placeholder="0,00"
              autoFocus
              value={amount}
              onChange={(e) => setAmount(maskMoney(e.target.value))}
            />

            <div className="border-t border-line pt-4">
              <p className="mb-3 font-mono text-[11px] tracking-wider text-dim uppercase">
                Dados do cartão
              </p>
              <div className="space-y-3">
                <Field
                  id="card"
                  label="Número do cartão"
                  inputMode="numeric"
                  placeholder="0000 0000 0000 0000"
                  value={card}
                  onChange={(e) => setCard(maskCard(e.target.value))}
                />
                <Field
                  id="holder"
                  label="Nome impresso no cartão"
                  value={holder}
                  onChange={(e) => setHolder(e.target.value.toUpperCase())}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Field
                    id="expiry"
                    label="Validade (MM/AA)"
                    inputMode="numeric"
                    placeholder="12/30"
                    value={expiry}
                    onChange={(e) => {
                      const d = onlyDigits(e.target.value, 4)
                      setExpiry(
                        d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d,
                      )
                    }}
                  />
                  <Field
                    id="cvv"
                    label="CVV"
                    inputMode="numeric"
                    placeholder="123"
                    value={cvv}
                    onChange={(e) => setCvv(onlyDigits(e.target.value, 4))}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-line pt-4">
              <p className="mb-3 font-mono text-[11px] tracking-wider text-dim uppercase">
                Endereço de cobrança
              </p>
              <div className="space-y-3">
                <div className="grid grid-cols-[120px_1fr] gap-3">
                  <Field
                    id="cep"
                    label="CEP"
                    inputMode="numeric"
                    placeholder="00000-000"
                    value={cep}
                    onChange={(e) => setCep(maskCep(e.target.value))}
                  />
                  <Field
                    id="street"
                    label="Rua"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-[100px_1fr_80px] gap-3">
                  <Field
                    id="number"
                    label="Número"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                  />
                  <Field
                    id="city"
                    label="Cidade"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                  <Field
                    id="uf"
                    label="UF"
                    value={uf}
                    maxLength={2}
                    onChange={(e) => setUf(e.target.value.toUpperCase())}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-line bg-bg-2 px-3 py-2.5 font-mono text-[11px] text-dim">
              Ambiente de teste. Use o cartão{' '}
              <span className="text-brand-2">{TEST_CARD}</span> para aprovar;
              qualquer outro é recusado.
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                type="submit"
                variant="brand"
                loading={status === 'processing'}
                className="flex-1"
              >
                {status === 'processing' ? 'Processando…' : 'Pagar e doar'}
              </Button>
              <Button
                type="button"
                variant="default"
                onClick={onClose}
                disabled={status === 'processing'}
              >
                Cancelar
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
