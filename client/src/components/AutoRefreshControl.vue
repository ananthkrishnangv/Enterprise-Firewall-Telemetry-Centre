<template>
  <div class="flex items-center gap-2 select-none text-xs font-mono">
    <!-- Auto-Refresh Toggle Button -->
    <button
      @click="toggleAutoRefresh"
      class="px-2.5 py-1.5 rounded-xl border flex items-center gap-2 transition"
      :class="[
        isEnabled
          ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 shadow-sm shadow-emerald-950/50'
          : 'bg-violet-900/40 border-violet-700/50 text-violet-400 hover:text-white'
      ]"
      :title="isEnabled ? 'Auto-Refresh Active' : 'Auto-Refresh Paused'"
    >
      <span
        class="w-2 h-2 rounded-full transition-all"
        :class="isEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'"
      ></span>
      <span class="font-bold text-[11px]">{{ isEnabled ? 'Auto-Refresh ON' : 'Auto-Refresh OFF' }}</span>
      <span v-if="isEnabled" class="text-[10px] text-emerald-400/80">({{ secondsLeft }}s)</span>
    </button>

    <!-- Interval Select Dropdown (Visible when enabled) -->
    <select
      v-if="isEnabled"
      v-model.number="intervalSec"
      @change="restartTimer"
      class="px-2 py-1.5 bg-violet-900/50 border border-violet-700/50 rounded-xl text-[11px] text-cyan-300 focus:outline-none focus:border-cyan-400 cursor-pointer font-bold"
      title="Auto-refresh interval"
    >
      <option :value="5">Every 5s</option>
      <option :value="10">Every 10s</option>
      <option :value="15">Every 15s</option>
      <option :value="30">Every 30s</option>
      <option :value="60">Every 60s</option>
    </select>

    <!-- Manual Refresh Now Button -->
    <button
      @click="triggerManualRefresh"
      :disabled="isRefreshing"
      class="p-1.5 rounded-xl bg-violet-900/50 hover:bg-violet-800 border border-violet-700/40 text-cyan-300 hover:text-white transition disabled:opacity-50"
      title="Refresh Telemetry Now"
    >
      <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': isRefreshing }" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { RefreshCw } from 'lucide-vue-next';

const props = withDefaults(
  defineProps<{
    storageKey?: string;
    defaultInterval?: number;
    defaultEnabled?: boolean;
  }>(),
  {
    storageKey: 'auto_refresh_default',
    defaultInterval: 10,
    defaultEnabled: true
  }
);

const emit = defineEmits<{
  (e: 'refresh'): void;
}>();

const isEnabled = ref(props.defaultEnabled);
const intervalSec = ref(props.defaultInterval);
const secondsLeft = ref(intervalSec.value);
const isRefreshing = ref(false);
let timer: any = null;

function loadPreferences() {
  try {
    const saved = localStorage.getItem(props.storageKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (typeof parsed.enabled === 'boolean') isEnabled.value = parsed.enabled;
      if (typeof parsed.interval === 'number') intervalSec.value = parsed.interval;
    }
  } catch {}
}

function savePreferences() {
  try {
    localStorage.setItem(
      props.storageKey,
      JSON.stringify({ enabled: isEnabled.value, interval: intervalSec.value })
    );
  } catch {}
}

function toggleAutoRefresh() {
  isEnabled.value = !isEnabled.value;
  savePreferences();
  if (isEnabled.value) {
    restartTimer();
  } else {
    stopTimer();
  }
}

function triggerManualRefresh() {
  isRefreshing.value = true;
  emit('refresh');
  setTimeout(() => {
    isRefreshing.value = false;
  }, 600);
  secondsLeft.value = intervalSec.value;
}

function restartTimer() {
  stopTimer();
  savePreferences();
  secondsLeft.value = intervalSec.value;
  if (!isEnabled.value) return;

  timer = setInterval(() => {
    if (secondsLeft.value > 1) {
      secondsLeft.value--;
    } else {
      secondsLeft.value = intervalSec.value;
      triggerManualRefresh();
    }
  }, 1000);
}

function stopTimer() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

onMounted(() => {
  loadPreferences();
  if (isEnabled.value) {
    restartTimer();
  }
});

onUnmounted(() => {
  stopTimer();
});
</script>
