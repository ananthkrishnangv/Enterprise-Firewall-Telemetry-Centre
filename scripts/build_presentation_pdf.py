import os
import sys
import base64
import subprocess

def get_base64_image(file_path):
    if not os.path.exists(file_path):
        print(f"Warning: image file not found: {file_path}")
        return ""
    with open(file_path, "rb") as f:
        encoded = base64.b64encode(f.read()).decode("utf-8")
        return f"data:image/png;base64,{encoded}"

print("Loading 20 high-resolution screenshots into memory for presentation compilation...")

screenshots = {
    "login": get_base64_image("docs/screenshots/01_login.png"),
    "wizard": get_base64_image("docs/screenshots/02_wizard.png"),
    "dashboard": get_base64_image("docs/screenshots/03_dashboard.png"),
    "bento": get_base64_image("docs/screenshots/04_bento_traffic.png"),
    "unapproved": get_base64_image("docs/screenshots/04b_unapproved_apps.png"),
    "violations_table": get_base64_image("docs/screenshots/04c_unapproved_violations_table.png"),
    "device_dossier": get_base64_image("docs/screenshots/04d_device_forensic_dossier.png"),
    "snmp": get_base64_image("docs/screenshots/05_snmp_telemetry_center.png"),
    "all_interfaces": get_base64_image("docs/screenshots/05_all_interfaces_matrix.png"),
    "vlans": get_base64_image("docs/screenshots/05b_snmp_vlans_filter.png"),
    "interface_drilldown": get_base64_image("docs/screenshots/05c_interface_drilldown_modal.png"),
    "policies": get_base64_image("docs/screenshots/06_firewall_policies.png"),
    "syslog": get_base64_image("docs/screenshots/07_live_syslog_stream.png"),
    "vlans_matrix": get_base64_image("docs/screenshots/07a_vlan_subnet_matrix.png"),
    "explorer": get_base64_image("docs/screenshots/07b_traffic_log_explorer.png"),
    "filtered": get_base64_image("docs/screenshots/07c_vlan_172_17_filtered.png"),
    "compliance": get_base64_image("docs/screenshots/08_certin_compliance.png"),
    "users": get_base64_image("docs/screenshots/09_user_management.png"),
    "settings": get_base64_image("docs/screenshots/10_settings_branding.png"),
    "storage": get_base64_image("docs/screenshots/11_storage_registry.png")
}

print(f"Loaded {len(screenshots)} screenshots successfully.")

css = """
@page {
  size: 16in 9in;
  margin: 0;
}

* {
  box-sizing: border-box;
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
}

body {
  margin: 0;
  padding: 0;
  background-color: #060913;
  color: #f1f5f9;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 11pt;
  line-height: 1.45;
}

.slide {
  width: 16in;
  height: 9in;
  max-width: 16in;
  max-height: 9in;
  overflow: hidden;
  box-sizing: border-box;
  padding: 0.35in 0.55in 0.3in 0.55in;
  page-break-after: always;
  page-break-inside: avoid;
  break-inside: avoid;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: radial-gradient(circle at 12% 15%, rgba(124, 58, 237, 0.15), transparent 45%),
              radial-gradient(circle at 88% 85%, rgba(6, 182, 212, 0.10), transparent 40%),
              #070a14;
  position: relative;
}

/* Slide Header */
.slide-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1.5px solid rgba(139, 92, 246, 0.35);
  padding-bottom: 0.12in;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.tricolor-indicator {
  width: 4px;
  height: 38px;
  background: linear-gradient(to bottom, #FF9933 33%, #FFFFFF 33%, #FFFFFF 66%, #138808 66%);
  border-radius: 2px;
}

.institution-meta {
  display: flex;
  flex-direction: column;
}

.badge-apex {
  font-size: 8pt;
  font-weight: 800;
  letter-spacing: 0.8px;
  color: #38bdf8;
  text-transform: uppercase;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.badge-sub {
  font-size: 10pt;
  font-weight: 700;
  color: #e2e8f0;
}

.header-center {
  text-align: center;
  flex: 1;
  padding: 0 20px;
}

.slide-title {
  margin: 0;
  font-size: 16pt;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.3px;
  text-shadow: 0 2px 8px rgba(0,0,0,0.5);
}

.slide-subtitle {
  margin-top: 2px;
  font-size: 9pt;
  color: #a78bfa;
  font-weight: 500;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.route-pill {
  padding: 4px 10px;
  border-radius: 20px;
  background: rgba(124, 58, 237, 0.25);
  border: 1px solid rgba(139, 92, 246, 0.6);
  color: #c4b5fd;
  font-size: 8.5pt;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-weight: 700;
}

.slide-counter {
  padding: 4px 10px;
  border-radius: 20px;
  background: rgba(6, 182, 212, 0.15);
  border: 1px solid rgba(6, 182, 212, 0.4);
  color: #67e8f9;
  font-size: 8.5pt;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-weight: 800;
}

/* Slide Content Layout (Split 2-Column for screenshot slides) */
.slide-content-split {
  display: grid;
  grid-template-columns: 8.9in 5.9in;
  gap: 0.3in;
  flex: 1;
  align-items: stretch;
  min-height: 0;
  margin-top: 0.14in;
  margin-bottom: 0.12in;
}

.screenshot-frame {
  background: rgba(15, 23, 42, 0.75);
  border: 1.5px solid rgba(139, 92, 246, 0.45);
  border-radius: 14px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.7), 0 0 20px rgba(124, 58, 237, 0.2);
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
}

.screenshot-img {
  width: 100%;
  height: 100%;
  max-height: 6.7in;
  object-fit: contain;
  border-radius: 9px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.screenshot-badge {
  position: absolute;
  bottom: 12px;
  left: 14px;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(139, 92, 246, 0.5);
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 7.5pt;
  font-family: ui-monospace, monospace;
  color: #a78bfa;
}

/* Information Panel */
.info-panel {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 8px;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.info-card {
  background: rgba(15, 23, 42, 0.65);
  border: 1px solid rgba(139, 92, 246, 0.25);
  border-radius: 10px;
  padding: 9px 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.info-card.purpose {
  border-left: 4px solid #06b6d4;
  background: linear-gradient(to right, rgba(6, 182, 212, 0.08), rgba(15, 23, 42, 0.6));
}

.info-card.features {
  border-left: 4px solid #10b981;
  background: linear-gradient(to right, rgba(16, 185, 129, 0.08), rgba(15, 23, 42, 0.6));
}

.info-card.tech {
  border-left: 4px solid #a855f7;
  background: linear-gradient(to right, rgba(168, 85, 247, 0.08), rgba(15, 23, 42, 0.6));
}

.info-card.workflow {
  border-left: 4px solid #f59e0b;
  background: linear-gradient(to right, rgba(245, 158, 11, 0.08), rgba(15, 23, 42, 0.6));
}

.card-title {
  font-size: 8.5pt;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 5px;
}

.card-title.purpose-title { color: #38bdf8; }
.card-title.features-title { color: #34d399; }
.card-title.tech-title { color: #c084fc; }
.card-title.workflow-title { color: #fbbf24; }

.card-content {
  font-size: 8.2pt;
  color: #cbd5e1;
  line-height: 1.4;
}

.card-content ul {
  margin: 0;
  padding-left: 14px;
}

.card-content li {
  margin-bottom: 3px;
}

.card-content strong {
  color: #ffffff;
}

.code-inline {
  background: rgba(0, 0, 0, 0.4);
  padding: 1px 4px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-size: 7.5pt;
  color: #38bdf8;
}

/* Slide Footer */
.slide-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid rgba(139, 92, 246, 0.25);
  padding-top: 0.08in;
  font-size: 7.5pt;
  color: #94a3b8;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.footer-tag {
  color: #cbd5e1;
  font-family: ui-monospace, monospace;
}

.footer-sep {
  color: #64748b;
}

.footer-attribution {
  color: #f43f5e;
  font-weight: 700;
}

/* Full Width Architectural Slide Layout */
.full-slide-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  margin: 0.15in 0;
}

.grid-3-col {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.25in;
}

.grid-2-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.3in;
}

.grid-4-col {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.2in;
}

.arch-card {
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(139, 92, 246, 0.35);
  border-radius: 12px;
  padding: 14px 18px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.4);
}

.arch-card-header {
  font-size: 11pt;
  font-weight: 800;
  color: #38bdf8;
  border-bottom: 1px solid rgba(139, 92, 246, 0.3);
  padding-bottom: 6px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.arch-card-badge {
  font-size: 7.5pt;
  padding: 2px 7px;
  border-radius: 12px;
  background: rgba(124, 58, 237, 0.3);
  color: #c4b5fd;
  font-family: ui-monospace, monospace;
}

.arch-card-body {
  font-size: 8.5pt;
  color: #cbd5e1;
  line-height: 1.45;
}

.arch-card-body ul {
  margin: 0;
  padding-left: 15px;
}

.arch-card-body li {
  margin-bottom: 5px;
}

/* Table Styles for Matrices */
.styled-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 8pt;
  text-align: left;
}

.styled-table th {
  background: rgba(124, 58, 237, 0.35);
  color: #ffffff;
  padding: 6px 10px;
  border: 1px solid rgba(139, 92, 246, 0.4);
  font-weight: 700;
  text-transform: uppercase;
  font-size: 7.5pt;
  letter-spacing: 0.5px;
}

.styled-table td {
  padding: 6px 10px;
  border: 1px solid rgba(139, 92, 246, 0.2);
  color: #e2e8f0;
}

.styled-table tr:nth-child(even) {
  background: rgba(15, 23, 42, 0.45);
}

.styled-table tr:nth-child(odd) {
  background: rgba(15, 23, 42, 0.2);
}

/* Cover Slide */
.cover-slide {
  justify-content: space-between;
  padding: 0.6in 0.8in 0.5in 0.8in;
  background: radial-gradient(circle at 10% 20%, rgba(124, 58, 237, 0.25), transparent 50%),
              radial-gradient(circle at 90% 80%, rgba(6, 182, 212, 0.20), transparent 50%),
              #050811;
}

.cover-tricolor {
  height: 6px;
  width: 100%;
  background: linear-gradient(to right, #FF9933 33%, #FFFFFF 33%, #FFFFFF 66%, #138808 66%);
  border-radius: 3px;
  margin-bottom: 25px;
}

.cover-header-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cover-title-block {
  margin: 0.4in 0;
}

.cover-main-title {
  font-size: 30pt;
  font-weight: 900;
  color: #ffffff;
  letter-spacing: -0.8px;
  line-height: 1.15;
  text-shadow: 0 4px 15px rgba(0,0,0,0.7);
  margin-bottom: 12px;
}

.cover-main-title span {
  background: linear-gradient(to right, #a855f7, #06b6d4, #10b981);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.cover-subtitle {
  font-size: 13pt;
  color: #cbd5e1;
  max-width: 10.5in;
  line-height: 1.5;
  margin-bottom: 20px;
}

.cover-badges-row {
  display: flex;
  gap: 12px;
  margin-top: 15px;
}

.cover-badge {
  padding: 6px 14px;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(139, 92, 246, 0.5);
  font-size: 9pt;
  font-weight: 700;
  font-family: ui-monospace, monospace;
  color: #38bdf8;
}

.cover-footer {
  border-top: 1.5px solid rgba(139, 92, 246, 0.4);
  padding-top: 0.2in;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}
"""

def generate_screenshot_slide(
    slide_num, total_slides, title, subtitle, route, screenshot_key,
    purpose_content, features_content, tech_content, workflow_content
):
    img_data = screenshots.get(screenshot_key, "")
    return f"""
<div class="slide">
  <div class="slide-header">
    <div class="header-left">
      <div class="tricolor-indicator"></div>
      <div class="institution-meta">
        <span class="badge-apex">CSIR - Structural Engineering Research Centre • ICTD</span>
        <span class="badge-sub">Enterprise Firewall Telemetry & Operations Center</span>
      </div>
    </div>
    <div class="header-center">
      <h2 class="slide-title">{title}</h2>
      <div class="slide-subtitle">{subtitle}</div>
    </div>
    <div class="header-right">
      <span class="route-pill">{route}</span>
      <span class="slide-counter">SLIDE {slide_num:02d} / {total_slides:02d}</span>
    </div>
  </div>

  <div class="slide-content-split">
    <!-- LEFT: EXACTLY ONE FULL SCREENSHOT -->
    <div class="screenshot-frame">
      <img src="{img_data}" class="screenshot-img" alt="{title}" />
      <span class="screenshot-badge">LIVE APPLIANCE CAPTURE • FORTINET FORTIGATE 600F</span>
    </div>

    <!-- RIGHT: TECHNICAL DOCUMENTATION PANEL -->
    <div class="info-panel">
      <!-- 1. Purpose & Scope -->
      <div class="info-card purpose">
        <div class="card-title purpose-title">
          <span>🎯 Menu Purpose & Operational Persona</span>
        </div>
        <div class="card-content">
          {purpose_content}
        </div>
      </div>

      <!-- 2. Key Features -->
      <div class="info-card features">
        <div class="card-title features-title">
          <span>⚡ Key UI Features & Visual Widgets</span>
        </div>
        <div class="card-content">
          {features_content}
        </div>
      </div>

      <!-- 3. Techstack & Protocols -->
      <div class="info-card tech">
        <div class="card-title tech-title">
          <span>🔧 Tech Stack & Protocol Implementation</span>
        </div>
        <div class="card-content">
          {tech_content}
        </div>
      </div>

      <!-- 4. Operational Workflow -->
      <div class="info-card workflow">
        <div class="card-title workflow-title">
          <span>🛡️ Operational Workflow & Incident Action</span>
        </div>
        <div class="card-content">
          {workflow_content}
        </div>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div class="footer-left">
      <span class="footer-tag">MANDATE: CERT-In Section 70B Baseline</span>
      <span class="footer-sep">•</span>
      <span class="footer-tag">STANDARD: UX4G Core Violet</span>
      <span class="footer-sep">•</span>
      <span class="footer-tag">RETENTION: 180-Day TSDB</span>
      <span class="footer-sep">•</span>
      <span class="footer-tag">TARGET: 10.40.0.150</span>
    </div>
    <div class="footer-right">
      <span class="footer-attribution">Made by ICTD CSIR-SERC for CSIR with ❤️</span>
    </div>
  </div>
</div>
"""

