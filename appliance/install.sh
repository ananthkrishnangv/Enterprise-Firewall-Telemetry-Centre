#!/usr/bin/env bash
# ==============================================================================
# Enterprise Firewall Monitoring Appliance - Auto Installer & First-Boot Init
# Delegates to Universal Linux Installer with post-installation whitelabeling wizard
# ==============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_INSTALLER="$SCRIPT_DIR/../install.sh"

if [[ -f "$ROOT_INSTALLER" ]]; then
  exec bash "$ROOT_INSTALLER" "$@"
else
  # Fallback to direct download from GitHub if running isolated
  curl -fsSL https://raw.githubusercontent.com/ananthkrishnangv/Enterprise-Firewall-Telemetry-Centre/main/install.sh | bash -s -- "$@"
fi
