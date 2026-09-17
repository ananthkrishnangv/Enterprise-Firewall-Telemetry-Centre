import dgram from 'node:dgram';
import { v4 as uuidv4 } from 'uuid';
import { TrafficFlow, FirewallVendor } from '../types/index.js';
import { telemetryStore } from '../storage/telemetry.store.js';
import { influxService } from '../storage/influx.service.js';

export class FlowCollector {
  private server: dgram.Socket;
  private port: number;

  constructor(port: number = 2055) {
    this.port = port;
    this.server = dgram.createSocket('udp4');
    this.setupListeners();
  }

  private setupListeners() {
    this.server.on('error', (err) => {
      console.error(`[FlowCollector] UDP NetFlow socket error: ${err.message}`);
    });

    this.server.on('message', (msg, rinfo) => {
      this.parseNetFlowPacket(msg, rinfo.address);
    });

    this.server.on('listening', () => {
      const address = this.server.address();
      console.log(`[FlowCollector] Listening for NetFlow/IPFIX on ${address.address}:${address.port}`);
    });
  }

  public start() {
    try {
      this.server.bind(this.port);
    } catch (e: any) {
      console.warn(`[FlowCollector] Could not bind NetFlow port ${this.port}: ${e.message}`);
    }
  }

  public stop() {
    this.server.close();
  }

  public parseNetFlowPacket(buffer: Buffer, exporterIp: string) {
    if (buffer.length < 24) return;
    const version = buffer.readUInt16BE(0);

    // NetFlow v5
    if (version === 5) {
      const count = buffer.readUInt16BE(2);
      let offset = 24;

      for (let i = 0; i < count; i++) {
        if (offset + 48 > buffer.length) break;

        const srcIp = `${buffer[offset]}.${buffer[offset + 1]}.${buffer[offset + 2]}.${buffer[offset + 3]}`;
        const dstIp = `${buffer[offset + 4]}.${buffer[offset + 5]}.${buffer[offset + 6]}.${buffer[offset + 7]}`;
        const packets = buffer.readUInt32BE(offset + 16);
        const bytes = buffer.readUInt32BE(offset + 20);
        const srcPort = buffer.readUInt16BE(offset + 32);
        const dstPort = buffer.readUInt16BE(offset + 34);
        const protoNum = buffer.readUInt8(offset + 38);

        const protocol = protoNum === 6 ? 'TCP' : protoNum === 17 ? 'UDP' : protoNum === 1 ? 'ICMP' : 'OTHER';
        const application = this.detectApplication(dstPort, protocol);

        const flow: TrafficFlow = {
          id: uuidv4(),
          timestamp: new Date().toISOString(),
          firewallId: 'fw-cp-01',
          vendor: 'checkpoint',
          sourceIp: srcIp,
          destIp: dstIp,
          sourcePort: srcPort,
          destPort: dstPort,
          protocol,
          application,
          ruleName: 'NetFlow_Collected',
          action: 'allow',
          bytesIn: bytes,
          bytesOut: Math.floor(bytes * 0.4),
          packetsIn: packets,
          packetsOut: Math.floor(packets * 0.4),
          countryDest: this.mockGeoLookup(dstIp)
        };

        telemetryStore.addFlow(flow);

        try {
          const isInternal = flow.sourceIp.startsWith('10.') || flow.sourceIp.startsWith('192.168.');
          const isDestInternal = flow.destIp.startsWith('10.') || flow.destIp.startsWith('192.168.');
          const direction = isInternal && isDestInternal ? 'internal' : isInternal ? 'outbound' : 'inbound';
          influxService.storeTrafficLog({
            id: flow.id,
            timestamp: flow.timestamp,
            firewallId: flow.firewallId,
            direction,
            action: flow.action,
            sourceIp: flow.sourceIp,
            sourcePort: flow.sourcePort,
            destIp: flow.destIp,
            destPort: flow.destPort,
            destCountry: flow.countryDest,
            protocol: flow.protocol,
            application: flow.application,
            bytesIn: flow.bytesIn,
            bytesOut: flow.bytesOut,
            packetsIn: flow.packetsIn,
            packetsOut: flow.packetsOut,
            policyName: flow.ruleName,
            severity: flow.threatSeverity === 'critical' ? 'critical' : flow.action === 'drop' ? 'warning' : 'info',
            threatCategory: flow.threatCategory
          });
        } catch {}

        offset += 48;
      }
    }
  }

  private detectApplication(port: number, protocol: string): string {
    if (port === 443) return 'HTTPS / SSL';
    if (port === 80) return 'HTTP Web';
    if (port === 53) return 'DNS';
    if (port === 22) return 'SSH';
    if (port === 3389) return 'RDP';
    if (port === 1521) return 'Oracle SQL';
    if (port === 5432) return 'PostgreSQL';
    if (port === 3306) return 'MySQL';
    if (port === 123) return 'NTP';
    if (port === 161) return 'SNMP';
    if (port === 8080 || port === 8443) return 'Web Proxy';
    return `${protocol}/${port}`;
  }

  private mockGeoLookup(ip: string): string {
    if (ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('172.16.')) {
      return 'INTERNAL';
    }
    const hash = ip.split('.').reduce((acc, oct) => acc + parseInt(oct, 10), 0);
    const countries = ['US', 'DE', 'GB', 'FR', 'SG', 'JP', 'IN', 'AU', 'CA', 'BR'];
    return countries[hash % countries.length];
  }
}
