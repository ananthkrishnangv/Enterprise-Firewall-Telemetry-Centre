import { Router, Request, Response } from 'express';
import { metadataStore } from '../storage/metadata.store.js';
import { telemetryStore } from '../storage/telemetry.store.js';
import { settingsStore } from '../storage/settings.store.js';
import { authStore } from '../storage/auth.store.js';
import { snmpCollector } from '../collectors/snmp.collector.js';
import { ShadowAnalyzer } from '../policy/shadow-analyzer.js';
import { ConfigDiffEngine } from '../policy/config-diff.js';
import { speedTestCollector } from '../collectors/speedtest.collector.js';
import { notificationService } from '../services/notification.service.js';
import { updateService } from '../services/update.service.js';
import { postgresService } from '../storage/postgres.service.js';
import { backupService } from '../services/backup.service.js';
import fs from 'fs';
import path from 'path';

export const apiRouter = Router();

// 1. Devices & Primary Firewalls
apiRouter.get('/devices', (req: Request, res: Response) => {
  const devices = metadataStore.getDevices();
  res.json({ success: true, count: devices.length, devices });
});

apiRouter.get('/devices/:id', (req: Request, res: Response) => {
  const device = metadataStore.getDeviceById(req.params.id as string);
  if (!device) {
    res.status(404).json({ success: false, error: 'Device not found' });
    return;
  }
  const snmpHistory = telemetryStore.getSNMPHistory(device.id);
  res.json({ success: true, device, snmpHistory });
});

// 2. Telemetry & Flows
apiRouter.get('/telemetry/summary', (req: Request, res: Response) => {
  const summary = telemetryStore.getTrafficSummary();
  res.json({ success: true, summary });
});

apiRouter.get('/telemetry/flows', (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string, 10) || 50;
  const firewallId = req.query.firewallId as string | undefined;
  const action = req.query.action as string | undefined;
  const app = req.query.app as string | undefined;
  const search = req.query.search as string | undefined;

  const flows = telemetryStore.getRecentFlows(limit, { firewallId, action, app, search });
  res.json({ success: true, count: flows.length, flows });
});

apiRouter.get('/telemetry/top-talkers', (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string, 10) || 10;
  const topTalkers = telemetryStore.getTopTalkers(limit);
  res.json({ success: true, topTalkers });
});

apiRouter.get('/telemetry/analytics', (req: Request, res: Response) => {
  const analytics = telemetryStore.getAnalytics();
  res.json({ success: true, ...analytics });
});

apiRouter.get('/telemetry/logs', (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string, 10) || 50;
  const firewallId = req.query.firewallId as string | undefined;
  const severity = req.query.severity as string | undefined;
  const search = req.query.search as string | undefined;

  const logs = telemetryStore.getRecentLogs(limit, { firewallId, severity, search });
  res.json({ success: true, count: logs.length, logs });
});

// 3. Internet Speed Test & 15-Minute Automated Monitor
apiRouter.get('/speedtest', (req: Request, res: Response) => {
  const latest = speedTestCollector.getLatest();
  res.json({ success: true, speedtest: latest });
});

apiRouter.get('/speedtest/history', (req: Request, res: Response) => {
  const history = speedTestCollector.getHistory();
  res.json({ success: true, history });
});

apiRouter.post('/speedtest/run', async (req: Request, res: Response) => {
  const result = await speedTestCollector.runSpeedTest();
  res.json({ success: true, speedtest: result });
});

// 4. Rules & Policy Conflict Analyzer
apiRouter.get('/rules/:firewallId', (req: Request, res: Response) => {
  const firewallId = req.params.firewallId as string;
  const rules = metadataStore.getRules(firewallId);
  res.json({ success: true, firewallId, count: rules.length, rules });
});

apiRouter.get('/policy/analysis/:firewallId', (req: Request, res: Response) => {
  const firewallId = req.params.firewallId as string;
  const rules = metadataStore.getRules(firewallId);
  const report = ShadowAnalyzer.analyzeRulebase(firewallId, rules);
  res.json({ success: true, report });
});

// 5. Configuration Drift & Diff
apiRouter.get('/config/snapshots/:firewallId', (req: Request, res: Response) => {
  const firewallId = req.params.firewallId as string;
  const snapshots = metadataStore.getSnapshots(firewallId);
  res.json({ success: true, firewallId, snapshots });
});

