#!/usr/bin/env bash
# ==============================================================================
# Enterprise Firewall Telemetry & Security Operations Center
# Universal Automated Installer & Post-Installation Whitelabeling Wizard
# Target OS: Ubuntu (20.04/22.04/24.04/Debian) & Rocky Linux (8/9/RHEL/AlmaLinux)
#
# Licensing & Legal Attribution:
# CSIR-SERC Free Community & Institutional License (Version 1.0)
# Copyright (c) 2024-2026 CSIR-SERC, Chennai, India. All Rights Reserved.
# Developed by Information and Communication Technology Division (ICTD), CSIR-SERC.
# "Made by ICTD CSIR-SERC for CSIR with ❤️"
# ==============================================================================
set -Eeuo pipefail

# ------------------------------------------------------------------------------
# Color Palettes & UI Styles
# ------------------------------------------------------------------------------
BOLD="\033[1m"
DIM="\033[2m"
RED="\033[0;31m"
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
BLUE="\033[0;34m"
MAGENTA="\033[0;35m"
CYAN="\033[0;36m"
WHITE="\033[1;37m"
RESET="\033[0m"

log_info()    { echo -e "${CYAN}${BOLD}[INFO]${RESET} $*"; }
log_success() { echo -e "${GREEN}${BOLD}[SUCCESS]${RESET} $*"; }
log_warn()    { echo -e "${YELLOW}${BOLD}[WARN]${RESET} $*"; }
log_error()   { echo -e "${RED}${BOLD}[ERROR]${RESET} $*" >&2; }
log_step()    { echo -e "\n${MAGENTA}${BOLD}==>${RESET} ${WHITE}${BOLD}$*${RESET}"; }

# ------------------------------------------------------------------------------
# Universal Institutional Attribution & Legal Footer
# ------------------------------------------------------------------------------
UNIVERSAL_LICENSE="CSIR-SERC Free Community & Institutional License (v1.0)"
UNIVERSAL_ATTRIBUTION="Made by ICTD CSIR-SERC for CSIR with ❤️"
UNIVERSAL_LEGAL_FOOTER="CSIR - Structural Engineering Research Centre • Council of Scientific & Industrial Research"

display_banner() {
  clear 2>/dev/null || true
  echo -e "${CYAN}${BOLD}"
  echo "╔═══════════════════════════════════════════════════════════════════════════╗"
  echo "║       Enterprise Firewall Telemetry & Security Operations Center          ║"
  echo "║           Universal Linux Production Installer & Setup Wizard             ║"
  echo "║                 Ubuntu 20/22/24 & Rocky Linux / RHEL 8/9                  ║"
  echo "╚═══════════════════════════════════════════════════════════════════════════╝${RESET}"
  echo -e " ${DIM}Universal License :${RESET} ${WHITE}${UNIVERSAL_LICENSE}${RESET}"
  echo -e " ${DIM}Attribution       :${RESET} ${YELLOW}${UNIVERSAL_ATTRIBUTION}${RESET}"
  echo -e " ${DIM}Mandate           :${RESET} ${GREEN}CERT-In Section 70B Baseline & UX4G Standard${RESET}"
  echo "-----------------------------------------------------------------------------"
}

# ------------------------------------------------------------------------------
# Global Defaults & Configuration
# ------------------------------------------------------------------------------
REPO_URL="https://github.com/ananthkrishnangv/Enterprise-Firewall-Telemetry-Centre.git"
INSTALL_DIR="/opt/firewall-telemetry"
SERVICE_NAME="firewall-telemetry"
UNATTENDED=false

for arg in "$@"; do
  case "$arg" in
    -y|--yes|--unattended|--non-interactive)
      UNATTENDED=true
      shift
      ;;
    --dir=*)
      INSTALL_DIR="${arg#*=}"
      shift
      ;;
    -h|--help)
      echo "Usage: sudo bash install.sh [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  -y, --unattended     Run non-interactively using standard institutional defaults"
      echo "  --dir=PATH           Set target installation directory (default: /opt/firewall-telemetry)"
      echo "  -h, --help           Show this help message"
      exit 0
      ;;
  esac
