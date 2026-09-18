import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface TrafficFlow {
  id: string;
  timestamp: string;
  firewallId: string;
  vendor: 'checkpoint' | 'paloalto' | 'fortinet' | 'pfsense';
  sourceIp: string;
  destIp: string;
  sourcePort: number;
  destPort: number;
  protocol: string;
  application: string;
  userIdentity?: string;
  ruleName: string;
  action: 'allow' | 'deny' | 'drop' | 'reject';
  bytesIn: number;
  bytesOut: number;
  packetsIn: number;
  packetsOut: number;
  threatCategory?: string;
  threatSeverity?: 'none' | 'low' | 'medium' | 'high' | 'critical';
  countryDest?: string;
}

export interface SyslogEntry {
  id: string;
  timestamp: string;
  firewallId: string;
  vendor: 'checkpoint' | 'paloalto' | 'fortinet' | 'pfsense';
  facility: number;
  severity: string;
  raw: string;
  parsed: {
    action: string;
    sourceIp?: string;
    destIp?: string;
    sourcePort?: number;
    destPort?: number;
    protocol?: string;
    ruleName?: string;
    user?: string;
  };
}

export interface AlertItem {
  id: string;
  timestamp: string;
  firewallId?: string;
  firewallName?: string;
  severity: 'info' | 'warning' | 'high' | 'critical';
  title: string;
  description?: string;
  detail?: string;
  category?: string;
  sourceIp?: string;
  acknowledged: boolean;
}

export interface SpeedTestState {
  id: string;
  timestamp: string;
  pingMs: number;
  jitterMs: number;
  downloadMbps: number;
  uploadMbps: number;
  serverLocation: string;
  isp: string;
  testStatus: string;
  nextTestInSec: number;
}

export interface TopVisitedSite {
  rank: number;
  domain: string;
  category: string;
  requests: number;
  bytes: number;
  action: 'allow' | 'monitored' | 'throttled' | 'blocked';
  policyApplied: string;
}

export interface SecurityThreatItem {
  id: string;
  signature: string;
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  sourceIp: string;
  country: string;
  targetPort: number;
  service: string;
  hits: number;
  action: 'dropped' | 'quarantined';
  lastSeen: string;
}

export interface TopIpUsageItem {
  ip: string;
  hostname: string;
  zone: string;
  bytesIn: number;
  bytesOut: number;
  totalBytes: number;
  flowsCount: number;
  primaryService: string;
}

export interface WebFilterCategoryItem {
  category: string;
  percentage: number;
  requestCount: number;
  bytes: number;
  policyNote: string;
}

export interface PolicyFlowItem {
  policyId: number;
  policyName: string;
  fromInterface: string;
  toInterface: string;
  action: 'allow' | 'drop';
  currentThroughputMbps: number;
  activeSessions: number;
  blockedCount?: number;
}

export interface IpAppIdMapping {
  ip: string;
  systemName: string;
  department: string;
  zone: string;
  primaryAppId: string;
  secondaryApps: string[];
  uploadBytes: number;
  downloadBytes: number;
  totalBytes: number;
  activeSessions: number;
  status: 'active' | 'idle' | 'throttled';
  lastSeen: string;
}

export interface AppIdUsageItem {
  appId: string;
  displayName: string;
  category: string;
  protocol: string;
  uploadBytes: number;
  downloadBytes: number;
  totalBytes: number;
  sessionCount: number;
  percentage: number;
  riskLevel: 'Critical Infrastructure' | 'Productive Research' | 'Collaboration' | 'General Internet' | 'High Risk';
}

export interface HeavyDataIpItem {
  rank: number;
  ip: string;
  systemName: string;
  zone: string;
  uploadBytes: number;
  downloadBytes: number;
  totalBytes: number;
  percentOfTotal: number;
  primaryAppId: string;
  flowsCount: number;
}

export interface TopUploadItem {
  rank: number;
  sourceIp: string;
  sourceHost: string;
  sourceDept: string;
  sourceZone?: string;
  destIp: string;
  destHost: string;
  destCountry?: string;
  destPort?: number;
  appId: string;
  protocol?: string;
  uploadBytes: number;
  uploadRateMbps: number;
  sessionsCount?: number;
  // Legacy compatibility
  ip: string;
  systemName: string;
  department: string;
  destEndpoint: string;
}

export interface TopDownloadItem {
  rank: number;
  sourceIp: string;
  sourceHost: string;
  sourceCountry?: string;
  sourcePort?: number;
  destIp: string;
  destHost: string;
  destDept: string;
  destZone?: string;
  appId: string;
  protocol?: string;
  downloadBytes: number;
  downloadRateMbps: number;
  sessionsCount?: number;
  // Legacy compatibility
  ip: string;
  systemName: string;
  department: string;
  sourceEndpoint: string;
}

