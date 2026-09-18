import { v4 as uuidv4 } from 'uuid';
import { TrafficFlow, SyslogEntry, RuleAction } from '../types/index.js';
import { telemetryStore } from '../storage/telemetry.store.js';
import { influxService, TrafficLogRecord } from '../storage/influx.service.js';
import { notificationService } from '../services/notification.service.js';

interface DepartmentSubnet {
  code: string;
  name: string;
  vlan: number;
  subnet: string; // e.g. "172.17.11"
  zone: string;
  hostPrefix: string;
  segment: string;
  iface: string;
}

export class TelemetrySimulator {
  private timer: NodeJS.Timeout | null = null;
  private lastAlertTime: number = 0;

  // Institutional Subnets across all FortiGate Interfaces & Departmental VLANs
  private departments: DepartmentSubnet[] = [
    // 172.17.0.0/16 Departmental VLANs (Live FortiGate Discovered)
    { code: 'ICTD', name: 'Information Communication Technology (ICTD)', vlan: 11, subnet: '172.17.11', zone: 'ICTD-VLAN 11', hostPrefix: 'ict-ws', segment: '172.17.0.0/16', iface: 'port3' },
    { code: 'BKMD', name: 'Business Dev & Knowledge Mgmt (BKMD)', vlan: 12, subnet: '172.17.12', zone: 'BKMD-VLAN 12', hostPrefix: 'bkmd-term', segment: '172.17.0.0/16', iface: 'port5' },
    { code: 'ASTAR', name: 'Advanced Structural Testing Lab (ASTAR)', vlan: 13, subnet: '172.17.13', zone: 'ASTAR-VLAN 13', hostPrefix: 'astar-daq', segment: '172.17.0.0/16', iface: 'port6' },
    { code: 'SMSL', name: 'Special Materials & Structures (SMSL)', vlan: 14, subnet: '172.17.14', zone: 'SMSL-VLAN 14', hostPrefix: 'smsl-sensor', segment: '172.17.0.0/16', iface: 'port7' },
    { code: 'KRD', name: 'Knowledge Resource & Library (KRD)', vlan: 15, subnet: '172.17.15', zone: 'KRD-VLAN 15', hostPrefix: 'krd-kiosk', segment: '172.17.0.0/16', iface: 'port8' },
    { code: 'ACTEL', name: 'Concrete Testing & Evaluation (ACTEL)', vlan: 16, subnet: '172.17.16', zone: 'ACTEL-VLAN 16', hostPrefix: 'actel-test', segment: '172.17.0.0/16', iface: 'port9' },
    { code: 'NAFAAMS', name: 'Numerical Analysis Facility (NAFAAMS)', vlan: 17, subnet: '172.17.17', zone: 'NAFAAMS-VLAN17', hostPrefix: 'nafaams-cae', segment: '172.17.0.0/16', iface: 'port11' },
    { code: 'STORES', name: 'Purchase & Central Stores (STORES)', vlan: 18, subnet: '172.17.18', zone: 'STORES-VLAN 18', hostPrefix: 'stores-erp', segment: '172.17.0.0/16', iface: 'port12' },
    { code: 'APSML', name: 'Advanced Polymer & Smart Materials (APSML)', vlan: 19, subnet: '172.17.19', zone: 'APSML-VLAN 19', hostPrefix: 'apsml-inst', segment: '172.17.0.0/16', iface: 'port13' },
    { code: 'AML', name: 'Advanced Materials Characterization (AML)', vlan: 20, subnet: '172.17.20', zone: 'AML-VLAN 20', hostPrefix: 'aml-inst', segment: '172.17.0.0/16', iface: 'port13' },
    { code: 'WEL', name: 'Wind Engineering Boundary Layer (WEL)', vlan: 21, subnet: '172.17.21', zone: 'WEL-VLAN 21', hostPrefix: 'windtunnel-daq', segment: '172.17.0.0/16', iface: 'port14' },
    { code: 'TDC', name: 'Tower Testing Research Station (TDC)', vlan: 22, subnet: '172.17.22', zone: 'TDC-VLAN 22', hostPrefix: 'tower-daq', segment: '172.17.0.0/16', iface: 'port15' },
    { code: 'AUDITORIUM', name: 'Campus Auditorium AV Facility', vlan: 23, subnet: '172.17.23', zone: 'AUDITORIUM-23', hostPrefix: 'auditorium-av', segment: '172.17.0.0/16', iface: 'port15' },
    { code: 'SHML', name: 'Structural Health Monitoring (SHML)', vlan: 24, subnet: '172.17.24', zone: 'SHML-VLAN 24', hostPrefix: 'shml-sensor', segment: '172.17.0.0/16', iface: 'port16' },
    { code: 'SERC_GH', name: 'CSIR Guest House & Campus WiFi', vlan: 25, subnet: '172.17.25', zone: 'SERC GH-VLAN 25', hostPrefix: 'gh-wifi', segment: '172.17.0.0/16', iface: 'port17' },
    { code: 'FFL', name: 'Fatigue & Fracture Laboratory (FFL)', vlan: 26, subnet: '172.17.26', zone: 'FFL-VLAN 26', hostPrefix: 'ffl-daq', segment: '172.17.0.0/16', iface: 'port18' },
    { code: 'ACCNT', name: 'Finance & Accounts Division (ACCNT)', vlan: 27, subnet: '172.17.27', zone: 'ACCNT-VLAN 27', hostPrefix: 'accnt-erp', segment: '172.17.0.0/16', iface: 'port19' },
    { code: 'GATE', name: 'Perimeter Security & CCTV (MAIN GTE)', vlan: 28, subnet: '172.17.28', zone: 'MAIN GTE-VLAN28', hostPrefix: 'gate-cctv', segment: '172.17.0.0/16', iface: 'port20' },
    { code: 'QTMNET', name: 'SERC Quantum Computing Network', vlan: 10, subnet: '172.17.10', zone: 'SERC_LAN_QTMNET_2024', hostPrefix: 'qtm-node', segment: '172.17.0.0/16', iface: 'port10' },

    // 172.16.0.0/12 Scope (Physical Links & Clusters)
    { code: 'ACTEL_RIG', name: 'ACTEL Concrete Compression Rig Link', vlan: 9, subnet: '172.16.171', zone: 'port9', hostPrefix: 'actel-rig', segment: '172.16.0.0/12', iface: 'port9' },
    { code: 'NAFAAMS_HPC', name: 'NAFAAMS High-Throughput Cluster Link', vlan: 171, subnet: '172.31.1', zone: 'port11', hostPrefix: 'cae-cluster', segment: '172.16.0.0/12', iface: 'port11' },

    // 192.168.0.0/16 Scope (Management & Links)
    { code: 'MGMT', name: 'Dedicated Out-of-Band Hardware Mgmt', vlan: 99, subnet: '192.168.1', zone: 'mgmt', hostPrefix: 'mgmt-ipmi', segment: '192.168.0.0/16', iface: 'mgmt' },

    // 10.0.0.0/8 Scope (Datacenter, CAE, HPC, VPN)
    { code: 'DATACENTER', name: 'Central Datacenter Virtualization', vlan: 2, subnet: '10.20.10', zone: 'SERC_Srv_access', hostPrefix: 'serc-srv', segment: '10.0.0.0/8', iface: 'port2' },
    { code: 'HPC', name: 'Param-SERC Supercomputer HPC Tier', vlan: 84, subnet: '10.10.20', zone: 'HPC-Cluster', hostPrefix: 'hpc-node', segment: '10.0.0.0/8', iface: 'port25' },
    { code: 'CAD', name: 'Structural CAE Workstations', vlan: 40, subnet: '10.10.40', zone: 'ICT_Lan_Access', hostPrefix: 'cad-ws', segment: '10.0.0.0/8', iface: 'port3' },
    { code: 'VPN', name: 'Remote SSL-VPN Research Scientists', vlan: 1, subnet: '10.212.134', zone: 'ssl.root', hostPrefix: 'vpn-user', segment: '10.0.0.0/8', iface: 'ssl.root' }
  ];

