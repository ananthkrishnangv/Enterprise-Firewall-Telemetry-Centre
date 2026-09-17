# Standalone Virtual Machine Appliance Deployment Guide
## Enterprise Firewall Telemetry & Security Operations Platform

### 1. Overview
This distribution packages the full Enterprise Firewall Monitoring Console into a standalone, portable appliance. It can be imported or installed onto any Linux Virtual Machine (Ubuntu 22.04/24.04, Debian 12, Rocky Linux, or Alpine) on VMware ESXi, Proxmox VE, Hyper-V, or Nutanix.

---

### 2. Quick 3-Step Setup
1. **Import / Spin up a Linux VM** and assign it an IP address (e.g. `10.40.0.150` or DHCP).
2. **Run Installer**:
   ```bash
   chmod +x install.sh
   sudo ./install.sh
   ```
3. **Open Browser**:
   Navigate to `http://<VM_IP_ADDRESS>`.
   - On the initial boot, the **First-Time Configuration Wizard** (`/wizard`) opens automatically.
   - Set Organization Name, Apex Body, Custom Logo (or preset), Primary Firewall SNMP credentials, and Superadmin Passkey.
   - Click "Launch Enterprise Command Center".

---

### 3. Ports & Telemetry Ingestion Architecture
| Service | Protocol | Port | Description |
| :--- | :--- | :--- | :--- |
| **Web Console & API** | TCP | `80` | UX4G Violet Glassmorphic Portal & REST API |
| **Syslog Listener** | UDP | `1514` & `514` | High-throughput hardware syslog ingestion |
| **NetFlow Collector** | UDP | `2055` | NetFlow v5/v9 & IPFIX packet traffic flows |
| **SNMP Diagnostic Probes** | UDP | `161` | Outbound probes to firewall target |

---

### 4. Over-The-Air (OTA) Updates & Data Preservation
All persistent runtime state is strictly isolated inside the volume:
```
/opt/firewall-appliance/data/
├── settings.json       # Institutional branding, alert triggers, SMTP & Telegram
├── devices.json        # Configured firewalls & live SNMP profiles
├── users.json          # User credentials & RBAC authorization
└── backups/            # Disaster recovery snapshots
```

**OTA Guarantee**: Upgrading the application container image or pulling code hotfixes preserves `/opt/firewall-appliance/data/`. Historical telemetry, branding, and passwords are never disturbed.

---

### 5. Disaster Recovery & Backups
- **Export Backup**: Navigate to **Settings > Appliance & OTA Updates > Download Appliance Backup**.
- **Restore**: Upload the JSON snapshot file through the web interface or place in `/opt/firewall-appliance/data/`.
