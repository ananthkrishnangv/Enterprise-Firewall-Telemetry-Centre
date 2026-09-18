import {
  TrafficFlow, SyslogEntry, SNMPProbeData, AlertNotification,
  TopVisitedSite, SecurityThreatItem, TopIpUsageItem, WebFilterCategoryItem, PolicyFlowItem,
  BentoTrafficAnalytics, IpAppIdMapping, AppIdUsageItem, HeavyDataIpItem, TopUploadItem, TopDownloadItem,
  UnapprovedViolationRecord, UnapprovedCategory, UnapprovedTrafficAnalytics, OffendingDeviceSummary
} from '../types/index.js';
import { config } from '../config.js';

class TelemetryStore {
  private flows: TrafficFlow[] = [];
  private logs: SyslogEntry[] = [];
  private alerts: AlertNotification[] = [];
  private snmpHistory: Map<string, { timestamp: string; cpu: number; mem: number; conns: number; inBps: number; outBps: number }[]> = new Map();
  private logSubscribers: ((entry: SyslogEntry) => void)[] = [];
  private flowSubscribers: ((flow: TrafficFlow) => void)[] = [];
  private alertSubscribers: ((alert: AlertNotification) => void)[] = [];

  constructor() {
    this.initDefaultAlerts();
  }

  private initDefaultAlerts() {
    this.alerts = [
      {
        id: 'alt-101',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        firewallId: 'fw-fg-01',
        firewallName: 'FortiGate-CSIR-SERC (10.10.3.15)',
        severity: 'critical',
        title: 'FortiOS IPS: Anti-Bot Flagged C2 Outbound Traffic',
        description: 'Host 10.10.40.85 attempted connection to known Tor/C2 node 198.51.100.244 on port 443 - Dropped by FortiGate UTM.',
        category: 'security_threat',
        acknowledged: false,
      },
      {
        id: 'alt-102',
        timestamp: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
        firewallId: 'fw-fg-01',
        firewallName: 'FortiGate-CSIR-SERC (10.10.3.15)',
        severity: 'warning',
        title: 'Social Networking Bandwidth Throttle Triggered',
        description: 'Host 10.10.40.85 exceeded 2.0 Mbps cap on LinkedIn/Video stream - traffic rate-limited via Policy 20.',
        category: 'policy_violation',
        acknowledged: false,
      },
      {
        id: 'alt-103',
        timestamp: new Date(Date.now() - 95 * 60 * 1000).toISOString(),
        firewallId: 'fw-fg-01',
        firewallName: 'FortiGate-CSIR-SERC (10.10.3.15)',
        severity: 'high',
        title: 'SNMP Probe: WAN port1 Interface Utilization > 88%',
        description: 'Interface port1 (Primary WAN NKN) sustained 88.4% saturation during HPC dataset sync.',
        category: 'snmp_threshold',
        acknowledged: true,
      },
      {
        id: 'alt-104',
        timestamp: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
        firewallId: 'fw-fg-01',
        firewallName: 'FortiGate-CSIR-SERC (10.10.3.15)',
        severity: 'warning',
        title: 'FortiOS SSL-VPN Concurrent Sessions Surge',
        description: 'Remote SSL-VPN tunnels reached 38 concurrent user sessions through ssl.root interface.',
        category: 'security_threat',
        acknowledged: false,
      }
    ];
  }

  public addFlow(flow: TrafficFlow) {
    this.flows.unshift(flow);
    if (this.flows.length > config.maxTelemetryRingSize) {
      this.flows.pop();
    }
    this.flowSubscribers.forEach(cb => cb(flow));
  }

  public addLog(log: SyslogEntry) {
    this.logs.unshift(log);
    if (this.logs.length > config.maxLogRingSize) {
      this.logs.pop();
    }
    this.logSubscribers.forEach(cb => cb(log));
  }

  public addAlert(alert: AlertNotification) {
    this.alerts.unshift(alert);
    this.alertSubscribers.forEach(cb => cb(alert));
  }

  public recordSNMP(firewallId: string, data: SNMPProbeData) {
    const history = this.snmpHistory.get(firewallId) || [];
    
    // Sum interface throughput
    let totalIn = 0;
    let totalOut = 0;
    for (const iface of data.interfaces) {
      totalIn += iface.inBps;
      totalOut += iface.outBps;
    }

    history.push({
      timestamp: data.lastPolled,
      cpu: data.cpuUtilPercent,
      mem: data.memoryUtilPercent,
      conns: data.concurrentConnections,
      inBps: totalIn,
      outBps: totalOut
    });

    if (history.length > 60) {
      history.shift();
    }
    this.snmpHistory.set(firewallId, history);
  }

  public getSNMPHistory(firewallId: string) {
    return this.snmpHistory.get(firewallId) || [];
  }

  public getRecentFlows(limit: number = 100, filters?: { firewallId?: string; action?: string; app?: string; search?: string }) {
    let result = this.flows;
    if (filters?.firewallId) {
      result = result.filter(f => f.firewallId === filters.firewallId);
    }
    if (filters?.action) {
      result = result.filter(f => f.action === filters.action);
    }
    if (filters?.app) {
      result = result.filter(f => f.application.toLowerCase().includes(filters.app!.toLowerCase()));
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(f => 
        f.sourceIp.includes(q) || 
        f.destIp.includes(q) || 
        f.ruleName.toLowerCase().includes(q) ||
        (f.userIdentity && f.userIdentity.toLowerCase().includes(q))
      );
    }
    return result.slice(0, limit);
  }

  public getRecentLogs(limit: number = 100, filters?: { firewallId?: string; severity?: string; search?: string }) {
    let result = this.logs;
    if (filters?.firewallId) {
      result = result.filter(l => l.firewallId === filters.firewallId);
    }
    if (filters?.severity) {
      result = result.filter(l => l.severity === filters.severity);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(l => 
        l.raw.toLowerCase().includes(q) ||
        (l.parsed.sourceIp && l.parsed.sourceIp.includes(q)) ||
        (l.parsed.destIp && l.parsed.destIp.includes(q)) ||
        (l.parsed.ruleName && l.parsed.ruleName.toLowerCase().includes(q))
      );
    }
    return result.slice(0, limit);
  }

  public getTopTalkers(limit: number = 10) {
    const srcMap = new Map<string, { ip: string; bytes: number; flows: number; country?: string }>();
    const dstMap = new Map<string, { ip: string; bytes: number; flows: number; country?: string }>();
    const appMap = new Map<string, { app: string; bytes: number; flows: number }>();
    const portMap = new Map<number, { port: number; bytes: number; flows: number }>();

    for (const f of this.flows.slice(0, 2000)) {
      const totalBytes = f.bytesIn + f.bytesOut;
      
      // Source IP
      const src = srcMap.get(f.sourceIp) || { ip: f.sourceIp, bytes: 0, flows: 0 };
      src.bytes += totalBytes;
      src.flows += 1;
      srcMap.set(f.sourceIp, src);

      // Dest IP
      const dst = dstMap.get(f.destIp) || { ip: f.destIp, bytes: 0, flows: 0, country: f.countryDest };
      dst.bytes += totalBytes;
      dst.flows += 1;
      dstMap.set(f.destIp, dst);

      // Application
      const app = appMap.get(f.application) || { app: f.application, bytes: 0, flows: 0 };
      app.bytes += totalBytes;
      app.flows += 1;
      appMap.set(f.application, app);

      // Dest Port
      const port = portMap.get(f.destPort) || { port: f.destPort, bytes: 0, flows: 0 };
      port.bytes += totalBytes;
      port.flows += 1;
      portMap.set(f.destPort, port);
    }

    return {
      topSources: Array.from(srcMap.values()).sort((a, b) => b.bytes - a.bytes).slice(0, limit),
      topDestinations: Array.from(dstMap.values()).sort((a, b) => b.bytes - a.bytes).slice(0, limit),
      topApplications: Array.from(appMap.values()).sort((a, b) => b.bytes - a.bytes).slice(0, limit),
      topPorts: Array.from(portMap.values()).sort((a, b) => b.bytes - a.bytes).slice(0, limit),
    };
  }

  public getTrafficSummary() {
    let totalBytesIn = 0;
    let totalBytesOut = 0;
    let allowedCount = 0;
    let droppedCount = 0;
    const vendorCounts: Record<string, number> = {};
    const threats: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0 };

    const recent = this.flows.slice(0, 1000);
    for (const f of recent) {
      totalBytesIn += f.bytesIn;
      totalBytesOut += f.bytesOut;
      if (f.action === 'allow') allowedCount++;
      else droppedCount++;

      vendorCounts[f.vendor] = (vendorCounts[f.vendor] || 0) + 1;
      if (f.threatSeverity && f.threatSeverity !== 'none') {
        threats[f.threatSeverity] = (threats[f.threatSeverity] || 0) + 1;
      }
    }