TOTAL_SLIDES = 28

slides = []

# ==============================================================================
# SLIDE 1: COVER SLIDE
# ==============================================================================
slides.append(f"""
<div class="slide cover-slide">
  <div>
    <div class="cover-tricolor"></div>
    <div class="cover-header-meta">
      <div>
        <div style="font-size: 11pt; font-weight: 800; color: #38bdf8; font-family: monospace;">
          COUNCIL OF SCIENTIFIC & INDUSTRIAL RESEARCH (CSIR)
        </div>
        <div style="font-size: 10pt; color: #94a3b8; font-weight: 600;">
          Ministry of Science & Technology, Government of India
        </div>
      </div>
      <div style="text-align: right;">
        <span class="cover-badge" style="border-color: #10b981; color: #34d399;">RELEASE: v2.4.0 ENTERPRISE</span>
        <span class="cover-badge" style="border-color: #38bdf8; color: #38bdf8;">NOVEMBER 2026</span>
      </div>
    </div>

    <div class="cover-title-block">
      <div class="cover-main-title">
        Enterprise Firewall Telemetry &amp;<br>
        <span>Security Operations Center</span>
      </div>
      <div class="cover-subtitle">
        Comprehensive Technical Architecture, Interface Matrix, Forensics, and Menu-by-Menu Feature Presentation Manual conforming to Government of India UX4G Standards &amp; CERT-In Section 70B Baseline.
      </div>
      <div class="cover-badges-row">
        <span class="cover-badge">Fortinet FortiGate 600F</span>
        <span class="cover-badge">Check Point Quantum</span>
        <span class="cover-badge">Palo Alto PAN-OS</span>
        <span class="cover-badge">pfSense Plus</span>
        <span class="cover-badge">PostgreSQL 18</span>
        <span class="cover-badge">InfluxDB 2.7 TSDB</span>
        <span class="cover-badge">Vue 3.5 / Node.js 24</span>
      </div>
    </div>
  </div>

  <div class="cover-footer">
    <div>
      <div style="font-size: 10.5pt; font-weight: 800; color: #ffffff;">
        Developed by the Information and Communication Technology Division (ICTD)
      </div>
      <div style="font-size: 9pt; color: #94a3b8;">
        CSIR - Structural Engineering Research Centre (CSIR-SERC), CSIR Campus, Taramani, Chennai, India
      </div>
      <div style="font-size: 8.5pt; color: #f43f5e; font-weight: 700; margin-top: 4px;">
        Universal Institutional License v1.0 • "Made by ICTD CSIR-SERC for CSIR with ❤️"
      </div>
    </div>
    <div style="text-align: right; font-family: monospace; font-size: 9pt; color: #38bdf8;">
      SLIDE 01 / {TOTAL_SLIDES:02d}
    </div>
  </div>
</div>
""")

# ==============================================================================
# SLIDE 2: EXECUTIVE SUMMARY & STRATEGIC MISSION
# ==============================================================================
slides.append(f"""
<div class="slide">
  <div class="slide-header">
    <div class="header-left">
      <div class="tricolor-indicator"></div>
      <div class="institution-meta">
        <span class="badge-apex">CSIR - Structural Engineering Research Centre • ICTD</span>
        <span class="badge-sub">Executive Overview &amp; Mandate</span>
      </div>
    </div>
    <div class="header-center">
      <h2 class="slide-title">Executive Summary &amp; Platform Architecture</h2>
      <div class="slide-subtitle">Perimeter Telemetry, Forensic Flow Analytics, &amp; Statutory CERT-In Compliance</div>
    </div>
    <div class="header-right">
      <span class="route-pill">ARCH-OVERVIEW</span>
      <span class="slide-counter">SLIDE 02 / {TOTAL_SLIDES:02d}</span>
    </div>
  </div>

  <div class="full-slide-content">
    <div class="grid-3-col">
      <div class="arch-card">
        <div class="arch-card-header">
          <span>Strategic Mission</span>
          <span class="arch-card-badge">SINGLE HOST APPLIANCE</span>
        </div>
        <div class="arch-card-body">
          <ul>
            <li><strong>Single Pane of Glass</strong>: Unifies perimeter firewall hardware telemetry, NetFlow/IPFIX flow tracking, syslog streaming, and security rule audits into a single portal.</li>
            <li><strong>Turnkey Virtual Appliance</strong>: Pre-packaged standalone deployment (OVA/VMDK or Docker Compose) designed for high-security, air-gapped on-premises government datacenters.</li>
            <li><strong>Zero Commercial Royalties</strong>: Fully developed in-house by CSIR-SERC ICTD for CSIR and Indian public institutions with zero dependency on proprietary cloud SaaS.</li>
          </ul>
        </div>
      </div>

      <div class="arch-card">
        <div class="arch-card-header">
          <span>Perimeter Scope &amp; Target</span>
          <span class="arch-card-badge">FORTIGATE 600F</span>
        </div>
        <div class="arch-card-body">
          <ul>
            <li><strong>Primary Target Gateway</strong>: Fortinet FortiGate 600F Enterprise NGFW running FortiOS v7.4.x at CSIR-SERC Datacenter Chennai (Management IP: <code class="code-inline">10.10.3.15</code>).</li>
            <li><strong>Multi-Vendor Adapters</strong>: Engineered with modular collectors for Check Point Quantum, Palo Alto Networks, and pfSense gateway telemetry.</li>
            <li><strong>High-Throughput Core</strong>: Parallel sub-second 64-bit HC SNMP counter polling across 58 active physical SFP interfaces and 19 departmental 802.1Q VLANs.</li>
          </ul>
        </div>
      </div>

      <div class="arch-card">
        <div class="arch-card-header">
          <span>Compliance &amp; Storage</span>
          <span class="arch-card-badge">CERT-IN BASELINE</span>
        </div>
        <div class="arch-card-body">
          <ul>
            <li><strong>CERT-In Section 70B Mandate</strong>: Mandatory 180-day immutable rolling retention for all ingress/egress firewall flows, connection sessions, and security violation events.</li>
            <li><strong>Dual-Engine TSDB &amp; Relational</strong>: InfluxDB 2.7 TSDB for high-velocity Line-Protocol traffic logs paired with PostgreSQL 18 Alpine for persistent schema metadata.</li>
            <li><strong>UX4G Design System</strong>: Adheres to Government of India UX4G accessible violet glassmorphic standards with full WCAG 2.1 AA accessibility.</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="arch-card" style="margin-top: 15px;">
      <div class="arch-card-header">
        <span>Operational Benefits &amp; Technical Differentiators</span>
        <span class="arch-card-badge">KEY CAPABILITIES</span>
      </div>
      <div class="grid-4-col" style="margin-top: 5px;">
        <div style="font-size: 8pt; color: #cbd5e1;">
          <strong style="color: #38bdf8;">Exact IP Forensic Attribution:</strong><br>
          Tracks internal campus hostnames (<code class="code-inline">172.17.x.x</code>) and departments to exact internet IP targets, countries, and Layer 7 protocols.
        </div>
        <div style="font-size: 8pt; color: #cbd5e1;">
          <strong style="color: #34d399;">Illicit Traffic Mitigation:</strong><br>
          Instantly flags unauthorized P2P swarms (BitTorrent), pirated streaming (123Movies), crypto miners (Monero), and generates ready FortiOS quarantine CLI.
        </div>
        <div style="font-size: 8pt; color: #cbd5e1;">
          <strong style="color: #c084fc;">Environmental Hardware Telemetry:</strong><br>
          Continuous tracking of 4 internal DTS thermal zones, fan tachometers (6,600 RPM), and dual redundant AC PSU line voltages.
        </div>
        <div style="font-size: 8pt; color: #cbd5e1;">
          <strong style="color: #fbbf24;">Disaster Recovery &amp; OTA:</strong><br>
          Zero-loss OTA updates strictly preserving <code class="code-inline">/app/data</code>, with automated JSON backup generation and scheduled database snapshots.
        </div>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div class="footer-left">
      <span class="footer-tag">MANDATE: CERT-In Section 70B Baseline</span>
      <span class="footer-sep">•</span>
      <span class="footer-tag">FRAMEWORK: GOI UX4G Violet Standard</span>
      <span class="footer-sep">•</span>
      <span class="footer-tag">RETENTION: 180-Day Immutable TSDB</span>
    </div>
    <div class="footer-right">
      <span class="footer-attribution">Made by ICTD CSIR-SERC for CSIR with ❤️</span>
    </div>
  </div>
</div>
""")

# ==============================================================================
# SLIDE 3: FULL TECH STACK & SYSTEM ARCHITECTURE
# ==============================================================================
slides.append(f"""
<div class="slide">
  <div class="slide-header">
    <div class="header-left">
      <div class="tricolor-indicator"></div>
      <div class="institution-meta">
        <span class="badge-apex">CSIR - Structural Engineering Research Centre • ICTD</span>
        <span class="badge-sub">Technical Implementation</span>
      </div>
    </div>
    <div class="header-center">
      <h2 class="slide-title">Full Technology Stack &amp; Architectural Blueprint</h2>
      <div class="slide-subtitle">Modular Microservice Architecture, Decoupled Collectors, &amp; Dual Datastores</div>
    </div>
    <div class="header-right">
      <span class="route-pill">TECH-STACK</span>
      <span class="slide-counter">SLIDE 03 / {TOTAL_SLIDES:02d}</span>
    </div>
  </div>

  <div class="full-slide-content">
    <div class="grid-4-col">
      <div class="arch-card">
        <div class="arch-card-header">
          <span>Frontend UI Layer</span>
          <span class="arch-card-badge">SINGLE PAGE APP</span>
        </div>
        <div class="arch-card-body">
          <ul>
            <li><strong>Vue 3.5 &amp; Vite 6</strong>: Reactive Composition API with lightning-fast Hot Module Replacement (HMR).</li>
            <li><strong>Tailwind CSS 3.4</strong>: Custom Glassmorphic Violet theme designed according to UX4G India guidelines.</li>
            <li><strong>Pinia State Store</strong>: Centralized telemetry, auth, and alert state with sub-second WebSocket hydration.</li>
            <li><strong>Apache ECharts 5.6</strong>: Hardware speedometer gauges, interface area throughput, and protocol bars.</li>
            <li><strong>Lucide Vue Next</strong>: Semantic accessible iconography across all navigation and cards.</li>
          </ul>
        </div>
      </div>

      <div class="arch-card">
        <div class="arch-card-header">
          <span>Backend Core Engine</span>
          <span class="arch-card-badge">HIGH CONCURRENCY</span>
        </div>
        <div class="arch-card-body">
          <ul>
            <li><strong>Node.js 24 / 22 LTS</strong>: Asynchronous non-blocking runtime handling thousands of flow packets per second.</li>
            <li><strong>Express 4.21 &amp; TypeScript 5.8</strong>: Type-safe RESTful API routing, middleware authentication, and error traps.</li>
            <li><strong>WebSocket Server (<code class="code-inline">ws</code>)</strong>: Sub-second bi-directional telemetry broadcast to all connected SOC consoles.</li>
            <li><strong>Bcrypt &amp; Crypto</strong>: PBKDF2/Bcrypt passkey hashing and SHA-256 backup verification.</li>
          </ul>
        </div>
      </div>

      <div class="arch-card">
        <div class="arch-card-header">
          <span>Telemetry Collectors</span>
          <span class="arch-card-badge">MULTI-PROTOCOL</span>
        </div>
        <div class="arch-card-body">
          <ul>
            <li><strong>Parallel SNMP Engine</strong>: <code class="code-inline">net-snmp</code> subtree walkers querying FortiOS 64-bit HC counters every 15s.</li>
            <li><strong>Syslog UDP Ingest (1514 / 514)</strong>: High-velocity parsing of FortiOS, Check Point Gaia, PAN-OS, and pfSense logs.</li>
            <li><strong>NetFlow / IPFIX Collector (2055)</strong>: Binary flow decoding and Layer 7 protocol classification.</li>
            <li><strong>SNMP Trap Daemon (162)</strong>: Real-time trap catcher converting async alarms into actionable alerts.</li>
          </ul>
        </div>
      </div>

      <div class="arch-card">
        <div class="arch-card-header">
          <span>Storage &amp; Persistence</span>
          <span class="arch-card-badge">DUAL DATASTORE</span>
        </div>
        <div class="arch-card-body">
          <ul>
            <li><strong>InfluxDB 2.7 Alpine</strong>: High-throughput Line-Protocol ingestion with CERT-In 180-day retention bucket.</li>
            <li><strong>PostgreSQL 18.x Alpine</strong>: ACID relational persistence for normalized telemetry, users, RBAC, and backups.</li>
            <li><strong>Connection Pool (<code class="code-inline">pg</code>)</strong>: Resilient auto-reconnecting pool with fallback to local file persistence.</li>
            <li><strong>Local State (<code class="code-inline">/app/data</code>)</strong>: Atomic JSON snapshots ensuring zero configuration loss.</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="arch-card" style="margin-top: 15px;">
      <div class="arch-card-header">
        <span>Container Runtime &amp; Orchestration Topology</span>
        <span class="arch-card-badge">PRODUCTION DEPLOYMENT</span>
      </div>
      <div class="arch-card-body">
        <div class="grid-3-col">
          <div>
            <strong style="color: #38bdf8;">Container 1: Console App</strong><br>
            <span style="font-family: monospace; font-size: 8pt; color: #a78bfa;">firewall-monitoring-console (10.40.0.150:80)</span><br>
            Serves pre-compiled Vue 3.5 static bundle, REST API routes, WebSocket broadcasts, Syslog UDP 1514, and NetFlow UDP 2055.
          </div>
          <div>
            <strong style="color: #34d399;">Container 2: Relational DB</strong><br>
            <span style="font-family: monospace; font-size: 8pt; color: #a78bfa;">firewall-monitoring-db (10.40.0.151:5432)</span><br>
            PostgreSQL 18 Alpine engine with persistent volume <code class="code-inline">pgdata</code>. Manages accounts, compliance audits, and telemetry tables.
          </div>
          <div>
            <strong style="color: #c084fc;">Container 3: Time-Series TSDB</strong><br>
            <span style="font-family: monospace; font-size: 8pt; color: #a78bfa;">firewall-monitoring-tsdb (10.40.0.152:8086)</span><br>
            InfluxDB 2.7 Alpine engine with volume <code class="code-inline">influxdata</code>. Ingests high-velocity line-protocol telemetry with 180-day retention.
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div class="footer-left">
      <span class="footer-tag">MANDATE: CERT-In Section 70B Baseline</span>
      <span class="footer-sep">•</span>
      <span class="footer-tag">FRAMEWORK: GOI UX4G Violet Standard</span>
      <span class="footer-sep">•</span>
      <span class="footer-tag">RETENTION: 180-Day Immutable TSDB</span>
    </div>
    <div class="footer-right">
      <span class="footer-attribution">Made by ICTD CSIR-SERC for CSIR with ❤️</span>
    </div>
  </div>
</div>
""")

