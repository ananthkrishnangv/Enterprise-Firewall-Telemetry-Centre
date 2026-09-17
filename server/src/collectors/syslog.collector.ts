import dgram from 'node:dgram';
import { v4 as uuidv4 } from 'uuid';
import { SyslogEntry, FirewallVendor, RuleAction } from '../types/index.js';
import { telemetryStore } from '../storage/telemetry.store.js';
import { influxService } from '../storage/influx.service.js';

export class SyslogCollector {
  private server: dgram.Socket;
  private port: number;

  constructor(port: number = 1514) {
    this.port = port;
    this.server = dgram.createSocket('udp4');
    this.setupListeners();
  }

  private setupListeners() {
    this.server.on('error', (err) => {
      console.error(`[SyslogCollector] UDP socket error: ${err.message}`);
    });

    this.server.on('message', (msg, rinfo) => {
      const rawText = msg.toString('utf-8');
      this.parseAndIngest(rawText, rinfo.address);
    });

    this.server.on('listening', () => {
      const address = this.server.address();
      console.log(`[SyslogCollector] Listening for UDP syslog on ${address.address}:${address.port}`);
    });
  }

  public start() {
    try {
      this.server.bind(this.port);
    } catch (e: any) {
      console.warn(`[SyslogCollector] Could not bind port ${this.port}: ${e.message}`);
    }
  }

  public stop() {
    this.server.close();
  }

