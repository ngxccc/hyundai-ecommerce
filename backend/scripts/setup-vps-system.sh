#!/usr/bin/env bash
set -euo pipefail

echo "========================================================="
echo "   STAGE 1: SYSTEM ENVIRONMENT & DOCKER SETUP"
echo "========================================================="

# 1. Install Docker & Compose
echo "==> [1/2] Checking & Installing Docker (v29+) & Compose (v5+)..."
if command -v docker &>/dev/null && docker compose version &>/dev/null; then
    echo "Docker and Docker Compose are already installed. Skipping installation..."
else
    echo "==> Uninstalling old Docker versions..."
    sudo apt-get remove -y docker docker-engine docker.io containerd runc docker-compose || true

    echo "==> Setting up Docker official APT repository..."
    sudo apt-get update
    sudo apt-get install -y ca-certificates curl gnupg

    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor --yes -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg

    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null

    echo "==> Installing latest Docker Engine and Docker Compose..."
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

    sudo usermod -aG docker azureuser || true
    sudo systemctl enable docker
    sudo systemctl start docker
fi

# 1.5. Install Doppler CLI
echo "==> Checking & Installing Doppler CLI..."
if command -v doppler &>/dev/null; then
    echo "Doppler CLI is already installed. Skipping installation..."
else
    echo "==> Running official Doppler installation script..."
    (curl -Ls --tlsv1.2 --proto "=https" --retry 3 https://cli.doppler.com/install.sh || wget -t 3 -qO- https://cli.doppler.com/install.sh) | sudo sh
fi

# 2. Configure Swap
echo "==> [2/2] Checking & Configuring Swap Space (2GB)..."
if [ -f /swapfile ] || free | grep -i swap | grep -q '[1-9]'; then
    echo "Swap space is already configured. Skipping Swap setup..."
else
    echo "==> Configuring 2GB Swap space..."
    sudo fallocate -l 2G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    sudo sysctl vm.swappiness=10
    echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
fi

echo "---------------------------------------------------------"
echo "Installed Versions:"
docker --version
docker compose version
free -h
echo "========================================================="
