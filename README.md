# Solidarity Connection

Projeto Hackathon Fase 5 - Pós-Tech Arquitetura Sistemas .NET.
Plataforma de arrecadação solidária baseada em microsserviços, mensageria e processamento assíncrono.
O sistema permite o gerenciamento de campanhas beneficentes, cadastro de doadores e processamento de doações utilizando SQL Server, MongoDB e RabbitMQ.

---

# Arquitetura

```text
┌─────────────────────┐
│   Solidarity.Api    │
└──────────┬──────────┘
           │
           │ SQL Server
           ▼
┌─────────────────────┐
│ Campaigns / Users   │
└──────────┬──────────┘
           │
           │ MongoDB
           ▼
┌─────────────────────┐
│     Donations       │
└──────────┬──────────┘
           │
           │ RabbitMQ
           ▼
┌─────────────────────┐
│ DonationReceived    │
│      Event          │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Solidarity.Worker   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Update TotalRaised  │
└─────────────────────┘

Observabilidade e monitoramento (complementar):

┌─────────────────────┐   scrape   ┌─────────────────────┐   datasource   ┌─────────────────────┐
│ /metrics e /health  │───────────▶│     Prometheus      │───────────────▶│       Grafana       │
│ (Solidarity.Api)    │            └─────────────────────┘                └─────────────────────┘
└─────────────────────┘

┌─────────────────────┐   metrics   ┌─────────────────────┐
│ cAdvisor +          │────────────▶│     Prometheus      │
│ node-exporter       │             └─────────────────────┘
└─────────────────────┘

┌─────────────────────┐   monitoramento infra   ┌─────────────────────┐
│ Zabbix Agent 2      │────────────────────────▶│    Zabbix Server    │
└─────────────────────┘                         └─────────┬───────────┘
                      │
                      ▼
                 ┌─────────────────────┐
                 │      Zabbix Web     │
                 └─────────────────────┘
```

---

# Tecnologias Utilizadas

- .NET 10
- ASP.NET Core Web API
- Entity Framework Core
- SQL Server
- MongoDB
- RabbitMQ
- JWT Authentication
- Swagger
- Prometheus
- Grafana
- Zabbix
- Docker
- Docker Compose
- Kubernetes

---

# Estrutura da Solução

```text
SolidarityConnection

├── Solidarity.Api
├── Solidarity.Application
├── Solidarity.Domain
├── Solidarity.Infrastructure
├── Solidarity.Shared
├── Solidarity.Worker
├── observability
├── k8s
└── docker-compose.yml
```

---

# Perfis de Usuário

## NgoManager

Responsável pelo gerenciamento de campanhas.
Permissões:
- Criar campanhas;
- Atualizar campanhas;
- Cancelar campanhas;

---

## Donor

Responsável por realizar doações.
Permissões:
- Consultar campanhas;
- Realizar doações;

---

# Requisitos

## Docker Desktop

Instalar:
https://www.docker.com/products/docker-desktop/

Verificar:

```bash
docker --version
docker compose version
```

---

## .NET SDK

Instalar:
https://dotnet.microsoft.com/download

Verificar:

```bash
dotnet --version
```

---

# Execução com Docker Compose

Na raiz do projeto:

```bash
docker compose up -d
```

Verificar:

```bash
docker ps
```

Containers esperados:

```text
solidarity-sqlserver
solidarity-mongodb
solidarity-rabbitmq
solidarity-api
solidarity-worker
solidarity-prometheus
solidarity-grafana
solidarity-node-exporter
solidarity-cadvisor
solidarity-zabbix-db
solidarity-zabbix-server
solidarity-zabbix-web
solidarity-zabbix-agent
solidarity-zabbix-init
```

---

## Acessos (Docker Compose)

API e Swagger:

```text
http://localhost:8080/swagger
```

Health check:

```text
http://localhost:8080/health
```

Métricas da API:

```text
http://localhost:8080/metrics
```

RabbitMQ Management:

```text
http://localhost:15672
```

Credenciais RabbitMQ:

```text
guest / guest
```

# Observabilidade

O ambiente Docker sobe observabilidade completa automaticamente:

- Prometheus para coleta de métricas;
- Grafana com datasource e dashboard provisionados;
- Zabbix para monitoramento de infraestrutura, com host e template configurados por script sem ação manual.

## Endpoints de saúde e métricas da API

No Docker Compose, estes endpoints já ficam disponíveis diretamente em localhost:8080.

Saúde:

```text
http://localhost:8080/health
```

Métricas Prometheus:

```text
http://localhost:8080/metrics
```

## Prometheus

URL:

```text
http://localhost:9090
```

## Grafana

URL:

```text
http://localhost:3000
```

Usuário/senha padrão:

```text
admin / Admin@123
```

Dashboard provisionado automaticamente:

```text
SolidarityConnection — Observabilidade
```

Métricas exibidas:

- Taxa de requisições HTTP e latência da API (p50, p95, p99);
- CPU, memória e rede por container (cAdvisor);
- CPU e memória do host (node-exporter).

## Zabbix

URL:

```text
http://localhost:8082
```

Usuário/senha padrão:

```text
Admin / zabbix
```

---

# Executando com Kubernetes (Docker Desktop)

## Pré-requisitos

- Docker Desktop com Kubernetes habilitado;
- kubectl disponível no terminal.