  public parseAndIngest(raw: string, sourceHostIp: string): SyslogEntry {
    let vendor: FirewallVendor = 'checkpoint';
    let action: RuleAction = 'allow';
    let sourceIp = sourceHostIp;
    let destIp = '0.0.0.0';
    let sourcePort = 0;
    let destPort = 0;
    let protocol = 'TCP';
    let ruleName = 'Default';
    let severity: SyslogEntry['severity'] = 'info';

    // 1. Check Point Gaia / Quantum Syslog Format
    if (raw.includes('VPN-1 & FireWall-1') || raw.includes('CheckPoint') || raw.includes('CP-GW')) {
      vendor = 'checkpoint';
      const actionMatch = raw.match(/action=([a-zA-Z0-9_-]+)/i);
      if (actionMatch) {
        const act = actionMatch[1].toLowerCase();
        if (act === 'accept' || act === 'allow') action = 'allow';
        else if (act === 'drop') action = 'drop';
        else if (act === 'reject') action = 'reject';
      }

      const srcMatch = raw.match(/src=([0-9.]+)/i);
      if (srcMatch) sourceIp = srcMatch[1];

      const dstMatch = raw.match(/dst=([0-9.]+)/i);
      if (dstMatch) destIp = dstMatch[1];

      const sPortMatch = raw.match(/s_port=([0-9]+)/i);
      if (sPortMatch) sourcePort = parseInt(sPortMatch[1], 10);

      const serviceMatch = raw.match(/service=([0-9]+)/i);
      if (serviceMatch) destPort = parseInt(serviceMatch[1], 10);

      const protoMatch = raw.match(/proto=([a-zA-Z0-9]+)/i);
      if (protoMatch) protocol = protoMatch[1].toUpperCase();

      const ruleMatch = raw.match(/rule_name="?([^";]+)"?/i) || raw.match(/rule=([0-9]+)/i);
      if (ruleMatch) ruleName = ruleMatch[1];

      if (action === 'drop' || action === 'reject') severity = 'warning';
      if (raw.includes('Anti-Bot') || raw.includes('Threat')) severity = 'critical';
    } 
    // 2. Fortinet FortiOS Syslog format
    else if (raw.includes('devname=') || raw.includes('FortiGate') || raw.includes('FortiOS')) {
      vendor = 'fortinet';
      if (raw.includes('action="deny"') || raw.includes('action="close"') || raw.includes('action="drop"')) {
        action = 'drop';
        severity = 'warning';
      }
      const srcMatch = raw.match(/srcip=([0-9.]+)/i);
      if (srcMatch) sourceIp = srcMatch[1];
      const dstMatch = raw.match(/dstip=([0-9.]+)/i);
      if (dstMatch) destIp = dstMatch[1];
      const sPortMatch = raw.match(/srcport=([0-9]+)/i);
      if (sPortMatch) sourcePort = parseInt(sPortMatch[1], 10);
      const dstPortMatch = raw.match(/dstport=([0-9]+)/i);
      if (dstPortMatch) destPort = parseInt(dstPortMatch[1], 10);
      const protoMatch = raw.match(/proto=([a-zA-Z0-9]+)/i);
      if (protoMatch) protocol = protoMatch[1].toUpperCase();
      const policyMatch = raw.match(/policyid=([0-9]+)/i) || raw.match(/policyname="?([^";]+)"?/i);
      if (policyMatch) ruleName = `Policy_${policyMatch[1]}`;
    }
    // 3. Palo Alto PAN-OS CSV format
    else if (raw.includes('TRAFFIC,') || raw.includes('THREAT,')) {
      vendor = 'paloalto';
      const parts = raw.split(',');
      if (parts.length > 25) {
        ruleName = parts[11] || 'Rule_Default';
        sourceIp = parts[7] || sourceIp;
        destIp = parts[8] || destIp;
        sourcePort = parseInt(parts[24] || '0', 10);
        destPort = parseInt(parts[25] || '0', 10);
        protocol = (parts[29] || 'TCP').toUpperCase();
        const act = (parts[30] || 'allow').toLowerCase();
        action = act === 'allow' ? 'allow' : 'drop';
        if (action === 'drop') severity = 'warning';
      }
    }
    // 4. pfSense filterlog format
    // e.g.: "filterlog: 4,,,1000000103,ix0,match,block,in,4,0x0,,64,0,0,DF,6,tcp,44,198.51.100.24,192.168.40.1,51423,443,0,S,1234567,,1024,,"
    else if (raw.includes('filterlog:') || raw.includes('pfSense')) {
      vendor = 'pfsense';
      const parts = raw.split(',');
      if (parts.length >= 19) {
        const act = parts[6]?.toLowerCase();
        action = act === 'pass' ? 'allow' : 'drop';
        ruleName = `Rule_${parts[3] || 'pf_default'}`;
        sourceIp = parts[18] || sourceIp;
        destIp = parts[19] || destIp;
        protocol = (parts[16] || 'TCP').toUpperCase();
        sourcePort = parseInt(parts[20] || '0', 10);
        destPort = parseInt(parts[21] || '0', 10);
        if (action === 'drop') severity = 'warning';
      }
    }

    const entry: SyslogEntry = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      firewallId: vendor === 'checkpoint' ? 'fw-cp-01' : vendor === 'paloalto' ? 'fw-pa-01' : vendor === 'fortinet' ? 'fw-fg-01' : 'fw-pf-01',
      vendor,
      facility: 1,
      severity,
      raw,
      parsed: {
        action,
        sourceIp,
        destIp,
        sourcePort,
        destPort,
        protocol,
        ruleName,
      }
    };

    telemetryStore.addLog(entry);

    // Forward to InfluxDB Time-Series Engine
    try {
      const isInternal = sourceIp.startsWith('10.') || sourceIp.startsWith('192.168.');
      const isDestInternal = destIp.startsWith('10.') || destIp.startsWith('192.168.');
      const direction = isInternal && isDestInternal ? 'internal' : isInternal ? 'outbound' : 'inbound';
      
      influxService.storeTrafficLog({
        id: entry.id,
        timestamp: entry.timestamp,
        firewallId: entry.firewallId,
        direction,
        action,
        sourceIp,
        sourcePort,
        destIp,
        destPort,
        protocol,
        application: protocol === 'TCP' && destPort === 443 ? 'HTTPS' : protocol === 'UDP' && destPort === 53 ? 'DNS' : `${protocol}-${destPort || 'Traffic'}`,
        bytesIn: 1024,
        bytesOut: 1024,
        packetsIn: 1,
        packetsOut: 1,
        policyName: ruleName,
        severity,
        rawLog: raw
      });
    } catch {}

    return entry;
  }
}
