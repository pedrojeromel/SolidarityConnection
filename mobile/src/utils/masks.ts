/** Mascara 000.000.000-00. O backend aceita com ou sem mascara. */
export function maskCpf(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)

  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4')
}

/**
 * Mascara monetaria pt-BR (1.234,56) sem depender de Intl,
 * que varia entre engines (Hermes) e plataformas.
 */
export function maskMoney(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 12)

  if (!digits) {
    return ''
  }

  const n = Number(digits)
  const cents = (n % 100).toString().padStart(2, '0')
  const intPart = Math.floor(n / 100)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')

  return `${intPart},${cents}`
}

/** Converte o valor mascarado de volta para numero (1.234,56 -> 1234.56). */
export function parseMoney(masked: string): number {
  const digits = masked.replace(/\D/g, '')

  return digits ? Number(digits) / 100 : 0
}

/** Formata um numero ja conhecido para edicao no campo mascarado. */
export function toMoneyInput(value: number): string {
  return maskMoney(Math.round(value * 100).toString())
}

/** Formata como moeda para exibicao. */
export function currency(value: number): string {
  return `R$ ${toMoneyInput(value) || '0,00'}`
}

/** Mascara de cartao: 0000 0000 0000 0000 (ate 16 digitos). */
export function maskCard(value: string): string {
  return value
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1 ')
    .trim()
}

/** Mascara de CEP: 00000-000. */
export function maskCep(value: string): string {
  return value
    .replace(/\D/g, '')
    .slice(0, 8)
    .replace(/(\d{5})(\d)/, '$1-$2')
}

/** Mascara de data DD/MM/AAAA. */
export function maskDate(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8)

  return digits
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{2})\/(\d{2})(\d)/, '$1/$2/$3')
}

/** Converte DD/MM/AAAA para Date local; null quando invalida/incompleta. */
export function parseDate(masked: string): Date | null {
  const [dd, mm, yyyy] = masked.split('/')

  if (!dd || !mm || !yyyy || yyyy.length !== 4) {
    return null
  }

  const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd))

  if (
    date.getFullYear() !== Number(yyyy) ||
    date.getMonth() !== Number(mm) - 1 ||
    date.getDate() !== Number(dd)
  ) {
    return null
  }

  return date
}

/** Converte AAAA-MM-DD (ISO da API) para DD/MM/AAAA. */
export function isoToMaskedDate(iso: string): string {
  const [yyyy, mm, dd] = iso.slice(0, 10).split('-')

  return `${dd}/${mm}/${yyyy}`
}

/** Mantem apenas digitos, com limite opcional. */
export function onlyDigits(value: string, max?: number): string {
  const digits = value.replace(/\D/g, '')
  return max ? digits.slice(0, max) : digits
}
