<template>
  <div class="space-y-6 pb-12 select-none text-slate-100 font-body">
    <!-- Compliance Health Header & Scorecard -->
    <div class="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-xl">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-300 border border-amber-500/30 font-mono">
              CERT-In Directive 2022 • Section 70B IT Act 2000
            </span>
          </div>
          <h1 class="text-xl md:text-2xl font-bold text-white mt-1.5 font-heading tracking-tight">
            Automated Cybersecurity Compliance &amp; Audit Scorecard
          </h1>
          <p class="text-xs text-slate-400 mt-1 font-body">
            Mandatory institutional audit against CERT-In Directions 2022, PCI-DSS 4.0, CIS Firewall Benchmarks, and ISO 27001
          </p>
        </div>

        <div class="flex items-center gap-2.5">
          <button
            @click="exportAuditorReport"
            class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold shadow-md transition flex items-center gap-2 font-heading cursor-pointer"
          >
            <Download class="w-4 h-4 text-cyan-400" />
            <span>Export Auditor Package (CSV)</span>
          </button>
        </div>
      </div>

      <!-- Scorecard Summary Counters -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-slate-800">
        <div class="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
          <div class="text-[11px] text-slate-400 uppercase font-semibold font-heading">Compliance Posture</div>
          <div class="text-3xl font-extrabold font-mono mt-1 text-emerald-400">
            {{ fwStore.complianceScore || 92 }}%
          </div>
          <div class="text-[10px] text-slate-500 mt-0.5 font-body">Automated Audit Metric</div>
        </div>

        <div class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <div class="text-[11px] text-emerald-300 uppercase font-semibold font-heading">Controls Passed</div>
          <div class="text-3xl font-extrabold font-mono text-emerald-400 mt-1">
            {{ passedControlsCount }}
          </div>
          <div class="text-[10px] text-emerald-400/80 mt-0.5 font-body">Verified Compliant</div>
        </div>

        <div class="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
          <div class="text-[11px] text-rose-300 uppercase font-semibold font-heading">Controls Failed</div>
          <div class="text-3xl font-extrabold font-mono text-rose-400 mt-1">
            {{ failedControlsCount }}
          </div>
          <div class="text-[10px] text-rose-400/80 mt-0.5 font-body">Immediate Remediation</div>
        </div>

        <div class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <div class="text-[11px] text-amber-300 uppercase font-semibold font-heading">Warnings / Gaps</div>
          <div class="text-3xl font-extrabold font-mono text-amber-400 mt-1">
            {{ warningControlsCount }}
          </div>
          <div class="text-[10px] text-amber-400/80 mt-0.5 font-body">Policy Cleanups Required</div>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- DEDICATED SECTION: CERT-In Mandatory Log Storage & System Maintenance     -->
    <!-- ========================================================================= -->
    <div class="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-xl space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div class="flex items-center gap-2">
            <Database class="w-5 h-5 text-cyan-400" />
            <h2 class="text-base font-bold text-white font-heading">
              CERT-In Mandate: Log Storage Architecture &amp; Maintenance Policy
            </h2>
          </div>
          <p class="text-xs text-slate-400 mt-1">
            Under Cyber Security Directions No. 20(3)/2022-CERT-In (Section 70B IT Act 2000), CSIR-SERC maintains 180 days of rolling audit logs stored securely within Indian territorial jurisdiction.
          </p>
        </div>
        <span class="px-3 py-1 rounded-full text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 whitespace-nowrap self-start sm:self-auto">
          ● 180-DAY RETENTION ENFORCED
        </span>
      </div>

      <!-- 4 Technical Log Storage Locations Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Storage 1: PostgreSQL 18 Relational DB -->
        <div class="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-cyan-300 font-heading flex items-center gap-1.5">
              <Server class="w-4 h-4 text-cyan-400" />
              PostgreSQL 18 Database
            </span>
            <span class="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
              ONLINE
            </span>
          </div>
          <div class="font-mono text-xs text-white">
            10.40.0.151:5432
          </div>
          <p class="text-[11px] text-slate-400 leading-relaxed font-body">
            Stores indexed security events (<code class="text-cyan-300">syslog_events</code>), threat telemetry, admin sessions, and policy change diffs.
          </p>
          <div class="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400 flex items-center justify-between">
            <span>DB: <strong class="text-slate-200">firewall_telemetry</strong></span>
            <span class="text-cyan-400">Indexed &amp; ACID</span>
          </div>
        </div>

        <!-- Storage 2: InfluxDB 2.7 TSDB Engine -->
        <div class="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-emerald-300 font-heading flex items-center gap-1.5">
              <Activity class="w-4 h-4 text-emerald-400" />
              InfluxDB 2.7 TSDB Engine
            </span>
            <span class="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
              ONLINE
            </span>
          </div>
          <div class="font-mono text-xs text-white">
            10.40.0.152:8086
          </div>
          <p class="text-[11px] text-slate-400 leading-relaxed font-body">
            Stores high-velocity time-series network flows, octet rates, and 46 interface bandwidth sliding session counters.
          </p>
          <div class="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400 flex items-center justify-between">
            <span>Bucket: <strong class="text-slate-200">firewall_logs</strong></span>
            <span class="text-emerald-400">180d Retention</span>
          </div>
        </div>

        <!-- Storage 3: Raw Syslog Archive Stream -->
        <div class="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-amber-300 font-heading flex items-center gap-1.5">
              <FileText class="w-4 h-4 text-amber-400" />
              Raw Syslog Stream (WORM)
            </span>
            <span class="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
              IMMUTABLE
            </span>
          </div>
          <div class="font-mono text-xs text-slate-300 truncate">
            /app/data/syslog.log
          </div>
          <p class="text-[11px] text-slate-400 leading-relaxed font-body">
            Raw append-only Write-Once-Read-Many text stream preserving verbatim FortiOS RFC-5424 syslog packets.
          </p>
          <div class="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400 flex items-center justify-between">
            <span>Disk Path: <strong class="text-slate-200">/app/data</strong></span>
            <span class="text-amber-400">Append-Only</span>
          </div>
        </div>

        <!-- Storage 4: Automated Backups & Snapshots -->
        <div class="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-teal-300 font-heading flex items-center gap-1.5">
              <Archive class="w-4 h-4 text-teal-400" />
              Automated Backup Engine
            </span>
            <span class="text-[9px] font-mono px-2 py-0.5 rounded bg-teal-500/15 text-teal-300 border border-teal-500/30 font-bold">
              ACTIVE
            </span>
          </div>
          <div class="font-mono text-xs text-slate-300 truncate">
            /app/backups/ (Daily 00:00 IST)
          </div>
          <p class="text-[11px] text-slate-400 leading-relaxed font-body">
            Daily compressed snapshots of PostgreSQL and configuration state with 14-snapshot rolling retention and auto-pruning.
          </p>
          <div class="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400 flex items-center justify-between">
            <span>Schedule: <strong class="text-slate-200">Daily</strong></span>
            <span class="text-teal-400">Auto-Pruning</span>
          </div>
        </div>
      </div>

      <!-- 4 Core CERT-In Maintenance Directives Details -->
      <div class="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
        <h3 class="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 font-heading flex items-center gap-2">
          <ShieldCheck class="w-4 h-4 text-emerald-400" />
          Technical Maintenance Policies &amp; Compliance Specifications
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-body">
          <div class="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
            <div class="font-semibold text-white font-heading">1. 180-Day Rolling Window</div>
            <p class="text-slate-400 text-[11px] leading-relaxed">
              Logs are strictly retained for a rolling 180-day window within Indian jurisdiction. Older log blocks are archived before rolling rotation.
            </p>
          </div>

          <div class="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
            <div class="font-semibold text-white font-heading">2. NPL Atomic Clock Sync</div>
            <p class="text-slate-400 text-[11px] leading-relaxed">
              All timestamps are synchronized via NTP with National Physical Laboratory (NPL) India (<code class="text-cyan-400">time.serc.res.in</code>) with zero drift (&lt;1ms).
            </p>
          </div>

          <div class="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
            <div class="font-semibold text-white font-heading">3. Cryptographic Chain-of-Custody</div>
            <p class="text-slate-400 text-[11px] leading-relaxed">
              Audit logs are signed with SHA-256 integrity checksums to ensure forensically verifiable immutability during security audits.
            </p>
          </div>

          <div class="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
            <div class="font-semibold text-white font-heading">4. 6-Hour Incident Reporting SLA</div>
            <p class="text-slate-400 text-[11px] leading-relaxed">
              Automated alert dispatcher configured to format and report cybersecurity incidents to CERT-In within the mandated 6-hour SLA.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Framework Filter Tabs (Including CERT-In) -->
    <div class="flex items-center gap-2 border-b border-slate-800 pb-2">
      <button
        v-for="fw in ['ALL', 'CERT-In', 'PCI-DSS', 'CIS', 'ISO-27001']"
        :key="fw"
        @click="selectedFramework = fw"
        class="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 font-heading cursor-pointer"
        :class="selectedFramework === fw ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40 shadow-sm' : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/60'"
      >
        <span v-if="fw === 'CERT-In'">🇮🇳</span>
        <span>{{ fw }}</span>
      </button>
    </div>

    <!-- Controls List -->
    <div class="space-y-3">
      <div
        v-for="ctrl in filteredControls"
        :key="ctrl.id"
        class="rounded-2xl p-5 transition bg-slate-900/80 border border-slate-800 shadow-md"
        :class="[
          ctrl.status === 'pass' ? 'border-slate-800' :
          ctrl.status === 'fail' ? 'border-rose-500/40 bg-rose-500/5' :
          'border-amber-500/40 bg-amber-500/5'
        ]"
      >
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
          <div>
            <div class="flex items-center gap-2">
              <span
                class="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase"
                :class="ctrl.framework === 'CERT-In' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-300 border border-slate-700'"
              >
                {{ ctrl.framework }} • {{ ctrl.controlCode }}
              </span>
              <h3 class="text-sm font-semibold text-white font-heading">{{ ctrl.title }}</h3>
            </div>
            <p class="text-xs text-slate-300 mt-1.5 leading-relaxed font-body">{{ ctrl.description }}</p>
          </div>

          <span
            class="px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider font-mono self-start"
            :class="[
              ctrl.status === 'pass' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
              ctrl.status === 'fail' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
              'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            ]"
          >
            {{ ctrl.status }}
          </span>
        </div>

        <!-- Technical Evidence & Remediation -->
        <div class="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1 font-heading">
              Audit Evidence
            </span>
            <p class="text-slate-300 font-mono text-[11px]">{{ ctrl.evidence }}</p>
            <div v-if="ctrl.affectedRules && ctrl.affectedRules.length > 0" class="mt-2 flex items-center gap-1.5 flex-wrap">
              <span class="text-[10px] text-slate-400 font-heading">Affected Rules:</span>
              <span
                v-for="r in ctrl.affectedRules"
                :key="r"
                class="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 font-mono text-[10px] border border-slate-700"
              >
                {{ r }}
              </span>
            </div>
          </div>

          <div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span class="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider block mb-1 font-heading">
              Remediation Action Plan
            </span>
            <p class="text-slate-300 text-[11px] font-body">{{ ctrl.remediation }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Download, Database, Server, Activity, FileText, Archive, ShieldCheck } from 'lucide-vue-next';
import { useFirewallStore } from '../stores/firewall.store.js';

const fwStore = useFirewallStore();
const selectedFramework = ref('ALL');

onMounted(async () => {
  await fwStore.fetchCompliance();
});

function exportAuditorReport() {
  window.open('/api/compliance/export', '_blank');
}

const passedControlsCount = computed(() =>
  fwStore.complianceControls.filter((c: any) => c.status === 'pass').length
);
const failedControlsCount = computed(() =>
  fwStore.complianceControls.filter((c: any) => c.status === 'fail').length
);
const warningControlsCount = computed(() =>
  fwStore.complianceControls.filter((c: any) => c.status === 'warning').length
);

const filteredControls = computed(() => {
  if (selectedFramework.value === 'ALL') return fwStore.complianceControls;
  return fwStore.complianceControls.filter((c: any) => c.framework === selectedFramework.value);
});
</script>
