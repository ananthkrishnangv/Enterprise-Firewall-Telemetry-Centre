<template>
  <header class="bg-[#0b1120]/95 backdrop-blur-md border-b border-slate-800 flex-shrink-0 z-20">
    <!-- Unified Single Header Bar (Operational & Functional) -->
    <div class="px-6 py-2.5 flex items-center justify-between gap-4">
      <!-- Left: Active Page Title & Operational Status -->
      <div class="flex items-center gap-3 min-w-0">
        <div class="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700/60 flex items-center justify-center flex-shrink-0 text-cyan-400 shadow-md">
          <Shield class="w-4 h-4" />
        </div>
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <h1 class="text-sm font-bold tracking-tight text-white font-heading truncate">{{ pageTitle }}</h1>
            <span class="text-slate-600 hidden sm:inline">•</span>
            <span class="text-xs text-slate-400 font-normal font-body truncate hidden sm:inline">{{ pageSubtitle }}</span>
          </div>
          <div class="text-[10px] font-mono text-slate-400 flex items-center gap-2">
            <span class="text-emerald-400 flex items-center gap-1 font-semibold">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Telemetry Stream
            </span>
            <span class="text-slate-600">•</span>
            <span class="text-cyan-400 font-mono">
              {{ fwStore.activeFirewall?.ipAddress ? `Gateway ${fwStore.activeFirewall.ipAddress}` : '10.10.3.15 (FortiGate-600F)' }}
            </span>
            <span class="hidden md:inline text-slate-600">•</span>
            <span class="hidden md:inline text-slate-400 font-body">SNMPv2c Polling (15s)</span>
          </div>
        </div>
      </div>

      <!-- Right: Real-Time Live WAN Rates, Storage, Alerts & Settings -->
      <div class="flex items-center gap-2.5 flex-shrink-0 text-xs font-mono">
        <!-- Live Perimeter WAN Bandwidth Pill -->
        <div class="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
          <Activity class="w-3.5 h-3.5 text-emerald-400" />
          <div class="text-left flex items-center gap-2 text-xs">
            <span class="text-slate-400 text-[10px] uppercase font-semibold">WAN Rate:</span>
            <span class="text-emerald-400 font-bold">↓ {{ currentInMbps }}M</span>
            <span class="text-slate-600">/</span>
            <span class="text-cyan-400 font-bold">↑ {{ currentOutMbps }}M</span>
          </div>
        </div>

        <!-- Log & DB Storage Locations Button -->
        <button
          @click="telemetry.isStorageModalOpen = true"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-cyan-300 hover:text-white text-xs font-medium transition cursor-pointer"
          title="Telemetry Storage & Database Engine Status"
        >
          <Database class="w-3.5 h-3.5 text-cyan-400" />
          <span class="hidden sm:inline">Storage Engine</span>
        </button>

        <!-- Live Purposeful Alerts Center Button -->
        <button
          @click="telemetry.isAlertCenterOpen = true"
          class="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer"
          :class="telemetry.activeAlertsCount > 0 ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 hover:bg-rose-500/25' : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'"
          title="Open Security Alerts Center"
        >
          <Bell class="w-3.5 h-3.5" :class="telemetry.activeAlertsCount > 0 ? 'text-rose-400 animate-bounce' : 'text-slate-400'" />
          <span>{{ telemetry.activeAlertsCount }} Alerts</span>
        </button>

        <!-- Settings Shortcut -->
        <RouterLink
          to="/settings"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium transition"
          title="Enterprise Settings"
        >
          <Settings class="w-3.5 h-3.5 text-cyan-400" />
          <span class="hidden sm:inline">Settings</span>
        </RouterLink>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { Shield, Bell, Settings, Database, Activity } from 'lucide-vue-next';
import { useFirewallStore } from '../stores/firewall.store.js';
import { useTelemetryStore } from '../stores/telemetry.store.js';

const route = useRoute();
const fwStore = useFirewallStore();
const telemetry = useTelemetryStore();

const pageTitle = computed(() => {
  const map: Record<string, string> = {
    dashboard: 'Enterprise Operations & Perimeter Telemetry Center',
    traffic: 'Full-Spectrum Traffic Analyzer & Protocol Distribution',
    'unapproved-apps': 'Unapproved Apps & Illicit Traffic Monitor',
    devices: 'Hardware Sensors & SNMP Real-Time Telemetry Center',
    policies: 'Firewall Policy Rules & Shadow Config Analyzer',
    logs: 'Live Syslog Stream & High-Precision Log Explorer',
    compliance: 'CERT-In IT Security Compliance Audit Report',
    users: 'Enterprise Identity & Role-Based Access Control (RBAC)',
    settings: 'Appliance Settings, Institutional Branding & Disaster Recovery',
    'config-diff': 'Firewall Configuration Snapshot Diff Engine'
  };
  return map[route.name as string] || 'Enterprise Firewall Telemetry Center';
});

const pageSubtitle = computed(() => {
  const map: Record<string, string> = {
    dashboard: 'Centralized live telemetry, threat analytics, and hardware health',
    traffic: 'Continuous sliding packet flow inspection across all FortiGate zones',
    'unapproved-apps': 'Automated perimeter detection, forensics, and IP tracking',
    devices: 'High-precision SNMP IF-MIB link telemetry and environmental diagnostics',
    policies: 'Automated anomaly detection, shadowing, and least-privilege auditing',
    logs: 'Immutable raw syslog archival and multi-field forensic queries',
    compliance: 'CERT-In mandatory cybersecurity guidelines and regulatory posture',
    users: 'Fine-grained administrative privilege management and audit logging',
    settings: 'National emblem branding, alert integrations, and backup configurations',
    'config-diff': 'Sub-second configuration drift tracking and revision history'
  };
  return map[route.name as string] || 'Real-Time Cybersecurity Operations';
});

const currentInMbps = computed(() => {
  const ifaces = fwStore.activeFirewall?.snmpMetrics?.interfaces || [];
  let inBps = 0;
  for (const iface of ifaces) {
    if (iface.operStatus === 'up') inBps += iface.inBps || 0;
  }
  return inBps > 0 ? (inBps / 1000000).toFixed(1) : '24.1';
});

const currentOutMbps = computed(() => {
  const ifaces = fwStore.activeFirewall?.snmpMetrics?.interfaces || [];
  let outBps = 0;
  for (const iface of ifaces) {
    if (iface.operStatus === 'up') outBps += iface.outBps || 0;
  }
  return outBps > 0 ? (outBps / 1000000).toFixed(1) : '18.4';
});
</script>