# ==============================================================================
# SLIDE 4: NETWORK PROTOCOL & PORT MATRIX
# ==============================================================================
slides.append(f"""
<div class="slide">
  <div class="slide-header">
    <div class="header-left">
      <div class="tricolor-indicator"></div>
      <div class="institution-meta">
        <span class="badge-apex">CSIR - Structural Engineering Research Centre • ICTD</span>
        <span class="badge-sub">Network Infrastructure</span>
      </div>
    </div>
    <div class="header-center">
      <h2 class="slide-title">Network Ingestion Topography &amp; Port Matrix</h2>
      <div class="slide-subtitle">Statutory Firewall Access Rules, Bidirectional Protocols, &amp; Routing Boundary</div>
    </div>
    <div class="header-right">
      <span class="route-pill">NETWORK-PORT-MATRIX</span>
      <span class="slide-counter">SLIDE 04 / {TOTAL_SLIDES:02d}</span>
    </div>
  </div>

  <div class="full-slide-content">
    <div class="arch-card">
      <div class="arch-card-header">
        <span>Production Firewall Network Access &amp; Port Requirements</span>
        <span class="arch-card-badge">TRAFFIC MATRIX</span>
      </div>
      <div class="arch-card-body">
        <table class="styled-table">
          <thead>
            <tr>
              <th>Port</th>
              <th>Protocol</th>
              <th>Direction</th>
              <th>Source / Target</th>
              <th>Description &amp; Operational Purpose</th>
              <th>Security Policy Rule</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>80 / 443</strong></td>
              <td>TCP</td>
              <td>Inbound</td>
              <td>Operator Workstations &rarr; Portal (10.40.0.150)</td>
              <td>Web Management Console, REST APIs, and Real-Time WebSocket Telemetry</td>
              <td>Allow HTTPS/HTTP Admin Access</td>
            </tr>
            <tr>
              <td><strong>161</strong></td>
              <td>UDP</td>
              <td>Outbound</td>
              <td>Portal Engine &rarr; Firewall Gateway (10.10.3.15)</td>
              <td>SNMPv2c / SNMPv3 parallel polling for 64-bit HC counters, CPU/RAM, and sensors</td>
              <td>SNMP Read-Only (Community / User)</td>
            </tr>
            <tr>
              <td><strong>162</strong></td>
              <td>UDP</td>
              <td>Inbound</td>
              <td>Firewall Gateway &rarr; Portal Engine (10.40.0.150)</td>
              <td>Asynchronous SNMP Trap listener for immediate hardware alarms, link state, and fan faults</td>
              <td>SNMP Trap Push to Telemetry Host</td>
            </tr>
            <tr>
              <td><strong>1514 / 514</strong></td>
              <td>UDP</td>
              <td>Inbound</td>
              <td>Firewall Perimeter &rarr; Portal Engine (10.40.0.150)</td>
              <td>High-velocity Syslog stream reception (FortiOS, Check Point, PAN-OS, pfSense)</td>
              <td>Syslog Remote Logging Enabled</td>
            </tr>
            <tr>
              <td><strong>2055</strong></td>
              <td>UDP</td>
              <td>Inbound</td>
              <td>Firewall Flow Engine &rarr; Portal Engine (10.40.0.150)</td>
              <td>NetFlow v5 / v9 &amp; IPFIX binary packet flow accounting and App-ID records</td>
              <td>NetFlow/IPFIX Export Configured</td>
            </tr>
            <tr>
              <td><strong>8086</strong></td>
              <td>TCP</td>
              <td>Internal</td>
              <td>Portal Backend &harr; InfluxDB TSDB (10.40.0.152)</td>
              <td>High-throughput Time-Series Line-Protocol batch ingestion and Flux forensic queries</td>
              <td>Isolated Macvlan Container Subnet</td>
            </tr>
            <tr>
              <td><strong>5432</strong></td>
              <td>TCP</td>
              <td>Internal</td>
              <td>Portal Backend &harr; PostgreSQL 18 (10.40.0.151)</td>
              <td>Relational persistence for user accounts, RBAC, compliance logs, and JSON backups</td>
              <td>Isolated Macvlan Container Subnet</td>
            </tr>
            <tr>
              <td><strong>123</strong></td>
              <td>UDP</td>
              <td>Outbound</td>
              <td>Telemetry Host &rarr; NPL / NIC Stratum-1 Clock</td>
              <td>NTP Indian National Atomic Clock synchronization mandated by CERT-In Section 70B</td>
              <td>Permit UDP 123 to Indian NTP</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="grid-2-col" style="margin-top: 15px;">
      <div class="arch-card">
        <div class="arch-card-header">
          <span>Network Topology Architecture</span>
          <span class="arch-card-badge">LINUX MACVLAN</span>
        </div>
        <div class="arch-card-body">
          <ul>
            <li><strong>Subnet Alignment</strong>: Deployed within <code class="code-inline">10.40.0.0/24</code> enterprise management VLAN, directly reachable from campus workstations without NAT translation bottlenecks.</li>
            <li><strong>Deterministic IP Allocation</strong>: Fixed container IP addresses (<code class="code-inline">10.40.0.150</code> Console, <code class="code-inline">10.40.0.151</code> PostgreSQL, <code class="code-inline">10.40.0.152</code> InfluxDB).</li>
            <li><strong>Direct Gateway Peering</strong>: Sub-millisecond latency to monitored perimeter firewalls via institutional core routing switch (<code class="code-inline">10.40.0.1</code>).</li>
          </ul>
        </div>
      </div>

      <div class="arch-card">
        <div class="arch-card-header">
          <span>Security Hardening &amp; Compliance Baseline</span>
          <span class="arch-card-badge">HARDENED KERNEL</span>
        </div>
        <div class="arch-card-body">
          <ul>
            <li><strong>Minimal Alpine Container Base</strong>: Container images stripped of unused compilers and debugging utilities for minimal attack surface.</li>
            <li><strong>Perimeter Defense Binding</strong>: Automated Linux host firewall configuration (<code class="code-inline">ufw</code> / <code class="code-inline">firewalld</code>) permitting only designated telemetry ports.</li>
            <li><strong>Non-Root Principle</strong>: Telemetry collectors run with bounded Linux capabilities (<code class="code-inline">CAP_NET_BIND_SERVICE</code>) preventing privileged escalation.</li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div class="footer-left">
      <span class="footer-tag">MANDATE: CERT-In Section 70B Baseline</span>
      <span class="footer-sep">•</span>
      <span class="footer-tag">FRAMEWORK: GOI UX4G Violet Standard</span>
      <span class="footer-sep">•</span>
      <span class="footer-tag">RETENTION: 180-Day Immutable TSDB</span>
    </div>
    <div class="footer-right">
      <span class="footer-attribution">Made by ICTD CSIR-SERC for CSIR with ❤️</span>
    </div>
  </div>
</div>
""")

# ==============================================================================
# SLIDE 5: SCREENSHOT 1 - LOGIN
# ==============================================================================
slides.append(generate_screenshot_slide(
    5, TOTAL_SLIDES,
    "Menu 1: Portal Authentication & Zero-Trust Access Gate",
    "Secure Role-Based Access Control, Institutional Branding, & National Clock Verification",
    "ROUTE: /login", "login",
    """<ul>
      <li><strong>Target Personas</strong>: Super Administrators, SOC Analysts, Network Engineers, and CERT-In Compliance Auditors.</li>
      <li><strong>Core Purpose</strong>: Serves as the zero-trust entry gate to the operations console, preventing unauthenticated access while verifying the operator's clearance and role level.</li>
      <li><strong>Operational Context</strong>: Displays institutional identity, dynamic threat advisory baseline (<code class="code-inline">MONITORED</code>), and atomic clock synchronization status before login.</li>
    </ul>""",
    """<ul>
      <li><strong>Institutional Header</strong>: Dual CSIR-SERC logo, Apex Body banner, and Division title.</li>
      <li><strong>Glassmorphic Card</strong>: High-security authentication panel with username and passkey fields.</li>
      <li><strong>NTP Sync Pill</strong>: Real-time badge certifying synchronization with NPL Indian Atomic Clock.</li>
      <li><strong>Threat Advisory Bar</strong>: Active perimeter defense status (<code class="code-inline">MONITORED: Normal Baseline</code>).</li>
    </ul>""",
    """<ul>
      <li><strong>Bcrypt Passkey Validation</strong>: Hashes credentials with salted Bcrypt and matches against PostgreSQL <code class="code-inline">users</code> table.</li>
      <li><strong>Stateless Session Tokens</strong>: Generates cryptographic bearer tokens with configurable idle expiration.</li>
      <li><strong>Endpoint</strong>: <code class="code-inline">POST /api/auth/login</code> with automatic brute-force throttling after 5 attempts.</li>
    </ul>""",
    """<ul>
      <li>1. Enter verified institutional administrative credentials (Superadmin or Operator).</li>
      <li>2. Verify NPL atomic clock synchronization indicator is green before operational login.</li>
      <li>3. Session routes to Executive Dashboard or Setup Wizard if initial configuration is pending.</li>
    </ul>"""
))

# ==============================================================================
# SLIDE 6: SCREENSHOT 2 - SETUP WIZARD
# ==============================================================================
slides.append(generate_screenshot_slide(
    6, TOTAL_SLIDES,
    "Menu 2: First-Time Setup Wizard (Virtual Appliance Ready)",
    "Frictionless 4-Step Out-of-the-Box Provisioning for Virtual Machines & Bare-Metal Hosts",
    "ROUTE: /wizard", "wizard",
    """<ul>
      <li><strong>Target Personas</strong>: Datacenter Engineers and Systems Administrators commissioning the VM.</li>
      <li><strong>Core Purpose</strong>: Guides operators through initial provisioning upon first boot of the OVA/VMDK image or clean container deployment, locking credentials and branding.</li>
      <li><strong>Operational Context</strong>: Ensures telemetry polling targets, custom institutional logos, and administrative passkeys are initialized without requiring manual command-line editing.</li>
    </ul>""",
    """<ul>
      <li><strong>Step 1: Branding & Identity</strong>: Custom organization name, division, portal title, and SVG/PNG logo upload.</li>
      <li><strong>Step 2: Primary Firewall Target</strong>: Monitored IP (<code class="code-inline">10.10.3.15</code>), vendor selection, and SNMP community.</li>
      <li><strong>Step 3: Port Ingestion Architecture</strong>: Verification of Syslog UDP 1514 and NetFlow UDP 2055 listeners.</li>
      <li><strong>Step 4: Superadmin Credentials</strong>: Initial passkey creation with zero default backdoor passwords.</li>
    </ul>""",
    """<ul>
      <li><strong>Persistence Handler</strong>: Writes atomic JSON configuration to <code class="code-inline">/app/data/settings.json</code> and PostgreSQL <code class="code-inline">firewall_settings</code>.</li>
      <li><strong>Dynamic Logo Storage</strong>: Base64 uploads processed and saved directly into persistent <code class="code-inline">/app/uploads/</code>.</li>
      <li><strong>Endpoint</strong>: <code class="code-inline">POST /api/settings/wizard/complete</code> triggers runtime collector engine initialization.</li>
    </ul>""",
    """<ul>
      <li>1. Complete Step 1 by confirming institutional identity details and uploading official logo.</li>
      <li>2. Enter firewall management IP and test SNMP connectivity before advancing.</li>
      <li>3. Set strong superadmin passkey and click <strong>"Launch Enterprise Command Center"</strong> to lock wizard.</li>
    </ul>"""
))

