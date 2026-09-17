import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { settingsStore } from '../storage/settings.store.js';
import { authStore } from '../storage/auth.store.js';
import { metadataStore } from '../storage/metadata.store.js';
import { postgresService } from '../storage/postgres.service.js';

export interface BackupConfig {
  enabled: boolean;
  frequency: 'hourly' | 'every_6_hours' | 'every_12_hours' | 'daily' | 'weekly';
  timeOfDay: string; // e.g. "00:00"
  retentionCount: number; // default 14
  includeDatabase: boolean; // default true
  includeLogs: boolean; // default true
  includeUploads: boolean; // default true
  lastRun: string | null;
  lastStatus: 'success' | 'failed' | 'idle';
  lastError?: string;
  nextRun: string | null;
}

export interface BackupManifest {
  filename: string;
  timestamp: string;
  trigger: 'scheduled' | 'manual' | 'pre_update';
  applianceVersion: string;
  engine: string;
  sizeBytes: number;
  sha256: string;
  itemCounts: {
    users: number;
    firewalls: number;
    settingsSections: number;
    dbAlerts: number;
    dbSyslog: number;
    dbMetrics: number;
    uploads: number;
    syslogLogBytes: number;
  };
}

export class BackupService {
  private backupDir: string;
  private dataDir: string;
  private uploadsDir: string;
  private configFile: string;
  private config: BackupConfig;
  private timer: NodeJS.Timeout | null = null;

  constructor() {
    this.backupDir = process.env.BACKUP_DIR || path.resolve(process.cwd(), 'backups');
    this.dataDir = process.env.DATA_DIR || path.resolve(process.cwd(), 'data');
    this.uploadsDir = process.env.UPLOADS_DIR || path.resolve(process.cwd(), 'uploads');
    this.configFile = path.join(this.backupDir, 'backup-config.json');

    if (!fs.existsSync(this.backupDir)) fs.mkdirSync(this.backupDir, { recursive: true });
    if (!fs.existsSync(this.dataDir)) fs.mkdirSync(this.dataDir, { recursive: true });
    if (!fs.existsSync(this.uploadsDir)) fs.mkdirSync(this.uploadsDir, { recursive: true });

    this.config = this.loadConfig();
  }

  private loadConfig(): BackupConfig {
    const defaults: BackupConfig = {
      enabled: true,
      frequency: 'daily',
      timeOfDay: '00:00',
      retentionCount: 14,
      includeDatabase: true,
      includeLogs: true,
      includeUploads: true,
      lastRun: null,
      lastStatus: 'idle',
      nextRun: null
    };

    if (fs.existsSync(this.configFile)) {
      try {
        const raw = fs.readFileSync(this.configFile, 'utf-8');
        const parsed = JSON.parse(raw);
        return { ...defaults, ...parsed };
      } catch {
        return defaults;
      }
    }
    return defaults;
  }

  private saveConfig() {
    try {
      fs.writeFileSync(this.configFile, JSON.stringify(this.config, null, 2));
    } catch (err: any) {
      console.error(`[BackupService] Failed to save backup-config.json: ${err.message}`);
    }
  }

