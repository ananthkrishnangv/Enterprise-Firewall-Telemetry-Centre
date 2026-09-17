<template>
  <div class="space-y-6">
    <!-- Compliance Health Header & Scorecard -->
    <div class="ux4g-glass rounded-2xl p-5 border-violet-800/40">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-neon-amber uppercase tracking-wider font-mono">
              [GOVT OF INDIA AUDIT DIRECTIVE]
            </span>
          </div>
          <h2 class="text-sm font-bold text-white mt-1">Automated Cybersecurity Compliance & Audit Scorecard</h2>
          <p class="text-xs text-violet-300/80">
            Mandatory posture audit against CERT-In Directions 2022, PCI-DSS 4.0, CIS Firewall Benchmarks, and ISO 27001
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            class="px-3.5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/30 transition flex items-center gap-2"
          >
            <Download class="w-3.5 h-3.5" />
            <span>Export Auditor Package (PDF/CSV)</span>
          </button>
        </div>
      </div>

      <!-- Scorecard Summary Counters -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-violet-800/40">
        <div class="p-4 rounded-xl bg-violet-950/60 border border-violet-800/40">
          <div class="text-[11px] text-violet-300 uppercase font-medium">Compliance Posture</div>
          <div class="text-2xl font-black font-mono mt-1 text-emerald-400">
            {{ fwStore.complianceScore }}%
          </div>
          <div class="text-[10px] text-violet-400 mt-0.5">Automated Score</div>
        </div>

        <div class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
          <div class="text-[11px] text-emerald-300 uppercase font-medium">Controls Passed</div>
          <div class="text-2xl font-black font-mono text-emerald-400 mt-1">
            {{ passedControlsCount }}
          </div>
          <div class="text-[10px] text-emerald-400/80 mt-0.5">Verified Compliant</div>
        </div>

        <div class="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25">
          <div class="text-[11px] text-rose-300 uppercase font-medium">Controls Failed</div>
          <div class="text-2xl font-black font-mono text-rose-400 mt-1">
            {{ failedControlsCount }}
          </div>
          <div class="text-[10px] text-rose-400/80 mt-0.5">Immediate Remediation</div>
        </div>

        <div class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25">
          <div class="text-[11px] text-amber-300 uppercase font-medium">Warnings / Gaps</div>
          <div class="text-2xl font-black font-mono text-amber-400 mt-1">
            {{ warningControlsCount }}
          </div>
          <div class="text-[10px] text-amber-400/80 mt-0.5">Policy Cleanups</div>
        </div>
      </div>
    </div>

    <!-- Framework Filter Tabs (Including CERT-In) -->
    <div class="flex items-center gap-2 border-b border-violet-800/40 pb-2">
      <button
        v-for="fw in ['ALL', 'CERT-In', 'PCI-DSS', 'CIS', 'ISO-27001']"
        :key="fw"
        @click="selectedFramework = fw"
        class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
        :class="selectedFramework === fw ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow' : 'bg-violet-900/40 text-violet-300 hover:text-white'"
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
        class="ux4g-glass rounded-2xl p-5 transition"
        :class="[
          ctrl.status === 'pass' ? 'border-violet-800/40' :
          ctrl.status === 'fail' ? 'border-rose-500/40 bg-rose-500/5' :
          'border-amber-500/40 bg-amber-500/5'
        ]"
      >
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
          <div>
            <div class="flex items-center gap-2">
              <span
                class="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase"
                :class="ctrl.framework === 'CERT-In' ? 'bg-amber-500/20 text-neon-amber border border-amber-500/30' : 'bg-violet-800/60 text-violet-300'"
              >
                {{ ctrl.framework }} • {{ ctrl.controlCode }}
              </span>
              <h3 class="text-xs font-bold text-white">{{ ctrl.title }}</h3>
            </div>
            <p class="text-xs text-violet-200 mt-1.5 leading-relaxed">{{ ctrl.description }}</p>
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
        <div class="mt-4 pt-3 border-t border-violet-800/40 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div class="p-3 rounded-xl bg-violet-950/60 border border-violet-800/40">
            <span class="text-[11px] font-bold text-violet-400 uppercase tracking-wider block mb-1">
              Audit Evidence
            </span>
            <p class="text-slate-300 font-mono text-[11px]">{{ ctrl.evidence }}</p>
            <div v-if="ctrl.affectedRules.length > 0" class="mt-2 flex items-center gap-1.5">
              <span class="text-[10px] text-violet-400">Affected Rules:</span>
              <span
                v-for="r in ctrl.affectedRules"
                :key="r"
                class="px-1.5 py-0.2 rounded bg-violet-900/80 text-violet-200 font-mono text-[10px]"
              >
                {{ r }}
              </span>
            </div>
          </div>

          <div class="p-3 rounded-xl bg-violet-900/30 border border-violet-700/40">
            <span class="text-[11px] font-bold text-neon-cyan uppercase tracking-wider block mb-1">
              Remediation Action Plan
            </span>
            <p class="text-violet-200 text-[11px]">{{ ctrl.remediation }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Download } from 'lucide-vue-next';
import { useFirewallStore } from '../stores/firewall.store.js';

const fwStore = useFirewallStore();
const selectedFramework = ref('ALL');

onMounted(async () => {
  await fwStore.fetchCompliance();
});

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
