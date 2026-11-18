<template>
  <div v-if="isLoginPage" class="h-screen w-screen overflow-hidden">
    <RouterView />
  </div>

  <div v-else class="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
    <!-- Sidebar Navigation -->
    <Sidebar />

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <HeaderBar />

      <main class="flex-1 overflow-y-auto p-6 bg-slate-950/90 flex flex-col justify-between">
        <div class="flex-1">
          <RouterView />
        </div>

        <!-- Institutional Footer Matching Clean Dark Cockpit NOC Theme -->
        <footer class="mt-8 pt-4 pb-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400/80 flex-shrink-0">
          <div class="flex flex-wrap items-center gap-2">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700/60 text-[11px] font-medium text-slate-300">
              Made by ICTD CSIR-SERC for CSIR with ❤️
            </span>
            <span class="text-slate-600 hidden sm:inline">•</span>
            <span class="text-[11px] font-mono text-slate-400/70 hidden sm:inline">
              CSIR-SERC Free Community &amp; Institutional License v1.0
            </span>
          </div>
          <div class="flex items-center gap-3 text-[11px] font-mono">
            <span class="text-emerald-400 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Universal Free &amp; Community Edition
            </span>
            <span class="text-slate-700">|</span>
            <RouterLink to="/settings" class="hover:text-cyan-300 transition text-slate-400">
              License &amp; Terms
            </RouterLink>
          </div>
        </footer>
      </main>
    </div>
  </div>

  <!-- Global Slide-Over Security Alert Center -->
  <AlertCenterDrawer />

  <!-- Global Log & Database Storage Registry Modal -->
  <StorageLocationsModal />
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import Sidebar from './components/Sidebar.vue';
import HeaderBar from './components/HeaderBar.vue';
import AlertCenterDrawer from './components/AlertCenterDrawer.vue';
import StorageLocationsModal from './components/StorageLocationsModal.vue';
import { useTelemetryStore } from './stores/telemetry.store.js';
import { useFirewallStore } from './stores/firewall.store.js';
import { useAuthStore } from './stores/auth.store.js';

const route = useRoute();
const telemetry = useTelemetryStore();
const fwStore = useFirewallStore();
const authStore = useAuthStore();

const isLoginPage = computed(() => route.path === '/login');

onMounted(async () => {
  await authStore.checkAuth();
  if (authStore.isAuthenticated) {
    telemetry.initWebSocket();
    await Promise.all([
      telemetry.fetchSummary(),
      fwStore.fetchDevices(),
      telemetry.fetchAlerts(),
      telemetry.fetchStorageInfo()
    ]);
  }
});
</script>
