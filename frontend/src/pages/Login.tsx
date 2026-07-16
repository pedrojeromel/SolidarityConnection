import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Alert, Button, Card, Field } from '../components/ui'
import { ApiError } from '../services/http'

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: React.FormEvent) {
    event.preventDefault()

    setLoading(true)
    setError('')

    try {
      await login({ email, password })

      navigate('/')
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 401
          ? 'E-mail ou senha inválidos.'
          : 'Não foi possível entrar. Tente novamente.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <Card className="animate-rise space-y-6 p-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-fg">Entrar</h1>

          <p className="text-sm text-muted">
            Acesse para doar ou gerenciar campanhas.
          </p>
        </header>

        {error && <Alert kind="error" message={error} />}

        <form onSubmit={submit} className="space-y-4">
          <Field
            id="email"
            label="E-mail"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            Entrar
          </Button>
        </form>

        <p className="text-center text-sm text-muted">
          Não tem conta?{' '}
          <Link to="/cadastro" className="font-medium text-brand-2 hover:underline">
            Cadastre-se como doador
          </Link>
        </p>
      </Card>
    </div>
  )
}
