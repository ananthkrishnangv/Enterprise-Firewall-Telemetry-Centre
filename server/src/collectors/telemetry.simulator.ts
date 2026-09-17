import { v4 as uuidv4 } from 'uuid';
import { TrafficFlow, SyslogEntry, RuleAction } from '../types/index.js';
import { telemetryStore } from '../storage/telemetry.store.js';
import { notificationService } from '../services/notification.service.js';

export class TelemetrySimulator {
  private timer: NodeJS.Timeout | null = null;
  private lastAlertTime: number = 0;

  private apps = [
    { name: 'Ansys-FEA-HPC', port: 1055, proto: 'TCP' as const, baseBytes: 850000, category: 'High Performance Computing', uploadRatio: 0.72 },
    { name: 'PostgreSQL-Cluster', port: 5432, proto: 'TCP' as const, baseBytes: 640000, category: 'Database Systems', uploadRatio: 0.52 },
    { name: 'OpenMPI-Parallel', port: 8200, proto: 'TCP' as const, baseBytes: 920000, category: 'High Performance Computing', uploadRatio: 0.68 },
    { name: 'Lustre-Storage-Sync', port: 988, proto: 'TCP' as const, baseBytes: 1150000, category: 'Storage Fabric', uploadRatio: 0.81 },
    { name: 'GitHub-Git-SSH', port: 22, proto: 'TCP' as const, baseBytes: 320000, category: 'Software Engineering', uploadRatio: 0.38 },
    { name: 'HTTPS-Web-Portal', port: 443, proto: 'TCP' as const, baseBytes: 450000, category: 'Web Traffic', uploadRatio: 0.22 },
    { name: 'ScienceDirect-Journals', port: 443, proto: 'TCP' as const, baseBytes: 740000, category: 'Research Library', uploadRatio: 0.14 },
    { name: 'e-Office-CSIR', port: 8443, proto: 'TCP' as const, baseBytes: 290000, category: 'Enterprise Office', uploadRatio: 0.35 },
    { name: 'Microsoft-365', port: 443, proto: 'TCP' as const, baseBytes: 410000, category: 'Cloud Collaboration', uploadRatio: 0.42 },
    { name: 'Zoom-Video', port: 8801, proto: 'UDP' as const, baseBytes: 530000, category: 'Collaboration', uploadRatio: 0.48 },
    { name: 'FortiOS-Admin-HTTPS', port: 443, proto: 'TCP' as const, baseBytes: 120000, category: 'Network Management', uploadRatio: 0.28 },
    { name: 'DNS-Queries', port: 53, proto: 'UDP' as const, baseBytes: 3800, category: 'Infrastructure', uploadRatio: 0.50 },
    { name: 'BitTorrent P2P', port: 6881, proto: 'TCP' as const, baseBytes: 650000, category: 'Unapproved Traffic', uploadRatio: 0.60 },
  ];

  private internalHosts = [
    { ip: '10.10.40.85', name: 'cad-cae-workstation-lab3.serc.res.in', dept: 'Advanced Structural Health Monitoring Lab', zone: 'ICT_Lan_Access (port3)' },
    { ip: '10.20.10.50', name: 'serc-db-primary.serc.res.in', dept: 'Central Scientific Database Facility', zone: 'SERC_Srv_access (port2)' },
    { ip: '10.10.12.102', name: 'ict-netops-admin.serc.res.in', dept: 'Information & Comm. Technology Div (ICTD)', zone: 'ICT_Lan_Access (port3)' },
    { ip: '10.10.20.15', name: 'hpc-compute-node01.serc.res.in', dept: 'Param-SERC Supercomputing Centre', zone: 'SERC_Srv_access (port2)' },
    { ip: '10.10.20.24', name: 'hpc-storage-head.serc.res.in', dept: 'Cluster Parallel Lustre Storage', zone: 'SERC_Srv_access (port2)' },
    { ip: '10.30.0.9', name: 'director-office-terminal.serc.res.in', dept: 'Directorate Executive Office', zone: 'ICT_Lan_Access (port3)' },
    { ip: '192.168.100.14', name: 'library-digital-kiosk.serc.res.in', dept: 'Knowledge Resource & Library Division', zone: 'ICT_Lan_Access (port3)' },
    { ip: '192.168.40.22', name: 'acoustic-dynamics-lab.serc.res.in', dept: 'Structural Dynamics & Vibration Testing Lab', zone: 'ICT_Lan_Access (port3)' },
  ];

  private externalIps = [
    '203.0.113.195', '198.51.100.24', '8.8.8.8', '1.1.1.1',
    '142.250.190.46', '52.96.166.130', '13.107.6.158', '185.220.101.5'
  ];

  private users = [
    'serc/dr.raman', 'serc/admin_karthik', 'serc/research_user',
    'serc/sysadmin', 'serc/director_office', 'SYSTEM/serc_backup'
  ];

