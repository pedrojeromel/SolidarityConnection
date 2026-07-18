import { useCallback, useState } from 'react'
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { campaignService } from '../services/campaign.service'
import { useAuth } from '../contexts/AuthContext'
import { Badge, Button, Card, ProgressBar } from '../components/ui'
import { currency } from '../utils/masks'
import { colors } from '../theme'
import type { Nav } from '../navigation'
import type { ActiveCampaign } from '../types'

export function CampaignsScreen() {
  const navigation = useNavigation<Nav>()
  const { isManager, isDonor } = useAuth()

  const [campaigns, setCampaigns] = useState<ActiveCampaign[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      setCampaigns(await campaignService.listActive())
    } catch {
      setError('Não foi possível carregar as campanhas. A API está no ar?')
    } finally {
      setLoading(false)
    }
  }, [])

  // Recarrega ao voltar para a tela (ex.: depois de uma doação).
  useFocusEffect(
    useCallback(() => {
      void load()
    }, [load]),
  )

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={campaigns}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => void load()}
            tintColor={colors.brand2}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Badge label="Campanhas ativas" />
            <Text style={styles.title}>Campanhas</Text>
            <Text style={styles.subtitle}>
              Acompanhe quanto cada campanha já arrecadou. Toda doação é
              somada em tempo real.
            </Text>

            {error !== '' && <Text style={styles.error}>{error}</Text>}
          </View>
        }
        ListEmptyComponent={
          loading ? null : (
            <Card>
              <Text style={styles.empty}>
                Nenhuma campanha ativa no momento.
              </Text>
            </Card>
          )
        }
        renderItem={({ item }) => (
          <Card style={styles.campaignCard}>
            <Text style={styles.campaignTitle}>{item.title}</Text>

            <View style={styles.amountRow}>
              <Text style={styles.amount}>{currency(item.totalRaised)}</Text>
              <Text style={styles.goal}>
                meta {currency(item.financialGoal)}
              </Text>
            </View>

            <ProgressBar raised={item.totalRaised} goal={item.financialGoal} />

            {isDonor ? (
              <Button
                title="Doar agora"
                variant="brand"
                onPress={() => navigation.navigate('Checkout', { campaign: item })}
              />
            ) : isManager ? (
              <Text style={styles.managerNote}>
                Você está conectado como gestor. Doações são exclusivas do
                perfil doador.
              </Text>
            ) : (
              <Button
                title="Entrar para doar"
                variant="default"
                onPress={() => navigation.navigate('Profile')}
              />
            )}
          </Card>
        )}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  list: {
    padding: 16,
    gap: 12,
    paddingBottom: 32,
  },
  header: {
    gap: 10,
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.fg,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: colors.muted,
    lineHeight: 20,
  },
  error: {
    fontSize: 13,
    color: colors.danger,
  },
  empty: {
    color: colors.muted,
    fontSize: 14,
  },
  campaignCard: {
    gap: 12,
  },
  campaignTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.fg,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  amount: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.fg,
    fontVariant: ['tabular-nums'],
  },
  goal: {
    fontSize: 12,
    color: colors.dim,
    fontVariant: ['tabular-nums'],
  },
  managerNote: {
    fontSize: 12,
    color: colors.dim,
    lineHeight: 17,
  },
})