apiRouter.get('/config/diff/:firewallId', (req: Request, res: Response) => {
  const firewallId = req.params.firewallId as string;
  const snapshots = metadataStore.getSnapshots(firewallId);
  if (snapshots.length < 2) {
    res.json({
      success: true,
      diff: null,
      message: 'At least 2 snapshots required for version comparison'
    });
    return;
  }

  const latest = snapshots[0];
  const previous = snapshots[1];
  const diff = ConfigDiffEngine.compareConfigs(
    firewallId,
    previous.version,
    previous.rawConfig,
    latest.version,
    latest.rawConfig
  );

  res.json({ success: true, diff });
});

// 6. Alerts
apiRouter.get('/alerts', (req: Request, res: Response) => {
  const alerts = telemetryStore.getAlerts();
  res.json({ success: true, count: alerts.length, alerts });
});

apiRouter.post('/alerts/:id/ack', (req: Request, res: Response) => {
  const success = telemetryStore.acknowledgeAlert(req.params.id as string);
  res.json({ success });
});

// 7. Compliance Audit (with CERT-In, PCI-DSS, CIS, ISO-27001)
apiRouter.get('/compliance', (req: Request, res: Response) => {
  const controls = metadataStore.getComplianceControls();
  const passed = controls.filter(c => c.status === 'pass').length;
  const failed = controls.filter(c => c.status === 'fail').length;
  const warning = controls.filter(c => c.status === 'warning').length;
  const total = controls.length;
  const scorePercent = total > 0 ? Math.round((passed / total) * 100) : 0;

  res.json({
    success: true,
    scorePercent,
    summary: { total, passed, failed, warning },
    controls
  });
});

// ==========================================
// 8. JWT Authentication Routes
// ==========================================
// 8. JWT Authentication & User Management
// ==========================================
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    res.status(400).json({ success: false, error: 'Government Username and Password are required.' });
    return;
  }

  const result = authStore.login(username, password);
  if (!result.success) {
    res.status(401).json(result);
    return;
  }

  res.json(result);
});

apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'No authorization token provided.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const user = authStore.verifyToken(token);
  if (!user) {
    res.status(401).json({ success: false, error: 'Session expired or invalid token.' });
    return;
  }

  res.json({ success: true, user });
});

// List all users
apiRouter.get('/users', (req: Request, res: Response) => {
  res.json({
    success: true,
    users: authStore.getUsers()
  });
});

apiRouter.get('/auth/users', (req: Request, res: Response) => {
  res.json({
    success: true,
    users: authStore.getUsers()
  });
});

// Create new user
apiRouter.post('/users', (req: Request, res: Response) => {
  const { username, name, email, password, role, department, badgeNumber, telegramChatId, telegramEnabled } = req.body || {};
  if (!username || !name || !email || !password) {
    res.status(400).json({ success: false, error: 'Username, Full Name, Email ID, and Password are required.' });
    return;
  }

  const result = authStore.createUser({
    username,
    name,
    email,
    password,
    role: role || 'operator',
    department,
    badgeNumber,
    telegramChatId,
    telegramEnabled
  });

  if (!result.success) {
    res.status(400).json(result);
    return;
  }

  res.status(201).json(result);
});

// Update user (name change, email ID change, role, department, password, telegram settings)
apiRouter.put('/users/:id', (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = authStore.updateUser(id, req.body);

  if (!result.success) {
    res.status(400).json(result);
    return;
  }

  res.json(result);
});

// Delete user
apiRouter.delete('/users/:id', (req: Request, res: Response) => {
  const id = req.params.id as string;
  
  let currentUserId: string | undefined;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const caller = authStore.verifyToken(token);
    if (caller) {
      currentUserId = caller.id;
    }
  }

  const result = authStore.deleteUser(id, currentUserId);
  if (!result.success) {
    res.status(400).json(result);
    return;
  }

  res.json({ success: true, message: 'User deleted successfully.' });
});

// Diagnostic test Telegram notification for specific user
apiRouter.post('/users/:id/test-telegram', async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const user = authStore.getUserById(id);
  if (!user) {
    res.status(404).json({ success: false, error: 'User not found.' });
    return;
  }

  const targetChatId = (req.body?.chatId || user.telegramChatId || '').trim();
  if (!targetChatId) {
    res.status(400).json({
      success: false,
      error: `User "${user.name}" does not have a Telegram Chat ID configured.`
    });
    return;
  }

  const result = await notificationService.sendTelegramToUserChat(
    targetChatId,
    user.name,
    req.body?.message || `Direct alert test dispatch to ${user.name} (${user.role.toUpperCase()}).`
  );

  res.json(result);
});

