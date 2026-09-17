<template>
  <div class="space-y-6">
    <!-- Firewalls Header & Device Selector Tabs -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <button
        v-for="dev in fwStore.devices"
        :key="dev.id"
        @click="selectedDevId = dev.id"
        class="text-left p-4 rounded-xl border transition relative"
        :class="[
          selectedDevId === dev.id
            ? 'bg-slate-900 border-brand-500/80 shadow-lg shadow-brand-500/10'
            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
        ]"
      >
        <div class="flex items-center justify-between mb-2">
          <VendorBadge :vendor="dev.vendor" />
          <span class="w-2 h-2 rounded-full" :class="dev.status === 'healthy' ? 'bg-emerald-400' : 'bg-amber-400'"></span>
        </div>
        <div class="font-bold text-white text-xs truncate">{{ dev.name }}</div>
        <div class="text-[11px] text-slate-400 font-mono mt-0.5">{{ dev.ipAddress }}</div>
      </button>
    </div>

    <!-- Selected Device Telemetry Detail -->
    <div v-if="activeDevice" class="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div class="flex items-center gap-3">
            <h2 class="text-base font-bold text-white">{{ activeDevice.name }}</h2>
            <VendorBadge :vendor="activeDevice.vendor" />
            <span class="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              SNMP {{ activeDevice.snmpVersion }} ACTIVE
            </span>
          </div>
          <p class="text-xs text-slate-400 mt-1">
            {{ activeDevice.model }} • Firmware: {{ activeDevice.version }} • Location: {{ activeDevice.location }}
          </p>
        </div>

        <div class="flex items-center gap-4 text-xs font-mono">
          <div class="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700">
            <span class="text-slate-400">Community:</span> <span class="text-slate-200">{{ activeDevice.snmpCommunity }}</span>
          </div>
          <div class="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700">
            <span class="text-slate-400">Uptime:</span> <span class="text-emerald-400">{{ formatUptime(activeDevice.snmpMetrics?.sysUpTime || 0) }}</span>
          </div>
        </div>
      </div>

      <!-- Vendor-Specific Feature Section (e.g. FortiGate UTM & Security Fabric) -->
      <div v-if="activeDevice.vendor === 'fortinet'" class="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20">
        <div class="text-xs font-bold text-rose-300 uppercase tracking-wider mb-3 flex items-center justify-between">
          <span>FortiGate 600F Unified Threat Management & Security Fabric</span>
          <span class="text-[10px] font-mono text-rose-400">FortiOS 7.4.12 GA.M Engine Active</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs">
          <div
            v-for="feature in ['IPS Engine', 'Antivirus', 'Web Filtering', 'App Control', 'SSL Inspection', 'DDoS Protection', 'VPN Gateway']"
            :key="feature"
            class="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 flex items-center justify-between"
          >
            <span class="text-slate-300 text-[11px] font-mono">{{ feature }}</span>
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
        </div>
      </div>

      <div v-else-if="activeDevice.vendor === 'checkpoint' && activeDevice.checkPointBlades" class="p-4 rounded-xl bg-pink-500/5 border border-pink-500/20">
        <div class="text-xs font-bold text-pink-300 uppercase tracking-wider mb-3 flex items-center justify-between">
          <span>Check Point Quantum Software Blades Active</span>
          <span class="text-[10px] font-mono text-pink-400">R81.20 Gaia Management API Connected</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs">
          <div
            v-for="(val, blade) in activeDevice.checkPointBlades"
            :key="blade"
            class="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 flex items-center justify-between"
          >
            <span class="capitalize text-slate-300 text-[11px]">{{ formatBladeName(String(blade)) }}</span>
            <span class="w-2 h-2 rounded-full" :class="val ? 'bg-emerald-400' : 'bg-slate-600'"></span>
          </div>
        </div>
      </div>

      <!-- Core SNMP Metrics Gauges -->
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <!-- CPU Gauge -->
        <div class="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
          <span class="text-[11px] uppercase font-semibold text-slate-400">CPU Utilization</span>
          <div class="text-2xl font-bold font-mono text-white mt-1">
            {{ activeDevice.snmpMetrics?.cpuUtilPercent }}%
          </div>
          <div class="w-full h-1.5 rounded-full bg-slate-800 mt-2 overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500"
              :class="activeDevice.snmpMetrics && activeDevice.snmpMetrics.cpuUtilPercent > 75 ? 'bg-amber-400' : 'bg-brand-500'"
              :style="{ width: `${activeDevice.snmpMetrics?.cpuUtilPercent}%` }"
            ></div>
          </div>
          <div class="text-[10px] text-slate-500 mt-2 font-mono">
            {{ activeDevice.vendor === 'fortinet' ? 'Fortinet fgSysCpuUsage OID' : 'SNMP Host-Resources MIB' }}
          </div>
        </div>

        <!-- RAM Gauge -->
        <div class="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
          <span class="text-[11px] uppercase font-semibold text-slate-400">Memory Allocated</span>
          <div class="text-2xl font-bold font-mono text-white mt-1">
            {{ activeDevice.snmpMetrics?.memoryUtilPercent }}%
          </div>
          <div class="w-full h-1.5 rounded-full bg-slate-800 mt-2 overflow-hidden">
            <div
              class="h-full rounded-full bg-cyan-500 transition-all duration-500"
              :style="{ width: `${activeDevice.snmpMetrics?.memoryUtilPercent}%` }"
            ></div>
          </div>
          <div class="text-[10px] text-slate-500 mt-2 font-mono">
            {{ (activeDevice.snmpMetrics?.memoryUsedBytes! / 1073741824).toFixed(1) }} GB / {{ (activeDevice.snmpMetrics?.memoryTotalBytes! / 1073741824).toFixed(0) }} GB
          </div>
        </div>

        <!-- Concurrent Connections -->
        <div class="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
          <span class="text-[11px] uppercase font-semibold text-slate-400">Concurrent Sessions</span>
          <div class="text-2xl font-bold font-mono text-white mt-1">
            {{ activeDevice.snmpMetrics?.concurrentConnections.toLocaleString() }}
          </div>
          <div class="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>HA State:</span>
            <span class="font-mono text-emerald-400 font-bold uppercase">{{ activeDevice.snmpMetrics?.haState }}</span>
          </div>
          <div class="text-[10px] text-slate-500 mt-1 font-mono">fwNumConn (1.3.6.1.4.1.2620.1.1.25.3)</div>
        </div>

        <!-- Active VPN Tunnels -->
        <div class="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
          <span class="text-[11px] uppercase font-semibold text-slate-400">IPsec / SSL VPN</span>
          <div class="text-2xl font-bold font-mono text-white mt-1">
            {{ activeDevice.snmpMetrics?.vpnActiveTunnels }}
          </div>
          <div class="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>Tunnel Health:</span>
            <span class="font-mono text-emerald-400">100% Up</span>
          </div>
          <div class="text-[10px] text-slate-500 mt-1 font-mono">vpnNumTunnels (1.3.6.1.4.1.2620.1.10.1.1)</div>
        </div>
      </div>

      <!-- Interfaces IF-MIB Telemetry Table -->
      <div>
        <h3 class="text-xs font-bold text-white uppercase tracking-wider mb-3">
          Network Interfaces & Port Throughput (IF-MIB & RFC 2863)
        </h3>
        <div class="overflow-x-auto rounded-lg border border-slate-800">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-slate-950/60 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-semibold font-mono">
                <th class="py-2.5 px-4">Interface Name</th>
                <th class="py-2.5 px-4">Oper Status</th>
                <th class="py-2.5 px-4">Port Speed</th>
                <th class="py-2.5 px-4 text-right">Inbound Rate (Bps)</th>
                <th class="py-2.5 px-4 text-right">Outbound Rate (Bps)</th>
                <th class="py-2.5 px-4 text-center">CRC / Drops</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 font-mono">
              <tr
                v-for="iface in activeDevice.snmpMetrics?.interfaces"
                :key="iface.name"
                class="hover:bg-slate-800/40 transition"
              >
                <td class="py-2.5 px-4 font-sans font-medium text-slate-200">
                  {{ iface.name }}
                </td>
                <td class="py-2.5 px-4 font-sans">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {{ iface.operStatus }}
                  </span>
                </td>
                <td class="py-2.5 px-4 text-slate-400">
                  {{ (iface.speedBps / 1000000000).toFixed(0) }} Gbps
                </td>
                <td class="py-2.5 px-4 text-right text-emerald-400 font-medium">
                  ↓ {{ (iface.inBps / 1000000).toFixed(1) }} Mbps
                </td>
                <td class="py-2.5 px-4 text-right text-cyan-400 font-medium">
                  ↑ {{ (iface.outBps / 1000000).toFixed(1) }} Mbps
                </td>
                <td class="py-2.5 px-4 text-center">
                  <span :class="iface.inErrors > 0 ? 'text-rose-400 font-bold' : 'text-slate-500'">
                    {{ iface.inErrors }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useFirewallStore } from '../stores/firewall.store.js';
import VendorBadge from '../components/VendorBadge.vue';

const fwStore = useFirewallStore();
const selectedDevId = ref<string>('fw-fg-01');

const activeDevice = computed(() => {
  if (fwStore.devices.length === 0) return null;
  return fwStore.devices.find((d: any) => d.id === selectedDevId.value) || fwStore.devices[0];
});

function formatBladeName(name: string): string {
  switch (name) {
    case 'firewall': return 'Firewall';
    case 'ips': return 'IPS Blade';
    case 'antiBot': return 'Anti-Bot';
    case 'threatEmulation': return 'Threat Emulation';
    case 'vpn': return 'IPsec VPN';
    case 'applicationControl': return 'App Control';
    case 'urlFiltering': return 'URL Filtering';
    default: return name;
  }
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  return `${days}d ${hours}h`;
}
</script>
