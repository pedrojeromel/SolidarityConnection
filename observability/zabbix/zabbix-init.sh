#!/bin/sh
set -e

apk add --no-cache curl jq > /dev/null 2>&1

ZABBIX_URL="http://zabbix-web:8080/api_jsonrpc.php"
ZABBIX_USER="Admin"
ZABBIX_PASS="zabbix"
HOST_NAME="solidarity-docker-host"
AGENT_DNS="solidarity-zabbix-agent"
TEMPLATE_NAME="Linux by Zabbix agent"
GROUP_NAME="Linux servers"

# ─── Aguarda a API do Zabbix responder ────────────────────────────────────────
echo "[init] Aguardando Zabbix Web API..."
until curl -sf -o /dev/null -w "%{http_code}" \
  -X POST "$ZABBIX_URL" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"apiinfo.version","params":{},"id":1}' | grep -q "200"; do
  echo "[init] Ainda aguardando..."
  sleep 5
done
echo "[init] Zabbix API disponível."

# ─── Autenticação (com retry e fallback username/user) ───────────────────────
AUTH=""
ATTEMPT=1
MAX_ATTEMPTS=24

while [ "$ATTEMPT" -le "$MAX_ATTEMPTS" ]; do
  # Tenta primeiro com "username" (versões recentes).
  LOGIN_RESPONSE=$(curl -s -X POST "$ZABBIX_URL" \
    -H "Content-Type: application/json" \
    -d "{
      \"jsonrpc\": \"2.0\",
      \"method\":  \"user.login\",
      \"params\":  { \"username\": \"$ZABBIX_USER\", \"password\": \"$ZABBIX_PASS\" },
      \"id\": 1
    }")

  AUTH=$(echo "$LOGIN_RESPONSE" | jq -r '.result // empty')

  # Fallback para "user" (compatibilidade com versões anteriores).
  if [ -z "$AUTH" ]; then
    LOGIN_RESPONSE=$(curl -s -X POST "$ZABBIX_URL" \
      -H "Content-Type: application/json" \
      -d "{
        \"jsonrpc\": \"2.0\",
        \"method\":  \"user.login\",
        \"params\":  { \"user\": \"$ZABBIX_USER\", \"password\": \"$ZABBIX_PASS\" },
        \"id\": 1
      }")
    AUTH=$(echo "$LOGIN_RESPONSE" | jq -r '.result // empty')
  fi

  if [ -n "$AUTH" ]; then
    echo "[init] Autenticado com sucesso."
    break
  fi

  ERROR_MSG=$(echo "$LOGIN_RESPONSE" | jq -r '.error.data // .error.message // "sem detalhes"')
  echo "[init] Login ainda indisponível (tentativa $ATTEMPT/$MAX_ATTEMPTS): $ERROR_MSG"
  ATTEMPT=$((ATTEMPT + 1))
  sleep 5
done

if [ -z "$AUTH" ]; then
  echo "[init] ERRO: falha ao autenticar na API do Zabbix após $MAX_ATTEMPTS tentativas."
  exit 1
fi

# ─── Desabilita host padrão do Zabbix (Docker: 127.0.0.1:10050 costuma falhar)
DEFAULT_HOST_ID=$(curl -sf -X POST "$ZABBIX_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"jsonrpc\": \"2.0\",
    \"method\":  \"host.get\",
    \"params\":  { \"filter\": { \"host\": [\"Zabbix server\"] } },
    \"auth\":    \"$AUTH\",
    \"id\": 2
  }" | jq -r '.result[0].hostid // empty')

if [ -n "$DEFAULT_HOST_ID" ]; then
  DEFAULT_STATUS=$(curl -sf -X POST "$ZABBIX_URL" \
    -H "Content-Type: application/json" \
    -d "{
      \"jsonrpc\": \"2.0\",
      \"method\":  \"host.get\",
      \"params\":  {
        \"output\": [\"status\"],
        \"hostids\": [\"$DEFAULT_HOST_ID\"]
      },
      \"auth\":    \"$AUTH\",
      \"id\": 3
    }" | jq -r '.result[0].status // empty')

  if [ "$DEFAULT_STATUS" = "0" ]; then
    curl -sf -X POST "$ZABBIX_URL" \
      -H "Content-Type: application/json" \
      -d "{
        \"jsonrpc\": \"2.0\",
        \"method\":  \"host.update\",
        \"params\":  { \"hostid\": \"$DEFAULT_HOST_ID\", \"status\": 1 },
        \"auth\":    \"$AUTH\",
        \"id\": 4
      }" > /dev/null
    echo "[init] Host padrão 'Zabbix server' desabilitado para evitar alerta falso no Docker."
  fi
fi

# ─── Obtém ID do grupo ────────────────────────────────────────────────────────
GROUP_ID=$(curl -sf -X POST "$ZABBIX_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"jsonrpc\": \"2.0\",
    \"method\":  \"hostgroup.get\",
    \"params\":  { \"filter\": { \"name\": [\"$GROUP_NAME\"] } },
    \"auth\":    \"$AUTH\",
    \"id\": 5
  }" | jq -r '.result[0].groupid // empty')

if [ -z "$GROUP_ID" ]; then
  echo "[init] Grupo '$GROUP_NAME' não encontrado — usando primeiro grupo disponível."
  GROUP_ID=$(curl -sf -X POST "$ZABBIX_URL" \
    -H "Content-Type: application/json" \
    -d "{
      \"jsonrpc\": \"2.0\",
      \"method\":  \"hostgroup.get\",
      \"params\":  { \"limit\": 1 },
      \"auth\":    \"$AUTH\",
      \"id\": 6
    }" | jq -r '.result[0].groupid')
fi
echo "[init] Grupo ID: $GROUP_ID"

