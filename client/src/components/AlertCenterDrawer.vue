<template>
  <Teleport to="body">
    <!-- Backdrop overlay -->
    <div
      v-if="telemetry.isAlertCenterOpen"
      @click="telemetry.isAlertCenterOpen = false"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity animate-fadeIn"
    ></div>

    <!-- Slide-over Drawer -->
    <div
      v-if="telemetry.isAlertCenterOpen"
      class="fixed inset-y-0 right-0 max-w-lg w-full bg-slate-950/95 border-l border-violet-800/50 shadow-2xl z-50 flex flex-col backdrop-blur-xl animate-slideLeft select-none"
    >
      <!-- Top Header -->
      <div class="p-5 border-b border-violet-800/40 bg-gradient-to-r from-violet-950/90 via-purple-950/80 to-slate-950 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center flex-shrink-0">
            <Bell class="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-sm font-black text-white uppercase tracking-wider font-sans">
                Security Alerts Center
              </h3>
              <span
                v-if="telemetry.activeAlertsCount > 0"
                class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/30 text-rose-300 border border-rose-500/40"
              >
                {{ telemetry.activeAlertsCount }} Active
              </span>
              <span
                v-else
                class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/30 text-emerald-300 border border-emerald-500/40"
              >
                All Clear
              </span>
            </div>
            <p class="text-[11px] text-violet-300/80 mt-0.5">
              Real-time gateway threat alarms &amp; volumetric threshold events
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            @click="soundEnabled = !soundEnabled"
            class="p-2 rounded-xl border transition"
            :class="soundEnabled ? 'bg-violet-800/50 text-cyan-300 border-violet-600/50' : 'bg-violet-950 text-violet-500 border-violet-800'"
            :title="soundEnabled ? 'Audio alerts active' : 'Audio alerts muted'"
          >
            <Volume2 v-if="soundEnabled" class="w-4 h-4" />
            <VolumeX v-else class="w-4 h-4" />
          </button>

          <button
            @click="telemetry.isAlertCenterOpen = false"
            class="p-2 rounded-xl bg-violet-900/40 hover:bg-violet-800 text-violet-400 hover:text-white transition"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Severity Filter Tabs -->
      <div class="px-5 py-2.5 bg-violet-950/60 border-b border-violet-800/30 flex items-center justify-between text-xs font-mono">
        <div class="flex items-center gap-1.5">
          <button
            v-for="filter in ['all', 'critical', 'warning', 'info']"
            :key="filter"
            @click="activeFilter = filter"
            class="px-2.5 py-1 rounded-lg text-[11px] uppercase transition"
            :class="activeFilter === filter ? 'bg-violet-600 text-white font-bold' : 'text-violet-400 hover:text-white'"
          >
            {{ filter }}
          </button>
        </div>
        <button
          @click="telemetry.clearAcknowledgedAlerts()"
          class="text-[10px] text-violet-400 hover:text-rose-300 transition"
        >
          Clear Silenced
        </button>
      </div>

      <!-- Alerts Scrollable List -->
      <div class="flex-1 overflow-y-auto p-4 space-y-3">
        <div v-if="filteredAlerts.length === 0" class="h-64 flex flex-col items-center justify-center text-center p-6 space-y-3 text-violet-400">
          <CheckCircle2 class="w-10 h-10 text-emerald-400 opacity-80" />
          <div class="text-xs font-semibold text-white">Zero Active Security Threats</div>
          <p class="text-[11px] text-violet-400/80 max-w-xs leading-relaxed">
            Perimeter firewall policies and NetFlow telemetry are operating within normal baseline parameters.
          </p>
        </div>

        <div
          v-for="alert in filteredAlerts"
          :key="alert.id"
          class="p-4 rounded-2xl border transition-all duration-200 space-y-2.5 relative overflow-hidden"
          :class="[
            alert.acknowledged
              ? 'bg-violet-950/30 border-violet-800/40 opacity-60'
              : (alert.severity === 'critical'
                  ? 'bg-rose-950/40 border-rose-500/50 shadow-lg shadow-rose-950/40'
                  : alert.severity === 'warning'
                  ? 'bg-amber-950/40 border-amber-500/50'
                  : 'bg-cyan-950/30 border-cyan-500/40')
          ]"
        >
          <!-- Accent Left Bar -->
          <div
            class="absolute left-0 top-0 bottom-0 w-1"
            :class="alert.severity === 'critical' ? 'bg-rose-500' : alert.severity === 'warning' ? 'bg-amber-400' : 'bg-cyan-400'"
          ></div>

          <!-- Alert Header Row -->
          <div class="flex items-start justify-between gap-2 pl-2">
            <div class="space-y-0.5 min-w-0">
              <div class="flex items-center gap-2">
                <span
                  class="px-2 py-0.2 rounded text-[9px] font-mono font-bold uppercase tracking-wider"
                  :class="[
                    alert.severity === 'critical' ? 'bg-rose-500 text-white' :
                    alert.severity === 'warning' ? 'bg-amber-400 text-black' :
                    'bg-cyan-500 text-black'
                  ]"
                >
                  {{ alert.severity }}
                </span>
                <span class="text-[10px] font-mono text-violet-400">
                  {{ formatTimeAgo(alert.timestamp) }}
                </span>
                <span v-if="alert.acknowledged" class="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <Check class="w-3 h-3" /> Silenced
                </span>
              </div>
              <h4 class="text-xs font-bold text-white leading-snug pt-0.5">
                {{ alert.title }}
              </h4>
            </div>

            <!-- Silence Action -->
            <button
              v-if="!alert.acknowledged"
              @click="telemetry.acknowledgeAlert(alert.id)"
              class="px-2 py-1 rounded-lg bg-violet-800/60 hover:bg-violet-700 text-cyan-300 text-[10px] font-mono transition flex-shrink-0"
              title="Acknowledge &amp; Silence Alarm"
            >
              Silence
            </button>
          </div>

          <!-- Detail & Parameters -->
          <p class="text-[11px] text-violet-200/90 leading-relaxed pl-2">
            {{ alert.detail || alert.description }}
          </p>

          <!-- Footer Metadata Strip -->
          <div class="pt-2 border-t border-violet-800/30 pl-2 flex items-center justify-between text-[10px] font-mono text-violet-400">
            <span v-if="alert.sourceIp">Target/Source: <strong class="text-white">{{ alert.sourceIp }}</strong></span>
            <span v-else>Gateway: FortiGate-CSIR</span>

            <RouterLink
              to="/logs"
              @click="telemetry.isAlertCenterOpen = false"
              class="text-cyan-300 hover:underline flex items-center gap-1"
            >
              <span>Investigate Logs</span>
              <ArrowRight class="w-3 h-3" />
            </RouterLink>
          </div>
        </div>
      </div>

      <!-- Bottom Status & Quick Action Bar -->
      <div class="p-4 border-t border-violet-800/40 bg-violet-950/80 space-y-2">
        <div class="flex items-center justify-between text-xs text-violet-300">
          <span class="text-[11px] text-violet-400 font-mono flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Synced with PostgreSQL <code>security_alerts</code>
          </span>
          <button
            @click="telemetry.fetchAlerts()"
            class="text-[11px] font-mono text-cyan-300 hover:text-white flex items-center gap-1"
          >
            <RefreshCw class="w-3 h-3" />
            <span>Poll Now</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  Bell,
  X,
  Volume2,
  VolumeX,
  Check,
  CheckCircle2,
  ArrowRight,
  RefreshCw
} from 'lucide-vue-next';
import { useTelemetryStore } from '../stores/telemetry.store.js';

const telemetry = useTelemetryStore();
const soundEnabled = ref(true);
const activeFilter = ref<string>('all');

const filteredAlerts = computed(() => {
  if (activeFilter.value === 'all') return telemetry.alerts;
  if (activeFilter.value === 'critical') return telemetry.alerts.filter(a => a.severity === 'critical');
  if (activeFilter.value === 'warning') return telemetry.alerts.filter(a => a.severity === 'warning');
  if (activeFilter.value === 'info') return telemetry.alerts.filter(a => a.severity === 'info');
  return telemetry.alerts;
});

function formatTimeAgo(timestamp: string): string {
  if (!timestamp) return 'recently';
  const diffSec = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  return `${diffHours}h ago`;
}
</script>

<style scoped>
@keyframes slideLeft {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}
.animate-slideLeft {
  animation: slideLeft 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