# ==============================================================================
# SLIDE 7: SCREENSHOT 3 - EXECUTIVE DASHBOARD
# ==============================================================================
slides.append(generate_screenshot_slide(
    7, TOTAL_SLIDES,
    "Menu 3: Executive Telemetry Dashboard & Real-Time Cockpit",
    "Continuous Perimeter Observability, Speedometer Gauges, & Live Ingest Tracking",
    "ROUTE: /dashboard", "dashboard",
    """<ul>
      <li><strong>Target Personas</strong>: Chief Information Security Officers (CISOs), NOC Directors, and Senior SOC Leads.</li>
      <li><strong>Core Purpose</strong>: Serves as the primary operational command center providing at-a-glance visibility into perimeter throughput, peak ingest velocities, and hardware health.</li>
      <li><strong>Operational Context</strong>: Designed for large SOC video walls with hands-free auto-refresh intervals (5s, 10s, 30s, 60s) and live pulsing connection heartbeat.</li>
    </ul>""",
    """<ul>
      <li><strong>Real-Time Bandwidth Speedometers</strong>: High-precision ECharts gauges for Incoming (Mbps) & Outgoing (Mbps).</li>
      <li><strong>Peak Ingest Tracker</strong>: Displays historic daily peak line rates and saturation timestamps.</li>
      <li><strong>Automated Speed Test Gauge</strong>: 15-minute countdown card tracking NIXI / NIC National Gateway latency.</li>
      <li><strong>Operational Health Strip</strong>: CPU core utilization, memory pool percentage, and active VPN tunnel counts.</li>
    </ul>""",
    """<ul>
      <li><strong>WebSocket Streaming</strong>: Live push via <code class="code-inline">/ws/telemetry</code> with sub-second delta updates.</li>
      <li><strong>Rate Delta Engine</strong>: Computes 64-bit HC octet differences between consecutive 15s SNMP poll intervals.</li>
      <li><strong>APIs</strong>: <code class="code-inline">GET /api/telemetry/summary</code> and <code class="code-inline">GET /api/speedtest</code> with automatic failover caching.</li>
    </ul>""",
    """<ul>
      <li>1. Monitor live speedometer gauges during high-demand scientific computing and data transfers.</li>
      <li>2. Observe automated speed test metrics to identify internet service provider (ISP) peering degradations.</li>
      <li>3. Click any alert badge or throughput spike to jump directly into forensic flow analysis.</li>
    </ul>"""
))

# ==============================================================================
# SLIDE 8: SCREENSHOT 4 - BENTO TRAFFIC ANALYZER
# ==============================================================================
slides.append(generate_screenshot_slide(
    8, TOTAL_SLIDES,
    "Menu 4: Bento-Style Traffic & Flow Intelligence Analyzer",
    "Exact Source & Destination IP Attribution, Ingress/Egress Volume, & Layer-7 App-ID",
    "ROUTE: /traffic", "bento",
    """<ul>
      <li><strong>Target Personas</strong>: Network Forensic Investigators, Traffic Analysts, and Cyber Defense Specialists.</li>
      <li><strong>Core Purpose</strong>: Eliminates network blind spots by resolving packet flows to exact internal campus workstations (<code class="code-inline">10.x.x.x</code> / <code class="code-inline">172.17.x.x</code>), departments, and remote internet domains.</li>
      <li><strong>Operational Context</strong>: Provides immediate forensic answers to high bandwidth consumers, anomalous data transfers, and unexpected foreign destination connections.</li>
    </ul>""",
    """<ul>
      <li><strong>Top Outbound Uploads (Egress)</strong>: Ranked bento cards tracking internal hostnames, VLANs, destination IPs, and country flags.</li>
      <li><strong>Top Inbound Downloads (Ingress)</strong>: Tracking external content delivery networks delivering data into local workstations.</li>
      <li><strong>Bidirectional Split Bar</strong>: Proportional visual ratio comparing total downloaded vs uploaded gigabytes.</li>
      <li><strong>Layer-7 Application Identification</strong>: Protocol distribution for HTTPS, OpenMPI, Ansys FEA, and Lustre Sync.</li>
    </ul>""",
    """<ul>
      <li><strong>InfluxDB Flux Engine</strong>: Aggregates millions of NetFlow records via <code class="code-inline">from(bucket: "firewall_logs")</code>.</li>
      <li><strong>Institutional IP Resolver</strong>: Microservice resolving internal IP subnets to departments (ICTD, BKMD, ASTAR, SMSL).</li>
      <li><strong>API</strong>: <code class="code-inline">GET /api/traffic/bento</code> with 5-minute cached rolling aggregations.</li>
    </ul>""",
    """<ul>
      <li>1. Inspect Top Outbound Uploads to detect unexpected data exfiltration or massive uploads to external clouds.</li>
      <li>2. Examine foreign country flags to identify unauthorized traffic routed to high-risk geopolitical zones.</li>
      <li>3. Click any workstation IP to launch a dedicated forensic dossier.</li>
    </ul>"""
))

# ==============================================================================
# SLIDE 9: SCREENSHOT 5 - UNAPPROVED APPS MONITOR
# ==============================================================================
slides.append(generate_screenshot_slide(
    9, TOTAL_SLIDES,
    "Menu 5: Unapproved Applications & Illicit Activity Monitor",
    "Real-Time Detection of BitTorrent, Leechers, Pirated Streaming, Botnets, & Crypto Miners",
    "ROUTE: /traffic/unapproved", "unapproved",
    """<ul>
      <li><strong>Target Personas</strong>: Incident Responders, Information Security Officers, and Compliance Auditors.</li>
      <li><strong>Core Purpose</strong>: Uncovers and isolates campus workstations generating or consuming unauthorized network services that violate institutional acceptable use policies (AUP).</li>
      <li><strong>Operational Context</strong>: Focuses strictly on illicit bandwidth wasters, copyright violation torrent swarms, trojan command-and-control beacons, and circumvention proxies.</li>
    </ul>""",
    """<ul>
      <li><strong>Threat Classification Cards</strong>: Categorized tracking for BitTorrent-P2P, IDM multi-stream leechers, 123Movies pirated streaming, Mirai botnet C2s, Monero XMR miners, and Psiphon proxies.</li>
      <li><strong>Top Offending Devices Bento Cards</strong>: Highlights internal device IPs, system hostnames, department, violation counts, and wasted megabytes.</li>
      <li><strong>Live Threat Pulse</strong>: Visual alert indicators flagging active unauthorized outbound attempts.</li>
    </ul>""",
    """<ul>
      <li><strong>Deep Packet Inspection (DPI)</strong>: Correlates Layer-7 App-ID signatures from FortiOS flow records.</li>
      <li><strong>Subnet Risk Scoring</strong>: Aggregates violation counts per departmental VLAN to highlight compromised laboratories.</li>
      <li><strong>API</strong>: <code class="code-inline">GET /api/traffic/unapproved/stats</code> backed by InfluxDB time-series queries.</li>
    </ul>""",
    """<ul>
      <li>1. Review the Top Offending Workstations to identify repeat violators within research divisions.</li>
      <li>2. Click any offending workstation to view its complete forensic incident history.</li>
      <li>3. Cross-reference violation categories with CERT-In statutory breach reporting guidelines.</li>
    </ul>"""
))

# ==============================================================================
# SLIDE 10: SCREENSHOT 6 - FORENSIC INCIDENT REGISTER
# ==============================================================================
slides.append(generate_screenshot_slide(
    10, TOTAL_SLIDES,
    "Menu 6: Live Forensic Incident Register & Policy Drop Table",
    "Structured Audit Log Matching Internal Offender IPs to Applied FortiOS Security Rules",
    "ROUTE: /traffic/unapproved#incidents", "violations_table",
    """<ul>
      <li><strong>Target Personas</strong>: SOC Forensics Specialists and Network Security Operations Engineers.</li>
      <li><strong>Core Purpose</strong>: Provides an indisputable, timestamped audit register of every unauthorized network attempt intercepted at the perimeter firewall.</li>
      <li><strong>Operational Context</strong>: Proves whether FortiOS perimeter security rules successfully blocked the violation or if traffic bypassed filters, supporting disciplinary and legal investigations.</li>
    </ul>""",
    """<ul>
      <li><strong>Forensic Incident Table</strong>: Columns for Exact Timestamp, Internal Device IP, Hostname, Department, Destination Endpoint, Detected Threat Signature, and Ingested Byte Volume.</li>
      <li><strong>FortiOS Policy Audit Badge</strong>: Displays the exact rule applied (<code class="code-inline">SERC_IPS_Threat_Mitigation</code>, <code class="code-inline">SERC_P2P_Drop</code>).</li>
      <li><strong>Drop Status Pill</strong>: Visual confirmation (<code class="code-inline">BLOCKED / DROPPED</code>) verifying threat neutralization.</li>
      <li><strong>One-Click CERT-In CSV Export</strong>: Generates compliant incident log tables for external regulatory submission.</li>
    </ul>""",
    """<ul>
      <li><strong>Real-Time Correlation</strong>: Links high-velocity syslog records with NetFlow IPFIX metadata.</li>
      <li><strong>Client-Side Filtering</strong>: Instant text filtering by IP, department, threat category, or policy name.</li>
      <li><strong>API</strong>: <code class="code-inline">GET /api/traffic/unapproved/query?limit=100</code> with full server-side pagination.</li>
    </ul>""",
    """<ul>
      <li>1. Filter table by threat type (e.g. <code class="code-inline">BitTorrent</code> or <code class="code-inline">Mirai-Botnet-C2</code>).</li>
      <li>2. Verify that applied FortiGate security policy shows <code class="code-inline">BLOCKED</code>.</li>
      <li>3. Click <strong>"Export CERT-In CSV"</strong> to download forensic records for formal reporting.</li>
    </ul>"""
))

# ==============================================================================
# SLIDE 11: SCREENSHOT 7 - DEVICE FORENSIC DOSSIER
# ==============================================================================
slides.append(generate_screenshot_slide(
    11, TOTAL_SLIDES,
    "Menu 7: Device Forensic Dossier & FortiOS Quarantine CLI",
    "Workstation Violation History with Ready-to-Run Perimeter Isolation Commands",
    "SUB-MENU: DEVICE-DOSSIER", "device_dossier",
    """<ul>
      <li><strong>Target Personas</strong>: Incident Handlers, Firewall Administrators, and SOC Incident Commanders.</li>
      <li><strong>Core Purpose</strong>: Offers a single-click deep dive into a flagged workstation's forensic record and provides immediate command-line snippets to isolate the machine on the FortiGate firewall.</li>
      <li><strong>Operational Context</strong>: Dramatically reduces Mean Time to Remediate (MTTR) by eliminating the need to look up MAC addresses, switch ports, or quarantine syntax during active malware outbreaks.</li>
    </ul>""",
    """<ul>
      <li><strong>Device Hardware Profile</strong>: Target IP, MAC address, Hostname, Department, VLAN, and First/Last seen timestamps.</li>
      <li><strong>Cumulative Bandwidth Waste</strong>: Metric gauges displaying total megabytes consumed by illicit applications.</li>
      <li><strong>Recent Violation Timeline</strong>: Sequential log of all illicit connection attempts with ports and domains.</li>
      <li><strong>Ready FortiOS Quarantine CLI</strong>: Formatted CLI block (<code class="code-inline">diagnose user quarantine add src4 ...</code>) with one-click clipboard copy.</li>
    </ul>""",
    """<ul>
      <li><strong>Dynamic Script Generator</strong>: Generates exact FortiOS syntax mapped to target IP and quarantine timeout.</li>
      <li><strong>Cross-Store Hydration</strong>: Correlates InfluxDB historical records with PostgreSQL device inventory.</li>
      <li><strong>API</strong>: <code class="code-inline">GET /api/traffic/unapproved/device/:ip</code> delivering complete device telemetry.</li>
    </ul>""",
    """<ul>
      <li>1. Click an offender IP from any table or card to trigger the modal dossier.</li>
      <li>2. Review the incident timeline to confirm whether the device is infected with malware or running leechers.</li>
      <li>3. Click <strong>"Copy Quarantine CLI"</strong>, paste into FortiGate SSH console, and isolate the workstation instantly.</li>
    </ul>"""
))

# ==============================================================================
# SLIDE 12: SCREENSHOT 8 - SNMP TELEMETRY COCKPIT
# ==============================================================================
slides.append(generate_screenshot_slide(
    12, TOTAL_SLIDES,
    "Menu 8: FortiGate SNMP Telemetry & Hardware Cockpit",
    "Environmental Thermal Zones, Cooling Fans, Dual Redundant PSUs, & UTM Threat Counters",
    "ROUTE: /snmp", "snmp",
    """<ul>
      <li><strong>Target Personas</strong>: Datacenter Facilities Engineers, Hardware Maintenance Leads, and Network Infrastructure Ops.</li>
      <li><strong>Core Purpose</strong>: Monitors physical chassis health, thermal stability, dual power supply redundancy, and security processor resource consumption on the FortiGate 600F appliance.</li>
      <li><strong>Operational Context</strong>: Prevents catastrophic hardware outages, detects cooling failures, and tracks cryptographic NP6/CP9 coprocessor loads in high-throughput campus networks.</li>
    </ul>""",
    """<ul>
      <li><strong>Core Resource Gauges</strong>: Multi-core CPU utilization (2-3%), 16.3 GB physical RAM pool (36% utilized), 13,700+ active state sessions, and active VPN tunnels.</li>
      <li><strong>Thermal Zone Matrix</strong>: CPU DTS0 (46°C), Board Center TD1 (37°C), Chassis Exhaust TD2 (44°C), NP6 Accelerator TR3 (41°C).</li>
      <li><strong>Cooling Tachometers &amp; PSUs</strong>: High-speed fan array tachometers (6,600 / 6,400 RPM) and Dual AC line inputs (226V / 230V).</li>
      <li><strong>UTM Threat Counters</strong>: Real-time counter of neutralized malware, IPS exploit blocks, and botnet C2 intercepts.</li>
    </ul>""",
    """<ul>
      <li><strong>Subtree SNMP Walker</strong>: Queries Fortinet Enterprise MIB (<code class="code-inline">1.3.6.1.4.1.12356.101</code>) in parallel threads.</li>
      <li><strong>Persistent Snapshot Pipeline</strong>: Stores polled metric records into PostgreSQL <code class="code-inline">telemetry_metrics</code> on every 15s cycle.</li>
      <li><strong>API</strong>: <code class="code-inline">GET /api/snmp/telemetry</code> and <code class="code-inline">GET /api/snmp/sensors</code>.</li>
    </ul>""",
    """<ul>
      <li>1. Monitor thermal temperatures to detect datacenter precision cooling failures before CPU thermal throttling.</li>
      <li>2. Verify dual PSU voltage health to ensure power redundancy across independent electrical phases.</li>
      <li>3. Observe state table session capacity to prevent firewall memory exhaustion during volumetric spikes.</li>
    </ul>"""
))

