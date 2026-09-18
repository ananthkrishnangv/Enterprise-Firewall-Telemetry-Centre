import fs from 'fs';
import path from 'path';

export interface TrafficLogRecord {
  id: string;
  timestamp: string;
  firewallId: string;
  direction: 'inbound' | 'outbound' | 'internal';
  action: 'allow' | 'drop' | 'block' | 'reject' | 'deny';
  sourceIp: string;
  sourcePort: number;
  sourceName?: string;
  sourceDept?: string;
  destIp: string;
  destPort: number;
  destName?: string;
  destCountry?: string;
  protocol: string;
  application: string;
  bytesIn: number;
  bytesOut: number;
  packetsIn: number;
  packetsOut: number;
  policyId?: string;
  policyName?: string;
  severity: 'info' | 'warning' | 'critical';
  threatCategory?: string;
  vlanId?: number;
  vlanName?: string;
  interface?: string;
  subnetSegment?: string;
  rawLog?: string;
}

export interface TrafficAnalyticsSummary {
  timeRange: string;
  totalLogs: number;
  totalBytesIn: number;
  totalBytesOut: number;
  totalBytes: number;
  allowedCount: number;
  blockedCount: number;
  blockRatePercent: number;
  topSources: { ip: string; name: string; dept: string; bytes: number; count: number }[];
  topDestinations: { ip: string; name: string; country: string; bytes: number; count: number }[];
  topBlockedThreats: { ip: string; threat: string; count: number; lastSeen: string }[];
  topApplications: { name: string; bytes: number; count: number; risk: string }[];
  protocolDistribution: { protocol: string; bytes: number; count: number }[];
  vlanDistribution: { vlanId: number; vlanName: string; bytes: number; count: number; blockedCount: number }[];
  segmentDistribution: { segment: string; bytes: number; count: number; blockedCount: number }[];
}

export interface TimelineBucket {
  timestamp: string;
  allowedBytes: number;
  blockedBytes: number;
  allowedCount: number;
  blockedCount: number;
}

