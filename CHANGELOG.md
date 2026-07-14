# Changelog

Todas as mudanças relevantes da plataforma Conexão Solidária.
O versionamento segue [Semantic Versioning](https://semver.org/lang/pt-BR/).

Para alterar a versão, use o script — ele mantém `VERSION`, `.env`,
`frontend/package.json` e `k8s/kustomization.yaml` sincronizados:

```bash
./scripts/set-version.sh 1.2.0
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