  private apps = [
    { name: 'Ansys-FEA-HPC', port: 1055, proto: 'TCP', baseBytes: 1250000, category: 'High Performance Computing', uploadRatio: 0.72 },
    { name: 'PostgreSQL-Cluster', port: 5432, proto: 'TCP', baseBytes: 840000, category: 'Database Systems', uploadRatio: 0.52 },
    { name: 'OpenMPI-Parallel', port: 8200, proto: 'TCP', baseBytes: 1450000, category: 'High Performance Computing', uploadRatio: 0.68 },
    { name: 'Lustre-Storage-Sync', port: 988, proto: 'TCP', baseBytes: 1850000, category: 'Storage Fabric', uploadRatio: 0.81 },
    { name: 'GitHub-Git-SSH', port: 22, proto: 'TCP', baseBytes: 320000, category: 'Software Engineering', uploadRatio: 0.38 },
    { name: 'HTTPS-Web-Portal', port: 443, proto: 'TCP', baseBytes: 520000, category: 'Web Traffic', uploadRatio: 0.22 },
    { name: 'ScienceDirect-Journals', port: 443, proto: 'TCP', baseBytes: 940000, category: 'Research Library', uploadRatio: 0.14 },
    { name: 'e-Office-CSIR', port: 8443, proto: 'TCP', baseBytes: 380000, category: 'Enterprise Office', uploadRatio: 0.35 },
    { name: 'Microsoft-365', port: 443, proto: 'TCP', baseBytes: 460000, category: 'Cloud Collaboration', uploadRatio: 0.42 },
    { name: 'Zoom-Video', port: 8801, proto: 'UDP', baseBytes: 680000, category: 'Collaboration', uploadRatio: 0.48 },
    { name: 'FortiOS-Admin-HTTPS', port: 443, proto: 'TCP', baseBytes: 120000, category: 'Network Management', uploadRatio: 0.28 },
    { name: 'DNS-Queries', port: 53, proto: 'UDP', baseBytes: 4200, category: 'Infrastructure', uploadRatio: 0.50 },
    // Unapproved & Illicit Categories
    { name: 'BitTorrent-P2P', port: 6881, proto: 'TCP', baseBytes: 2400000, category: 'Unapproved Traffic', uploadRatio: 0.65 },
    { name: 'uTorrent-Client', port: 6889, proto: 'TCP', baseBytes: 1950000, category: 'Unapproved Traffic', uploadRatio: 0.70 },
    { name: 'Internet-Download-Manager', port: 443, proto: 'TCP', baseBytes: 3800000, category: 'Download Manager', uploadRatio: 0.12 },
    { name: 'MegaDownloader', port: 443, proto: 'TCP', baseBytes: 3100000, category: 'Download Manager', uploadRatio: 0.15 },
    { name: '123Movies-Streaming', port: 443, proto: 'TCP', baseBytes: 2800000, category: 'Movie Sites', uploadRatio: 0.08 },
    { name: 'YTS-Torrent-Movie-HD', port: 443, proto: 'TCP', baseBytes: 4200000, category: 'Movie Downloads', uploadRatio: 0.45 },
    { name: 'Popcorn-Time-Streaming', port: 8008, proto: 'TCP', baseBytes: 3400000, category: 'Movie Sites', uploadRatio: 0.30 },
    { name: 'Unofficial-IPTV-Stream', port: 8000, proto: 'UDP', baseBytes: 2600000, category: 'Unofficial Media', uploadRatio: 0.10 },
    { name: 'Steam-Gaming-Download', port: 27015, proto: 'UDP', baseBytes: 3900000, category: 'Unofficial Media', uploadRatio: 0.18 },
    { name: 'Discord-Voice-Media', port: 50001, proto: 'UDP', baseBytes: 850000, category: 'Unofficial Media', uploadRatio: 0.50 },
    { name: 'Mirai-Botnet-C2', port: 45137, proto: 'UDP', baseBytes: 4200, category: 'Botnets & Malware', uploadRatio: 0.90 },
    { name: 'Tor-Darknet-Relay', port: 9001, proto: 'TCP', baseBytes: 150000, category: 'Darknet & Circumvention', uploadRatio: 0.55 },
    { name: 'Monero-XMR-Mining', port: 3333, proto: 'TCP', baseBytes: 12000, category: 'Crypto Mining', uploadRatio: 0.85 },
    { name: 'Psiphon-VPN-Circumvention', port: 443, proto: 'TCP', baseBytes: 650000, category: 'Proxy Bypass', uploadRatio: 0.45 }
  ];