# ==============================================================================
# SLIDE 13: SCREENSHOT 9 - ALL 58 INTERFACES MATRIX
# ==============================================================================
slides.append(generate_screenshot_slide(
    13, TOTAL_SLIDES,
    "Menu 9: Complete 58-Interface Physical & SFP Matrix",
    "Full Line-Rate Telemetry across Physical 1G/10G/25G SFP Ports, Management, & HA Links",
    "ROUTE: /snmp#matrix", "all_interfaces",
    """<ul>
      <li><strong>Target Personas</strong>: Network Infrastructure Architects, Datacenter Ops, and Core Switching Engineers.</li>
      <li><strong>Core Purpose</strong>: Provides an exhaustive operational status grid for all 58 physical ports and links on the perimeter FortiGate appliance, identifying link drops, queue discards, and duplex mismatches.</li>
      <li><strong>Operational Context</strong>: Essential during fiber link maintenance, supercomputing aggregation upgrades, and WAN ISP peering troubleshooting.</li>
    </ul>""",
    """<ul>
      <li><strong>Physical Port Catalog</strong>: Ports 1–32 (1G Copper, 10G SFP+, and 25G SFP28 high-speed cluster links), mgmt, ha1, ha2, dmz.</li>
      <li><strong>Interface Telemetry Metrics</strong>: Line rate throughput (<code class="code-inline">inBps / outBps</code>), packet velocities (pps), cumulative data volumes (TB), and MTU (1500/9000).</li>
      <li><strong>Queue Discard Counters</strong>: Explicit tracking of ingress/egress queue drops indicating link saturation.</li>
      <li><strong>Operational State Badges</strong>: Color-coded pills indicating Admin Status (UP/DOWN) and Link Operational Status.</li>
    </ul>""",
    """<ul>
      <li><strong>RFC 1213 MIB-II Engine</strong>: Polling <code class="code-inline">ifTable</code> and <code class="code-inline">ifXTable</code> 64-bit HC counters (<code class="code-inline">ifHCInOctets</code>, <code class="code-inline">ifHCOutOctets</code>).</li>
      <li><strong>Delta Rate Calculator</strong>: Measures counter progression against exact hardware timestamp deltas.</li>
      <li><strong>API</strong>: <code class="code-inline">GET /api/snmp/interfaces</code> providing structured array of all 58 interfaces.</li>
    </ul>""",
    """<ul>
      <li>1. Scan operational status badges to verify high-availability heartbeat links (ha1/ha2) are healthy.</li>
      <li>2. Inspect high-capacity 25G supercomputing aggregation ports for packet discards during heavy simulations.</li>
      <li>3. Click any physical interface row to open a granular interface dossier modal.</li>
    </ul>"""
))

# ==============================================================================
# SLIDE 14: SCREENSHOT 10 - DEPARTMENTAL VLAN FILTERING
# ==============================================================================
slides.append(generate_screenshot_slide(
    14, TOTAL_SLIDES,
    "Menu 10: Departmental VLAN Interface Telemetry Filtering",
    "Granular Segmentation & Telemetry Across 19 CSIR-SERC Institutional Subnets",
    "ROUTE: /snmp#vlans", "vlans",
    """<ul>
      <li><strong>Target Personas</strong>: Departmental IT Officers, Laboratory Network Admins, and Bandwidth Accounting Staff.</li>
      <li><strong>Core Purpose</strong>: Isolates and analyzes traffic consumption across specific departmental 802.1Q subnets to determine resource utilization and ensure fair network distribution.</li>
      <li><strong>Operational Context</strong>: Enables division-by-division accountability across scientific laboratories, supercomputing clusters, administrative branches, and guest facilities.</li>
    </ul>""",
    """<ul>
      <li><strong>Departmental Subnet Navigation</strong>: Quick-select pills for Central Datacenter (VLAN 2), ICTD (VLAN 11), BKMD (VLAN 12), ASTAR Lab (VLAN 13), SMSL (VLAN 14), Param-SERC HPC (VLAN 84), etc.</li>
      <li><strong>Subnet Metric Breakdown</strong>: Ingress throughput, egress throughput, active host counts, and cumulative gigabytes per department.</li>
      <li><strong>Bandwidth Waste Ratio</strong>: Percentage of departmental bandwidth consumed by unauthorized services.</li>
      <li><strong>VPN Tunnel Tiers</strong>: Dedicated telemetry for Remote SSL-VPN Portal and Academic Peering links.</li>
    </ul>""",
    """<ul>
      <li><strong>802.1Q Sub-Interface Discovery</strong>: Dynamically maps FortiOS virtual interfaces to parent physical ports.</li>
      <li><strong>Trie Subnet Engine</strong>: Matches client IP addresses against departmental CIDR blocks (<code class="code-inline">172.17.0.0/16</code>).</li>
      <li><strong>API</strong>: <code class="code-inline">GET /api/telemetry/interfaces/detailed</code> with categorical VLAN filters.</li>
    </ul>""",
    """<ul>
      <li>1. Select a departmental VLAN pill (e.g., <code class="code-inline">HPC-Cluster - VLAN 84</code>) to filter the interface matrix.</li>
      <li>2. Compare high-performance computing data transfers against administrative office bandwidth.</li>
      <li>3. Identify departmental subnets experiencing abnormally high bandwidth waste ratios.</li>
    </ul>"""
))

# ==============================================================================
# SLIDE 15: SCREENSHOT 11 - INTERFACE DRILLDOWN MODAL
# ==============================================================================
slides.append(generate_screenshot_slide(
    15, TOTAL_SLIDES,
    "Menu 11: One-Click Deep Interface Dossier Modal",
    "Comprehensive Hardware Profile, Active Connected Hosts, & Traffic Ratio Breakdown",
    "SUB-MENU: INTERFACE-DOSSIER", "interface_drilldown",
    """<ul>
      <li><strong>Target Personas</strong>: Network Engineers, Systems Diagnostics Technicians, and Troubleshooting Staff.</li>
      <li><strong>Core Purpose</strong>: Delivers a holistic engineering profile of any selected physical port or VLAN interface, correlating hardware metrics with the exact connected devices utilizing it.</li>
      <li><strong>Operational Context</strong>: Used during interface congestion troubleshooting to determine exactly which internal devices are saturating the link.</li>
    </ul>""",
    """<ul>
      <li><strong>Hardware Profile Card</strong>: MAC address, MTU size, duplex mode (Full Duplex), optical transceiver type, and error rates.</li>
      <li><strong>Traffic Ratio Split Bar</strong>: High-visibility proportion gauge dividing General Traffic vs. Unofficial/Illicit Traffic.</li>
      <li><strong>Connected Devices Register</strong>: Structured table listing each connected host's IP, hostname, department, and live bandwidth.</li>
      <li><strong>Flagged Incidents Sub-Table</strong>: Specific illicit traffic events detected on this interface with FortiOS drop status.</li>
    </ul>""",
    """<ul>
      <li><strong>Cross-Correlated Analytics</strong>: Fuses SNMP interface octets with NetFlow host IP flow records.</li>
      <li><strong>Reactive Modal State</strong>: Pinia store hydration with automatic polling cancellation upon modal close.</li>
      <li><strong>API</strong>: <code class="code-inline">GET /api/telemetry/interfaces/:name/drilldown</code>.</li>
    </ul>""",
    """<ul>
      <li>1. Click on any physical port (e.g. <code class="code-inline">port10 - SERC_LAN_QTMNET_2024</code>) in the matrix.</li>
      <li>2. Inspect the General vs Unofficial bandwidth ratio split bar to verify link hygiene.</li>
      <li>3. Review the Active Connected Workstations table to locate the specific device causing link saturation.</li>
    </ul>"""
))

# ==============================================================================
# SLIDE 16: SCREENSHOT 12 - FIREWALL POLICIES & SHADOW ANALYZER
# ==============================================================================
slides.append(generate_screenshot_slide(
    16, TOTAL_SLIDES,
    "Menu 12: Security Policy Matrix & Shadow Analyzer",
    "Rule Catalog, 64-Bit Hit Counters, Unused Policy Detection, & Shadow Conflict Auditing",
    "ROUTE: /policies", "policies",
    """<ul>
      <li><strong>Target Personas</strong>: Firewall Policy Administrators, Security Auditors, and Network Compliance Officers.</li>
      <li><strong>Core Purpose</strong>: Audits active FortiOS firewall security rules to identify obsolete policies, shadow/redundant rules that never trigger, and track cumulative traffic across security rules.</li>
      <li><strong>Operational Context</strong>: Essential for firewall hygiene, minimizing rule bloat, accelerating packet processing, and satisfying CERT-In periodic security audit requirements.</li>
    </ul>""",
    """<ul>
      <li><strong>Policy Rule Catalog</strong>: Rule ID, Policy Name, Source/Destination Interfaces, Service Groups, Action (Accept/Deny), and NAT status.</li>
      <li><strong>64-Bit Hit &amp; Byte Counters</strong>: High-capacity cumulative packet and byte accounting per policy rule.</li>
      <li><strong>Last-Active Timestamp</strong>: Shows exact elapsed time since rule was last triggered (e.g. 1 second ago vs 101 days ago).</li>
      <li><strong>Shadow Rule Warning Badges</strong>: Visual indicators highlighting rules rendered ineffective by preceding rules.</li>
    </ul>""",
    """<ul>
      <li><strong>Policy Shadow Engine</strong>: Mathematical graph analyzer matching IP prefixes, port ranges, and protocol intersections.</li>
      <li><strong>FortiOS Policy Walker</strong>: Queries <code class="code-inline">fgPolicyEntry</code> MIB (<code class="code-inline">1.3.6.1.4.1.12356.101.5.1</code>).</li>
      <li><strong>API</strong>: <code class="code-inline">GET /api/rules/:firewallId</code> and <code class="code-inline">GET /api/policy/analysis/:firewallId</code>.</li>
    </ul>""",
    """<ul>
      <li>1. Review top policies by data volume to ensure critical research clusters are routed correctly.</li>
      <li>2. Identify rules with zero hit counts or long inactive periods (&gt;90 days) for scheduled decommissioning.</li>
      <li>3. Resolve highlighted shadow conflicts to ensure strict perimeter rule enforcement.</li>
    </ul>"""
))

# ==============================================================================
# SLIDE 17: SCREENSHOT 13 - LIVE SYSLOG STREAM
# ==============================================================================
slides.append(generate_screenshot_slide(
    17, TOTAL_SLIDES,
    "Menu 13: High-Velocity Live Syslog Ingestion Console",
    "Sub-Second Live Syslog Receiver, Circular Buffer, & Real-Time Security Log Stream",
    "ROUTE: /logs", "syslog",
    """<ul>
      <li><strong>Target Personas</strong>: Tier-1 SOC Operators, Incident Responders, and Systems Engineers.</li>
      <li><strong>Core Purpose</strong>: Delivers an uninterrupted, high-velocity stream of raw and normalized firewall syslog events as they occur across perimeter hardware interfaces.</li>
      <li><strong>Operational Context</strong>: Used during live incident triage, zero-day threat investigations, and hardware fault diagnostics.</li>
    </ul>""",
    """<ul>
      <li><strong>Live Log Stream Console</strong>: Terminal-style real-time log ticker with sub-second WebSocket updates.</li>
      <li><strong>Pause / Resume Switch</strong>: Allows operators to freeze the live display to examine a specific packet trace without dropping incoming data.</li>
      <li><strong>Severity Badges</strong>: Color-coded severity indicators (<code class="code-inline">INFO</code>, <code class="code-inline">NOTICE</code>, <code class="code-inline">WARNING</code>, <code class="code-inline">CRITICAL</code>).</li>
      <li><strong>Instant Regex Search</strong>: Live text filter across raw syslog payloads, source IPs, hostnames, and rule names.</li>
    </ul>""",
    """<ul>
      <li><strong>UDP Ingestion Engine</strong>: Dedicated asynchronous UDP sockets listening on ports <code class="code-inline">1514</code> and <code class="code-inline">514</code>.</li>
      <li><strong>Circular Ring Buffer</strong>: In-memory sliding window maintaining the latest 5,000 logs for zero-latency UI rendering.</li>
      <li><strong>Dual Storage Forwarder</strong>: Simultaneously batches lines to InfluxDB TSDB and appends to <code class="code-inline">/app/data/syslog.log</code>.</li>
    </ul>""",
    """<ul>
      <li>1. Toggle the <strong>Pause Streaming</strong> switch when observing a flurry of security events.</li>
      <li>2. Enter a target IP or port in the instant filter bar to isolate related connection attempts.</li>
      <li>3. Resume streaming to return to real-time live monitoring.</li>
    </ul>"""
))

