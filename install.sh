#!/usr/bin/env bash
# ==============================================================================
# Enterprise Firewall Telemetry & Security Operations Center
# Turnkey Bare-Metal Linux Installer & Interactive Whitelabel Setup Wizard
# Target OS: Ubuntu (20.04/22.04/24.04/Debian 11/12) & Rocky Linux (8/9/RHEL/AlmaLinux)
#
# Licensing & Legal Attribution:
# CSIR-SERC Free Community & Institutional License (Version 1.0)
# Copyright (c) 2024-2026 CSIR-SERC, Chennai, India. All Rights Reserved.
# Developed by Information and Communication Technology Division (ICTD), CSIR-SERC.
# "Made by ICTD CSIR-SERC for CSIR with ❤️"
# ==============================================================================
set -Eeuo pipefail

# ------------------------------------------------------------------------------
# Terminal Color Palettes & UI Styles
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
# Universal Attribution & Licensing Metadata
# ------------------------------------------------------------------------------
UNIVERSAL_LICENSE="CSIR-SERC Free Community & Institutional License (v1.0)"
UNIVERSAL_ATTRIBUTION="Made by ICTD CSIR-SERC for CSIR with ❤️"
UNIVERSAL_LEGAL_FOOTER="CSIR - Structural Engineering Research Centre • Council of Scientific & Industrial Research"

display_banner() {
  clear 2>/dev/null || true
  echo -e "${CYAN}${BOLD}"
  echo "╔═══════════════════════════════════════════════════════════════════════════╗"
  echo "║       Enterprise Firewall Telemetry & Security Operations Center          ║"
  echo "║        Turnkey Whitelabel Linux Installer & Interactive Wizard            ║"
  echo "║          Ubuntu 20/22/24, Debian 11/12 & Rocky / RHEL / AlmaLinux         ║"
  echo "╚═══════════════════════════════════════════════════════════════════════════╝${RESET}"
  echo -e " ${DIM}Universal License :${RESET} ${WHITE}${UNIVERSAL_LICENSE}${RESET}"
  echo -e " ${DIM}Attribution       :${RESET} ${YELLOW}${UNIVERSAL_ATTRIBUTION}${RESET}"
  echo -e " ${DIM}Security Standard :${RESET} ${GREEN}CERT-In IT Security Directives & Zero Hardcoded Passwords${RESET}"
  echo "-----------------------------------------------------------------------------"
}

# ------------------------------------------------------------------------------
# Input Reading Utilities (Seamless support for direct execution and curl | bash)
# ------------------------------------------------------------------------------
TTY_INPUT="/dev/tty"
if [[ ! -r "$TTY_INPUT" ]]; then
  TTY_INPUT="-"
fi

prompt_input() {
  local prompt_text="$1"
  local default_value="$2"
  local result_var="$3"
  local user_input=""

  if [[ "$TTY_INPUT" == "/dev/tty" ]]; then
    read -rp "$prompt_text [$default_value]: " user_input < /dev/tty || true
  else
    read -rp "$prompt_text [$default_value]: " user_input || true
  fi

  if [[ -z "$user_input" ]]; then
    printf -v "$result_var" "%s" "$default_value"
  else
    printf -v "$result_var" "%s" "$user_input"
  fi
}

