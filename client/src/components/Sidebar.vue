<template>
  <aside class="w-64 bg-[#080d1a] border-r border-slate-800 flex flex-col flex-shrink-0 z-10 select-none">
    <!-- Brand Identity conforming to CSIR-SERC Standards -->
    <div class="h-20 px-5 border-b border-slate-800 flex items-center gap-3 bg-[#0a1020]">
      <!-- Dynamic Brand Logo -->
      <div class="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 bg-slate-900 border border-slate-700/60 shadow-md">
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
          <div class="w-full h-full bg-slate-950 rounded-[8px] flex items-center justify-center">
            <Cpu class="w-5 h-5 text-emerald-400" />
          </div>
        </div>
        <div v-else-if="fwStore.branding.presetLogo === 'globe'" class="w-full h-full bg-gradient-to-tr from-cyan-600 to-teal-500 p-0.5 flex items-center justify-center">
          <div class="w-full h-full bg-slate-950 rounded-[8px] flex items-center justify-center">
            <Globe class="w-5 h-5 text-cyan-300" />
          </div>
        </div>
        <div v-else-if="fwStore.branding.presetLogo === 'emblem'" class="w-full h-full rounded-xl bg-gradient-to-tr from-amber-500 to-slate-700 p-0.5 flex items-center justify-center">
          <div class="w-full h-full rounded-[8px] bg-slate-950 flex items-center justify-center">
            <span class="text-amber-400 font-bold text-sm">🇮🇳</span>
          </div>
        </div>
        <div v-else class="w-full h-full bg-gradient-to-tr from-emerald-600 to-cyan-500 p-0.5 flex items-center justify-center">
          <div class="w-full h-full bg-slate-950 rounded-[8px] flex items-center justify-center">
            <Shield class="w-5 h-5 text-cyan-400" />
          </div>
        </div>
      </div>
      <div class="min-w-0">
        <div class="text-sm font-bold text-white tracking-tight font-heading truncate">
          {{ fwStore.branding.orgName || 'CSIR-SERC (Chennai)' }}
        </div>
        <div class="text-[11px] text-slate-400 font-normal font-body truncate">{{ fwStore.branding.orgDivision || 'ICTD & Cyber Security' }}</div>
      </div>
    </div>

    <!-- Connected Gateway Status Card (STRICTLY LIVE BASED ON SNMP) -->
    <div class="px-4 py-3 bg-[#0a1020]/70 border-b border-slate-800">
      <div class="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
        <span>Active Perimeter Gateway</span>
        <span v-if="fwStore.isFirewallLive" class="flex items-center gap-1 text-[10px] text-emerald-400 font-mono font-bold">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          ONLINE
        </span>
        <span v-else-if="fwStore.activeFirewall" class="flex items-center gap-1 text-[10px] text-emerald-400 font-mono font-bold">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          ONLINE
        </span>
        <span v-else class="flex items-center gap-1 text-[10px] text-amber-400 font-mono font-bold">
          STANDBY
        </span>
      </div>

      <!-- Configured Device State -->
      <div class="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700/60 space-y-1.5">
        <div class="flex items-center justify-between font-mono text-xs">
          <span class="font-bold text-white flex items-center gap-1.5 truncate">
            <Shield class="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <span class="truncate">{{ fwStore.activeFirewall?.name || 'FortiGate-CSIR-SERC' }}</span>
          </span>
          <span class="text-cyan-400 font-bold ml-1 flex-shrink-0">{{ fwStore.activeFirewall?.ipAddress || '10.10.3.15' }}</span>
        </div>

        <div class="grid grid-cols-3 gap-1 pt-1.5 border-t border-slate-800 text-[9px] font-mono">
          <div class="text-center px-1 py-0.5 rounded truncate bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            port2 (WAN)
          </div>
          <div class="text-center px-1 py-0.5 rounded truncate bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
            port10 (QTM)
          </div>
          <div class="text-center px-1 py-0.5 rounded truncate bg-sky-500/10 text-sky-300 border border-sky-500/20">
            port1 (LAN)
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Menu Items -->
    <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto font-heading">
      <div class="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 font-heading">
        Operations &amp; Security
      </div>

      <RouterLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium font-heading transition group"
        :class="[
          $route.path === item.path
            ? 'bg-gradient-to-r from-emerald-500/15 to-cyan-500/15 text-white border border-cyan-500/30 shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
        ]"
      >
        <component
          :is="item.icon"
          class="w-4 h-4 transition flex-shrink-0"
          :class="[
            $route.path === item.path
              ? 'text-cyan-400'
              : 'text-slate-500 group-hover:text-slate-300'
          ]"
        />
        <span class="truncate">{{ item.name }}</span>
        <span
          v-if="item.badge"
          class="ml-auto text-[9px] font-mono px-1.5 py-0.5 rounded-full font-bold"
          :class="item.badgeClass"
        >
          {{ item.badge }}
        </span>
      </RouterLink>

      <div class="px-3 pt-4 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
        Management &amp; System
      </div>

      <RouterLink
        v-for="item in secondaryNavItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition group"
        :class="[
          $route.path === item.path
            ? 'bg-gradient-to-r from-emerald-500/15 to-cyan-500/15 text-white border border-cyan-500/30 shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
        ]"
      >
        <component
          :is="item.icon"
          class="w-4 h-4 transition flex-shrink-0"
          :class="[
            $route.path === item.path
              ? 'text-cyan-400'
              : 'text-slate-500 group-hover:text-slate-300'
          ]"
        />
        <span class="truncate">{{ item.name }}</span>
      </RouterLink>
    </nav>

    <!-- User Profile & Footer Notice -->
    <div class="p-3 border-t border-slate-800 bg-[#0a1020]/90">
      <div class="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div class="flex items-center gap-2.5 min-w-0">
          <div class="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center font-bold text-slate-950 text-xs">
            SA
          </div>
          <div class="min-w-0">
            <div class="text-xs font-semibold text-white font-heading truncate">Administrator</div>
            <div class="text-[10px] text-slate-400 font-body truncate">Super Admin (NOC)</div>
          </div>
        </div>
        <button
          @click="authStore.logout()"
          class="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
          title="Sign Out"
        >
          <LogOut class="w-3.5 h-3.5" />
        </button>
      </div>

      <div class="mt-2 text-center text-[9px] font-mono text-slate-500">
        {{ fwStore.branding.footerNotice || 'CSIR-SERC • Cyber Security Operations' }}
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import {
  LayoutDashboard,
  Activity,
  ShieldAlert,
  Server,
  FileCode,
  ScrollText,
  FileCheck2,
  Users,
  Settings,
  GitCompare,
  LogOut,
  Cpu,
  Globe,
  Shield
} from 'lucide-vue-next';
import { useFirewallStore } from '../stores/firewall.store.js';
import { useAuthStore } from '../stores/auth.store.js';

const fwStore = useFirewallStore();
const authStore = useAuthStore();

const navItems = [
  { name: 'NOC Dashboard', path: '/', icon: LayoutDashboard, badge: 'LIVE', badgeClass: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' },
  { name: 'Traffic Analytics', path: '/traffic', icon: Activity },
  { name: 'Unapproved Traffic', path: '/unapproved-apps', icon: ShieldAlert, badge: 'AUDIT', badgeClass: 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30' },
  { name: 'SNMP Telemetry', path: '/devices', icon: Server },
  { name: 'Policy Rules', path: '/policies', icon: FileCode },
  { name: 'Syslog Stream', path: '/logs', icon: ScrollText },
  { name: 'CERT-In Compliance', path: '/compliance', icon: FileCheck2 },
];

const secondaryNavItems = [
  { name: 'User Management', path: '/users', icon: Users },
  { name: 'Config Diff Engine', path: '/config-diff', icon: GitCompare },
  { name: 'Appliance Settings', path: '/settings', icon: Settings },
];
</script>
