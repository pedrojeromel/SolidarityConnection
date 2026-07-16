import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

/**
 * Sem isto, qualquer erro de renderizacao derruba a arvore inteira e o usuario
 * ve apenas uma tela preta — sem pista alguma do que aconteceu.
 * Aqui o erro vira mensagem visivel, com acao de recuperacao.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Erro de renderização:', error, info.componentStack)
  }

  private reset = () => {
    this.setState({ error: null })
    window.location.assign('/')
  }

  render() {
    const { error } = this.state

    if (!error) {
      return this.props.children
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-bg p-6">
        <div className="w-full max-w-lg space-y-4 rounded-2xl border border-line bg-panel p-6">
          <h1 className="text-xl font-semibold text-danger">
            Algo deu errado nesta página
          </h1>

          <p className="text-sm text-muted">
            A aplicação encontrou um erro inesperado. Detalhes técnicos:
          </p>

          <pre className="max-h-48 overflow-auto rounded-lg border border-line bg-bg-2 p-4 text-xs break-words whitespace-pre-wrap text-danger">
            {error.message}
          </pre>

          <button
            onClick={this.reset}
            className="w-full rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#5457e0]"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    )
  }
}
