#!/bin/sh
set -e

echo "==> Aguardando banco de dados..."

# Aguardar o banco de dados estar pronto (máximo 30 segundos)
MAX_RETRIES=30
RETRY_COUNT=0

until npx prisma db execute --stdin <<< "SELECT 1" > /dev/null 2>&1; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
    echo "==> ERRO: Banco de dados não está disponível após $MAX_RETRIES tentativas"
    exit 1
  fi
  echo "==> Aguardando banco de dados... (tentativa $RETRY_COUNT/$MAX_RETRIES)"
  sleep 1
done

echo "==> Banco de dados disponível!"

echo "==> Executando migrações do Prisma..."
npx prisma migrate deploy

echo "==> Migrações concluídas!"

echo "==> Iniciando aplicação..."
exec "$@"
