import { useCallback, useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { statsService, type PlatformStats } from '../services/stats.service'
import { Badge, Button, Card } from '../components/ui'
import { currency } from '../utils/masks'
import { colors } from '../theme'
import type { Nav } from '../navigation'

const FEATURES = [
  {
    title: 'Eventos imutáveis',
    text: 'Cada doação vira um evento registrado que nunca é sobrescrito — existe uma única versão da verdade.',
  },
  {
    title: 'Painel em tempo real',
    text: 'O valor arrecadado é atualizado automaticamente assim que o pagamento é confirmado.',
  },
  {
    title: 'Conciliação automática',
    text: 'Divergências são apuradas continuamente. Zero intervenção manual, zero planilha.',
  },
]

const VALUES = [
  {
    title: 'Missão',
    text: 'Acolher e desenvolver crianças e adolescentes em situação de vulnerabilidade, garantindo direitos básicos e oportunidades reais.',
  },
  {
    title: 'Visão',
    text: 'Ser referência em acolhimento com transparência radical, onde cada doador sabe exatamente o destino da sua contribuição.',
  },
  {
    title: 'Valores',
    text: 'Dignidade, prestação de contas, escuta ativa e compromisso com resultados mensuráveis.',
  },
]

const FIGURES = [
  { n: '1.240', l: 'crianças atendidas' },
  { n: 'R$ 2,4M', l: 'arrecadado desde 2015' },
  { n: '100%', l: 'das doações rastreadas' },
]

const CHANNELS = [
  {
    title: 'Seja voluntário',
    text: 'Doe seu tempo em oficinas, reforço escolar ou apoio administrativo.',
    detail: 'voluntariado@esperancasolidaria.org',
  },
  {
    title: 'Parcerias institucionais',
    text: 'Empresas e coletivos que queiram apoiar campanhas específicas.',
    detail: 'parcerias@esperancasolidaria.org',
  },
  {
    title: 'Prestação de contas',
    text: 'Solicite relatórios financeiros e documentos da organização.',
    detail: 'transparencia@esperancasolidaria.org',
  },
]

export function HomeScreen() {
  const navigation = useNavigation<Nav>()
  const [stats, setStats] = useState<PlatformStats | null>(null)

  useFocusEffect(
    useCallback(() => {
      statsService
        .get()
        .then(setStats)
        .catch(() => setStats(null))
    }, []),
  )

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* ---------- Hero ---------- */}
        <View style={styles.hero}>
          <Badge label="Conexão Solidária" />
          <Text style={styles.heroTitle}>
            A plataforma de doações que{' '}
            <Text style={styles.heroHighlight}>prova cada real.</Text>
          </Text>
          <Text style={styles.heroText}>
            Arrecadação, conciliação e transparência num só lugar. Eventos
            imutáveis, atualização em tempo real e um painel público que
            qualquer doador pode auditar.
          </Text>

          <Button
            title="Ver campanhas ativas"
            variant="brand"
            onPress={() => navigation.navigate('Campaigns')}
          />

          <Text style={styles.heroFootnote}>
            Sem taxa por doação · Painel público · Código aberto
          </Text>
        </View>

        {/* ---------- Indicadores da plataforma ---------- */}
        <View style={styles.statsRow}>
          {[
            { l: 'Arrecadado', n: currency(stats?.totalRaised ?? 0) },
            { l: 'Campanhas', n: `${stats?.activeCampaigns ?? 0}` },
            { l: 'Doações', n: `${stats?.totalDonations ?? 0}` },
          ].map((item) => (
            <Card key={item.l} style={styles.statCard}>
              <Text style={styles.statLabel}>{item.l}</Text>
              <Text style={styles.statValue}>{item.n}</Text>
            </Card>
          ))}
        </View>

        {/* ---------- O projeto ---------- */}
        <Text style={styles.sectionTitle}>
          Construído para provar, não prometer
        </Text>

        {FEATURES.map((feature) => (
          <Card key={feature.title} style={styles.blockCard}>
            <Text style={styles.blockTitle}>{feature.title}</Text>
            <Text style={styles.blockText}>{feature.text}</Text>
          </Card>
        ))}

        {/* ---------- A instituição ---------- */}
        <Badge label="Sobre nós" />
        <Text style={styles.sectionTitle}>
          Cuidar é um trabalho de continuidade
        </Text>
        <Text style={styles.sectionText}>
          A ONG Esperança Solidária existe para que nenhuma criança precise
          escolher entre estudar e comer. Atuamos com acolhimento diário,
          reforço escolar, alimentação e apoio às famílias — e prestamos contas
          de cada real recebido.
        </Text>

        <View style={styles.statsRow}>
          {FIGURES.map((figure) => (
            <Card key={figure.l} style={styles.statCard}>
              <Text style={styles.statValue}>{figure.n}</Text>
              <Text style={styles.statLabel}>{figure.l}</Text>
            </Card>
          ))}
        </View>

        {VALUES.map((value) => (
          <Card key={value.title} style={styles.blockCard}>
            <Text style={styles.blockTitle}>{value.title}</Text>
            <Text style={styles.blockText}>{value.text}</Text>
          </Card>
        ))}

        {/* ---------- Contato ---------- */}
        <Badge label="Contato" />
        <Text style={styles.sectionTitle}>Vamos conversar</Text>
        <Text style={styles.sectionText}>
          Dúvidas, parcerias ou vontade de ajudar de outra forma? Fale com a
          gente.
        </Text>

        {CHANNELS.map((channel) => (
          <Card key={channel.title} style={styles.blockCard}>
            <Text style={styles.blockTitle}>{channel.title}</Text>
            <Text style={styles.blockText}>{channel.text}</Text>
            <Text style={styles.channelEmail}>{channel.detail}</Text>
          </Card>
        ))}

        <Text style={styles.footnote}>
          Atendimento de segunda a sexta, das 9h às 18h.
        </Text>
      </ScrollView>
    </SafeAreaView>
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
    gap: 12,
  },
  hero: {
    gap: 12,
    paddingVertical: 8,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.fg,
    letterSpacing: -0.7,
    lineHeight: 37,
  },
  heroHighlight: {
    color: colors.brand2,
  },
  heroText: {
    fontSize: 14,
    color: colors.muted,
    lineHeight: 21,
  },
  heroFootnote: {
    fontSize: 11,
    color: colors.dim,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    padding: 12,
    gap: 4,
  },
  statLabel: {
    fontSize: 11,
    color: colors.dim,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.fg,
    fontVariant: ['tabular-nums'],
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: colors.fg,
    letterSpacing: -0.4,
    marginTop: 12,
  },
  sectionText: {
    fontSize: 14,
    color: colors.muted,
    lineHeight: 21,
  },
  blockCard: {
    gap: 6,
  },
  blockTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.fg,
  },
  blockText: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 19,
  },
  channelEmail: {
    fontSize: 12,
    color: colors.brand2,
  },
  footnote: {
    fontSize: 11,
    color: colors.dim,
    textAlign: 'center',
    marginTop: 4,
  },
})
