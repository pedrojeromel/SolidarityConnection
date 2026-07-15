import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { campaignService } from '../services/campaign.service'
import { CampaignCard } from '../components/CampaignCard'
import { Badge, Button, Card, currency } from '../components/ui'
import { useAuth } from '../hooks/useAuth'
import type { ActiveCampaign } from '../types'

const FEATURES = [
  {
    title: 'Eventos imutáveis',
    text: 'Cada doação vira um evento registrado que nunca é sobrescrito — existe uma única versão da verdade.',
    path: 'M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Z',
  },
  {
    title: 'Painel em tempo real',
    text: 'O valor arrecadado é atualizado automaticamente assim que o pagamento é confirmado.',
    path: 'M4 20h16v2H2V2h2v18Zm4-2H6v-6h2v6Zm4 0h-2V8h2v10Zm4 0h-2v-8h2v8Z',
  },
  {
    title: 'Conciliação automática',
    text: 'Divergências são apuradas continuamente. Zero intervenção manual, zero planilha.',
    path: 'M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z',
  },
]

const PARTNERS = [
  'INSTITUTO AMANHÃ',
  'REDE BEM VIVER',
  'FUNDAÇÃO HORIZONTE',
  'COLETIVO RAÍZES',
]

const CHART_BARS = [35, 48, 40, 62, 51, 70, 58, 78, 66, 85, 72, 92, 80, 100]