# ==============================================================================
# SLIDE 18: SCREENSHOT 14 - VLAN SUBNET TELEMETRY MATRIX
# ==============================================================================
slides.append(generate_screenshot_slide(
    18, TOTAL_SLIDES,
    "Menu 14: Departmental VLAN Subnet Telemetry Matrix",
    "Institutional CIDR Subnet Blocks, Throughput Aggregations, & Threat Density",
    "ROUTE: /logs#subnets", "vlans_matrix",
    """<ul>
      <li><strong>Target Personas</strong>: Network Operations Managers and Institutional Security Coordinators.</li>
      <li><strong>Core Purpose</strong>: Aggregates real-time packet telemetry into institutional subnet blocks, mapping network flow volume and security incidents directly to physical campus buildings.</li>
      <li><strong>Operational Context</strong>: Provides high-level situational awareness into which research divisions are generating the heaviest network load or experiencing the highest attack frequency.</li>
    </ul>""",
    """<ul>
      <li><strong>Institutional Scope Blocks</strong>: Segmented cards for <code class="code-inline">172.17.0.0/16</code> (Departmental VLANs), <code class="code-inline">172.16.0.0/12</code> (HPC Clusters), and <code class="code-inline">10.0.0.0/8</code> (Datacenter & Core).</li>
      <li><strong>Departmental Subnet Grid</strong>: Cards for ICTD, BKMD, ASTAR, SMSL, KRD, ACTEL, AML, Wind Engineering, Tower Testing, etc.</li>
      <li><strong>Ingress / Egress Accounting</strong>: Total downloaded and uploaded gigabytes calculated per departmental division.</li>
      <li><strong>Threat Incident Density</strong>: Visual counters of dropped packets and unapproved application attempts per division.</li>
    </ul>""",
    """<ul>
      <li><strong>Subnet Aggregation Microservice</strong>: Tag-based map-reduce querying InfluxDB TSDB by <code class="code-inline">subnet_segment</code>.</li>
      <li><strong>Departmental Catalog</strong>: Canonical institutional mapping maintaining subnet codes, names, and assigned VLAN IDs.</li>
      <li><strong>API</strong>: <code class="code-inline">GET /api/logs/analyzer/vlans</code> delivering cached 60-second rolls.</li>
    </ul>""",
    """<ul>
      <li>1. Scan the Subnet Matrix to identify laboratories with anomalous upload volume.</li>
      <li>2. Correlate threat counts with specific physical laboratories to direct on-site workstation remediation.</li>
      <li>3. Click any subnet card to filter the underlying log explorer to that specific CIDR block.</li>
    </ul>"""
))

# ==============================================================================
# SLIDE 19: SCREENSHOT 15 - TIME-SERIES LOG EXPLORER
# ==============================================================================
slides.append(generate_screenshot_slide(
    19, TOTAL_SLIDES,
    "Menu 15: Time-Series Historical Flow Log Explorer",
    "CERT-In 180-Day Forensic Log Inquiries, Multi-Parameter Search, & Trend Analysis",
    "ROUTE: /logs#explorer", "explorer",
    """<ul>
      <li><strong>Target Personas</strong>: Cybersecurity Incident Investigators, Forensic Specialists, and Compliance Auditors.</li>
      <li><strong>Core Purpose</strong>: Facilitates deep historical inquiries across months of archived firewall flow records and security logs, satisfying CERT-In statutory investigation mandates.</li>
      <li><strong>Operational Context</strong>: Crucial when responding to retroactive cyber threat intelligence advisories or performing post-incident forensic root cause analyses.</li>
    </ul>""",
    """<ul>
      <li><strong>Time-Series Timeline Chart</strong>: Interactive temporal chart visualizing traffic volume spikes and threat density over time.</li>
      <li><strong>Multi-Parameter Filter Bar</strong>: Search by Source IP, Remote Destination, Port, Protocol, Action, or Policy Name.</li>
      <li><strong>Time Range Selector</strong>: Flexible query horizons (1 Hour, 24 Hours, 7 Days, 30 Days, 180 Days Rolling Mandate).</li>
      <li><strong>Forensic Data Table</strong>: Comprehensive log view with full packet metadata and one-click JSON/CSV export.</li>
    </ul>""",
    """<ul>
      <li><strong>InfluxDB Flux Pipeline</strong>: High-efficiency range queries with pushdown predicate pushdowns for fast temporal filtering.</li>
      <li><strong>PostgreSQL Query Engine</strong>: B-tree indexed queries on <code class="code-inline">idx_syslog_timestamp</code> for relational events.</li>
      <li><strong>API</strong>: <code class="code-inline">GET /api/logs/analyzer/query</code> with server-side limit and offset pagination.</li>
    </ul>""",
    """<ul>
      <li>1. Select a historical time horizon (e.g. <strong>Last 7 Days</strong>) from the range selector.</li>
      <li>2. Enter a suspicious IP address into the filter bar to trace all historical connections made across that period.</li>
      <li>3. Export the filtered record set to satisfy regulatory audit disclosures.</li>
    </ul>"""
))

# ==============================================================================
# SLIDE 20: SCREENSHOT 16 - INSTITUTIONAL SUBNET INVESTIGATION
# ==============================================================================
slides.append(generate_screenshot_slide(
    20, TOTAL_SLIDES,
    "Menu 16: Institutional Subnet Deep Investigation",
    "Targeted Forensic Scrutiny Across Research Divisions & Departmental VLAN 172.17",
    "ROUTE: /logs#filtered", "filtered",
    """<ul>
      <li><strong>Target Personas</strong>: Departmental Network Administrators and Security Investigators.</li>
      <li><strong>Core Purpose</strong>: Isolates and scrutinizes all network transactions originating from or terminating within the primary CSIR-SERC departmental network (<code class="code-inline">172.17.0.0/16</code>).</li>
      <li><strong>Operational Context</strong>: Ensures laboratory research systems are operating within authorized bounds and verifies that scientific instruments are not inadvertently communicating with foreign endpoints.</li>
    </ul>""",
    """<ul>
      <li><strong>Scoped Subnet Filter</strong>: Pre-configured filter isolating the 19 research division VLANs on <code class="code-inline">172.17.0.0/16</code>.</li>
      <li><strong>Application Breakdown</strong>: Top scientific protocols (Ansys FEA, OpenMPI parallel execution, Git Replication) vs. web services.</li>
      <li><strong>Granular Log Stream</strong>: Displaying exact local workstations, source ports, remote targets, and firewall policies.</li>
      <li><strong>Directional Indicator</strong>: Visual badges identifying whether transactions are outbound egress or inbound ingress.</li>
    </ul>""",
    """<ul>
      <li><strong>Prefix Matching Filter</strong>: Fast in-memory regex and indexed database queries matching <code class="code-inline">^172\\\\.17\\\\.</code>.</li>
      <li><strong>Dual-Store Cross-Reference</strong>: Reconciles InfluxDB time-series records with PostgreSQL <code class="code-inline">syslog_events</code>.</li>
      <li><strong>API</strong>: <code class="code-inline">GET /api/logs/analyzer/query?subnet=172.17.0.0/16</code>.</li>
    </ul>""",
    """<ul>
      <li>1. Select the <code class="code-inline">172.17.0.0/16</code> scope button in the log console.</li>
      <li>2. Verify that high-volume transfers are confined to approved scientific and supercomputing gateways.</li>
      <li>3. Export departmental connection logs for monthly network accounting and audit reviews.</li>
    </ul>"""
))

# ==============================================================================
# SLIDE 21: SCREENSHOT 17 - CERT-IN COMPLIANCE MATRIX
# ==============================================================================
slides.append(generate_screenshot_slide(
    21, TOTAL_SLIDES,
    "Menu 17: CERT-In Section 70B National Compliance Matrix",
    "Automated Controls Audit, National Time Sync, & 180-Day Immutable Log Mandate",
    "ROUTE: /compliance", "compliance",
    """<ul>
      <li><strong>Target Personas</strong>: Chief Information Security Officers (CISOs), Government Auditors, and CERT-In Nodal Officers.</li>
      <li><strong>Core Purpose</strong>: Provides continuous, automated validation against the Indian Computer Emergency Response Team (CERT-In) Section 70B Cybersecurity Directives.</li>
      <li><strong>Operational Context</strong>: Replaces cumbersome manual compliance checklists with real-time automated verification of log retention, NTP time sync, encryption, and incident readiness.</li>
    </ul>""",
    """<ul>
      <li><strong>Compliance Score Ring</strong>: High-visibility percentage gauge summarizing overall regulatory readiness (95%+ Pass Rate).</li>
      <li><strong>Mandatory Controls Checklist</strong>: 20+ statutory controls covering 180-Day Rolling Log Retention, NPL Atomic Clock NTP Synchronization, Encrypted Management Channels (HTTPS/SSH), Non-Default Admin Passkeys, and Immutable Log Hashing.</li>
      <li><strong>Status Badges</strong>: Color-coded indicators (<code class="code-inline">PASS</code>, <code class="code-inline">WARNING</code>, <code class="code-inline">FAIL</code>) for each control.</li>
      <li><strong>Compliance PDF Report Export</strong>: One-click export for regulatory audit submissions.</li>
    </ul>""",
    """<ul>
      <li><strong>Automated Audit Engine</strong>: Queries database retention policies, system uptime, and NTP drift against Indian Stratum-1 servers.</li>
      <li><strong>Storage Verification</strong>: Validates InfluxDB and PostgreSQL rolling retention configurations.</li>
      <li><strong>API</strong>: <code class="code-inline">GET /api/compliance</code> delivering live scored control checklists.</li>
    </ul>""",
    """<ul>
      <li>1. Review the overall Compliance Score Ring during periodic security governance meetings.</li>
      <li>2. Investigate any control flagged as <code class="code-inline">WARNING</code> or <code class="code-inline">FAIL</code> and execute remediation.</li>
      <li>3. Click <strong>"Export Compliance Audit"</strong> to generate official compliance certificates for CERT-In auditors.</li>
    </ul>"""
))

# ==============================================================================
# SLIDE 22: SCREENSHOT 18 - USER MANAGEMENT & RBAC
# ==============================================================================
slides.append(generate_screenshot_slide(
    22, TOTAL_SLIDES,
    "Menu 18: Role-Based Access Control & User Administration",
    "Operator Accounts, Privilege Tiers, Passkey Rotation, & Telegram Alert Linking",
    "ROUTE: /users", "users",
    """<ul>
      <li><strong>Target Personas</strong>: Super Administrators and Security Operations Managers.</li>
      <li><strong>Core Purpose</strong>: Manages administrative account lifecycles, assigns granular operational roles, and links operator communication channels for real-time critical security alerts.</li>
      <li><strong>Operational Context</strong>: Enforces strict separation of duties (Superadmin, SOC Operator, Compliance Auditor) ensuring operators only access functions authorized by their clearance level.</li>
    </ul>""",
    """<ul>
      <li><strong>User Registry Table</strong>: Username, Full Name, Email, Assigned Department, Active Role, and Last Login Timestamp.</li>
      <li><strong>Role Tier Badges</strong>: Clear badges differentiating <code class="code-inline">SUPERADMIN</code>, <code class="code-inline">OPERATOR</code>, and <code class="code-inline">AUDITOR</code>.</li>
      <li><strong>Passkey Rotation Modal</strong>: Secure credential update dialog with minimum complexity safeguards.</li>
      <li><strong>Telegram Chat ID Linking</strong>: Allows operators to bind personal or SOC Telegram accounts to receive instant emergency alerts.</li>
    </ul>""",
    """<ul>
      <li><strong>PostgreSQL <code class="code-inline">users</code> Table</strong>: Salted Bcrypt passkey hashing and role metadata persistence.</li>
      <li><strong>Superadmin Safeguard</strong>: Hardcoded safeguard preventing deletion or accidental demotion of the primary superadmin account.</li>
      <li><strong>API</strong>: <code class="code-inline">GET /api/users</code>, <code class="code-inline">POST /api/users</code>, and <code class="code-inline">POST /api/users/:id/test-telegram</code>.</li>
    </ul>""",
    """<ul>
      <li>1. Click <strong>"Add Operator"</strong> to provision access for new security personnel with appropriate role tiers.</li>
      <li>2. Input Telegram Chat ID and click <strong>"Test Telegram"</strong> to verify emergency dispatch delivery.</li>
      <li>3. Enforce periodic passkey rotation in compliance with institutional security guidelines.</li>
    </ul>"""
))

