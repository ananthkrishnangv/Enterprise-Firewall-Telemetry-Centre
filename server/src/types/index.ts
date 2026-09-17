export type FirewallVendor = 'checkpoint' | 'paloalto' | 'fortinet' | 'cisco' | 'pfsense';

export type RuleAction = 'allow' | 'deny' | 'drop' | 'reject';

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

export interface CheckPointBlades {
  firewall: boolean;
  ips: boolean;
  antiBot: boolean;
  threatEmulation: boolean;
  vpn: boolean;
  applicationControl: boolean;
  urlFiltering: boolean;
}

export interface FirewallDevice {
  id: string;
  name: string;
  vendor: FirewallVendor;
  model: string;
  ipAddress: string;
  version: string;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  location: string;
  snmpEnabled: boolean;
  snmpCommunity: string;
  snmpVersion: 'v2c' | 'v3';
  snmpPort?: number;
  snmpTimeout?: number;
  snmpRetries?: number;
  snmpV3SecurityName?: string;
  snmpV3AuthProtocol?: 'MD5' | 'SHA' | 'SHA256' | 'none';
  snmpV3AuthKey?: string;
  snmpV3PrivProtocol?: 'DES' | 'AES' | 'AES256' | 'none';
  snmpV3PrivKey?: string;
  checkPointBlades?: CheckPointBlades;
  snmpMetrics?: SNMPProbeData;
  lastSeen: string;
}

export interface TrafficFlow {
  id: string;
  timestamp: string;
  firewallId: string;
  vendor: FirewallVendor;
  sourceIp: string;
  destIp: string;
  sourcePort: number;
  destPort: number;
  protocol: 'TCP' | 'UDP' | 'ICMP' | 'OTHER';
  application: string;
  userIdentity?: string;
  ruleName: string;
  action: RuleAction;
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
  vendor: FirewallVendor;
  facility: number;
  severity: 'emergency' | 'alert' | 'critical' | 'error' | 'warning' | 'notice' | 'info' | 'debug';
  raw: string;
  parsed: {
    action: RuleAction;
    sourceIp?: string;
    destIp?: string;
    sourcePort?: number;
    destPort?: number;
    protocol?: string;
    ruleName?: string;
    service?: string;
    user?: string;
    message?: string;
  };
}

export interface CanonicalRule {
  id: string;
  firewallId: string;
  nativeRuleId: string;
  name: string;
  position: number;
  action: RuleAction;
  enabled: boolean;
  logging: boolean;
  sourceZones: string[];
  destZones: string[];
  sourceCidrs: string[];
  destCidrs: string[];
  protocols: string[];
  destPorts: string[]; // e.g. ["80", "443", "1024-65535"]
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
  riskScore: number; // 0-100
  complianceTags: string[];
}

export interface ConfigSnapshot {
  id: string;
  firewallId: string;
  version: string;
  timestamp: string;
  author: string;
  rawConfig: string;
  hash: string;
  changeType: 'manual' | 'scheduled' | 'drift_detected';
  ticketId?: string;
}

export interface ConfigDiffChange {
  type: 'add' | 'remove' | 'modify';
  line: number;
  content: string;
}

export interface ConfigDiffResult {
  firewallId: string;
  previousVersion: string;
  currentVersion: string;
  timestamp: string;
  changes: ConfigDiffChange[];
  riskRating: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
}

export interface AlertNotification {
  id: string;
  timestamp: string;
  firewallId: string;
  firewallName: string;
  severity: 'info' | 'warning' | 'high' | 'critical';
  title: string;
  description: string;
  category: 'traffic_anomaly' | 'device_down' | 'snmp_threshold' | 'config_drift' | 'policy_violation' | 'security_threat';
  acknowledged: boolean;
}

export interface ComplianceAuditItem {
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

export type UserRole = 'super_admin' | 'admin' | 'auditor' | 'operator';

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  badgeNumber: string;
  telegramChatId?: string;
  telegramEnabled?: boolean;
  status?: 'active' | 'disabled';
  createdAt?: string;
  lastLogin?: string;
  isProtected?: boolean;
}

export interface CreateUserRequest {
  username: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  department?: string;
  badgeNumber?: string;
  telegramChatId?: string;
  telegramEnabled?: boolean;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  department?: string;
  badgeNumber?: string;
  telegramChatId?: string;
  telegramEnabled?: boolean;
  status?: 'active' | 'disabled';
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
}

