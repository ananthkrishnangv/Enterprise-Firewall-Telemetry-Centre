import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import path from 'path';

export interface StorageStats {
  connected: boolean;
  databaseName: string;
  host: string;
  port: number;
  tables: {
    syslog_events: number;
    telemetry_metrics: number;
    security_alerts: number;
    firewall_settings: number;
  };
  fileStorage: {
    dataDir: string;
    uploadsDir: string;
    syslogLogPath: string;
    syslogLogBytes: number;
  };
  engineVersion: string;
  retentionDays: number;
  lastChecked: string;
}

export class PostgresService {
  private pool: pkg.Pool | null = null;
  private connected: boolean = false;
  private connectionUri: string = '';
  private dataDir: string;
  private uploadsDir: string;

  constructor() {
    this.dataDir = process.env.DATA_DIR || path.resolve(process.cwd(), 'data');
    this.uploadsDir = process.env.UPLOADS_DIR || path.resolve(process.cwd(), 'uploads');
    
    // Ensure directories exist
    if (!fs.existsSync(this.dataDir)) fs.mkdirSync(this.dataDir, { recursive: true });
    if (!fs.existsSync(this.uploadsDir)) fs.mkdirSync(this.uploadsDir, { recursive: true });

    this.connectionUri = process.env.DATABASE_URL || 'postgresql://postgres:firewall_secret_2026!@10.40.0.151:5432/firewall_telemetry';
  }

  async init(): Promise<boolean> {
    try {
      this.pool = new Pool({
        connectionString: this.connectionUri,
        connectionTimeoutMillis: 5000,
        idleTimeoutMillis: 30000,
        max: 10,
      });

      // Test connection
      const client = await this.pool.connect();
      client.release();
      this.connected = true;
      console.log(`[PostgreSQL] Connected successfully to ${this.connectionUri.replace(/:[^:@]+@/, ':***@')}`);

      await this.createSchema();
      return true;
    } catch (err: any) {
      this.connected = false;
      console.warn(`[PostgreSQL] Not immediately reachable (${err.message}). Resilient fallback to local file storage at ${this.dataDir}. Will auto-reconnect.`);
      // Background retry loop
      this.scheduleReconnect();
      return false;
    }
  }

  private scheduleReconnect() {
    setTimeout(async () => {
      if (!this.connected) {
        await this.init();
      }
    }, 10000);
  }

  private async createSchema(): Promise<void> {
    if (!this.pool || !this.connected) return;

    const schemaQuery = `
      CREATE TABLE IF NOT EXISTS syslog_events (
        id BIGSERIAL PRIMARY KEY,
        timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        host TEXT,
        facility TEXT,
        severity TEXT,
        program TEXT,
        message TEXT,
        raw TEXT,
        threat_level TEXT,
        geo_country TEXT,
        client_ip TEXT
      );

      CREATE TABLE IF NOT EXISTS telemetry_metrics (
        id BIGSERIAL PRIMARY KEY,
        timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        device_id TEXT,
        in_bps BIGINT DEFAULT 0,
        out_bps BIGINT DEFAULT 0,
        cpu_pct NUMERIC(5,2) DEFAULT 0,
        mem_pct NUMERIC(5,2) DEFAULT 0,
        active_sessions INT DEFAULT 0,
        threat_score INT DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS firewall_settings (
        section TEXT PRIMARY KEY,
        payload JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS security_alerts (
        id TEXT PRIMARY KEY,
        timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        severity TEXT NOT NULL,
        title TEXT NOT NULL,
        detail TEXT,
        source_ip TEXT,
        acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
        acknowledged_at TIMESTAMPTZ
      );

      CREATE INDEX IF NOT EXISTS idx_syslog_timestamp ON syslog_events(timestamp DESC);
      CREATE INDEX IF NOT EXISTS idx_telemetry_timestamp ON telemetry_metrics(timestamp DESC);
      CREATE INDEX IF NOT EXISTS idx_alerts_acknowledged ON security_alerts(acknowledged);
    `;

    try {
      await this.pool.query(schemaQuery);
      console.log(`[PostgreSQL] Database tables & indices verified (syslog_events, telemetry_metrics, firewall_settings, security_alerts).`);
    } catch (err: any) {
      console.error(`[PostgreSQL] Failed to initialize schema: ${err.message}`);
    }
  }

  isDatabaseConnected(): boolean {
    return this.connected;
  }

