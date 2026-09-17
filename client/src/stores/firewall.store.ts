import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface InterfaceMetric {
  name: string;
  operStatus: 'up' | 'down';
  adminStatus: 'up' | 'down';
  inBps: number;
  outBps: number;
  inErrors: number;
  outErrors: number;
  speedBps: number;
}

export interface SNMPProbeData {
  sysUpTime: number;
  cpuUtilPercent: number;
  memoryTotalBytes: number;
  memoryUsedBytes: number;
  memoryUtilPercent: number;
  concurrentConnections: number;
  haState: 'active' | 'standby' | 'standalone';
  vpnActiveTunnels: number;
  interfaces: InterfaceMetric[];
  lastPolled: string;
}

export interface FirewallDevice {
  id: string;
  name: string;
  vendor: 'checkpoint' | 'paloalto' | 'fortinet' | 'pfsense';
  model: string;
  ipAddress: string;
  version: string;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  location: string;
  snmpEnabled: boolean;
  snmpCommunity: string;
  snmpVersion: 'v2c' | 'v3';
  snmpPort?: number;
  checkPointBlades?: {
    firewall: boolean;
    ips: boolean;
    antiBot: boolean;
    threatEmulation: boolean;
    vpn: boolean;
    applicationControl: boolean;
    urlFiltering: boolean;
  };
  snmpMetrics?: SNMPProbeData;
  lastSeen: string;
}

export interface CanonicalRule {
  id: string;
  firewallId: string;
  nativeRuleId: string;
  name: string;
  position: number;
  action: 'allow' | 'deny' | 'drop' | 'reject';
  enabled: boolean;
  logging: boolean;
  sourceZones: string[];
  destZones: string[];
  sourceCidrs: string[];
  destCidrs: string[];
  protocols: string[];
  destPorts: string[];
  applications: string[];
  users: string[];
  hitCount: number;
  lastHitAt?: string;
  unusedDays: number;
  isShadowed: boolean;
  shadowedByRuleId?: string;
  shadowedByRuleName?: string;
  isRedundant: boolean;
  redundantWithRuleId?: string;
  isAnyAny: boolean;
  riskScore: number;
  complianceTags: string[];
}

export interface PolicyAnalysisReport {
  firewallId: string;
  totalRules: number;
  shadowedRulesCount: number;
  redundantRulesCount: number;
  anyAnyRulesCount: number;
  averageRiskScore: number;
  findings: {
    id: string;
    ruleId: string;
    ruleName: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    type: string;
    message: string;
    remediation: string;
  }[];
}

export interface ConfigDiffResult {
  firewallId: string;
  previousVersion: string;
  currentVersion: string;
  timestamp: string;
  changes: {
    type: 'add' | 'remove' | 'modify';
    line: number;
    content: string;
  }[];
  riskRating: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
}

export interface ComplianceItem {
  id: string;
  framework: 'CERT-In' | 'PCI-DSS' | 'CIS' | 'ISO-27001';
  controlCode: string;
  title: string;
  description: string;
  status: 'pass' | 'fail' | 'warning';
  scoreImpact: number;
  evidence: string;
  remediation: string;
  affectedRules: string[];
}

