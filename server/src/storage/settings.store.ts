import { SystemSettings } from '../types/index.js';
import { persistence } from './persistence.js';

const DEFAULT_SETTINGS: SystemSettings = {
  branding: {
    portalTitle: 'CSIR - Structural Engineering Research Centre',
    portalSubtitle: 'Enterprise Firewall Telemetry & Security Operations Command',
    orgName: 'CSIR-SERC (Chennai)',
    orgDivision: 'ICT & Network Security Division',
    apexBody: 'Council of Scientific & Industrial Research',
    loginTitle: 'Network & Security Operations Command',
    loginSubtitle: 'CSIR-SERC Centralized Infrastructure & Perimeter Access',
    footerNotice: 'CSIR - Structural Engineering Research Centre • Council of Scientific & Industrial Research',
    ntpBadgeText: 'NPL Atomic Clock NTP Synchronized • Internal Network Only',
    threatAdvisoryLevel: 'MONITORED',
    threatAdvisoryDetail: 'Perimeter Defense Active • Normal Baseline Traffic',
    logoType: 'preset',
    presetLogo: 'shield',
    isSetupComplete: true
  },
  notifications: {
    smtp: {
      enabled: false,
      host: 'mail.serc.res.in',
      port: 587,
      secure: false,
      user: 'firewall-alerts@serc.res.in',
      password: '',
      fromEmail: 'firewall-alerts@serc.res.in',
      toEmails: 'network-admin@serc.res.in'
    },
    telegram: {
      enabled: false,
      botToken: '',
      chatId: ''
    },
    triggers: {
      seriousAttackEnabled: true,
      ddosEnabled: true,
      ddosThresholdMbps: 500,
      firewallDownEnabled: true,
      bandwidthLowEnabled: true,
      bandwidthLowThresholdMbps: 5,
      cpuThresholdPercent: 80,
      memoryThresholdPercent: 85
    }
  },
  snmp: {
    defaultPollIntervalSec: 15,
    defaultPort: 161,
    defaultTimeoutMs: 3000,
    defaultRetries: 2,
    liveSnmpEnabled: true
  },
  collectors: {
    syslogPort: 1514,
    syslogAltPort: 514,
    netflowPort: 2055,
    bufferQueueSize: 10000,
    certInRetentionDays: 180
  },
  speedtest: {
    intervalMinutes: 15,
    autoSchedule: true,
    primaryServer: 'New Delhi - NIXI Gateway (NIC / MeitY)'
  },
  thresholds: {
    cpuWarningPercent: 75,
    cpuCriticalPercent: 90,
    memWarningPercent: 80,
    memCriticalPercent: 92,
    concurrentConnAlert: 50000
  }
};

class SettingsStore {
  private settings: SystemSettings;

  constructor() {
    this.settings = persistence.loadJSON<SystemSettings>('settings.json', DEFAULT_SETTINGS);
    // Ensure all default fields exist if loading from previous version
    this.settings = {
      ...DEFAULT_SETTINGS,
      ...this.settings,
      branding: {
        ...DEFAULT_SETTINGS.branding,
        ...(this.settings.branding || {})
      },
      notifications: {
        ...DEFAULT_SETTINGS.notifications,
        ...(this.settings.notifications || {}),
        triggers: {
          ...DEFAULT_SETTINGS.notifications.triggers,
          ...(this.settings.notifications?.triggers || {})
        }
      }
    };
    // Save to disk to establish baseline
    persistence.saveJSON('settings.json', this.settings);
  }

  public getSettings(): SystemSettings {
    return JSON.parse(JSON.stringify(this.settings));
  }

  public updateSettings(partial: Partial<SystemSettings>): SystemSettings {
    if (partial.branding) {
      this.settings.branding = { ...this.settings.branding, ...partial.branding };
    }
    if (partial.notifications) {
      this.settings.notifications = {
        ...this.settings.notifications,
        ...partial.notifications,
        smtp: { ...this.settings.notifications.smtp, ...(partial.notifications.smtp || {}) },
        telegram: { ...this.settings.notifications.telegram, ...(partial.notifications.telegram || {}) },
        triggers: { ...this.settings.notifications.triggers, ...(partial.notifications.triggers || {}) }
      };
    }
    if (partial.snmp) {
      this.settings.snmp = { ...this.settings.snmp, ...partial.snmp };
    }
    if (partial.collectors) {
      this.settings.collectors = { ...this.settings.collectors, ...partial.collectors };
    }
    if (partial.speedtest) {
      this.settings.speedtest = { ...this.settings.speedtest, ...partial.speedtest };
    }
    if (partial.thresholds) {
      this.settings.thresholds = { ...this.settings.thresholds, ...partial.thresholds };
    }

    // Persist to disk
    persistence.saveJSON('settings.json', this.settings);
    return this.getSettings();
  }
}

export const settingsStore = new SettingsStore();