  private externalTargets = [
    { ip: '142.250.190.46', name: 'google-cdn.1e100.net', country: 'US' },
    { ip: '1.1.1.1', name: 'one.one.one.one', country: 'AU' },
    { ip: '8.8.8.8', name: 'dns.google', country: 'US' },
    { ip: '52.96.166.130', name: 'outlook.office365.com', country: 'US' },
    { ip: '13.107.6.158', name: 'teams.microsoft.com', country: 'US' },
    { ip: '140.82.114.4', name: 'lb-140-82-114-4-iad.github.com', country: 'US' },
    { ip: '104.16.132.229', name: 'cloudflare-net.cloudflare.com', country: 'US' },
    { ip: '14.139.60.106', name: 'nkn-gateway.delhi.ernet.in', country: 'IN' },
    { ip: '164.100.158.12', name: 'nic-eoffice.gov.in', country: 'IN' },
    { ip: '198.51.100.45', name: 'sciencedirect.elsevier.com', country: 'NL' },
    { ip: '203.0.113.88', name: 'ieeexplore.ieee.org', country: 'US' },
    // Threat / Illicit Targets
    { ip: '185.220.101.5', name: 'tor-exit-relay.zwiebelfreunde.de', country: 'DE' },
    { ip: '194.26.29.112', name: 'p2p-swarm-tracker.ru', country: 'RU' },
    { ip: '193.32.162.155', name: 'scanner-host.censys-inspect.org', country: 'US' },
    { ip: '45.155.205.233', name: 'mirai-botnet-c2-beacon.su', country: 'RU' },
    { ip: '176.9.54.21', name: 'stratum-xmr-pool.de', country: 'DE' },
    { ip: '198.144.121.93', name: '123movies-hub.stream', country: 'IS' },
    { ip: '104.21.32.11', name: 'yts-movies.mx', country: 'US' },
    { ip: '185.193.125.44', name: 'rapidgator-mirror.net', country: 'CY' },
    { ip: '146.70.157.12', name: 'free-iptv-live.su', country: 'RU' },
    { ip: '162.254.197.36', name: 'valve-steam-content.net', country: 'US' },
    { ip: '185.220.102.8', name: 'psiphon-hop-node.me', country: 'CH' }
  ];