done

# ------------------------------------------------------------------------------
# 1. Root & Hardware Preflight Check
# ------------------------------------------------------------------------------
check_preflights() {
  log_step "Step 1/8: Hardware & Execution Environment Preflight Checks"

  if [[ $EUID -ne 0 ]]; then
    log_error "This installation script must be run as root (sudo bash install.sh)."
    exit 1
  fi

  # Detect Architecture
  ARCH=$(uname -m)
  if [[ "$ARCH" != "x86_64" && "$ARCH" != "aarch64" ]]; then
    log_error "Unsupported CPU Architecture: $ARCH. Required: x86_64 or aarch64."
    exit 1
  fi
  log_info "CPU Architecture: ${WHITE}$ARCH${RESET}"

  # RAM Check
  TOTAL_MEM_MB=$(free -m | awk '/^Mem:/{print $2}')
  log_info "Detected System RAM: ${WHITE}${TOTAL_MEM_MB} MB${RESET}"
  if [[ "$TOTAL_MEM_MB" -lt 1900 ]]; then
    log_warn "System has less than 2 GB RAM. Recommended: >= 4 GB RAM for InfluxDB & PostgreSQL."
    if [[ "$UNATTENDED" = false ]]; then
      read -rp "Do you wish to continue despite low RAM? (y/N): " mem_choice
      if [[ "$mem_choice" != "y" && "$mem_choice" != "Y" ]]; then
        log_error "Installation aborted by operator."
        exit 1
      fi
    fi
  fi

  # Disk Space Check
  AVAILABLE_DISK_MB=$(df -m / | awk 'NR==2 {print $4}')
  log_info "Available Root Disk Space: ${WHITE}${AVAILABLE_DISK_MB} MB${RESET}"
  if [[ "$AVAILABLE_DISK_MB" -lt 5000 ]]; then
    log_warn "Low disk space (< 5 GB). Minimum 15 GB recommended for 180-day TSDB retention."
  fi
}

# ------------------------------------------------------------------------------
# 2. Linux Distribution Identification
# ------------------------------------------------------------------------------
detect_os() {
  log_step "Step 2/8: Operating System & Package Manager Detection"

  if [[ ! -f /etc/os-release ]]; then
    log_error "Cannot identify Linux distribution: /etc/os-release is missing."
    exit 1
  fi

  # Source os-release
  # shellcheck source=/dev/null
  . /etc/os-release

  OS_ID="${ID:-unknown}"
  OS_ID_LIKE="${ID_LIKE:-}"
  OS_VERSION_ID="${VERSION_ID:-}"
  OS_NAME="${NAME:-Linux}"

  log_info "Detected OS: ${WHITE}$OS_NAME (Version: $OS_VERSION_ID)${RESET}"

  if [[ "$OS_ID" == "ubuntu" || "$OS_ID" == "debian" || "$OS_ID_LIKE" =~ (ubuntu|debian) ]]; then
    DISTRO_FAMILY="debian"
    PKG_MGR="apt-get"
    log_success "Target Platform Category: ${GREEN}Debian / Ubuntu Family${RESET}"
  elif [[ "$OS_ID" == "rocky" || "$OS_ID" == "almalinux" || "$OS_ID" == "rhel" || "$OS_ID" == "centos" || "$OS_ID_LIKE" =~ (rhel|fedora|centos) ]]; then
    DISTRO_FAMILY="rhel"
    PKG_MGR="dnf"
    if ! command -v dnf &>/dev/null; then
      PKG_MGR="yum"
    fi
    log_success "Target Platform Category: ${GREEN}RHEL / Rocky Linux Family${RESET}"
  else
    log_error "Unsupported Linux distribution: $OS_ID ($OS_NAME)."
    log_error "Supported distributions: Ubuntu 20.04+, Debian 11+, Rocky Linux 8/9, AlmaLinux 8/9, RHEL 8/9."
    exit 1
  fi
}

