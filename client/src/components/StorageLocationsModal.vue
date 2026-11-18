<template>
  <Teleport to="body">
    <div
      v-if="telemetry.isStorageModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none"
    >
      <div class="w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl relative space-y-5 overflow-hidden text-slate-100">
        <!-- Ambient Top Glow -->
        <div class="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-emerald-500/20 via-cyan-500/20 to-transparent rounded-full blur-3xl opacity-30 pointer-events-none"></div>

        <!-- Header -->
        <div class="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 p-0.5 shadow-md flex items-center justify-center text-emerald-400">
              <Database class="w-5 h-5" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                  STORAGE REGISTRY
                </span>
                <span class="text-xs text-slate-600">•</span>
                <span class="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Production Telemetry Active
                </span>
              </div>
              <h3 class="text-base font-bold text-white tracking-wide font-sans mt-0.5">
                Telemetry Storage &amp; Database Engine Registry
              </h3>
            </div>
          </div>

          <button
            @click="telemetry.isStorageModalOpen = false"
            class="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition border border-slate-800"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Production Mode Guarantee Notice -->
        <div class="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs font-mono">
          <div class="flex items-center gap-2 text-slate-300">
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Production Real Data Mode:</span>
            <span class="text-emerald-400 font-bold">Zero Synthetic Seeds / Pure Hardware Telemetry</span>
          </div>
          <span class="text-[10px] text-slate-400">FortiGate-600F (10.10.3.15)</span>
        </div>

        <!-- PostgreSQL Database Status Strip -->
        <div class="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <HardDrive class="w-4 h-4 text-cyan-400" />
              <span class="text-xs font-bold text-cyan-300 uppercase tracking-wider font-mono">
                PostgreSQL Database Engine
              </span>
            </div>
            <span
              class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold"
              :class="stats?.connected ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50' : 'bg-amber-950 text-amber-300 border border-amber-500/50'"
            >
              {{ stats?.connected ? 'ONLINE (PostgreSQL 18 Alpine)' : 'OFFLINE (Local File Storage)' }}
            </span>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
            <div class="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
              <div class="text-[10px] text-slate-400">Database Host</div>
              <div class="font-bold text-white truncate">{{ stats?.host || '10.40.0.151' }}</div>
            </div>
            <div class="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
              <div class="text-[10px] text-slate-400">Port / DB</div>
              <div class="font-bold text-white truncate">{{ stats?.port || 5432 }} / {{ stats?.databaseName || 'firewall_telemetry' }}</div>
            </div>
            <div class="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
              <div class="text-[10px] text-slate-400">Syslog Events</div>
              <div class="font-bold text-emerald-400">{{ (stats?.tables?.syslog_events || 0).toLocaleString() }} Rows</div>
            </div>
            <div class="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
              <div class="text-[10px] text-slate-400">Telemetry History</div>
              <div class="font-bold text-cyan-400">{{ (stats?.tables?.telemetry_metrics || 0).toLocaleString() }} Rows</div>
            </div>
          </div>
        </div>

        <!-- InfluxDB 2.7 Time-Series TSDB Engine -->
        <div class="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Activity class="w-4 h-4 text-emerald-400" />
              <span class="text-xs font-bold text-cyan-300 uppercase tracking-wider font-mono">
                InfluxDB 2.7 Time-Series TSDB Engine
              </span>
            </div>
            <span
              class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold"
              :class="stats?.influx?.connected ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50' : 'bg-amber-950 text-amber-300 border border-amber-500/50'"
            >
              {{ stats?.influx?.connected ? 'ONLINE (InfluxDB 2.7 Alpine)' : 'STANDBY' }}
            </span>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
            <div class="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
              <div class="text-[10px] text-slate-400">TSDB Endpoint</div>
              <div class="font-bold text-white truncate">{{ stats?.influx?.url || 'http://10.40.0.152:8086' }}</div>
            </div>
            <div class="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
              <div class="text-[10px] text-slate-400">Org / Bucket</div>
              <div class="font-bold text-white truncate">{{ stats?.influx?.org || 'csir-serc' }} / {{ stats?.influx?.bucket || 'firewall_logs' }}</div>
            </div>
            <div class="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
              <div class="text-[10px] text-slate-400">Live TSDB Retention</div>
              <div class="font-bold text-emerald-400">{{ stats?.influx?.retention || '180 days (CERT-In)' }}</div>
            </div>
            <div class="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
              <div class="text-[10px] text-slate-400">Ingest Buffer</div>
              <div class="font-bold text-cyan-400">10,000 Ring Capacity</div>
            </div>
          </div>
        </div>

        <!-- File System Storage Locations -->
        <div class="space-y-2.5">
          <div class="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2">
            <FolderTree class="w-4 h-4 text-cyan-400" />
            <span>Appliance File System Storage Locations</span>
          </div>

          <div class="space-y-2 text-xs font-mono">
            <!-- Location 1: Raw Syslog -->
            <div class="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 flex items-center justify-between gap-3">
              <div class="flex items-center gap-2.5 min-w-0">
                <FileText class="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <div class="min-w-0">
                  <div class="font-bold text-white truncate">Raw Syslog Archive Stream (UDP 1514)</div>
                  <div class="text-[10px] text-slate-400 truncate"><code>{{ stats?.fileStorage?.syslogLogPath || '/app/data/syslog.log' }}</code></div>
                </div>
              </div>
              <span class="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 flex-shrink-0 border border-slate-700">
                {{ formatBytes(stats?.fileStorage?.syslogLogBytes || 0) }}
              </span>
            </div>

            <!-- Location 2: Uploads & Images -->
            <div class="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 flex items-center justify-between gap-3">
              <div class="flex items-center gap-2.5 min-w-0">
                <ImageIcon class="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div class="min-w-0">
                  <div class="font-bold text-white truncate">Uploaded Logos &amp; Media (Root Folder)</div>
                  <div class="text-[10px] text-slate-400 truncate"><code>{{ stats?.fileStorage?.uploadsDir || '/app/uploads' }}</code> (Served at <code>/uploads/</code>)</div>
                </div>
              </div>
              <span class="px-2 py-0.5 rounded bg-emerald-950/80 text-[10px] text-emerald-300 border border-emerald-700/40 flex-shrink-0">
                Persistent Volume
              </span>
            </div>

            <!-- Location 3: Persistent JSON Backup & Settings -->
            <div class="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 flex items-center justify-between gap-3">
              <div class="flex items-center gap-2.5 min-w-0">
                <Server class="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <div class="min-w-0">
                  <div class="font-bold text-white truncate">Persistent Node &amp; Device Configuration</div>
                  <div class="text-[10px] text-slate-400 truncate"><code>{{ stats?.fileStorage?.dataDir || '/app/data' }}/settings.json</code></div>
                </div>
              </div>
              <span class="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 flex-shrink-0 border border-slate-700">
                Active Config
              </span>
            </div>

            <!-- Location 4: Automated Backups -->
            <div class="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 flex items-center justify-between gap-3">
              <div class="flex items-center gap-2.5 min-w-0">
                <Archive class="w-4 h-4 text-amber-400 flex-shrink-0" />
                <div class="min-w-0">
                  <div class="font-bold text-white truncate">Automated Settings &amp; Log Backups</div>
                  <div class="text-[10px] text-slate-400 truncate"><code>/app/backups/</code> (Scheduled PostgreSQL 18 &amp; Syslog Snapshots)</div>
                </div>
              </div>
              <span class="px-2 py-0.5 rounded bg-amber-950/80 text-[10px] text-amber-300 border border-amber-700/40 flex-shrink-0">
                Auto Pruning Active
              </span>
            </div>
          </div>
        </div>

        <!-- CERT-In Retention Policy Badge -->
        <div class="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 font-sans">
          <ShieldCheck class="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div class="leading-relaxed text-[11px]">
            <strong>CERT-In IT Security Compliance:</strong> Syslog events and firewall flows are archived with a mandatory <strong>180-Day Rolling Retention Window</strong> in PostgreSQL 18 and local persistent volumes.
          </div>
        </div>

        <!-- Footer Action -->
        <div class="pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <span class="text-[10px] font-mono text-slate-500">
            Storage Engine Check: {{ stats?.lastChecked ? new Date(stats.lastChecked).toLocaleTimeString() : 'Live' }}
          </span>
          <button
            @click="refreshStorageStats"
            class="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:opacity-95 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': isRefreshing }" />
            <span>Refresh Storage Status</span>
          </button>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import {
  Database,
  HardDrive,
  Activity,
  FolderTree,
  FileText,
  Image as ImageIcon,
  Server,
  ShieldCheck,
  X,
  RefreshCw,
  Archive
} from 'lucide-vue-next';
import { useTelemetryStore } from '../stores/telemetry.store.js';

const telemetry = useTelemetryStore();
const isRefreshing = ref(false);

const stats = computed(() => telemetry.storageStats);

async function refreshStorageStats() {
  isRefreshing.value = true;
  try {
    await telemetry.fetchStorageInfo();
  } finally {
    isRefreshing.value = false;
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

onMounted(() => {
  telemetry.fetchStorageInfo();
});
</script>
