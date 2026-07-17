# Changelog

Todas as mudanças relevantes da plataforma Conexão Solidária.
O versionamento segue [Semantic Versioning](https://semver.org/lang/pt-BR/).

Para alterar a versão, use o script — ele mantém `VERSION`, `.env`,
`frontend/package.json` e `k8s/kustomization.yaml` sincronizados:

```bash
./scripts/set-version.sh 1.2.0
```

---

## [2.0.1] — 2026-07-17

### Corrigido

- ajustado erro de cep - concluir campanha e rotas

### Imagens publicadas

```text
ghcr.io/jeromelpedro/solidarity-api:2.0.1
ghcr.io/jeromelpedro/solidarity-worker:2.0.1
ghcr.io/jeromelpedro/solidarity-frontend:2.0.1
```
---

## [2.0.0] — 2026-07-15

### Adicionado

- microsservico de pagamento com checkout de cartao
- worker dedicado de envio de e-mail via mensageria
- painel da home com dados reais do banco (remove numeros mock)
- redesign completo no estilo produto SaaS (direcao C)
- passa a rodar as imagens publicadas no GHCR, sem build local
- script de deploy com validacao de versao e modo GHCR
- versionamento semantico automatico a cada push na main

### Corrigido

- efeito devolvia valor e o React o chamava como funcao de limpeza
- publica sourcemap e corrige clearTimeout desacoplado
- exibe erro em vez de tela preta e trata rota desconhecida
- corrige cache do frontend no nginx e commit de release no CI
- protege intervalo vazio na geracao das notas da release

### Documentação

- atualiza arquitetura e acessos com payment-service e e-mail
- consolida a secao 1.1.0 do changelog

### Imagens publicadas

```text
ghcr.io/pedrojeromel/solidarity-api:2.0.0
ghcr.io/pedrojeromel/solidarity-worker:2.0.0
ghcr.io/pedrojeromel/solidarity-frontend:2.0.0
```
---

## [1.7.1] — 2026-07-15

### Imagens publicadas

```text
ghcr.io/pedrojeromel/solidarity-api:1.7.1
ghcr.io/pedrojeromel/solidarity-worker:1.7.1
ghcr.io/pedrojeromel/solidarity-frontend:1.7.1
```
---

## [1.7.0] — 2026-07-15

### Adicionado

- microsservico de pagamento com checkout de cartao

### Imagens publicadas

```text
ghcr.io/pedrojeromel/solidarity-api:1.7.0
ghcr.io/pedrojeromel/solidarity-worker:1.7.0
ghcr.io/pedrojeromel/solidarity-frontend:1.7.0
```
---

## [1.6.0] — 2026-07-15

### Adicionado

- worker dedicado de envio de e-mail via mensageria

### Imagens publicadas

```text
ghcr.io/pedrojeromel/solidarity-api:1.6.0
ghcr.io/pedrojeromel/solidarity-worker:1.6.0
ghcr.io/pedrojeromel/solidarity-frontend:1.6.0
```
---

## [1.5.0] — 2026-07-15

### Adicionado

- painel da home com dados reais do banco (remove numeros mock)

### Imagens publicadas

```text
ghcr.io/pedrojeromel/solidarity-api:1.5.0
ghcr.io/pedrojeromel/solidarity-worker:1.5.0
ghcr.io/pedrojeromel/solidarity-frontend:1.5.0
```
---

## [1.4.0] — 2026-07-15

### Adicionado

- redesign completo no estilo produto SaaS (direcao C)

### Imagens publicadas

```text
ghcr.io/pedrojeromel/solidarity-api:1.4.0
ghcr.io/pedrojeromel/solidarity-worker:1.4.0
ghcr.io/pedrojeromel/solidarity-frontend:1.4.0
```
---

## [1.3.0] — 2026-07-14

### Adicionado

- passa a rodar as imagens publicadas no GHCR, sem build local

### Imagens publicadas

```text
ghcr.io/pedrojeromel/solidarity-api:1.3.0
ghcr.io/pedrojeromel/solidarity-worker:1.3.0
ghcr.io/pedrojeromel/solidarity-frontend:1.3.0
```
---

## [1.2.1] — 2026-07-14

### Corrigido

- efeito devolvia valor e o React o chamava como funcao de limpeza

### Imagens publicadas

```text
ghcr.io/pedrojeromel/solidarity-api:1.2.1
ghcr.io/pedrojeromel/solidarity-worker:1.2.1
ghcr.io/pedrojeromel/solidarity-frontend:1.2.1
```
---

## [1.2.0] — 2026-07-14

### Adicionado

- script de deploy com validacao de versao e modo GHCR

### Imagens publicadas

```text
ghcr.io/pedrojeromel/solidarity-api:1.2.0
ghcr.io/pedrojeromel/solidarity-worker:1.2.0
ghcr.io/pedrojeromel/solidarity-frontend:1.2.0
```
---

## [1.1.3] — 2026-07-14

### Corrigido

- publica sourcemap e corrige clearTimeout desacoplado

### Imagens publicadas

```text
ghcr.io/pedrojeromel/solidarity-api:1.1.3
ghcr.io/pedrojeromel/solidarity-worker:1.1.3
ghcr.io/pedrojeromel/solidarity-frontend:1.1.3
```
---

## [1.1.2] — 2026-07-14

### Corrigido

- exibe erro em vez de tela preta e trata rota desconhecida

### Imagens publicadas

```text
ghcr.io/pedrojeromel/solidarity-api:1.1.2
ghcr.io/pedrojeromel/solidarity-worker:1.1.2
ghcr.io/pedrojeromel/solidarity-frontend:1.1.2
```
---

## [1.1.1] — 2026-07-14

### Documentação

- consolida a secao 1.1.0 do changelog

### Imagens publicadas

```text
ghcr.io/pedrojeromel/solidarity-api:1.1.1
ghcr.io/pedrojeromel/solidarity-worker:1.1.1
ghcr.io/pedrojeromel/solidarity-frontend:1.1.1
```
---

## [1.1.0] — 2026-07-14

Primeira release publicada pelo pipeline automático.

### Imagens publicadas

```text
ghcr.io/pedrojeromel/solidarity-api:1.1.0
ghcr.io/pedrojeromel/solidarity-worker:1.1.0
ghcr.io/pedrojeromel/solidarity-frontend:1.1.0
```

### Adicionado

- Site institucional na home: hero, indicadores de impacto, história da ONG,
  como ajudar, depoimentos, parceiros e chamada final;
- Páginas `/sobre` (missão, visão, valores e linha do tempo) e `/contato`;
- Política de senha no domínio (mínimo de 8 caracteres, letra, número e
  caractere especial), validada pela API e refletida na interface;
- Confirmação de senha no cadastro, com requisitos exibidos em tempo real;
- Máscara monetária (pt-BR) no valor da doação e na meta financeira;
- Script `scripts/set-version.sh` para alterar a versão em todos os pontos.

### Alterado

- Painel de transparência movido da raiz para `/campanhas`;
- Interface responsiva (mobile, tablet e desktop), com menu hamburguer;
- Textos da interface sem jargão técnico (Worker, fila, evento);
- Visitantes veem "Entrar para doar"; gestores recebem aviso de que a doação
  é exclusiva do perfil doador.

### Corrigido

- `zabbix-init` falhava por quebras de linha CRLF e o Zabbix nunca era
  configurado (host e template não eram criados);
- Healthcheck da API no Compose usava `wget`, ausente na imagem `aspnet`,
  marcando o container como `unhealthy` mesmo com a API respondendo;
- `index.html` era servido sem `Cache-Control`, fazendo o navegador manter o
  bundle da versão anterior após um deploy;
- Arquivos inexistentes em `/assets/` caíam no fallback do SPA e retornavam
  HTML com status 200 no lugar de 404.

---

## [1.0.0] — 2026-07-14

### Adicionado

- API de campanhas, doadores e doações (.NET 10) com autenticação JWT e RBAC
  (perfis `NgoManager` e `Donor`);
- Worker consumidor da fila `donation-received` (RabbitMQ), responsável por
  atualizar o valor arrecadado das campanhas;
- Persistência em SQL Server (usuários e campanhas) e MongoDB (doações);
- Painel de transparência público com campanhas ativas;
- Validação de CPF (formato e dígitos verificadores);
- Frontend React (Vite + TypeScript + Tailwind);
- Observabilidade: `/health`, `/metrics`, Prometheus, Grafana e Zabbix;
- Orquestração com Kubernetes e Docker Compose;
- Pipeline de CI (GitHub Actions): build, testes e publicação das imagens;
- Versionamento semântico e estratégia de rollback;
- Suíte de testes de unidade (xUnit + Moq).