# ------------------------------------------------------------------------------
# 3. System Update & Essential Tooling
# ------------------------------------------------------------------------------
install_system_prerequisites() {
  log_step "Step 3/8: Updating Linux Server & Installing Core Prerequisites"

  if [[ "$DISTRO_FAMILY" == "debian" ]]; then
    export DEBIAN_FRONTEND=noninteractive
    log_info "Refreshing APT package indices and applying security updates..."
    apt-get update -y -q
    apt-get upgrade -y -q

    log_info "Installing core system utilities (curl, git, jq, snmp, openssl, ufw)..."
    apt-get install -y -q \
      curl \
      wget \
      git \
      jq \
      openssl \
      ca-certificates \
      gnupg \
      lsb-release \
      tar \
      gzip \
      unzip \
      net-tools \
      iproute2 \
      snmp \
      libsnmp-dev \
      ufw
  elif [[ "$DISTRO_FAMILY" == "rhel" ]]; then
    log_info "Checking DNF package repositories and applying security updates..."
    $PKG_MGR update -y -q

    # Ensure EPEL repository is enabled for Rocky / RHEL
    if ! $PKG_MGR repolist | grep -qi epel; then
      log_info "Enabling EPEL (Extra Packages for Enterprise Linux)..."
      $PKG_MGR install -y epel-release || true
    fi

    log_info "Installing core system utilities (curl, git, jq, snmp, openssl, firewalld)..."
    $PKG_MGR install -y -q \
      curl \
      wget \
      git \
      jq \
      openssl \
      ca-certificates \
      tar \
      gzip \
      unzip \
      net-tools \
      iproute \
      net-snmp \
      net-snmp-utils \
      firewalld
  fi
  log_success "Operating system updated and base packages installed."
}

# ------------------------------------------------------------------------------
# 4. Node.js 22 LTS Installation
# ------------------------------------------------------------------------------
install_nodejs() {
  log_step "Step 4/8: Provisioning Node.js 22 LTS Runtime & npm Toolchain"

  INSTALL_NODE=true
  if command -v node &>/dev/null; then
    CURRENT_NODE_VER=$(node -v | sed 's/v//' | cut -d. -f1)
    if [[ "$CURRENT_NODE_VER" -ge 20 ]]; then
      log_success "Compatible Node.js already installed: $(node -v) (npm $(npm -v))"
      INSTALL_NODE=false
    else
      log_warn "Installed Node.js version ($(node -v)) is outdated. Upgrading to Node.js 22 LTS..."
    fi
  fi

  if [[ "$INSTALL_NODE" = true ]]; then
    if [[ "$DISTRO_FAMILY" == "debian" ]]; then
      log_info "Configuring NodeSource 22.x APT repository..."
      curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
      apt-get install -y -q nodejs
    elif [[ "$DISTRO_FAMILY" == "rhel" ]]; then
      log_info "Configuring NodeSource 22.x DNF/RPM repository..."
      curl -fsSL https://rpm.nodesource.com/setup_22.x | bash -
      $PKG_MGR install -y -q nodejs
    fi
    log_success "Node.js successfully provisioned: $(node -v) (npm $(npm -v))"
  fi
}

# ------------------------------------------------------------------------------
# 5. Docker Engine & Docker Compose Plugin
# ------------------------------------------------------------------------------
install_docker() {
  log_step "Step 5/8: Provisioning Docker Engine & Docker Compose Container Runtime"

  if command -v docker &>/dev/null && docker compose version &>/dev/null; then
    log_success "Docker Engine and Docker Compose are already present: $(docker --version)"
    systemctl enable --now docker 2>/dev/null || true
    return 0
  fi

  log_info "Installing official Docker CE engine..."
  if [[ "$DISTRO_FAMILY" == "debian" ]]; then
    install -m 0755 -d /etc/apt/keyrings
    if [[ ! -f /etc/apt/keyrings/docker.gpg ]]; then
      curl -fsSL https://download.docker.com/linux/"$OS_ID"/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
      chmod a+r /etc/apt/keyrings/docker.gpg
    fi

    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/$OS_ID \
      $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

    apt-get update -y -q
    apt-get install -y -q docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  elif [[ "$DISTRO_FAMILY" == "rhel" ]]; then
    log_info "Configuring Docker CE dnf repository..."
    $PKG_MGR config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo 2>/dev/null || \
      curl -fsSL https://get.docker.com | sh
    $PKG_MGR install -y -q docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin 2>/dev/null || true
  fi

  # Fallback to official script if distribution repo missed
  if ! command -v docker &>/dev/null; then
    log_warn "Direct package installation failed. Invoking official get.docker.com script..."
    curl -fsSL https://get.docker.com | sh
  fi

  systemctl enable --now docker
  systemctl enable --now containerd 2>/dev/null || true
  log_success "Docker Engine successfully active: $(docker --version) | $(docker compose version)"
}

