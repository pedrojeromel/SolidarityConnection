import { useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { authService } from '../services/auth.service'
import { ApiError } from '../services/http'
import { Alert, Button, Card, Field } from '../components/ui'
import { maskCpf } from '../utils/masks'
import { colors } from '../theme'
import type { Nav } from '../navigation'

const PASSWORD_RULES = [
  {
    label: 'Mínimo de 8 caracteres',
    test: (value: string) => value.length >= 8,
  },
  {
    label: 'Ao menos uma letra',
    test: (value: string) => /\p{L}/u.test(value),
  },
  {
    label: 'Ao menos um número',
    test: (value: string) => /\d/.test(value),
  },
  {
    label: 'Ao menos um caractere especial (!@#$%...)',
    test: (value: string) => /[^\p{L}\d\s]/u.test(value),
  },
]

function isPasswordStrong(value: string): boolean {
  return PASSWORD_RULES.every((rule) => rule.test(value))
}

export function RegisterScreen() {
  const navigation = useNavigation<Nav>()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [cpf, setCpf] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const passwordsMatch = confirmation.length > 0 && password === confirmation
  const canSubmit = isPasswordStrong(password) && passwordsMatch

  async function submit() {
    if (!canSubmit) {
      setError('Revise a senha e a confirmação.')
      return
    }

    setLoading(true)
    setError('')

    try {
      await authService.register({ fullName, email, cpf, password })

      setSuccess('Cadastro concluído! Faça login para continuar.')

      // Volta para a aba Perfil, onde fica o formulario de login.
      setTimeout(() => navigation.goBack(), 1200)
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card style={styles.card}>
          <Text style={styles.title}>Criar conta</Text>
          <Text style={styles.subtitle}>Cadastro público de doador.</Text>

          {error !== '' && <Alert kind="error" message={error} />}
          {success !== '' && <Alert kind="success" message={success} />}

          <Field
            label="Nome completo"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />

          <Field
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <Field
            label="CPF"
            value={cpf}
            onChangeText={(v) => setCpf(maskCpf(v))}
            keyboardType="numeric"
            placeholder="000.000.000-00"
          />

          <Field
            label="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <View style={styles.rules}>
            {PASSWORD_RULES.map((rule) => {
              const ok = rule.test(password)

              return (
                <Text
                  key={rule.label}
                  style={[styles.rule, { color: ok ? colors.ok : colors.dim }]}
                >
                  {ok ? '✓' : '○'} {rule.label}
                </Text>
              )
            })}
          </View>

          <Field
            label="Confirmar senha"
            value={confirmation}
            onChangeText={setConfirmation}
            secureTextEntry
          />

          {confirmation.length > 0 && (
            <Text
              style={{
                fontSize: 12,
                color: passwordsMatch ? colors.ok : colors.danger,
              }}
            >
              {passwordsMatch
                ? 'As senhas conferem.'
                : 'As senhas não conferem.'}
            </Text>
          )}

          <Button
            title="Cadastrar"
            variant="brand"
            loading={loading}
            disabled={!canSubmit}
            onPress={() => void submit()}
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.fg,
  },
  subtitle: {
    fontSize: 13,
    color: colors.muted,
    marginTop: -8,
  },
  rules: {
    gap: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.bg2,
    padding: 12,
  },
  rule: {
    fontSize: 12,
  },
})
