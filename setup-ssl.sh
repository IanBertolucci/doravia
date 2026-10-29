#!/bin/bash
set -euo pipefail

DOMAIN="${DOMAIN:-example.com}"
EMAIL="${EMAIL:-admin@example.com}"
PROJECT_DIR="/opt/doravia"
CERT_DIR="$PROJECT_DIR/certs"
LE_LIVE="/etc/letsencrypt/live/$DOMAIN"

echo "=== [1/5] Instalando certbot ==="
apt-get install -y certbot >/dev/null 2>&1 || apt-get update && apt-get install -y certbot >/dev/null

echo "=== [2/5] Parando frontend (libera porta 80) ==="
docker compose -f "$PROJECT_DIR/docker-compose.yml" stop frontend || true

echo "=== [3/5] Obtendo certificado ==="
certbot certonly --standalone -d "$DOMAIN" -d "www.$DOMAIN" \
  --non-interactive --agree-tos -m "$EMAIL"

echo "=== [4/5] Copiando certificados ==="
mkdir -p "$CERT_DIR"
cp "$LE_LIVE/fullchain.pem" "$CERT_DIR/"
cp "$LE_LIVE/privkey.pem" "$CERT_DIR/"
chmod 600 "$CERT_DIR/privkey.pem"

echo "=== [5/5] Subindo frontend com HTTPS ==="
docker compose -f "$PROJECT_DIR/docker-compose.yml" up -d --force-recreate frontend

echo "=== Renovação automática (cron) ==="
mkdir -p /etc/letsencrypt/renewal-hooks/deploy
cat > /etc/letsencrypt/renewal-hooks/deploy/copy-doravia.sh << EOF
#!/bin/bash
cp "$LE_LIVE/fullchain.pem" "$CERT_DIR/"
cp "$LE_LIVE/privkey.pem" "$CERT_DIR/"
chmod 600 "$CERT_DIR/privkey.pem"
docker exec doravia-frontend-1 nginx -s reload 2>/dev/null || true
EOF
chmod +x /etc/letsencrypt/renewal-hooks/deploy/copy-doravia.sh

# certbot systemd timer já renovável; garantir que roda 2x/dia
systemctl enable --now certbot.timer 2>/dev/null || true

echo ""
echo "=== HTTPS configurado ==="
echo "Acesse: https://$DOMAIN"