# ------------------------------------------------------------------------------
# 6. Firewall & Security Ports
# ------------------------------------------------------------------------------
configure_firewall() {
  log_step "Step 6/8: Configuring Host Firewall & Security Ingress Rules"

  REQUIRED_PORTS=(
    "80/tcp:HTTP Web Management Console"
    "443/tcp:HTTPS Web Portal"
    "162/udp:SNMP Trap Ingest Receiver"
    "1514/udp:Syslog Primary Collector"
    "514/udp:Syslog Alternate Port"
    "2055/udp:NetFlow v5/v9 and IPFIX Ingest"
  )

  if [[ "$DISTRO_FAMILY" == "debian" ]]; then
    if command -v ufw &>/dev/null; then
      log_info "Applying rules via UFW (Uncomplicated Firewall)..."
      ufw allow 22/tcp comment "SSH Management" >/dev/null || true
      for entry in "${REQUIRED_PORTS[@]}"; do
        PORT_PROTO="${entry%%:*}"
        DESC="${entry##*:}"
        ufw allow "$PORT_PROTO" comment "$DESC" >/dev/null || true
        log_info "  - Allowed $PORT_PROTO ($DESC)"
      done
      if ufw status | grep -qw "active"; then
        ufw reload >/dev/null || true
      fi
    fi
  elif [[ "$DISTRO_FAMILY" == "rhel" ]]; then
    if systemctl is-active --quiet firewalld 2>/dev/null || systemctl is-enabled --quiet firewalld 2>/dev/null; then
      log_info "Applying rules via Firewalld..."
      systemctl start firewalld 2>/dev/null || true
      firewall-cmd --permanent --add-service=ssh >/dev/null 2>&1 || true
      for entry in "${REQUIRED_PORTS[@]}"; do
        PORT_PROTO="${entry%%:*}"
        firewall-cmd --permanent --add-port="$PORT_PROTO" >/dev/null 2>&1 || true
        log_info "  - Allowed $PORT_PROTO"
      done
      firewall-cmd --reload >/dev/null 2>&1 || true
    fi

    # Handle SELinux container permissions
    if command -v getenforce &>/dev/null; then
      SELINUX_STATUS=$(getenforce)
      if [[ "$SELINUX_STATUS" == "Enforcing" ]]; then
        log_info "Configuring SELinux policy for container networking..."
        setsebool -P container_manage_cgroup 1 2>/dev/null || true
      fi
    fi
  fi
  log_success "Perimeter host firewall rules synchronized."
}

