# Enterprise Firewall Telemetry & Security Operations Center

[![Vue 3.5](https://img.shields.io/badge/Vue-3.5-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-24-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18_Alpine-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![InfluxDB](https://img.shields.io/badge/InfluxDB-2.7_TSDB-22ADF6?style=for-the-badge&logo=influxdata&logoColor=white)](https://www.influxdata.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![CERT-In Compliant](https://img.shields.io/badge/CERT--In-Section_70B_Baseline-FF9933?style=for-the-badge)](https://www.cert-in.org.in/)
[![License: CSIR-SERC](https://img.shields.io/badge/License-CSIR--SERC_Community_v1.0-8A2BE2?style=for-the-badge)](#licensing-structure)

> **Developed by the Information and Communication Technology Division (ICTD)**  
> **CSIR - Structural Engineering Research Centre (CSIR-SERC)**  
> *Council of Scientific and Industrial Research, Ministry of Science & Technology, Government of India*

---

## Executive Summary

The **Enterprise Firewall Telemetry & Security Operations Center** is an on-premises, single-host security observability, flow analysis, and policy audit platform designed for mission-critical enterprise and government networks. 

Engineered from the ground up for high-throughput perimeter firewalls (specifically **Fortinet FortiGate** along with support for **Check Point**, **Palo Alto Networks**, and **pfSense**), the system aggregates hardware telemetry, sub-second interface metrics, binary NetFlow/IPFIX records, high-velocity syslogs, and canonical security policies into a unified, responsive operations center conforming to **UX4G** design standards.

The application is architected as an **all-in-one Virtual Appliance (VM)** featuring a guided first-time setup wizard, customizable organization branding and logos, role-based access control with superadmin safeguards, high-velocity **InfluxDB 2.7 Time-Series** log ingestion, automated **PostgreSQL 18** telemetry persistence, and over-the-air (OTA) update readiness.

---

## Visual Tour & Core Capabilities

### 1. First-Time Setup Wizard (Virtual Appliance Ready)
Upon importing the Virtual Machine (OVA/VMDK) and browsing to its IP address, operators are greeted with a frictionless 4-step first-time deployment wizard to configure organization branding, custom logo, SNMP polling targets, syslog ports, and super administrator credentials.

![First-Time Setup Wizard](docs/screenshots/02_wizard.png)

---

### 2. Executive Telemetry Dashboard
Continuous real-time visualization of perimeter throughput, live incoming and outgoing bandwidth gauges with peak ingest tracking, operational alerts, and automated 15-minute speed test countdowns. Features hands-free auto-refreshing (5s, 10s, 30s, 60s) with live pulse indicators.

![Executive Telemetry Dashboard](docs/screenshots/03_dashboard.png)

---

### 3. Bento-Style Traffic & Flow Analyzer (Exact Source & Destination IP Intelligence)
A Bento-grid traffic analytics dashboard providing bidirectional packet intelligence with exact firewall source and destination details:
- **Exact Source & Destination IP Attribution**:
  - **Top Outbound Uploads (Egress)**: Granular tracking of internal campus workstations (`10.x.x.x`, resolved institutional hostname, department, and VLAN) connecting to exact remote internet targets (public IP, external domain, country flag, and destination port).
  - **Top Inbound Downloads (Ingress)**: Tracking external remote source origins (public IP, remote host/domain, country flag) delivering data into exact internal recipient workstations (internal IP, system hostname, department, and VLAN).
- **Application Identification (App-ID)**: Real-time Layer-7 mapping of network protocols and software applications (HTTPS, SSH, DNS, Git Replication, HPC Modeling, Postgre-DB, Microsoft 365).
- **Bidirectional Ingress vs. Egress Ratio**: Segmented proportional bar gauge comparing total downloaded vs. uploaded volume.

![Bento Traffic Analyzer](docs/screenshots/04_bento_traffic.png)

---

### 4. Unapproved Applications & Illicit Network Activity Monitor
A dedicated cybersecurity investigation center identifying internal campus workstations generating or accessing unauthorized, peer-to-peer, or illegal network services:
- **Comprehensive Threat Categories**:
  - **BitTorrent & P2P Swarms**: `BitTorrent-P2P`, `uTorrent-Client`, DHT swarms, tracker announces on ports 6881–6889.
  - **Download Managers & Leechers**: `Internet-Download-Manager [IDM]`, `MegaDownloader`, multi-stream leechers pulling high volumes from cyberlockers.
  - **Movie Streaming & Downloads**: Pirated streaming portals (`123Movies-Streaming`, `Popcorn-Time-Streaming`, `Fmovies`) and HD torrent release sources (`YTS-Torrent-Movie-HD`).
  - **Unofficial Media & Gaming**: Unauthorized IPTV live feeds (`Unofficial-IPTV-Stream`), game client downloads (`Steam-Gaming-Download`), and unapproved media bots (`Discord-Voice-Media`).
  - **Spam, Botnets & C2 Beacons**: Botnet command-and-control beacons (`Mirai-Botnet-C2`), anonymous relays (`Tor-Darknet-Relay`), trojan C2s (`DarkComet-Trojan-C2`), and bulk spam SMTP engines.
  - **Cryptocurrency Mining Pools**: Monero XMR miners (`Monero-XMR-Mining`), Stratum mining protocol connections (`Stratum-Pool`), and Nanopool connections.
  - **Illegal Web & Proxy Bypass**: Circumvention VPNs (`Psiphon-VPN-Circumvention`) and darknet gateway proxies.
- **Top Offending Workstations Bento Cards**: High-visibility ranking cards pinpointing the top internal offender IPs, hostnames, assigned departments, violation counts, and wasted bandwidth.
- **Live Forensic Incident Register**: Structured table matching offending internal devices to unapproved external endpoints, showing applied FortiGate security policies (`SERC_IPS_Threat_Mitigation`, `SERC_P2P_Drop`), dropped status, and data volume.
- **Device Forensic Dossier & FortiOS Quarantine CLI**: Click any internal device to open a complete forensic history and copy ready-to-run FortiOS CLI commands to quarantine or isolate the workstation on FortiGate.
- **CERT-In Incident CSV Export**: One-click export of filtered incident logs for audit and compliance reporting.

![Unapproved Applications Monitor](docs/screenshots/04b_unapproved_apps.png)
![Live Forensic Incident Register](docs/screenshots/04c_unapproved_violations_table.png)
![Device Forensic Dossier & Quarantine](docs/screenshots/04d_device_forensic_dossier.png)

---

### 5. Comprehensive FortiGate SNMP Telemetry Center
A dedicated hardware, environmental, and security monitoring cockpit powered by an ultra-fast (<200ms) parallel SNMPv2c/v3 engine:
- **Core Resource Gauges**: CPU core utilization, physical memory usage (16.3 GB pool), concurrent state sessions (3,200+ active), and active VPN tunnels.
- **Hardware Environmental & Dual Redundant Power**:
  - Internal thermal zones: CPU DTS0 (46°C), Board Center TD1 (36°C), Chassis Exhaust TD2 (44°C), NP6 Accelerator TR3 (40°C).
  - High-speed cooling fan array tachometers (Fan 1 & 2 at 6,400 RPM, Fan 4 at 5,200 RPM).
  - Dual Redundant AC Power Supplies (228V/230V AC inputs, load wattages, PSU internal fans).
- **Multi-Protocol Telemetry**: Live TCP connection state & retransmission rates (0.30% healthy), UDP datagram distribution, ICMP metrics, and unicast/multicast/broadcast breakdown.
- **FortiOS UTM Threat Counters**: Real-time counter of neutralized malware, IPS exploit blocks, and botnet C2 connection interceptions.
- **FortiOS Policy Traffic Accounting**: High-capacity 64-bit counter tracking top security rules by data volume (WAN routing, datacenter inter-VLAN, NAT).
- **All 46+ Physical Ports & Departmental VLANs**: Searchable, tabbed inventory (`ALL`, `PHYSICAL`, `VLAN`, `VPN`) with live 64-bit HC octet rates, packet rates, MTU, operational status, and duplex modes.

![Live FortiGate SNMP Telemetry Center](docs/screenshots/05_snmp_telemetry_center.png)

---

### 6. Policy Rules & Shadow Conflict Engine
Canonical Rule Abstract Syntax Tree (AST) engine that parses and models multi-vendor firewall policies. Includes a multi-dimensional interval tree conflict engine that detects **Shadowed Rules**, **Redundant Rules**, **Over-Permissive Any/Any Rules**, and **Stale Rules**.

![Policy Rules & Security Profiles](docs/screenshots/06_firewall_policies.png)

---

### 7. Full-Spectrum Firewall Traffic & Log Analyzer (InfluxDB 2.7 TSDB Engine)
A high-velocity time-series traffic intelligence and log analyzer monitoring all traffic passing through the institutional firewall across all 46+ interfaces, departmental VLANs, HPC clusters, and external WAN:
- **InfluxDB 2.7 Time-Series Ingestion**: High-throughput non-blocking line-protocol batch pipeline with CERT-In mandated 180-day retention bucket and microsecond query latency.
- **Multi-Parameter Filtering**: Instantly isolate traffic by Time Range (15m, 1h, 6h, 24h, 7d), Traffic Direction (`Inbound`, `Outbound`, `Internal`), Enforcement Action (`All`, `Allowed`, `Blocked`), Protocol (`TCP`, `UDP`, `ICMP`), and free-text search (IP/CIDR, hostname, subnet, or App-ID).
- **Allowed vs. Blocked Volume Timeline**: Interactive ECharts velocity stream visualizing permitted campus bandwidth alongside blocked threat attacks (Tor C2 beacons, botnet probes, mining pools, unauthorized P2P).
- **Deep Log Explorer & Live Stream**: High-performance streaming log explorer table with bi-directional volume counters, destination country flags, policy names, and one-click CSV export.

![InfluxDB Traffic & Threat Ingestion Analytics](docs/screenshots/07_live_syslog_stream.png)
![Deep Multi-Parameter Log Explorer & Live Stream](docs/screenshots/07b_traffic_log_explorer.png)

---

### 8. CERT-In Cyber Security Baseline Compliance
Continuous audit engine verifying alignment with Indian National Cyber Security Guidelines (MeitY / CERT-In Section 70B directives), including:
- Mandatory 180-day log retention validation
- Primary Stratum-1 Indian Standard Time (IST) NTP clock synchronization
- Ingress/egress ACL audit trails
- Configuration drift and revision management

![CERT-In Security Compliance](docs/screenshots/08_certin_compliance.png)

---

### 9. User Management & Role-Based Access Control (RBAC)
Comprehensive user management dashboard featuring:
- Protected default `superadmin` account
- Granular operational roles: `Super Administrator`, `Administrator`, `Auditor`, and `Operator`
- User profile modification (Full Name, Official Email Address, Department)
- Instant Telegram Bot security notifications with Chat ID validation and automated alerts

![User Management & Access Control](docs/screenshots/09_user_management.png)

---

### 10. Organization Branding & PostgreSQL 18 Storage Operations
Centralized settings console enabling custom institutional identity:
- Upload custom enterprise logo (Base64 raster PNG/SVG up to 5MB) or select UX4G vector emblems
- Dynamic portal naming, organization labels, and division subtitles
- SNMP Target IP, community string, polling intervals, and alert threshold tuning
- Automated PostgreSQL 18 database backup scheduler with instant manual export trigger
- Storage breakdown modal showing exact disk paths and database volume utilization

![System Configuration & Branding](docs/screenshots/10_settings_branding.png)

---

## Architectural Topology

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Enterprise Perimeter Network                             │
│                                                                             │
│   ┌───────────────────────────┐         ┌──────────────────────────────┐    │
│   │ Fortinet FortiGate NGFW   │         │ Check Point / Palo Alto / pf │    │
│   │ IP: 10.10.3.15            │         │ Gateways & Routers           │    │
│   └─────────────┬─────────────┘         └──────────────┬───────────────┘    │
└─────────────────┼──────────────────────────────────────┼────────────────────┘
                  │                                      │
         SNMPv2c  │ UDP: 161                    Syslog   │ UDP: 1514 / 514
         NetFlow  │ UDP: 2055                   NetFlow  │ UDP: 2055
                  ▼                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│    Enterprise Firewall Telemetry Appliance (Docker Macvlan / Host IP)       │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ Container: firewall-monitoring-console (10.40.0.150:80)               │  │
│  │                                                                       │  │
│  │  ┌─────────────────────────┐         ┌─────────────────────────────┐  │  │
│  │  │ Ingestion Engine        │         │ REST API & WebSocket        │  │  │
│  │  │ • Parallel SNMP Poller  │         │ • Express 4 Core            │  │  │
│  │  │ • UDP Syslog Ingester   │◄───────►│ • ws 8.18 Streaming Server  │  │  │
│  │  │ • NetFlow Binary Parser │         │ • Automated SpeedTest Engine│  │  │
│  │  └────────────┬────────────┘         └──────────────┬──────────────┘  │  │
│  │               │                                     │                 │  │
│  │  ┌────────────▼────────────┐                        │                 │  │
│  │  │ PostgreSQL 18 Data Sync │                        │                 │  │
│  │  │ • Connection Pool       │                        │                 │  │
│  │  │ • Automatic Backups     │                        │                 │  │
│  │  └────────────┬────────────┘                        │                 │  │
│  └───────────────┼─────────────────────────────────────┼─────────────────┘  │
│                  │                                     │                    │
│                  ▼                                     ▼                    │
│  ┌─────────────────────────────────┐   ┌─────────────────────────────────┐  │
│  │ Container: firewall-monitoring- │   │ Client: Vue 3.5 Single-Page App │  │
│  │ db (10.40.0.151:5432)           │   │ • Bento Traffic Analyzer        │  │
│  │ • PostgreSQL 18 Alpine          │   │ • SNMP Hardware Cockpit         │  │
│  │ • Volume: pg18_data             │   │ • Hands-Free Auto-Refresh       │  │
│  └─────────────────────────────────┘   └─────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Technical Stack

| Layer | Technologies | Key Highlights |
| :--- | :--- | :--- |
| **Frontend UI** | Vue 3.5, Vite 6, TailwindCSS 3.4, Pinia, Vue Router | Single-page reactive app, Bento grid layout, zero-lag rendering |
| **Data Visualization**| Apache ECharts 5.6, vue-echarts, Lucide Vue Next | Speedometer gauges, area charts, protocol distribution bars |
| **Backend Core** | Node.js 24, Express 4.21, TypeScript 5.8 | High-throughput asynchronous runtime, NetFlow binary decoders |
| **SNMP Engine** | `net-snmp`, Net-SNMP CLI tools, Subtree walkers | 64-bit HC octet counters, rate deltas, FortiOS sensor MIBs |
| **Time-Series TSDB** | InfluxDB 2.7 Alpine (`influxdb:2.7-alpine`) | High-throughput Line-Protocol writes, 180-day retention bucket |
| **Relational Database**| PostgreSQL 18 Alpine (`postgres:18-alpine`) | Normalized telemetry schema, JSONB metrics, RBAC, backups |
| **Container Runtime** | Docker Compose v2, Linux Macvlan Bridge | Isolated network IPs (`10.40.0.150`, `10.40.0.151`, `10.40.0.152`) |
| **Design Standards** | Government of India UX4G Framework | Clean single-header layout, accessible typography, violet theme |

---

## Network Requirements & Port Matrix

Ensure the telemetry host or virtual machine has direct routing to monitored perimeter appliances across the following ports:

| Port | Protocol | Direction | Description |
| :--- | :--- | :--- | :--- |
| **80 / 443** | TCP | Inbound | Web Management Console & REST / WebSocket API |
| **161** | UDP | Outbound | SNMPv2c / SNMPv3 queries to Firewall Gateways |
| **1514 / 514**| UDP | Inbound | Syslog stream reception from firewalls |
| **2055** | UDP | Inbound | NetFlow v5 / v9 & IPFIX binary flow records |
| **8086** | TCP | Internal | InfluxDB 2.7 TSDB Line-Protocol & Flux queries |
| **5432** | TCP | Internal | PostgreSQL 18 database connectivity |
| **123** | UDP | Outbound | NTP clock synchronization (NPL / NIC India Stratum-1) |

---

## Deployment Guide

### Option A: Docker Compose Deployment (Recommended)

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/ananthkrishnangv/Enterprise-Firewall-Telemetry-Centre.git
   cd Enterprise-Firewall-Telemetry-Centre
   ```

2. **Configure Environment Variables**:
   Create or verify `.env`:
   ```env
   NODE_ENV=production
   PORT=80
   WS_PORT=80
   SYSLOG_PORT=1514
   FLOW_PORT=2055

   # InfluxDB 2.7 Time-Series TSDB Configuration
   INFLUX_URL=http://10.40.0.152:8086
   INFLUX_TOKEN=influx-firewall-token-2026-supersecret
   INFLUX_ORG=csir-serc
   INFLUX_BUCKET=firewall_logs

   # PostgreSQL 18 Engine Configuration
   DATABASE_URL=postgresql://postgres:firewall_secret_2026!@10.40.0.151:5432/firewall_telemetry

   # Default Firewall Target
   DEFAULT_FW_IP=10.10.3.15
   DEFAULT_SNMP_COMMUNITY=fortinet
   DEFAULT_SNMP_VERSION=v2c
   ```

3. **Build and Launch Containers**:
   ```bash
   docker compose up -d --build
   ```

4. **Verify Container Health**:
   ```bash
   docker compose ps
   ```

5. **Access the Console**:
   Open your browser and navigate to `http://<HOST_OR_MACVLAN_IP>/` (e.g. `http://10.40.0.150/`).

---

### Option B: Local Development Setup

1. **Prerequisites**:
   - Node.js >= 20.0.0
   - npm >= 10.0.0
   - Local PostgreSQL 18 instance

2. **Install Dependencies**:
   ```bash
   npm install
   cd client && npm install && cd ..
   cd server && npm install && cd ..
   ```

3. **Start Development Servers**:
   ```bash
   # Run both frontend and backend concurrently
   npm run dev
   ```
   - Frontend Vite Dev Server: `http://localhost:5173`
   - Backend Express API: `http://localhost:3001`

---

## Default Access Credentials

> [!IMPORTANT]
> Change default passwords immediately after initial deployment in the User Management console.

| Role | Username | Password | Purpose |
| :--- | :--- | :--- | :--- |
| **Super Administrator** | `superadmin` | `SuperAdmin@2026!` | Full administrative access, user creation, license management |
| **Security Administrator** | `admin` | `NcccAdmin@2026!` | Day-to-day operations, threshold configuration, alert triage |
| **Compliance Auditor** | `auditor` | `CertInAudit@2026!` | Read-only compliance scorecard, log review, drift inspection |

---

## REST API Specification

The platform exposes a comprehensive, secured JSON REST API:

### Authentication
- `POST /api/auth/login` — Authenticate operator and receive JWT token.
- `GET /api/auth/me` — Verify session and fetch role permissions.

### Live SNMP Telemetry
- `GET /api/snmp/telemetry` — Full real-time metrics payload from FortiGate.
- `GET /api/snmp/interfaces?type=physical|vlan|vpn` — Filtered interface inventory with 64-bit rates.
- `GET /api/snmp/sensors` — Thermal zone readings, fan tachometers, and dual power supplies.
- `GET /api/snmp/protocols` — TCP connection tables, UDP datagrams, ICMP stats, and packet totals.
- `GET /api/snmp/policies` — Top firewall security policies sorted by byte and packet volume.

### Traffic & Flow
- `GET /api/bento/traffic-analytics` — Bento-grid metrics (top uploaders, downloaders, app mapping).
- `GET /api/telemetry/summary` — Aggregate flow throughput, drop rates, and threat counts.
- `GET /api/speedtest/latest` — Most recent 15-minute speed test results and next countdown.
- `POST /api/speedtest/run` — Manually trigger immediate speed test.

### Storage & Backups
- `GET /api/storage/info` — Database connection status, disk usage, and log paths.
- `POST /api/backup/trigger` — Trigger immediate PostgreSQL 18 database backup.

---

## Comprehensive PDF Documentation

A complete, high-resolution printable PDF technical manual has been compiled and included in the repository:

📄 **[Enterprise Firewall Telemetry Centre Documentation (PDF)](docs/Enterprise_Firewall_Telemetry_Centre_Documentation.pdf)**

The PDF manual covers:
- System Architecture & Engineering Specifications
- Appliance Network Hardening & Security ACLs
- First-Time Configuration Wizard Walkthrough
- FortiGate SNMP MIB-II & Enterprise OID Reference Tables
- Backup & Disaster Recovery Procedures
- CERT-In Baseline Audit Compliance Guidelines

---

## Licensing Structure

### CSIR-SERC Free Community & Institutional License (Version 1.0)

This software is released under the **CSIR-SERC Free Community & Institutional License (Version 1.0)** anchored on strict intellectual property protection and free community usage:

1. **Strict Source Code Ownership & Intellectual Property Protection**:
   - **Copyright**: Copyright © 2024–2026 CSIR - Structural Engineering Research Centre (CSIR-SERC), Council of Scientific and Industrial Research (CSIR), Ministry of Science & Technology, Government of India. All Rights Reserved.
   - **Authorship**: Developed by the Information and Communication Technology Division (ICTD), CSIR-SERC, Chennai, India.
   - **Exclusive Title**: All title, copyright, patent rights, moral rights, source code, architecture, algorithms, and threat intelligence models remain exclusively with CSIR-SERC.

2. **Permitted Free Usage & Deployment**:
   - **Universal Free & Community Edition**: Free for internal deployment and operational use across all Indian public institutions, research organizations, autonomous bodies, and educational institutions.
   - **Virtual Machine & Single Package Redistribution**: Organizations may deploy the package internally without license fees.

3. **Anti-Commercial Re-branding & Redistribution Restrictions**:
   - **No Commercial Resale or Sublicensing**: Sublicensing, re-branding for commercial resale, closed-source proprietary distribution, or fee-based packaging of this software is strictly prohibited.
   - **Attribution Integrity**: The mandatory institutional attribution badge (*"Made by ICTD CSIR-SERC for CSIR with ❤️"*) must be retained on the portal footer across all deployments.

---

## Technical Support & Contributions

For technical inquiries, feature contributions, or vulnerability disclosures:

- **Institutional Division**: Information and Communication Technology Division (ICTD)
- **Institution**: CSIR - Structural Engineering Research Centre (CSIR-SERC)
- **Location**: CSIR Campus, Taramani, Chennai - 600113, Tamil Nadu, India
- **Repository**: [https://github.com/ananthkrishnangv/Enterprise-Firewall-Telemetry-Centre.git](https://github.com/ananthkrishnangv/Enterprise-Firewall-Telemetry-Centre.git)