export interface BentoTrafficAnalytics {
  isLive: boolean;
  activeGateway: string;
  timestamp: string;
  totals: {
    totalUploadBytes: number;
    totalDownloadBytes: number;
    totalBytes: number;
    uploadRatioPercent: number;
    downloadRatioPercent: number;
    activeAppIdsCount: number;
    monitoredHostsCount: number;
    peakUploadMbps: number;
    peakDownloadMbps: number;
  };
  ipAppIdMappings: IpAppIdMapping[];
  topApplications: AppIdUsageItem[];
  heavyDataIps: HeavyDataIpItem[];
  topUploaders: TopUploadItem[];
  topDownloaders: TopDownloadItem[];
}

export type UnapprovedCategory =
  | 'bittorrent'
  | 'download_manager'
  | 'movies'
  | 'unofficial_media'
  | 'botnet_spam'
  | 'crypto_mining'
  | 'illegal_website';

export interface UnapprovedViolationRecord {
  id: string;
  timestamp: string;
  category: UnapprovedCategory;
  categoryLabel: string;
  appId: string;
  protocol: string;
  // Offending Internal Device
  internalIp: string;
  internalHost: string;
  department: string;
  vlan: string;
  macAddress?: string;
  switchPort?: string;
  // Remote Target
  remoteIp: string;
  remoteHost: string;
  remoteCountry: string;
  remotePort: number;
  // Traffic Details
  direction: 'outbound' | 'inbound';
  action: 'blocked' | 'dropped' | 'flagged';
  policyName: string;
  bytesIn: number;
  bytesOut: number;
  totalBytes: number;
  packets: number;
  severity: 'warning' | 'critical';
  details: string;
}

export interface OffendingDeviceSummary {
  rank: number;
  ip: string;
  hostname: string;
  department: string;
  vlan: string;
  violationsCount: number;
  totalBytesWasted: number;
  primaryCategory: string;
  detectedApps: string[];
  lastSeen: string;
  blockedRatePercent: number;
}

export interface UnapprovedTrafficAnalytics {
  isLive: boolean;
  activeGateway: string;
  timestamp: string;
  totals: {
    totalViolations: number;
    totalBytesWasted: number;
    blockedCount: number;
    flaggedCount: number;
    dropRatePercent: number;
    uniqueOffendingDevices: number;
  };
  categoryBreakdown: {
    category: UnapprovedCategory;
    label: string;
    icon: string;
    violationsCount: number;
    bytesWasted: number;
    percentOfViolations: number;
  }[];
  topOffendingDevices: OffendingDeviceSummary[];
  recentViolations: UnapprovedViolationRecord[];
}

