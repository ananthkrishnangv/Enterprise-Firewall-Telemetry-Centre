<template>
  <div class="space-y-6">
    <!-- Firewall Selector & Policy Intelligence Header -->
    <div class="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-sm font-semibold text-white">Canonical Rule-IR & Policy Conflict Engine</h2>
          <p class="text-xs text-slate-400">Interval-tree multidimensional conflict and shadow detection</p>
        </div>

        <div class="flex items-center gap-3">
          <label class="text-xs font-medium text-slate-300">Select Gateway:</label>
          <select
            v-model="fwStore.selectedFirewallId"
            @change="loadPolicyData"
            class="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500 font-medium"
          >
            <option v-for="dev in fwStore.devices" :key="dev.id" :value="dev.id">
              {{ dev.name }} ({{ dev.model }})
            </option>
          </select>

          <AutoRefreshControl
            storageKey="auto_refresh_policies"
            :defaultInterval="15"
            :defaultEnabled="true"
            @refresh="loadPolicyData"
          />
        </div>
      </div>

      <!-- Policy Risk Metrics Row -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-slate-800">
        <div class="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
          <div class="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Total Rules</div>
          <div class="text-xl font-bold text-white font-mono mt-1">
            {{ fwStore.policyReport?.totalRules || fwStore.rules.length }}
          </div>
        </div>

        <div class="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
          <div class="text-[11px] text-rose-300 font-medium uppercase tracking-wider">Any/Any Rules</div>
          <div class="text-xl font-bold text-rose-400 font-mono mt-1">
            {{ fwStore.policyReport?.anyAnyRulesCount || 0 }}
          </div>
        </div>

        <div class="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <div class="text-[11px] text-amber-300 font-medium uppercase tracking-wider">Shadowed Rules</div>
          <div class="text-xl font-bold text-amber-400 font-mono mt-1">
            {{ fwStore.policyReport?.shadowedRulesCount || 0 }}
          </div>
        </div>

        <div class="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <div class="text-[11px] text-blue-300 font-medium uppercase tracking-wider">Redundant Rules</div>
          <div class="text-xl font-bold text-blue-400 font-mono mt-1">
            {{ fwStore.policyReport?.redundantRulesCount || 0 }}
          </div>
        </div>
      </div>
    </div>

    <!-- Active Policy Findings / Risk Cards -->
    <div v-if="fwStore.policyReport?.findings && fwStore.policyReport.findings.length > 0" class="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div class="flex items-center gap-2 mb-4">
        <AlertTriangle class="w-4 h-4 text-amber-400" />
        <h3 class="text-sm font-semibold text-white">Automated Policy Conflict & Security Findings</h3>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div
          v-for="find in fwStore.policyReport.findings"
          :key="find.id"
          class="p-3.5 rounded-lg border text-xs space-y-1.5"
          :class="find.severity === 'critical' ? 'bg-rose-500/10 border-rose-500/30' : 'bg-slate-800/60 border-slate-700/60'"
        >
          <div class="flex items-center justify-between">
            <span class="font-bold text-white uppercase font-mono text-[11px] tracking-wide">
              [{{ find.type }}]
            </span>
            <span
              class="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase"
              :class="find.severity === 'critical' ? 'bg-rose-500 text-white' : 'bg-amber-500/20 text-amber-300'"
            >
              {{ find.severity }}
            </span>
          </div>
          <p class="text-slate-200">{{ find.message }}</p>
          <div class="text-[11px] text-brand-400 bg-brand-500/10 p-2 rounded border border-brand-500/20 mt-1">
            <span class="font-semibold text-slate-300">Remediation:</span> {{ find.remediation }}
          </div>
        </div>
      </div>
    </div>

    <!-- Canonical Rulebase Table -->
    <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div class="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h3 class="text-sm font-semibold text-white">Active Rulebase & Match Hierarchy</h3>
          <p class="text-xs text-slate-400">Ordered execution precedence with interval-tree status</p>
        </div>
        <span class="text-xs text-slate-400 font-mono">{{ fwStore.rules.length }} Total Rules</span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-slate-950/60 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
              <th class="py-3 px-4 w-12 text-center">Pos</th>
              <th class="py-3 px-4">Rule Name</th>
              <th class="py-3 px-4">Source Match</th>
              <th class="py-3 px-4">Destination Match</th>
              <th class="py-3 px-4">Service / Port</th>
              <th class="py-3 px-4">Action</th>
              <th class="py-3 px-4">Conflict / Status</th>
              <th class="py-3 px-4 text-right">Hits</th>
              <th class="py-3 px-4 text-center">Risk</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60 font-mono">
            <tr
              v-for="rule in fwStore.rules"
              :key="rule.id"
              class="hover:bg-slate-800/40 transition"
              :class="{
                'bg-rose-500/5': rule.isAnyAny,
                'bg-amber-500/5': rule.isShadowed,
                'opacity-70': !rule.enabled
              }"
            >
              <td class="py-3 px-4 text-center text-slate-400 font-bold">
                {{ rule.position }}
              </td>
              <td class="py-3 px-4 font-sans">
                <div class="text-slate-200 font-medium">{{ rule.name }}</div>
                <div class="text-[10px] text-slate-500 font-mono">ID: {{ rule.nativeRuleId }}</div>
              </td>
              <td class="py-3 px-4">
                <div class="text-slate-200">{{ rule.sourceCidrs.join(', ') }}</div>
                <div class="text-[10px] text-slate-500 font-sans">Zone: {{ rule.sourceZones.join(', ') }}</div>
              </td>
              <td class="py-3 px-4">
                <div class="text-slate-200">{{ rule.destCidrs.join(', ') }}</div>
                <div class="text-[10px] text-slate-500 font-sans">Zone: {{ rule.destZones.join(', ') }}</div>
              </td>
              <td class="py-3 px-4">
                <div class="text-slate-200">{{ rule.destPorts.join(', ') }}</div>
                <div class="text-[10px] text-slate-500 font-sans">{{ rule.protocols.join(', ') }}</div>
              </td>
              <td class="py-3 px-4 font-sans">
                <span
                  class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                  :class="rule.action === 'allow' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'"
                >
                  {{ rule.action }}
                </span>
              </td>
              <td class="py-3 px-4 font-sans">
                <div class="flex flex-wrap gap-1">
                  <span
                    v-if="rule.isAnyAny"
                    class="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  >
                    ANY/ANY
                  </span>
                  <span
                    v-if="rule.isShadowed"
                    class="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    :title="`Shadowed by ${rule.shadowedByRuleName}`"
                  >
                    SHADOWED
                  </span>
                  <span
                    v-if="rule.isRedundant"
                    class="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30"
                  >
                    REDUNDANT
                  </span>
                  <span
                    v-if="!rule.logging"
                    class="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  >
                    NO LOGGING
                  </span>
                  <span
                    v-if="!rule.isAnyAny && !rule.isShadowed && !rule.isRedundant && rule.logging"
                    class="text-[10px] text-slate-500"
                  >
                    Clean
                  </span>
                </div>
              </td>
              <td class="py-3 px-4 text-right text-slate-300">
                {{ rule.hitCount.toLocaleString() }}
              </td>
              <td class="py-3 px-4 text-center font-sans">
                <span
                  class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                  :class="[
                    rule.riskScore >= 70 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                    rule.riskScore >= 30 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  ]"
                >
                  {{ rule.riskScore }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { AlertTriangle } from 'lucide-vue-next';
import AutoRefreshControl from '../components/AutoRefreshControl.vue';
import { useFirewallStore } from '../stores/firewall.store.js';

const fwStore = useFirewallStore();

onMounted(async () => {
  if (!fwStore.devices.length) {
    await fwStore.fetchDevices();
  }
  if (fwStore.devices.length && !fwStore.devices.some((d: any) => d.id === fwStore.selectedFirewallId)) {
    fwStore.selectedFirewallId = fwStore.devices[0].id;
  }
  await loadPolicyData();
});

async function loadPolicyData() {
  if (fwStore.selectedFirewallId) {
    await fwStore.fetchRules(fwStore.selectedFirewallId);
  }
}
</script>
