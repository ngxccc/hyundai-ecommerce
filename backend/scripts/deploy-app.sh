#!/usr/bin/env bash
set -euo pipefail

echo "========================================================="
echo "   ZERO-DOWNTIME BLUE-GREEN DEPLOYMENT PIPELINE"
echo "========================================================="

# Determine if sudo is needed for docker
DOCKER_CMD="docker"
if ! groups | grep -q "\bdocker\b"; then
  DOCKER_CMD="sudo docker"
fi

# 1. Determine which container is currently Active
if $DOCKER_CMD ps --format '{{.Names}}' | grep -q "^ticket-booking-app-blue$"; then
  ACTIVE="blue"
  NEXT="green"
else
  ACTIVE="green"
  NEXT="blue"
fi

echo "==> Active Container: ticket-booking-app-$ACTIVE"
echo "==> Next Container: ticket-booking-app-$NEXT"
echo "---------------------------------------------------------"

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/.."
cd "$PROJECT_DIR"
# 2. Ensure .env exists
./scripts/generate-env.sh

# 3. Build the latest Docker Image
echo "==> Building new Docker Image using pre-built artifacts..."
cp docker/Dockerfile.prod.dockerignore .dockerignore || true
# WHY: Force legacy docker builder to bypass BuildKit socket timeouts/ping issues on limited-RAM VPS.
DOCKER_BUILDKIT=0 $DOCKER_CMD build -f docker/Dockerfile.prod -t ticket-booking-app:latest .

# 4. Start the next version container
echo "==> Preparing container namespace for ticket-booking-app-$NEXT..."
if $DOCKER_CMD ps -a --format '{{.Names}}' | grep -q "^ticket-booking-app-$NEXT$"; then
  echo "==> Renaming conflicting container to free up namespace instantly..."
  $DOCKER_CMD rename "ticket-booking-app-$NEXT" "ticket-booking-app-$NEXT-old" || true
  $DOCKER_CMD rm -f "ticket-booking-app-$NEXT-old" || true
fi

$DOCKER_CMD run -d \
  --env-file .env \
  --network ticket-booking_ticket-booking-net \
  --name "ticket-booking-app-$NEXT" \
  --restart unless-stopped \
  --memory="256m" \
  --memory-reservation="128m" \
  --cpus="0.50" \
  ticket-booking-app:latest

# 5. Health Check the new container
echo "==> Performing health check on new container..."
sleep 5 # Wait for app to boot

SUCCESS=0
for i in {1..15}; do
  if $DOCKER_CMD exec "ticket-booking-app-$NEXT" wget -qO- http://localhost:3000/ >/dev/null; then
    echo "==> New container (ticket-booking-app-$NEXT) is HEALTHY and ready!"
    SUCCESS=1
    break
  fi
  echo "Waiting for application to boot (attempt $i/15)..."
  sleep 3
done

if [ $SUCCESS -ne 1 ]; then
  echo "❌ ERROR: New container (ticket-booking-app-$NEXT) failed to become healthy."
  echo "==> Fetching logs for container..."
  $DOCKER_CMD logs "ticket-booking-app-$NEXT" | tail -n 20
  exit 1
fi

# 6. Update Caddyfile & Reload Caddy Proxy
DOMAIN_NAME=$(grep -E "^DOMAIN_NAME=" .env | cut -d'=' -f2- || echo "http://ticketbooking.ngxc.io.vn")
CONTAINER_IP=$($DOCKER_CMD inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' "ticket-booking-app-$NEXT")
echo "==> Updating Caddyfile for domain: $DOMAIN_NAME to IP: $CONTAINER_IP..."
cat <<EOF >Caddyfile
$DOMAIN_NAME {
	reverse_proxy $CONTAINER_IP:3000 {
		lb_try_duration 3s
	}
}
EOF
# Stream configuration into the Caddy container
$DOCKER_CMD exec -i ticket-booking-caddy sh -c 'cat > /etc/caddy/Caddyfile' <Caddyfile

# Reload Caddy config instantly
echo "==> Reloading Caddy configuration..."
$DOCKER_CMD exec ticket-booking-caddy caddy reload --config /etc/caddy/Caddyfile

# 7. Stop and remove the old active container
if $DOCKER_CMD ps -a --format '{{.Names}}' | grep -q "^ticket-booking-app-$ACTIVE$"; then
  echo "==> Stopping and removing old active container (ticket-booking-app-$ACTIVE)..."
  $DOCKER_CMD stop "ticket-booking-app-$ACTIVE" || true
  $DOCKER_CMD rm "ticket-booking-app-$ACTIVE" || true
fi

if $DOCKER_CMD ps -a --format '{{.Names}}' | grep -q "^ticket-booking-container$"; then
  echo "==> Legacy standalone container detected (ticket-booking-container). Stopping and removing..."
  $DOCKER_CMD stop "ticket-booking-container" || true
  $DOCKER_CMD rm "ticket-booking-container" || true
fi

# 8. Clean up unused images to save disk space
echo "==> Cleaning up dangling Docker images..."
$DOCKER_CMD image prune -f

echo "========================================================="
echo " ZERO-DOWNTIME DEPLOYMENT TO ticket-booking-app-$NEXT COMPLETED!"
echo "========================================================="
