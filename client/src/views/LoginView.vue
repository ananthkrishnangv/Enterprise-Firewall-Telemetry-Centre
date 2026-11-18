<template>
  <div class="relative w-screen h-screen overflow-hidden bg-[#080d1a] text-slate-100 flex flex-col font-body select-none">
    
    <!-- Top Government of India & Institutional Identity Header Strip -->
    <header class="relative z-30 px-6 py-3 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-xl flex-shrink-0">
      <div class="flex items-center gap-3.5">
        <!-- Logo Emblem -->
        <div class="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 bg-slate-900/80 border border-slate-700/60 shadow-sm">
          <img
            v-if="fwStore.branding.logoBase64"
            :src="fwStore.branding.logoBase64"
            class="w-full h-full object-contain p-0.5"
            alt="Logo"
          />
          <img
            v-else-if="fwStore.branding.logoUrl"
            :src="fwStore.branding.logoUrl"
            class="w-full h-full object-contain p-0.5"
            alt="Logo"
          />
          <div v-else class="w-full h-full bg-slate-900 flex items-center justify-center">
            <ShieldCheck class="w-5 h-5 text-cyan-400" />
          </div>
        </div>

        <div>
          <div class="text-xs font-bold tracking-wide text-slate-200 flex items-center gap-2 font-heading">
            <span>{{ fwStore.branding.apexBody || 'CSIR-SERC (Chennai)' }}</span>
            <span class="text-slate-500 font-normal">| {{ fwStore.branding.orgName || 'Structural Engineering Research Centre' }}</span>
          </div>
          <div class="text-[11px] text-slate-400 font-body">
            {{ fwStore.branding.orgDivision || 'ICT & Network Security Division • National Cyber Threat & Perimeter Telemetry' }}
          </div>
        </div>
      </div>

      <div class="flex items-center gap-4 text-xs font-body">
        <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 text-slate-300">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span class="font-mono text-[11px] font-semibold text-emerald-400">GATEWAY 10.10.3.15 ONLINE</span>
        </div>
        <div class="text-slate-500 font-mono text-[11px] hidden sm:block">
          CERT-In IT Security Directives
        </div>
      </div>
    </header>

    <!-- Main Split Screen Area -->
    <main class="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
      
      <!-- LEFT SIDE (7 Cols): Semi-Transparent Isometric Background + Live Traffic Stat Cards -->
      <div class="lg:col-span-7 relative flex flex-col justify-between p-8 md:p-12 overflow-y-auto border-r border-slate-800/80">
        
        <!-- Semi-transparent Isometric Datacenter & Firewall Background -->
        <div 
          class="absolute inset-0 bg-cover bg-center pointer-events-none opacity-25 filter contrast-125 brightness-90"
          style="background-image: url('/login-isometric-bg.jpg');"
        ></div>
        <!-- Gradient Mask to blend image smoothly into obsidian canvas -->
        <div class="absolute inset-0 bg-gradient-to-r from-[#080d1a]/95 via-[#080d1a]/70 to-[#080d1a]/90 pointer-events-none"></div>

        <!-- Left Content Container -->
        <div class="relative z-10 space-y-6">
          
          <!-- Institutional Badge & Hero Heading -->
          <div class="space-y-3">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 text-xs font-medium text-cyan-300 backdrop-blur-md">
              <Shield class="w-3.5 h-3.5 text-cyan-400" />
              <span>FortiGate-600F Enterprise Telemetry Grid</span>
            </div>

            <h1 class="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white font-heading leading-tight">
              Perimeter Telemetry & <br />
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
                Operations Command
              </span>
            </h1>

            <p class="text-sm text-slate-300 max-w-xl font-body leading-relaxed">
              Real-time hardware telemetry, stateful flow inspection, and CERT-In compliant audit archival for CSIR-SERC campus network perimeter.
            </p>
          </div>

          <!-- Real-Time Traffic & Hardware Stat Cards Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            
            <!-- Stat Card 1: Perimeter Bandwidth -->
            <div class="p-4 rounded-2xl bg-slate-900/65 backdrop-blur-xl border border-slate-800/90 shadow-xl shadow-black/40 hover:border-cyan-500/40 transition">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-medium text-slate-300 flex items-center gap-2 font-body">
                  <Activity class="w-4 h-4 text-cyan-400" />
                  Perimeter Bandwidth
                </span>
                <span class="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  REAL-TIME WAN
                </span>
              </div>
              <div class="flex items-baseline gap-2.5">
                <span class="text-2xl font-bold font-mono text-emerald-400 tracking-tight">
                  ↓ {{ wanInRate }}
                </span>
                <span class="text-xs text-slate-400 font-mono">Mbps In</span>
                <span class="text-slate-600">/</span>
                <span class="text-xl font-bold font-mono text-cyan-400 tracking-tight">
                  ↑ {{ wanOutRate }}
                </span>
                <span class="text-xs text-slate-400 font-mono">Mbps Out</span>
              </div>
              <div class="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 font-mono">
                <span class="flex items-center gap-1.5 text-slate-300">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  port2 (WAN) & port10 (QTM)
                </span>
                <span class="text-slate-400">1 Gbps NKN Transit</span>
              </div>
            </div>

            <!-- Stat Card 2: Hardware Subsystem Vitals -->
            <div class="p-4 rounded-2xl bg-slate-900/65 backdrop-blur-xl border border-slate-800/90 shadow-xl shadow-black/40 hover:border-emerald-500/40 transition">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-medium text-slate-300 flex items-center gap-2 font-body">
                  <Cpu class="w-4 h-4 text-emerald-400" />
                  FortiOS Appliance Vitals
                </span>
                <span class="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  10.10.3.15
                </span>
              </div>
              <div class="flex items-baseline gap-3">
                <div class="flex items-baseline gap-1">
                  <span class="text-2xl font-bold font-mono text-white">{{ cpuPercent }}%</span>
                  <span class="text-xs text-slate-400 font-mono">CPU</span>
                </div>
                <span class="text-slate-600">•</span>
                <div class="flex items-baseline gap-1">
                  <span class="text-lg font-bold font-mono text-cyan-300">{{ memPercent }}%</span>
                  <span class="text-xs text-slate-400 font-mono">RAM</span>
                </div>
                <span class="text-slate-600">•</span>
                <div class="flex items-baseline gap-1">
                  <span class="text-sm font-semibold font-mono text-amber-300">{{ tempC }}°C</span>
                  <span class="text-[10px] text-slate-400 font-mono">DTS</span>
                </div>
              </div>
              <div class="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 font-mono">
                <span class="text-slate-300">FortiOS v7.4.12 build2902</span>
                <span class="text-emerald-400">NP7 / CP9 ASIC</span>
              </div>
            </div>

            <!-- Stat Card 3: Concurrent State Sessions -->
            <div class="p-4 rounded-2xl bg-slate-900/65 backdrop-blur-xl border border-slate-800/90 shadow-xl shadow-black/40 hover:border-teal-500/40 transition">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-medium text-slate-300 flex items-center gap-2 font-body">
                  <Layers class="w-4 h-4 text-teal-400" />
                  Concurrent Flow States
                </span>
                <span class="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/20">
                  SESSION TABLE
                </span>
              </div>
              <div class="flex items-baseline gap-2">
                <span class="text-2xl font-bold font-mono text-teal-300 tracking-tight">{{ activeSessions }}</span>
                <span class="text-xs text-slate-400 font-mono">Active Flows</span>
                <span class="text-[11px] text-slate-500 font-mono ml-auto">(0.89% of 2.0M)</span>
              </div>
              <div class="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 font-mono">
                <span class="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 class="w-3 h-3" /> Zero Packet Drop
                </span>
                <span class="text-slate-400">TCP / UDP Stateful</span>
              </div>
            </div>

            <!-- Stat Card 4: Core Network Interfaces -->
            <div class="p-4 rounded-2xl bg-slate-900/65 backdrop-blur-xl border border-slate-800/90 shadow-xl shadow-black/40 hover:border-indigo-500/40 transition">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-medium text-slate-300 flex items-center gap-2 font-body">
                  <Server class="w-4 h-4 text-cyan-400" />
                  Physical Interfaces Status
                </span>
                <span class="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  46 PORTS
                </span>
              </div>
              <div class="flex items-center gap-2 text-xs font-mono">
                <span class="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">port2: UP</span>
                <span class="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">port10: UP</span>
                <span class="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">port1: UP</span>
              </div>
              <div class="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 font-mono">
                <span class="text-slate-300">SNMPv2c Polling: 15s</span>
                <span class="text-emerald-400">100% Operational</span>
              </div>
            </div>

          </div>
        </div>

        <!-- Left Sub-Footer info -->
        <div class="relative z-10 pt-6 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/60 font-body">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span>Appliance Uptime: <strong class="text-slate-200 font-mono">{{ uptime }}</strong></span>
          </div>
          <span class="font-mono text-slate-500">CSIR-SERC Datacenter (CHENNAI)</span>
        </div>

      </div>

      <!-- RIGHT SIDE (5 Cols): Clean Glassmorphic Login Window -->
      <div class="lg:col-span-5 flex items-center justify-center p-6 md:p-10 relative bg-[#080d1a]/50">
        
        <!-- Subtle Ambient Glow Behind Card -->
        <div class="absolute w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div class="w-full max-w-md bg-slate-900/70 backdrop-blur-2xl border border-slate-800/90 rounded-3xl p-8 shadow-2xl shadow-black/80 relative z-10">
          
          <!-- Card Top Accent Bar (Subtle Soft Cyan/Slate Gradient) -->
          <div class="h-1 w-full bg-gradient-to-r from-cyan-500/40 via-teal-400/40 to-emerald-500/40 -mt-8 -mx-8 mb-7 rounded-t-3xl"></div>

          <!-- Login Header -->
          <div class="text-center mb-6">
            <div class="inline-flex items-center justify-center w-13 h-13 rounded-2xl bg-slate-800/80 border border-slate-700/70 p-3 shadow-inner mb-3">
              <LockKeyhole class="w-6 h-6 text-cyan-400" />
            </div>
            
            <h2 class="text-xl md:text-2xl font-bold text-white tracking-tight font-heading">
              {{ fwStore.branding.loginTitle || 'Operator Sign In' }}
            </h2>
            <p class="text-xs text-slate-400 mt-1 font-body">
              {{ fwStore.branding.loginSubtitle || 'Secure authentication for CSIR-SERC firewall telemetry' }}
            </p>
          </div>

          <!-- Error Alert Banner -->
          <div
            v-if="authStore.authError"
            class="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 font-body"
          >
            <AlertCircle class="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
            <span>{{ authStore.authError }}</span>
          </div>

          <!-- Login Form -->
          <form @submit.prevent="handleLogin" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider font-mono">
                Operator Username / ID
              </label>
              <div class="relative">
                <UserCheck class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  v-model="username"
                  type="text"
                  required
                  autocomplete="off"
                  placeholder="Enter operator username / ID"
                  class="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 transition font-mono"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider font-mono">
                Access Security Passkey
              </label>
              <div class="relative">
                <KeyRound class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  ref="passwordInputRef"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  autocomplete="off"
                  placeholder="Enter security password"
                  class="w-full pl-10 pr-10 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 transition font-mono"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                  tabindex="-1"
                >
                  <EyeOff v-if="showPassword" class="w-4 h-4" />
                  <Eye v-else class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Submit Button (Soft Cyan/Teal Gradient, No Rainbow) -->
            <button
              type="submit"
              :disabled="authStore.isLoading"
              class="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-semibold text-sm tracking-wide shadow-lg shadow-cyan-950/40 transition flex items-center justify-center gap-2 disabled:opacity-50 mt-3 font-heading"
            >
              <Loader2 v-if="authStore.isLoading" class="w-4 h-4 animate-spin" />
              <Shield class="w-4 h-4" v-else />
              <span>{{ authStore.isLoading ? 'Authenticating...' : 'Authorize & Sign In' }}</span>
            </button>
          </form>

          <!-- Authorized Role Profiles (Select Username Only) -->
          <div class="mt-5 pt-4 border-t border-slate-800/80">
            <div class="text-[10px] text-slate-400 font-semibold uppercase tracking-wider text-center mb-1 font-body">
              Authorized Role Profiles
            </div>
            <div class="text-[10px] text-slate-500 text-center mb-2.5 font-body">
              Select identity profile • Enter password configured during setup
            </div>
            <div class="grid grid-cols-3 gap-2">
              <button
                type="button"
                @click="selectRoleUser('superadmin')"
                class="px-2 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-amber-500/50 text-left transition group cursor-pointer"
                title="Select Super Administrator"
              >
                <div class="text-[11px] font-semibold text-amber-300 group-hover:text-white flex items-center gap-1 font-heading">
                  <span>Super Admin</span>
                </div>
                <div class="text-[9px] text-slate-400 font-mono truncate">superadmin</div>
              </button>

              <button
                type="button"
                @click="selectRoleUser('admin')"
                class="px-2 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-cyan-500/50 text-left transition group cursor-pointer"
                title="Select CISO Administrator"
              >
                <div class="text-[11px] font-semibold text-cyan-300 group-hover:text-white flex items-center gap-1 font-heading">
                  <span>CISO Admin</span>
                </div>
                <div class="text-[9px] text-slate-400 font-mono truncate">admin</div>
              </button>

              <button
                type="button"
                @click="selectRoleUser('auditor')"
                class="px-2 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/50 text-left transition group cursor-pointer"
                title="Select Compliance Auditor"
              >
                <div class="text-[11px] font-semibold text-emerald-300 group-hover:text-white flex items-center gap-1 font-heading">
                  <span>Auditor</span>
                </div>
                <div class="text-[9px] text-slate-400 font-mono truncate">auditor</div>
              </button>
            </div>
          </div>

          <!-- Legal & Compliance Notice -->
          <div class="mt-4 text-[10px] text-slate-400 text-center leading-relaxed font-body">
            Protected under Section 70B of IT Act 2000. All sessions are cryptographically signed & logged.
          </div>

        </div>
      </div>

    </main>

    <!-- Footer Security Notice -->
    <footer class="relative z-30 py-2 px-6 border-t border-slate-800/80 bg-slate-950/70 backdrop-blur-xl text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2 flex-shrink-0 font-body">
      <div class="flex flex-wrap items-center gap-2">
        <span class="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 font-medium">
          Made by ICTD CSIR-SERC for CSIR with ❤️
        </span>
        <span class="text-slate-600 hidden md:inline">•</span>
        <span class="hidden md:inline">{{ fwStore.branding.footerNotice || 'CSIR-SERC Free Community & Institutional License v1.0' }}</span>
      </div>
      <div class="font-mono text-emerald-400 flex items-center gap-1.5">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
        {{ fwStore.branding.ntpBadgeText || 'NTP Synced: time.serc.res.in' }}
      </div>
    </footer>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  Shield,
  ShieldCheck,
  LockKeyhole,
  UserCheck,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Activity,
  Cpu,
  Layers,
  Server,
  CheckCircle2
} from 'lucide-vue-next';
import { useAuthStore } from '../stores/auth.store.js';
import { useFirewallStore } from '../stores/firewall.store.js';

