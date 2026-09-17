import { TrafficFlow, SyslogEntry, SNMPProbeData, AlertNotification, TopVisitedSite, SecurityThreatItem, TopIpUsageItem, WebFilterCategoryItem, PolicyFlowItem } from '../types/index.js';
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
      policyFlows: this.getPolicyFlows()
    };
  }
}

export const telemetryStore = new TelemetryStore();