    return {
      totalFlows: this.flows.length,
      totalBytesIn,
      totalBytesOut,
      allowedCount,
      droppedCount,
      blockRatePercent: recent.length > 0 ? ((droppedCount / recent.length) * 100).toFixed(1) : '0',
      vendorDistribution: vendorCounts,
      threatDistribution: threats,
    };
  }

  public getAlerts() {
    return this.alerts;
  }

  public acknowledgeAlert(id: string) {
    const alert = this.alerts.find(a => a.id === id);
    if (alert) {
      alert.acknowledged = true;
      return true;
    }
    return false;
  }

  public onLog(cb: (entry: SyslogEntry) => void) {
    this.logSubscribers.push(cb);
  }

  public onFlow(cb: (flow: TrafficFlow) => void) {
    this.flowSubscribers.push(cb);
  }

  public onAlert(cb: (alert: AlertNotification) => void) {
    this.alertSubscribers.push(cb);
  }

  public getTopVisitedSites(): TopVisitedSite[] {
    const totalFlowCount = Math.max(this.flows.length, 1);
    const scaleFactor = totalFlowCount / 100;
    return [
      {
        rank: 1,
        domain: 'github.com',
        category: 'Software & Development',
        requests: Math.floor(4820 * scaleFactor) + 120,
        bytes: Math.floor(3480000000 * scaleFactor) + 85000000,
        action: 'allow',
        policyApplied: 'Policy 20: Outbound Campus Internet (NKN)'
      },
      {
        rank: 2,
        domain: 'serc.res.in',
        category: 'Research & Science',
        requests: Math.floor(4120 * scaleFactor) + 210,
        bytes: Math.floor(2850000000 * scaleFactor) + 62000000,
        action: 'allow',
        policyApplied: 'Policy 10: Inbound Public Portal HTTPS'
      },
      {
        rank: 3,
        domain: 'csir.res.in',
        category: 'Research & Science',
        requests: Math.floor(3890 * scaleFactor) + 140,
        bytes: Math.floor(2120000000 * scaleFactor) + 41000000,
        action: 'allow',
        policyApplied: 'Policy 20: Outbound Campus Internet (NKN)'
      },
      {
        rank: 4,
        domain: 'arxiv.org',
        category: 'Research & Science',
        requests: Math.floor(3100 * scaleFactor) + 95,
        bytes: Math.floor(4200000000 * scaleFactor) + 110000000,
        action: 'allow',
        policyApplied: 'Policy 20: Outbound Campus Internet (NKN)'
      },
      {
        rank: 5,
        domain: 'microsoft.com',
        category: 'Collaboration & Office',
        requests: Math.floor(2940 * scaleFactor) + 80,
        bytes: Math.floor(3100000000 * scaleFactor) + 70000000,
        action: 'allow',
        policyApplied: 'Policy 20: Outbound Campus Internet (NKN)'
      },
      {
        rank: 6,
        domain: 'aws.amazon.com',
        category: 'Cloud & Compute',
        requests: Math.floor(2450 * scaleFactor) + 65,
        bytes: Math.floor(2900000000 * scaleFactor) + 90000000,
        action: 'allow',
        policyApplied: 'Policy 20: Outbound Campus Internet (NKN)'
      },
      {
        rank: 7,
        domain: 'ieee.org',
        category: 'Research & Science',
        requests: Math.floor(1980 * scaleFactor) + 50,
        bytes: Math.floor(1650000000 * scaleFactor) + 38000000,
        action: 'allow',
        policyApplied: 'Policy 20: Outbound Campus Internet (NKN)'
      },
      {
        rank: 8,
        domain: 'researchgate.net',
        category: 'Research & Science',
        requests: Math.floor(1720 * scaleFactor) + 40,
        bytes: Math.floor(1420000000 * scaleFactor) + 29000000,
        action: 'allow',
        policyApplied: 'Policy 20: Outbound Campus Internet (NKN)'
      },
      {
        rank: 9,
        domain: 'linkedin.com',
        category: 'Social Networking',
        requests: Math.floor(1420 * scaleFactor) + 35,
        bytes: Math.floor(820000000 * scaleFactor) + 18000000,
        action: 'monitored',
        policyApplied: 'Policy 20: WebFilter Monitored Profile'
      },
      {
        rank: 10,
        domain: 'twitter.com / x.com',
        category: 'Social Networking',
        requests: Math.floor(1180 * scaleFactor) + 25,
        bytes: Math.floor(640000000 * scaleFactor) + 14000000,
        action: 'throttled',
        policyApplied: 'Policy 20: Traffic Shaping (Max 2 Mbps/Host)'
      },
      {
        rank: 11,
        domain: 'youtube.com',
        category: 'Streaming Media',
        requests: Math.floor(1040 * scaleFactor) + 30,
        bytes: Math.floor(2800000000 * scaleFactor) + 85000000,
        action: 'throttled',
        policyApplied: 'Policy 20: Traffic Shaping (Max 5 Mbps/Host)'
      },
      {
        rank: 12,
        domain: 'facebook.com',
        category: 'Social Networking',
        requests: Math.floor(610 * scaleFactor) + 15,
        bytes: Math.floor(240000000 * scaleFactor) + 5000000,
        action: 'throttled',
        policyApplied: 'Policy 20: Non-Work Bandwidth Restricted'
      }
    ];
  }

  public getTopThreats(): SecurityThreatItem[] {
    return [
      {
        id: 'th-01',
        signature: 'CVE-2024-3400 PAN-OS Command Injection Exploit Probe',
        category: 'Intrusion Exploit',
        severity: 'critical',
        sourceIp: '185.220.101.5',
        country: 'DE',
        targetPort: 443,
        service: 'HTTPS',
        hits: 142,
        action: 'dropped',
        lastSeen: new Date(Date.now() - 2 * 60 * 1000).toISOString()
      },
      {
        id: 'th-02',
        signature: 'Known Russian Tor Exit Node / Cobalt Strike C2 Beacon',
        category: 'Command & Control',
        severity: 'critical',
        sourceIp: '198.51.100.24',
        country: 'RU',
        targetPort: 8801,
        service: 'TCP/UDP',
        hits: 89,
        action: 'dropped',
        lastSeen: new Date(Date.now() - 5 * 60 * 1000).toISOString()
      },
      {
        id: 'th-03',
        signature: 'Apache Log4j JNDI Remote Code Execution Probe (CVE-2021-44228)',
        category: 'Intrusion Exploit',
        severity: 'critical',
        sourceIp: '45.142.214.8',
        country: 'NL',
        targetPort: 8080,
        service: 'HTTP-Alt',
        hits: 64,
        action: 'dropped',
        lastSeen: new Date(Date.now() - 11 * 60 * 1000).toISOString()
      },
      {
        id: 'th-04',
        signature: 'Brute-Force SSH Authentication Flood Spike',
        category: 'Brute Force',
        severity: 'high',
        sourceIp: '103.151.125.10',
        country: 'CN',
        targetPort: 22,
        service: 'SSH',
        hits: 512,
        action: 'dropped',
        lastSeen: new Date(Date.now() - 18 * 60 * 1000).toISOString()
      },
      {
        id: 'th-05',
        signature: 'SQL Injection in Query String (UNION SELECT / OR 1=1)',
        category: 'Web Attack',
        severity: 'high',
        sourceIp: '194.38.20.11',
        country: 'UA',
        targetPort: 443,
        service: 'HTTPS',
        hits: 78,
        action: 'dropped',
        lastSeen: new Date(Date.now() - 26 * 60 * 1000).toISOString()
      },
      {
        id: 'th-06',
        signature: 'Mirai Botnet SYN Flood Volumetric Anomaly',
        category: 'Reconnaissance',
        severity: 'medium',
        sourceIp: '193.106.191.24',
        country: 'RO',
        targetPort: 23,
        service: 'Telnet/Scanner',
        hits: 1205,
        action: 'dropped',
        lastSeen: new Date(Date.now() - 34 * 60 * 1000).toISOString()
      },
      {
        id: 'th-07',
        signature: 'Unapproved P2P BitTorrent Protocol Signature',
        category: 'Malware',
        severity: 'medium',
        sourceIp: '10.10.40.85',
        country: 'IN',
        targetPort: 6881,
        service: 'BitTorrent',
        hits: 310,
        action: 'dropped',
        lastSeen: new Date(Date.now() - 41 * 60 * 1000).toISOString()
      },
      {
        id: 'th-08',
        signature: 'Cryptocurrency Stratum Mining TCP Beacon',
        category: 'Malware',
        severity: 'low',
        sourceIp: '10.10.20.15',
        country: 'IN',
        targetPort: 3333,
        service: 'Stratum',
        hits: 42,
        action: 'dropped',
        lastSeen: new Date(Date.now() - 55 * 60 * 1000).toISOString()
      }
    ];
  }

  public getTopIpUsage(): TopIpUsageItem[] {
    return [
      {
        ip: '10.10.20.15',
        hostname: 'serc-hpc-cluster-node01.serc.res.in',
        zone: 'SERC_Srv_access (port2)',
        bytesIn: 8450000000,
        bytesOut: 6210000000,
        totalBytes: 14660000000,
        flowsCount: 1420,
        primaryService: 'HPC Research Sync / MPI'
      },
      {
        ip: '10.10.3.45',
        hostname: 'serc-web-portal-prod.serc.res.in',
        zone: 'SERC_Srv_access (port2)',
        bytesIn: 5820000000,
        bytesOut: 7910000000,
        totalBytes: 13730000000,
        flowsCount: 2840,
        primaryService: 'HTTPS Public Portal (port1 WAN)'
      },
      {
        ip: '10.10.40.85',
        hostname: 'cad-cae-workstation-lab3.serc.res.in',
        zone: 'ICT_Lan_Access (port3)',
        bytesIn: 4120000000,
        bytesOut: 1940000000,
        totalBytes: 6060000000,
        flowsCount: 920,
        primaryService: 'Ansys / Structural Finite Element Modeling'
      },
      {
        ip: '10.10.12.102',
        hostname: 'ict-netops-admin.serc.res.in',
        zone: 'ICT_Lan_Access (port3)',
        bytesIn: 2840000000,
        bytesOut: 1420000000,
        totalBytes: 4260000000,
        flowsCount: 610,
        primaryService: 'SSH / SNMP / Firewall Management'
      },
      {
        ip: '10.20.10.50',
        hostname: 'serc-db-primary.serc.res.in',
        zone: 'SERC_Srv_access (port2)',
        bytesIn: 3410000000,
        bytesOut: 3950000000,
        totalBytes: 7360000000,
        flowsCount: 1840,
        primaryService: 'PostgreSQL / Research Archives'
      },
      {
        ip: '10.30.0.9',
        hostname: 'director-office-terminal.serc.res.in',
        zone: 'ICT_Lan_Access (port3)',
        bytesIn: 1850000000,
        bytesOut: 920000000,
        totalBytes: 2770000000,
        flowsCount: 450,
        primaryService: 'e-Office CSIR / Video Conference'
      },
      {
        ip: '192.168.100.14',
        hostname: 'library-digital-kiosk.serc.res.in',
        zone: 'ICT_Lan_Access (port3)',
        bytesIn: 1420000000,
        bytesOut: 480000000,
        totalBytes: 1900000000,
        flowsCount: 380,
        primaryService: 'IEEE / ScienceDirect Journal Access'
      }
    ];
  }

  public getWebFilterCategories(): WebFilterCategoryItem[] {
    return [
      {
        category: 'Academic, Science & Research',
        percentage: 42.5,
        requestCount: 18420,
        bytes: 14850000000,
        policyNote: 'Full Speed Direct Pipe (NKN Unrestricted)'
      },
      {
        category: 'Cloud Infrastructure & Computing (AWS/Azure)',
        percentage: 23.8,
        requestCount: 9840,
        bytes: 8920000000,
        policyNote: 'Allowed with SSL Deep Packet Inspection'
      },
      {
        category: 'Software Repositories & Git (GitHub/GitLab)',
        percentage: 16.4,
        requestCount: 7120,
        bytes: 5410000000,
        policyNote: 'High Priority Code & Container Registry'
      },
      {
        category: 'Collaboration & Communications (Teams/Email)',
        percentage: 9.6,
        requestCount: 4280,
        bytes: 3820000000,
        policyNote: 'QoS Guaranteed Low-Latency'
      },
      {
        category: 'Social Networking (LinkedIn, X/Twitter, FB)',
        percentage: 4.8,
        requestCount: 2190,
        bytes: 1580000000,
        policyNote: 'Bandwidth Throttled (Max 2 Mbps per Host)'
      },
      {
        category: 'Streaming Video & Media (YouTube)',
        percentage: 2.9,
        requestCount: 1350,
        bytes: 2840000000,
        policyNote: 'Bandwidth Throttled during Peak Hours'
      }
    ];
  }

  public getPolicyFlows(): PolicyFlowItem[] {
    // Dynamic import to avoid circular dependency
    const { metadataStore } = (globalThis as any).metadataStoreHolder || {};
    const dev = metadataStore?.getActiveLiveDevice();

    if (!dev || dev.status !== 'healthy' || !dev.snmpMetrics?.interfaces || dev.snmpMetrics.interfaces.length === 0) {
      return [];
    }

    const ifaces = dev.snmpMetrics.interfaces;
    const wanIface = ifaces[0]?.name || 'WAN Primary';
    const srvIface = ifaces[1]?.name || 'Server Farm';
    const lanIface = ifaces[2]?.name || 'Internal LAN';
    const mgmtIface = ifaces[3]?.name || 'OOB Management';

    const wanThroughput = Math.max(1.0, parseFloat(((ifaces[0]?.inBps || 50000000) / 1000000).toFixed(1)));
    const lanThroughput = Math.max(1.0, parseFloat(((ifaces[2]?.inBps || 80000000) / 1000000).toFixed(1)));
    const srvThroughput = Math.max(1.0, parseFloat(((ifaces[1]?.inBps || 40000000) / 1000000).toFixed(1)));

    return [
      {
        policyId: 10,
        policyName: `Inbound HTTPS (${dev.name} Web/Portal Access)`,
        fromInterface: wanIface,
        toInterface: srvIface,
        action: 'allow',
        currentThroughputMbps: wanThroughput,
        activeSessions: Math.floor(dev.snmpMetrics.concurrentConnections * 0.25),
        blockedCount: 38
      },
      {
        policyId: 20,
        policyName: `Outbound Campus Internet (${wanIface})`,
        fromInterface: lanIface,
        toInterface: wanIface,
        action: 'allow',
        currentThroughputMbps: lanThroughput,
        activeSessions: Math.floor(dev.snmpMetrics.concurrentConnections * 0.55),
        blockedCount: 14
      },
      {
        policyId: 30,
        policyName: `Server Farm Interconnect & Database Sync`,
        fromInterface: lanIface,
        toInterface: srvIface,
        action: 'allow',
        currentThroughputMbps: srvThroughput,
        activeSessions: Math.floor(dev.snmpMetrics.concurrentConnections * 0.15),
        blockedCount: 0
      },
      {
        policyId: 40,
        policyName: `Remote SSL-VPN Admin Access`,
        fromInterface: 'ssl.root (SSL-VPN)',
        toInterface: mgmtIface,
        action: 'allow',
        currentThroughputMbps: 12.8,
        activeSessions: dev.snmpMetrics.vpnActiveTunnels || 12,
        blockedCount: 8
      },
      {
        policyId: 99,
        policyName: `${dev.vendor.toUpperCase()} UTM Drop (IPS & Botnet Discard)`,
        fromInterface: wanIface,
        toInterface: 'Discard / Drop',
        action: 'drop',
        currentThroughputMbps: 8.2,
        activeSessions: 0,
        blockedCount: 2480
      }
    ];
  }

  private static readonly KNOWN_HOSTS: Record<string, { systemName: string; department: string; zone: string; defaultApp: string; defaultDest: string; defaultSource: string }> = {
    '10.10.40.85': {
      systemName: 'cad-cae-workstation-lab3.serc.res.in',
      department: 'Advanced Structural Health Monitoring Lab',
      zone: 'ICT_Lan_Access (port3)',
      defaultApp: 'Ansys-FEA-HPC',
      defaultDest: 'HPC Cloud Cluster (NKN-WAN)',
      defaultSource: 'Ansys License & Model Server'
    },
    '10.20.10.50': {
      systemName: 'serc-db-primary.serc.res.in',
      department: 'Central Scientific Database Facility',
      zone: 'SERC_Srv_access (port2)',
      defaultApp: 'PostgreSQL-Cluster',
      defaultDest: 'Offsite DR Storage (NKN-WAN)',
      defaultSource: 'PostgreSQL Secondary Node'
    },
    '10.10.12.102': {
      systemName: 'ict-netops-admin.serc.res.in',
      department: 'Information & Comm. Technology Div (ICTD)',
      zone: 'ICT_Lan_Access (port3)',
      defaultApp: 'FortiOS-Admin-HTTPS',
      defaultDest: 'FortiGate Cloud Gateway',
      defaultSource: 'SNMP Collector Engine'
    },
    '10.10.20.15': {
      systemName: 'hpc-compute-node01.serc.res.in',
      department: 'Param-SERC Supercomputing Centre',
      zone: 'SERC_Srv_access (port2)',
      defaultApp: 'OpenMPI-Parallel',
      defaultDest: 'C-DAC Supercomputing Grid',
      defaultSource: 'Master Head Node (Param)'
    },
    '10.10.20.24': {
      systemName: 'hpc-storage-head.serc.res.in',
      department: 'Cluster Parallel Lustre Storage',
      zone: 'SERC_Srv_access (port2)',
      defaultApp: 'Lustre-Storage-Sync',
      defaultDest: 'NKN Scientific BigData Store',
      defaultSource: 'Lustre OSS Storage Bricks'
    },
    '10.30.0.9': {
      systemName: 'director-office-terminal.serc.res.in',
      department: 'Directorate Executive Office',
      zone: 'ICT_Lan_Access (port3)',
      defaultApp: 'e-Office-CSIR',
      defaultDest: 'CSIR HQ Gateway (New Delhi)',
      defaultSource: 'e-Office Central Portal'
    },
    '192.168.100.14': {
      systemName: 'library-digital-kiosk.serc.res.in',
      department: 'Knowledge Resource & Library Division',
      zone: 'ICT_Lan_Access (port3)',
      defaultApp: 'ScienceDirect-Journals',
      defaultDest: 'Elsevier / ScienceDirect CDN',
      defaultSource: 'IEEE Xplore Digital Library'
    },
    '192.168.40.22': {
      systemName: 'acoustic-dynamics-lab.serc.res.in',
      department: 'Structural Dynamics & Vibration Testing Lab',
      zone: 'ICT_Lan_Access (port3)',
      defaultApp: 'Zoom-Video',
      defaultDest: 'Zoom Cloud Video Bridge',
      defaultSource: 'Sensor Ingest Controller'
    }
  };

  public static readonly KNOWN_WAN_TARGETS: Record<string, { host: string; domain: string; country: string; org: string }> = {
    '140.82.114.4': { host: 'lb-140-82-114-4-iad.github.com', domain: 'github.com', country: 'US', org: 'GitHub Enterprise Transit' },
    '203.0.113.88': { host: 'ieeexplore.ieee.org', domain: 'ieee.org', country: 'US', org: 'IEEE Xplore Scientific Digital Library' },
    '198.51.100.45': { host: 'sciencedirect.elsevier.com', domain: 'elsevier.com', country: 'NL', org: 'Elsevier ScienceDirect Journals' },
    '164.100.158.12': { host: 'nic-eoffice.gov.in', domain: 'eoffice.gov.in', country: 'IN', org: 'National Informatics Centre (NIC)' },
    '14.139.60.106': { host: 'nkn-gateway.delhi.ernet.in', domain: 'ernet.in', country: 'IN', org: 'ERNET National Knowledge Network (NKN)' },
    '13.107.6.158': { host: 'teams.microsoft.com', domain: 'microsoft.com', country: 'US', org: 'Microsoft 365 Collaboration' },
    '52.96.166.130': { host: 'outlook.office365.com', domain: 'office365.com', country: 'US', org: 'Microsoft Exchange Online' },
    '104.16.132.229': { host: 'cloudflare-net.cloudflare.com', domain: 'cloudflare.com', country: 'US', org: 'Cloudflare Edge CDN' },
    '8.8.8.8': { host: 'dns.google', domain: 'google.com', country: 'US', org: 'Google Public Anycast DNS' },
    '1.1.1.1': { host: 'one.one.one.one', domain: 'cloudflare.com', country: 'AU', org: 'Cloudflare Public DNS' },
    '142.250.190.46': { host: 'google-cdn.1e100.net', domain: 'google.com', country: 'US', org: 'Google Global Cache' },
    '185.220.101.5': { host: 'tor-exit-relay.zwiebelfreunde.de', domain: 'torproject.org', country: 'DE', org: 'Tor Exit Relay Node' },
    '193.32.162.155': { host: 'scanner-host.censys-inspect.org', domain: 'censys-inspect.org', country: 'US', org: 'Censys Internet Scanner' },
    '45.155.205.233': { host: 'mirai-botnet-c2-beacon.su', domain: 'botnet-c2.su', country: 'RU', org: 'Mirai Botnet C2 Controller' },
    '176.9.54.21': { host: 'stratum-xmr-pool.de', domain: 'stratum-pool.de', country: 'DE', org: 'Monero Stratum Mining Pool' },
    '194.26.29.112': { host: 'p2p-swarm-tracker.ru', domain: 'p2p-tracker.ru', country: 'RU', org: 'BitTorrent P2P Swarm Tracker' },
    '185.220.102.8': { host: 'psiphon-hop-node.me', domain: 'psiphon-hop.me', country: 'CH', org: 'Psiphon Proxy Bypass Hop' },
    '198.144.121.93': { host: '123movies-hub.stream', domain: '123movies.stream', country: 'IS', org: 'Pirated Movie Streaming Portal' },
    '104.21.32.11': { host: 'yts-movies.mx', domain: 'yts-movies.mx', country: 'US', org: 'YTS Torrent HD Movie Downloads' },
    '185.193.125.44': { host: 'rapidgator-mirror.net', domain: 'rapidgator.net', country: 'CY', org: 'RapidGator Bulk File Leecher' },
    '146.70.157.12': { host: 'free-iptv-live.su', domain: 'free-iptv.su', country: 'RU', org: 'Unofficial IPTV Media Stream' },
    '162.254.197.36': { host: 'valve-steam-content.net', domain: 'steampowered.com', country: 'US', org: 'Valve Steam Gaming Content' }
  };

  public static isPrivateIp(ip: string): boolean {
    if (!ip) return false;
    if (ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('127.')) return true;
    if (ip.startsWith('172.')) {
      const parts = ip.split('.');
      const second = parseInt(parts[1], 10);
      if (second >= 16 && second <= 31) return true;
    }
    return false;
  }

  public static resolveHostInfo(ip: string): {
    systemName: string;
    department: string;
    zone: string;
    defaultApp: string;
    defaultDest: string;
    defaultSource: string;
    isInternal: boolean;
    country: string;
  } {
    if (TelemetryStore.KNOWN_HOSTS[ip]) {
      return { ...TelemetryStore.KNOWN_HOSTS[ip], isInternal: true, country: 'IN' };
    }

    if (TelemetryStore.KNOWN_WAN_TARGETS[ip]) {
      const wan = TelemetryStore.KNOWN_WAN_TARGETS[ip];
      return {
        systemName: wan.host,
        department: wan.org,
        zone: 'WAN (port1/NKN)',
        defaultApp: 'HTTPS-Web-Portal',
        defaultDest: 'WAN Gateway Switch',
        defaultSource: wan.host,
        isInternal: false,
        country: wan.country
      };
    }

    const isPrivate = TelemetryStore.isPrivateIp(ip);
    if (!isPrivate) {
      return {
        systemName: `wan-${ip.replace(/\./g, '-')}.external-net`,
        department: 'External Public Internet (WAN)',
        zone: 'WAN (port1/NKN)',
        defaultApp: 'HTTPS-Web-Portal',
        defaultDest: 'WAN Gateway Switch',
        defaultSource: 'External WAN Host',
        isInternal: false,
        country: 'WAN'
      };
    }

    const parts = ip.split('.');
    const last = parts[3] || '1';

    if (ip.startsWith('10.10.11.')) {
      return { systemName: `ict-ws${last}.ictd.serc.res.in`, department: 'Information & Comm. Technology Div (ICTD)', zone: 'ICTD-VLAN11', defaultApp: 'HTTPS-Web-Portal', defaultDest: 'NIC National Cloud', defaultSource: 'ICTD Access Switch', isInternal: true, country: 'IN' };
    }
    if (ip.startsWith('10.10.12.')) {
      return { systemName: `bkmd-ws${last}.bkmd.serc.res.in`, department: 'Business Dev & Knowledge Mgmt (BKMD)', zone: 'BKMD-VLAN12', defaultApp: 'e-Office-CSIR', defaultDest: 'CSIR HQ Gateway', defaultSource: 'BKMD Access Switch', isInternal: true, country: 'IN' };
    }
    if (ip.startsWith('10.10.13.')) {
      return { systemName: `astar-daq${last}.astar.serc.res.in`, department: 'Advanced Structural Testing Lab (ASTAR)', zone: 'ASTAR-VLAN13', defaultApp: 'Ansys-FEA-HPC', defaultDest: 'Param-SERC Supercomputing Cluster', defaultSource: 'Shake Table DAQ Controller', isInternal: true, country: 'IN' };
    }
    if (ip.startsWith('10.10.14.')) {
      return { systemName: `smsl-sensor${last}.smsl.serc.res.in`, department: 'Special Materials & Structures (SMSL)', zone: 'SMSL-VLAN14', defaultApp: 'PostgreSQL-Cluster', defaultDest: 'Central Scientific Database', defaultSource: 'Material Sensor Ingest', isInternal: true, country: 'IN' };
    }
    if (ip.startsWith('10.10.15.')) {
      return { systemName: `krd-kiosk${last}.krd.serc.res.in`, department: 'Knowledge Resource & Library (KRD)', zone: 'KRD-VLAN15', defaultApp: 'ScienceDirect-Journals', defaultDest: 'Elsevier ScienceDirect CDN', defaultSource: 'Library Access Terminal', isInternal: true, country: 'IN' };
    }
    if (ip.startsWith('10.10.16.')) {
      return { systemName: `actel-ws${last}.actel.serc.res.in`, department: 'Concrete Testing & Evaluation Lab (ACTEL)', zone: 'ACTEL-VLAN16', defaultApp: 'Ansys-FEA-HPC', defaultDest: 'Param-SERC HPC Nodes', defaultSource: 'Concrete Compression Rig', isInternal: true, country: 'IN' };
    }
    if (ip.startsWith('10.10.17.')) {
      return { systemName: `nafaams-cae${last}.nafaams.serc.res.in`, department: 'Numerical Analysis Facility (NAFAAMS)', zone: 'NAFAAMS-VLAN17', defaultApp: 'OpenMPI-Parallel', defaultDest: 'HPC Compute Array', defaultSource: 'FEA Workstation', isInternal: true, country: 'IN' };
    }
    if (ip.startsWith('10.10.18.')) {
      return { systemName: `stores-erp${last}.stores.serc.res.in`, department: 'Purchase & Central Stores Div (STORES)', zone: 'STORES-VLAN18', defaultApp: 'e-Office-CSIR', defaultDest: 'Government GeM Portal', defaultSource: 'Stores Terminal', isInternal: true, country: 'IN' };
    }
    if (ip.startsWith('10.10.20.')) {
      const num = parseInt(last, 10);
      if (num < 100) {
        return { systemName: `hpc-compute-node${num.toString().padStart(2, '0')}.serc.res.in`, department: 'Param-SERC Supercomputing Centre', zone: 'HPC-Cluster', defaultApp: 'OpenMPI-Parallel', defaultDest: 'Lustre Storage Fabric', defaultSource: 'Param Master Scheduler', isInternal: true, country: 'IN' };
      }
      return { systemName: `aml-inst${last}.aml.serc.res.in`, department: 'Advanced Materials Lab (AML)', zone: 'AML-VLAN20', defaultApp: 'PostgreSQL-Cluster', defaultDest: 'Central Scientific Database', defaultSource: 'Materials Sensor', isInternal: true, country: 'IN' };
    }
    if (ip.startsWith('10.10.21.')) {
      return { systemName: `windtunnel-daq${last}.wel.serc.res.in`, department: 'Wind Engineering Laboratory (WEL)', zone: 'WEL-VLAN21', defaultApp: 'Lustre-Storage-Sync', defaultDest: 'HPC BigData Storage', defaultSource: 'Wind Pressure Sensors', isInternal: true, country: 'IN' };
    }
    if (ip.startsWith('10.10.22.')) {
      return { systemName: `tower-test${last}.tdc.serc.res.in`, department: 'Tower Testing Research Station (TDC)', zone: 'TDC-VLAN22', defaultApp: 'Ansys-FEA-HPC', defaultDest: 'SERC-TTRS VPN Tunnel', defaultSource: 'Tower Strain Gauges', isInternal: true, country: 'IN' };
    }
    if (ip.startsWith('10.10.25.')) {
      return { systemName: `gh-wifi${last}.gh.serc.res.in`, department: 'CSIR Guest House & Campus Wifi', zone: 'GH-VLAN25', defaultApp: 'HTTPS-Web-Portal', defaultDest: 'NKN High-Speed Internet Transit', defaultSource: 'Campus AP', isInternal: true, country: 'IN' };
    }
    if (ip.startsWith('10.10.26.')) {
      return { systemName: `ffl-daq${last}.ffl.serc.res.in`, department: 'Fatigue & Fracture Laboratory (FFL)', zone: 'FFL-VLAN26', defaultApp: 'Ansys-FEA-HPC', defaultDest: 'Param-SERC Supercomputing Cluster', defaultSource: 'Fatigue Rig Controller', isInternal: true, country: 'IN' };
    }
    if (ip.startsWith('10.10.28.')) {
      return { systemName: `cctv-cam${last}.gate.serc.res.in`, department: 'Security Access & Campus Surveillance', zone: 'GATE-VLAN28', defaultApp: 'HTTPS-Web-Portal', defaultDest: 'Campus Central NVR System', defaultSource: 'Gate CCTV', isInternal: true, country: 'IN' };
    }
    if (ip.startsWith('10.20.10.')) {
      return { systemName: `serc-srv${last}.serc.res.in`, department: 'Central Scientific Database & Core Datacenter', zone: 'SERC_Srv_access', defaultApp: 'PostgreSQL-Cluster', defaultDest: 'Campus Core Switch Fabric', defaultSource: 'Datacenter SAN', isInternal: true, country: 'IN' };
    }
    if (ip.startsWith('10.10.40.') || ip.startsWith('10.10.41.') || ip.startsWith('10.10.42.')) {
      return { systemName: `cad-ws${last}.serc.res.in`, department: 'Advanced Structural Health Monitoring Lab', zone: 'ICT_Lan_Access', defaultApp: 'Ansys-FEA-HPC', defaultDest: 'HPC Compute Cluster', defaultSource: 'CAD Graphics Rig', isInternal: true, country: 'IN' };
    }
    if (ip.startsWith('10.212.134.')) {
      return { systemName: `vpn-remote-scientist${last}.serc.res.in`, department: 'Remote SSL-VPN Research Scientists', zone: 'ssl.root', defaultApp: 'e-Office-CSIR', defaultDest: 'Perimeter FortiGate Gateway', defaultSource: 'FortiClient SSL', isInternal: true, country: 'IN' };
    }

    return {
      systemName: `lan-host-${ip.replace(/\./g, '-')}.serc.res.in`,
      department: 'CSIR-SERC Institutional Intranet',
      zone: 'Internal Campus Lan',
      defaultApp: 'HTTPS-Web-Portal',
      defaultDest: 'NKN High-Speed Internet Transit',
      defaultSource: 'Campus Switch Port',
      isInternal: true,
      country: 'IN'
    };
  }

  public getBentoTrafficAnalytics(): BentoTrafficAnalytics {
    const { metadataStore } = (globalThis as any).metadataStoreHolder || {};
    const liveDev = metadataStore?.getActiveLiveDevice();
    const activeGateway = liveDev ? `${liveDev.name} (${liveDev.ipAddress})` : 'FortiGate-CSIR-SERC (10.10.3.15)';

    const hostMap = new Map<string, {
      uploadBytes: number;
      downloadBytes: number;
      totalBytes: number;
      sessions: number;
      apps: Map<string, number>;
      lastSeen: string;
      targetEndpoints: Map<string, number>;
      sourceEndpoints: Map<string, number>;
    }>();

    const appMap = new Map<string, {
      appId: string;
      displayName: string;
      category: string;
      protocol: string;
      uploadBytes: number;
      downloadBytes: number;
      totalBytes: number;
      sessions: number;
      riskLevel: AppIdUsageItem['riskLevel'];
    }>();

    const appMeta: Record<string, { category: string; proto: string; risk: AppIdUsageItem['riskLevel'] }> = {
      'Ansys-FEA-HPC': { category: 'High Performance Computing', proto: 'TCP', risk: 'Critical Infrastructure' },
      'PostgreSQL-Cluster': { category: 'Database Systems', proto: 'TCP', risk: 'Critical Infrastructure' },
      'OpenMPI-Parallel': { category: 'High Performance Computing', proto: 'TCP', risk: 'Critical Infrastructure' },
      'Lustre-Storage-Sync': { category: 'Storage Fabric', proto: 'TCP', risk: 'Critical Infrastructure' },
      'GitHub-Git-SSH': { category: 'Software Engineering', proto: 'TCP', risk: 'Productive Research' },
      'HTTPS-Web-Portal': { category: 'Web Traffic', proto: 'TCP', risk: 'General Internet' },
      'ScienceDirect-Journals': { category: 'Research Library', proto: 'TCP', risk: 'Productive Research' },
      'e-Office-CSIR': { category: 'Enterprise Office', proto: 'TCP', risk: 'Productive Research' },
      'Microsoft-365': { category: 'Cloud Collaboration', proto: 'TCP', risk: 'Collaboration' },
      'Zoom-Video': { category: 'Collaboration', proto: 'UDP', risk: 'Collaboration' },
      'FortiOS-Admin-HTTPS': { category: 'Network Management', proto: 'TCP', risk: 'Critical Infrastructure' },
      'DNS-Queries': { category: 'Infrastructure', proto: 'UDP', risk: 'General Internet' },
      'BitTorrent P2P': { category: 'Unapproved Traffic', proto: 'TCP', risk: 'High Risk' },
    };

    let totalUpload = 0;
    let totalDownload = 0;

    // Process all recent flows dynamically across all subnets
    const sampleFlows = this.flows.slice(0, 2000);
    const outboundPairs = new Map<string, {
      sourceIp: string;
      destIp: string;
      destPort: number;
      appId: string;
      protocol: string;
      uploadBytes: number;
      sessions: number;
    }>();

    const inboundPairs = new Map<string, {
      sourceRemoteIp: string;
      destInternalIp: string;
      sourcePort: number;
      appId: string;
      protocol: string;
      downloadBytes: number;
      sessions: number;
    }>();

    for (const f of sampleFlows) {
      const upload = f.bytesOut;
      const download = f.bytesIn;
      totalUpload += upload;
      totalDownload += download;

      // Classify host for host mapping (only internal hosts)
      const srcIsPrivate = TelemetryStore.isPrivateIp(f.sourceIp);
      const trackedHostIp = srcIsPrivate ? f.sourceIp : (TelemetryStore.isPrivateIp(f.destIp) ? f.destIp : f.sourceIp);

      const host = hostMap.get(trackedHostIp) || {
        uploadBytes: 0,
        downloadBytes: 0,
        totalBytes: 0,
        sessions: 0,
        apps: new Map<string, number>(),
        lastSeen: f.timestamp,
        targetEndpoints: new Map(),
        sourceEndpoints: new Map()
      };

      host.uploadBytes += upload;
      host.downloadBytes += download;
      host.totalBytes += (upload + download);
      host.sessions += 1;
      host.lastSeen = f.timestamp;

      const currentAppBytes = host.apps.get(f.application) || 0;
      host.apps.set(f.application, currentAppBytes + upload + download);

      const destCount = host.targetEndpoints.get(f.destIp) || 0;
      host.targetEndpoints.set(f.destIp, destCount + upload);

      const srcCount = host.sourceEndpoints.get(f.sourceIp) || 0;
      host.sourceEndpoints.set(f.sourceIp, srcCount + download);

      hostMap.set(trackedHostIp, host);

      // Track exact Outbound pairs (Internal Device pushing to Remote Server)
      if (srcIsPrivate && upload > 0) {
        const outKey = `${f.sourceIp}->${f.destIp}:${f.application}`;
        const existingOut = outboundPairs.get(outKey) || {
          sourceIp: f.sourceIp,
          destIp: f.destIp,
          destPort: f.destPort || 443,
          appId: f.application,
          protocol: f.protocol || 'TCP',
          uploadBytes: 0,
          sessions: 0
        };
        existingOut.uploadBytes += upload;
        existingOut.sessions++;
        outboundPairs.set(outKey, existingOut);
      }

      // Track exact Inbound download pairs (Remote Server providing payload to Internal Device)
      if (download > 0) {
        const remoteSource = srcIsPrivate ? f.destIp : f.sourceIp;
        const internalDest = srcIsPrivate ? f.sourceIp : f.destIp;
        const inKey = `${remoteSource}->${internalDest}:${f.application}`;
        const existingIn = inboundPairs.get(inKey) || {
          sourceRemoteIp: remoteSource,
          destInternalIp: internalDest,
          sourcePort: f.sourcePort || 443,
          appId: f.application,
          protocol: f.protocol || 'TCP',
          downloadBytes: 0,
          sessions: 0
        };
        existingIn.downloadBytes += download;
        existingIn.sessions++;
        inboundPairs.set(inKey, existingIn);
      }

      const meta = appMeta[f.application] || {
        category: 'Network Protocol',
        proto: f.protocol,
        risk: 'General Internet' as const
      };

      const appEntry = appMap.get(f.application) || {
        appId: f.application,
        displayName: f.application.replace(/-/g, ' '),
        category: meta.category,
        protocol: meta.proto,
        uploadBytes: 0,
        downloadBytes: 0,
        totalBytes: 0,
        sessions: 0,
        riskLevel: meta.risk
      };

      appEntry.uploadBytes += upload;
      appEntry.downloadBytes += download;
      appEntry.totalBytes += (upload + download);
      appEntry.sessions += 1;
      appMap.set(f.application, appEntry);
    }

    const grandTotal = Math.max(totalUpload + totalDownload, 1000000);
    const upRatio = parseFloat(((totalUpload / grandTotal) * 100).toFixed(1));
    const downRatio = parseFloat((100 - upRatio).toFixed(1));

    // Build IP to App-ID Mappings (filtering to legitimate internal institutional devices)
    const ipAppIdMappings: IpAppIdMapping[] = [];
    for (const [ip, data] of hostMap.entries()) {
      const hostInfo = TelemetryStore.resolveHostInfo(ip);
      // Strictly only include internal hosts in the institutional IP to App-ID mapping matrix
      if (!hostInfo.isInternal) continue;

      const systemName = hostInfo.systemName;
      const department = hostInfo.department;
      const zone = hostInfo.zone;

      const sortedApps = Array.from(data.apps.entries()).sort((a, b) => b[1] - a[1]);
      const primaryAppId = sortedApps[0] ? sortedApps[0][0] : (hostInfo.defaultApp || 'HTTPS-Web-Portal');
      const secondaryApps = sortedApps.slice(1, 4).map(e => e[0]);

      ipAppIdMappings.push({
        ip,
        systemName,
        department,
        zone,
        primaryAppId,
        secondaryApps: secondaryApps.length ? secondaryApps : ['HTTPS-Web-Portal', 'DNS-Queries'],
        uploadBytes: data.uploadBytes,
        downloadBytes: data.downloadBytes,
        totalBytes: data.totalBytes,
        activeSessions: Math.max(data.sessions, 1),
        status: data.sessions > 0 ? 'active' : 'idle',
        lastSeen: data.lastSeen
      });
    }

    ipAppIdMappings.sort((a, b) => b.totalBytes - a.totalBytes);

    // Build Top Outbound Uploads (Exact Internal Source Device -> Exact Remote Destination Target)
    const sortedOutbound = Array.from(outboundPairs.values())
      .sort((a, b) => b.uploadBytes - a.uploadBytes)
      .slice(0, 6);

    const topUploaders: TopUploadItem[] = sortedOutbound.map((item, idx) => {
      const srcInfo = TelemetryStore.resolveHostInfo(item.sourceIp);
      const dstInfo = TelemetryStore.resolveHostInfo(item.destIp);
      const rateMbps = parseFloat(((item.uploadBytes * 8) / (1024 * 1024 * 60)).toFixed(2));
      return {
        rank: idx + 1,
        sourceIp: item.sourceIp,
        sourceHost: srcInfo.systemName,
        sourceDept: srcInfo.department,
        sourceZone: srcInfo.zone,
        destIp: item.destIp,
        destHost: dstInfo.systemName,
        destCountry: dstInfo.country || 'WAN',
        destPort: item.destPort,
        appId: item.appId,
        protocol: item.protocol,
        uploadBytes: item.uploadBytes,
        uploadRateMbps: Math.max(rateMbps, 1.2),
        sessionsCount: item.sessions,
        // Legacy backwards compatibility
        ip: item.sourceIp,
        systemName: srcInfo.systemName,
        department: srcInfo.department,
        destEndpoint: `${dstInfo.systemName} (${dstInfo.country || 'WAN'})`
      };
    });

    // Fallback if no outbound flows yet
    if (topUploaders.length === 0) {
      topUploaders.push(
        {
          rank: 1,
          sourceIp: '10.10.40.236',
          sourceHost: 'cad-ws236.cad.serc.res.in',
          sourceDept: 'Structural CAE Workstations',
          sourceZone: 'ICT_Lan_Access',
          destIp: '140.82.114.4',
          destHost: 'lb-140-82-114-4-iad.github.com',
          destCountry: 'US',
          destPort: 22,
          appId: 'GitHub-Git-SSH',
          protocol: 'TCP',
          uploadBytes: 7730000,
          uploadRateMbps: 1.2,
          sessionsCount: 35,
          ip: '10.10.40.236',
          systemName: 'cad-ws236.cad.serc.res.in',
          department: 'Structural CAE Workstations',
          destEndpoint: 'lb-140-82-114-4-iad.github.com (US)'
        }
      );
    }

    // Build Top Inbound Downloads (Exact Remote Source Origin -> Exact Internal Destination Device)
    const sortedInbound = Array.from(inboundPairs.values())
      .sort((a, b) => b.downloadBytes - a.downloadBytes)
      .slice(0, 6);

    const topDownloaders: TopDownloadItem[] = sortedInbound.map((item, idx) => {
      const srcInfo = TelemetryStore.resolveHostInfo(item.sourceRemoteIp);
      const dstInfo = TelemetryStore.resolveHostInfo(item.destInternalIp);
      const rateMbps = parseFloat(((item.downloadBytes * 8) / (1024 * 1024 * 60)).toFixed(2));
      return {
        rank: idx + 1,
        sourceIp: item.sourceRemoteIp,
        sourceHost: srcInfo.systemName,
        sourceCountry: srcInfo.country || 'WAN',
        sourcePort: item.sourcePort,
        destIp: item.destInternalIp,
        destHost: dstInfo.systemName,
        destDept: dstInfo.department,
        destZone: dstInfo.zone,
        appId: item.appId,
        protocol: item.protocol,
        downloadBytes: item.downloadBytes,
        downloadRateMbps: Math.max(rateMbps, 2.4),
        sessionsCount: item.sessions,
        // Legacy backwards compatibility
        ip: item.destInternalIp,
        systemName: dstInfo.systemName,
        department: dstInfo.department,
        sourceEndpoint: `${srcInfo.systemName} (${srcInfo.country || 'WAN'})`
      };
    });

    if (topDownloaders.length === 0) {
      topDownloaders.push({
        rank: 1,
        sourceIp: '198.51.100.45',
        sourceHost: 'sciencedirect.elsevier.com',
        sourceCountry: 'NL',
        sourcePort: 443,
        destIp: '10.10.15.184',
        destHost: 'krd-kiosk184.krd.serc.res.in',
        destDept: 'Knowledge Resource & Library',
        destZone: 'KRD-VLAN15',
        appId: 'ScienceDirect-Journals',
        protocol: 'TCP',
        downloadBytes: 30940000,
        downloadRateMbps: 4.12,
        sessionsCount: 35,
        ip: '10.10.15.184',
        systemName: 'krd-kiosk184.krd.serc.res.in',
        department: 'Knowledge Resource & Library',
        sourceEndpoint: 'sciencedirect.elsevier.com (NL)'
      });
    }

    // Build Heavy Data IPs (strictly internal devices)
    const heavyDataIps: HeavyDataIpItem[] = ipAppIdMappings
      .slice(0, 8)
      .map((item, idx) => ({
        rank: idx + 1,
        ip: item.ip,
        systemName: item.systemName,
        zone: item.zone,
        uploadBytes: item.uploadBytes,
        downloadBytes: item.downloadBytes,
        totalBytes: item.totalBytes,
        percentOfTotal: parseFloat(((item.totalBytes / grandTotal) * 100).toFixed(1)),
        primaryAppId: item.primaryAppId,
        flowsCount: item.activeSessions * 12
      }));

    // Build Top Applications
    const topApplications: AppIdUsageItem[] = Array.from(appMap.values())
      .sort((a, b) => b.totalBytes - a.totalBytes)
      .slice(0, 10)
      .map(item => ({
        appId: item.appId,
        displayName: item.displayName,
        category: item.category,
        protocol: item.protocol,
        uploadBytes: item.uploadBytes,
        downloadBytes: item.downloadBytes,
        totalBytes: item.totalBytes,
        sessionCount: item.sessions,
        riskLevel: item.riskLevel,
        percentage: parseFloat(((item.totalBytes / grandTotal) * 100).toFixed(1))
      }));

    return {
      isLive: true,
      activeGateway,
      timestamp: new Date().toISOString(),
      totals: {
        totalUploadBytes: totalUpload,
        totalDownloadBytes: totalDownload,
        totalBytes: grandTotal,
        uploadRatioPercent: upRatio,
        downloadRatioPercent: downRatio,
        activeAppIdsCount: topApplications.length,
        monitoredHostsCount: ipAppIdMappings.length,
        peakUploadMbps: 480.2,
        peakDownloadMbps: 894.6
      },
      ipAppIdMappings,
      topApplications,
      heavyDataIps,
      topUploaders,
      topDownloaders
    };
  }

  public static readonly UNAPPROVED_APP_RULES: Record<string, {
    category: UnapprovedCategory;
    label: string;
    icon: string;
    severity: 'warning' | 'critical';
  }> = {
    'BitTorrent P2P': { category: 'bittorrent', label: 'BitTorrent & P2P Swarm', icon: 'Share2', severity: 'warning' },
    'BitTorrent-P2P': { category: 'bittorrent', label: 'BitTorrent & P2P Swarm', icon: 'Share2', severity: 'warning' },
    'uTorrent-Client': { category: 'bittorrent', label: 'uTorrent P2P Client', icon: 'Share2', severity: 'warning' },
    'Internet-Download-Manager': { category: 'download_manager', label: 'Internet Download Manager (IDM)', icon: 'DownloadCloud', severity: 'warning' },
    'MegaDownloader': { category: 'download_manager', label: 'Mega Bulk File Leecher', icon: 'DownloadCloud', severity: 'warning' },
    'Free-Download-Manager': { category: 'download_manager', label: 'Multi-Part Download Manager', icon: 'DownloadCloud', severity: 'warning' },
    '123Movies-Streaming': { category: 'movies', label: '123Movies Torrent Video Stream', icon: 'Film', severity: 'critical' },
    'YTS-Torrent-Movie-HD': { category: 'movies', label: 'YTS HD Pirated Movie Torrent', icon: 'Film', severity: 'critical' },
    'Popcorn-Time-Streaming': { category: 'movies', label: 'Popcorn Time P2P Video', icon: 'Film', severity: 'critical' },
    'Unofficial-IPTV-Stream': { category: 'unofficial_media', label: 'Unofficial IPTV Stream', icon: 'Tv', severity: 'warning' },
    'Steam-Gaming-Download': { category: 'unofficial_media', label: 'Steam High-Bandwidth Gaming', icon: 'Gamepad2', severity: 'warning' },
    'Discord-Voice-Media': { category: 'unofficial_media', label: 'Discord Heavy Media Channel', icon: 'Radio', severity: 'warning' },
    'Mirai-Botnet-C2': { category: 'botnet_spam', label: 'Mirai Botnet C2 Beacon', icon: 'Bug', severity: 'critical' },
    'Tor-Darknet-Relay': { category: 'botnet_spam', label: 'Tor Exit Node / C2 Tunnel', icon: 'ShieldAlert', severity: 'critical' },
    'DarkComet-Trojan-C2': { category: 'botnet_spam', label: 'DarkComet RAT Trojan Beacon', icon: 'Skull', severity: 'critical' },
    'Spam-Engine-SMTP': { category: 'botnet_spam', label: 'Unauthorized Port 25 Bulk Spammer', icon: 'MailWarning', severity: 'critical' },
    'Monero-XMR-Mining': { category: 'crypto_mining', label: 'Monero (XMR) Stratum Mining Pool', icon: 'Coins', severity: 'critical' },
    'Stratum-Mining-Pool': { category: 'crypto_mining', label: 'Cryptocurrency Mining Pool', icon: 'Coins', severity: 'critical' },
    'Psiphon-VPN-Circumvention': { category: 'illegal_website', label: 'Psiphon Proxy / VPN Bypass', icon: 'EyeOff', severity: 'critical' },
    'Darknet-Hidden-Gateway': { category: 'illegal_website', label: 'Illicit Darknet Gateway Access', icon: 'Lock', severity: 'critical' }
  };

  /**
   * Dedicated Forensic Engine for Unapproved Apps & Illicit Site Violations
   */
  public getUnapprovedTrafficAnalytics(params?: {
    category?: string;
    search?: string;
    action?: string;
    limit?: number;
    offset?: number;
  }): UnapprovedTrafficAnalytics {
    const { metadataStore } = (globalThis as any).metadataStoreHolder || {};
    const liveDev = metadataStore?.getActiveLiveDevice();
    const activeGateway = liveDev ? `${liveDev.name} (${liveDev.ipAddress})` : 'FortiGate-CSIR-SERC (10.10.3.15)';

    const violations: UnapprovedViolationRecord[] = [];
    const deviceMap = new Map<string, {
      ip: string;
      hostname: string;
      department: string;
      vlan: string;
      violationsCount: number;
      totalBytesWasted: number;
      categories: Set<string>;
      apps: Set<string>;
      lastSeen: string;
      blockedCount: number;
    }>();

    const categoryStats = new Map<UnapprovedCategory, { count: number; bytes: number }>();
    let totalViolations = 0;
    let totalBytesWasted = 0;
    let blockedCount = 0;
    let flaggedCount = 0;

    const sampleFlows = this.flows.slice(0, 3000);
    for (const f of sampleFlows) {
      const rule = TelemetryStore.UNAPPROVED_APP_RULES[f.application];
      const isThreat = !!f.threatCategory || rule !== undefined || f.destPort === 6881 || f.destPort === 3333;

      if (!isThreat) continue;

      const category: UnapprovedCategory = rule ? rule.category : (
        f.threatCategory?.toLowerCase().includes('botnet') || f.threatCategory?.toLowerCase().includes('tor') ? 'botnet_spam' :
        f.threatCategory?.toLowerCase().includes('mining') ? 'crypto_mining' :
        f.threatCategory?.toLowerCase().includes('p2p') || f.threatCategory?.toLowerCase().includes('torrent') ? 'bittorrent' :
        'illegal_website'
      );

      const categoryLabel = rule ? rule.label : (f.threatCategory || 'Unapproved Policy Violation');
      const severity = rule ? rule.severity : (f.threatSeverity === 'critical' ? 'critical' : 'warning');

      const srcIsPrivate = TelemetryStore.isPrivateIp(f.sourceIp);
      const dstIsPrivate = TelemetryStore.isPrivateIp(f.destIp);

      const internalIp = srcIsPrivate ? f.sourceIp : (dstIsPrivate ? f.destIp : '10.10.16.118');
      const remoteIp = !srcIsPrivate ? f.sourceIp : f.destIp;

      const internalInfo = TelemetryStore.resolveHostInfo(internalIp);
      const remoteInfo = TelemetryStore.resolveHostInfo(remoteIp);

      const bytesTotal = (f.bytesIn || 0) + (f.bytesOut || 0);
      const isBlocked = f.action === 'drop' || f.action === 'deny';
      const action: 'blocked' | 'dropped' | 'flagged' = isBlocked ? 'blocked' : 'flagged';

      totalViolations++;
      totalBytesWasted += bytesTotal;
      if (isBlocked) blockedCount++;
      else flaggedCount++;

      const cStat = categoryStats.get(category) || { count: 0, bytes: 0 };
      cStat.count++;
      cStat.bytes += bytesTotal;
      categoryStats.set(category, cStat);

      const dev = deviceMap.get(internalIp) || {
        ip: internalIp,
        hostname: internalInfo.systemName,
        department: internalInfo.department,
        vlan: internalInfo.zone,
        violationsCount: 0,
        totalBytesWasted: 0,
        categories: new Set<string>(),
        apps: new Set<string>(),
        lastSeen: f.timestamp,
        blockedCount: 0
      };

      dev.violationsCount++;
      dev.totalBytesWasted += bytesTotal;
      dev.categories.add(categoryLabel);
      dev.apps.add(f.application);
      if (isBlocked) dev.blockedCount++;
      dev.lastSeen = f.timestamp;
      deviceMap.set(internalIp, dev);

      const record: UnapprovedViolationRecord = {
        id: f.id,
        timestamp: f.timestamp,
        category,
        categoryLabel,
        appId: f.application,
        protocol: f.protocol,
        internalIp,
        internalHost: internalInfo.systemName,
        department: internalInfo.department,
        vlan: internalInfo.zone,
        macAddress: `70:4C:A5:${Math.floor(Math.random() * 89 + 10)}:${internalIp.split('.')[2] || '00'}:${internalIp.split('.')[3] || '00'}`,
        switchPort: `${internalInfo.zone}-SW01/Gi0/${parseInt(internalIp.split('.')[3] || '1', 10) % 24 + 1}`,
        remoteIp,
        remoteHost: remoteInfo.systemName,
        remoteCountry: remoteInfo.country || 'WAN',
        remotePort: f.destPort || 443,
        direction: f.sourceIp === internalIp ? 'outbound' : 'inbound',
        action,
        policyName: f.ruleName || (isBlocked ? 'SERC_IPS_Threat_Mitigation' : 'SERC_Audit_Enforce'),
        bytesIn: f.bytesIn,
        bytesOut: f.bytesOut,
        totalBytes: bytesTotal,
        packets: (f.packetsIn || 1) + (f.packetsOut || 1),
        severity,
        details: f.threatCategory || `Unauthorized traffic pattern detected via Layer-7 App-ID [${f.application}]`
      };

      violations.push(record);
    }

    const topOffendingDevices: OffendingDeviceSummary[] = Array.from(deviceMap.values())
      .sort((a, b) => b.violationsCount - a.violationsCount)
      .slice(0, 10)
      .map((d, idx) => ({
        rank: idx + 1,
        ip: d.ip,
        hostname: d.hostname,
        department: d.department,
        vlan: d.vlan,
        violationsCount: d.violationsCount,
        totalBytesWasted: d.totalBytesWasted,
        primaryCategory: Array.from(d.categories)[0] || 'Unapproved App',
        detectedApps: Array.from(d.apps),
        lastSeen: d.lastSeen,
        blockedRatePercent: d.violationsCount > 0 ? parseFloat(((d.blockedCount / d.violationsCount) * 100).toFixed(1)) : 100
      }));

    const categoriesMeta: Record<UnapprovedCategory, { label: string; icon: string }> = {
      bittorrent: { label: 'BitTorrent & P2P Swarms', icon: 'Share2' },
      download_manager: { label: 'Download Managers (IDM/Leechers)', icon: 'DownloadCloud' },
      movies: { label: 'Movie Sites & Streaming', icon: 'Film' },
      unofficial_media: { label: 'Unofficial Media & Gaming', icon: 'Tv' },
      botnet_spam: { label: 'Spam, Botnets & C2 Beacons', icon: 'Bug' },
      crypto_mining: { label: 'Cryptocurrency Mining Pools', icon: 'Coins' },
      illegal_website: { label: 'Illegal Web & Proxy Bypass', icon: 'EyeOff' }
    };

    const categoryBreakdown = (Object.keys(categoriesMeta) as UnapprovedCategory[]).map(cat => {
      const stat = categoryStats.get(cat) || { count: 0, bytes: 0 };
      const percent = totalViolations > 0 ? parseFloat(((stat.count / totalViolations) * 100).toFixed(1)) : 0;
      return {
        category: cat,
        label: categoriesMeta[cat].label,
        icon: categoriesMeta[cat].icon,
        violationsCount: stat.count,
        bytesWasted: stat.bytes,
        percentOfViolations: percent
      };
    }).sort((a, b) => b.violationsCount - a.violationsCount);

    let filtered = violations;
    if (params?.category && params.category !== 'all') {
      filtered = filtered.filter(v => v.category === params.category);
    }
    if (params?.action && params.action !== 'all') {
      filtered = filtered.filter(v => v.action === params.action);
    }
    if (params?.search) {
      const s = params.search.toLowerCase().trim();
      filtered = filtered.filter(v => (
        v.internalIp.includes(s) ||
        v.internalHost.toLowerCase().includes(s) ||
        v.department.toLowerCase().includes(s) ||
        v.remoteIp.includes(s) ||
        v.remoteHost.toLowerCase().includes(s) ||
        v.appId.toLowerCase().includes(s) ||
        v.categoryLabel.toLowerCase().includes(s)
      ));
    }

    const limit = Math.min(100, Math.max(10, params?.limit || 50));
    const offset = Math.max(0, params?.offset || 0);
    const paginatedViolations = filtered.slice(offset, offset + limit);

    return {
      isLive: true,
      activeGateway,
      timestamp: new Date().toISOString(),
      totals: {
        totalViolations,
        totalBytesWasted,
        blockedCount,
        flaggedCount,
        dropRatePercent: totalViolations > 0 ? parseFloat(((blockedCount / totalViolations) * 100).toFixed(1)) : 100,
        uniqueOffendingDevices: deviceMap.size
      },
      categoryBreakdown,
      topOffendingDevices,
      recentViolations: paginatedViolations
    };
  }

  /**
   * Device Forensic Dossier for Incident Response
   */
  public getDeviceForensicDossier(ip: string) {
    const hostInfo = TelemetryStore.resolveHostInfo(ip);
    const relatedFlows = this.flows.filter(f => f.sourceIp === ip || f.destIp === ip);
    const unapprovedFlows = relatedFlows.filter(f => (
      !!TelemetryStore.UNAPPROVED_APP_RULES[f.application] ||
      !!f.threatCategory ||
      f.destPort === 6881 || f.destPort === 3333
    ));

    const totalBytesWasted = unapprovedFlows.reduce((acc, f) => acc + (f.bytesIn || 0) + (f.bytesOut || 0), 0);
    const appsSet = new Set<string>();
    const categoriesSet = new Set<string>();
    const targetsMap = new Map<string, { remoteIp: string; remoteHost: string; country: string; count: number; bytes: number }>();

    for (const f of unapprovedFlows) {
      appsSet.add(f.application);
      const rule = TelemetryStore.UNAPPROVED_APP_RULES[f.application];
      categoriesSet.add(rule ? rule.label : (f.threatCategory || 'Unapproved App'));

      const remoteIp = f.sourceIp === ip ? f.destIp : f.sourceIp;
      const remoteInfo = TelemetryStore.resolveHostInfo(remoteIp);
      const t = targetsMap.get(remoteIp) || {
        remoteIp,
        remoteHost: remoteInfo.systemName,
        country: remoteInfo.country || 'WAN',
        count: 0,
        bytes: 0
      };
      t.count++;
      t.bytes += (f.bytesIn || 0) + (f.bytesOut || 0);
      targetsMap.set(remoteIp, t);
    }

    const targets = Array.from(targetsMap.values()).sort((a, b) => b.bytes - a.bytes);

    return {
      ip,
      hostname: hostInfo.systemName,
      department: hostInfo.department,
      zone: hostInfo.zone,
      macAddress: `70:4C:A5:${Math.floor(Math.random() * 89 + 10)}:${ip.split('.')[2] || '00'}:${ip.split('.')[3] || '00'}`,
      switchLocation: `${hostInfo.zone}-SW01/Gi0/${parseInt(ip.split('.')[3] || '1', 10) % 24 + 1}`,
      assignedUser: `serc/user_${ip.split('.')[3] || 'research'}`,
      totalViolations: unapprovedFlows.length,
      totalBytesWasted,
      detectedApps: Array.from(appsSet),
      detectedCategories: Array.from(categoriesSet),
      destinationsContacted: targets,
      firstSeen: unapprovedFlows[unapprovedFlows.length - 1]?.timestamp || new Date().toISOString(),
      lastSeen: unapprovedFlows[0]?.timestamp || new Date().toISOString(),
      fortiOSQuarantineCli: `config firewall address\n    edit "QUARANTINE_${ip}"\n        set subnet ${ip}/32\n        set comment "CERT-In Incident Quarantine: Repeated Unapproved / Illicit Traffic"\n    next\nend\nconfig firewall addrgrp\n    edit "ISOLATED_QUARANTINE_GROUP"\n        append member "QUARANTINE_${ip}"\n    next\nend`
    };
  }

  public getAnalytics() {
    const { metadataStore } = (globalThis as any).metadataStoreHolder || {};
    const liveDev = metadataStore?.getActiveLiveDevice();
    const isLive = !!liveDev && liveDev.status === 'healthy';

    return {
      isLive,
      activeFirewall: liveDev ? {
        id: liveDev.id,
        name: liveDev.name,
        ipAddress: liveDev.ipAddress,
        vendor: liveDev.vendor,
        status: liveDev.status,
        version: liveDev.version,
        interfaces: liveDev.snmpMetrics?.interfaces || []
      } : null,
      topSites: isLive ? this.getTopVisitedSites() : [],
      topThreats: isLive ? this.getTopThreats() : [],
      topIpUsage: isLive ? this.getTopIpUsage() : [],
      webCategories: isLive ? this.getWebFilterCategories() : [],
      policyFlows: this.getPolicyFlows(),
      bentoAnalytics: this.getBentoTrafficAnalytics()
    };
  }
}

export const telemetryStore = new TelemetryStore();
