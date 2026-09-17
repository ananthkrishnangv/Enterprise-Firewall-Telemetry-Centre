#!/usr/bin/env bash
# ==============================================================================
# Enterprise Firewall Monitoring Appliance - Auto Installer & First-Boot Init
# ==============================================================================
set -euo pipefail

echo "=================================================================="
echo "    Enterprise Firewall Monitoring Appliance Setup               "
echo "=================================================================="

# Check Root
if [ "$(id -u)" -ne 0 ]; then
  echo "[-] This script must be run as root (sudo)."
  exit 1
fi

APPLIANCE_DIR="/opt/firewall-appliance"
mkdir -p "$APPLIANCE_DIR/data"

# Install Docker & Docker Compose if missing
if ! command -v docker &>/dev/null; then
  echo "[+] Installing Docker Engine..."
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker
  systemctl start docker
fi

# Detect Server IP
PRIMARY_IP=$(hostname -I | awk '{print $1}')

echo "[+] Setting up appliance files in $APPLIANCE_DIR..."
cp docker-compose.yml "$APPLIANCE_DIR/"

cd "$APPLIANCE_DIR"

# Ensure data directory has proper permissions
chmod -R 775 data

# Start container
echo "[+] Starting Appliance Services via Docker Compose..."
docker compose up -d

echo ""
echo "=================================================================="
echo " [✓] Appliance Successfully Installed & Started!                 "
echo "=================================================================="
echo " Access the First-Time Configuration Wizard at:"
echo "     http://$PRIMARY_IP"
echo ""
echo " Telemetry Listeners Active:"
echo "     - Web Portal & API : Port 80 (TCP)"
echo "     - Syslog Ingest    : Port 1514 (UDP) & 514 (UDP)"
echo "     - NetFlow v5/v9    : Port 2055 (UDP)"
echo "     - Data Storage     : $APPLIANCE_DIR/data (Preserved on OTA updates)"
echo "=================================================================="