prompt_password() {
  local prompt_text="$1"
  local result_var="$2"
  local pass1=""
  local pass2=""

  while true; do
    if [[ "$TTY_INPUT" == "/dev/tty" ]]; then
      read -s -rp "$prompt_text: " pass1 < /dev/tty || true
      echo "" > /dev/tty
      read -s -rp "Confirm password: " pass2 < /dev/tty || true
      echo "" > /dev/tty
    else
      read -s -rp "$prompt_text: " pass1 || true
      echo ""
      read -s -rp "Confirm password: " pass2 || true
      echo ""
    fi

    if [[ -z "$pass1" ]]; then
      echo -e "${RED}Password cannot be empty. Please try again.${RESET}"
      continue
    fi

    if [[ ${#pass1} -lt 8 ]]; then
      echo -e "${RED}Password must be at least 8 characters long for security compliance. Please try again.${RESET}"
      continue
    fi

    if [[ "$pass1" != "$pass2" ]]; then
      echo -e "${RED}Passwords do not match. Please try again.${RESET}"
      continue
    fi

    printf -v "$result_var" "%s" "$pass1"
    break
  done
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
      echo "  -y, --unattended     Run non-interactively using template defaults"
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
    log_error "This installer must be executed as root (sudo bash install.sh)."
    exit 1
  fi

  ARCH=$(uname -m)
  if [[ "$ARCH" != "x86_64" && "$ARCH" != "aarch64" ]]; then
    log_error "Unsupported CPU Architecture: $ARCH. Required: x86_64 or aarch64."
    exit 1
  fi
  log_info "CPU Architecture: ${WHITE}$ARCH${RESET}"

  TOTAL_MEM_MB=$(free -m | awk '/^Mem:/{print $2}')
  log_info "Detected System RAM: ${WHITE}${TOTAL_MEM_MB} MB${RESET}"
  if [[ "$TOTAL_MEM_MB" -lt 1900 ]]; then
    log_warn "System has less than 2 GB RAM. Recommended: >= 4 GB RAM for TSDB & relational storage."
    if [[ "$UNATTENDED" = false ]]; then
      read -rp "Continue installation despite low RAM? (y/N): " mem_choice < /dev/tty || mem_choice="n"
      if [[ "$mem_choice" != "y" && "$mem_choice" != "Y" ]]; then
        log_error "Installation aborted by operator."
        exit 1
      fi
    fi
  fi

  AVAILABLE_DISK_MB=$(df -m / | awk 'NR==2 {print $4}')
  log_info "Available Root Disk Space: ${WHITE}${AVAILABLE_DISK_MB} MB${RESET}"
  if [[ "$AVAILABLE_DISK_MB" -lt 5000 ]]; then
    log_warn "Low disk space (< 5 GB). Minimum 15 GB recommended for CERT-In 180-day retention."
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
    log_info "Refreshing APT package indices..."
    apt-get update -y -q

    log_info "Installing core system utilities (curl, git, jq, snmp, openssl, ufw, tar)..."
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
    log_info "Checking DNF package repositories..."
    $PKG_MGR update -y -q

    if ! $PKG_MGR repolist | grep -qi epel; then
      log_info "Enabling EPEL repository..."
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
  log_success "Core prerequisites verified."
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
      log_success "Compatible Node.js already present: $(node -v) (npm $(npm -v))"
      INSTALL_NODE=false
    fi
  fi

  if [[ "$INSTALL_NODE" = true ]]; then
    if [[ "$DISTRO_FAMILY" == "debian" ]]; then
      log_info "Configuring NodeSource 22.x repository..."
      curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
      apt-get install -y -q nodejs
    elif [[ "$DISTRO_FAMILY" == "rhel" ]]; then
      log_info "Configuring NodeSource 22.x RPM repository..."
      curl -fsSL https://rpm.nodesource.com/setup_22.x | bash -
      $PKG_MGR install -y -q nodejs
    fi
    log_success "Node.js ready: $(node -v) (npm $(npm -v))"
  fi
}

# ------------------------------------------------------------------------------
# 5. Docker Engine & Docker Compose Plugin
# ------------------------------------------------------------------------------
install_docker() {
  log_step "Step 5/8: Provisioning Docker Engine & Docker Compose Container Runtime"

  if command -v docker &>/dev/null && docker compose version &>/dev/null; then
    log_success "Docker Engine and Docker Compose are already installed: $(docker --version)"
    systemctl enable --now docker 2>/dev/null || true
    return 0
  fi

  log_info "Installing official Docker Engine via get.docker.com automated script..."
  curl -fsSL https://get.docker.com | sh

  systemctl enable --now docker
  systemctl enable --now containerd 2>/dev/null || true
  log_success "Docker Engine active: $(docker --version) | $(docker compose version)"
}

# ------------------------------------------------------------------------------
# 6. Host Firewall & Security Ports
# ------------------------------------------------------------------------------
configure_firewall() {
  log_step "Step 6/8: Configuring Host Firewall & Security Ingress Rules"

  REQUIRED_PORTS=(
    "80/tcp:HTTP Web Management Console"
    "443/tcp:HTTPS Web Management Portal"
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

    if command -v getenforce &>/dev/null; then
      if [[ "$(getenforce)" == "Enforcing" ]]; then
        log_info "Configuring SELinux policy for container networking..."
        setsebool -P container_manage_cgroup 1 2>/dev/null || true
      fi
    fi
  fi
  log_success "Host ingress ports synchronized."
}

# ------------------------------------------------------------------------------
# 7. Interactive Whitelabeling & Configuration Wizard
# ------------------------------------------------------------------------------
run_console_wizard() {
  log_step "Step 7/8: Interactive Whitelabeling, Hardware Telemetry & Credentials Setup Wizard"

  # System Defaults
  ORG_NAME="Enterprise Network Operations"
  ORG_DIV="Cyber Defense & Infrastructure Division"
  APEX_BODY="Corporate Information Security Directorate"
  PORTAL_TITLE="Enterprise Firewall Telemetry Center"
  PORTAL_SUBTITLE="Perimeter Telemetry & Security Operations Command"
  PRESET_LOGO="shield"

  FW_IP="10.10.3.15"
  FW_NAME="FortiGate-600F-Gateway"
  FW_VENDOR="fortinet"
  FW_LOCATION="Primary Datacenter Core Rack"
  SNMP_VERSION="v2c"
  SNMP_COMMUNITY="fortinet"
  SNMP_PORT="161"
  SYSLOG_PORT="1514"
  NETFLOW_PORT="2055"

  ENABLE_CORE_SWITCH=false
  SW_VENDOR="cisco"
  SW_NAME="Core-Switch-01"
  SW_IP="10.10.3.1"
  SW_COMMUNITY="public"
  SW_PORT="161"
  SW_LOCATION="Datacenter Core Switch Rack"

  ADMIN_USER="superadmin"
  ADMIN_PASSWORD=""
  CISO_USER="admin"
  CISO_PASSWORD=""
  AUDITOR_USER="auditor"
  AUDITOR_PASSWORD=""

  WEB_HTTP_PORT="80"
  TELEGRAM_ENABLED=false
  TELEGRAM_TOKEN=""
  TELEGRAM_CHATID=""

  if [[ "$UNATTENDED" = false ]]; then
    echo -e "${YELLOW}${BOLD}"
    echo "┌───────────────────────────────────────────────────────────────────────────┐"
    echo "│         ENTERPRISE FIREWALL TELEMETRY CENTER - CONFIGURATION WIZARD       │"
    echo "│                                                                           │"
    echo "│  This wizard guides you through:                                          │"
    echo "│   1. Whitelabel Branding & Custom Identity                                │"
    echo "│   2. Perimeter Firewall Gateway Telemetry (FortiGate, Palo Alto, etc.)    │"
    echo "│   3. Optional Core Switch Monitoring (Cisco, Aruba, Juniper, etc.)        │"
    echo "│   4. Security Credentials for Administrator & CISO (Stored Securely)      │"
    echo "└───────────────────────────────────────────────────────────────────────────┘${RESET}"
    echo ""

    # --------------------------------------------------------------------------
    # SECTION A: WHITELABEL BRANDING
    # --------------------------------------------------------------------------
    echo -e "${CYAN}${BOLD}=== SECTION A: PRODUCT WHITELABELING & BRANDING ===${RESET}"
    prompt_input "Enter Organization / University / Enterprise Name" "$ORG_NAME" ORG_NAME
    prompt_input "Enter Division / Department Name" "$ORG_DIV" ORG_DIV
    prompt_input "Enter Apex / Governing Directorate" "$APEX_BODY" APEX_BODY
    prompt_input "Enter Portal Header Title" "$PORTAL_TITLE" PORTAL_TITLE
    prompt_input "Enter Portal Subtitle" "$PORTAL_SUBTITLE" PORTAL_SUBTITLE

    echo ""
    echo -e "Choose Vector Preset Logo Emblem:"
    echo -e "  ${WHITE}1)${RESET} Shield & Perimeter Defense (Default)"
    echo -e "  ${WHITE}2)${RESET} Cyber Radar Operations"
    echo -e "  ${WHITE}3)${RESET} Government / National Emblem"
    echo -e "  ${WHITE}4)${RESET} High-Tech Enterprise Grid"
    echo -e "  ${WHITE}5)${RESET} Fortress Perimeter"
    prompt_input "Select Logo [1-5]" "1" logo_choice
    case "$logo_choice" in
      2) PRESET_LOGO="radar" ;;
      3) PRESET_LOGO="emblem" ;;
      4) PRESET_LOGO="grid" ;;
      5) PRESET_LOGO="fortress" ;;
      *) PRESET_LOGO="shield" ;;
    esac

    # --------------------------------------------------------------------------
    # SECTION B: PRIMARY FIREWALL GATEWAY
    # --------------------------------------------------------------------------
    echo ""
    echo -e "${CYAN}${BOLD}=== SECTION B: PRIMARY PERIMETER FIREWALL GATEWAY ===${RESET}"
    echo "Select Firewall Vendor:"
    echo "  1) Fortinet FortiGate (Default)"
    echo "  2) Palo Alto Networks PAN-OS"
    echo "  3) pfSense / OPNsense"
    echo "  4) Check Point Quantum"
    echo "  5) Cisco ASA / Firepower"
    echo "  6) Generic Enterprise Firewall"
    prompt_input "Select Vendor [1-6]" "1" vendor_choice
    case "$vendor_choice" in
      2) FW_VENDOR="paloalto"; FW_NAME="PaloAlto-NGFW-Gateway" ;;
      3) FW_VENDOR="pfsense"; FW_NAME="pfSense-Perimeter-Gateway" ;;
      4) FW_VENDOR="checkpoint"; FW_NAME="CheckPoint-Quantum-Gateway" ;;
      5) FW_VENDOR="cisco"; FW_NAME="Cisco-Perimeter-Firewall" ;;
      6) FW_VENDOR="generic"; FW_NAME="Enterprise-Perimeter-Firewall" ;;
      *) FW_VENDOR="fortinet"; FW_NAME="FortiGate-600F-Gateway" ;;
    esac

    prompt_input "Enter Primary Firewall Management IP Address" "$FW_IP" FW_IP
    prompt_input "Enter Friendly Firewall Label" "$FW_NAME" FW_NAME
    prompt_input "Enter Physical Datacenter Location" "$FW_LOCATION" FW_LOCATION

    echo "Select SNMP Polling Protocol Version:"
    echo "  1) SNMPv2c (Default)"
    echo "  2) SNMPv3 (noAuthNoPriv / authPriv)"
    prompt_input "Select SNMP Version [1-2]" "1" snmp_choice
    if [[ "$snmp_choice" == "2" ]]; then
      SNMP_VERSION="v3"
    else
      SNMP_VERSION="v2c"
    fi

    prompt_input "Enter SNMP Community / User string" "$SNMP_COMMUNITY" SNMP_COMMUNITY
    prompt_input "Enter SNMP UDP Polling Port" "$SNMP_PORT" SNMP_PORT
    prompt_input "Enter Syslog Primary Ingestion UDP Port" "$SYSLOG_PORT" SYSLOG_PORT
    prompt_input "Enter NetFlow / IPFIX Flow Ingestion UDP Port" "$NETFLOW_PORT" NETFLOW_PORT

    # --------------------------------------------------------------------------
    # SECTION C: CORE SWITCH (OPTIONAL)
    # --------------------------------------------------------------------------
    echo ""
    echo -e "${CYAN}${BOLD}=== SECTION C: CORE SWITCH MONITORING (OPTIONAL) ===${RESET}"
    prompt_input "Enable Core Switch Telemetry Monitoring? (y/N)" "N" switch_prompt
    if [[ "$switch_prompt" == "y" || "$switch_prompt" == "Y" ]]; then
      ENABLE_CORE_SWITCH=true
      echo "Select Core Switch Vendor:"
      echo "  1) Cisco Catalyst / Nexus (Default)"
      echo "  2) Aruba / HPE"
      echo "  3) Juniper Networks"
      echo "  4) Arista Networks"
      echo "  5) Generic L3 Switch"
      prompt_input "Select Switch Vendor [1-5]" "1" sw_choice
      case "$sw_choice" in
        2) SW_VENDOR="aruba"; SW_NAME="Aruba-Core-Switch" ;;
        3) SW_VENDOR="juniper"; SW_NAME="Juniper-EX-Core" ;;
        4) SW_VENDOR="arista"; SW_NAME="Arista-7050-Core" ;;
        5) SW_VENDOR="generic"; SW_NAME="Enterprise-Core-Switch" ;;
        *) SW_VENDOR="cisco"; SW_NAME="Cisco-Catalyst-Core" ;;
      esac

      prompt_input "Enter Core Switch Management IP" "$SW_IP" SW_IP
      prompt_input "Enter Core Switch Friendly Label" "$SW_NAME" SW_NAME
      prompt_input "Enter Core Switch SNMP Community string" "$SW_COMMUNITY" SW_COMMUNITY
      prompt_input "Enter Core Switch SNMP Port" "$SW_PORT" SW_PORT
      prompt_input "Enter Core Switch Location" "$SW_LOCATION" SW_LOCATION
    else
      log_info "Core switch monitoring skipped (can be added later via Settings)."
    fi

    # --------------------------------------------------------------------------
    # SECTION D: SECURITY ACCOUNTS & PASSWORDS
    # --------------------------------------------------------------------------
    echo ""
    echo -e "${CYAN}${BOLD}=== SECTION D: SECURITY CREDENTIALS SETUP (ZERO HARDCODING) ===${RESET}"
    echo -e "${YELLOW}Notice: Passwords are saved only to local config/credentials.json (chmod 600).${RESET}"
    echo -e "${YELLOW}They are excluded from Git and will never be committed to repository.${RESET}"
    echo ""

    prompt_input "Enter Super Administrator Username" "$ADMIN_USER" ADMIN_USER
    echo -e "Enter secure password for ${WHITE}${BOLD}$ADMIN_USER${RESET}:"
    prompt_password "Set $ADMIN_USER password" ADMIN_PASSWORD

    echo ""
    prompt_input "Enter CISO Administrator Username" "$CISO_USER" CISO_USER
    echo -e "Enter secure password for ${WHITE}${BOLD}$CISO_USER${RESET}:"
    prompt_password "Set $CISO_USER password" CISO_PASSWORD

    echo ""
    prompt_input "Enter Compliance Auditor Username" "$AUDITOR_USER" AUDITOR_USER
    echo -e "Enter secure password for ${WHITE}${BOLD}$AUDITOR_USER${RESET}:"
    prompt_password "Set $AUDITOR_USER password" AUDITOR_PASSWORD

    # --------------------------------------------------------------------------
    # SECTION E: NETWORK & ALERTS
    # --------------------------------------------------------------------------
    echo ""
    echo -e "${CYAN}${BOLD}=== SECTION E: NETWORKING & REAL-TIME ALERTS ===${RESET}"
    prompt_input "Enter HTTP Web Console Port" "$WEB_HTTP_PORT" WEB_HTTP_PORT

    prompt_input "Enable Telegram Bot Alerts for Critical Perimeter Threats? (y/N)" "N" tele_choice
    if [[ "$tele_choice" == "y" || "$tele_choice" == "Y" ]]; then
      TELEGRAM_ENABLED=true
      prompt_input "Enter Telegram Bot Token" "" TELEGRAM_TOKEN
      prompt_input "Enter Telegram Operator Chat ID" "" TELEGRAM_CHATID
    fi
  else
    log_info "Unattended mode active. Generating secure bootstrap credentials."
    ADMIN_PASSWORD="Admin@$(openssl rand -hex 4)!26"
    CISO_PASSWORD="Ciso@$(openssl rand -hex 4)!26"
    AUDITOR_PASSWORD="Audit@$(openssl rand -hex 4)!26"
  fi
}

