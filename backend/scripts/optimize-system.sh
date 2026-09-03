#!/usr/bin/env bash
set -euo pipefail

OPTIMIZED_FLAG="/var/tmp/.system_optimized"

# Ensure Docker daemon memory limits are removed (previously caused severe swap thrashing)
echo "==> Ensuring Docker daemon memory limits are removed..."
if [ -f /etc/systemd/system/docker.service.d/memory.conf ]; then
    sudo rm -f /etc/systemd/system/docker.service.d/memory.conf
    sudo systemctl daemon-reload || true
    sudo systemctl restart docker || echo "Docker restart failed (may need manual intervention)"
fi

# Check if already run once
if [ -f "$OPTIMIZED_FLAG" ]; then
    echo "========================================================="
    echo " ==> System optimization already applied. Skipping."
    echo "========================================================="
    exit 0
fi

echo "========================================================="
echo "   SYSTEM OPTIMIZATION SCRIPT (Safe Mode)"
echo "========================================================="

# Function to safely disable a service if it exists
disable_service_if_exists() {
    local service_name="$1"
    if systemctl list-unit-files | grep -q "^${service_name}.service"; then
        echo "==> Disabling ${service_name}..."
        sudo systemctl disable --now "${service_name}" || true
    else
        echo "==> ${service_name} not found. Skipping."
    fi
}

# 1. Disable Azure Linux Agent (walinuxagent)
disable_service_if_exists "walinuxagent"

# 2. Disable Unattended Upgrades
disable_service_if_exists "unattended-upgrades"

# 3. Optimize systemd-journald (limit log size to 50MB)
echo "==> Configuring systemd-journald to limit log size..."
sudo mkdir -p /etc/systemd/journald.conf.d
echo -e "[Journal]\nSystemMaxUse=50M\nRuntimeMaxUse=50M" | sudo tee /etc/systemd/journald.conf.d/99-optimize.conf >/dev/null
sudo systemctl restart systemd-journald || true
echo "==> systemd-journald log size limited to 50MB."


# 5. Mark as optimized
sudo touch "$OPTIMIZED_FLAG"

echo "========================================================="
echo " SYSTEM OPTIMIZATION COMPLETED"
echo "========================================================="
