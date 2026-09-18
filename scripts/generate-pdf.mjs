import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function getBase64Image(filePath) {
  if (!fs.existsSync(filePath)) return '';
  const buffer = fs.readFileSync(filePath);
  return `data:image/png;base64,${buffer.toString('base64')}`;
}

console.log('Loading high-resolution screenshots for PDF compilation...');

const imgLogin = getBase64Image('docs/screenshots/01_login.png');
const imgWizard = getBase64Image('docs/screenshots/02_wizard.png');
const imgDashboard = getBase64Image('docs/screenshots/03_dashboard.png');
const imgBento = getBase64Image('docs/screenshots/04_bento_traffic.png');
const imgUnapproved = getBase64Image('docs/screenshots/04b_unapproved_apps.png');
const imgUnapprovedTable = getBase64Image('docs/screenshots/04c_unapproved_violations_table.png');
const imgUnapprovedDossier = getBase64Image('docs/screenshots/04d_device_forensic_dossier.png');
const imgSnmp = getBase64Image('docs/screenshots/05_snmp_telemetry_center.png');
const imgPolicies = getBase64Image('docs/screenshots/06_firewall_policies.png');
const imgLogs = getBase64Image('docs/screenshots/07_live_syslog_stream.png');
const imgLogsExplorer = getBase64Image('docs/screenshots/07b_traffic_log_explorer.png');
const imgCompliance = getBase64Image('docs/screenshots/08_certin_compliance.png');
const imgUsers = getBase64Image('docs/screenshots/09_user_management.png');
const imgSettings = getBase64Image('docs/screenshots/10_settings_branding.png');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Enterprise Firewall Telemetry & Security Operations Center - Technical Documentation</title>
  <style>
    @page {
      size: A4;
      margin: 18mm 14mm 18mm 14mm;
      @bottom-right {
        content: counter(page);
      }
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #1e293b;
      line-height: 1.55;
      font-size: 10pt;
      margin: 0;
      padding: 0;
      background: #ffffff;
    }

    .page-break {
      page-break-before: always;
    }

    .avoid-break {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    /* Cover Page */
    .cover-page {
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 40px 20px;
      page-break-after: always;
      border-left: 6px solid #4f46e5;
    }

    .tricolor-bar {
      height: 4px;
      width: 100%;
      background: linear-gradient(to right, #FF9933 33%, #FFFFFF 33%, #FFFFFF 66%, #138808 66%);
      border: 1px solid #cbd5e1;
      margin-bottom: 25px;
    }

    .cover-title {
      font-size: 26pt;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.15;
      margin-bottom: 12px;
      letter-spacing: -0.5px;
    }

    .cover-subtitle {
      font-size: 13pt;
      font-weight: 500;
      color: #4f46e5;
      margin-bottom: 30px;
      line-height: 1.4;
    }

    .meta-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px 20px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 9pt;
      line-height: 1.8;
      color: #334155;
    }

    .cover-footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 20px;
      font-size: 9pt;
      color: #64748b;
    }

    /* Typography & Sections */
    h1 {
      font-size: 18pt;
      font-weight: 800;
      color: #0f172a;
      border-bottom: 2px solid #4f46e5;
      padding-bottom: 6px;
      margin-top: 24px;
      margin-bottom: 14px;
    }

    h2 {
      font-size: 13pt;
      font-weight: 700;
      color: #1e1b4b;
      margin-top: 18px;
      margin-bottom: 10px;
      border-left: 4px solid #6366f1;
      padding-left: 8px;
    }

    h3 {
      font-size: 11pt;
      font-weight: 600;
      color: #334155;
      margin-top: 14px;
      margin-bottom: 6px;
    }

    p {
      margin: 0 0 10px 0;
      text-align: justify;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0 16px 0;
      font-size: 8.5pt;
    }

    th, td {
      border: 1px solid #cbd5e1;
      padding: 7px 10px;
      text-align: left;
    }

    th {
      background-color: #f1f5f9;
      color: #0f172a;
      font-weight: 700;
    }

    tr:nth-child(even) td {
      background-color: #f8fafc;
    }

    /* Code Blocks */
    pre, code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }

    pre {
      background: #0f172a;
      color: #f8fafc;
      padding: 12px 14px;
      border-radius: 6px;
      font-size: 8pt;
      line-height: 1.45;
      overflow-x: auto;
      margin: 10px 0 14px 0;
    }

    /* Screenshot Display */
    .screenshot-card {
      margin: 16px 0 20px 0;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }

    .screenshot-card img {
      width: 100%;
      display: block;
      border-bottom: 1px solid #e2e8f0;
    }

    .screenshot-caption {
      padding: 8px 12px;
      background: #f8fafc;
      font-size: 8pt;
      font-weight: 600;
      color: #475569;
      display: flex;
      justify-content: space-between;
    }

    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 7.5pt;
      font-weight: 700;
      text-transform: uppercase;
    }

    .badge-primary { background: #e0e7ff; color: #3730a3; }
    .badge-success { background: #dcfce7; color: #166534; }
    .badge-warning { background: #fef3c7; color: #92400e; }

    .callout {
      background: #f0fdf4;
      border-left: 4px solid #16a34a;
      padding: 10px 14px;
      margin: 12px 0;
      border-radius: 0 6px 6px 0;
      font-size: 8.5pt;
    }

    .callout-title {
      font-weight: bold;
      color: #15803d;
      margin-bottom: 4px;
    }

    .footer-stamp {
      text-align: center;
      margin-top: 30px;
      padding-top: 15px;
      border-top: 1px solid #e2e8f0;
      font-size: 8pt;
      color: #64748b;
    }
  </style>
</head>
<body>

  <!-- COVER PAGE -->
  <div class="cover-page">
    <div>
      <div class="tricolor-bar"></div>
      <div style="font-size: 9pt; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;">
        Government of India • Ministry of Science & Technology
      </div>
      <div class="cover-title">
        Enterprise Firewall Telemetry &<br>Security Operations Center
      </div>
      <div class="cover-subtitle">
        High-Performance Real-Time SNMP Hardware Cockpit, Bento Flow Analytics & Policy Governance Platform
      </div>

      <div class="meta-box">
        <div><strong>Document Reference:</strong> CSIR-SERC/ICTD/EFTC/2026/DOC-01</div>
        <div><strong>Classification:</strong> Official Institutional Technical Manual</div>
        <div><strong>Release Version:</strong> 1.1.0 (InfluxDB 2.7 TSDB & PostgreSQL 18 Multi-Tier Edition)</div>
        <div><strong>Target Appliance:</strong> Fortinet FortiGate NGFW (10.10.3.15)</div>
        <div><strong>Deployment Mode:</strong> Multi-Container Microservices Appliance (Docker)</div>
        <div><strong>Issuing Division:</strong> Information & Communication Technology Division (ICTD)</div>
        <div><strong>Institution:</strong> CSIR - Structural Engineering Research Centre, Chennai</div>
      </div>
    </div>

    <div class="cover-footer">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <strong>CSIR-SERC Free Community & Institutional License (v1.0)</strong><br>
          Developed for CSIR and Indian Public Institutions
        </div>
        <div style="text-align: right;">
          Chennai, India<br>
          September 2026
        </div>
      </div>
    </div>
  </div>

  <!-- TABLE OF CONTENTS -->
  <div>
    <h1>Table of Contents</h1>
    <table style="margin-top: 15px;">
      <thead>
        <tr>
          <th style="width: 10%;">Section</th>
          <th style="width: 75%;">Title</th>
          <th style="width: 15%;">Focus</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>1.0</td><td>Executive Overview & Architectural Objectives</td><td>Context</td></tr>
        <tr><td>2.0</td><td>System Architecture & Real-Time Data Pipeline</td><td>Technical</td></tr>
        <tr><td>3.0</td><td>Visual Interface Tour & Operational Views</td><td>Walkthrough</td></tr>
        <tr><td>4.0</td><td>Live FortiGate SNMP Telemetry Engine Specification</td><td>Hardware OIDs</td></tr>
        <tr><td>5.0</td><td>Bento Traffic Analytics & App-ID Identification</td><td>Flows</td></tr>
        <tr><td>6.0</td><td>Canonical Policy Governance & Conflict Engine</td><td>Security</td></tr>
        <tr><td>7.0</td><td>Full-Spectrum Traffic & Log Analyzer (InfluxDB 2.7 TSDB Engine)</td><td>Log Analysis</td></tr>
        <tr><td>8.0</td><td>CERT-In Section 70B National Cybersecurity Compliance</td><td>Audit</td></tr>
        <tr><td>9.0</td><td>User Management & Telegram Alert Integration</td><td>RBAC</td></tr>
        <tr><td>10.0</td><td>Dual Database Engines: InfluxDB 2.7 TSDB & PostgreSQL 18</td><td>Storage</td></tr>
        <tr><td>11.0</td><td>Deployment, Health Diagnostics & Troubleshooting</td><td>DevOps</td></tr>
        <tr><td>12.0</td><td>CSIR-SERC Free Community & Institutional License v1.0</td><td>Legal</td></tr>
      </tbody>
    </table>

    <div class="callout" style="margin-top: 25px;">
      <div class="callout-title">Institutional Attribution & Licensing</div>
      This platform is developed by the <strong>Information and Communication Technology Division (ICTD)</strong>, CSIR - Structural Engineering Research Centre (CSIR-SERC), Chennai, India. It is provided under the CSIR-SERC Free Community & Institutional License (v1.0) for deployment across all Indian research centers, public institutions, and educational networks.
    </div>
  </div>

  <div class="page-break"></div>

  <!-- SECTION 1: ARCHITECTURE -->
  <h1>1. System Architecture & Ingestion Pipeline</h1>
  <p>
    The Enterprise Firewall Telemetry & Security Operations Center is architected as a high-performance on-premises operations center designed to monitor all traffic passing through perimeter gateways without cloud dependencies or external data egress.
  </p>

  <h2>Core Components</h2>
  <ul>
    <li><strong>Parallel SNMP Poller (<200ms)</strong>: Concurrently queries FortiGate appliances across MIB-II, IF-MIB, and FortiOS enterprise sensor trees. Tracks 64-bit High Capacity (HC) octets, thermal zones, fan tachometers, dual power supplies, and security policy accounting counters.</li>
    <li><strong>Full-Spectrum Traffic & Log Ingester</strong>: Listens on UDP port 1514 (Syslog) and port 2055 (NetFlow v5/v9 & IPFIX) with multi-subnet institutional host resolution, capturing all ingress, egress, inter-VLAN, and blocked security threats across the entire perimeter.</li>
    <li><strong>InfluxDB 2.7 Time-Series TSDB Engine</strong>: High-throughput batch Line-Protocol ingestion engine maintaining dedicated time-series buckets with a 180-day automated retention lifecycle meeting CERT-In national mandates.</li>
    <li><strong>PostgreSQL 18 Database Engine</strong>: Relational persistence layer in an optimized Alpine container managing operator accounts, RBAC permissions, and automated configuration/log backups.</li>
    <li><strong>Reactive Vue 3.5 & ECharts Operations Console</strong>: Single-page application conforming to Government of India UX4G design standards with real-time WebSocket streaming and multi-parameter log filtering.</li>
  </ul>

  <h2>Network Port Matrix</h2>
  <table>
    <thead>
      <tr>
        <th>Port</th>
        <th>Protocol</th>
        <th>Direction</th>
        <th>Source</th>
        <th>Destination</th>
        <th>Service Description</th>
      </tr>
    </thead>
    <tbody>
      <tr><td>80 / 443</td><td>TCP</td><td>Inbound</td><td>Admin Workstation</td><td>Telemetry Console</td><td>Web UI & REST / WebSocket API</td></tr>
      <tr><td>161</td><td>UDP</td><td>Outbound</td><td>Telemetry Console</td><td>FortiGate Gateway</td><td>SNMPv2c / SNMPv3 Polling</td></tr>
      <tr><td>1514 / 514</td><td>UDP</td><td>Inbound</td><td>FortiGate Gateway</td><td>Telemetry Console</td><td>Hardware Syslog Forwarding</td></tr>
      <tr><td>2055</td><td>UDP</td><td>Inbound</td><td>FortiGate Gateway</td><td>Telemetry Console</td><td>NetFlow v5/v9 & IPFIX Records</td></tr>
      <tr><td>8086</td><td>TCP</td><td>Internal</td><td>Web Console</td><td>InfluxDB 2.7 TSDB</td><td>Time-Series Line Protocol Writes & Flux Queries</td></tr>
      <tr><td>5432</td><td>TCP</td><td>Internal</td><td>Web Console</td><td>PostgreSQL 18 DB</td><td>Relational Metadata & Audit Persistence</td></tr>
    </tbody>
  </table>

  <div class="page-break"></div>

  <!-- SECTION 2: SCREENSHOT TOUR -->
  <h1>2. Visual Interface Tour</h1>

  <div class="avoid-break">
    <h2>2.1 Authentication & First-Time Setup Wizard</h2>
    <p>
      The appliance features secure operator authentication and an automated first-time deployment wizard that guides administrators through organization branding, logo selection, SNMP parameters, and administrator setup upon initial deployment.
    </p>
    
    <div class="screenshot-card">
      <img src="${imgLogin}" alt="Operator Login Screen">
      <div class="screenshot-caption">
        <span>Figure 1: UX4G Secure Operator Authentication Portal</span>
        <span class="badge badge-primary">Authentication</span>
      </div>
    </div>

    <div class="screenshot-card">
      <img src="${imgWizard}" alt="First-Time Setup Wizard">
      <div class="screenshot-caption">
        <span>Figure 2: Turnkey First-Time Configuration Wizard (Virtual Appliance Ready)</span>
        <span class="badge badge-success">Onboarding</span>
      </div>
    </div>
  </div>

  <div class="page-break"></div>

  <div class="avoid-break">
    <h2>2.2 Executive Telemetry Dashboard</h2>
    <p>
      The primary operations screen delivers instantaneous visibility into WAN traffic speeds, live streaming telemetry pulses, 15-minute automated speed test countdowns, and continuous hands-free auto-refresh.
    </p>

    <div class="screenshot-card">
      <img src="${imgDashboard}" alt="Executive Telemetry Dashboard">
      <div class="screenshot-caption">
        <span>Figure 3: Live Executive Telemetry Dashboard with Inbound/Outbound Velocity Gauges</span>
        <span class="badge badge-primary">Operations</span>
      </div>
    </div>
  </div>

  <div class="avoid-break">
    <h2>2.3 Bento-Style Traffic & Flow Analyzer (Exact Source & Destination IP Intelligence)</h2>
    <p>
      The Bento layout provides bidirectional network intelligence with exact firewall source and destination details. For outbound uploads, internal institutional workstations are tracked to their remote internet destinations (with domain resolution, country geolocation, and port). For inbound downloads, external source origins are mapped directly to the recipient internal workstation.
    </p>

    <div class="screenshot-card">
      <img src="${imgBento}" alt="Bento Traffic Analyzer">
      <div class="screenshot-caption">
        <span>Figure 4: Bento-Grid Traffic Analyzer (Exact Source/Destination IP Mapping & App-ID Identification)</span>
        <span class="badge badge-success">Flow Analytics</span>
      </div>
    </div>
  </div>

  <div class="page-break"></div>

  <div class="avoid-break">
    <h2>2.4 Unapproved Applications & Illicit Network Activity Monitor</h2>
    <p>
      Dedicated forensic investigation center identifying internal campus devices accessing BitTorrent/P2P swarms, download managers (IDM/Leechers), pirated movie streaming and download sites, unofficial media, botnet C2 beacons, cryptocurrency mining pools, and proxy circumvention tools. Displays ranked offending workstations with one-click forensic dossiers and copy-paste FortiOS quarantine CLI commands.
    </p>

    <div class="screenshot-card">
      <img src="${imgUnapproved}" alt="Unapproved Applications Monitor">
      <div class="screenshot-caption">
        <span>Figure 5: Unapproved & Illicit Applications Dashboard (Top Offending Workstations & Categories)</span>
        <span class="badge badge-warning">Threat Watch</span>
      </div>
    </div>

    <div class="screenshot-card">
      <img src="${imgUnapprovedTable}" alt="Forensic Violations Table">
      <div class="screenshot-caption">
        <span>Figure 6: Live Forensic Incident Register (Matching Offending Internal Devices to Remote Endpoints)</span>
        <span class="badge badge-primary">Incident Register</span>
      </div>
    </div>
  </div>

  <div class="avoid-break">
    <div class="screenshot-card">
      <img src="${imgUnapprovedDossier}" alt="Device Forensic Dossier">
      <div class="screenshot-caption">
        <span>Figure 7: Workstation Forensic Dossier & Instant FortiOS Quarantine CLI Generator</span>
        <span class="badge badge-success">Forensic Dossier</span>
      </div>
    </div>
  </div>

  <div class="page-break"></div>

  <div class="avoid-break">
    <h2>2.5 Comprehensive FortiGate SNMP Telemetry Center</h2>
    <p>
      Dedicated hardware and environmental telemetry cockpit: monitoring CPU/RAM, session counts, 46+ physical ports and departmental VLANs, thermal zones, cooling fans, dual AC power supplies, and FortiOS UTM threat counters.
    </p>

    <div class="screenshot-card">
      <img src="${imgSnmp}" alt="SNMP Telemetry Center">
      <div class="screenshot-caption">
        <span>Figure 8: High-Performance FortiGate SNMP Hardware & Environmental Center</span>
        <span class="badge badge-primary">SNMP Hardware</span>
      </div>
    </div>
  </div>

  <div class="avoid-break">
    <h2>2.6 Security Policies & Conflict Engine</h2>
    <p>
      Parses native firewall access control lists into a canonical rule tree, highlighting shadowed, redundant, or overly permissive rules.
    </p>

    <div class="screenshot-card">
      <img src="${imgPolicies}" alt="Policy Rules & Governance">
      <div class="screenshot-caption">
        <span>Figure 9: Canonical Policy Governance & Shadow Conflict Detection</span>
        <span class="badge badge-warning">Security Audit</span>
      </div>
    </div>
  </div>

  <div class="page-break"></div>

  <div class="avoid-break">
    <h2>2.7 Full-Spectrum Firewall Traffic & Log Analyzer (InfluxDB 2.7 TSDB Engine)</h2>
    <p>
      High-velocity time-series traffic ingestion and multi-parameter log analyzer capturing all traffic passing through the perimeter gateway across all 46+ interfaces, departmental VLANs, HPC clusters, and external WAN. Features multi-parameter filtering (time range, direction, enforcement action, protocol, and search), timeline aggregation, and security drop inspection.
    </p>

    <div class="screenshot-card">
      <img src="${imgLogs}" alt="Firewall Traffic & Threat Analytics">
      <div class="screenshot-caption">
        <span>Figure 10: InfluxDB Traffic & Threat Ingestion Velocity Analytics (Allowed vs Blocked)</span>
        <span class="badge badge-primary">TSDB Analytics</span>
      </div>
    </div>

    <div class="screenshot-card">
      <img src="${imgLogsExplorer}" alt="Deep Log Explorer & Live Stream">
      <div class="screenshot-caption">
        <span>Figure 11: Deep Multi-Parameter Log Explorer & Live Stream Table (All Subnets & Blocked Threats)</span>
        <span class="badge badge-success">Log Explorer</span>
      </div>
    </div>
  </div>

  <div class="page-break"></div>

  <div class="avoid-break">
    <h2>2.8 CERT-In Section 70B Compliance & Cybersecurity Baseline</h2>
    <p>
      Dedicated compliance dashboard validating firewall operational controls against the Indian Computer Emergency Response Team (CERT-In) Section 70B directives, including 180-day secure time-series log retention and Stratum-1 IST NTP clock synchronization.
    </p>

    <div class="screenshot-card">
      <img src="${imgCompliance}" alt="CERT-In Compliance">
      <div class="screenshot-caption">
        <span>Figure 12: CERT-In National Cyber Security Baseline Compliance Dashboard</span>
        <span class="badge badge-success">Compliance</span>
      </div>
    </div>
  </div>

  <div class="avoid-break">
    <h2>2.9 User Management & System Configuration</h2>
    <p>
      Multi-tenant user management console with protected superadmin account, role-based permissions, Telegram alert integration, organization branding, custom logo upload, InfluxDB time-series retention, and PostgreSQL 18 automated backup operations.
    </p>

    <div class="screenshot-card">
      <img src="${imgUsers}" alt="User Management">
      <div class="screenshot-caption">
        <span>Figure 13: User Management & Telegram Alert Configuration</span>
        <span class="badge badge-primary">RBAC</span>
      </div>
    </div>

    <div class="screenshot-card">
      <img src="${imgSettings}" alt="Settings & Branding">
      <div class="screenshot-caption">
        <span>Figure 14: Institutional Branding, Custom Logo & PostgreSQL 18 / InfluxDB 2.7 Engines</span>
        <span class="badge badge-primary">Administration</span>
      </div>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- SECTION 3: TECHNICAL DETAILS -->
  <h1>3. Technical Specifications & Reference Tables</h1>

  <h2>3.1 FortiGate Hardware Sensor OID Reference</h2>
  <table>
    <thead>
      <tr>
        <th>Sensor Subsystem</th>
        <th>Enterprise OID</th>
        <th>Observed Value</th>
        <th>Threshold / Status</th>
      </tr>
    </thead>
    <tbody>
      <tr><td>CPU Thermal Core</td><td>1.3.6.1.4.1.12356.101.4.3.2.1.3 (DTS0)</td><td>46°C</td><td>Normal (&lt; 75°C)</td></tr>
      <tr><td>Board Center Thermal</td><td>1.3.6.1.4.1.12356.101.4.3.2.1.3 (TD1)</td><td>36°C</td><td>Normal (&lt; 65°C)</td></tr>
      <tr><td>Chassis Exhaust Thermal</td><td>1.3.6.1.4.1.12356.101.4.3.2.1.3 (TD2)</td><td>44°C</td><td>Normal (&lt; 70°C)</td></tr>
      <tr><td>NP6 Accelerator Thermal</td><td>1.3.6.1.4.1.12356.101.4.3.2.1.3 (TR3)</td><td>40°C</td><td>Normal (&lt; 70°C)</td></tr>
      <tr><td>Cooling Fan 1</td><td>1.3.6.1.4.1.12356.101.4.3.1.1.3 (Fan 1)</td><td>6,400 RPM</td><td>Normal (Active)</td></tr>
      <tr><td>Cooling Fan 2</td><td>1.3.6.1.4.1.12356.101.4.3.1.1.3 (Fan 2)</td><td>6,400 RPM</td><td>Normal (Active)</td></tr>
      <tr><td>Cooling Fan 4</td><td>1.3.6.1.4.1.12356.101.4.3.1.1.3 (Fan 4)</td><td>5,200 RPM</td><td>Normal (Active)</td></tr>
      <tr><td>Power Supply 1 (Primary)</td><td>1.3.6.1.4.1.12356.101.4.3.3.1 (PSU 1)</td><td>228V AC, 48W</td><td>Normal (Dual Redundant)</td></tr>
      <tr><td>Power Supply 2 (Redundant)</td><td>1.3.6.1.4.1.12356.101.4.3.3.1 (PSU 2)</td><td>230V AC, 16W</td><td>Normal (Dual Redundant)</td></tr>
    </tbody>
  </table>

  <h2>3.2 Top FortiOS Security Policy Accounting</h2>
  <table>
    <thead>
      <tr>
        <th>Policy ID</th>
        <th>Traffic Description / Scope</th>
        <th>Cumulative Bytes</th>
        <th>Packet Count</th>
      </tr>
    </thead>
    <tbody>
      <tr><td>Policy 166</td><td>WAN Core Internet Routing & Academic Transit</td><td>161.58 TB</td><td>172.8 Billion</td></tr>
      <tr><td>Policy 76</td><td>Datacenter Core Inter-VLAN & High-Speed Switch</td><td>36.60 TB</td><td>37.3 Billion</td></tr>
      <tr><td>Policy 1</td><td>Default Perimeter Outbound NAT</td><td>11.45 TB</td><td>17.8 Billion</td></tr>
      <tr><td>Policy 156</td><td>Campus Research Network & Supercomputer Egress</td><td>5.98 TB</td><td>6.2 Billion</td></tr>
      <tr><td>Policy 84</td><td>High-Performance Computing Cluster (HPC) Tier</td><td>5.95 TB</td><td>6.36 Billion</td></tr>
    </tbody>
  </table>

  <div class="page-break"></div>

  <!-- SECTION 4: LICENSE -->
  <h1>4. Institutional Licensing & Legal Terms</h1>

  <h2>CSIR-SERC Free Community & Institutional License (Version 1.0)</h2>
  <p>
    The license is anchored on strict intellectual property protection and free community distribution for Indian public entities:
  </p>

  <h3>1. Source Code Ownership & Title</h3>
  <p>
    Copyright © 2024–2026 CSIR - Structural Engineering Research Centre (CSIR-SERC), Council of Scientific and Industrial Research (CSIR), Ministry of Science & Technology, Government of India. All Rights Reserved.
  </p>
  <p>
    Developed by the <strong>Information and Communication Technology Division (ICTD)</strong>, CSIR-SERC, Chennai, India. All title, copyright, patent rights, moral rights, source code, architecture, algorithms, and threat intelligence models remain exclusively with CSIR-SERC.
  </p>

  <h3>2. Permitted Free Community Usage</h3>
  <p>
    This software is released as the <strong>Universal Free & Community Edition</strong>. It may be freely deployed, used, and operated by all Indian public institutions, autonomous research bodies, government departments, universities, and educational institutions without licensing fees or royalties.
  </p>

  <h3>3. Anti-Commercial Re-branding & Packaging Restrictions</h3>
  <p>
    Sublicensing, commercial resale, paid re-branding, closed-source proprietary distribution, or fee-based packaging of this software or its derivatives is strictly prohibited. The institutional attribution notice in the portal footer (<em>"Made by ICTD CSIR-SERC for CSIR with ❤️"</em>) must be preserved in all deployments.
  </p>

  <div class="footer-stamp">
    <strong>Enterprise Firewall Telemetry & Security Operations Center</strong><br>
    Information and Communication Technology Division (ICTD) • CSIR-SERC, Chennai, India<br>
    Made by ICTD CSIR-SERC for CSIR with ❤️
  </div>

</body>
</html>`;

const htmlPath = path.resolve('docs/Enterprise_Firewall_Telemetry_Centre_Documentation.html');
const pdfPath = path.resolve('docs/Enterprise_Firewall_Telemetry_Centre_Documentation.pdf');

fs.writeFileSync(htmlPath, htmlContent);
console.log(`Generated HTML manual at ${htmlPath}`);

console.log('Compiling PDF using Chrome headless engine...');
const cmd = `"${CHROME_PATH}" --headless --disable-gpu --print-to-pdf="${pdfPath}" --no-margins --print-to-pdf-no-header "${htmlPath}"`;
execSync(cmd, { stdio: 'inherit' });

if (fs.existsSync(pdfPath)) {
  const stats = fs.statSync(pdfPath);
  console.log(`Successfully generated publication-quality PDF at:`);
  console.log(`${pdfPath} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
} else {
  console.error('Failed to generate PDF.');
}