  public init() {
    console.log(`[BackupService] Initializing Automated Settings & Log Backup Engine...`);
    console.log(`[BackupService] Backup directory: ${this.backupDir}`);

    // Compute initial next run if not set
    if (!this.config.nextRun || new Date(this.config.nextRun).getTime() < Date.now()) {
      this.config.nextRun = this.computeNextRun(this.config.frequency);
      this.saveConfig();
    }

    console.log(`[BackupService] Schedule: ${this.config.frequency} (Retention: ${this.config.retentionCount} backups, Next: ${this.config.nextRun})`);

    // Check ticker every 60 seconds
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => this.checkSchedule(), 60000);
  }

  private computeNextRun(freq: string): string {
    const now = new Date();
    switch (freq) {
      case 'hourly':
        return new Date(now.getTime() + 60 * 60 * 1000).toISOString();
      case 'every_6_hours':
        return new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString();
      case 'every_12_hours':
        return new Date(now.getTime() + 12 * 60 * 60 * 1000).toISOString();
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      case 'daily':
      default:
        const target = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        if (this.config?.timeOfDay && this.config.timeOfDay.includes(':')) {
          const [h, m] = this.config.timeOfDay.split(':').map(Number);
          target.setHours(h || 0, m || 0, 0, 0);
        }
        return target.toISOString();
    }
  }

  private async checkSchedule() {
    if (!this.config.enabled) return;
    if (!this.config.nextRun) {
      this.config.nextRun = this.computeNextRun(this.config.frequency);
      this.saveConfig();
      return;
    }

    const nextTime = new Date(this.config.nextRun).getTime();
    if (Date.now() >= nextTime) {
      console.log(`[BackupService] Automated scheduled backup triggered (${this.config.frequency})...`);
      try {
        await this.createBackup('scheduled');
      } catch (err: any) {
        console.error(`[BackupService] Scheduled backup error: ${err.message}`);
      }
    }
  }

  public async createBackup(trigger: 'scheduled' | 'manual' | 'pre_update' = 'manual'): Promise<BackupManifest> {
    const timestamp = new Date().toISOString();
    const dateSlug = timestamp.replace(/[:.]/g, '-');
    const filename = `backup-firewall-${dateSlug}-${trigger}.json`;
    const targetPath = path.join(this.backupDir, filename);

    console.log(`[BackupService] Creating ${trigger} backup package -> ${filename}`);

    // 1. Settings & Branding
    const settingsData = settingsStore.getSettings();

    // 2. User Accounts
    const usersData = authStore.getUsers();

    // 3. Firewall Device Profiles
    const firewallsData = metadataStore.getDevices();

    // 4. PostgreSQL 18 Database Dump
    let dbDump: any = null;
    if (this.config.includeDatabase) {
      dbDump = await postgresService.dumpDatabaseTables();
    }

    // 5. Raw Syslog File
    let rawSyslog = '';
    let syslogBytes = 0;
    const syslogPath = path.join(this.dataDir, 'syslog.log');
    if (this.config.includeLogs && fs.existsSync(syslogPath)) {
      try {
        const stats = fs.statSync(syslogPath);
        syslogBytes = stats.size;
        const MAX_BYTES = 25 * 1024 * 1024;
        if (syslogBytes > MAX_BYTES) {
          const fd = fs.openSync(syslogPath, 'r');
          const buffer = Buffer.alloc(MAX_BYTES);
          fs.readSync(fd, buffer, 0, MAX_BYTES, syslogBytes - MAX_BYTES);
          fs.closeSync(fd);
          rawSyslog = buffer.toString('utf-8');
        } else {
          rawSyslog = fs.readFileSync(syslogPath, 'utf-8');
        }
      } catch (e: any) {
        console.warn(`[BackupService] Could not read raw syslog: ${e.message}`);
      }
    }

    // 6. Uploaded Media & Logos
    const uploadsData: Array<{ filename: string; base64: string; size: number }> = [];
    if (this.config.includeUploads && fs.existsSync(this.uploadsDir)) {
      try {
        const files = fs.readdirSync(this.uploadsDir);
        for (const file of files) {
          const filePath = path.join(this.uploadsDir, file);
          if (fs.statSync(filePath).isFile()) {
            const buf = fs.readFileSync(filePath);
            uploadsData.push({
              filename: file,
              base64: buf.toString('base64'),
              size: buf.length
            });
          }
        }
      } catch {}
    }

    const payload = {
      appliance: 'CSIR-SERC Firewall Telemetry & Security Operations Command',
      version: 'v2.4.0-OTA',
      engine: 'PostgreSQL 18.x (Alpine)',
      timestamp,
      trigger,
      data: {
        settings: settingsData,
        users: usersData,
        firewalls: firewallsData,
        database: dbDump,
        syslog: {
          logBytes: syslogBytes,
          raw: rawSyslog
        },
        uploads: uploadsData
      }
    };

    const jsonString = JSON.stringify(payload, null, 2);
    const sha256 = crypto.createHash('sha256').update(jsonString).digest('hex');

    fs.writeFileSync(targetPath, jsonString, 'utf-8');

    const manifest: BackupManifest = {
      filename,
      timestamp,
      trigger,
      applianceVersion: 'v2.4.0-OTA',
      engine: 'PostgreSQL 18.x (Alpine)',
      sizeBytes: Buffer.byteLength(jsonString),
      sha256,
      itemCounts: {
        users: usersData.length,
        firewalls: firewallsData.length,
        settingsSections: Object.keys(settingsData || {}).length,
        dbAlerts: (dbDump?.security_alerts || []).length,
        dbSyslog: (dbDump?.syslog_events || []).length,
        dbMetrics: (dbDump?.telemetry_metrics || []).length,
        uploads: uploadsData.length,
        syslogLogBytes: syslogBytes
      }
    };

    // Update config
    this.config.lastRun = timestamp;
    this.config.lastStatus = 'success';
    delete this.config.lastError;
    this.config.nextRun = this.computeNextRun(this.config.frequency);
    this.saveConfig();

    // Auto-prune old backups
    this.pruneOldBackups();

    console.log(`[BackupService] Backup ${filename} created successfully (${Math.round(manifest.sizeBytes / 1024)} KB, SHA: ${sha256.slice(0, 8)}).`);
    return manifest;
  }

  public listBackups(): BackupManifest[] {
    if (!fs.existsSync(this.backupDir)) return [];

    try {
      const files = fs.readdirSync(this.backupDir).filter(f => f.startsWith('backup-firewall-') && f.endsWith('.json'));
      const list: BackupManifest[] = [];

      for (const filename of files) {
        const fullPath = path.join(this.backupDir, filename);
        try {
          const stats = fs.statSync(fullPath);
          const raw = fs.readFileSync(fullPath, 'utf-8');
          const parsed = JSON.parse(raw);
          const sha256 = crypto.createHash('sha256').update(raw).digest('hex');

          list.push({
            filename,
            timestamp: parsed.timestamp || stats.mtime.toISOString(),
            trigger: parsed.trigger || (filename.includes('scheduled') ? 'scheduled' : 'manual'),
            applianceVersion: parsed.version || 'v2.4.0-OTA',
            engine: parsed.engine || 'PostgreSQL 18',
            sizeBytes: stats.size,
            sha256,
            itemCounts: {
              users: (parsed.data?.users || []).length,
              firewalls: (parsed.data?.firewalls || []).length,
              settingsSections: Object.keys(parsed.data?.settings || {}).length,
              dbAlerts: (parsed.data?.database?.security_alerts || []).length,
              dbSyslog: (parsed.data?.database?.syslog_events || []).length,
              dbMetrics: (parsed.data?.database?.telemetry_metrics || []).length,
              uploads: (parsed.data?.uploads || []).length,
              syslogLogBytes: parsed.data?.syslog?.logBytes || 0
            }
          });
        } catch {
          // Skip corrupted
        }
      }

      // Sort by timestamp descending (newest first)
      list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      return list;
    } catch {
      return [];
    }
  }

  public getBackupPath(filename: string): string | null {
    const cleanFilename = path.basename(filename);
    const fullPath = path.join(this.backupDir, cleanFilename);
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      return fullPath;
    }
    return null;
  }

  public deleteBackup(filename: string): boolean {
    const cleanFilename = path.basename(filename);
    const fullPath = path.join(this.backupDir, cleanFilename);
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
        console.log(`[BackupService] Backup ${cleanFilename} deleted.`);
        return true;
      } catch (e) {
        return false;
      }
    }
    return false;
  }

  public pruneOldBackups() {
    const backups = this.listBackups();
    const limit = Math.max(2, this.config.retentionCount || 14);

    if (backups.length > limit) {
      const toDelete = backups.slice(limit);
      console.log(`[BackupService] Pruning ${toDelete.length} old backups beyond retention limit (${limit})...`);
      for (const b of toDelete) {
        this.deleteBackup(b.filename);
      }
    }
  }

  public async restoreBackup(archiveDataOrFilename: string | any): Promise<{ success: boolean; message: string; details?: any }> {
    let payload: any;

    if (typeof archiveDataOrFilename === 'string') {
      const p = this.getBackupPath(archiveDataOrFilename);
      if (p) {
        payload = JSON.parse(fs.readFileSync(p, 'utf-8'));
      } else {
        payload = JSON.parse(archiveDataOrFilename);
      }
    } else {
      payload = archiveDataOrFilename;
    }

    if (!payload || !payload.data) {
      return { success: false, message: 'Invalid backup package: Missing data payload.' };
    }

    const { settings, users, firewalls, database, syslog, uploads } = payload.data;
    const restoredSummary = {
      settingsRestored: false,
      usersCount: 0,
      firewallsCount: 0,
      dbRestored: false,
      uploadsCount: 0,
      syslogBytes: 0
    };

    try {
      // 1. Restore Settings & Branding
      if (settings) {
        settingsStore.updateSettings(settings);
        restoredSummary.settingsRestored = true;
      }

      // 2. Restore Firewalls
      if (Array.isArray(firewalls)) {
        for (const fw of firewalls) {
          const existing = metadataStore.getDeviceById(fw.id);
          if (existing) {
            metadataStore.updateDevice(fw.id, fw);
          } else {
            metadataStore.addDevice(fw);
          }
        }
        restoredSummary.firewallsCount = firewalls.length;
      }

      // 3. Restore PostgreSQL 18 Database Tables
      if (database) {
        await postgresService.restoreDatabaseTables(database);
        restoredSummary.dbRestored = true;
      }

      // 4. Restore Uploaded Media
      if (Array.isArray(uploads)) {
        if (!fs.existsSync(this.uploadsDir)) fs.mkdirSync(this.uploadsDir, { recursive: true });
        for (const up of uploads) {
          if (up.filename && up.base64) {
            const buf = Buffer.from(up.base64, 'base64');
            const cleanName = path.basename(up.filename);
            fs.writeFileSync(path.join(this.uploadsDir, cleanName), buf);
          }
        }
        restoredSummary.uploadsCount = uploads.length;
      }

      // 5. Restore Syslog Log
      if (syslog && syslog.raw) {
        const logPath = path.join(this.dataDir, 'syslog.log');
        fs.writeFileSync(logPath, syslog.raw, 'utf-8');
        restoredSummary.syslogBytes = Buffer.byteLength(syslog.raw);
      }

      console.log(`[BackupService] Appliance state restored successfully from backup package.`);
      return {
        success: true,
        message: 'Appliance settings, database tables, and log assets restored successfully!',
        details: restoredSummary
      };
    } catch (err: any) {
      console.error(`[BackupService] Error during restoration: ${err.message}`);
      return { success: false, message: `Restore failed: ${err.message}` };
    }
  }

  public getConfig(): BackupConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<BackupConfig>): BackupConfig {
    this.config = { ...this.config, ...newConfig };
    this.config.nextRun = this.computeNextRun(this.config.frequency);
    this.saveConfig();
    console.log(`[BackupService] Backup schedule updated: ${this.config.frequency}, next: ${this.config.nextRun}`);
    return this.getConfig();
  }
}

export const backupService = new BackupService();
