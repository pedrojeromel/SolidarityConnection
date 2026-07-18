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
import { useAuth } from '../contexts/AuthContext'
import { ApiError } from '../services/http'
import { Alert, Badge, Button, Card, Field } from '../components/ui'
import { colors } from '../theme'
import type { Nav } from '../navigation'

function LoginForm() {
  const navigation = useNavigation<Nav>()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit() {
    setLoading(true)
    setError('')

    try {
      await login({ email, password })
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
    <Card style={styles.card}>
      <Text style={styles.title}>Entrar</Text>
      <Text style={styles.subtitle}>
        Acesse para doar ou gerenciar campanhas.
      </Text>

      {error !== '' && <Alert kind="error" message={error} />}

      <Field
        label="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        placeholder="voce@exemplo.com"
      />

      <Field
        label="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button
        title="Entrar"
        variant="brand"
        loading={loading}
        onPress={() => void submit()}
      />

      <Button
        title="Não tem conta? Cadastre-se"
        variant="ghost"
        onPress={() => navigation.navigate('Register')}
      />
    </Card>
  )
}

function Profile() {
  const { session, isManager, logout } = useAuth()

  if (!session) {
    return null
  }

  return (
    <Card style={styles.card}>
      <View style={styles.avatarWrap}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(session.email[0] ?? '?').toUpperCase()}
          </Text>
        </View>

        <Badge
          label={isManager ? 'Gestor' : 'Doador'}
          color={isManager ? colors.brand2 : colors.ok}
        />
      </View>

      <View style={styles.infoBlock}>
        <Text style={styles.infoLabel}>E-mail</Text>
        <Text style={styles.infoValue}>{session.email || '—'}</Text>
      </View>

      <View style={styles.infoBlock}>
        <Text style={styles.infoLabel}>Tipo de conta</Text>
        <Text style={styles.infoValue}>
          {isManager
            ? 'Gestor da ONG — gerencia campanhas na aba Gestão.'
            : 'Doador — pode doar nas campanhas ativas.'}
        </Text>
      </View>

      <Button title="Sair" variant="danger" onPress={() => void logout()} />
    </Card>
  )
}

export function ProfileScreen() {
  const { isAuthenticated } = useAuth()

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        {isAuthenticated ? <Profile /> : <LoginForm />}
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
    paddingTop: 24,
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
  avatarWrap: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  avatar: {
    height: 64,
    width: 64,
    borderRadius: 32,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#ffffff',
  },
  infoBlock: {
    gap: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.bg2,
    padding: 12,
  },
  infoLabel: {
    fontSize: 11,
    color: colors.dim,
  },
  infoValue: {
    fontSize: 14,
    color: colors.fg,
  },
})