const router = useRouter();
const authStore = useAuthStore();
const fwStore = useFirewallStore();

const username = ref('');
const password = ref('');
const showPassword = ref(false);
const passwordInputRef = ref<HTMLInputElement | null>(null);

// Live Telemetry Stat Card Values
const wanInRate = ref('154.1');
const wanOutRate = ref('179.8');
const cpuPercent = ref(1);
const memPercent = ref(38);
const tempC = ref(42);
const activeSessions = ref('17,880');
const uptime = ref('21d 08h 25m');

let pollTimer: any = null;

async function fetchLiveTelemetry() {
  try {
    const res = await fetch('/api/snmp/telemetry');
    if (!res.ok) return;
    const data = await res.json();
    if (data.success && data.metrics) {
      const m = data.metrics;
      cpuPercent.value = m.cpuUtilPercent ?? 1;
      memPercent.value = m.memoryUtilPercent ?? 38;
      if (m.sensors?.cpuTemperatureC) tempC.value = m.sensors.cpuTemperatureC;
      if (m.concurrentConnections) activeSessions.value = m.concurrentConnections.toLocaleString();
      
      if (m.sysUpTime) {
        const days = Math.floor(m.sysUpTime / 86400);
        const hrs = Math.floor((m.sysUpTime % 86400) / 3600);
        const mins = Math.floor((m.sysUpTime % 3600) / 60);
        uptime.value = `${days}d ${String(hrs).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m`;
      }

      const p2 = m.interfaces?.find((i: any) => i.name === 'port2');
      const p10 = m.interfaces?.find((i: any) => i.name === 'port10');
      if (p2 && p2.inBps) wanInRate.value = (p2.inBps / 1e6).toFixed(1);
      if (p10 && p10.outBps) wanOutRate.value = (p10.outBps / 1e6).toFixed(1);
    }
  } catch {
    // Non-blocking fallback to current values
  }
}

function selectRoleUser(roleUsername: string) {
  username.value = roleUsername;
  password.value = '';
  passwordInputRef.value?.focus();
}

async function handleLogin() {
  const success = await authStore.login(username.value, password.value);
  if (success) {
    router.push('/');
  }
}

onMounted(() => {
  fwStore.fetchSettings();
  fetchLiveTelemetry();
  pollTimer = setInterval(fetchLiveTelemetry, 15000);
});

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer);
});
</script>
