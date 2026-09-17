<template>
  <header class="bg-violet-950/90 backdrop-blur-md border-b border-violet-800/40 flex-shrink-0 z-20">
    <!-- UX4G Mandated Government of India Top Banner & Tricolor Accent Strip -->
    <div class="h-1 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]"></div>
    
    <div class="px-6 py-2.5 flex flex-wrap items-center justify-between gap-4 border-b border-violet-900/50 bg-violet-950/60">
      <div class="flex items-center gap-3">
        <!-- Dynamic Organization Brand Logo -->
        <div class="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 bg-violet-900/60 border border-violet-700/50 shadow-md">
          <img
            v-if="fwStore.branding.logoBase64"
            :src="fwStore.branding.logoBase64"
            class="w-full h-full object-contain p-0.5"
            alt="Logo"
          />
          <img
            v-else-if="fwStore.branding.logoUrl"
            :src="fwStore.branding.logoUrl"
            class="w-full h-full object-contain p-0.5"
            alt="Logo"
          />
          <div v-else-if="fwStore.branding.presetLogo === 'shield'" class="w-full h-full bg-gradient-to-tr from-violet-600 via-fuchsia-500 to-cyan-400 p-0.5 flex items-center justify-center">
            <div class="w-full h-full bg-violet-950 rounded flex items-center justify-center">
              <Shield class="w-4 h-4 text-cyan-300" />
            </div>
          </div>
          <div v-else-if="fwStore.branding.presetLogo === 'cyber'" class="w-full h-full bg-gradient-to-tr from-emerald-600 to-cyan-500 p-0.5 flex items-center justify-center">
            <div class="w-full h-full bg-violet-950 rounded flex items-center justify-center">
              <Cpu class="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div v-else-if="fwStore.branding.presetLogo === 'globe'" class="w-full h-full bg-gradient-to-tr from-blue-600 to-indigo-500 p-0.5 flex items-center justify-center">
            <div class="w-full h-full bg-violet-950 rounded flex items-center justify-center">
              <Globe class="w-4 h-4 text-blue-300" />
            </div>
          </div>
          <div v-else class="w-full h-full rounded-full bg-gradient-to-tr from-amber-500 to-violet-600 p-0.5 flex items-center justify-center">
            <div class="w-full h-full rounded-full bg-violet-950 flex items-center justify-center">
              <span class="text-amber-400 font-bold text-xs">🇮🇳</span>
            </div>
          </div>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold tracking-wide text-white font-sans">
              {{ fwStore.branding.apexBody }} <span class="text-violet-400 font-normal">| {{ fwStore.branding.orgName }}</span>
            </span>
          </div>
          <div class="text-[11px] text-violet-300/80 font-medium">
            {{ fwStore.branding.orgDivision }}
          </div>
        </div>
      </div>

      <!-- Right: Real-Time Internet Speed Ticker & 15-min Countdown -->
      <div class="flex items-center gap-3 text-xs">
        <!-- 15-Min Automated Speed Test Badge -->
        <div class="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-violet-900/50 border border-violet-700/40">
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
            <div class="text-[9px] text-violet-400">Next Test in</div>
            <div class="text-[11px] font-mono font-bold text-neon-amber">
              {{ formattedCountdown }}
            </div>
          </div>

          <!-- Run Speed Test Button -->
          <button
            @click="telemetry.runSpeedTestNow()"
            :disabled="telemetry.isTestingSpeed"
            class="ml-1 p-1 rounded bg-violet-800/80 hover:bg-violet-700 text-neon-cyan transition disabled:opacity-50"
            title="Trigger Immediate Speed Test"
          >
            <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': telemetry.isTestingSpeed }" />
          </button>
        </div>

        <!-- Log & DB Storage Locations Button -->
        <button
          @click="telemetry.isStorageModalOpen = true"
          class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-900/50 hover:bg-violet-800 border border-violet-700/40 text-cyan-300 hover:text-white text-xs font-medium transition cursor-pointer"
          title="Telemetry Storage &amp; Database Engine Status"
        >
          <Database class="w-3.5 h-3.5 text-neon-cyan" />
          <span class="hidden md:inline">Log &amp; DB Storage</span>
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

    <!-- Subheader Navigation / Breadcrumb Row -->
    <div class="px-6 py-2 flex items-center justify-between text-xs">
      <div class="flex items-center gap-2 text-violet-300 font-medium">
        <Shield class="w-4 h-4 text-violet-400" />
        <span class="text-white font-bold">{{ pageTitle }}</span>
        <span class="text-violet-600">/</span>
        <span class="text-violet-400">{{ pageSubtitle }}</span>
      </div>

      <div class="flex items-center gap-3 text-[11px] font-mono text-violet-400">
        <span class="hidden sm:inline">{{ fwStore.branding.ntpBadgeText }}</span>
        <span class="text-violet-600">•</span>
        <span class="text-emerald-400 flex items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          Telemetry Streaming
        </span>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { Bell, RefreshCw, Gauge, Shield, Settings, Cpu, Globe, Database } from 'lucide-vue-next';
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
    case '/': return fwStore.branding.portalTitle;
    case '/traffic': return 'Perimeter Traffic & Flow Navigator';
    case '/policies': return 'Policy Rules & Security Profiles';
    case '/devices': return 'Live Gateway & SNMP Telemetry';
    case '/config-diff': return 'Configuration Drift & Audit Trail';
    case '/logs': return 'Live Firewall Syslog Audit Stream';
    case '/compliance': return 'CERT-In Security Compliance';
    case '/settings': return 'System Settings & Alert Configuration';
    default: return fwStore.branding.portalTitle;
  }
});

const pageSubtitle = computed(() => {
  const fwName = fwStore.activeFirewall?.name || 'Active Gateway';
  const fwIp = fwStore.activeFirewall?.ipAddress || 'SNMP Gateway';
  switch (route.path) {
    case '/': return fwStore.branding.portalSubtitle;
    case '/traffic': return 'Live Inbound & Outbound Bandwidth Monitoring';
    case '/policies': return `Active ${fwName} Firewall Policies and ACL Rules`;
    case '/devices': return `${fwName} Hardware Health, CPU & RAM Gauges`;
    case '/config-diff': return 'Policy Revisions and Audit Verification';
    case '/logs': return `Live Hardware Event Stream from ${fwIp}`;
    case '/compliance': return 'Section 70B & Indian Security Baseline Standards';
    case '/settings': return 'SNMP Target, Email/Telegram Alerts & Portal Labels';
    default: return fwStore.branding.portalSubtitle;
  }
});
</script>
