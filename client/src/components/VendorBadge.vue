<template>
  <span
    class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border"
    :class="badgeClass"
  >
    <span class="w-1.5 h-1.5 rounded-full" :class="dotClass"></span>
    <span>{{ label }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  vendor: 'checkpoint' | 'paloalto' | 'fortinet' | 'pfsense' | string;
}>();

const label = computed(() => {
  switch (props.vendor) {
    case 'checkpoint': return 'Check Point';
    case 'paloalto': return 'Palo Alto';
    case 'fortinet': return 'Fortinet';
    case 'pfsense': return 'pfSense';
    default: return props.vendor;
  }
});

const badgeClass = computed(() => {
  switch (props.vendor) {
    case 'checkpoint': return 'bg-pink-500/10 text-pink-300 border-pink-500/30';
    case 'paloalto': return 'bg-orange-500/10 text-orange-300 border-orange-500/30';
    case 'fortinet': return 'bg-red-500/10 text-red-300 border-red-500/30';
    case 'pfsense': return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';
    default: return 'bg-slate-800 text-slate-300 border-slate-700';
  }
});

const dotClass = computed(() => {
  switch (props.vendor) {
    case 'checkpoint': return 'bg-pink-400';
    case 'paloalto': return 'bg-orange-400';
    case 'fortinet': return 'bg-red-400';
    case 'pfsense': return 'bg-cyan-400';
    default: return 'bg-slate-400';
  }
});
</script>
