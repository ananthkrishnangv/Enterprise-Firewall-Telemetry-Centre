<template>
  <div class="space-y-6">
    <!-- Filter Toolbar -->
    <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center gap-3">
      <!-- Firewall Filter -->
      <div class="w-56">
        <label class="block text-[10px] uppercase font-semibold text-slate-400 mb-1">Primary Gateway</label>
        <select
          v-model="selectedFw"
          class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500 font-medium"
        >
          <option value="">All Firewalls (Unified)</option>
          <option v-for="dev in fwStore.devices" :key="dev.id" :value="dev.id">
            {{ dev.name }} ({{ dev.ipAddress }})
          </option>
        </select>
      </div>

      <!-- Action Filter -->
      <div class="w-36">
        <label class="block text-[10px] uppercase font-semibold text-slate-400 mb-1">Action</label>
        <select
          v-model="selectedAction"
          class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500"
        >
          <option value="">All Actions</option>
          <option value="allow">Allowed (Pass)</option>
          <option value="drop">Dropped (Blocked)</option>
        </select>
      </div>

      <!-- Search Input -->
      <div class="flex-1 min-w-[220px]">
        <label class="block text-[10px] uppercase font-semibold text-slate-400 mb-1">Search IP / Rule / User</label>
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="e.g. 10.10.20.15, Oracle SQL, alice.smith..."
            class="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
          <Search class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      <div class="pt-4 flex items-center gap-2">
        <button
          @click="resetFilters"
          class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
        >
          Reset
        </button>

        <AutoRefreshControl
          storageKey="auto_refresh_traffic"
          :defaultInterval="10"
          :defaultEnabled="true"
          @refresh="handleRefresh"
        />
      </div>
    </div>

    <!-- Top Talkers Breakdown Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Top Source Hosts -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <h3 class="text-xs font-semibold text-white mb-3 flex items-center justify-between">
          <span>Top Source Talkers</span>
          <span class="text-[10px] text-slate-500 uppercase font-mono">LAN</span>
        </h3>
        <div class="space-y-2.5">
          <div
            v-for="(src, idx) in telemetry.topTalkers.topSources.slice(0, 5)"
            :key="src.ip"
            class="text-xs flex items-center justify-between"
          >
            <div class="flex items-center gap-2 truncate">
              <span class="text-[10px] font-mono text-slate-500 w-3">{{ idx + 1 }}</span>
              <span class="font-mono text-slate-200 truncate">{{ src.ip }}</span>
            </div>
            <span class="font-mono text-brand-400 text-[11px] font-medium">{{ formatBytes(src.bytes) }}</span>
          </div>
        </div>
      </div>

      <!-- Top Destination Hosts -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <h3 class="text-xs font-semibold text-white mb-3 flex items-center justify-between">
          <span>Top Destinations</span>
          <span class="text-[10px] text-slate-500 uppercase font-mono">WAN/Cloud</span>
        </h3>
        <div class="space-y-2.5">
          <div
            v-for="(dst, idx) in telemetry.topTalkers.topDestinations.slice(0, 5)"
            :key="dst.ip"
            class="text-xs flex items-center justify-between"
          >
            <div class="flex items-center gap-2 truncate">
              <span class="text-[10px] font-mono text-slate-500 w-3">{{ idx + 1 }}</span>
              <span class="font-mono text-slate-200 truncate">{{ dst.ip }}</span>
              <span v-if="dst.country" class="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">{{ dst.country }}</span>
            </div>
            <span class="font-mono text-cyan-400 text-[11px] font-medium">{{ formatBytes(dst.bytes) }}</span>
          </div>
        </div>
      </div>

      <!-- Top Applications -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <h3 class="text-xs font-semibold text-white mb-3 flex items-center justify-between">
          <span>Top Applications</span>
          <span class="text-[10px] text-slate-500 uppercase font-mono">App-ID</span>
        </h3>
        <div class="space-y-2.5">
          <div
            v-for="(app, idx) in telemetry.topTalkers.topApplications.slice(0, 5)"
            :key="app.app"
            class="text-xs flex items-center justify-between"
          >
            <div class="flex items-center gap-2 truncate">
              <span class="text-[10px] font-mono text-slate-500 w-3">{{ idx + 1 }}</span>
              <span class="text-slate-200 truncate">{{ app.app }}</span>
            </div>
            <span class="font-mono text-emerald-400 text-[11px] font-medium">{{ formatBytes(app.bytes) }}</span>
          </div>
        </div>
      </div>

      <!-- Top Ports -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <h3 class="text-xs font-semibold text-white mb-3 flex items-center justify-between">
          <span>Top Destination Ports</span>
          <span class="text-[10px] text-slate-500 uppercase font-mono">Service</span>
        </h3>
        <div class="space-y-2.5">
          <div
            v-for="(port, idx) in telemetry.topTalkers.topPorts.slice(0, 5)"
            :key="port.port"
            class="text-xs flex items-center justify-between"
          >
            <div class="flex items-center gap-2 truncate">
              <span class="text-[10px] font-mono text-slate-500 w-3">{{ idx + 1 }}</span>
              <span class="font-mono text-slate-200">Port {{ port.port }}</span>
            </div>
            <span class="font-mono text-amber-400 text-[11px] font-medium">{{ formatBytes(port.bytes) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Live Flow Navigator Table -->
    <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div class="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h2 class="text-sm font-semibold text-white">Live Ingested Telemetry Flows (NetFlow / Syslog)</h2>
          <p class="text-xs text-slate-400">Streaming granular packet and session events across primary firewalls</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs text-slate-400 font-mono">{{ filteredFlows.length }} matches</span>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-slate-950/60 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
              <th class="py-3 px-4">Time</th>
              <th class="py-3 px-4">Gateway</th>
              <th class="py-3 px-4">Source Host</th>
              <th class="py-3 px-4">Destination</th>
              <th class="py-3 px-4">App & Protocol</th>
              <th class="py-3 px-4">Rule Name</th>
              <th class="py-3 px-4">Action</th>
              <th class="py-3 px-4">Volume</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60 font-mono">
            <tr
              v-for="flow in filteredFlows.slice(0, 30)"
              :key="flow.id"
              class="hover:bg-slate-800/40 transition"
            >
              <td class="py-2.5 px-4 text-slate-400 text-[11px]">
                {{ new Date(flow.timestamp).toLocaleTimeString() }}
              </td>
              <td class="py-2.5 px-4 font-sans">
                <VendorBadge :vendor="flow.vendor" />
              </td>
              <td class="py-2.5 px-4">
                <div class="text-slate-200">{{ flow.sourceIp }}:{{ flow.sourcePort }}</div>
                <div v-if="flow.userIdentity" class="text-[10px] text-slate-400 font-sans truncate max-w-[140px]">
                  {{ flow.userIdentity }}
                </div>
              </td>
              <td class="py-2.5 px-4">
                <div class="text-slate-200 flex items-center gap-1.5">
                  <span>{{ flow.destIp }}:{{ flow.destPort }}</span>
                  <span v-if="flow.countryDest" class="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400">
                    {{ flow.countryDest }}
                  </span>
                </div>
              </td>
              <td class="py-2.5 px-4 font-sans">
                <div class="text-slate-200 font-medium text-xs">{{ flow.application }}</div>
                <div class="text-[10px] text-slate-400 font-mono">{{ flow.protocol }}</div>
              </td>
              <td class="py-2.5 px-4 text-slate-300 font-sans text-xs truncate max-w-[180px]">
                {{ flow.ruleName }}
              </td>
              <td class="py-2.5 px-4 font-sans">
                <span
                  class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                  :class="flow.action === 'allow' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'"
                >
                  {{ flow.action }}
                </span>
              </td>
              <td class="py-2.5 px-4 text-right">
                <div class="text-slate-200 font-medium">{{ formatBytes(flow.bytesIn + flow.bytesOut) }}</div>
                <div class="text-[10px] text-slate-500">{{ flow.packetsIn + flow.packetsOut }} pkts</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Search } from 'lucide-vue-next';
import { useTelemetryStore } from '../stores/telemetry.store.js';
import { useFirewallStore } from '../stores/firewall.store.js';
import VendorBadge from '../components/VendorBadge.vue';
import AutoRefreshControl from '../components/AutoRefreshControl.vue';

const telemetry = useTelemetryStore();
const fwStore = useFirewallStore();
const selectedFw = ref('');
const selectedAction = ref('');
const searchQuery = ref('');

async function handleRefresh() {
  await Promise.all([
    telemetry.fetchSummary(),
    telemetry.fetchAnalytics()
  ]);
}

const filteredFlows = computed(() => {
  return telemetry.flows.filter(f => {
    if (selectedFw.value && f.firewallId !== selectedFw.value) return false;
    if (selectedAction.value && f.action !== selectedAction.value) return false;
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase();
      const match =
        f.sourceIp.includes(q) ||
        f.destIp.includes(q) ||
        f.ruleName.toLowerCase().includes(q) ||
        f.application.toLowerCase().includes(q) ||
        (f.userIdentity && f.userIdentity.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });
});

function resetFilters() {
  selectedFw.value = '';
  selectedAction.value = '';
  searchQuery.value = '';
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
</script>
