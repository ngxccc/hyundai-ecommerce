#!/usr/bin/env bash
set -euo pipefail

# Script to initialize the default .env configuration file if it does not exist
ENV_FILE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/../.env"

if [ -n "${DOPPLER_TOKEN:-}" ]; then
    echo "==> DOPPLER_TOKEN detected. Exporting latest variables from Doppler..."
    if command -v doppler &>/dev/null; then
        # WHY: If a Personal or CLI token is used, force the project and config to DOPPLER_CONFIG (defaults to prd)
        # to avoid failure since doppler.yaml is not packaged to the VPS.
        # Service tokens (dp.st.) are locked to their own config/project, so we do not pass these flags.
        CONFIG_FLAG=""
        if [[ "${DOPPLER_TOKEN:-}" =~ ^dp\.(pt|cli)\. ]]; then
            CONFIG_FLAG="--project ticket-booking --config ${DOPPLER_CONFIG:-prd}"
        fi

        # WHY: Remove the existing file first. If it was created by root or another user,
        # we can still delete and recreate it since we have write permissions on the parent directory.
        rm -f "$ENV_FILE"

        # Download secrets as plaintext .env format to stdout and redirect to avoid local filesystem encryption.
        doppler secrets download $CONFIG_FLAG --format=env-no-quotes --no-file > "$ENV_FILE"
        echo "==> Successfully synced environment variables from Doppler."
        
        # WHY: If DB_HOST/REDIS_HOST are not defined in Doppler, append defaults for local Docker container networking.
        if ! grep -q "^DB_HOST=" "$ENV_FILE" && ! grep -q "^DB_URL=" "$ENV_FILE"; then
            echo "DB_HOST=postgres" >> "$ENV_FILE"
        fi
        if ! grep -q "^REDIS_HOST=" "$ENV_FILE" && ! grep -q "^REDIS_URL=" "$ENV_FILE"; then
            echo "REDIS_HOST=redis" >> "$ENV_FILE"
        fi
        if ! grep -q "^PORT=" "$ENV_FILE"; then
            echo "PORT=3000" >> "$ENV_FILE"
        fi
    else
        echo "❌ Error: doppler CLI is not installed on this system."
        exit 1
    fi
else
    if [ ! -f "$ENV_FILE" ]; then
        echo "==> Creating default local $ENV_FILE..."
        cat <<EOF >"$ENV_FILE"
NODE_ENV=production
PORT=3000
DOMAIN_NAME=http://ticketbooking.ngxc.io.vn
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgrespassword
DB_DATABASE=ticket_booking
REDIS_HOST=redis
REDIS_PORT=6379
EOF
    else
        echo "==> $ENV_FILE already exists. Checking for missing variables..."
        if ! grep -q "^DOMAIN_NAME=" "$ENV_FILE"; then
            echo "==> Appending DOMAIN_NAME to existing $ENV_FILE..."
            echo "DOMAIN_NAME=http://ticketbooking.ngxc.io.vn" >>"$ENV_FILE"
        fi
    fi
fi