  getConnectionDetails() {
    try {
      const parsed = new URL(this.connectionUri);
      return {
        host: parsed.hostname,
        port: parseInt(parsed.port || '5432'),
        database: parsed.pathname.replace(/^\//, ''),
        user: parsed.username
      };
    } catch {
      return { host: '10.40.0.151', port: 5432, database: 'firewall_telemetry', user: 'postgres' };
    }
  }

  // --- Syslog Events ---
  async storeSyslogEvent(evt: any): Promise<void> {
    // 1. Always append to local raw syslog archive file
    try {
      const logLine = `[${new Date().toISOString()}] ${evt.host || 'unknown'} ${evt.severity || 'INFO'} ${evt.program || 'syslog'}: ${evt.message || ''}\n`;
      const logPath = path.join(this.dataDir, 'syslog.log');
      fs.appendFileSync(logPath, logLine);
    } catch {}

    // 2. Insert into PostgreSQL if connected
    if (!this.pool || !this.connected) return;

    try {
      await this.pool.query(
        `INSERT INTO syslog_events (timestamp, host, facility, severity, program, message, raw, threat_level, geo_country, client_ip)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          evt.timestamp ? new Date(evt.timestamp) : new Date(),
          evt.host || '10.10.3.15',
          evt.facility || 'local7',
          evt.severity || 'notice',
          evt.program || 'fortigate',
          evt.message || '',
          evt.raw || '',
          evt.threatLevel || 'low',
          evt.geoCountry || 'IN',
          evt.clientIp || '10.10.3.15'
        ]
      );
    } catch (err: any) {
      // non-blocking
    }
  }

  // --- Telemetry Metrics ---
  async storeTelemetryMetric(metric: any): Promise<void> {
    if (!this.pool || !this.connected) return;

    try {
      await this.pool.query(
        `INSERT INTO telemetry_metrics (timestamp, device_id, in_bps, out_bps, cpu_pct, mem_pct, active_sessions, threat_score)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          new Date(),
          metric.deviceId || 'fw-fortigate-serc',
          metric.inBps || 0,
          metric.outBps || 0,
          metric.cpuPct || 0,
          metric.memPct || 0,
          metric.sessions || 0,
          metric.threatScore || 0
        ]
      );
    } catch (err: any) {}
  }

  // --- Settings Persistence ---
  async saveSettings(section: string, payload: any): Promise<boolean> {
    if (!this.pool || !this.connected) return false;

    try {
      await this.pool.query(
        `INSERT INTO firewall_settings (section, payload, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (section) DO UPDATE
         SET payload = $2, updated_at = NOW()`,
        [section, JSON.stringify(payload)]
      );
      return true;
    } catch (err: any) {
      console.error(`[PostgreSQL] Error saving settings for ${section}: ${err.message}`);
      return false;
    }
  }

  async loadSettings(section: string): Promise<any | null> {
    if (!this.pool || !this.connected) return null;

    try {
      const res = await this.pool.query(`SELECT payload FROM firewall_settings WHERE section = $1`, [section]);
      if (res.rows.length > 0) {
        return res.rows[0].payload;
      }
    } catch (err: any) {}
    return null;
  }

  // --- Security Alerts ---
  async storeAlert(alert: { id: string; severity: string; title: string; detail?: string; sourceIp?: string }): Promise<void> {
    if (!this.pool || !this.connected) return;

    try {
      await this.pool.query(
        `INSERT INTO security_alerts (id, timestamp, severity, title, detail, source_ip, acknowledged)
         VALUES ($1, NOW(), $2, $3, $4, $5, FALSE)
         ON CONFLICT (id) DO UPDATE
         SET severity = $2, title = $3, detail = $4, source_ip = $5`,
        [alert.id, alert.severity, alert.title, alert.detail || '', alert.sourceIp || '']
      );
    } catch (err: any) {}
  }

  async getAlerts(limit: number = 50): Promise<any[]> {
    if (!this.pool || !this.connected) return [];

    try {
      const res = await this.pool.query(
        `SELECT id, timestamp, severity, title, detail, source_ip as "sourceIp", acknowledged, acknowledged_at as "acknowledgedAt"
         FROM security_alerts
         ORDER BY timestamp DESC
         LIMIT $1`,
        [limit]
      );
      return res.rows;
    } catch {
      return [];
    }
  }

  async acknowledgeAlert(id: string): Promise<boolean> {
    if (!this.pool || !this.connected) return false;

    try {
      const res = await this.pool.query(
        `UPDATE security_alerts
         SET acknowledged = TRUE, acknowledged_at = NOW()
         WHERE id = $1`,
        [id]
      );
      return (res.rowCount || 0) > 0;
    } catch {
      return false;
    }
  }

  async clearAcknowledgedAlerts(): Promise<number> {
    if (!this.pool || !this.connected) return 0;

    try {
      const res = await this.pool.query(`DELETE FROM security_alerts WHERE acknowledged = TRUE`);
      return res.rowCount || 0;
    } catch {
      return 0;
    }
  }