# ------------------------------------------------------------------------------
# 7. Repository Download, Build & Container Deployment
# ------------------------------------------------------------------------------
deploy_portal_software() {
  log_step "Step 7/8: Downloading Repository from GitHub & Compiling Portal"

  CURRENT_DIR=$(pwd)
  # Check if running inside cloned repo already
  if [[ -f "$CURRENT_DIR/package.json" && -d "$CURRENT_DIR/server" && -d "$CURRENT_DIR/client" ]]; then
    log_info "Installer running directly from source directory: $CURRENT_DIR"
    if [[ "$CURRENT_DIR" != "$INSTALL_DIR" ]]; then
      log_info "Syncing local files to production directory: $INSTALL_DIR..."
      mkdir -p "$INSTALL_DIR"
      cp -r "$CURRENT_DIR"/. "$INSTALL_DIR"/
    fi
  else
    if [[ -d "$INSTALL_DIR/.git" ]]; then
      log_info "Existing repository detected at $INSTALL_DIR. Pulling latest updates..."
      git -C "$INSTALL_DIR" pull --ff-only || true
    else
      log_info "Cloning repository from GitHub to $INSTALL_DIR..."
      mkdir -p "$INSTALL_DIR"
      git clone "$REPO_URL" "$INSTALL_DIR"
    fi
  fi

  cd "$INSTALL_DIR"

  # Create persistent storage directories
  mkdir -p data uploads backups
  chmod -R 775 data uploads backups

  log_info "Installing frontend & backend dependencies (npm install)..."
  npm run install:all

  log_info "Compiling TypeScript backend server (tsc)..."
  npm run build:server

  log_info "Compiling Vue 3.5 frontend operations console (vite build)..."
  npm run build:client

  log_info "Deploying PostgreSQL 18, InfluxDB 2.7 TSDB & Telemetry Console containers..."
  docker compose -f docker-compose.standalone.yml up -d --build

  # Wait for Portal healthcheck
  log_info "Waiting for portal services to become fully healthy..."
  HEALTH_URL="http://127.0.0.1:80/health"
  SUCCESS=false
  for i in {1..30}; do
    if curl -s -f "$HEALTH_URL" &>/dev/null; then
      SUCCESS=true
      break
    fi
    echo -n "."
    sleep 2
  done
  echo ""

  if [[ "$SUCCESS" = true ]]; then
    log_success "Portal services are HEALTHY and responsive on Port 80!"
  else
    log_warn "Healthcheck timed out. Containers may still be initializing. Checking logs:"
    docker compose -f docker-compose.standalone.yml ps
  fi
}

