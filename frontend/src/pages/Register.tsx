import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/auth.service'
import { Alert, Button, Card, Field } from '../components/ui'
import { ApiError } from '../services/http'

/** Mascara 000.000.000-00. O backend aceita com ou sem mascara. */
function maskCpf(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)

  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4')
}

export function Register() {
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [cpf, setCpf] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: React.FormEvent) {
    event.preventDefault()

    setLoading(true)
    setError('')

    try {
      await authService.register({ fullName, email, cpf, password })

      navigate('/login')
    } catch (err) {
      // A API valida CPF e e-mail unico; propagamos a mensagem dela.
      setError(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível concluir o cadastro.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <Card className="animate-rise space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Criar conta</h1>

          <p className="text-sm text-slate-400">
            Cadastro público de doador.
          </p>
        </header>

        {error && <Alert kind="error" message={error} />}

        <form onSubmit={submit} className="space-y-4">
          <Field
            id="fullName"
            label="Nome completo"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <Field
            id="email"
            label="E-mail"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Field
            id="cpf"
            label="CPF"
            required
            inputMode="numeric"
            placeholder="000.000.000-00"
            value={cpf}
            onChange={(e) => setCpf(maskCpf(e.target.value))}
          />

          <Field
            id="password"
            label="Senha"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button type="submit" loading={loading} className="w-full">
            Cadastrar
          </Button>
        </form>

        <p className="text-center text-sm text-slate-400">
          Já tem conta?{' '}
          <Link to="/login" className="font-semibold text-neon hover:underline">
            Entrar
          </Link>
        </p>
      </Card>
    </div>
  )
}
