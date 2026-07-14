#!/bin/sh
# Sobe a aplicacao no Docker usando as imagens publicadas pelo CI no GHCR,
# e confirma no final qual versao ficou realmente em execucao.
#
#   ./scripts/deploy.sh              baixa a versao do arquivo VERSION (padrao)
#   ./scripts/deploy.sh 1.1.0        baixa uma versao especifica (rollback)
#   ./scripts/deploy.sh latest       baixa a versao mais recente publicada
#   ./scripts/deploy.sh --build      compila a partir do codigo-fonte local (dev)
#
# Ninguem precisa compilar para rodar o projeto: todos executam exatamente o
# mesmo artefato que o pipeline gerou.

set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

MODE="registry"
VERSION=""

for arg in "$@"; do
  case "$arg" in
    --build) MODE="build" ;;
    -*) echo "Opcao desconhecida: $arg" >&2; exit 1 ;;
    *) VERSION="$arg" ;;
  esac
done

# Sem versao explicita, o arquivo VERSION manda (fonte unica de verdade).
if [ -z "$VERSION" ]; then
  VERSION=$(tr -d '[:space:]' < VERSION)
fi

echo "Versao alvo: $VERSION  (modo: $MODE)"
echo

echo "APP_VERSION=$VERSION" > .env

SERVICES="api worker frontend"

if [ "$MODE" = "build" ]; then
  COMPOSE="docker compose -f docker-compose.yml -f docker-compose.build.yml"

  echo "Compilando as imagens a partir do codigo-fonte..."
  $COMPOSE build $SERVICES
else
  COMPOSE="docker compose"

  echo "Baixando as imagens publicadas pelo CI (GHCR)..."
  $COMPOSE pull $SERVICES
fi

echo
echo "Subindo containers..."
$COMPOSE up -d $SERVICES

echo
printf "Aguardando a API ficar saudavel"

i=0
while [ $i -lt 40 ]; do
  STATUS=$(docker inspect solidarity-api --format '{{.State.Health.Status}}' 2>/dev/null || echo "starting")

  if [ "$STATUS" = "healthy" ]; then
    echo " OK"
    break
  fi

  printf "."
  sleep 5
  i=$((i + 1))
done

echo
echo "================ EM EXECUCAO ================"

RUNNING=$(curl -s http://localhost:8080/version 2>/dev/null || echo "")

echo "  API      : ${RUNNING:-sem resposta}"
docker logs solidarity-worker 2>&1 | grep -i "versao" | tail -1 | sed 's/^/  Worker   : /'
echo "  Frontend : http://localhost:3001"
echo "  Imagens  : ghcr.io/pedrojeromel/solidarity-{api,worker,frontend}:$VERSION"
echo

# Em "latest" a versao exata nao e conhecida de antemao; nos demais casos,
# a versao em execucao tem obrigatoriamente que ser a versao alvo.
if [ "$VERSION" = "latest" ] || [ "$MODE" = "build" ]; then
  echo "OK: containers no ar."
elif echo "$RUNNING" | grep -q "\"version\":\"$VERSION\""; then
  echo "OK: a versao em execucao ($VERSION) confere com a versao alvo."
else
  echo "ATENCAO: a versao em execucao NAO confere com $VERSION." >&2
  exit 1
fi
