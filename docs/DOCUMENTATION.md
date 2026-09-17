# Enterprise Firewall Telemetry & Security Operations Center
## Comprehensive Technical Manual & Operational Guide

```
Document Reference : CSIR-SERC/ICTD/EFTC/2026/DOC-01
Classification     : Official Institutional & Technical Release
Version            : 1.0.0 (PostgreSQL 18 & Parallel SNMP Edition)
Issuing Authority  : Information and Communication Technology Division (ICTD)
Organization       : CSIR - Structural Engineering Research Centre (CSIR-SERC)
Council            : Council of Scientific and Industrial Research (CSIR)
Ministry           : Ministry of Science & Technology, Government of India
Date               : September 2026
```

---

## Table of Contents

1. [Introduction & Purpose](#1-introduction--purpose)
2. [System Architecture & Ingestion Pipeline](#2-system-architecture--ingestion-pipeline)
3. [Network Topology & Port ACL Requirements](#3-network-topology--port-acl-requirements)
4. [Virtual Machine (VM) Appliance & Deployment Guide](#4-virtual-machine-vm-appliance--deployment-guide)
5. [First-Time Setup Wizard & Branding Engine](#5-first-time-setup-wizard--branding-engine)
6. [Live FortiGate SNMP Telemetry Engine](#6-live-fortigate-snmp-telemetry-engine)
7. [Bento-Style Traffic & Flow Analytics (App-ID)](#7-bento-style-traffic--flow-analytics-app-id)
8. [Policy Governance & Shadow Conflict Detection](#8-policy-governance--shadow-conflict-detection)
9. [Live Syslog Stream & CERT-In Compliance Audit](#9-live-syslog-stream--cert-in-compliance-audit)
10. [User Management & Telegram Notification Dispatcher](#10-user-management--telegram-notification-dispatcher)
11. [PostgreSQL 18 Database Schema & Backup Automation](#11-postgresql-18-database-schema--backup-automation)
12. [Operations, Health Diagnostics & Troubleshooting](#12-operations-health-diagnostics--troubleshooting)
13. [CSIR-SERC Free Community & Institutional License (v1.0)](#13-csir-serc-free-community--institutional-license-v10)

---

## 1. Introduction & Purpose

Modern enterprise and governmental institutions rely on high-capacity perimeter Next-Generation Firewalls (NGFW) to defend against sophisticated cyber threats, enforce segmentation policies, and support thousands of researchers and high-performance computing (HPC) nodes. However, native appliance dashboards are often vendor-locked, resource-constrained, and insufficient for multi-departmental network visibility or compliance auditing.

The **Enterprise Firewall Telemetry & Security Operations Center** was engineered by the **Information and Communication Technology Division (ICTD)** at **CSIR-SERC** to solve these challenges. The platform provides:

- **Ultra-Fast Parallel SNMP Polling**: Directly queries FortiGate appliances in <200ms across MIB-II, IF-MIB, and FortiOS enterprise sensor trees.
- **Deep Application Visibility (App-ID)**: Bento-grid analytics identifying top uploaders, downloaders, system hostnames, and protocols in real time.
- **Regulatory Alignment**: Automated continuous verification against **CERT-In (Section 70B)** 180-day log mandates and Stratum-1 Indian Standard Time (IST) synchronization.
- **Turnkey Virtual Appliance Readiness**: Easily shared as a self-contained Virtual Machine (OVA/VMDK) with first-time onboarding wizard and dynamic institutional branding.

---

## 2. System Architecture & Ingestion Pipeline

The platform uses a containerized multi-tier microservices architecture designed for deployment on bare-metal hypervisors (Proxmox, VMware ESXi, KVM/QEMU) or Linux Docker hosts.

### Data Ingestion Pipeline

1. **SNMP Poller (`server/src/collectors/snmp.collector.ts`)**:
   - Executes parallel non-blocking SNMPv2c/v3 subtree walks over UDP port 161.
   - Calculates 64-bit High-Capacity (HC) octet deltas for accurate throughput (`bps`) and packet rate (`pps`) counters without wrapping errors.
   - Polls hardware environmental sensors (thermal zones, cooling fans, and dual AC power supplies).
   - Extracts FortiOS UTM threat counters (viruses, IPS intrusions, botnet blocks) and firewall policy accounting counters.

2. **UDP Syslog Ingester (`server/src/collectors/syslog.collector.ts`)**:
   - Binds to UDP port 1514 (and 514) to ingest high-velocity hardware event logs.
   - Parses RFC 5424 / RFC 3164 formats, normalizing FortiOS key-value pairs, Check Point log headers, and Palo Alto CSV structures into standard JSON event streams.

3. **NetFlow / IPFIX Binary Parser (`server/src/collectors/flow.collector.ts`)**:
   - Ingests NetFlow v5, v9, and IPFIX binary datagrams on UDP port 2055 with zero-copy buffer views.
   - Correlates layer-4 flow tuples into high-level App-ID categorizations.

4. **PostgreSQL 18 Persistence Engine (`server/src/storage/db.ts`)**:
   - Connects to an enterprise-grade `postgres:18-alpine` container (`10.40.0.151:5432`).
   - Normalizes time-series telemetry, device metadata, audit logs, and configuration snapshots into structured relational tables.

5. **Real-Time WebSocket Broadcaster (`server/src/api/websocket.ts`)**:
   - Streams live flow metrics, hardware telemetry pulses, and active alarms directly to connected browser clients over persistent WebSockets.

---

## 3. Network Topology & Port ACL Requirements

For successful telemetry collection, network administrators must configure appropriate access control lists (ACLs) between the telemetry appliance and the monitored perimeter firewall.

### Port Matrix

| Port Number | Protocol | Direction | Source | Destination | Function |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **80 / 443** | TCP | Inbound | Web Operators | Telemetry Appliance | Web GUI & REST API |
| **161** | UDP | Outbound | Telemetry Appliance | Perimeter Gateway | SNMP Queries |
| **1514 / 514**| UDP | Inbound | Perimeter Gateway | Telemetry Appliance | Syslog Log Forwarding |
| **2055** | UDP | Inbound | Perimeter Gateway | Telemetry Appliance | NetFlow / IPFIX Flows |
| **5432** | TCP | Internal | Web Container | PostgreSQL Container| Database Engine Sync |
| **123** | UDP | Outbound | Telemetry Appliance | NTP Stratum-1 Server| Time Synchronization |

### FortiGate SNMP Configuration Example (CLI)
```fortios
config system snmp sysinfo
    set status enable
    set description "CSIR-SERC Perimeter Firewall"
    set location "CSIR-SERC Data Center, Chennai"
end

config system snmp community
    edit 1
        set name "fortinet"
        config hosts
            edit 1
                set ip 10.40.0.150 255.255.255.255
            next
        end
        set query-v1-status disable
        set query-v2c-status enable
        set status enable
    next
end
```

---

## 4. Virtual Machine (VM) Appliance & Deployment Guide

The platform is designed to be distributed as a single-package Virtual Machine (OVA / VMDK / QCOW2) or deployed using Docker Compose.

### Resource Sizing Guidelines

| Deployment Tier | Monitored Appliances | CPU Cores | RAM | Storage | Ingest Capacity |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Small / Branch** | 1 - 2 Gateways | 2 vCPUs | 4 GB | 50 GB SSD | Up to 1,000 logs/sec |
| **Enterprise Core**| 3 - 5 Gateways | 4 vCPUs | 8 GB | 200 GB SSD| Up to 10,000 logs/sec |
| **HPC / Datacenter**| 6+ Gateways | 8 vCPUs | 16 GB | 500 GB NVMe| 25,000+ logs/sec |

### Quick Deployment via Docker Compose

```bash
# 1. Clone repository
git clone https://github.com/ananthkrishnangv/Enterprise-Firewall-Telemetry-Centre.git
cd Enterprise-Firewall-Telemetry-Centre

# 2. Review and start the stack
docker compose up -d --build

# 3. Inspect container status
docker compose ps
```

---

## 5. First-Time Setup Wizard & Branding Engine

When deploying a fresh appliance, the system detects if the setup flag is uninitialized and automatically launches the **First-Time Setup Wizard (`/wizard`)**:

1. **Step 1: Institutional Branding**:
   - Specify Organization Name (e.g. `CSIR-SERC (Chennai)`), Division Name (`ICT & Network Security Division`), and Apex Body (`Council of Scientific & Industrial Research`).
   - Upload custom high-resolution organization logo (PNG/SVG, up to 5MB) or select from built-in UX4G vector emblems (`cyber`, `globe`, `emblem`, `shield`).
2. **Step 2: Perimeter Gateway SNMP Configuration**:
   - Define the primary firewall target IP (default: `10.10.3.15`), SNMP version (`v2c`), port (`161`), and community string (`fortinet`).
3. **Step 3: Syslog & Telemetry Ports**:
   - Specify UDP listening ports for hardware syslog (`1514`) and NetFlow (`2055`).
4. **Step 4: Super Administrator Account**:
   - Configure credentials for the default protected `superadmin` account.

Once finalized, the settings are committed to PostgreSQL 18 and file storage, unlocking the full operational dashboard.

---

## 6. Live FortiGate SNMP Telemetry Engine

The SNMP module queries the live FortiGate gateway (`10.10.3.15`) using non-blocking subtree walks:

### Polled MIB Tables & OID Structure

| Subsystem | MIB / OID | Metrics Collected |
| :--- | :--- | :--- |
| **System Info** | `SNMPv2-MIB::system` (`1.3.6.1.2.1.1`) | `sysUpTime`, `sysName`, `sysDescr`, `sysContact` |
| **64-bit Interfaces**| `IF-MIB::ifXTable` (`1.3.6.1.2.1.31.1.1`) | `ifName`, `ifAlias`, `ifHCInOctets`, `ifHCOutOctets`, `ifOperStatus` |
| **TCP Protocol** | `TCP-MIB` (`1.3.6.1.2.1.6`) | `tcpCurrEstab`, `tcpInSegs`, `tcpOutSegs`, `tcpRetransSegs` |
| **UDP Protocol** | `UDP-MIB` (`1.3.6.1.2.1.7`) | `udpInDatagrams`, `udpOutDatagrams`, `udpNoPorts`, `udpInErrors` |
| **Hardware Sensors**| `FORTINET-FORTIGATE-MIB::fgHwSensors` | Thermal zones (TD1, TD2, TR3), Fan RPMs, Dual AC PSUs |
| **UTM Threats** | `FORTINET-FORTIGATE-MIB::fgThreat` | Antivirus neutralized, IPS exploits blocked, Botnets intercepted |
| **Policy Stats** | `FORTINET-FORTIGATE-MIB::fgFwPolStats` | 64-bit byte counters and packet counts per security rule |

### Rate Calculation Methodology
To calculate instantaneous throughput without wrapping errors:
$$\text{inBps} = \frac{(\text{ifHCInOctets}_{t_2} - \text{ifHCInOctets}_{t_1}) \times 8}{t_2 - t_1}$$
$$\text{outBps} = \frac{(\text{ifHCOutOctets}_{t_2} - \text{ifHCOutOctets}_{t_1}) \times 8}{t_2 - t_1}$$

---

## 7. Bento-Style Traffic & Flow Analytics (App-ID)

The Bento Traffic Analyzer decomposes raw network streams into an intuitive, modular layout:
- **Application Mapping**: Detects deep packet signatures (HTTPS, SSH, DNS, BitTorrent, Telegram, Zoom, Microsoft Teams).
- **Top Uploaders & Top Downloaders**: Displays client IP addresses, resolved domain names/hostnames, protocol App-IDs, transferred bytes, and throughput speeds.
- **Bi-Directional Speedometer Dials**: Instantaneous inbound and outbound WAN bandwidth with peak traffic markers.
- **Hands-Free Auto-Refresh**: Configurable intervals (5s, 10s, 30s, 60s) with state persisted across browser sessions.

---

## 8. Policy Governance & Shadow Conflict Detection

Firewall access control lists (ACLs) frequently develop dead rules and shadowing over years of operational changes. The platform implements an **Interval Tree Conflict Engine**:
- **Shadowed Rules**: Detects rules positioned below broader rules that match identical or superset criteria, rendering the lower rule unreachable.
- **Redundant Rules**: Flags rules performing duplicate actions for identical traffic zones.
- **Any/Any Rules**: Highlights overly permissive configurations (`0.0.0.0/0 -> 0.0.0.0/0 Any`) representing security risks.
- **Stale Rules**: Tracks rule hit counters to identify inactive rules for decommissioning.

---

## 9. Live Syslog Stream & CERT-In Compliance Audit

### High-Velocity Syslog Console
The Live Logs console streams firewall hardware events in real time:
- Substring and regex search across source/destination IPs, ports, and action tags.
- Severity-coded pill indicators (`Emergency`, `Alert`, `Critical`, `Error`, `Warning`, `Notice`, `Info`).
- Buffer freeze button for deep packet inspection during high-velocity incidents.
- Direct CSV and JSON log export.

### CERT-In Compliance Checklist
Automated verification against **CERT-In Section 70B Directives**:
- **Control CIR-LOG-01**: Verifies 180-day secure rolling log retention.
- **Control CIR-NTP-01**: Validates synchronization against National Physical Laboratory (NPL) or National Informatics Centre (NIC) Stratum-1 time servers.
- **Control CIR-ACC-01**: Audits multi-factor and role-based operator authentication.
- **Control CIR-SEG-01**: Validates demilitarized zone (DMZ) and inter-VLAN isolation.

---

## 10. User Management & Telegram Notification Dispatcher

The platform enforces strict Role-Based Access Control (RBAC):
- **Super Administrator (`super_admin`)**: Unrestricted operational, branding, user creation, and backup control. Protected against deletion.
- **Security Administrator (`admin`)**: Manages alerts, speed tests, and firewall targets.
- **Compliance Auditor (`auditor`)**: Read-only access to compliance reports, drift audits, and logs.
- **Operator (`operator`)**: Dashboard and traffic flow monitoring access.

### Telegram Notification Integration
Operators can configure Telegram Bot alerts:
1. Enter Bot Token and Chat ID.
2. Enable instant triggers for:
   - Perimeter link flapping (`ifOperStatus == down`)
   - CPU / Memory utilization thresholds exceeding 85%
   - UTM virus or botnet command-and-control detection
   - Configuration drift and unapproved policy modifications

---

## 11. PostgreSQL 18 Database Schema & Backup Automation

The platform utilizes a dedicated **PostgreSQL 18** container (`postgres:18-alpine`):

### Core Database Tables
- `firewalls`: Gateway inventory, models, IP addresses, SNMP credentials.
- `telemetry_history`: Time-series interface throughput, CPU, RAM, connection states.
- `snmp_sensor_logs`: Environmental temperatures, fan tachometer readings, power supply metrics.
- `syslog_records`: Indexed syslog events with full-text search capabilities.
- `system_users`: Bcrypt-hashed operator credentials, roles, Telegram configurations.
- `system_settings`: Organization branding, custom logo base64 data, portal labels.
- `backup_jobs`: Audit history of automated database dumps.

### Automated Backups
- Scheduled daily at midnight (Kolkata IST) with configurable retention.
- Instant manual backup trigger from the UI or via `POST /api/backup/trigger`.
- Storage Modal provides real-time visibility into disk usage across `/app/data`, `/app/uploads`, and `/app/backups`.

---

## 12. Operations, Health Diagnostics & Troubleshooting

### Common Health Checks
```bash
# 1. Verify container runtime
docker compose ps

# 2. Check live SNMP polling from the console container
docker compose exec firewall-monitoring snmpwalk -v2c -c fortinet 10.10.3.15:161 1.3.6.1.2.1.1.1.0

# 3. Test PostgreSQL 18 connectivity
docker compose exec firewall-monitoring-db psql -U telemetry_admin -d firewall_telemetry -c "\dt"

# 4. Trigger on-demand speed test
curl -X POST http://10.40.0.150/api/speedtest/run
```

---

## 13. CSIR-SERC Free Community & Institutional License (v1.0)

Copyright © 2024–2026 CSIR - Structural Engineering Research Centre (CSIR-SERC), Council of Scientific and Industrial Research (CSIR), Ministry of Science & Technology, Government of India. All Rights Reserved.

**Developed by**: Information and Communication Technology Division (ICTD), CSIR-SERC, Chennai, India.

- **Universal Free & Community Edition**: Free for operational use within all Indian public institutions, autonomous research bodies, government agencies, and educational institutions.
- **Source Code Ownership**: All title, copyright, intellectual property, architecture, and algorithms remain exclusively with CSIR-SERC.
- **Anti-Commercial Restrictions**: Commercial resale, paid rebranding, or proprietary closed-source distribution is strictly prohibited.
- **Mandatory Attribution**: The institutional footer badge (*"Made by ICTD CSIR-SERC for CSIR with ❤️"*) must be retained across all deployments.