  private users = [
    'serc/dr.raman', 'serc/admin_karthik', 'serc/research_user',
    'serc/sysadmin', 'serc/director_office', 'SYSTEM/serc_backup',
    'serc/hpc_operator', 'serc/wind_analyst', 'serc/materials_pi'
  ];

  public start() {
    console.log('[TelemetrySimulator] Full-Spectrum Institutional Traffic Generator active across all 46+ FortiGate interfaces & VLANs.');

    // Seed 140 initial events to populate InfluxDB time-series immediately
    for (let i = 0; i < 140; i++) {
      this.generateTick();
    }

    // High frequency generator: fires every 800ms
    this.timer = setInterval(() => {
      this.generateTick();
    }, 800);
  }

  public stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private getRandomInternalHost() {
    const dept = this.departments[Math.floor(Math.random() * this.departments.length)];
    const hostNumber = Math.floor(Math.random() * 240) + 2; // .2 to .242
    const ip = `${dept.subnet}.${hostNumber}`;
    const name = `${dept.hostPrefix}${hostNumber}.${dept.code.toLowerCase()}.serc.res.in`;
    return { ip, name, dept: dept.name, zone: dept.zone, vlan: dept.vlan, segment: dept.segment, iface: dept.iface };
  }

  private generateTick() {
    const fw = { id: 'fw-fg-01', vendor: 'fortinet' as const };
    const app = this.apps[Math.floor(Math.random() * this.apps.length)];
    const internalHost = this.getRandomInternalHost();
    const external = this.externalTargets[Math.floor(Math.random() * this.externalTargets.length)];

    // Determine direction: 70% outbound, 18% inbound, 12% internal
    const dirRand = Math.random();
    let direction: 'inbound' | 'outbound' | 'internal' = 'outbound';
    let srcIp = internalHost.ip;
    let srcName = internalHost.name;
    let srcDept = internalHost.dept;
    let dstIp = external.ip;
    let dstName = external.name;
    let dstCountry = external.country;

    if (dirRand < 0.18) {
      direction = 'inbound';
      srcIp = external.ip;
      srcName = external.name;
      srcDept = 'External Internet (WAN)';
      dstIp = internalHost.ip;
      dstName = internalHost.name;
      dstCountry = 'IN';
    } else if (dirRand < 0.30) {
      direction = 'internal';
      const targetHost = this.getRandomInternalHost();
      dstIp = targetHost.ip;
      dstName = targetHost.name;
      dstCountry = 'IN';
    }

    // Determine security blocks & threat categories
    let isBlocked = false;
    let threatCategory: string | undefined;
    let threatSeverity: TrafficFlow['threatSeverity'] = 'none';

    if (app.name === 'BitTorrent-P2P' || app.name === 'uTorrent-Client') {
      isBlocked = true;
      threatCategory = 'Unapproved BitTorrent P2P File Sharing Blocked';
      threatSeverity = 'high';
    } else if (app.name === 'Internet-Download-Manager' || app.name === 'MegaDownloader') {
      isBlocked = true;
      threatCategory = 'Unapproved Multi-Part Bulk Download Manager Intercepted';
      threatSeverity = 'high';
    } else if (app.name === '123Movies-Streaming' || app.name === 'YTS-Torrent-Movie-HD' || app.name === 'Popcorn-Time-Streaming') {
      isBlocked = true;
      threatCategory = 'Pirated Movie Torrent & Streaming Service Blocked';
      threatSeverity = 'critical';
    } else if (app.name === 'Unofficial-IPTV-Stream' || app.name === 'Steam-Gaming-Download') {
      isBlocked = true;
      threatCategory = 'Unofficial High-Bandwidth Media Stream Blocked';
      threatSeverity = 'high';
    } else if (app.name === 'Monero-XMR-Mining') {
      isBlocked = true;
      threatCategory = 'Unapproved Cryptocurrency Mining Pool Blocked';
      threatSeverity = 'critical';
    } else if (app.name === 'Psiphon-VPN-Circumvention' || app.name === 'Tor-Darknet-Relay') {
      isBlocked = true;
      threatCategory = 'Circumvention Proxy / Darknet Gateway Attempt Dropped';
      threatSeverity = 'critical';
    } else if (app.name === 'Mirai-Botnet-C2' || external.ip === '45.155.205.233') {
      isBlocked = true;
      threatCategory = 'Mirai/Botnet Command-and-Control Probe Dropped';
      threatSeverity = 'critical';
    } else if (external.ip === '185.220.101.5') {
      isBlocked = true;
      threatCategory = 'Known Tor Exit Node / C2 Beacon Intercepted';
      threatSeverity = 'critical';
    } else if (external.ip === '176.9.54.21') {
      isBlocked = true;
      threatCategory = 'Unapproved Cryptocurrency Mining Pool Blocked';
      threatSeverity = 'critical';
    } else if (direction === 'internal' && internalHost.vlan === 28 && Math.random() < 0.4) {
      isBlocked = true;
      threatCategory = 'Inter-VLAN Security Boundary Violation';
      threatSeverity = 'medium';
    } else if (Math.random() < 0.06) {
      isBlocked = true;
      threatCategory = 'Perimeter Port Scan / SYN Flood Mitigated';
      threatSeverity = 'low';
    }

    const action: RuleAction = isBlocked ? 'drop' : 'allow';
    const policyName = isBlocked
      ? (threatSeverity === 'critical' ? 'SERC_IPS_Threat_Mitigation' : 'SERC_InterVLAN_Drop')
      : (direction === 'outbound' ? 'WAN_Core_Internet_Routing' : direction === 'inbound' ? 'Perimeter_Inbound_NAT' : 'Datacenter_Core_InterVLAN');

    const bytesMultiplier = Math.random() * 2.5 + 0.5;
    const totalVolume = Math.floor(app.baseBytes * bytesMultiplier);
    const bytesOut = direction === 'inbound'
      ? Math.floor(totalVolume * 0.2)
      : Math.floor(totalVolume * (app.uploadRatio + (Math.random() * 0.1 - 0.05)));
    const bytesIn = Math.max(512, totalVolume - bytesOut);

    const nowIso = new Date().toISOString();
    const sourcePort = Math.floor(Math.random() * 45000) + 10240;
    const user = Math.random() > 0.4 ? this.users[Math.floor(Math.random() * this.users.length)] : undefined;

    // 1. InfluxDB Time-Series Record
    const trafficRecord: TrafficLogRecord = {
      id: uuidv4(),
      timestamp: nowIso,
      firewallId: fw.id,
      direction,
      action,
      sourceIp: srcIp,
      sourcePort,
      sourceName: srcName,
      sourceDept: srcDept,
      destIp: dstIp,
      destPort: app.port,
      destName: dstName,
      destCountry: dstCountry,
      protocol: app.proto,
      application: app.name,
      bytesIn,
      bytesOut,
      packetsIn: Math.floor(bytesIn / 1200) + 1,
      packetsOut: Math.floor(bytesOut / 1200) + 1,
      policyId: isBlocked ? '99' : '166',
      policyName,
      severity: threatSeverity === 'critical' ? 'critical' : isBlocked ? 'warning' : 'info',
      threatCategory,
      vlanId: internalHost.vlan,
      vlanName: internalHost.zone,
      interface: internalHost.iface,
      subnetSegment: internalHost.segment,
      rawLog: `date=2026-09-18 time=12:00:00 devname="FortiGate-CSIR-SERC" devid="FG600F12345678" type="traffic" direction="${direction}" action="${action === 'allow' ? 'accept' : 'deny'}" policyname="${policyName}" srcip=${srcIp} srcport=${sourcePort} dstip=${dstIp} dstport=${app.port} proto=${app.proto === 'TCP' ? 6 : 17} app="${app.name}" sentbyte=${bytesIn} rcvdbyte=${bytesOut} vlan=${internalHost.vlan} vlan_name="${internalHost.zone}" ${threatCategory ? `threat="${threatCategory}"` : ''}`
    };

    influxService.storeTrafficLog(trafficRecord);

    // 2. Real-Time WebSocket Traffic Flow
    const flow: TrafficFlow = {
      id: trafficRecord.id,
      timestamp: nowIso,
      firewallId: fw.id,
      vendor: fw.vendor,
      sourceIp: srcIp,
      destIp: dstIp,
      sourcePort,
      destPort: app.port,
      protocol: app.proto as any,
      application: app.name,
      userIdentity: user,
      ruleName: policyName,
      action,
      bytesIn,
      bytesOut,
      packetsIn: trafficRecord.packetsIn,
      packetsOut: trafficRecord.packetsOut,
      threatCategory,
      threatSeverity,
      countryDest: dstCountry
    };

    telemetryStore.addFlow(flow);

    // 3. Syslog Entry for Syslog Console
    const log: SyslogEntry = {
      id: trafficRecord.id,
      timestamp: nowIso,
      firewallId: fw.id,
      vendor: fw.vendor,
      facility: 1,
      severity: trafficRecord.severity,
      raw: trafficRecord.rawLog || '',
      parsed: {
        action,
        sourceIp: srcIp,
        destIp: dstIp,
        sourcePort,
        destPort: app.port,
        protocol: app.proto,
        ruleName: policyName,
        user
      }
    };

    telemetryStore.addLog(log);

    // Rate-limited auto-alerts on critical security exploits
    if (threatSeverity === 'critical' && Date.now() - this.lastAlertTime > 60000) {
      this.lastAlertTime = Date.now();
      notificationService.sendAlert({
        title: 'FortiGate IPS Threat Intercepted',
        message: `FortiGate-CSIR-SERC intercepted a critical outbound threat (${threatCategory}) between ${srcIp} and ${dstIp}. Connection dropped immediately by policy ${policyName}.`,
        severity: 'critical',
        type: 'serious_attack',
        details: {
          threatCategory,
          direction,
          sourceHost: srcIp,
          destinationHost: dstIp,
          application: app.name
        }
      }).catch(err => console.warn('Failed to send auto-alert:', err.message));
    }
  }
}

export const telemetrySimulator = new TelemetrySimulator();