Verificar:

```bash
kubectl version --client
kubectl config current-context
```

Contexto esperado no Docker Desktop:

```text
docker-desktop
```

## 1) Gerar imagens locais da API e Worker

Na raiz do projeto:

```bash
docker build -t solidarity-api:local -f Solidarity.Api/Dockerfile .
docker build -t solidarity-worker:local -f Solidarity.Worker/Dockerfile .
```

## 2) Aplicar manifests Kubernetes

```bash
kubectl apply -k k8s
```

Os manifests entregues em `k8s/` incluem:

- Namespace;
- ConfigMaps;
- Deployments;
- Services.
- PersistentVolumeClaims (SQL Server, MongoDB e RabbitMQ).

## 3) Validar recursos no cluster

```bash
kubectl get pods -n solidarity
kubectl get svc -n solidarity
kubectl get pvc -n solidarity
```

## 4) Acessar API e RabbitMQ

Mapear a porta local para o Service da API (mantenha este terminal aberto):

```bash
kubectl port-forward -n solidarity svc/solidarity-api 8080:8080
```

API e Swagger:

```text
http://localhost:8080/swagger
```

Health check:

```text
http://localhost:8080/health
```

Métricas da API:

```text
http://localhost:8080/metrics
```

Em outro terminal, mapear RabbitMQ Management:

```bash
kubectl port-forward -n solidarity svc/rabbitmq 15672:15672
```

```text
http://localhost:15672
```

Usuário/senha padrão:

```text
guest / guest
```

## 5) Endpoints: Docker Compose x Kubernetes

Os endpoints no navegador são iguais nos dois cenários.
No Kubernetes, eles só funcionam depois dos comandos de port-forward.

```text
API/Swagger:      http://localhost:8080/swagger
Health:           http://localhost:8080/health
Métricas da API:  http://localhost:8080/metrics
RabbitMQ UI:      http://localhost:15672
```

## 6) Remover ambiente Kubernetes

```bash
kubectl delete namespace solidarity
```

Para remover tambem os dados persistidos:

```bash
kubectl delete pvc -n solidarity --all
```

---

# Configuração da Base SQL

Aplicar migrations:

```bash
dotnet ef database update \
--project Solidarity.Infrastructure \
--startup-project Solidarity.Api
```

---

# Executando a API localmente

```bash
dotnet run --project Solidarity.Api
```

Swagger:

```text
http://localhost:5131/swagger
```

---

# Executando o Worker localmente

Em outro terminal:

```bash
dotnet run --project Solidarity.Worker
```

---

# Usuário Seed

O sistema cria automaticamente um gestor inicial.

Email:

```text
manager@solidarity.com
```

Senha:

```text
123456
```

Role:

```text
NgoManager
```

---

# Fluxo de Autenticação

## Registrar usuário

POST

```http
/api/auth/register
```

Exemplo:

```json
{
  "fullName": "Teste",
  "email": "teste@fiap.com.br",
  "cpf": "12345678901",
  "password": "123456"
}
```

---

## Login

POST

```http
/api/auth/login
```

Exemplo:

```json
{
  "email": "teste@fiap.com.br",
  "password": "123456"
}
```

Retorno:

```json
{
  "token": "JWT_TOKEN"
}
```

---

# Campanhas

## Criar Campanha

POST

```http
/api/campaigns
```

Role necessária:

```text
NgoManager
```

Exemplo:

```json
{
  "title": "Exemplo de Campanha",
  "description": "Descrição do Exemplo de Campanha",
  "startDate": "2026-06-20T00:00:00",
  "endDate": "2026-07-20T00:00:00",
  "financialGoal": 10000
}
```

---

## Listar Campanhas

GET

```http
/api/campaigns
```

---

## Campanhas Ativas

GET

```http
/api/campaigns/active
```

Retorna:
- Title;
- FinancialGoal;
- TotalRaised;

---

# Doações

## Criar Doação

POST

```http
/api/donations
```

Role necessária:

```text
Donor
```

Exemplo:

```json
{
  "campaignId": "GUID",
  "amount": 50
}
```

---

# Fluxo Assíncrono

Ao receber uma doação:

1. API valida a campanha;
2. API grava a doação no MongoDB;
3. API publica evento no RabbitMQ;
4. Worker consome o evento;
5. Worker atualiza o TotalRaised da campanha;

---

# Banco SQL Server

Tabelas:

```text
Users
Campaigns
```

---

# Banco MongoDB

Coleções:

```text
donations
```

---

# Mensageria

Fila:

```text
donation-received
```

Evento:

```text
DonationReceivedEvent
```

---

# Teste Completo

## Passo 1

Login como gestor.

## Passo 2

Criar campanha.

## Passo 3

Registrar novo doador.

## Passo 4

Login com doador.

## Passo 5

Realizar doação.

## Passo 6

Verificar:

- MongoDB recebeu a doação;
- RabbitMQ processou a fila;
- Worker atualizou o TotalRaised;

---

# Autores

Projeto acadêmico desenvolvido para demonstração de arquitetura baseada em microsserviços, mensageria e processamento assíncrono utilizando .NET.
Alunos: Pedro, Tony, Diego e Gustavo.
Curso: Pós-Tech Arquitetura Sistemas .NET.
Projeto: Hackathon Fase 5.