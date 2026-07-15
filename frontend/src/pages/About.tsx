import { Badge, Card } from '../components/ui'

const TIMELINE = [
  {
    year: '2015',
    title: 'O começo',
    text: 'Um galpão cedido no centro da cidade e doze crianças atendidas no contraturno escolar.',
  },
  {
    year: '2018',
    title: 'Primeira sede própria',
    text: 'Com apoio de doadores recorrentes, inauguramos a sede com cozinha, biblioteca e sala de estudos.',
  },
  {
    year: '2021',
    title: 'Programa de educação digital',
    text: 'Oficinas de tecnologia para adolescentes, com 60 formados no primeiro ano.',
  },
  {
    year: '2026',
    title: 'Plataforma Conexão Solidária',
    text: 'Digitalização da gestão de campanhas e doações, com painel público de transparência.',
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

export function About() {
  return (
    <div className="space-y-20 sm:space-y-24">
      <section className="max-w-3xl">
        <Badge tone="brand">Sobre nós</Badge>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-fg sm:text-4xl lg:text-5xl">
          Cuidar é um trabalho de continuidade
        </h1>
        <p className="mt-5 text-muted sm:text-lg">
          A ONG Esperança Solidária existe para que nenhuma criança precise
          escolher entre estudar e comer. Atuamos com acolhimento diário, reforço
          escolar, alimentação e apoio às famílias — e prestamos contas de cada
          real recebido.
        </p>

        <div className="mt-9 grid grid-cols-3 gap-6 border-t border-line pt-7">
          {FIGURES.map((f) => (
            <div key={f.l}>
              <div className="tnum text-2xl text-fg sm:text-3xl">{f.n}</div>
              <div className="mt-1 text-xs text-dim">{f.l}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {VALUES.map((value) => (
          <Card key={value.title} className="space-y-2 p-6">
            <h2 className="font-medium text-fg">{value.title}</h2>
            <p className="text-sm text-muted">{value.text}</p>
          </Card>
        ))}
      </section>

      <section>
        <div className="mb-9 max-w-2xl">
          <Badge tone="muted">Nossa trajetória</Badge>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-fg">
            De doze crianças a uma rede de apoio
          </h2>
        </div>

        <ol className="relative space-y-4 border-l border-line pl-6 sm:pl-8">
          {TIMELINE.map((item) => (
            <li key={item.year} className="relative">
              <span className="absolute top-3 -left-[27px] h-2.5 w-2.5 rounded-full bg-brand sm:-left-[35px]" />
              <Card className="space-y-1.5 p-5">
                <span className="font-mono text-sm text-brand-2">{item.year}</span>
                <h3 className="font-medium text-fg">{item.title}</h3>
                <p className="text-sm text-muted">{item.text}</p>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-2xl border border-line bg-panel px-6 py-10 text-center sm:px-12">
        <h2 className="text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
          Transparência não é promessa, é processo
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-muted sm:text-base">
          Toda doação recebida é registrada individualmente e o valor arrecadado
          de cada campanha é publicado no painel público, atualizado
          automaticamente após a confirmação do pagamento.
        </p>
      </section>
    </div>
  )
}
