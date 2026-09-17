<template>
  <header class="bg-violet-950/90 backdrop-blur-md border-b border-violet-800/40 flex-shrink-0 z-20">
    <!-- Unified Single Header Bar (Operational & Functional) -->
    <div class="px-6 py-2.5 flex items-center justify-between gap-4">
      <!-- Left: Active Page Title & Operational Status -->
      <div class="flex items-center gap-3 min-w-0">
        <div class="w-8 h-8 rounded-lg bg-violet-900/60 border border-violet-700/50 flex items-center justify-center flex-shrink-0 text-cyan-300 shadow-md">
          <Shield class="w-4 h-4 text-neon-cyan" />
        </div>
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <h1 class="text-sm font-bold tracking-tight text-white font-sans truncate">{{ pageTitle }}</h1>
            <span class="text-violet-600 hidden sm:inline">•</span>
            <span class="text-xs text-violet-300/80 font-medium truncate hidden sm:inline">{{ pageSubtitle }}</span>
          </div>
          <div class="text-[10px] font-mono text-violet-400/80 flex items-center gap-2">
            <span class="text-emerald-400 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Live Telemetry Stream
            </span>
            <span class="text-violet-600">•</span>
            <span class="text-cyan-400 font-mono">
              {{ fwStore.activeFirewall?.ipAddress ? `Gateway ${fwStore.activeFirewall.ipAddress}` : 'SNMP Polling Active' }}
            </span>
            <span class="hidden md:inline text-violet-600">•</span>
            <span class="hidden md:inline text-violet-400">Stratum-1 NTP Synced</span>
          </div>
        </div>
      </div>

      <!-- Right: Real-Time Speed Ticker, Storage, Alerts & Settings -->
      <div class="flex items-center gap-2.5 flex-shrink-0 text-xs">
        <!-- 15-Min Automated Speed Test Badge -->
        <div class="hidden lg:flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-violet-900/50 border border-violet-700/40">
          <Gauge class="w-4 h-4 text-neon-cyan animate-pulse" />
          <div class="text-left">
            <div class="text-[10px] text-violet-400 font-semibold uppercase tracking-wider">
              15-Min Speed Test
            </div>
            <div class="text-[11px] font-mono text-white flex items-center gap-2 font-bold">
              <span>↓ {{ telemetry.speedtest.downloadMbps }}M</span>
              <span class="text-violet-500">/</span>
              <span>↑ {{ telemetry.speedtest.uploadMbps }}M</span>
              <span class="text-[10px] font-normal text-emerald-400">({{ telemetry.speedtest.pingMs }}ms)</span>
            </div>
          </div>
          
          <!-- Countdown to Next Test -->
          <div class="ml-2 pl-2 border-l border-violet-700/50 text-right">
            <div class="text-[9px] text-violet-400">Next in</div>
            <div class="text-[11px] font-mono font-bold text-neon-amber">
              {{ formattedCountdown }}
            </div>
          </div>

          <!-- Run Speed Test Button -->
          <button
            @click="telemetry.runSpeedTestNow()"
            :disabled="telemetry.isTestingSpeed"
            class="ml-1 p-1 rounded bg-violet-800/80 hover:bg-violet-700 text-neon-cyan transition disabled:opacity-50 cursor-pointer"
            title="Trigger Immediate Speed Test"
          >
            <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': telemetry.isTestingSpeed }" />
          </button>
        </div>

        <!-- Log & DB Storage Locations Button -->
        <button
          @click="telemetry.isStorageModalOpen = true"
          class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-900/50 hover:bg-violet-800 border border-violet-700/40 text-cyan-300 hover:text-white text-xs font-medium transition cursor-pointer"
          title="Telemetry Storage & Database Engine Status"
        >
          <Database class="w-3.5 h-3.5 text-neon-cyan" />
          <span class="hidden md:inline">Storage</span>
        </button>

        <!-- Live Purposeful Alerts Center Button -->
        <button
          @click="telemetry.isAlertCenterOpen = true"
          class="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer"
          :class="telemetry.activeAlertsCount > 0 ? 'bg-rose-500/20 border-rose-500/50 text-rose-200 hover:bg-rose-500/30' : 'bg-violet-900/50 border-violet-700/40 text-violet-200 hover:bg-violet-800'"
          title="Open Security Alerts Center"
        >
          <Bell class="w-3.5 h-3.5" :class="telemetry.activeAlertsCount > 0 ? 'text-rose-400 animate-bounce' : 'text-violet-400'" />
          <span>{{ telemetry.activeAlertsCount }} Alerts</span>
        </button>

        <!-- Settings Shortcut -->
        <RouterLink
          to="/settings"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-900/50 hover:bg-violet-800 border border-violet-700/40 text-violet-200 hover:text-white text-xs font-medium transition"
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
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { Bell, RefreshCw, Gauge, Shield, Settings, Database } from 'lucide-vue-next';
import { useTelemetryStore } from '../stores/telemetry.store.js';
import { useFirewallStore } from '../stores/firewall.store.js';

const route = useRoute();
const telemetry = useTelemetryStore();
const fwStore = useFirewallStore();

onMounted(() => {
  telemetry.fetchSpeedTest();
  telemetry.startCountdownTicker();
  fwStore.fetchSettings();
  telemetry.fetchAlerts();
  telemetry.fetchStorageInfo();
});

const formattedCountdown = computed(() => {
  const secs = telemetry.speedtest.nextTestInSec || 0;
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}m ${s < 10 ? '0' : ''}${s}s`;
});

const pageTitle = computed(() => {
  switch (route.path) {
    case '/': return 'Dashboard';
    case '/traffic': return 'Traffic & Flow Navigator';
    case '/policies': return 'Policy Rules & Security Profiles';
    case '/devices': return 'Live Gateway & SNMP Telemetry';
    case '/config-diff': return 'Configuration Drift & Audit Trail';
    case '/logs': return 'Live Syslog Audit Stream';
    case '/compliance': return 'Security Compliance & Audit';
    case '/users': return 'User Management & Access Control';
    case '/settings': return 'System Settings & Alert Configuration';
    default: return 'Dashboard';
  }
});

const pageSubtitle = computed(() => {
  const fwName = fwStore.activeFirewall?.name || 'Active Gateway';
  const fwIp = fwStore.activeFirewall?.ipAddress || 'SNMP Gateway';
  switch (route.path) {
    case '/': return `Live Gateway Ingress/Egress & Security Overview (${fwIp})`;
    case '/traffic': return 'Live Inbound & Outbound Bandwidth Monitoring';
    case '/policies': return `Active ${fwName} Firewall Policies and ACL Rules`;
    case '/devices': return `${fwName} Hardware Health, CPU & RAM Gauges`;
    case '/config-diff': return 'Policy Revisions and Audit Verification';
    case '/logs': return `Live Hardware Event Stream from ${fwIp}`;
    case '/compliance': return 'Section 70B & Indian Security Baseline Standards';
    case '/users': return 'System Operators, CISO & Auditor Accounts';
    case '/settings': return 'SNMP Target, Email/Telegram Alerts & System Preferences';
    default: return 'Real-Time Security & Telemetry Overview';
  }
});
</script>