# ==============================================================================
# SLIDE 23: SCREENSHOT 19 - SETTINGS, BRANDING & BACKUPS
# ==============================================================================
slides.append(generate_screenshot_slide(
    23, TOTAL_SLIDES,
    "Menu 19: Institutional Branding, Whitelabeling, & Backups",
    "Organization Personalization, Alert Dispatch, & Automated Disaster Recovery Suite",
    "ROUTE: /settings", "settings",
    """<ul>
      <li><strong>Target Personas</strong>: Lead Systems Administrators and Portal Configuration Managers.</li>
      <li><strong>Core Purpose</strong>: Houses institutional personalization settings, alert notification channels (SMTP, Telegram), SNMP threshold triggers, and automated disaster recovery backup operations.</li>
      <li><strong>Operational Context</strong>: Allows any deploying Indian government agency or university to brand the portal with official logos, configure alert thresholds, and establish automated backup schedules.</li>
    </ul>""",
    """<ul>
      <li><strong>Institutional Branding Card</strong>: Custom Organization Name, Apex Body, Division Title, and SVG/PNG Logo uploader (50MB support).</li>
      <li><strong>Notification Gateways</strong>: SMTP Server credentials with TLS test dispatch, and Telegram Bot token/chat configurations.</li>
      <li><strong>SNMP &amp; Collector Thresholds</strong>: Configurable CPU (&gt;80%), Memory (&gt;85%), and Concurrent Session alert triggers.</li>
      <li><strong>Automated Backup Suite</strong>: Creates timestamped JSON backup packages with one-click restore and pruning rules.</li>
    </ul>""",
    """<ul>
      <li><strong>Direct Root Uploads (<code class="code-inline">/upload/logo</code>)</strong>: Stores uploaded logos directly into persistent <code class="code-inline">/app/uploads/</code>.</li>
      <li><strong>Backup Engine (<code class="code-inline">backup.service.ts</code>)</strong>: Packages settings, users, firewalls, and database tables into encrypted JSON archives.</li>
      <li><strong>API</strong>: <code class="code-inline">POST /api/settings</code> and <code class="code-inline">POST /api/system/backups/create</code>.</li>
    </ul>""",
    """<ul>
      <li>1. Upload official institutional vector logo to brand the command header and report footers.</li>
      <li>2. Configure SMTP relay and dispatch a sample test email to verify SOC alarm delivery.</li>
      <li>3. Click <strong>"Create Backup Archive"</strong> prior to applying any system updates or configuration changes.</li>
    </ul>"""
))

# ==============================================================================
# SLIDE 24: SCREENSHOT 20 - STORAGE REGISTRY MODAL
# ==============================================================================
slides.append(generate_screenshot_slide(
    24, TOTAL_SLIDES,
    "Menu 20: Telemetry Storage & Database Engine Registry",
    "Complete Transparency into PostgreSQL 18, InfluxDB 2.7 TSDB, & File Storage Volumes",
    "MODAL: STORAGE-REGISTRY", "storage",
    """<ul>
      <li><strong>Target Personas</strong>: Database Administrators (DBAs), Infrastructure Engineers, and Security Auditors.</li>
      <li><strong>Core Purpose</strong>: Provides absolute operational transparency into the underlying database engines, verifying that telemetry, syslog events, and hardware metrics are actively persisting to disk.</li>
      <li><strong>Operational Context</strong>: Directly addresses storage health verification, ensuring the appliance complies with the mandatory 180-day CERT-In retention mandate.</li>
    </ul>""",
    """<ul>
      <li><strong>PostgreSQL 18 Engine Strip</strong>: Status (<code class="code-inline">ONLINE</code>), Database Host (<code class="code-inline">10.40.0.151:5432</code>), Syslog Events (<code class="code-inline">5,200 Rows</code>), and Telemetry History (<code class="code-inline">2,880 Rows</code>).</li>
      <li><strong>InfluxDB 2.7 TSDB Engine Strip</strong>: Status (<code class="code-inline">ONLINE</code>), Endpoint (<code class="code-inline">10.40.0.152:8086</code>), Org/Bucket (<code class="code-inline">csir-serc / firewall_logs</code>), and Buffered Records (<code class="code-inline">5,000 Records</code>).</li>
      <li><strong>Appliance File Storage Locations</strong>: Displays paths and byte sizes for Raw Syslog Archive (<code class="code-inline">/app/data/syslog.log</code>), Media Uploads (<code class="code-inline">/app/uploads</code>), and Backups (<code class="code-inline">/app/backups</code>).</li>
      <li><strong>Live Refresh Button</strong>: One-click status refresh querying real-time row counts directly from database connection pools.</li>
    </ul>""",
    """<ul>
      <li><strong>Dynamic SQL Query Pool</strong>: Executes concurrent <code class="code-inline">SELECT COUNT(*)</code> queries across <code class="code-inline">syslog_events</code>, <code class="code-inline">telemetry_metrics</code>, and <code class="code-inline">security_alerts</code>.</li>
      <li><strong>TSDB Health Ping</strong>: Verifies InfluxDB v2.7 API reachability and bucket retention window.</li>
      <li><strong>API</strong>: <code class="code-inline">GET /api/system/storage</code> delivering unified storage transparency payload.</li>
    </ul>""",
    """<ul>
      <li>1. Click the database icon in the top command header to open the Storage Registry modal.</li>
      <li>2. Verify that PostgreSQL 18 and InfluxDB 2.7 TSDB indicators show green <code class="code-inline">ONLINE</code> status.</li>
      <li>3. Click <strong>"Refresh Storage Status"</strong> to obtain immediate row counts and verify continuous active data ingestion.</li>
    </ul>"""
))

# ==============================================================================
# SLIDE 25: DATA STORAGE PIPELINE ARCHITECTURE
# ==============================================================================
slides.append(f"""
<div class="slide">
  <div class="slide-header">
    <div class="header-left">
      <div class="tricolor-indicator"></div>
      <div class="institution-meta">
        <span class="badge-apex">CSIR - Structural Engineering Research Centre • ICTD</span>
        <span class="badge-sub">Storage Engineering</span>
      </div>
    </div>
    <div class="header-center">
      <h2 class="slide-title">Dual-Engine Storage Pipeline &amp; Data Lifecycle</h2>
      <div class="slide-subtitle">InfluxDB 2.7 Time-Series TSDB + PostgreSQL 18 Relational Integration</div>
    </div>
    <div class="header-right">
      <span class="route-pill">STORAGE-PIPELINE</span>
      <span class="slide-counter">SLIDE 25 / {TOTAL_SLIDES:02d}</span>
    </div>
  </div>

  <div class="full-slide-content">
    <div class="grid-2-col">
      <div class="arch-card">
        <div class="arch-card-header">
          <span>InfluxDB 2.7 Time-Series Pipeline</span>
          <span class="arch-card-badge">HIGH-THROUGHPUT TSDB</span>
        </div>
        <div class="arch-card-body">
          <ul>
            <li><strong>Measurement Schema</strong>: Single measurement <code class="code-inline">firewall_traffic</code> indexed by tags (<code class="code-inline">direction</code>, <code class="code-inline">action</code>, <code class="code-inline">protocol</code>, <code class="code-inline">application</code>, <code class="code-inline">vlan_id</code>, <code class="code-inline">interface</code>).</li>
            <li><strong>Numeric Fields</strong>: <code class="code-inline">bytes_in</code>, <code class="code-inline">bytes_out</code>, <code class="code-inline">bytes_total</code>, <code class="code-inline">packets_in</code>, <code class="code-inline">packets_out</code>.</li>
            <li><strong>Batch Line-Protocol Writes</strong>: Groups incoming UDP syslog and NetFlow records into asynchronous 500-record batches to avoid disk I/O bottlenecks.</li>
            <li><strong>CERT-In 180-Day Retention</strong>: Automated TSDB bucket retention policy (<code class="code-inline">180d</code>) ensuring older records roll off automatically without requiring manual cron vacuum scripts.</li>
            <li><strong>Flux Analytical Queries</strong>: Supports fast time-bucket aggregations (<code class="code-inline">aggregateWindow(every: 1m, fn: sum)</code>) for live area charts.</li>
          </ul>
        </div>
      </div>

      <div class="arch-card">
        <div class="arch-card-header">
          <span>PostgreSQL 18 Relational Persistence</span>
          <span class="arch-card-badge">ACID NORMALIZED METRICS</span>
        </div>
        <div class="arch-card-body">
          <ul>
            <li><strong>Normalized Telemetry Schema</strong>:
              <ul>
                <li><code class="code-inline">telemetry_metrics</code>: Timestamped snapshots of CPU, RAM, active sessions, and line rates.</li>
                <li><code class="code-inline">syslog_events</code>: Full syslog event catalog with facility, severity, program, raw log, and client IP.</li>
                <li><code class="code-inline">security_alerts</code>: Incident alert register with acknowledgment state and resolution notes.</li>
                <li><code class="code-inline">firewall_settings</code>: Institutional branding, notification thresholds, and whitelabeling payloads.</li>
              </ul>
            </li>
            <li><strong>Performance Optimization</strong>: B-tree indexes (<code class="code-inline">idx_syslog_timestamp</code>, <code class="code-inline">idx_telemetry_timestamp</code>) deliver sub-10ms query execution across millions of rows.</li>
            <li><strong>Resilient Connection Pool</strong>: Auto-reconnecting pool (<code class="code-inline">pg.Pool</code>) with automated retry and fallback to local JSON storage.</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="arch-card" style="margin-top: 15px;">
      <div class="arch-card-header">
        <span>Data Flow Topography: From Perimeter Interface to Analytics Visual</span>
        <span class="arch-card-badge">END-TO-END PIPELINE</span>
      </div>
      <div class="arch-card-body">
        <div class="grid-4-col">
          <div style="background: rgba(124, 58, 237, 0.15); padding: 8px; border-radius: 8px; border: 1px solid rgba(139, 92, 246, 0.4);">
            <strong style="color: #38bdf8;">1. Perimeter Extraction:</strong><br>
            FortiGate 600F generates SNMPv2c responses (161), NetFlow v9/IPFIX UDP packets (2055), and high-velocity syslogs (1514).
          </div>
          <div style="background: rgba(16, 185, 129, 0.15); padding: 8px; border-radius: 8px; border: 1px solid rgba(16, 185, 129, 0.4);">
            <strong style="color: #34d399;">2. Collector Ingestion:</strong><br>
            Asynchronous Node.js collectors parse binary flow records, resolve departmental VLAN subnets, and extract Layer 7 signatures.
          </div>
          <div style="background: rgba(168, 85, 247, 0.15); padding: 8px; border-radius: 8px; border: 1px solid rgba(168, 85, 247, 0.4);">
            <strong style="color: #c084fc;">3. Dual Datastore Commit:</strong><br>
            Metrics and events committed simultaneously to InfluxDB TSDB (180-day retention) and PostgreSQL 18 relational tables.
          </div>
          <div style="background: rgba(245, 158, 11, 0.15); padding: 8px; border-radius: 8px; border: 1px solid rgba(245, 158, 11, 0.4);">
            <strong style="color: #fbbf24;">4. Live UI Broadcast:</strong><br>
            WebSocket server pushes sub-second telemetry deltas to active Vue 3.5 dashboards, triggering zero-latency ECharts updates.
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div class="footer-left">
      <span class="footer-tag">MANDATE: CERT-In Section 70B Baseline</span>
      <span class="footer-sep">•</span>
      <span class="footer-tag">FRAMEWORK: GOI UX4G Violet Standard</span>
      <span class="footer-sep">•</span>
      <span class="footer-tag">RETENTION: 180-Day Immutable TSDB</span>
    </div>
    <div class="footer-right">
      <span class="footer-attribution">Made by ICTD CSIR-SERC for CSIR with ❤️</span>
    </div>
  </div>
</div>
""")