export function Home() {
  const { isAuthenticated } = useAuth()
  const [campaigns, setCampaigns] = useState<ActiveCampaign[]>([])

  useEffect(() => {
    campaignService
      .listActive()
      .then(setCampaigns)
      .catch(() => setCampaigns([]))
  }, [])

  const totalRaised = campaigns.reduce((s, c) => s + c.totalRaised, 0)

  return (
    <div className="space-y-24 sm:space-y-32">
      {/* ================= HERO ================= */}
      <section className="pt-6 text-center sm:pt-10">
        <div className="mb-6 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-line-2 py-1 pr-3.5 pl-1.5 text-xs text-muted">
            <span className="rounded-full bg-brand px-2 py-0.5 text-[10.5px] font-semibold text-white">
              NOVO
            </span>
            Painel de transparência em tempo real
          </span>
        </div>

        <h1 className="mx-auto max-w-4xl text-4xl font-semibold tracking-tight text-fg sm:text-5xl lg:text-6xl">
          A plataforma de doações que{' '}
          <span className="bg-gradient-to-r from-[#c7d2fe] via-brand-2 to-brand bg-clip-text text-transparent">
            prova cada real.
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base text-muted sm:text-lg">
          Arrecadação, conciliação e transparência num só lugar. Eventos
          imutáveis, atualização em tempo real e um painel público que qualquer
          doador pode auditar.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/campanhas">
            <Button variant="brand" className="w-full px-5 py-2.5 sm:w-auto">
              Ver campanhas ativas
            </Button>
          </Link>
          {!isAuthenticated && (
            <Link to="/cadastro">
              <Button className="w-full px-5 py-2.5 sm:w-auto">
                Criar conta de doador
              </Button>
            </Link>
          )}
        </div>

        <p className="mt-4 font-mono text-xs text-dim">
          Sem taxa por doação · Painel público · Código aberto
        </p>

        {/* ---------- Mock do painel, flutuando ---------- */}
        <div className="mx-auto mt-14 max-w-4xl overflow-hidden rounded-2xl border border-line-2 bg-panel text-left shadow-[0_40px_90px_-40px_rgba(0,0,0,0.9)]">
          <div className="flex items-center gap-2 border-b border-line px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-line-2" />
            <span className="h-2.5 w-2.5 rounded-full bg-line-2" />
            <span className="h-2.5 w-2.5 rounded-full bg-line-2" />
            <span className="ml-2 font-mono text-[11px] text-dim">
              conexao-solidaria.org/painel
            </span>
            <span className="ml-auto flex items-center gap-1.5 font-mono text-[11px] text-ok">
              <span className="status-dot" /> ao vivo
            </span>
          </div>

          <div className="grid sm:grid-cols-[180px_1fr]">
            <div className="hidden border-r border-line p-3 sm:block">
              {['Visão geral', 'Campanhas', 'Doações', 'Doadores', 'Relatórios', 'Auditoria'].map(
                (item, i) => (
                  <div
                    key={item}
                    className={`rounded-md px-2.5 py-2 text-[13px] ${
                      i === 0 ? 'bg-brand-soft text-fg' : 'text-muted'
                    }`}
                  >
                    {item}
                  </div>
                ),
              )}
            </div>

            <div className="p-4 sm:p-5">
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { l: 'Arrecadado', n: currency(totalRaised || 284310), d: '↑ 18,4%' },
                  { l: 'Campanhas', n: String(campaigns.length || 12), d: 'ativas' },
                  { l: 'Doações', n: '1.847', d: '↑ 12,1%' },
                ].map((k) => (
                  <div
                    key={k.l}
                    className="rounded-lg border border-line bg-bg-2 p-3"
                  >
                    <div className="text-[11px] text-dim">{k.l}</div>
                    <div className="tnum mt-1.5 text-lg text-fg">{k.n}</div>
                    <div className="mt-1 text-[10.5px] text-ok">{k.d}</div>
                  </div>
                ))}
              </div>

              <div className="mt-3 rounded-lg border border-line bg-bg-2 p-4">
                <div className="mb-3 flex justify-between font-mono text-[11px] text-dim">
                  <span>arrecadação diária</span>
                  <span>últimos 14 dias</span>
                </div>
                <div className="flex h-20 items-end gap-1.5">
                  {CHART_BARS.map((h, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-t-sm ${
                        i >= 11
                          ? 'bg-gradient-to-t from-brand to-brand-2'
                          : 'bg-line-2'
                      }`}
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section>
        <div className="mb-11 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-fg">
            Construído para provar, não prometer
          </h2>
          <p className="mt-2.5 text-muted">
            A arquitetura que dá credibilidade à sua arrecadação.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title} className="p-6">
              <div className="mb-3.5 grid h-9 w-9 place-items-center rounded-lg border border-line-2 bg-brand-soft text-brand-2">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                  <path d={f.path} />
                </svg>
              </div>
              <h3 className="font-medium tracking-tight text-fg">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted">{f.text}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ================= CAMPANHAS ================= */}
      {campaigns.length > 0 && (
        <section>
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Badge tone="brand">Campanhas ativas</Badge>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-fg">
                Onde sua doação vai agora
              </h2>
            </div>
            <Link to="/campanhas">
              <Button className="w-full sm:w-auto">Ver todas</Button>
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {campaigns.slice(0, 3).map((c) => (
              <CampaignCard key={c.id} campaign={c}>
                <Link to="/campanhas" className="block">
                  <Button variant="brand" className="w-full">
                    Doar
                  </Button>
                </Link>
              </CampaignCard>
            ))}
          </div>
        </section>
      )}

      {/* ================= PARCEIROS ================= */}
      <section>
        <p className="mb-8 text-center font-mono text-[11px] tracking-widest text-dim uppercase">
          Parceiros institucionais
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-50">
          {PARTNERS.map((p) => (
            <span
              key={p}
              className="font-mono text-xs tracking-wider text-dim"
            >
              {p}
            </span>
          ))}
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="relative overflow-hidden rounded-2xl border border-line-2 bg-panel px-6 py-14 text-center sm:px-12">
        <div className="pointer-events-none absolute -top-20 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-brand/15 blur-[90px]" />
        <div className="relative">
          <h2 className="text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            Comece a arrecadar com transparência
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted">
            Você escolhe a campanha, doa em segundos e acompanha o valor
            arrecadado sendo atualizado em tempo real. Aberto e auditável.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/campanhas">
              <Button variant="brand" className="w-full px-5 py-2.5 sm:w-auto">
                Ver campanhas
              </Button>
            </Link>
            <Link to="/cadastro">
              <Button className="w-full px-5 py-2.5 sm:w-auto">
                Quero ser doador
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