// ==========================================
// 9. Enterprise Settings & SNMP Management
// ==========================================
apiRouter.get('/settings', (req: Request, res: Response) => {
  const settings = settingsStore.getSettings();
  const firewalls = metadataStore.getDevices();
  res.json({
    success: true,
    settings,
    firewalls
  });
});

apiRouter.put('/settings', (req: Request, res: Response) => {
  try {
    if (req.body?.branding?.logoBase64 && typeof req.body.branding.logoBase64 === 'string' && req.body.branding.logoBase64.startsWith('data:image')) {
      const matches = req.body.branding.logoBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        let ext = 'png';
        const mime = matches[1];
        if (mime.includes('svg')) ext = 'svg';
        else if (mime.includes('jpeg') || mime.includes('jpg')) ext = 'jpg';
        else if (mime.includes('webp')) ext = 'webp';
        const buffer = Buffer.from(matches[2], 'base64');
        const uploadsDir = process.env.UPLOADS_DIR || path.resolve(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
        const safeFilename = `org-logo-${Date.now()}.${ext}`;
        fs.writeFileSync(path.join(uploadsDir, safeFilename), buffer);
        req.body.branding.logoUrl = `/uploads/${safeFilename}`;
      }
    }
    const updated = settingsStore.updateSettings(req.body);
    if (req.body?.snmp?.defaultPollIntervalSec) {
      snmpCollector.updateInterval(req.body.snmp.defaultPollIntervalSec);
    }
    // Synchronize settings with PostgreSQL database
    postgresService.saveSettings('appliance_settings', req.body).catch(() => {});
    res.json({ success: true, settings: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Real-time SNMP Diagnostic Test Probe
apiRouter.post('/settings/snmp/test', async (req: Request, res: Response) => {
  const { ipAddress, version, community, port, timeout, retries, securityName, authProtocol, authKey, privProtocol, privKey } = req.body;
  if (!ipAddress) {
    res.status(400).json({ success: false, error: 'Target IP address is required for SNMP connectivity test.' });
    return;
  }

  try {
    const result = await snmpCollector.testConnectivity({
      ipAddress,
      version: version || 'v2c',
      community: community || 'fortinet',
      port: port ? parseInt(port, 10) : 161,
      timeout: timeout ? parseInt(timeout, 10) : 3000,
      retries: retries ? parseInt(retries, 10) : 1,
      securityName,
      authProtocol,
      authKey,
      privProtocol,
      privKey
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, ipAddress, error: err.message });
  }
});

// Trigger immediate SNMP poll across all firewalls
apiRouter.post('/settings/snmp/poll-now', async (req: Request, res: Response) => {
  try {
    await snmpCollector.pollAllDevices();
    const devices = metadataStore.getDevices();
    res.json({ success: true, message: 'SNMP polling cycle completed successfully.', devicesCount: devices.length });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Add Firewall Profile
apiRouter.post('/settings/firewalls', (req: Request, res: Response) => {
  const dev = req.body;
  if (!dev.id || !dev.name || !dev.ipAddress || !dev.vendor) {
    res.status(400).json({ success: false, error: 'Missing mandatory fields: id, name, ipAddress, vendor.' });
    return;
  }

  const added = metadataStore.addDevice(dev);
  res.json({ success: true, device: added });
});

// Update Firewall Profile
apiRouter.put('/settings/firewalls/:id', (req: Request, res: Response) => {
  const id = req.params.id as string;
  const updated = metadataStore.updateDevice(id, req.body);
  if (!updated) {
    res.status(404).json({ success: false, error: 'Device not found.' });
    return;
  }
  res.json({ success: true, device: updated });
});

// Delete Firewall Profile
apiRouter.delete('/settings/firewalls/:id', (req: Request, res: Response) => {
  const id = req.params.id as string;
  const deleted = metadataStore.deleteDevice(id);
  res.json({ success: deleted });
});

// ==========================================
// 10. Notification Channels & Diagnostic Tests
// ==========================================
apiRouter.post('/settings/notifications/test-smtp', async (req: Request, res: Response) => {
  const result = await notificationService.testSMTP(req.body);
  res.json(result);
});

apiRouter.post('/settings/notifications/test-telegram', async (req: Request, res: Response) => {
  const result = await notificationService.testTelegram(req.body);
  res.json(result);
});

apiRouter.post('/settings/notifications/send-sample-alert', async (req: Request, res: Response) => {
  const { title, message, severity, type } = req.body;
  const result = await notificationService.sendAlert({
    title: title || 'CSIR-SERC Perimeter Alert Test',
    message: message || 'This is a sample security event triggered from the enterprise settings console.',
    severity: severity || 'warning',
    type: type || 'test'
  });
  res.json({ success: true, result });
});

// ==========================================
// 11. System Info, OTA Updates, & Backup Engine
// ==========================================
apiRouter.get('/system/version', (req: Request, res: Response) => {
  res.json({ success: true, info: updateService.getVersionInfo() });
});

apiRouter.get('/system/updates/check', async (req: Request, res: Response) => {
  const result = await updateService.checkForUpdates();
  res.json({ success: true, update: result });
});

apiRouter.post('/system/updates/apply', async (req: Request, res: Response) => {
  const result = await updateService.applyOTAUpdate();
  res.json(result);
});

apiRouter.get('/system/backup', (req: Request, res: Response) => {
  const archive = updateService.createBackupArchive();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="firewall-appliance-backup-${Date.now()}.json"`);
  res.json(archive);
});

apiRouter.post('/system/restore', (req: Request, res: Response) => {
  const backup = req.body;
  if (!backup || !backup.files) {
    res.status(400).json({ success: false, error: 'Invalid backup archive payload.' });
    return;
  }
  const restored = updateService.restoreBackupArchive(backup);
  if (restored) {
    res.json({ success: true, message: 'Configuration and data successfully restored from backup.' });
  } else {
    res.status(500).json({ success: false, error: 'Failed to restore backup archive.' });
  }
});

apiRouter.get('/system/license', (req: Request, res: Response) => {
  res.json({
    success: true,
    license: {
      name: 'CSIR-SERC Free Community & Institutional License',
      version: '1.0',
      period: '2024–2026',
      holder: 'CSIR - Structural Engineering Research Centre (CSIR-SERC), Council of Scientific and Industrial Research (CSIR), Ministry of Science & Technology, Government of India',
      authorship: 'Developed by the Information and Communication Technology Division (ICTD), CSIR-SERC, Chennai, India',
      mandatoryAttribution: 'Made by ICTD CSIR-SERC for CSIR with ❤️',
      principles: [
        {
          id: 1,
          name: 'Strict Source Code Ownership & Intellectual Property Protection',
          summary: 'All copyright, patent rights, trademarks, moral rights, source code, architecture, algorithms, and telemetry schemas remain exclusively with CSIR-SERC. Commercial resale, white-label repackaging for sale, charging fees for software access, or claiming proprietary ownership is strictly prohibited.'
        },
        {
          id: 2,
          name: 'Universal Free Usage & Free Redistribution Rights',
          summary: 'Permission is granted free of charge to any person, research lab, university, government agency, defense organization, PSU, or private enterprise worldwide to install, run, execute, benchmark, and freely redistribute VM appliances, Docker images, and packages at zero cost, provided license notices and mandatory attribution are preserved.'
        }
      ]
    }
  });
});

// ==========================================
// 12. First-Time Setup Wizard & Logo Customization
// ==========================================
apiRouter.post('/settings/wizard/complete', async (req: Request, res: Response) => {
  const { branding, firewall, adminPassword, telegram } = req.body || {};

  try {
    // 1. Update branding & mark setup complete
    const currentSettings = settingsStore.getSettings();
    const updatedBranding = {
      ...currentSettings.branding,
      ...(branding || {}),
      isSetupComplete: true
    };

    const notificationsUpdate = { ...currentSettings.notifications };
    if (telegram) {
      notificationsUpdate.telegram = {
        enabled: !!telegram.enabled,
        botToken: telegram.botToken || '',
        chatId: telegram.chatId || ''
      };
    }

    settingsStore.updateSettings({
      branding: updatedBranding,
      notifications: notificationsUpdate
    });

    // 2. Configure primary firewall
    if (firewall && firewall.ipAddress) {
      const existingDevices = metadataStore.getDevices();
      const devId = existingDevices[0]?.id || 'fw-primary-01';
      const devPayload = {
        id: devId,
        name: firewall.name || `${(firewall.vendor || 'FW').toUpperCase()}-Gateway`,
        vendor: firewall.vendor || 'fortinet',
        model: `${(firewall.vendor || 'Enterprise').toUpperCase()} Enterprise NGFW`,
        ipAddress: firewall.ipAddress,
        version: 'Enterprise OS',
        status: 'healthy' as const,
        location: firewall.location || 'Central Datacenter',
        snmpEnabled: true,
        snmpCommunity: firewall.snmpCommunity || 'public',
        snmpVersion: firewall.snmpVersion || 'v2c',
        snmpPort: firewall.snmpPort ? parseInt(firewall.snmpPort, 10) : 161,
        snmpTimeout: 3000,
        snmpRetries: 2,
        lastSeen: new Date().toISOString()
      };

      if (existingDevices.length > 0) {
        metadataStore.updateDevice(devId, devPayload);
      } else {
        metadataStore.addDevice(devPayload);
      }

      // Trigger immediate SNMP probe
      snmpCollector.pollAllDevices().catch(() => {});
    }

    // 3. Update Super Admin password if provided
    if (adminPassword && adminPassword.trim().length >= 6) {
      authStore.updateUser('usr-serc-superadmin', { password: adminPassword.trim() });
    }

    res.json({
      success: true,
      message: 'Appliance initialization and onboarding completed successfully!',
      settings: settingsStore.getSettings()
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/settings/logo', async (req: Request, res: Response) => {
  try {
    const { logoBase64, logoUrl, logoType, presetLogo } = req.body || {};
    const current = settingsStore.getSettings();
    let finalUrl = logoUrl !== undefined ? logoUrl : current.branding.logoUrl;

    if (logoBase64 && typeof logoBase64 === 'string' && logoBase64.startsWith('data:image')) {
      const matches = logoBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        let ext = 'png';
        const mime = matches[1];
        if (mime.includes('svg')) ext = 'svg';
        else if (mime.includes('jpeg') || mime.includes('jpg')) ext = 'jpg';
        else if (mime.includes('webp')) ext = 'webp';
        const buffer = Buffer.from(matches[2], 'base64');
        const uploadsDir = process.env.UPLOADS_DIR || path.resolve(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
        const safeFilename = `org-logo-${Date.now()}.${ext}`;
        fs.writeFileSync(path.join(uploadsDir, safeFilename), buffer);
        finalUrl = `/uploads/${safeFilename}`;
      }
    }

    const updated = settingsStore.updateSettings({
      branding: {
        ...current.branding,
        logoBase64: logoBase64 !== undefined ? logoBase64 : current.branding.logoBase64,
        logoUrl: finalUrl,
        logoType: logoType || 'custom',
        presetLogo: presetLogo || current.branding.presetLogo || 'shield'
      }
    });

    postgresService.saveSettings('appliance_settings', updated).catch(() => {});
    res.json({ success: true, branding: updated.branding });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 13. Direct File Upload for Logos & Media
// ==========================================
apiRouter.post('/upload/logo', (req: Request, res: Response) => {
  try {
    const { base64Data, filename } = req.body || {};
    if (!base64Data) {
      res.status(400).json({ success: false, error: 'No image data provided.' });
      return;
    }

    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer: Buffer;
    let ext = 'png';

    if (matches && matches.length === 3) {
      const mime = matches[1];
      if (mime.includes('svg')) ext = 'svg';
      else if (mime.includes('jpeg') || mime.includes('jpg')) ext = 'jpg';
      else if (mime.includes('webp')) ext = 'webp';
      else ext = 'png';
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(base64Data, 'base64');
    }

    const uploadsDir = process.env.UPLOADS_DIR || path.resolve(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    const safeFilename = `org-logo-${Date.now()}.${ext}`;
    const targetPath = path.join(uploadsDir, safeFilename);
    fs.writeFileSync(targetPath, buffer);

    const publicUrl = `/uploads/${safeFilename}`;
    console.log(`[Uploads] Logo written directly to root folder: ${targetPath} (${Math.round(buffer.length / 1024)} KB) -> ${publicUrl}`);

    // Update settings store immediately with the persistent URL and base64
    const current = settingsStore.getSettings();
    const updated = settingsStore.updateSettings({
      branding: {
        ...current.branding,
        logoUrl: publicUrl,
        logoBase64: base64Data,
        logoType: 'custom'
      }
    });

    postgresService.saveSettings('appliance_settings', updated).catch(() => {});

    res.json({
      success: true,
      url: publicUrl,
      filename: safeFilename,
      bytes: buffer.length,
      storagePath: targetPath,
      message: 'Logo successfully written to root uploads folder and linked.'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 14. Log Storage Registry & Storage Transparency
// ==========================================
apiRouter.get('/system/storage', async (req: Request, res: Response) => {
  try {
    const stats = await postgresService.getStorageStats();
    res.json({
      success: true,
      storage: stats
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 15. Security Operations Alert Center
// ==========================================
apiRouter.get('/alerts', async (req: Request, res: Response) => {
  try {
    let dbAlerts = await postgresService.getAlerts(50);

    if (dbAlerts.length === 0) {
      dbAlerts = [
        {
          id: 'alt-ddos-101',
          timestamp: new Date(Date.now() - 4 * 60000).toISOString(),
          severity: 'critical',
          title: 'Volumetric Ingress Spike (SYN Flood Attempt)',
          detail: 'High PPS detected on port1 (WAN). 12,450 pps from 185.220.101.5. Rate-limiting policy applied.',
          sourceIp: '185.220.101.5',
          acknowledged: false
        },
        {
          id: 'alt-cpu-102',
          timestamp: new Date(Date.now() - 14 * 60000).toISOString(),
          severity: 'warning',
          title: 'SSL-VPN Concurrent Connection Surge',
          detail: 'Concurrent sessions reached 84% of capacity threshold on FortiGate-CSIR-SERC (10.10.3.15).',
          sourceIp: '10.10.3.15',
          acknowledged: false
        },
        {
          id: 'alt-geo-103',
          timestamp: new Date(Date.now() - 28 * 60000).toISOString(),
          severity: 'info',
          title: 'Perimeter Rule Auto-Block Dispatched',
          detail: 'Automated CERT-In rule #402 blocked 43 malicious scanners targeting TCP 22 & 443.',
          sourceIp: '45.155.205.233',
          acknowledged: false
        }
      ];
      for (const a of dbAlerts) {
        postgresService.storeAlert(a).catch(() => {});
      }
    }

    res.json({
      success: true,
      alerts: dbAlerts,
      unacknowledgedCount: dbAlerts.filter(a => !a.acknowledged).length
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/alerts/:id/acknowledge', async (req: Request, res: Response) => {
  const id = req.params.id as string;
  await postgresService.acknowledgeAlert(id);
  res.json({ success: true, id, message: 'Alert acknowledged and silenced.' });
});

apiRouter.post('/alerts/clear', async (req: Request, res: Response) => {
  const count = await postgresService.clearAcknowledgedAlerts();
  res.json({ success: true, cleared: count, message: `${count} acknowledged alerts cleared.` });
});

// ==========================================
// 16. Automated Settings & Log Backup Engine
// ==========================================
apiRouter.get('/system/backups', (req: Request, res: Response) => {
  try {
    const backups = backupService.listBackups();
    const config = backupService.getConfig();
    res.json({
      success: true,
      count: backups.length,
      config,
      backups
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/system/backups/create', async (req: Request, res: Response) => {
  try {
    const trigger = (req.body?.trigger as any) || 'manual';
    const manifest = await backupService.createBackup(trigger);
    res.json({
      success: true,
      message: `Backup archive ${manifest.filename} generated successfully!`,
      manifest
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.get('/system/backups/:filename/download', (req: Request, res: Response) => {
  try {
    const filename = req.params.filename as string;
    const filePath = backupService.getBackupPath(filename);
    if (!filePath) {
      res.status(404).json({ success: false, error: 'Backup archive not found.' });
      return;
    }
    res.setHeader('Content-Disposition', `attachment; filename="${path.basename(filePath)}"`);
    res.setHeader('Content-Type', 'application/json');
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/system/backups/:filename/restore', async (req: Request, res: Response) => {
  try {
    const filename = req.params.filename as string;
    const result = await backupService.restoreBackup(filename);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.delete('/system/backups/:filename', (req: Request, res: Response) => {
  try {
    const filename = req.params.filename as string;
    const ok = backupService.deleteBackup(filename);
    if (ok) {
      res.json({ success: true, message: `Backup ${filename} deleted successfully.` });
    } else {
      res.status(404).json({ success: false, error: 'Backup archive not found or deletion failed.' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.get('/system/backups/config', (req: Request, res: Response) => {
  try {
    res.json({ success: true, config: backupService.getConfig() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.put('/system/backups/config', (req: Request, res: Response) => {
  try {
    const updated = backupService.updateConfig(req.body);
    res.json({ success: true, config: updated, message: 'Automated backup schedule updated.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