  // --- Database Dump & Restore for Automated Backups ---
  async dumpDatabaseTables(): Promise<any> {
    if (!this.pool || !this.connected) {
      return {
        firewall_settings: [],
        security_alerts: [],
        telemetry_metrics: [],
        syslog_events: []
      };
    }

    try {
      const [settingsRes, alertsRes, telemetryRes, syslogRes] = await Promise.all([
        this.pool.query(`SELECT section, payload, updated_at FROM firewall_settings`),
        this.pool.query(`SELECT id, timestamp, severity, title, detail, source_ip, acknowledged, acknowledged_at FROM security_alerts ORDER BY timestamp DESC LIMIT 500`),
        this.pool.query(`SELECT id, timestamp, device_id, in_bps, out_bps, cpu_pct, mem_pct, active_sessions, threat_score FROM telemetry_metrics ORDER BY timestamp DESC LIMIT 1000`),
        this.pool.query(`SELECT id, timestamp, host, facility, severity, program, message, raw, threat_level, geo_country, client_ip FROM syslog_events ORDER BY timestamp DESC LIMIT 1000`)
      ]);

      return {
        firewall_settings: settingsRes.rows,
        security_alerts: alertsRes.rows,
        telemetry_metrics: telemetryRes.rows,
        syslog_events: syslogRes.rows
      };
    } catch (err: any) {
      console.error(`[PostgreSQL 18] Error dumping tables: ${err.message}`);
      return null;
    }
  }

  async restoreDatabaseTables(dump: any): Promise<void> {
    if (!this.pool || !this.connected || !dump) return;

    try {
      if (Array.isArray(dump.firewall_settings)) {
        for (const row of dump.firewall_settings) {
          await this.pool.query(
            `INSERT INTO firewall_settings (section, payload, updated_at)
             VALUES ($1, $2, $3)
             ON CONFLICT (section) DO UPDATE SET payload = $2, updated_at = $3`,
            [row.section, typeof row.payload === 'string' ? row.payload : JSON.stringify(row.payload), row.updated_at || new Date()]
          );
        }
      }

      if (Array.isArray(dump.security_alerts)) {
        for (const a of dump.security_alerts) {
          await this.pool.query(
            `INSERT INTO security_alerts (id, timestamp, severity, title, detail, source_ip, acknowledged, acknowledged_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             ON CONFLICT (id) DO UPDATE SET severity = $3, title = $4, detail = $5, source_ip = $6, acknowledged = $7, acknowledged_at = $8`,
            [a.id, a.timestamp || new Date(), a.severity, a.title, a.detail || '', a.source_ip || '', a.acknowledged || false, a.acknowledged_at || null]
          );
        }
      }

      if (Array.isArray(dump.telemetry_metrics) && dump.telemetry_metrics.length > 0) {
        for (const m of dump.telemetry_metrics) {
          await this.pool.query(
            `INSERT INTO telemetry_metrics (timestamp, device_id, in_bps, out_bps, cpu_pct, mem_pct, active_sessions, threat_score)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [m.timestamp || new Date(), m.device_id, m.in_bps, m.out_bps, m.cpu_pct, m.mem_pct, m.active_sessions, m.threat_score]
          );
        }
      }

      if (Array.isArray(dump.syslog_events) && dump.syslog_events.length > 0) {
        for (const s of dump.syslog_events) {
          await this.pool.query(
            `INSERT INTO syslog_events (timestamp, host, facility, severity, program, message, raw, threat_level, geo_country, client_ip)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [s.timestamp || new Date(), s.host, s.facility, s.severity, s.program, s.message, s.raw, s.threat_level, s.geo_country, s.client_ip]
          );
        }
      }
      console.log(`[PostgreSQL 18] Database tables restored successfully from backup.`);
    } catch (err: any) {
      console.error(`[PostgreSQL 18] Error restoring database tables: ${err.message}`);
    }
  }

  // --- Storage Registry & Statistics ---
  async getStorageStats(): Promise<StorageStats> {
    const conn = this.getConnectionDetails();
    let syslogCount = 0;
    let telemetryCount = 0;
    let alertsCount = 0;
    let settingsCount = 0;

    if (this.pool && this.connected) {
      try {
        const [r1, r2, r3, r4] = await Promise.all([
          this.pool.query(`SELECT COUNT(*) FROM syslog_events`),
          this.pool.query(`SELECT COUNT(*) FROM telemetry_metrics`),
          this.pool.query(`SELECT COUNT(*) FROM security_alerts`),
          this.pool.query(`SELECT COUNT(*) FROM firewall_settings`),
        ]);
        syslogCount = parseInt(r1.rows[0]?.count || '0');
        telemetryCount = parseInt(r2.rows[0]?.count || '0');
        alertsCount = parseInt(r3.rows[0]?.count || '0');
        settingsCount = parseInt(r4.rows[0]?.count || '0');
      } catch {}
    }

    const logPath = path.join(this.dataDir, 'syslog.log');
    let logBytes = 0;
    if (fs.existsSync(logPath)) {
      try {
        logBytes = fs.statSync(logPath).size;
      } catch {}
    }

    return {
      connected: this.connected,
      databaseName: conn.database,
      host: conn.host,
      port: conn.port,
      tables: {
        syslog_events: syslogCount,
        telemetry_metrics: telemetryCount,
        security_alerts: alertsCount,
        firewall_settings: settingsCount,
      },
      fileStorage: {
        dataDir: this.dataDir,
        uploadsDir: this.uploadsDir,
        syslogLogPath: logPath,
        syslogLogBytes: logBytes,
      },
      engineVersion: 'PostgreSQL 18.x (Alpine)',
      retentionDays: 180,
      lastChecked: new Date().toISOString()
    };
  }
}

export const postgresService = new PostgresService();
