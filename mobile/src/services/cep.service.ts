export interface CepAddress {
  street: string
  city: string
  state: string
}

interface ViaCepResponse {
  erro?: boolean | string
  logradouro?: string
  localidade?: string
  uf?: string
}

/**
 * Consulta o endereço na ViaCEP. Retorna null quando o CEP não existe
 * ou a API está indisponível (o usuário ainda pode digitar manualmente).
 */
export async function lookupCep(cep: string): Promise<CepAddress | null> {
  const digits = cep.replace(/\D/g, '')

  if (digits.length !== 8) {
    return null
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`)

    if (!response.ok) {
      return null
    }

    const data = (await response.json()) as ViaCepResponse

    if (data.erro) {
      return null
    }

    return {
      street: data.logradouro ?? '',
      city: data.localidade ?? '',
      state: data.uf ?? '',
    }
  } catch {
    return null
  }
}