# ─── Obtém ID do template ─────────────────────────────────────────────────────
TEMPLATE_ID=$(curl -sf -X POST "$ZABBIX_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"jsonrpc\": \"2.0\",
    \"method\":  \"template.get\",
    \"params\":  { \"filter\": { \"host\": [\"$TEMPLATE_NAME\"] } },
    \"auth\":    \"$AUTH\",
    \"id\": 7
  }" | jq -r '.result[0].templateid // empty')

if [ -n "$TEMPLATE_ID" ]; then
  echo "[init] Template '$TEMPLATE_NAME' ID: $TEMPLATE_ID"
else
  echo "[init] Template '$TEMPLATE_NAME' não encontrado — tentando fallback 'Linux by Zabbix agent 2'."
  TEMPLATE_ID=$(curl -sf -X POST "$ZABBIX_URL" \
    -H "Content-Type: application/json" \
    -d "{
      \"jsonrpc\": \"2.0\",
      \"method\":  \"template.get\",
      \"params\":  { \"filter\": { \"host\": [\"Linux by Zabbix agent 2\"] } },
      \"auth\":    \"$AUTH\",
      \"id\": 8
    }" | jq -r '.result[0].templateid // empty')

  if [ -n "$TEMPLATE_ID" ]; then
    echo "[init] Template fallback 'Linux by Zabbix agent 2' ID: $TEMPLATE_ID"
  else
    echo "[init] Nenhum template Linux encontrado — host será criado/atualizado sem template."
  fi
fi

# ─── Verifica se host já existe ───────────────────────────────────────────────
EXISTING=$(curl -sf -X POST "$ZABBIX_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"jsonrpc\": \"2.0\",
    \"method\":  \"host.get\",
    \"params\":  {
      \"filter\": { \"host\": [\"$HOST_NAME\"] },
      \"selectParentTemplates\": [\"templateid\"]
    },
    \"auth\":    \"$AUTH\",
    \"id\": 9
  }")

EXISTING_HOST_ID=$(echo "$EXISTING" | jq -r '.result[0].hostid // empty')

if [ -n "$EXISTING_HOST_ID" ]; then
  echo "[init] Host '$HOST_NAME' já existe (id: $EXISTING_HOST_ID)."

  if [ -n "$TEMPLATE_ID" ]; then
    HAS_TEMPLATE=$(echo "$EXISTING" | jq -r --arg tid "$TEMPLATE_ID" '.result[0].parentTemplates[]?.templateid | select(. == $tid)')

    if [ -n "$HAS_TEMPLATE" ]; then
      echo "[init] Template já está vinculado ao host."
      exit 0
    fi

    EXISTING_TEMPLATES=$(echo "$EXISTING" | jq -c '.result[0].parentTemplates // []')
    UPDATED_TEMPLATES=$(echo "$EXISTING_TEMPLATES" | jq -c --arg tid "$TEMPLATE_ID" '. + [{"templateid": $tid}] | unique_by(.templateid)')

    UPDATE_RESPONSE=$(curl -sf -X POST "$ZABBIX_URL" \
      -H "Content-Type: application/json" \
      -d "{
        \"jsonrpc\": \"2.0\",
        \"method\":  \"host.update\",
        \"params\":  {
          \"hostid\": \"$EXISTING_HOST_ID\",
          \"templates\": $UPDATED_TEMPLATES
        },
        \"auth\": \"$AUTH\",
        \"id\": 10
      }")

    UPDATE_OK=$(echo "$UPDATE_RESPONSE" | jq -r '.result.hostids[0] // empty')
    if [ -n "$UPDATE_OK" ]; then
      echo "[init] Template vinculado ao host existente com sucesso."
      exit 0
    fi

    UPDATE_ERR=$(echo "$UPDATE_RESPONSE" | jq -r '.error.data // .error.message // "sem detalhes"')
    echo "[init] ERRO ao vincular template no host existente: $UPDATE_ERR"
    exit 1
  fi

  echo "[init] Sem template para vincular. Nada a fazer."
  exit 0
fi

if [ -n "$TEMPLATE_ID" ]; then
  TEMPLATES_JSON=", \"templates\": [{\"templateid\": \"$TEMPLATE_ID\"}]"
else
  TEMPLATES_JSON=""
fi

# ─── Cria o host ──────────────────────────────────────────────────────────────
RESPONSE=$(curl -sf -X POST "$ZABBIX_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"jsonrpc\": \"2.0\",
    \"method\":  \"host.create\",
    \"params\":  {
      \"host\":       \"$HOST_NAME\",
      \"groups\":     [{ \"groupid\": \"$GROUP_ID\" }]
      $TEMPLATES_JSON,
      \"interfaces\": [{
        \"type\":  1,
        \"main\":  1,
        \"useip\": 0,
        \"ip\":    \"\",
        \"dns\":   \"$AGENT_DNS\",
        \"port\":  \"10050\"
      }]
    },
    \"auth\": \"$AUTH\",
    \"id\": 11
  }")

HOST_ID=$(echo "$RESPONSE" | jq -r '.result.hostids[0] // empty')
ERROR=$(echo "$RESPONSE" | jq -r '.error.data // empty')

if [ -n "$HOST_ID" ]; then
  echo "[init] Host '$HOST_NAME' criado com sucesso (id: $HOST_ID)."
else
  echo "[init] ERRO ao criar host: $ERROR"
  exit 1
fi

# ─── Logout ───────────────────────────────────────────────────────────────────
curl -sf -X POST "$ZABBIX_URL" \
  -H "Content-Type: application/json" \
  -d "{\"jsonrpc\":\"2.0\",\"method\":\"user.logout\",\"params\":[],\"auth\":\"$AUTH\",\"id\":12}" \
  > /dev/null

echo "[init] Configuração do Zabbix concluída."
