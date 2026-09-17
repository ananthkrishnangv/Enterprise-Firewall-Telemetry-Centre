# Next-Gen Centralized Firewall Operations & Telemetry Platform

An enterprise-grade, single-host on-premises firewall operations, traffic analytics, and policy governance console designed for local enterprise networks.

Emphasizes 4 primary firewall platforms:
1. **Check Point** (Gaia OS / Quantum Security Gateways, Check Point MIB `1.3.6.1.4.1.2620`, Software Blades)
2. **Palo Alto Networks** (PAN-OS, App-ID, Content-ID, Enterprise MIB `1.3.6.1.4.1.25461`)
3. **Fortinet** (FortiGate NGFW, FortiOS, NP7/CP9 ASICs, Fortinet MIB `1.3.6.1.4.1.12356`)
4. **pfSense** (Netgate Security Gateways, FreeBSD pf engine, Begemot MIB `1.3.6.1.4.1.12325`)

---

## Architecture Highlights

- **Centralized On-Premise Topology**: Deployed on a single central host in your local network with direct reachability to local firewalls over LAN/VLANs.
- **Multi-Vendor Ingestion**:
  - **UDP Syslog Ingest (Port 1514 / 514)**: Native parsers for Check Point `CP-GW`, Palo Alto CSV format, FortiOS key-value, and pfSense `filterlog`.
  - **NetFlow / IPFIX (Port 2055)**: Binary parser decoding flow headers and records with zero-copy buffer views.
  - **SNMPv2c/v3 Health Engine**: Continuous polling for CPU, memory, concurrent connection tables, HA state, and interface traffic counters.
- **Canonical Rule-IR & Conflict Engine**:
  - Normalizes heterogeneous vendor ACLs into a unified Abstract Syntax Tree.
  - Interval-tree multidimensional conflict engine detects **Shadowed Rules**, **Redundant Rules**, **Any/Any Over-Permissive Rules**, and **Unused Rules**.
- **Configuration Drift & Diff**:
  - Colorized unified syntax diffs between configuration revisions with automated risk scoring.
- **Modern Vue 3.5 Reactive Portal**:
  - Powered by **Vue 3.5 (Composition API)** + **Vite** + **Tailwind CSS** + **Pinia** + **Apache ECharts** + **Lucide Icons**.
  - Real-time streaming charts, live syslog tail with pause/resume, and responsive drill-down tables.

---

## Project Structure

```
FirewallMonitoring/
├── package.json                         # Workspace orchestrator scripts
├── server/                              # Node.js 24 + TypeScript Ingestion & REST/WS Core
│   ├── package.json
│   ├── tsconfig.json
│   ├── test-udp.js                      # UDP packet generator for verification
│   └── src/
│       ├── index.ts                     # Main entrypoint (HTTP + WS + UDP Listeners + Poller)
│       ├── config.ts                    # Server configuration (Ports, intervals)
│       ├── types/index.ts               # Core TypeScript data models
│       ├── collectors/
│       │   ├── syslog.collector.ts      # Check Point, Palo Alto, Fortinet, pfSense parser
│       │   ├── flow.collector.ts        # NetFlow v5/v9 & IPFIX binary UDP parser
│       │   ├── snmp.collector.ts        # Check Point MIB + IF-MIB polling engine
│       │   └── telemetry.simulator.ts   # Continuous realistic telemetry generator
│       ├── policy/
│       │   ├── shadow-analyzer.ts       # Interval-tree policy conflict detection
│       │   └── config-diff.ts           # Configuration revision diff engine
│       ├── storage/
│       │   ├── telemetry.store.ts       # In-memory indexed ring buffer & aggregators
│       │   └── metadata.store.ts        # Primary firewalls, rules, and compliance store
│       └── api/
│           ├── routes.ts                # REST API endpoints
│           └── websocket.ts             # Real-time WebSocket streaming broadcaster
└── client/                              # Vue 3.5 + Vite Enterprise Web Console
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    └── src/
        ├── App.vue                      # Root layout
        ├── main.ts                      # App bootstrap & ECharts registration
        ├── router/index.ts              # Navigation routing
        ├── stores/
        │   ├── firewall.store.ts        # Devices, rules, diffs, compliance
        │   └── telemetry.store.ts       # WebSocket live feeds, top talkers, alerts
        ├── components/
        │   ├── Sidebar.vue              # Primary firewalls status & navigation
        │   ├── HeaderBar.vue            # Cluster status, active alerts, refresh
        │   └── VendorBadge.vue          # Check Point, Palo Alto, Fortinet, pfSense badges
        └── views/
            ├── DashboardView.vue        # Executive & Ops Real-Time Overview
            ├── TrafficView.vue          # Top Talkers & Flow Navigator
            ├── PolicyView.vue           # Rule Explorer & Shadow Rule visualizer
            ├── DevicesView.vue          # SNMP Probes, Check Point Blades, Interfaces
            ├── ConfigDiffView.vue       # Config Versioning & Unified Diff Viewer
            ├── LiveLogsView.vue         # Terminal-style Live Syslog Stream
            └── ComplianceView.vue       # PCI-DSS, CIS, and ISO-27001 scorecards
```

---

## Quick Start Guide

### 1. Start the Platform
To run both backend collectors and frontend portal simultaneously:
```bash
npm run dev
```

Or run them individually:
```bash
# Terminal 1 (Backend Core on Port 3001)
npm run dev:server

# Terminal 2 (Vue 3.5 Portal on Port 5173)
npm run dev:client
```

### 2. Access the Web Console
Open your web browser and navigate to:
```
http://localhost:5173
```

---

## Ingestion Ports & Test Commands

| Service | Port | Protocol | Purpose |
|---|---|---|---|
| **REST API** | `3001` | HTTP | Device inventory, rules, analytics, compliance |
| **Telemetry Stream** | `3001` | WebSocket (`/ws`) | Live log and flow event broadcasting |
| **Syslog Collector** | `1514` (or `514`) | UDP | Check Point, Palo Alto, Fortinet, pfSense logs |
| **NetFlow Collector** | `2055` | UDP | Cisco NetFlow v5/v9 & IPFIX telemetry |
| **Web Console** | `5173` | HTTP | Vue 3.5 enterprise portal |

### Send Test Syslog Packets
To send test packets into the live ingestion engine:
```bash
cd server
node test-udp.js
```
The logs will instantly appear in the **Live Syslog Tail** (`http://localhost:5173/logs`) and update the **Traffic Flow Navigator** in real time!

---

## 📜 Licensing & Mandatory Attribution

This project is governed by the **CSIR-SERC Free Community & Institutional License (Version 1.0)**.

### Core Principles
1. **Strict Source Code Ownership & IP Protection**: All copyright, patent rights, trademarks, architecture, algorithms, and source code remain exclusively with **CSIR - Structural Engineering Research Centre (CSIR-SERC)**, Council of Scientific and Industrial Research (CSIR), Ministry of Science & Technology, Government of India. Commercial resale, closed sublicensing, or white-label repackaging for sale is strictly prohibited.
2. **Universal Free Usage & Redistribution Rights**: Anyone, any research institution, university, government agency, defense organization, PSU, or private enterprise worldwide is free to install, run, execute, benchmark, and redistribute VM appliances and container packages at zero cost.

### Mandatory Attribution Notice
All redistributions, forks, user interfaces, console banners, and documentation must prominently retain:

> **"Made by ICTD CSIR-SERC for CSIR with ❤️"**

