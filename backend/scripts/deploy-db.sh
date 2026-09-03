#!/usr/bin/env bash
set -euo pipefail

echo "========================================================="
echo "   STAGE 2: DATABASE & REVERSE PROXY LIFE-CYCLE"
echo "========================================================="

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/.."
cd "$PROJECT_DIR"

# Determine if sudo is needed for docker and compose
DOCKER_CMD="docker"
if ! groups | grep -q "\bdocker\b"; then
    DOCKER_CMD="sudo docker"
fi

echo "==> Ensuring latest .env is generated..."
./scripts/generate-env.sh

echo "==> Checking database destination..."
if [ -f .env ]; then
    # Extract variables for checking (avoid unbound variable errors with set -u)
    DB_URL=$(grep -E "^DB_URL=" .env | cut -d'=' -f2- | sed 's/#.*//' | xargs || echo "")
    REDIS_URL=$(grep -E "^REDIS_URL=" .env | cut -d'=' -f2- | sed 's/#.*//' | xargs || echo "")
else
    DB_URL=""
    REDIS_URL=""
fi

SERVICES_TO_UP=("caddy")
SERVICES_TO_DOWN=()

if [ -n "$DB_URL" ]; then
    SERVICES_TO_DOWN+=("postgres")
else
    SERVICES_TO_UP+=("postgres")
fi

if [ -n "$REDIS_URL" ]; then
    SERVICES_TO_DOWN+=("redis")
else
    SERVICES_TO_UP+=("redis")
fi

# Stop and clean up unused containers
if [ ${#SERVICES_TO_DOWN[@]} -gt 0 ]; then
    echo "==> Stopping externalized database services: ${SERVICES_TO_DOWN[*]}..."
    $DOCKER_CMD compose stop "${SERVICES_TO_DOWN[@]}" || true
    $DOCKER_CMD compose rm -f "${SERVICES_TO_DOWN[@]}" || true
fi

# Start only required containers (use --no-deps to prevent automatic dependency triggers)
echo "==> Starting required services: ${SERVICES_TO_UP[*]}..."
$DOCKER_CMD compose up -d --no-deps "${SERVICES_TO_UP[@]}"

echo "---------------------------------------------------------"
$DOCKER_CMD compose ps
