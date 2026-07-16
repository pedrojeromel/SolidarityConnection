import { useState } from 'react'
import { Alert, Badge, Button, Card, Field } from '../components/ui'

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

export function Contact() {
  const [sent, setSent] = useState(false)

  function submit(event: React.FormEvent) {
    event.preventDefault()
    // Formulario ilustrativo: nao existe endpoint de contato na API.
    setSent(true)
  }

  return (
    <div className="space-y-14">
      <header className="max-w-2xl">
        <Badge tone="brand">Contato</Badge>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
          Vamos conversar
        </h1>
        <p className="mt-4 text-muted">
          Dúvidas, parcerias ou vontade de ajudar de outra forma? Fale com a
          gente.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          {CHANNELS.map((channel) => (
            <Card key={channel.title} className="space-y-2 p-5">
              <h2 className="font-medium text-fg">{channel.title}</h2>
              <p className="text-sm text-muted">{channel.text}</p>
              <p className="font-mono text-xs break-all text-brand-2">
                {channel.detail}
              </p>
            </Card>
          ))}
        </div>

        <Card className="animate-rise h-fit space-y-4 p-6">
          <h2 className="font-medium text-fg">Envie uma mensagem</h2>

          {sent ? (
            <Alert
              kind="success"
              message="Mensagem recebida! Nossa equipe responde em até 2 dias úteis."
            />
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <Field id="contact-name" label="Nome" required />
              <Field id="contact-email" label="E-mail" type="email" required />

              <label htmlFor="contact-message" className="block space-y-1.5">
                <span className="text-xs font-medium text-muted">Mensagem</span>
                <textarea
                  id="contact-message"
                  required
                  rows={4}
                  className="w-full resize-none rounded-lg border border-line-2 bg-bg-2 px-3.5 py-2.5 text-sm text-fg outline-none transition placeholder:text-dim focus:border-brand/70 focus:ring-2 focus:ring-brand/20"
                />
              </label>

              <Button type="submit" variant="brand" className="w-full">
                Enviar mensagem
              </Button>
            </form>
          )}

          <p className="font-mono text-xs text-dim">
            Atendimento de segunda a sexta, das 9h às 18h.
          </p>
        </Card>
      </div>
    </div>
  )
}
