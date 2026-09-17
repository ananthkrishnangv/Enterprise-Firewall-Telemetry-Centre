<template>
  <div class="space-y-6">
    <!-- Stream Controls Toolbar -->
    <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
      <div class="flex flex-wrap items-center gap-3 flex-1">
        <!-- Pause/Resume Toggle -->
        <button
          @click="isPaused = !isPaused"
          class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition"
          :class="isPaused ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' : 'bg-brand-600 text-white border-brand-500'"
        >
          <Pause v-if="!isPaused" class="w-3.5 h-3.5" />
          <Play v-else class="w-3.5 h-3.5" />
          <span>{{ isPaused ? 'Resume Stream' : 'Pause Stream' }}</span>
        </button>

        <!-- Gateway Filter -->
        <select
          v-model="selectedVendor"
          class="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500"
        >
          <option value="">All Firewalls</option>
          <option value="checkpoint">Check Point (CP-GW)</option>
          <option value="paloalto">Palo Alto (PAN-OS)</option>
          <option value="fortinet">Fortinet (FortiOS)</option>
          <option value="pfsense">pfSense (filterlog)</option>
        </select>

        <!-- Severity Filter -->
        <select
          v-model="selectedSeverity"
          class="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500"
        >
          <option value="">All Severities</option>
          <option value="critical">Critical / Threat</option>
          <option value="warning">Warning / Drop</option>
          <option value="info">Info / Allow</option>
        </select>

        <!-- Search input -->
        <div class="relative flex-1 min-w-[200px]">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Filter syslog by IP, rule, port, user..."
            class="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
          <Search class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      <div class="flex items-center gap-3 text-xs text-slate-400 font-mono">
        <span>Ingest: <span class="text-emerald-400">UDP 1514 Active</span></span>
        <button
          @click="clearLogs"
          class="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
        >
          Clear Screen
        </button>
      </div>
    </div>

    <!-- Terminal-Style Streaming Log Console -->
    <div class="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden font-mono text-xs">
      <div class="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full" :class="isPaused ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'"></span>
          <span>{{ isPaused ? 'Stream Paused' : 'Live Syslog Feed (WebSocket)' }}</span>
        </div>
        <span>Buffer: {{ displayedLogs.length }} Events</span>
      </div>

      <div class="p-4 space-y-1.5 max-h-[640px] overflow-y-auto">
        <div
          v-for="log in displayedLogs"
          :key="log.id"
          class="px-2.5 py-1 rounded hover:bg-slate-900/80 transition flex items-start gap-3 border-l-2"
          :class="[
            log.severity === 'critical' ? 'border-rose-500 bg-rose-500/5' :
            log.severity === 'warning' ? 'border-amber-500 bg-amber-500/5' :
            'border-slate-800 text-slate-300'
          ]"
        >
          <!-- Timestamp -->
          <span class="text-slate-500 select-none text-[11px] w-16">
            {{ new Date(log.timestamp).toLocaleTimeString() }}
          </span>

          <!-- Vendor Badge -->
          <span
            class="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase select-none"
            :class="[
              log.vendor === 'checkpoint' ? 'bg-pink-500/20 text-pink-300' :
              log.vendor === 'paloalto' ? 'bg-orange-500/20 text-orange-300' :
              log.vendor === 'fortinet' ? 'bg-red-500/20 text-red-300' :
              'bg-cyan-500/20 text-cyan-300'
            ]"
          >
            {{ log.vendor }}
          </span>

          <!-- Action Pill -->
          <span
            class="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase select-none"
            :class="log.parsed.action === 'allow' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'"
          >
            {{ log.parsed.action }}
          </span>

          <!-- Raw Log Line -->
          <span class="flex-1 break-all text-[11px]" :class="log.severity === 'critical' ? 'text-rose-200' : 'text-slate-300'">
            {{ log.raw }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Pause, Play, Search } from 'lucide-vue-next';
import { useTelemetryStore } from '../stores/telemetry.store.js';

const telemetry = useTelemetryStore();
const isPaused = ref(false);
const selectedVendor = ref('');
const selectedSeverity = ref('');
const searchQuery = ref('');

const displayedLogs = computed(() => {
  return telemetry.logs.filter(l => {
    if (selectedVendor.value && l.vendor !== selectedVendor.value) return false;
    if (selectedSeverity.value && l.severity !== selectedSeverity.value) return false;
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase();
      const match =
        l.raw.toLowerCase().includes(q) ||
        (l.parsed.sourceIp && l.parsed.sourceIp.includes(q)) ||
        (l.parsed.destIp && l.parsed.destIp.includes(q)) ||
        (l.parsed.ruleName && l.parsed.ruleName.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });
});

function clearLogs() {
  telemetry.logs = [];
}
</script>