# ==============================================================================
# SLIDE 26: DEPLOYMENT & PRODUCTION OPERATIONS GUIDE
# ==============================================================================
slides.append(f"""
<div class="slide">
  <div class="slide-header">
    <div class="header-left">
      <div class="tricolor-indicator"></div>
      <div class="institution-meta">
        <span class="badge-apex">CSIR - Structural Engineering Research Centre • ICTD</span>
        <span class="badge-sub">Deployment &amp; DevOps</span>
      </div>
    </div>
    <div class="header-center">
      <h2 class="slide-title">Appliance Deployment Models &amp; Production Operations</h2>
      <div class="slide-subtitle">Universal Linux Installer, Standalone Virtual Machine, &amp; OTA Update Safety</div>
    </div>
    <div class="header-right">
      <span class="route-pill">DEPLOYMENT-OPS</span>
      <span class="slide-counter">SLIDE 26 / {TOTAL_SLIDES:02d}</span>
    </div>
  </div>

  <div class="full-slide-content">
    <div class="grid-3-col">
      <div class="arch-card">
        <div class="arch-card-header">
          <span>Option A: Universal Installer</span>
          <span class="arch-card-badge">UBUNTU / ROCKY / RHEL</span>
        </div>
        <div class="arch-card-body">
          <ul>
            <li><strong>Automated Script</strong>: One-command production deployment via <code class="code-inline">install.sh</code>.</li>
            <li><strong>Preflight Validation</strong>: Validates CPU cores (&ge;4), RAM (&ge;8GB), disk (&ge;100GB), and detects OS package managers (<code class="code-inline">apt-get</code> / <code class="code-inline">dnf</code>).</li>
            <li><strong>Automated Stack Build</strong>: Installs Node.js 22 LTS, Docker CE, configures <code class="code-inline">ufw</code> or <code class="code-inline">firewalld</code> firewall rules, compiles Vue 3.5 frontend, and builds backend.</li>
            <li><strong>Systemd Integration</strong>: Registers <code class="code-inline">firewall-telemetry.service</code> for automatic boot recovery across datacenter power events.</li>
          </ul>
        </div>
      </div>

      <div class="arch-card">
        <div class="arch-card-header">
          <span>Option B: Virtual Appliance VM</span>
          <span class="arch-card-badge">OVA / VMDK / ESXI</span>
        </div>
        <div class="arch-card-body">
          <ul>
            <li><strong>Hypervisor Ready</strong>: Pre-configured VM image importable into VMware ESXi, Proxmox VE, Hyper-V, and Nutanix.</li>
            <li><strong>Zero Pre-requisite Setup</strong>: Spin up VM, assign static IP (<code class="code-inline">10.40.0.150</code>), and browse to <code class="code-inline">http://10.40.0.150/</code>.</li>
            <li><strong>Automatic First-Time Wizard</strong>: Initial boot triggers Setup Wizard for branding and SNMP strings.</li>
            <li><strong>Isolated Persistent Partition</strong>: Runtime state strictly isolated in <code class="code-inline">/opt/firewall-appliance/data/</code>.</li>
          </ul>
        </div>
      </div>

      <div class="arch-card">
        <div class="arch-card-header">
          <span>OTA Updates &amp; Data Safety</span>
          <span class="arch-card-badge">DATA PRESERVATION</span>
        </div>
        <div class="arch-card-body">
          <ul>
            <li><strong>OTA Guarantee</strong>: Upgrading application containers or applying hotfixes strictly preserves persistent volumes (<code class="code-inline">data</code>, <code class="code-inline">uploads</code>, <code class="code-inline">backups</code>).</li>
            <li><strong>Disaster Recovery Snapshots</strong>: Full JSON snapshot export/import preserving settings, user passkeys, and firewall profiles.</li>
            <li><strong>Zero Downtime Recovery</strong>: Healthcheck endpoints (<code class="code-inline">/health</code>) monitor container status with automatic Docker restart policies.</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="arch-card" style="margin-top: 15px;">
      <div class="arch-card-header">
        <span>Production Docker Compose Configuration Reference</span>
        <span class="arch-card-badge">YAML ORCHESTRATION</span>
      </div>
      <div class="arch-card-body">
        <div class="grid-2-col">
          <div style="font-family: monospace; font-size: 7.5pt; color: #a78bfa; background: rgba(0,0,0,0.5); padding: 10px; border-radius: 6px;">
            # Production Macvlan Multi-IP Topology (docker-compose.yml)<br>
            services:<br>
            &nbsp;&nbsp;firewall-monitoring-db: # PostgreSQL 18 (10.40.0.151:5432)<br>
            &nbsp;&nbsp;firewall-monitoring-tsdb: # InfluxDB 2.7 (10.40.0.152:8086)<br>
            &nbsp;&nbsp;firewall-monitoring-console: # Core App (10.40.0.150:80)<br>
            &nbsp;&nbsp;&nbsp;&nbsp;volumes: [./data:/app/data, ./uploads:/app/uploads]<br>
            &nbsp;&nbsp;&nbsp;&nbsp;ports: ["80:80", "1514:1514/udp", "2055:2055/udp", "162:162/udp"]
          </div>
          <div style="font-family: monospace; font-size: 7.5pt; color: #38bdf8; background: rgba(0,0,0,0.5); padding: 10px; border-radius: 6px;">
            # Standalone Bridge Universal VM Topology (docker-compose.standalone.yml)<br>
            services:<br>
            &nbsp;&nbsp;firewall-monitoring-db: # PostgreSQL 18 Alpine<br>
            &nbsp;&nbsp;firewall-monitoring-tsdb: # InfluxDB 2.7 TSDB (180d retention)<br>
            &nbsp;&nbsp;firewall-monitoring-console: # UX4G Violet Web &amp; API<br>
            &nbsp;&nbsp;&nbsp;&nbsp;environment: [PORT=80, SYSLOG_PORT=1514, NETFLOW_PORT=2055]<br>
            &nbsp;&nbsp;&nbsp;&nbsp;restart: unless-stopped
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div class="footer-left">
      <span class="footer-tag">MANDATE: CERT-In Section 70B Baseline</span>
      <span class="footer-sep">•</span>
      <span class="footer-tag">FRAMEWORK: GOI UX4G Violet Standard</span>
      <span class="footer-sep">•</span>
      <span class="footer-tag">RETENTION: 180-Day Immutable TSDB</span>
    </div>
    <div class="footer-right">
      <span class="footer-attribution">Made by ICTD CSIR-SERC for CSIR with ❤️</span>
    </div>
  </div>
</div>
""")

# ==============================================================================
# SLIDE 27: INSTITUTIONAL GOVERNANCE & STATUTORY MANDATE
# ==============================================================================
slides.append(f"""
<div class="slide">
  <div class="slide-header">
    <div class="header-left">
      <div class="tricolor-indicator"></div>
      <div class="institution-meta">
        <span class="badge-apex">CSIR - Structural Engineering Research Centre • ICTD</span>
        <span class="badge-sub">Governance &amp; Licensing</span>
      </div>
    </div>
    <div class="header-center">
      <h2 class="slide-title">Statutory Mandate, Licensing, &amp; Institutional Governance</h2>
      <div class="slide-subtitle">CSIR-SERC Free Community License &amp; Government of India Compliance Standards</div>
    </div>
    <div class="header-right">
      <span class="route-pill">LEGAL-GOVERNANCE</span>
      <span class="slide-counter">SLIDE 27 / {TOTAL_SLIDES:02d}</span>
    </div>
  </div>

  <div class="full-slide-content">
    <div class="grid-3-col">
      <div class="arch-card">
        <div class="arch-card-header">
          <span>CERT-In Section 70B Mandate</span>
          <span class="arch-card-badge">STATUTORY DIRECTIVE</span>
        </div>
        <div class="arch-card-body">
          <ul>
            <li><strong>Mandatory 180-Day Retention</strong>: All system logs, firewall flows, and security incidents must be preserved within Indian jurisdiction for rolling 180 days.</li>
            <li><strong>NPL Atomic Clock Synchronization</strong>: System clocks synchronized exclusively with National Physical Laboratory (NPL) or NIC Stratum-1 servers.</li>
            <li><strong>6-Hour Incident Reporting</strong>: Forensic incident logs exported in compliant CSV format for submission to CERT-In within the statutory 6-hour window.</li>
          </ul>
        </div>
      </div>

      <div class="arch-card">
        <div class="arch-card-header">
          <span>UX4G National Design Framework</span>
          <span class="arch-card-badge">GOI STANDARD</span>
        </div>
        <div class="arch-card-body">
          <ul>
            <li><strong>Accessible Government UI</strong>: Conforms to Government of India UX4G design standard with Core Violet palette and accessible typography.</li>
            <li><strong>WCAG 2.1 AA Certified</strong>: High contrast ratios, accessible screen-reader navigation, and keyboard shortcuts across all menus.</li>
            <li><strong>Standardized Identity</strong>: Apex body recognition, bilingual readiness, and national tricolor indicator branding.</li>
          </ul>
        </div>
      </div>

      <div class="arch-card">
        <div class="arch-card-header">
          <span>Licensing Structure (v1.0)</span>
          <span class="arch-card-badge">FREE COMMUNITY EDITION</span>
        </div>
        <div class="arch-card-body">
          <ul>
            <li><strong>Free for Indian Public Sector</strong>: Freely deployable across all Indian government laboratories, ministries, universities, and public sector undertakings.</li>
            <li><strong>Anti-Commercialization</strong>: Strict prohibition against commercial resale, closed-source re-branding, or fee-based packaging of the software.</li>
            <li><strong>Mandatory Attribution</strong>: Mandatory preservation of footer notice (*"Made by ICTD CSIR-SERC for CSIR with ❤️"*).</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="arch-card" style="margin-top: 15px;">
      <div class="arch-card-header">
        <span>Intellectual Property &amp; Authorship Statement</span>
        <span class="arch-card-badge">CSIR-SERC ICTD</span>
      </div>
      <div class="arch-card-body">
        <div style="font-size: 8.5pt; color: #cbd5e1; line-height: 1.5;">
          <strong>Copyright © 2024–2026 CSIR - Structural Engineering Research Centre (CSIR-SERC), Council of Scientific &amp; Industrial Research, Ministry of Science &amp; Technology, Government of India. All Rights Reserved.</strong><br>
          Engineered and maintained by the <strong>Information and Communication Technology Division (ICTD)</strong>, CSIR-SERC, Chennai, India. All title, copyright, patent rights, moral rights, source code, architecture, algorithms, and threat intelligence models remain exclusively with CSIR-SERC. Released as the Universal Free &amp; Community Edition for Indian national cyber defense.
        </div>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div class="footer-left">
      <span class="footer-tag">MANDATE: CERT-In Section 70B Baseline</span>
      <span class="footer-sep">•</span>
      <span class="footer-tag">FRAMEWORK: GOI UX4G Violet Standard</span>
      <span class="footer-sep">•</span>
      <span class="footer-tag">RETENTION: 180-Day Immutable TSDB</span>
    </div>
    <div class="footer-right">
      <span class="footer-attribution">Made by ICTD CSIR-SERC for CSIR with ❤️</span>
    </div>
  </div>
</div>
""")

# ==============================================================================
# SLIDE 28: CONCLUDING SUMMARY & OPERATIONS
# ==============================================================================
slides.append(f"""
<div class="slide cover-slide" style="justify-content: space-between;">
  <div>
    <div class="cover-tricolor"></div>
    <div class="cover-header-meta">
      <div>
        <div style="font-size: 11pt; font-weight: 800; color: #38bdf8; font-family: monospace;">
          ENTERPRISE FIREWALL TELEMETRY &amp; SECURITY OPERATIONS CENTER
        </div>
        <div style="font-size: 10pt; color: #94a3b8; font-weight: 600;">
          CSIR - Structural Engineering Research Centre • National Cyber Shield Platform
        </div>
      </div>
      <div style="text-align: right;">
        <span class="cover-badge" style="border-color: #38bdf8; color: #38bdf8;">OPERATIONS MANUAL COMPLETE</span>
      </div>
    </div>

    <div class="cover-title-block" style="margin: 0.35in 0;">
      <div class="cover-main-title" style="font-size: 26pt;">
        Platform Operational Readiness &amp;<br>
        <span>Production Summary</span>
      </div>
      <div class="cover-subtitle" style="font-size: 11pt;">
        The Enterprise Firewall Telemetry Platform is verified healthy and operational at CSIR-SERC Datacenter Chennai. All 58 physical interfaces, 19 departmental VLANs, Dual TSDB &amp; Relational datastores, and 20 specialized operational menus are actively monitoring perimeter traffic.
      </div>

      <div class="grid-3-col" style="margin-top: 25px;">
        <div class="arch-card">
          <div style="font-size: 9.5pt; font-weight: 800; color: #38bdf8; margin-bottom: 5px;">Production Endpoint</div>
          <div style="font-size: 12pt; font-weight: 800; color: #ffffff; font-family: monospace;">http://10.40.0.150/</div>
          <div style="font-size: 8pt; color: #94a3b8; margin-top: 4px;">Web Management Console &amp; Real-time REST API</div>
        </div>
        <div class="arch-card">
          <div style="font-size: 9.5pt; font-weight: 800; color: #34d399; margin-bottom: 5px;">Active Gateway</div>
          <div style="font-size: 12pt; font-weight: 800; color: #ffffff; font-family: monospace;">FortiGate 600F (10.10.3.15)</div>
          <div style="font-size: 8pt; color: #94a3b8; margin-top: 4px;">SNMPv2c Active • 15s Polling Interval</div>
        </div>
        <div class="arch-card">
          <div style="font-size: 9.5pt; font-weight: 800; color: #c084fc; margin-bottom: 5px;">Datastore Cluster</div>
          <div style="font-size: 12pt; font-weight: 800; color: #ffffff; font-family: monospace;">PostgreSQL 18 &amp; InfluxDB 2.7</div>
          <div style="font-size: 8pt; color: #94a3b8; margin-top: 4px;">180-Day CERT-In Retention Active</div>
        </div>
      </div>
    </div>
  </div>

  <div class="cover-footer">
    <div>
      <div style="font-size: 10pt; font-weight: 800; color: #ffffff;">
        Information and Communication Technology Division (ICTD)
      </div>
      <div style="font-size: 8.5pt; color: #94a3b8;">
        CSIR - Structural Engineering Research Centre, CSIR Campus, Chennai - 600113, Tamil Nadu, India
      </div>
      <div style="font-size: 8pt; color: #f43f5e; font-weight: 700; margin-top: 3px;">
        Universal Institutional License v1.0 • "Made by ICTD CSIR-SERC for CSIR with ❤️"
      </div>
    </div>
    <div style="text-align: right; font-family: monospace; font-size: 9pt; color: #38bdf8;">
      SLIDE 28 / {TOTAL_SLIDES:02d}
    </div>
  </div>
</div>
""")

html_doc = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Enterprise Firewall Telemetry &amp; Security Operations Center - Presentation Manual</title>
  <style>
    {css}
  </style>
</head>
<body>
{''.join(slides)}
</body>
</html>
"""

html_out_path = os.path.abspath("docs/Enterprise_Firewall_Telemetry_Center_Presentation.html")
pdf_out_path = os.path.abspath("docs/Enterprise_Firewall_Telemetry_Center_Presentation.pdf")

print(f"Writing presentation HTML document to {html_out_path}...")
with open(html_out_path, "w", encoding="utf-8") as f:
    f.write(html_doc)

html_size_mb = os.path.getsize(html_out_path) / 1024 / 1024
print(f"HTML document generated successfully ({html_size_mb:.2f} MB).")

print("Rendering presentation PDF via Microsoft Edge headless print engine...")
edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

cmd = [
    edge_path,
    "--headless",
    "--disable-gpu",
    f"--print-to-pdf={pdf_out_path}",
    "--no-margins",
    "--print-to-pdf-no-header",
    html_out_path
]

res = subprocess.run(cmd, capture_output=True, text=True)

if os.path.exists(pdf_out_path):
    pdf_size_mb = os.path.getsize(pdf_out_path) / 1024 / 1024
    print(f"SUCCESS: Publication-quality Presentation PDF created at:")
    print(f"{pdf_out_path} ({pdf_size_mb:.2f} MB)")
else:
    print("ERROR: PDF was not generated. Stderr:", res.stderr)