  public start() {
    console.log('[TelemetrySimulator] Background live traffic generator active for FortiGate-CSIR-SERC (10.10.3.15).');
    for (let i = 0; i < 60; i++) {
      this.generateTick();
    }

    this.timer = setInterval(() => {
      this.generateTick();
    }, 1200);
  }

  public stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private generateTick() {
    // Only connected FortiGate-CSIR-SERC (10.10.3.15)
    const fw = { id: 'fw-fg-01', vendor: 'fortinet' as const, rule: 'CSIR_SERC_WAN_Allow' };

    const app = this.apps[Math.floor(Math.random() * this.apps.length)];
    const host = this.internalHosts[Math.floor(Math.random() * this.internalHosts.length)];
    const srcIp = host.ip;
    const dstIp = this.externalIps[Math.floor(Math.random() * this.externalIps.length)];
    const user = Math.random() > 0.35 ? this.users[Math.floor(Math.random() * this.users.length)] : undefined;

    const isBlocked = app.name === 'BitTorrent P2P' || dstIp === '185.220.101.5' || Math.random() < 0.12;
    const action: RuleAction = isBlocked ? 'drop' : 'allow';

    let threatCategory: string | undefined;
    let threatSeverity: TrafficFlow['threatSeverity'] = 'none';

    if (dstIp === '185.220.101.5') {
      threatCategory = 'Known Tor Exit Node / C2 Beacon';
      threatSeverity = 'critical';
    } else if (app.name === 'BitTorrent P2P') {
      threatCategory = 'Unapproved P2P File Sharing';
      threatSeverity = 'medium';
    } else if (Math.random() < 0.05) {
      threatCategory = 'Suspicious Outbound Port Scan';
      threatSeverity = 'low';
    }

    const bytesMultiplier = Math.random() * 2 + 0.5;
    const totalVolume = Math.floor(app.baseBytes * bytesMultiplier);
    const bytesOut = Math.floor(totalVolume * (app.uploadRatio + (Math.random() * 0.1 - 0.05)));
    const bytesIn = Math.max(1024, totalVolume - bytesOut);

    const flow: TrafficFlow = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      firewallId: fw.id,
      vendor: fw.vendor,
      sourceIp: srcIp,
      destIp: dstIp,
      sourcePort: Math.floor(Math.random() * 40000) + 10240,
      destPort: app.port,
      protocol: app.proto,
      application: app.name,
      userIdentity: user,
      ruleName: isBlocked ? 'SERC_Threat_Prevention_Drop' : 'CSIR_SERC_WAN_Allow',
      action,
      bytesIn,
      bytesOut,
      packetsIn: Math.floor(bytesIn / 1200) + 1,
      packetsOut: Math.floor(bytesOut / 1200) + 1,
      threatCategory,
      threatSeverity,
      countryDest: dstIp === '8.8.8.8' ? 'US' : dstIp === '1.1.1.1' ? 'AU' : dstIp === '185.220.101.5' ? 'DE' : 'US'
    };

    telemetryStore.addFlow(flow);

    // FortiOS Syslog format
    const rawMsg = `date=2026-09-16 time=11:25:00 devname="FortiGate-CSIR-SERC" devid="FG600F12345678" type="traffic" subtype="forward" level="notice" action="${action === 'allow' ? 'accept' : 'deny'}" policyid=10 policyname="${flow.ruleName}" srcip=${srcIp} srcport=${flow.sourcePort} dstip=${dstIp} dstport=${app.port} proto=${app.proto === 'TCP' ? 6 : 17} app="${app.name}" sentbyte=${bytesIn} rcvdbyte=${bytesOut} ${threatCategory ? `threat="${threatCategory}"` : ''}`;

    const log: SyslogEntry = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      firewallId: fw.id,
      vendor: fw.vendor,
      facility: 1,
      severity: threatSeverity === 'critical' ? 'critical' : isBlocked ? 'warning' : 'info',
      raw: rawMsg,
      parsed: {
        action,
        sourceIp: srcIp,
        destIp: dstIp,
        sourcePort: flow.sourcePort,
        destPort: app.port,
        protocol: app.proto,
        ruleName: flow.ruleName,
        user
      }
    };

    telemetryStore.addLog(log);

    // Rate-limited notification alert trigger for serious critical attacks
    if (threatSeverity === 'critical' && Date.now() - this.lastAlertTime > 60000) {
      this.lastAlertTime = Date.now();
      notificationService.sendAlert({
        title: 'High-Severity Exploit / C2 Connection Blocked',
        message: `FortiGate-CSIR-SERC intercepted a critical outbound threat to ${dstIp} from internal host ${srcIp} (User: ${user || 'unauthenticated'}). Traffic was dropped by policy SERC_Threat_Prevention_Drop.`,
        severity: 'critical',
        type: 'serious_attack',
        details: {
          threatCategory,
          destinationIp: dstIp,
          sourceHost: srcIp,
          firewallPolicy: 'SERC_Threat_Prevention_Drop'
        }
      }).catch(err => console.warn('Failed to send auto-alert:', err.message));
    }
  }
}

export const telemetrySimulator = new TelemetrySimulator();