export const useTelemetryStore = defineStore('telemetry', () => {
  const isConnected = ref<boolean>(false);
  const flows = ref<TrafficFlow[]>([]);
  const logs = ref<SyslogEntry[]>([]);
  const alerts = ref<AlertItem[]>([]);
  const throughputHistory = ref<{ time: string; inBps: number; outBps: number }[]>([]);
  const isTestingSpeed = ref<boolean>(false);

  const speedtest = ref<SpeedTestState>({
    id: 'st-default',
    timestamp: new Date().toISOString(),
    pingMs: 4.2,
    jitterMs: 0.8,
    downloadMbps: 942.5,
    uploadMbps: 884.1,
    serverLocation: 'New Delhi - NIXI Gateway (NIC / MeitY)',
    isp: 'National Knowledge Network (NKN) / BSNL Enterprise Fiber',
    testStatus: 'completed',
    nextTestInSec: 900,
  });

  const speedtestHistory = ref<SpeedTestState[]>([]);

  const summary = ref({
    totalFlows: 0,
    totalBytesIn: 0,
    totalBytesOut: 0,
    allowedCount: 0,
    droppedCount: 0,
    blockRatePercent: '0',
    vendorDistribution: {} as Record<string, number>,
    threatDistribution: {} as Record<string, number>,
  });

  const topTalkers = ref<{
    topSources: any[];
    topDestinations: any[];
    topApplications: any[];
    topPorts: any[];
  }>({
    topSources: [],
    topDestinations: [],
    topApplications: [],
    topPorts: []
  });

  const topSites = ref<TopVisitedSite[]>([]);
  const topThreats = ref<SecurityThreatItem[]>([]);
  const topIpUsage = ref<TopIpUsageItem[]>([]);
  const webCategories = ref<WebFilterCategoryItem[]>([]);
  const policyFlows = ref<PolicyFlowItem[]>([]);
  const bentoAnalytics = ref<BentoTrafficAnalytics | null>(null);

  let ws: WebSocket | null = null;
  let reconnectTimer: any = null;
  let countdownTimer: any = null;

  async function fetchSummary() {
    try {
      const [sumRes, topRes, flowRes, logRes, altRes, speedRes] = await Promise.all([
        fetch('/api/telemetry/summary'),
        fetch('/api/telemetry/top-talkers?limit=10'),
        fetch('/api/telemetry/flows?limit=100'),
        fetch('/api/telemetry/logs?limit=100'),
        fetch('/api/alerts'),
        fetch('/api/speedtest')
      ]);

      const sumData = await sumRes.json();
      const topData = await topRes.json();
      const flowData = await flowRes.json();
      const logData = await logRes.json();
      const altData = await altRes.json();
      const speedData = await speedRes.json();

      if (sumData.success) summary.value = sumData.summary;
      if (topData.success) topTalkers.value = topData.topTalkers;
      if (flowData.success) flows.value = flowData.flows;
      if (logData.success) logs.value = logData.logs;
      if (altData.success) alerts.value = altData.alerts;
      if (speedData.success && speedData.speedtest) speedtest.value = speedData.speedtest;
      await fetchAnalytics();
      await fetchBentoAnalytics();
      await fetchUnapprovedAnalytics();
    } catch (e) {
      console.error('Failed to fetch initial telemetry', e);
    }
  }

  async function fetchAnalytics() {
    try {
      const res = await fetch('/api/telemetry/analytics');
      const data = await res.json();
      if (data.success) {
        if (data.topSites) topSites.value = data.topSites;
        if (data.topThreats) topThreats.value = data.topThreats;
        if (data.topIpUsage) topIpUsage.value = data.topIpUsage;
        if (data.webCategories) webCategories.value = data.webCategories;
        if (data.policyFlows) policyFlows.value = data.policyFlows;
        if (data.bentoAnalytics) bentoAnalytics.value = data.bentoAnalytics;
      }
    } catch (e) {
      console.error('Failed to fetch analytics', e);
    }
  }

  async function fetchBentoAnalytics() {
    try {
      const res = await fetch('/api/telemetry/bento-analytics');
      const data = await res.json();
      if (data.success) {
        bentoAnalytics.value = data;
      }
    } catch (e) {
      console.error('Failed to fetch bento analytics', e);
    }
  }

  async function fetchSpeedTest() {
    try {
      const res = await fetch('/api/speedtest');
      const data = await res.json();
      if (data.success && data.speedtest) {
        speedtest.value = data.speedtest;
      }
    } catch (e) {
      console.error('Failed to fetch speed test', e);
    }
  }

  async function runSpeedTestNow() {
    isTestingSpeed.value = true;
    try {
      const res = await fetch('/api/speedtest/run', { method: 'POST' });
      const data = await res.json();
      if (data.success && data.speedtest) {
        speedtest.value = data.speedtest;
      }
    } catch (e) {
      console.error('Failed to run speed test', e);
    } finally {
      setTimeout(() => {
        isTestingSpeed.value = false;
      }, 800);
    }
  }

  function startCountdownTicker() {
    if (countdownTimer) clearInterval(countdownTimer);
    countdownTimer = setInterval(() => {
      if (speedtest.value.nextTestInSec > 0) {
        speedtest.value.nextTestInSec--;
      } else {
        // Trigger auto refresh
        fetchSpeedTest();
      }
    }, 1000);
  }

  function initWebSocket() {
    if (ws) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // In dev (port 5173), target port 3001; in production (macvlan port 80), target same host
    const wsUrl = window.location.port === '5173'
      ? `${protocol}//${window.location.hostname}:3001/ws`
      : `${protocol}//${window.location.host}/ws`;

    try {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        isConnected.value = true;
        console.log('[TelemetryStore] WebSocket connected');
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'log') {
            logs.value.unshift(payload.data);
            if (logs.value.length > 300) logs.value.pop();
          } else if (payload.type === 'flow') {
            flows.value.unshift(payload.data);
            if (flows.value.length > 300) flows.value.pop();

            const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            throughputHistory.value.push({
              time: nowStr,
              inBps: payload.data.bytesIn * 8,
              outBps: payload.data.bytesOut * 8,
            });
            if (throughputHistory.value.length > 25) {
              throughputHistory.value.shift();
            }
          } else if (payload.type === 'alert') {
            alerts.value.unshift(payload.data);
          }
        } catch (err) {
          console.warn('WS message parse error', err);
        }
      };

      ws.onclose = () => {
        isConnected.value = false;
        ws = null;
        clearTimeout(reconnectTimer);
        reconnectTimer = setTimeout(() => {
          initWebSocket();
        }, 3000);
      };

      ws.onerror = () => {
        ws?.close();
      };
    } catch (err) {
      console.error('WS init error', err);
    }
  }

  const storageStats = ref<any>(null);
  const isAlertCenterOpen = ref<boolean>(false);
  const isStorageModalOpen = ref<boolean>(false);

  async function fetchAlerts() {
    try {
      const res = await fetch('/api/alerts');
      const data = await res.json();
      if (data.success && data.alerts) {
        alerts.value = data.alerts;
      }
    } catch (e) {
      console.error('Failed to fetch alerts', e);
    }
  }

  async function acknowledgeAlert(alertId: string) {
    try {
      await fetch(`/api/alerts/${alertId}/acknowledge`, { method: 'POST' });
      const target = alerts.value.find(a => a.id === alertId);
      if (target) target.acknowledged = true;
    } catch (e) {
      console.error('Failed to ack alert', e);
    }
  }

  async function clearAcknowledgedAlerts() {
    try {
      await fetch('/api/alerts/clear', { method: 'POST' });
      alerts.value = alerts.value.filter(a => !a.acknowledged);
    } catch (e) {
      console.error('Failed to clear alerts', e);
    }
  }

  async function fetchStorageInfo() {
    try {
      const res = await fetch('/api/system/storage');
      const data = await res.json();
      if (data.success) {
        storageStats.value = data.storage;
      }
      return data.storage;
    } catch (e) {
      console.error('Failed to fetch storage info', e);
      return null;
    }
  }

  const unapprovedAnalytics = ref<UnapprovedTrafficAnalytics | null>(null);
  const unapprovedViolations = ref<UnapprovedViolationRecord[]>([]);
  const isUnapprovedLoading = ref<boolean>(false);

  async function fetchUnapprovedAnalytics() {
    try {
      isUnapprovedLoading.value = true;
      const res = await fetch('/api/traffic/unapproved/query?limit=100');
      const data = await res.json();
      if (data.success) {
        unapprovedAnalytics.value = {
          isLive: true,
          activeGateway: 'FortiGate-600E-Edge',
          timestamp: new Date().toISOString(),
          totals: data.totals,
          categoryBreakdown: data.categoryBreakdown,
          topOffendingDevices: data.topOffendingDevices,
          recentViolations: data.violations || []
        };
        unapprovedViolations.value = data.violations || [];
      }
    } catch (e) {
      console.error('Failed to fetch unapproved analytics', e);
    } finally {
      isUnapprovedLoading.value = false;
    }
  }

  async function queryUnapprovedViolations(params: { category?: string; search?: string; action?: string; limit?: number; offset?: number }) {
    try {
      isUnapprovedLoading.value = true;
      const q = new URLSearchParams();
      if (params.category) q.set('category', params.category);
      if (params.search) q.set('search', params.search);
      if (params.action) q.set('action', params.action);
      if (params.limit) q.set('limit', String(params.limit));
      if (params.offset) q.set('offset', String(params.offset));

      const res = await fetch(`/api/traffic/unapproved/query?${q.toString()}`);
      const data = await res.json();
      if (data.success) {
        if (data.totals && unapprovedAnalytics.value) {
          unapprovedAnalytics.value.totals = data.totals;
          unapprovedAnalytics.value.categoryBreakdown = data.categoryBreakdown;
          unapprovedAnalytics.value.topOffendingDevices = data.topOffendingDevices;
        }
        unapprovedViolations.value = data.violations || [];
        return data;
      }
    } catch (e) {
      console.error('Failed to query unapproved violations', e);
    } finally {
      isUnapprovedLoading.value = false;
    }
    return null;
  }

  async function fetchDeviceDossier(ip: string) {
    try {
      const res = await fetch(`/api/traffic/unapproved/device/${encodeURIComponent(ip)}`);
      const data = await res.json();
      if (data.success) {
        return data.dossier;
      }
    } catch (e) {
      console.error('Failed to fetch device dossier', e);
    }
    return null;
  }

  const activeAlertsCount = computed(() => alerts.value.filter(a => !a.acknowledged).length);

  function openStorageModal() {
    isStorageModalOpen.value = true;
  }

  function closeStorageModal() {
    isStorageModalOpen.value = false;
  }

  return {
    isConnected,
    flows,
    logs,
    alerts,
    throughputHistory,
    summary,
    topTalkers,
    topSites,
    topThreats,
    topIpUsage,
    webCategories,
    policyFlows,
    bentoAnalytics,
    speedtest,
    speedtestHistory,
    isTestingSpeed,
    activeAlertsCount,
    storageStats,
    isAlertCenterOpen,
    isStorageModalOpen,
    openStorageModal,
    closeStorageModal,
    fetchSummary,
    fetchAnalytics,
    fetchBentoAnalytics,
    fetchSpeedTest,
    runSpeedTestNow,
    startCountdownTicker,
    initWebSocket,
    fetchAlerts,
    acknowledgeAlert,
    clearAcknowledgedAlerts,
    fetchStorageInfo,
    unapprovedAnalytics,
    unapprovedViolations,
    isUnapprovedLoading,
    fetchUnapprovedAnalytics,
    queryUnapprovedViolations,
    fetchDeviceDossier,
  };
});