export interface SNMPTestRequest {
  ipAddress: string;
  version: 'v2c' | 'v3';
  community?: string;
  port?: number;
  timeout?: number;
  retries?: number;
  securityName?: string;
  authProtocol?: 'MD5' | 'SHA' | 'SHA256' | 'none';
  authKey?: string;
  privProtocol?: 'DES' | 'AES' | 'AES256' | 'none';
  privKey?: string;
}

export interface SNMPTestResult {
  success: boolean;
  ipAddress: string;
  latencyMs: number;
  sysDescr?: string;
  sysName?: string;
  sysLocation?: string;
  sysUpTime?: string;
  rawUpTimeTicks?: number;
  vendorIdentified?: string;
  cpuPercent?: number;
  memoryPercent?: number;
  sessionsCount?: number;
  osVersion?: string;
  interfacesFound?: number;
  error?: string;
  details?: Record<string, any>;
}

export interface PortalBrandingSettings {
  portalTitle: string;
  portalSubtitle: string;
  orgName: string;
  orgDivision: string;
  apexBody: string;
  loginTitle: string;
  loginSubtitle: string;
  footerNotice: string;
  ntpBadgeText: string;
  threatAdvisoryLevel: string;
  threatAdvisoryDetail: string;
  logoUrl?: string;
  logoBase64?: string;
  logoType?: 'preset' | 'custom';
  presetLogo?: 'emblem' | 'shield' | 'cyber' | 'globe';
  isSetupComplete: boolean;
}

export interface ApplianceVersionInfo {
  version: string;
  releaseName: string;
  buildDate: string;
  nodeVersion: string;
  uptimeSeconds: number;
  dataDirectory: string;
  isSetupComplete: boolean;
  activeFirewallsCount: number;
}

export interface UpdateCheckResponse {
  currentVersion: string;
  latestVersion: string;
  hasUpdate: boolean;
  releaseNotes?: string;
  releaseDate?: string;
  downloadUrl?: string;
}

export interface WizardSetupPayload {
  branding: Partial<PortalBrandingSettings>;
  firewall: {
    vendor: FirewallVendor;
    name: string;
    ipAddress: string;
    snmpVersion: 'v2c' | 'v3';
    snmpCommunity: string;
    snmpPort?: number;
    location?: string;
  };
  adminPassword?: string;
  telegram?: {
    enabled: boolean;
    botToken?: string;
    chatId?: string;
  };
}

export interface NotificationSettings {
  smtp: {
    enabled: boolean;
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password?: string;
    fromEmail: string;
    toEmails: string;
  };
  telegram: {
    enabled: boolean;
    botToken: string;
    chatId: string;
  };
  triggers: {
    seriousAttackEnabled: boolean;
    ddosEnabled: boolean;
    ddosThresholdMbps: number;
    firewallDownEnabled: boolean;
    bandwidthLowEnabled: boolean;
    bandwidthLowThresholdMbps: number;
    cpuThresholdPercent: number;
    memoryThresholdPercent: number;
  };
}

export interface SystemSettings {
  branding: PortalBrandingSettings;
  notifications: NotificationSettings;
  snmp: {
    defaultPollIntervalSec: number;
    defaultPort: number;
    defaultTimeoutMs: number;
    defaultRetries: number;
    liveSnmpEnabled: boolean;
  };
  collectors: {
    syslogPort: number;
    syslogAltPort: number;
    netflowPort: number;
    bufferQueueSize: number;
    certInRetentionDays: number;
  };
  speedtest: {
    intervalMinutes: number;
    autoSchedule: boolean;
    primaryServer: string;
  };
  thresholds: {
    cpuWarningPercent: number;
    cpuCriticalPercent: number;
    memWarningPercent: number;
    memCriticalPercent: number;
    concurrentConnAlert: number;
  };
}

export interface TopVisitedSite {
  rank: number;
  domain: string;
  category: 'Research & Science' | 'Cloud & Compute' | 'Software & Development' | 'Collaboration & Office' | 'Social Networking' | 'Streaming Media';
  requests: number;
  bytes: number;
  action: 'allow' | 'monitored' | 'throttled' | 'blocked';
  policyApplied: string;
}

export interface SecurityThreatItem {
  id: string;
  signature: string;
  category: 'Intrusion Exploit' | 'Command & Control' | 'Brute Force' | 'Web Attack' | 'Malware' | 'Reconnaissance';
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

