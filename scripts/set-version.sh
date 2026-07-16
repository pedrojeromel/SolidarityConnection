#!/bin/sh
# Altera a versao da plataforma em todos os pontos de uma vez.
#
# Uso:  ./scripts/set-version.sh 1.2.0
#
# Mantem sincronizados: VERSION, .env (Compose), frontend/package.json
# e as tags das imagens em k8s/kustomization.yaml.
# Sem isso, e facil o Compose subir uma versao e o Kubernetes outra.

set -e

VERSION="$1"

if [ -z "$VERSION" ]; then
  echo "Uso: ./scripts/set-version.sh <versao>   (ex.: 1.2.0)" >&2
  exit 1
fi

# Aceita apenas semver (com pre-release opcional): 1.2.3 ou 1.2.3-rc.1
if ! echo "$VERSION" | grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z.-]+)?$'; then
  echo "Versao invalida: '$VERSION'. Use o formato X.Y.Z (ex.: 1.2.0)." >&2
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "$VERSION" > VERSION

printf 'APP_VERSION=%s\n' "$VERSION" > .env

sed -i -E "s/(\"version\"[[:space:]]*:[[:space:]]*)\"[^\"]+\"/\1\"$VERSION\"/" \
  frontend/package.json

sed -i -E "s/(newTag:[[:space:]]*)\"[^\"]+\"/\1\"$VERSION\"/" \
  k8s/kustomization.yaml

echo "Versao definida como $VERSION em:"
echo "  - VERSION"
echo "  - .env (docker compose)"
echo "  - frontend/package.json"
echo "  - k8s/kustomization.yaml"
echo
echo "Proximos passos:"
echo "  docker compose build && docker compose up -d"
echo "  git commit -am \"Release $VERSION\" && git tag v$VERSION && git push origin main --tags"
