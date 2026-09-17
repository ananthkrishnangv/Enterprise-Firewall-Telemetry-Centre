<template>
  <div class="space-y-6">
    <!-- Firewalls Header & Device Selector Tabs (if multiple devices configured) -->
    <div v-if="fwStore.devices.length > 1" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

    <!-- Live Comprehensive SNMP Telemetry Center -->
    <SnmpTelemetryCenter :device="activeDevice" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useFirewallStore, FirewallDevice } from '../stores/firewall.store.js';
import VendorBadge from '../components/VendorBadge.vue';
import SnmpTelemetryCenter from '../components/SnmpTelemetryCenter.vue';

const fwStore = useFirewallStore();
const selectedDevId = ref<string>('fw-fg-01');

const activeDevice = computed<FirewallDevice | null>(() => {
  if (fwStore.devices.length === 0) return null;
  return fwStore.devices.find((d: any) => d.id === selectedDevId.value) || fwStore.devices[0];
});

onMounted(() => {
  fwStore.fetchDevices();
});
</script>
