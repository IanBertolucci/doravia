#!/bin/bash
set -euo pipefail

SERVER="${DEPLOY_SERVER:-root@your-server-ip}"
PROJECT_DIR="/opt/doravia"
PROJECT_LOCAL="$(cd "$(dirname "$0")" && pwd)"
TMP="/tmp/doravia-deploy"

echo "=== [1/5] Buildando imagens localmente ==="
docker build -t doravia-backend:latest "$PROJECT_LOCAL/backend"
docker build -t doravia-frontend:latest "$PROJECT_LOCAL/frontend"

echo "=== [2/5] Salvando imagens em tar ==="
mkdir -p "$TMP"
docker save doravia-backend:latest -o "$TMP/doravia-backend.tar"
docker save doravia-frontend:latest -o "$TMP/doravia-frontend.tar"

echo "=== [3/5] Transferindo código e imagens ==="
ssh "$SERVER" "mkdir -p $PROJECT_DIR/data"
rsync -avz --delete \
  --exclude='.git' \
  --exclude='.idea' \
  --exclude='node_modules' \
  --exclude='frontend/dist' \
  --exclude='backend/target' \
  --exclude='.env' \
  --exclude='certs' \
  --exclude='data/backups' \
  --exclude='data/*.db' \
  --exclude='*.tar' \
  "$PROJECT_LOCAL/" "$SERVER:$PROJECT_DIR/"
scp "$TMP/doravia-backend.tar" "$TMP/doravia-frontend.tar" "$SERVER:$PROJECT_DIR/"

echo "=== [4/5] Carregando imagens no servidor ==="
ssh "$SERVER" "cd $PROJECT_DIR && docker load -i doravia-backend.tar && docker load -i doravia-frontend.tar"

echo "=== [5/5] Subindo containers (sem build remoto) ==="
ssh "$SERVER" "cd $PROJECT_DIR && docker compose up -d"

rm -rf "$TMP"
echo ""
echo "=== Deploy concluído ==="