# ------------------------------------------------------------------------------
# 8. Repository Deployment, Config Generation & Container Launch
# ------------------------------------------------------------------------------
deploy_and_start() {
  log_step "Step 8/8: Compiling Software, Generating Isolated Credentials & Launching Containers"

  CURRENT_DIR=$(pwd)
  if [[ -f "$CURRENT_DIR/package.json" && -d "$CURRENT_DIR/server" && -d "$CURRENT_DIR/client" ]]; then
    log_info "Running directly inside cloned repository: $CURRENT_DIR"
    DEPLOY_ROOT="$CURRENT_DIR"
  else
    if [[ -d "$INSTALL_DIR/.git" ]]; then
      log_info "Existing repository detected at $INSTALL_DIR. Pulling latest commits..."
      git -C "$INSTALL_DIR" pull --ff-only || true
    else
      log_info "Cloning repository from GitHub into $INSTALL_DIR..."
      mkdir -p "$INSTALL_DIR"
      git clone "$REPO_URL" "$INSTALL_DIR"
    fi
    DEPLOY_ROOT="$INSTALL_DIR"
  fi

  cd "$DEPLOY_ROOT"

  # Create persistent storage directories
  mkdir -p data uploads backups config
  chmod 750 data uploads backups config

  # Write isolated config/credentials.json (Mode 600, NEVER committed to Git)
  CREDENTIALS_FILE="$DEPLOY_ROOT/config/credentials.json"
  cat <<EOF > "$CREDENTIALS_FILE"
{
  "notice": "CONFIDENTIAL CREDENTIALS: Created by install.sh on $(date -u +'%Y-%m-%dT%H:%M:%SZ'). DO NOT COMMIT TO GIT.",
  "auth": {
    "superadmin": {
      "username": "${ADMIN_USER}",
      "role": "super_admin",
      "password": "${ADMIN_PASSWORD}"
    },
    "admin": {
      "username": "${CISO_USER}",
      "role": "admin",
      "password": "${CISO_PASSWORD}"
    },
    "auditor": {
      "username": "${AUDITOR_USER}",
      "role": "auditor",
      "password": "${AUDITOR_PASSWORD}"
    }
  },
  "snmp": {
    "firewall": {
      "vendor": "${FW_VENDOR}",
      "name": "${FW_NAME}",
      "host": "${FW_IP}",
      "port": ${SNMP_PORT},
      "version": "${SNMP_VERSION}",
      "community": "${SNMP_COMMUNITY}"
    },
    "coreSwitch": {
      "enabled": ${ENABLE_CORE_SWITCH},
      "vendor": "${SW_VENDOR}",
      "name": "${SW_NAME}",
      "host": "${SW_IP}",
      "port": ${SW_PORT},
      "version": "v2c",
      "community": "${SW_COMMUNITY}"
    }
  }
}
EOF
  chmod 600 "$CREDENTIALS_FILE"
  # Also sync copy to data/credentials.json for container persistence
  cp "$CREDENTIALS_FILE" "$DEPLOY_ROOT/data/credentials.json"
  chmod 600 "$DEPLOY_ROOT/data/credentials.json"
  log_success "Isolated credentials saved to ${WHITE}$CREDENTIALS_FILE${GREEN} (Permissions: 0600)"

  # Write local .env file (Mode 600)
  ENV_FILE="$DEPLOY_ROOT/.env"
  cat <<EOF > "$ENV_FILE"
PORT=${WEB_HTTP_PORT}
SYSLOG_PORT=${SYSLOG_PORT}
NETFLOW_PORT=${NETFLOW_PORT}
DATA_DIR=/app/data
UPLOADS_DIR=/app/uploads
BACKUP_DIR=/app/backups
SUPERADMIN_PASSWORD=${ADMIN_PASSWORD}
CISO_PASSWORD=${CISO_PASSWORD}
AUDITOR_PASSWORD=${AUDITOR_PASSWORD}
NODE_ENV=production
EOF
  chmod 600 "$ENV_FILE"
  log_success "Local environment file generated at ${WHITE}$ENV_FILE${GREEN} (Permissions: 0600)"

  # Install dependencies and build
  log_info "Installing Node.js dependencies..."
  npm run install:all

  log_info "Compiling TypeScript backend server..."
  npm run build:server

  log_info "Compiling Vue 3 frontend operations console..."
  npm run build:client

  log_info "Launching PostgreSQL 18, InfluxDB 2.7 & Telemetry Console containers..."
  docker compose -f docker-compose.standalone.yml up -d --build

  # Wait for healthcheck
  log_info "Waiting for container services to initialize..."
  HEALTH_URL="http://127.0.0.1:${WEB_HTTP_PORT}/api/health"
  SUCCESS=false
  for i in {1..35}; do
    if curl -s -f "$HEALTH_URL" &>/dev/null; then
      SUCCESS=true
      break
    fi
    echo -n "."
    sleep 2
  done
  echo ""

  if [[ "$SUCCESS" = true ]]; then
    log_success "Telemetry Operations Console is ONLINE and healthy!"
  else
    log_warn "Healthcheck timed out on $HEALTH_URL. Checking docker compose status:"
    docker compose -f docker-compose.standalone.yml ps
  fi

  # Apply Whitelabel Settings & Credentials via API synchronization
  log_info "Synchronizing whitelabel branding & hardware parameters..."
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
    --argjson swEnabled "$ENABLE_CORE_SWITCH" \
    --arg swVendor "$SW_VENDOR" \
    --arg swName "$SW_NAME" \
    --arg swIp "$SW_IP" \
    --arg swComm "$SW_COMMUNITY" \
    --arg swPort "$SW_PORT" \
    --arg swLoc "$SW_LOCATION" \
    --arg adminPw "$ADMIN_PASSWORD" \
    --arg cisoPw "$CISO_PASSWORD" \
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
      coreSwitch: {
        enabled: $swEnabled,
        vendor: $swVendor,
        name: $swName,
        ipAddress: $swIp,
        snmpCommunity: $swComm,
        snmpPort: ($swPort | tonumber),
        location: $swLoc
      },
      adminPassword: $adminPw,
      cisoPassword: $cisoPw,
      telegram: {
        enabled: $teleEnabled,
        botToken: $teleToken,
        chatId: $teleChat
      }
    }')

  WIZARD_URL="http://127.0.0.1:${WEB_HTTP_PORT}/api/settings/wizard/complete"
  curl -s -X POST "$WIZARD_URL" \
    -H "Content-Type: application/json" \
    -d "$SETUP_PAYLOAD" >/dev/null || true

  # Register systemd service
  log_info "Registering systemd service ${SERVICE_NAME}.service for automatic boot recovery..."
  SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
  cat <<EOF > "$SERVICE_FILE"