export class InfluxService {
  private url: string;
  private token: string;
  private org: string;
  private bucket: string;
  private writeBuffer: string[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private connected: boolean = false;
  private memoryLogBuffer: TrafficLogRecord[] = [];
  private readonly maxMemoryLogs = 5000;

  constructor() {
    this.url = process.env.INFLUX_URL || 'http://10.40.0.152:8086';
    this.token = process.env.INFLUX_TOKEN || 'influx-firewall-token-2026-supersecret';
    this.org = process.env.INFLUX_ORG || 'csir-serc';
    this.bucket = process.env.INFLUX_BUCKET || 'firewall_logs';

    this.startFlushInterval();
    this.checkHealth();
  }

  public async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${this.url}/health`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json();
        this.connected = data.status === 'pass';
        if (this.connected) {
          console.log(`[InfluxDB] Connected to Time-Series Engine at ${this.url} (Org: ${this.org}, Bucket: ${this.bucket})`);
        }
        return this.connected;
      }
    } catch (e: any) {
      this.connected = false;
      // non-blocking warning
    }
    return false;
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public getConnectionDetails() {
    return {
      connected: this.connected,
      url: this.url,
      org: this.org,
      bucket: this.bucket,
      retention: '180 days (CERT-In Mandate)',
      bufferedLogs: this.memoryLogBuffer.length,
    };
  }

  private escapeTag(val: string): string {
    return (val || 'unknown').replace(/[\s,=]/g, '\\$&');
  }

  private escapeFieldString(val: string): string {
    return (val || '').replace(/["\\]/g, '\\$&');
  }

  /**
   * High-throughput time-series ingestion using Influx Line Protocol
   */
  public storeTrafficLog(record: TrafficLogRecord): void {
    // 1. Maintain in-memory indexed ring buffer for instant zero-latency query responses
    this.memoryLogBuffer.unshift(record);
    if (this.memoryLogBuffer.length > this.maxMemoryLogs) {
      this.memoryLogBuffer.pop();
    }

    // 2. Format InfluxDB Line Protocol
    // Measurement: firewall_traffic
    // Tags: firewall_id, direction, action, protocol, application, severity, source_dept, threat_category
    // Fields: bytes_in, bytes_out, bytes_total, packets_in, packets_out, source_port, dest_port, source_ip, dest_ip, source_name, dest_name
    const tsMs = new Date(record.timestamp).getTime();
    const bytesTotal = (record.bytesIn || 0) + (record.bytesOut || 0);

    const tags = [
      `firewall_id=${this.escapeTag(record.firewallId)}`,
      `direction=${this.escapeTag(record.direction)}`,
      `action=${this.escapeTag(record.action)}`,
      `protocol=${this.escapeTag(record.protocol)}`,
      `application=${this.escapeTag(record.application)}`,
      `severity=${this.escapeTag(record.severity)}`,
      `source_dept=${this.escapeTag(record.sourceDept || 'General')}`,
      `threat_category=${this.escapeTag(record.threatCategory || 'None')}`,
      `vlan_id=${record.vlanId !== undefined ? record.vlanId : 'none'}`,
      `vlan_name=${this.escapeTag(record.vlanName || 'None')}`,
      `interface=${this.escapeTag(record.interface || 'None')}`,
      `subnet_segment=${this.escapeTag(record.subnetSegment || 'General')}`
    ].join(',');

    const fields = [
      `bytes_in=${Math.max(0, record.bytesIn || 0)}i`,
      `bytes_out=${Math.max(0, record.bytesOut || 0)}i`,
      `bytes_total=${Math.max(0, bytesTotal)}i`,
      `packets_in=${Math.max(1, record.packetsIn || 1)}i`,
      `packets_out=${Math.max(1, record.packetsOut || 1)}i`,
      `source_port=${record.sourcePort || 0}i`,
      `dest_port=${record.destPort || 0}i`,
      `source_ip="${this.escapeFieldString(record.sourceIp)}"`,
      `dest_ip="${this.escapeFieldString(record.destIp)}"`,
      `source_name="${this.escapeFieldString(record.sourceName || '')}"`,
      `dest_name="${this.escapeFieldString(record.destName || '')}"`,
      `raw="${this.escapeFieldString((record.rawLog || '').slice(0, 500))}"`
    ].join(',');

    const line = `firewall_traffic,${tags} ${fields} ${tsMs}`;
    this.writeBuffer.push(line);

    // If buffer reaches batch threshold (100 items), flush immediately
    if (this.writeBuffer.length >= 100) {
      this.flushBuffer();
    }
  }

  private startFlushInterval() {
    this.flushTimer = setInterval(() => {
      if (this.writeBuffer.length > 0) {
        this.flushBuffer();
      }
    }, 500);
  }

  private async flushBuffer(): Promise<void> {
    if (this.writeBuffer.length === 0) return;
    const batch = this.writeBuffer.splice(0, 500);
    const body = batch.join('\n');

    try {
      const endpoint = `${this.url}/api/v2/write?org=${encodeURIComponent(this.org)}&bucket=${encodeURIComponent(this.bucket)}&precision=ms`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.token}`,
          'Content-Type': 'text/plain; charset=utf-8'
        },
        body,
        signal: AbortSignal.timeout(4000)
      });

      if (res.ok || res.status === 204) {
        this.connected = true;
      } else {
        const errText = await res.text();
        console.warn(`[InfluxDB Write Warning] Status ${res.status}: ${errText.slice(0, 200)}`);
      }
    } catch (err: any) {
      // Re-queue small sample if failed
      if (this.writeBuffer.length < 1000) {
        this.writeBuffer.unshift(...batch.slice(0, 50));
      }
    }
  }

  /**
   * Multi-Parameter Traffic Query with Filtering & Pagination
   */
  public queryTrafficLogs(params: {
    direction?: string;
    action?: string;
    search?: string;
    protocol?: string;
    severity?: string;
    vlan?: string | number;
    segment?: string;
    timeRangeMinutes?: number;
    limit?: number;
    offset?: number;
  }): { total: number; logs: TrafficLogRecord[] } {
    const now = Date.now();
    const rangeMs = (params.timeRangeMinutes || 60) * 60 * 1000;
    const searchLower = (params.search || '').trim().toLowerCase();

    // Filter memory buffer
    let filtered = this.memoryLogBuffer.filter(log => {
      const logTime = new Date(log.timestamp).getTime();
      if (rangeMs > 0 && now - logTime > rangeMs) return false;
      if (params.direction && params.direction !== 'all' && log.direction !== params.direction) return false;
      if (params.action && params.action !== 'all') {
        if (params.action === 'blocked') {
          if (log.action !== 'drop' && log.action !== 'block' && log.action !== 'reject') return false;
        } else if (log.action !== params.action) {
          return false;
        }
      }
      if (params.protocol && params.protocol !== 'all' && log.protocol.toUpperCase() !== params.protocol.toUpperCase()) return false;
      if (params.severity && params.severity !== 'all' && log.severity !== params.severity) return false;
      if (params.vlan && params.vlan !== 'all') {
        const vNum = typeof params.vlan === 'string' ? parseInt(params.vlan, 10) : params.vlan;
        if (log.vlanId !== vNum) return false;
      }
      if (params.segment && params.segment !== 'all') {
        if (log.subnetSegment !== params.segment) return false;
      }

      if (searchLower) {
        const matches = (
          log.sourceIp.includes(searchLower) ||
          log.destIp.includes(searchLower) ||
          (log.sourceName || '').toLowerCase().includes(searchLower) ||
          (log.destName || '').toLowerCase().includes(searchLower) ||
          (log.sourceDept || '').toLowerCase().includes(searchLower) ||
          log.application.toLowerCase().includes(searchLower) ||
          (log.threatCategory || '').toLowerCase().includes(searchLower) ||
          (log.rawLog || '').toLowerCase().includes(searchLower)
        );
        if (!matches) return false;
      }
      return true;
    });

    const total = filtered.length;
    const limit = Math.min(100, Math.max(10, params.limit || 50));
    const offset = Math.max(0, params.offset || 0);
    const logs = filtered.slice(offset, offset + limit);

    return { total, logs };
  }

  /**
   * Comprehensive Traffic Analytics & Aggregations
   */
  public getTrafficAnalytics(timeRangeMinutes: number = 60): TrafficAnalyticsSummary {
    const now = Date.now();
    const rangeMs = (timeRangeMinutes || 60) * 60 * 1000;

    const sample = this.memoryLogBuffer.filter(l => {
      return rangeMs <= 0 || now - new Date(l.timestamp).getTime() <= rangeMs;
    });

    let totalBytesIn = 0;
    let totalBytesOut = 0;
    let allowedCount = 0;
    let blockedCount = 0;

    const sourceMap = new Map<string, { ip: string; name: string; dept: string; bytes: number; count: number }>();
    const destMap = new Map<string, { ip: string; name: string; country: string; bytes: number; count: number }>();
    const threatMap = new Map<string, { ip: string; threat: string; count: number; lastSeen: string }>();
    const appMap = new Map<string, { name: string; bytes: number; count: number; risk: string }>();
    const protoMap = new Map<string, { protocol: string; bytes: number; count: number }>();

    const vlanMap = new Map<number, { vlanId: number; vlanName: string; bytes: number; count: number; blockedCount: number }>();
    const segmentMap = new Map<string, { segment: string; bytes: number; count: number; blockedCount: number }>();

    for (const log of sample) {
      const bIn = log.bytesIn || 0;
      const bOut = log.bytesOut || 0;
      const totalB = bIn + bOut;

      totalBytesIn += bIn;
      totalBytesOut += bOut;

      const isBlocked = log.action === 'drop' || log.action === 'block' || log.action === 'reject' || log.action === 'deny';

      if (!isBlocked) {
        allowedCount++;
      } else {
        blockedCount++;
        // Track blocked threat
        const threatKey = `${log.sourceIp}:${log.threatCategory || 'Access Denied'}`;
        const existingThreat = threatMap.get(threatKey) || {
          ip: log.sourceIp,
          threat: log.threatCategory || 'Policy Denied Outbound',
          count: 0,
          lastSeen: log.timestamp
        };
        existingThreat.count++;
        existingThreat.lastSeen = log.timestamp;
        threatMap.set(threatKey, existingThreat);
      }

      // VLAN Distribution
      if (log.vlanId !== undefined) {
        const vRec = vlanMap.get(log.vlanId) || {
          vlanId: log.vlanId,
          vlanName: log.vlanName || `VLAN ${log.vlanId}`,
          bytes: 0,
          count: 0,
          blockedCount: 0
        };
        vRec.bytes += totalB;
        vRec.count++;
        if (isBlocked) vRec.blockedCount++;
        vlanMap.set(log.vlanId, vRec);
      }

      // Segment Distribution
      const segName = log.subnetSegment || 'General Subnet';
      const segRec = segmentMap.get(segName) || {
        segment: segName,
        bytes: 0,
        count: 0,
        blockedCount: 0
      };
      segRec.bytes += totalB;
      segRec.count++;
      if (isBlocked) segRec.blockedCount++;
      segmentMap.set(segName, segRec);

      // Top Sources
      const src = sourceMap.get(log.sourceIp) || {
        ip: log.sourceIp,
        name: log.sourceName || log.sourceIp,
        dept: log.sourceDept || 'General Network',
        bytes: 0,
        count: 0
      };
      src.bytes += totalB;
      src.count++;
      sourceMap.set(log.sourceIp, src);

      // Top Destinations
      const dst = destMap.get(log.destIp) || {
        ip: log.destIp,
        name: log.destName || log.destIp,
        country: log.destCountry || 'IN',
        bytes: 0,
        count: 0
      };
      dst.bytes += totalB;
      dst.count++;
      destMap.set(log.destIp, dst);

      // Top Applications
      const app = appMap.get(log.application) || {
        name: log.application,
        bytes: 0,
        count: 0,
        risk: log.action === 'drop' ? 'High Risk / Blocked' : 'Normal Business'
      };
      app.bytes += totalB;
      app.count++;
      appMap.set(log.application, app);

      // Protocols
      const proto = protoMap.get(log.protocol) || {
        protocol: log.protocol,
        bytes: 0,
        count: 0
      };
      proto.bytes += totalB;
      proto.count++;
      protoMap.set(log.protocol, proto);
    }

    const totalLogs = sample.length;
    const blockRatePercent = totalLogs > 0 ? parseFloat(((blockedCount / totalLogs) * 100).toFixed(1)) : 0;

    const topSources = Array.from(sourceMap.values())
      .sort((a, b) => b.bytes - a.bytes)
      .slice(0, 10);

    const topDestinations = Array.from(destMap.values())
      .sort((a, b) => b.bytes - a.bytes)
      .slice(0, 10);

    const topBlockedThreats = Array.from(threatMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const topApplications = Array.from(appMap.values())
      .sort((a, b) => b.bytes - a.bytes)
      .slice(0, 10);

    const protocolDistribution = Array.from(protoMap.values())
      .sort((a, b) => b.bytes - a.bytes);

    const vlanDistribution = Array.from(vlanMap.values())
      .sort((a, b) => b.bytes - a.bytes);

    const segmentDistribution = Array.from(segmentMap.values())
      .sort((a, b) => b.bytes - a.bytes);

    return {
      timeRange: `${timeRangeMinutes}m`,
      totalLogs,
      totalBytesIn,
      totalBytesOut,
      totalBytes: totalBytesIn + totalBytesOut,
      allowedCount,
      blockedCount,
      blockRatePercent,
      topSources,
      topDestinations,
      topBlockedThreats,
      topApplications,
      protocolDistribution,
      vlanDistribution,
      segmentDistribution
    };
  }

  /**
   * Timeline Volume Aggregation (Allowed vs Blocked)
   */
  public getTrafficTimeline(timeRangeMinutes: number = 60): TimelineBucket[] {
    const bucketsCount = 20;
    const rangeMs = (timeRangeMinutes || 60) * 60 * 1000;
    const bucketIntervalMs = rangeMs / bucketsCount;
    const now = Date.now();
    const startTime = now - rangeMs;

    const buckets: TimelineBucket[] = [];
    for (let i = 0; i < bucketsCount; i++) {
      const bTime = new Date(startTime + i * bucketIntervalMs).toISOString();
      buckets.push({
        timestamp: bTime,
        allowedBytes: 0,
        blockedBytes: 0,
        allowedCount: 0,
        blockedCount: 0
      });
    }

    const logs = this.memoryLogBuffer.filter(l => now - new Date(l.timestamp).getTime() <= rangeMs);

    for (const l of logs) {
      const t = new Date(l.timestamp).getTime();
      const idx = Math.min(bucketsCount - 1, Math.max(0, Math.floor((t - startTime) / bucketIntervalMs)));
      const bytes = (l.bytesIn || 0) + (l.bytesOut || 0);

      if (l.action === 'allow') {
        buckets[idx].allowedBytes += bytes;
        buckets[idx].allowedCount++;
      } else {
        buckets[idx].blockedBytes += bytes;
        buckets[idx].blockedCount++;
      }
    }

    return buckets;
  }
}

export const influxService = new InfluxService();
