#!/usr/bin/env bash
set -euo pipefail

echo "========================================================="
echo "   STAGE 4: RELOADING CADDY CONFIGURATION"
echo "========================================================="

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/.."
cd "$PROJECT_DIR"

# Determine if sudo is needed for docker
DOCKER_CMD="docker"
if ! groups | grep -q "\bdocker\b"; then
    DOCKER_CMD="sudo docker"
fi

echo "==> Reloading Caddy configuration..."
$DOCKER_CMD exec ticket-booking-caddy caddy reload --config /etc/caddy/Caddyfile

echo "========================================================="
