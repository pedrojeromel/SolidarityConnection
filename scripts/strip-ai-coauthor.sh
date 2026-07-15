#!/bin/sh
# Remove o rodape "Co-Authored-By: Claude ..." de TODOS os commits alcancaveis
# pela branch atual. Nao toca em arquivos, autores ou datas — so na mensagem.
#
# ATENCAO: reescreve o historico do Git (os SHAs mudam). Isso exige:
#   1) force-push da branch;
#   2) que os demais colaboradores re-sincronizem (git fetch + reset --hard),
#      senao o proximo pull vira um conflito de historico.
#
# Nao remove o github-actions[bot] (bot de CI, legitimo).
#
# Uso (rodar DEPOIS de trazer tudo para a main, com a main como branch atual):
#   ./scripts/strip-ai-coauthor.sh
#   # revise e, se estiver ok:
#   git push --force-with-lease origin main
#   # avise o time para re-sincronizar.

set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

BRANCH="$(git rev-parse --abbrev-ref HEAD)"

echo "Branch atual: $BRANCH"

ANTES="$(git log --format='%b' | grep -ci 'Co-Authored-By: Claude' || true)"
echo "Commits com rodape do Claude: $ANTES"

if [ "$ANTES" = "0" ]; then
  echo "Nada a limpar. Saindo."
  exit 0
fi

# Backup de seguranca: da para voltar com
#   git reset --hard backup-pre-strip
git branch -f backup-pre-strip
echo "Backup criado em: backup-pre-strip"

# Reescreve as mensagens removendo a linha do co-autor Claude.
# sed sempre sai com 0, entao o filter-branch nao aborta.
FILTER_BRANCH_SQUELCH_WARNING=1 git filter-branch --force --msg-filter '
  sed "/[Cc]o-[Aa]uthored-[Bb]y: Claude/d"
' -- "$BRANCH"

DEPOIS="$(git log --format='%b' | grep -ci 'Co-Authored-By: Claude' || true)"
echo
echo "Concluido. Commits com rodape do Claude agora: $DEPOIS"
echo
echo "Proximos passos:"
echo "  1) Revise:  git log --format='%s%n%b' | grep -i claude   (deve nao retornar nada)"
echo "  2) Publique: git push --force-with-lease origin $BRANCH"
echo "  3) Avise o time para re-sincronizar:"
echo "       git fetch origin && git reset --hard origin/$BRANCH"
echo
echo "Se algo der errado, volte com: git reset --hard backup-pre-strip"