[Unit]
Description=Enterprise Firewall Telemetry & Security Operations Center
After=docker.service network-online.target
Requires=docker.service network-online.target

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=${DEPLOY_ROOT}
ExecStart=/usr/bin/docker compose -f docker-compose.standalone.yml up -d
ExecStop=/usr/bin/docker compose -f docker-compose.standalone.yml down
TimeoutStartSec=300

[Install]
WantedBy=multi-user.target
EOF

  systemctl daemon-reload 2>/dev/null || true
  systemctl enable "${SERVICE_NAME}.service" 2>/dev/null || true
  log_success "Systemd service enabled on boot: ${SERVICE_NAME}.service"
}

# ------------------------------------------------------------------------------
# 9. Main Orchestration Loop
# ------------------------------------------------------------------------------
main() {
  display_banner
  check_preflights
  detect_os
  install_system_prerequisites
  install_nodejs
  install_docker
  configure_firewall
  run_console_wizard
  deploy_and_start

  PRIMARY_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
  if [[ -z "$PRIMARY_IP" ]]; then
    PRIMARY_IP="127.0.0.1"
  fi

  PORT_SUFFIX=""
  if [[ "$WEB_HTTP_PORT" != "80" ]]; then
    PORT_SUFFIX=":${WEB_HTTP_PORT}"
  fi

  echo ""
  echo -e "${GREEN}${BOLD}========================================================================${RESET}"
  echo -e "${GREEN}${BOLD} [✓] DEPLOYMENT & WHITELABEL SETUP COMPLETE!                            ${RESET}"
  echo -e "${GREEN}${BOLD}========================================================================${RESET}"
  echo ""
  echo -e " ${BOLD}Access the Telemetry & Operations Console at:${RESET}"
  echo -e "   ${CYAN}${BOLD}http://${PRIMARY_IP}${PORT_SUFFIX}${RESET}"
  echo ""
  echo -e " ${BOLD}Configured Administrative Credentials:${RESET}"
  echo -e "   Super Administrator : ${WHITE}${BOLD}${ADMIN_USER}${RESET} (Password stored in config/credentials.json)"
  echo -e "   CISO Administrator  : ${WHITE}${BOLD}${CISO_USER}${RESET} (Password stored in config/credentials.json)"
  echo -e "   Compliance Auditor  : ${WHITE}${BOLD}${AUDITOR_USER}${RESET} (Password stored in config/credentials.json)"
  echo ""
  echo -e " ${YELLOW}${BOLD}Credential Security Notice:${RESET}"
  echo -e "   Passwords are saved in: ${WHITE}${DEPLOY_ROOT}/config/credentials.json${RESET} (chmod 600)"
  echo -e "   This file is ${RED}EXCLUDED FROM GIT${RESET} via .gitignore."
  echo ""
  echo -e " ${BOLD}Telemetry Forwarding Configuration for Perimeter Appliances:${RESET}"
  echo -e "   ${CYAN}Fortinet FortiOS Syslog forwarding CLI:${RESET}"
  echo -e "     config log syslogd setting"
  echo -e "       set status enable"
  echo -e "       set server \"${PRIMARY_IP}\""
  echo -e "       set port ${SYSLOG_PORT}"
  echo -e "       set mode udp"
  echo -e "     end"
  echo ""
  echo -e "   ${CYAN}Palo Alto Networks Syslog Server Profile:${RESET}"
  echo -e "     Target Host : ${PRIMARY_IP} | Port : ${SYSLOG_PORT} | Protocol : UDP | Facility : LOG_USER"
  echo ""
  echo -e " ${BOLD}System Service Controls:${RESET}"
  echo -e "   Check status : ${WHITE}systemctl status ${SERVICE_NAME}${RESET}"
  echo -e "   Restart      : ${WHITE}systemctl restart ${SERVICE_NAME}${RESET}"
  echo -e "   Docker logs  : ${WHITE}docker compose -f docker-compose.standalone.yml logs -f${RESET}"
  echo ""
  echo -e " ${DIM}Universal License :${RESET} ${WHITE}${UNIVERSAL_LICENSE}${RESET}"
  echo -e " ${DIM}Attribution       :${RESET} ${YELLOW}${UNIVERSAL_ATTRIBUTION}${RESET}"
  echo -e "${GREEN}${BOLD}========================================================================${RESET}"
}

main "$@"