export const useFirewallStore = defineStore('firewall', () => {
  const devices = ref<FirewallDevice[]>([]);
  const selectedFirewallId = ref<string>('fw-fg-01');
  const rules = ref<CanonicalRule[]>([]);
  const policyReport = ref<PolicyAnalysisReport | null>(null);
  const configSnapshots = ref<any[]>([]);
  const configDiff = ref<ConfigDiffResult | null>(null);
  const complianceControls = ref<ComplianceItem[]>([]);
  const complianceScore = ref<number>(85);
  const loading = ref<boolean>(false);

  async function fetchDevices() {
    try {
      const res = await fetch('/api/devices');
      const data = await res.json();
      if (data.success) {
        devices.value = data.devices;
      }
    } catch (e) {
      console.error('Failed to fetch devices', e);
    }
  }

  async function fetchRules(fwId: string) {
    loading.value = true;
    try {
      const [rulesRes, analysisRes] = await Promise.all([
        fetch(`/api/rules/${fwId}`),
        fetch(`/api/policy/analysis/${fwId}`)
      ]);
      const rulesData = await rulesRes.json();
      const analysisData = await analysisRes.json();
      if (rulesData.success) rules.value = rulesData.rules;
      if (analysisData.success) policyReport.value = analysisData.report;
    } catch (e) {
      console.error('Failed to fetch rules', e);
    } finally {
      loading.value = false;
    }
  }

  async function fetchConfig(fwId: string) {
    try {
      const [snapRes, diffRes] = await Promise.all([
        fetch(`/api/config/snapshots/${fwId}`),
        fetch(`/api/config/diff/${fwId}`)
      ]);
      const snapData = await snapRes.json();
      const diffData = await diffRes.json();
      if (snapData.success) configSnapshots.value = snapData.snapshots;
      if (diffData.success) configDiff.value = diffData.diff;
    } catch (e) {
      console.error('Failed to fetch config data', e);
    }
  }

  const settings = ref<any>(null);
  const isTestingSnmp = ref(false);
  const snmpTestResult = ref<any>(null);

  const defaultBranding = {
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
    logoUrl: '',
    logoBase64: '',
    logoType: 'preset' as 'preset' | 'custom',
    presetLogo: 'shield' as 'emblem' | 'shield' | 'cyber' | 'globe',
    isSetupComplete: true
  };

  const branding = computed(() => {
    return settings.value?.branding ? { ...defaultBranding, ...settings.value.branding } : defaultBranding;
  });

  const activeFirewall = computed<FirewallDevice | null>(() => {
    // 1. First look for a device with healthy status and live SNMP interface telemetry
    const live = devices.value.find(d => d.status === 'healthy' && d.snmpMetrics && d.snmpMetrics.interfaces && d.snmpMetrics.interfaces.length > 0);
    if (live) return live;

    // 2. Otherwise look for the selected firewall
    const selected = devices.value.find(d => d.id === selectedFirewallId.value);
    if (selected) return selected;

    // 3. Otherwise first device or null
    return devices.value[0] || null;
  });

  const isFirewallLive = computed(() => {
    return !!activeFirewall.value && activeFirewall.value.status === 'healthy';
  });

  async function fetchCompliance() {
    try {
      const res = await fetch('/api/compliance');
      const data = await res.json();
      if (data.success) {
        complianceControls.value = data.controls;
        complianceScore.value = data.scorePercent;
      }
    } catch (e) {
      console.error('Failed to fetch compliance', e);
    }
  }

  async function fetchSettings() {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success) {
        settings.value = data.settings;
        if (data.firewalls) devices.value = data.firewalls;
      }
    } catch (e) {
      console.error('Failed to fetch settings', e);
    }
  }

  async function saveSettings(payload: any): Promise<boolean> {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        settings.value = data.settings;
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to save settings', e);
      return false;
    }
  }

  async function testSMTP(payload: any): Promise<any> {
    try {
      const res = await fetch('/api/settings/notifications/test-smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  }

  async function testTelegram(payload: any): Promise<any> {
    try {
      const res = await fetch('/api/settings/notifications/test-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  }

  async function sendSampleAlert(payload: any): Promise<any> {
    try {
      const res = await fetch('/api/settings/notifications/send-sample-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  }

  async function testSnmp(probe: any): Promise<any> {
    isTestingSnmp.value = true;
    snmpTestResult.value = null;
    try {
      const res = await fetch('/api/settings/snmp/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(probe)
      });
      const data = await res.json();
      snmpTestResult.value = data;
      return data;
    } catch (e: any) {
      const errRes = { success: false, ipAddress: probe.ipAddress, error: e.message };
      snmpTestResult.value = errRes;
      return errRes;
    } finally {
      isTestingSnmp.value = false;
    }
  }

  async function pollSnmpNow(): Promise<boolean> {
    try {
      const res = await fetch('/api/settings/snmp/poll-now', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await fetchDevices();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to trigger SNMP poll', e);
      return false;
    }
  }

  async function updateFirewall(id: string, updates: any): Promise<boolean> {
    try {
      const res = await fetch(`/api/settings/firewalls/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (data.success) {
        await fetchDevices();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to update firewall profile', e);
      return false;
    }
  }

  async function addFirewall(dev: any): Promise<boolean> {
    try {
      const res = await fetch('/api/settings/firewalls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dev)
      });
      const data = await res.json();
      if (data.success) {
        await fetchDevices();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to add firewall profile', e);
      return false;
    }
  }

  async function deleteFirewall(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/settings/firewalls/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        await fetchDevices();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to delete firewall profile', e);
      return false;
    }
  }

  async function uploadLogo(payload: { logoBase64?: string; logoUrl?: string; logoType?: 'preset' | 'custom'; presetLogo?: string }): Promise<boolean> {
    try {
      const res = await fetch('/api/settings/logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        if (!settings.value) settings.value = {};
        settings.value.branding = data.branding;
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to save logo', e);
      return false;
    }
  }

  async function completeWizard(payload: any): Promise<boolean> {
    try {
      const res = await fetch('/api/settings/wizard/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        settings.value = data.settings;
        await fetchDevices();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to complete onboarding wizard', e);
      return false;
    }
  }

  async function fetchSystemVersion(): Promise<any> {
    try {
      const res = await fetch('/api/system/version');
      return await res.json();
    } catch (e) {
      return { success: false };
    }
  }

  async function checkOTAUpdates(): Promise<any> {
    try {
      const res = await fetch('/api/system/updates/check');
      return await res.json();
    } catch (e) {
      return { success: false };
    }
  }

  async function restoreBackup(backupData: any): Promise<boolean> {
    try {
      const res = await fetch('/api/system/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backupData)
      });
      const data = await res.json();
      if (data.success) {
        await Promise.all([fetchSettings(), fetchDevices()]);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to restore backup', e);
      return false;
    }
  }

  const backups = ref<any[]>([]);
  const backupConfig = ref<any>(null);
  const isCreatingBackup = ref(false);
  const isRestoringBackup = ref(false);

  async function fetchBackups(): Promise<void> {
    try {
      const res = await fetch('/api/system/backups');
      const data = await res.json();
      if (data.success) {
        backups.value = data.backups || [];
        backupConfig.value = data.config || null;
      }
    } catch (e) {
      console.error('Failed to fetch backups', e);
    }
  }

  async function createInstantBackup(trigger: string = 'manual'): Promise<any> {
    isCreatingBackup.value = true;
    try {
      const res = await fetch('/api/system/backups/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trigger })
      });
      const data = await res.json();
      if (data.success) {
        await fetchBackups();
      }
      return data;
    } catch (e: any) {
      return { success: false, error: e.message };
    } finally {
      isCreatingBackup.value = false;
    }
  }

  async function restoreBackupArchive(filename: string): Promise<boolean> {
    isRestoringBackup.value = true;
    try {
      const res = await fetch(`/api/system/backups/${encodeURIComponent(filename)}/restore`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        await Promise.all([fetchSettings(), fetchDevices(), fetchBackups()]);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to restore backup archive', e);
      return false;
    } finally {
      isRestoringBackup.value = false;
    }
  }

  async function deleteBackupArchive(filename: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/system/backups/${encodeURIComponent(filename)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        await fetchBackups();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  async function updateBackupConfig(payload: any): Promise<boolean> {
    try {
      const res = await fetch('/api/system/backups/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        backupConfig.value = data.config;
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  return {
    devices,
    selectedFirewallId,
    activeFirewall,
    isFirewallLive,
    rules,
    policyReport,
    configSnapshots,
    configDiff,
    complianceControls,
    complianceScore,
    loading,
    settings,
    branding,
    isTestingSnmp,
    snmpTestResult,
    backups,
    backupConfig,
    isCreatingBackup,
    isRestoringBackup,
    fetchDevices,
    fetchRules,
    fetchConfig,
    fetchCompliance,
    fetchSettings,
    saveSettings,
    testSnmp,
    testSMTP,
    testTelegram,
    sendSampleAlert,
    pollSnmpNow,
    updateFirewall,
    addFirewall,
    deleteFirewall,
    uploadLogo,
    completeWizard,
    fetchSystemVersion,
    checkOTAUpdates,
    restoreBackup,
    fetchBackups,
    createInstantBackup,
    restoreBackupArchive,
    deleteBackupArchive,
    updateBackupConfig,
  };
});
