<template>
  <aside class="w-64 bg-violet-950/95 border-r border-violet-800/40 flex flex-col flex-shrink-0 z-10 select-none">
    <!-- Brand Identity conforming to UX4G Design Standards -->
    <div class="h-20 px-5 border-b border-violet-800/40 flex items-center gap-3 bg-violet-950">
      <!-- Dynamic Brand Logo -->
      <div class="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 bg-violet-900/60 border border-violet-700/50 shadow-lg shadow-violet-600/30">
        <img
          v-if="fwStore.branding.logoBase64"
          :src="fwStore.branding.logoBase64"
          class="w-full h-full object-contain p-1"
          alt="Logo"
        />
        <img
          v-else-if="fwStore.branding.logoUrl"
          :src="fwStore.branding.logoUrl"
          class="w-full h-full object-contain p-1"
          alt="Logo"
        />
        <div v-else-if="fwStore.branding.presetLogo === 'cyber'" class="w-full h-full bg-gradient-to-tr from-emerald-600 to-cyan-500 p-0.5 flex items-center justify-center">
          <div class="w-full h-full bg-violet-950 rounded-[8px] flex items-center justify-center">
            <Cpu class="w-5 h-5 text-emerald-400" />
          </div>
        </div>
        <div v-else-if="fwStore.branding.presetLogo === 'globe'" class="w-full h-full bg-gradient-to-tr from-blue-600 to-indigo-500 p-0.5 flex items-center justify-center">
          <div class="w-full h-full bg-violet-950 rounded-[8px] flex items-center justify-center">
            <Globe class="w-5 h-5 text-blue-300" />
          </div>
        </div>
        <div v-else-if="fwStore.branding.presetLogo === 'emblem'" class="w-full h-full rounded-xl bg-gradient-to-tr from-amber-500 to-violet-600 p-0.5 flex items-center justify-center">
          <div class="w-full h-full rounded-[8px] bg-violet-950 flex items-center justify-center">
            <span class="text-amber-400 font-bold text-sm">🇮🇳</span>
          </div>
        </div>
        <div v-else class="w-full h-full bg-gradient-to-tr from-violet-600 via-fuchsia-500 to-cyan-400 p-0.5 flex items-center justify-center">
          <div class="w-full h-full bg-violet-950 rounded-[8px] flex items-center justify-center">
            <Shield class="w-5 h-5 text-neon-cyan" />
          </div>
        </div>
      </div>
      <div>
        <div class="text-sm font-extrabold text-white tracking-wide font-sans">
          {{ fwStore.branding.orgName }}
        </div>
        <div class="text-[10px] text-violet-300/80 font-medium">{{ fwStore.branding.orgDivision }}</div>
      </div>
    </div>

    <!-- Connected Gateway Status Card (STRICTLY LIVE BASED ON SNMP) -->
    <div class="px-4 py-3 bg-violet-900/30 border-b border-violet-800/40">
      <div class="text-[10px] uppercase font-bold tracking-wider text-violet-400 mb-1.5 flex items-center justify-between">
        <span>Active Perimeter Gateway</span>
        <span v-if="fwStore.isFirewallLive" class="flex items-center gap-1 text-[10px] text-emerald-400 font-mono font-bold">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          ONLINE
        </span>
        <span v-else-if="fwStore.activeFirewall" class="flex items-center gap-1 text-[10px] text-rose-400 font-mono font-bold">
          <span class="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
          OFFLINE
        </span>
        <span v-else class="flex items-center gap-1 text-[10px] text-amber-400 font-mono font-bold">
          UNCONFIGURED
        </span>
      </div>

      <!-- Configured Device State -->
      <div v-if="fwStore.activeFirewall" class="p-2.5 rounded-xl bg-violet-950/70 border border-violet-700/50 space-y-1.5">
        <div class="flex items-center justify-between font-mono text-xs">
          <span class="font-bold text-white flex items-center gap-1.5 truncate">
            <Shield class="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
            <span class="truncate">{{ fwStore.activeFirewall.name || fwStore.activeFirewall.model }}</span>
          </span>
          <span class="text-emerald-400 font-bold ml-1 flex-shrink-0">{{ fwStore.activeFirewall.ipAddress }}</span>
        </div>

        <!-- Live Interfaces list if available -->
        <div
          v-if="fwStore.activeFirewall.snmpMetrics?.interfaces && fwStore.activeFirewall.snmpMetrics.interfaces.length > 0"
          class="grid grid-cols-3 gap-1 pt-1.5 border-t border-violet-800/40 text-[9px] font-mono"
        >
          <div
            v-for="(iface, i) in fwStore.activeFirewall.snmpMetrics.interfaces.slice(0, 3)"
            :key="iface.name"
            class="text-center px-1 py-0.5 rounded truncate"
            :class="[
              iface.operStatus === 'up'
                ? (i === 0 ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' :
                   i === 1 ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20' :
                   'bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/20')
                : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
            ]"
            :title="`${iface.name} - ${iface.operStatus.toUpperCase()}`"
          >
            {{ iface.name }}
          </div>
        </div>
        <div v-else class="pt-1.5 border-t border-violet-800/40 text-[10px] text-violet-400 font-mono text-center">
          {{ fwStore.isFirewallLive ? 'Telemetry Synced' : 'SNMP Polling Active...' }}
        </div>
      </div>

      <!-- No Firewall Configured State -->
      <div v-else class="p-2.5 rounded-xl bg-violet-950/70 border border-dashed border-violet-700/50 text-center space-y-1">
        <div class="text-xs text-amber-300 font-medium">No Live Gateway</div>
        <RouterLink to="/settings" class="inline-block text-[10px] text-cyan-400 hover:underline">
          Configure SNMP &gt;
        </RouterLink>
      </div>
    </div>

    <!-- Navigation Menu -->
    <nav class="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
      <RouterLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group relative"
        :class="[
          $route.path === item.path
            ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white shadow-lg shadow-violet-600/30 border border-violet-400/30'
            : 'text-violet-200/80 hover:bg-violet-900/50 hover:text-white border border-transparent'
        ]"
      >
        <component
          :is="item.icon"
          class="w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110"
          :class="$route.path === item.path ? 'text-neon-cyan' : 'text-violet-400'"
        />
        <span class="flex-1 truncate">{{ item.name }}</span>
        <span
          v-if="item.badge && item.badge > 0"
          class="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
          :class="$route.path === item.path ? 'bg-white/20 text-white' : 'bg-rose-500 text-white'"
        >
          {{ item.badge }}
        </span>
      </RouterLink>
    </nav>

    <!-- User Profile & Session Strip -->
    <div v-if="authStore.user" class="p-3 border-t border-violet-800/40 bg-violet-950/80">
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2 min-w-0">
          <div
            class="w-7 h-7 rounded-lg p-0.5 flex-shrink-0"
            :class="authStore.user.role === 'super_admin' ? 'bg-gradient-to-tr from-amber-500 via-fuchsia-500 to-cyan-400' : 'bg-gradient-to-tr from-violet-600 to-cyan-500'"
          >
            <div class="w-full h-full bg-violet-950 rounded-[6px] flex items-center justify-center text-[10px] font-bold text-white">
              {{ authStore.user.role === 'super_admin' ? 'SA' : (authStore.user.username === 'admin' ? 'CI' : 'AU') }}
            </div>
          </div>
          <div class="min-w-0">
            <div class="text-xs font-bold text-white truncate font-sans flex items-center gap-1">
              <span>{{ authStore.user.name }}</span>
            </div>
            <div
              class="text-[10px] font-mono font-bold uppercase truncate"
              :class="authStore.user.role === 'super_admin' ? 'text-amber-300' : 'text-cyan-300'"
            >
              {{
                authStore.user.role === 'super_admin' ? 'Super Admin' :
                authStore.user.role === 'admin' ? 'CISO Admin' :
                authStore.user.role === 'operator' ? 'Network Operator' : 'CERT-In Auditor'
              }}
            </div>
          </div>
        </div>

        <button
          @click="handleLogout"
          class="p-1.5 rounded-lg bg-violet-900/50 hover:bg-rose-500/20 text-violet-400 hover:text-rose-400 transition flex-shrink-0"
          title="Sign Out"
        >
          <LogOut class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <!-- Bottom Telemetry Ingest & Port Info -->
    <div class="p-3 border-t border-violet-800/40 bg-violet-900/30">
      <div class="flex items-center justify-between text-xs mb-1.5">
        <span class="text-violet-400 font-medium">Live Telemetry Ingest</span>
        <span class="inline-flex items-center gap-1 text-[11px] font-bold" :class="telemetry.isConnected ? 'text-emerald-400' : 'text-amber-400'">
          <span class="w-1.5 h-1.5 rounded-full" :class="telemetry.isConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'"></span>
          {{ telemetry.isConnected ? 'Connected' : 'Reconnecting' }}
        </span>
      </div>
      <div class="text-[10px] text-violet-400 font-mono flex items-center justify-between">
        <span>Syslog: UDP 1514</span>
        <span>Flow: UDP 2055</span>
      </div>
    </div>
  </aside>