# ------------------------------------------------------------------------------
# 8. Post-Installation Whitelabeling & Firewall SNMP Setup Wizard
# ------------------------------------------------------------------------------
run_post_install_wizard() {
  log_step "Step 8/8: Post-Installation Product Whitelabeling & Firewall SNMP Setup Wizard"

  # Detect Primary Host IP
  PRIMARY_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
  if [[ -z "$PRIMARY_IP" ]]; then
    PRIMARY_IP="127.0.0.1"
  fi

  # Default Settings
  ORG_NAME="CSIR-SERC (Chennai)"
  ORG_DIV="ICT & Network Security Division"
  APEX_BODY="Council of Scientific & Industrial Research"
  PORTAL_TITLE="CSIR - Structural Engineering Research Centre"
  PORTAL_SUBTITLE="Enterprise Firewall Telemetry & Security Operations Command"
  PRESET_LOGO="shield"

  FW_IP="10.10.3.15"
  FW_NAME="FortiGate-CSIR-SERC"
  FW_VENDOR="fortinet"
  FW_LOCATION="Central Datacenter"
  SNMP_VERSION="v2c"
  SNMP_COMMUNITY="fortinet"
  SNMP_PORT="161"
  ADMIN_PASSWORD="SuperAdmin@2026!"
  TELEGRAM_ENABLED=false
  TELEGRAM_TOKEN=""
  TELEGRAM_CHATID=""

  if [[ "$UNATTENDED" = false ]]; then
    echo -e "${YELLOW}${BOLD}"
    echo "┌───────────────────────────────────────────────────────────────────────────┐"
    echo "│         PRODUCT WHITELABELING & FIREWALL SNMP CONFIGURATION WIZARD        │"
    echo "│                                                                           │"
    echo "│  This wizard configures institutional branding, naming, logos, and your   │"
    echo "│  primary perimeter firewall SNMP targets.                                 │"
    echo "│                                                                           │"
    echo "│  NOTE: Universal licensing and legal footers are preserved automatically  │"
    echo "│  in compliance with the CSIR-SERC Community License (v1.0).               │"
    echo "└───────────────────────────────────────────────────────────────────────────┘${RESET}"
    echo ""

    # Whitelabeling Section
    echo -e "${CYAN}${BOLD}=== SECTION A: PRODUCT WHITELABELING & BRANDING ===${RESET}"
    read -rp "Enter Organization / University Name [$ORG_NAME]: " input_org
    ORG_NAME="${input_org:-$ORG_NAME}"

    read -rp "Enter Division / Department Name [$ORG_DIV]: " input_div
    ORG_DIV="${input_div:-$ORG_DIV}"

    read -rp "Enter Apex / Governing Body [$APEX_BODY]: " input_apex
    APEX_BODY="${input_apex:-$APEX_BODY}"

    read -rp "Enter Portal Header Title [$PORTAL_TITLE]: " input_title
    PORTAL_TITLE="${input_title:-$PORTAL_TITLE}"

    read -rp "Enter Portal Subtitle [$PORTAL_SUBTITLE]: " input_sub
    PORTAL_SUBTITLE="${input_sub:-$PORTAL_SUBTITLE}"

    echo ""
    echo -e "Choose Vector Preset Logo:"
    echo -e "  ${WHITE}1)${RESET} Shield & Perimeter Defense (Default)"
    echo -e "  ${WHITE}2)${RESET} Cyber Radar Operations"
    echo -e "  ${WHITE}3)${RESET} Government / National Emblem"
    echo -e "  ${WHITE}4)${RESET} High-Tech Enterprise Grid"
    echo -e "  ${WHITE}5)${RESET} Fortress Perimeter"
    read -rp "Select Logo [1]: " logo_choice
    case "$logo_choice" in
      2) PRESET_LOGO="radar" ;;
      3) PRESET_LOGO="emblem" ;;
      4) PRESET_LOGO="grid" ;;
      5) PRESET_LOGO="fortress" ;;
      *) PRESET_LOGO="shield" ;;
    esac

    # Firewall Section
    echo ""
    echo -e "${CYAN}${BOLD}=== SECTION B: PERIMETER FIREWALL & SNMP TELEMETRY ===${RESET}"
    read -rp "Enter Primary Firewall IP Address [$FW_IP]: " input_fw_ip
    FW_IP="${input_fw_ip:-$FW_IP}"

    echo "Select Firewall Vendor:"
    echo "  1) Fortinet FortiGate (Default)"
    echo "  2) Check Point Quantum"
    echo "  3) Palo Alto Networks PAN-OS"
    echo "  4) pfSense / OPNsense"
    echo "  5) Cisco ASA / Firepower"
    read -rp "Select Vendor [1]: " vendor_choice
    case "$vendor_choice" in
      2) FW_VENDOR="checkpoint"; FW_NAME="CheckPoint-Quantum-Gateway" ;;
      3) FW_VENDOR="paloalto"; FW_NAME="PaloAlto-NGFW-Gateway" ;;
      4) FW_VENDOR="pfsense"; FW_NAME="pfSense-Perimeter-Gateway" ;;
      5) FW_VENDOR="cisco"; FW_NAME="Cisco-Perimeter-Firewall" ;;
      *) FW_VENDOR="fortinet"; FW_NAME="FortiGate-Perimeter-Gateway" ;;
    esac

    read -rp "Enter Friendly Firewall Label [$FW_NAME]: " input_fw_name
    FW_NAME="${input_fw_name:-$FW_NAME}"

    read -rp "Enter Firewall Physical Location [$FW_LOCATION]: " input_fw_loc
    FW_LOCATION="${input_fw_loc:-$FW_LOCATION}"

    echo "Select SNMP Version:"
    echo "  1) SNMPv2c (Default)"
    echo "  2) SNMPv3 (noAuthNoPriv - Recommended for FortiGate)"
    read -rp "Select SNMP Version [1]: " snmp_ver_choice
    if [[ "$snmp_ver_choice" == "2" ]]; then
      SNMP_VERSION="v3"
    else
      SNMP_VERSION="v2c"
    fi

    read -rp "Enter SNMP Community / User string [$SNMP_COMMUNITY]: " input_snmp_comm
    SNMP_COMMUNITY="${input_snmp_comm:-$SNMP_COMMUNITY}"

    read -rp "Enter SNMP Polling Port [$SNMP_PORT]: " input_snmp_port
    SNMP_PORT="${input_snmp_port:-$SNMP_PORT}"

    # Superadmin Credentials
    echo ""
    echo -e "${CYAN}${BOLD}=== SECTION C: SUPERADMIN SECURITY CREDENTIALS ===${RESET}"
    read -s -rp "Set Superadmin Password [Press Enter to keep default '$ADMIN_PASSWORD']: " input_pw
    echo ""
    if [[ -n "$input_pw" ]]; then
      ADMIN_PASSWORD="$input_pw"
    fi

    # Telegram Alerting
    echo ""
    echo -e "${CYAN}${BOLD}=== SECTION D: REAL-TIME INCIDENT NOTIFICATIONS ===${RESET}"
    read -rp "Enable Telegram Bot Alerts for Critical Threats & Link Drops? (y/N): " tele_choice
    if [[ "$tele_choice" == "y" || "$tele_choice" == "Y" ]]; then
      TELEGRAM_ENABLED=true
      read -rp "Enter Telegram Bot Token: " TELEGRAM_TOKEN
      read -rp "Enter Telegram Admin Chat ID: " TELEGRAM_CHATID
    fi
  else
    log_info "Unattended mode active. Applying standard institutional defaults."
  fi

  # Construct and submit the Setup Payload to the API
  log_info "Submitting whitelabeling & firewall setup to portal API..."

  SETUP_PAYLOAD=$(jq -n \
    --arg orgName "$ORG_NAME" \
    --arg orgDivision "$ORG_DIV" \
    --arg apexBody "$APEX_BODY" \
    --arg portalTitle "$PORTAL_TITLE" \
    --arg portalSubtitle "$PORTAL_SUBTITLE" \
    --arg presetLogo "$PRESET_LOGO" \
    --arg footerNotice "$UNIVERSAL_LEGAL_FOOTER" \
    --arg fwIp "$FW_IP" \
    --arg fwVendor "$FW_VENDOR" \
    --arg fwName "$FW_NAME" \
    --arg fwLoc "$FW_LOCATION" \
    --arg snmpVer "$SNMP_VERSION" \
    --arg snmpComm "$SNMP_COMMUNITY" \
    --arg snmpPort "$SNMP_PORT" \
    --arg adminPw "$ADMIN_PASSWORD" \
    --argjson teleEnabled "$TELEGRAM_ENABLED" \
    --arg teleToken "$TELEGRAM_TOKEN" \
    --arg teleChat "$TELEGRAM_CHATID" \
    '{
      branding: {
        orgName: $orgName,
        orgDivision: $orgDivision,
        apexBody: $apexBody,
        portalTitle: $portalTitle,
        portalSubtitle: $portalSubtitle,
        presetLogo: $presetLogo,
        logoType: "preset",
        footerNotice: $footerNotice,
        isSetupComplete: true
      },
      firewall: {
        ipAddress: $fwIp,
        vendor: $fwVendor,
        name: $fwName,
        location: $fwLoc,
        snmpVersion: $snmpVer,
        snmpCommunity: $snmpComm,
        snmpPort: ($snmpPort | tonumber)
      },
      adminPassword: $adminPw,
      telegram: {
        enabled: $teleEnabled,
        botToken: $teleToken,
        chatId: $teleChat
      }
    }')

  WIZARD_URL="http://127.0.0.1:80/api/settings/wizard/complete"
  RESPONSE=$(curl -s -X POST "$WIZARD_URL" \
    -H "Content-Type: application/json" \
    -d "$SETUP_PAYLOAD" || echo '{"success":false}')

  if echo "$RESPONSE" | grep -q '"success":true'; then
    log_success "Whitelabeling & SNMP telemetry settings applied successfully!"
  else
    log_warn "API returned: $RESPONSE. Settings can also be configured at http://$PRIMARY_IP/wizard."
  fi
}

