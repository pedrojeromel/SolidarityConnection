import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/auth.service'
import { Alert, Button, Card, Field } from '../components/ui'
import { PasswordRules, isPasswordStrong } from '../components/PasswordRules'
import { ApiError } from '../services/http'
import { maskCpf } from '../utils/masks'

export function Register() {
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [cpf, setCpf] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const passwordsMatch =
    confirmation.length > 0 && password === confirmation

  const canSubmit =
    isPasswordStrong(password) && passwordsMatch

  async function submit(event: React.FormEvent) {
    event.preventDefault()

    if (!isPasswordStrong(password)) {
      setError('A senha não atende aos requisitos abaixo.')
      return
    }

    if (!passwordsMatch) {
      setError('A confirmação de senha não confere.')
      return
    }

    setLoading(true)
    setError('')

    try {
      await authService.register({ fullName, email, cpf, password })

      navigate('/login')
    } catch (err) {
      // A API valida CPF, forca da senha e e-mail unico; propagamos a mensagem dela.
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
      <Card className="animate-rise space-y-6 p-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-fg">
            Criar conta
          </h1>

          <p className="text-sm text-muted">Cadastro público de doador.</p>
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

          <div className="space-y-2">
            <Field
              id="password"
              label="Senha"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <PasswordRules value={password} />
          </div>

          <div className="space-y-1.5">
            <Field
              id="confirmation"
              label="Confirmar senha"
              type="password"
              required
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
            />

            {confirmation.length > 0 && (
              <p
                className={`text-xs ${
                  passwordsMatch ? 'text-ok' : 'text-danger'
                }`}
              >
                {passwordsMatch
                  ? 'As senhas conferem.'
                  : 'As senhas não conferem.'}
              </p>
            )}
          </div>

          <Button
            type="submit"
            loading={loading}
            disabled={!canSubmit}
            className="w-full"
          >
            Cadastrar
          </Button>
        </form>

        <p className="text-center text-sm text-muted">
          Já tem conta?{' '}
          <Link to="/login" className="font-medium text-brand-2 hover:underline">
            Entrar
          </Link>
        </p>
      </Card>
    </div>
  )
}