</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  LayoutDashboard,
  Activity,
  Layers,
  Server,
  GitCompare,
  Terminal,
  FileCheck2,
  Users,
  Settings,
  LogOut,
  Shield,
  Cpu,
  Globe
} from 'lucide-vue-next';
import { useTelemetryStore } from '../stores/telemetry.store.js';
import { useAuthStore } from '../stores/auth.store.js';
import { useFirewallStore } from '../stores/firewall.store.js';

const route = useRoute();
const router = useRouter();
const telemetry = useTelemetryStore();
const authStore = useAuthStore();
const fwStore = useFirewallStore();

interface NavItem {
  name: string;
  path: string;
  icon: any;
  badge?: number;
}

const navItems = computed<NavItem[]>(() => [
  { name: 'Dashboard Overview', path: '/', icon: LayoutDashboard },
  { name: 'Traffic & Flow Navigator', path: '/traffic', icon: Activity },
  { name: 'Policy & Shadow Analysis', path: '/policies', icon: Layers },
  { name: 'Firewalls & SNMP Probes', path: '/devices', icon: Server },
  { name: 'Config Drift & Diffs', path: '/config-diff', icon: GitCompare },
  { name: 'Live Syslog Tail', path: '/logs', icon: Terminal },
  { name: 'Compliance Audit (CERT-In)', path: '/compliance', icon: FileCheck2 },
  { name: 'User Management & Access', path: '/users', icon: Users },
  { name: 'Enterprise Settings', path: '/settings', icon: Settings },
]);

function handleLogout() {
  authStore.logout();
  router.push('/login');
}
</script>
