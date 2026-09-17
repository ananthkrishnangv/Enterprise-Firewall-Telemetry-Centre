<template>
  <div class="space-y-6">
    <!-- Header & Gateway Selector -->
    <div class="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-sm font-semibold text-white">Firewall Configuration Drift & Revision Diff Engine</h2>
          <p class="text-xs text-slate-400">Track unauthorized ACL modifications, drift from baseline, and change tickets</p>
        </div>

        <div class="flex items-center gap-3">
          <label class="text-xs font-medium text-slate-300">Gateway:</label>
          <select
            v-model="fwStore.selectedFirewallId"
            @change="loadConfigData"
            class="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500 font-medium"
          >
            <option v-for="dev in fwStore.devices" :key="dev.id" :value="dev.id">
              {{ dev.name }} ({{ dev.model }})
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Drift Risk & Version Summary -->
    <div v-if="fwStore.configDiff" class="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div class="flex items-center gap-3">
          <span
            class="px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider"
            :class="[
              fwStore.configDiff.riskRating === 'critical' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
              fwStore.configDiff.riskRating === 'high' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
              'bg-blue-500/20 text-blue-300 border border-blue-500/30'
            ]"
          >
            {{ fwStore.configDiff.riskRating }} RISK DRIFT
          </span>
          <span class="text-xs text-white font-medium">
            Comparing <span class="font-mono text-cyan-400">{{ fwStore.configDiff.previousVersion }}</span> → <span class="font-mono text-brand-400">{{ fwStore.configDiff.currentVersion }}</span>
          </span>
        </div>

        <div class="text-xs text-slate-400 font-mono">
          {{ fwStore.configDiff.summary }}
        </div>
      </div>

      <!-- Colorized Unified Diff Viewer -->
      <div>
        <div class="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Unified ACL Syntax Diff</span>
          <span>Green = Added | Red = Removed</span>
        </div>

        <div class="bg-slate-950 rounded-lg p-4 font-mono text-xs overflow-x-auto border border-slate-800 space-y-1">
          <div
            v-for="(change, idx) in fwStore.configDiff.changes"
            :key="idx"
            class="px-2 py-0.5 rounded flex items-start gap-3"
            :class="change.type === 'add' ? 'bg-emerald-500/10 text-emerald-300 border-l-2 border-emerald-500' : 'bg-rose-500/10 text-rose-300 border-l-2 border-rose-500'"
          >
            <span class="w-6 text-slate-500 select-none text-right">{{ change.line }}</span>
            <span class="font-bold select-none">{{ change.type === 'add' ? '+' : '-' }}</span>
            <span class="flex-1 whitespace-pre-wrap">{{ change.content }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-xs">
      No configuration drift detected. Current running config matches baseline snapshot.
    </div>

    <!-- Snapshot Revision History -->
    <div class="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <h3 class="text-sm font-semibold text-white mb-4">Configuration Snapshot History</h3>
      <div class="space-y-3">
        <div
          v-for="snap in fwStore.configSnapshots"
          :key="snap.id"
          class="flex items-center justify-between p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs"
        >
          <div class="flex items-center gap-3">
            <span class="font-mono text-brand-400 font-bold">{{ snap.version }}</span>
            <span class="text-slate-200">{{ snap.author }}</span>
            <span class="px-2 py-0.5 rounded text-[10px] uppercase font-mono bg-slate-800 text-slate-400">
              {{ snap.changeType }}
            </span>
            <span v-if="snap.ticketId" class="text-[11px] font-mono text-cyan-400">
              Ticket: {{ snap.ticketId }}
            </span>
          </div>
          <div class="flex items-center gap-3 font-mono text-slate-400 text-[11px]">
            <span>Hash: {{ snap.hash }}</span>
            <span>{{ new Date(snap.timestamp).toLocaleString() }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useFirewallStore } from '../stores/firewall.store.js';

const fwStore = useFirewallStore();

onMounted(async () => {
  if (!fwStore.devices.length) {
    await fwStore.fetchDevices();
  }
  if (fwStore.devices.length && !fwStore.devices.some((d: any) => d.id === fwStore.selectedFirewallId)) {
    fwStore.selectedFirewallId = fwStore.devices[0].id;
  }
  await loadConfigData();
});

async function loadConfigData() {
  if (fwStore.selectedFirewallId) {
    await fwStore.fetchConfig(fwStore.selectedFirewallId);
  }
}
</script>