# ------------------------------------------------------------------------------
# 9. Systemd Service Registration
# ------------------------------------------------------------------------------
register_systemd_service() {
  log_step "Registering systemd Service for Automated Boot & Power-Cycle Recovery"

  SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
  cat <<EOF > "$SERVICE_FILE"
[Unit]
Description=Enterprise Firewall Telemetry & Security Operations Center
After=docker.service network-online.target
Requires=docker.service network-online.target

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=${INSTALL_DIR}
ExecStart=/usr/bin/docker compose -f docker-compose.standalone.yml up -d
ExecStop=/usr/bin/docker compose -f docker-compose.standalone.yml down
TimeoutStartSec=300

[Install]
WantedBy=multi-user.target
EOF

  systemctl daemon-reload
  systemctl enable "${SERVICE_NAME}.service"
  log_success "Registered systemd service: ${SERVICE_NAME}.service (Enabled on boot)"
}

# ------------------------------------------------------------------------------
# Main Orchestration Loop
# ------------------------------------------------------------------------------
main() {
  display_banner
  check_preflights
  detect_os
  install_system_prerequisites
  install_nodejs
  install_docker
  configure_firewall
  deploy_portal_software
  run_post_install_wizard
  register_systemd_service

  PRIMARY_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
  if [[ -z "$PRIMARY_IP" ]]; then
    PRIMARY_IP="127.0.0.1"
  fi

  echo ""
  echo -e "${GREEN}${BOLD}========================================================================${RESET}"
  echo -e "${GREEN}${BOLD} [✓] DEPLOYMENT & WHITELABELING INITIALIZATION COMPLETE!                ${RESET}"
  echo -e "${GREEN}${BOLD}========================================================================${RESET}"
  echo ""
  echo -e " ${BOLD}Access the Telemetry & Operations Console at:${RESET}"
  echo -e "   ${CYAN}${BOLD}http://${PRIMARY_IP}${RESET}"
  echo ""
  echo -e " ${BOLD}Default Superadmin Credentials:${RESET}"
  echo -e "   Username : ${WHITE}${BOLD}superadmin${RESET}"
  echo -e "   Password : ${WHITE}${BOLD}${ADMIN_PASSWORD:-SuperAdmin@2026!}${RESET}"
  echo ""
  echo -e " ${BOLD}Management & Whitelabeling Controls:${RESET}"
  echo -e "   - Web Settings & Logo Upload : ${WHITE}http://${PRIMARY_IP}/settings${RESET}"
  echo -e "   - Re-run Web Setup Wizard    : ${WHITE}http://${PRIMARY_IP}/wizard${RESET}"
  echo -e "   - Service Status             : ${WHITE}systemctl status ${SERVICE_NAME}${RESET}"
  echo -e "   - Service Restart            : ${WHITE}systemctl restart ${SERVICE_NAME}${RESET}"
  echo ""
  echo -e " ${BOLD}Active Telemetry Ingestion Ports:${RESET}"
  echo -e "   - Web Portal & REST/WS API   : ${WHITE}Port 80 / 443 (TCP)${RESET}"
  echo -e "   - SNMP Trap Receiver         : ${WHITE}Port 162 (UDP) [v2c / v3 fortinet]${RESET}"
  echo -e "   - Syslog Ingest              : ${WHITE}Port 1514 (UDP) & 514 (UDP)${RESET}"
  echo -e "   - NetFlow v5/v9 & IPFIX      : ${WHITE}Port 2055 (UDP)${RESET}"
  echo -e "   - Persistent Data Storage    : ${WHITE}${INSTALL_DIR}/data${RESET}"
  echo ""
  echo -e " ${DIM}Universal License :${RESET} ${WHITE}${UNIVERSAL_LICENSE}${RESET}"
  echo -e " ${DIM}Attribution       :${RESET} ${YELLOW}${UNIVERSAL_ATTRIBUTION}${RESET}"
  echo -e "${GREEN}${BOLD}========================================================================${RESET}"
}

main "$@"
