<template>
  <div class="relative w-screen h-screen overflow-hidden bg-[#060211] text-slate-100 flex flex-col font-sans select-none">
    <!-- UX4G Mandated Government of India Top Banner & Tricolor Accent Strip -->
    <div class="h-1.5 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808] z-30 flex-shrink-0"></div>

    <!-- Background: Interactive Animated Cyber Threat & Live Attack Global Map -->
    <canvas ref="canvasRef" class="absolute inset-0 w-full h-full z-0 opacity-80 pointer-events-none"></canvas>

    <!-- Top Gov Navigation Strip -->
    <header class="relative z-20 px-8 py-3.5 flex items-center justify-between border-b border-violet-900/40 bg-violet-950/50 backdrop-blur-md flex-shrink-0">
      <div class="flex items-center gap-3.5">
        <!-- Dynamic Brand Logo -->
        <div class="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 bg-violet-900/60 border border-violet-700/50 shadow-md">
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
          <div v-else-if="fwStore.branding.presetLogo === 'shield'" class="w-full h-full bg-gradient-to-tr from-violet-600 to-cyan-400 p-0.5 flex items-center justify-center">
            <div class="w-full h-full bg-violet-950 rounded flex items-center justify-center">
              <Shield class="w-4 h-4 text-cyan-300" />
            </div>
          </div>
          <div v-else-if="fwStore.branding.presetLogo === 'cyber'" class="w-full h-full bg-gradient-to-tr from-emerald-600 to-cyan-500 p-0.5 flex items-center justify-center">
            <div class="w-full h-full bg-violet-950 rounded flex items-center justify-center">
              <Cpu class="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div v-else-if="fwStore.branding.presetLogo === 'globe'" class="w-full h-full bg-gradient-to-tr from-blue-600 to-indigo-500 p-0.5 flex items-center justify-center">
            <div class="w-full h-full bg-violet-950 rounded flex items-center justify-center">
              <Globe class="w-4 h-4 text-blue-300" />
            </div>
          </div>
          <div v-else class="w-full h-full rounded-full bg-gradient-to-tr from-amber-500 via-violet-500 to-cyan-400 p-0.5 flex items-center justify-center">
            <div class="w-full h-full rounded-full bg-violet-950 flex items-center justify-center font-bold text-sm text-amber-400">
              🇮🇳
            </div>
          </div>
        </div>
        <div>
          <div class="text-xs font-extrabold tracking-wider text-white flex items-center gap-2 font-sans">
            <span>{{ fwStore.branding.apexBody }}</span>
            <span class="text-violet-400 font-normal">| {{ fwStore.branding.orgName }}</span>
          </div>
          <div class="text-[11px] text-violet-300/80 font-medium">
            {{ fwStore.branding.orgDivision }}
          </div>
        </div>
      </div>

      <div class="flex items-center gap-4 text-xs">
        <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-violet-900/60 border border-violet-700/50 text-violet-300">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span class="font-mono font-bold text-emerald-400">DEFENSE GRID ACTIVE</span>
        </div>
        <div class="text-violet-400 font-mono text-[11px] hidden sm:block">
          CERT-In Directive 2022 / Section 70B
        </div>
      </div>
    </header>

    <!-- Main Content Area: Left Side Info Cards & Right Side Glassmorphic Login -->
    <main class="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 p-6 md:p-10 gap-8 items-center max-w-7xl mx-auto w-full min-h-0 overflow-y-auto">
      
      <!-- LEFT SIDE (7 Cols): Live Telemetry, Threat Levels & Info Cards -->
      <div class="lg:col-span-7 flex flex-col justify-center space-y-5">
        <!-- Hero Tagline -->
        <div class="space-y-2">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-900/70 border border-violet-600/50 text-xs font-semibold text-cyan-300 backdrop-blur-md">
            <ShieldCheck class="w-4 h-4 text-cyan-400" />
            <span>National Cyber Threat & Perimeter Telemetry Grid</span>
          </div>
          <h1 class="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Centralized Next-Gen <br />
            <span class="bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
              Firewall Operations Command
            </span>
          </h1>
          <p class="text-sm text-violet-200/80 max-w-xl font-normal leading-relaxed">
            Multi-vendor real-time intelligence for <strong>Fortinet, Palo Alto Networks, Check Point, and pfSense</strong> with live SNMP probes, automated 15-minute speed tests, and CERT-In compliance audits.
          </p>
        </div>

        <!-- Enterprise Live Info Cards Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
          <!-- Card 1: Live Bandwidth Speed & 15-Min Test -->
          <div class="p-4 rounded-2xl bg-violet-950/60 backdrop-blur-xl border border-violet-700/40 hover:border-cyan-500/50 transition shadow-lg shadow-violet-950/50 group">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-semibold text-violet-300 flex items-center gap-1.5">
                <Gauge class="w-4 h-4 text-cyan-400 group-hover:animate-spin" />
                Live Network Speed
              </span>
              <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                15-MIN TEST
              </span>
            </div>
            <div class="flex items-baseline gap-3">
              <span class="text-2xl font-black font-mono text-white tracking-tight">934.9</span>
              <span class="text-xs text-violet-400 font-mono">Mbps Down</span>
              <span class="text-violet-600">/</span>
              <span class="text-lg font-bold font-mono text-fuchsia-400">902.9</span>
              <span class="text-xs text-violet-400 font-mono">Up</span>
            </div>
            <div class="mt-2 flex items-center justify-between text-[11px] text-violet-300/80 pt-2 border-t border-violet-800/40 font-mono">
              <span>Ping: <strong class="text-emerald-400">4.0 ms</strong></span>
              <span class="text-violet-400 truncate">NIXI Gateway (MeitY)</span>
            </div>
          </div>

          <!-- Card 2: Threat Advisory Level -->
          <div class="p-4 rounded-2xl bg-violet-950/60 backdrop-blur-xl border border-violet-700/40 hover:border-amber-500/50 transition shadow-lg shadow-violet-950/50">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-semibold text-violet-300 flex items-center gap-1.5">
                <AlertTriangle class="w-4 h-4 text-amber-400" />
                Threat Advisory Level
              </span>
              <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                ELEVATED (AMBER)
              </span>
            </div>
            <div class="flex items-baseline gap-2">
              <span class="text-2xl font-black font-mono text-amber-400">14,290</span>
              <span class="text-xs text-violet-300">Attacks Intercepted</span>
            </div>
            <div class="mt-2 flex items-center justify-between text-[11px] text-violet-300/80 pt-2 border-t border-violet-800/40">
              <span class="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 class="w-3 h-3" /> 100% Perimeter Drop
              </span>
              <span class="text-violet-400 font-mono">CERT-In Active</span>
            </div>
          </div>

          <!-- Card 3: Live FortiGate Status (CSIR-SERC 10.10.3.15) -->
          <div class="p-4 rounded-2xl bg-violet-950/60 backdrop-blur-xl border border-violet-700/40 hover:border-rose-500/50 transition shadow-lg shadow-violet-950/50">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-semibold text-violet-300 flex items-center gap-1.5">
                <Server class="w-4 h-4 text-rose-400" />
                Live FortiGate (10.10.3.15)
              </span>
              <span class="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                SNMP v2c LIVE
              </span>
            </div>
            <div class="flex items-baseline gap-3">
              <span class="text-xl font-black font-mono text-white">5,412</span>
              <span class="text-xs text-violet-400 font-mono">Sessions</span>
              <span class="text-violet-600">•</span>
              <span class="text-sm font-bold font-mono text-emerald-400">0% CPU</span>
              <span class="text-xs text-violet-400 font-mono">| 39% Mem</span>
            </div>
            <div class="mt-2 text-[11px] text-violet-300/80 pt-2 border-t border-violet-800/40 flex items-center justify-between font-mono">
              <span>CSIR-SERC (CHENNAI)</span>
              <span class="text-violet-400">Up 85d+</span>
            </div>
          </div>

          <!-- Card 4: Connected Active Firewall Status -->
          <div class="p-4 rounded-2xl bg-violet-950/60 backdrop-blur-xl border border-emerald-500/40 hover:border-emerald-400 transition shadow-lg shadow-violet-950/50">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-semibold text-violet-300 flex items-center gap-1.5">
                <Radio class="w-4 h-4 text-emerald-400" />
                Connected Gateway
              </span>
              <span class="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                ACTIVE (1/1)
              </span>
            </div>
            <div class="space-y-1 font-mono">
              <div class="text-sm font-bold text-white flex items-center justify-between">
                <span>FortiGate-600F</span>
                <span class="text-xs text-cyan-300">10.10.3.15</span>
              </div>
              <div class="text-[11px] text-violet-300">FortiOS v7.4.12 • SNMP v2c</div>
            </div>
            <div class="mt-2 text-[11px] text-violet-300/80 pt-2 border-t border-violet-800/40 flex items-center justify-between font-mono">
              <span>Host: <strong>10.40.0.150</strong></span>
              <span class="text-emerald-400 font-mono">100% Online</span>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT SIDE (5 Cols): Advanced Glassmorphic Login Card -->
      <div class="lg:col-span-5 flex justify-center">
        <div class="w-full max-w-md bg-violet-950/75 backdrop-blur-2xl border border-violet-700/50 rounded-3xl p-8 shadow-2xl shadow-violet-950/90 relative overflow-hidden">
          
          <!-- Glass Glow Ambient Top -->
          <div class="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-cyan-500 rounded-full blur-3xl opacity-30 pointer-events-none"></div>

          <!-- Card National Accent Strip -->
          <div class="h-1 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808] -mt-8 -mx-8 mb-6"></div>

          <!-- Login Header -->
          <div class="text-center mb-6">
            <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 via-purple-600 to-cyan-400 p-0.5 shadow-lg shadow-violet-600/40 mb-3 overflow-hidden">
              <img
                v-if="fwStore.branding.logoBase64"
                :src="fwStore.branding.logoBase64"
                class="w-full h-full object-contain p-2 bg-violet-950 rounded-[14px]"
                alt="Logo"
              />
              <img
                v-else-if="fwStore.branding.logoUrl"
                :src="fwStore.branding.logoUrl"
                class="w-full h-full object-contain p-2 bg-violet-950 rounded-[14px]"
                alt="Logo"
              />
              <div v-else class="w-full h-full bg-violet-950 rounded-[14px] flex items-center justify-center">
                <LockKeyhole class="w-6 h-6 text-neon-cyan" />
              </div>
            </div>
            <h2 class="text-xl font-bold text-white tracking-wide font-sans">
              {{ fwStore.branding.loginTitle }}
            </h2>
            <p class="text-xs text-violet-300/80 mt-1">
              {{ fwStore.branding.loginSubtitle }}
            </p>
          </div>

          <!-- Error Alert Banner -->
          <div
            v-if="authStore.authError"
            class="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5 animate-shake"
          >
            <AlertCircle class="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
            <span>{{ authStore.authError }}</span>
          </div>

          <!-- Login Form -->
          <form @submit.prevent="handleLogin" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-violet-300 mb-1.5 uppercase tracking-wider font-mono">
                Government Identity ID
              </label>
              <div class="relative">
                <UserCheck class="w-4 h-4 text-violet-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  v-model="username"
                  type="text"
                  required
                  placeholder="e.g. admin or auditor"
                  class="w-full pl-10 pr-4 py-2.5 bg-violet-900/40 border border-violet-700/50 rounded-xl text-sm text-white placeholder-violet-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition font-mono"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-violet-300 mb-1.5 uppercase tracking-wider font-mono">
                Secure Access Passkey
              </label>
              <div class="relative">
                <KeyRound class="w-4 h-4 text-violet-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  placeholder="••••••••••••"
                  class="w-full pl-10 pr-10 py-2.5 bg-violet-900/40 border border-violet-700/50 rounded-xl text-sm text-white placeholder-violet-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition font-mono"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-3.5 top-1/2 -translate-y-1/2 text-violet-400 hover:text-white transition"
                >
                  <EyeOff v-if="showPassword" class="w-4 h-4" />
                  <Eye v-else class="w-4 h-4" />
                </button>
              </div>
            </div>

            <button
              type="submit"
              :disabled="authStore.isLoading"
              class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500 hover:opacity-95 text-white font-bold text-sm tracking-wide shadow-lg shadow-violet-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              <Loader2 v-if="authStore.isLoading" class="w-4 h-4 animate-spin" />
              <Shield class="w-4 h-4" v-else />
              <span>{{ authStore.isLoading ? 'Authenticating with NCCC Grid...' : 'Authorize & Sign In' }}</span>
            </button>
          </form>

          <!-- Quick 1-Click Demo Logins -->
          <div class="mt-5 pt-4 border-t border-violet-800/40">
            <div class="text-[10px] text-violet-400 font-semibold uppercase tracking-wider text-center mb-2.5">
              Authorized Test Credentials (1-Click)
            </div>
            <div class="grid grid-cols-3 gap-2">
              <button
                type="button"
                @click="fillCredentials('superadmin', 'SuperAdmin@2026!')"
                class="px-2 py-1.5 rounded-lg bg-amber-950/40 hover:bg-amber-900/50 border border-amber-600/50 text-left transition group shadow-sm shadow-amber-950/50"
              >
                <div class="text-[11px] font-bold text-amber-300 group-hover:text-white flex items-center gap-1">
                  <span>👑 Super Admin</span>
                </div>
                <div class="text-[9px] text-amber-300/70 font-mono truncate">superadmin</div>
              </button>

              <button
                type="button"
                @click="fillCredentials('admin', 'NcccAdmin@2026!')"
                class="px-2 py-1.5 rounded-lg bg-violet-900/40 hover:bg-violet-800/50 border border-violet-700/40 text-left transition group"
              >
                <div class="text-[11px] font-bold text-cyan-300 group-hover:text-white flex items-center gap-1">
                  <span>🛡️ CISO Admin</span>
                </div>
                <div class="text-[9px] text-violet-400 font-mono truncate">admin</div>
              </button>

              <button
                type="button"
                @click="fillCredentials('auditor', 'CertInAudit@2026!')"
                class="px-2 py-1.5 rounded-lg bg-violet-900/40 hover:bg-violet-800/50 border border-violet-700/40 text-left transition group"
              >
                <div class="text-[11px] font-bold text-fuchsia-300 group-hover:text-white flex items-center gap-1">
                  <span>📋 Auditor</span>
                </div>
                <div class="text-[9px] text-violet-400 font-mono truncate">auditor</div>
              </button>
            </div>
          </div>

          <!-- Bottom Legal & Audit Notice -->
          <div class="mt-4 text-[10px] text-violet-400/80 text-center leading-relaxed font-mono">
            Protected under Section 70B of IT Act 2000. All sessions are cryptographically signed & logged.
          </div>

        </div>
      </div>

    </main>

    <!-- Footer Security Notice -->
    <footer class="relative z-20 py-2.5 px-6 border-t border-violet-900/40 bg-violet-950/60 backdrop-blur-md text-[11px] text-violet-400 flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
      <div class="flex flex-wrap items-center gap-2">
        <span class="px-2 py-0.5 rounded bg-violet-900/70 text-violet-200 border border-violet-700/50 font-medium">Made by ICTD CSIR-SERC for CSIR with ❤️</span>
        <span class="text-violet-600 hidden md:inline">•</span>
        <span class="hidden md:inline">{{ fwStore.branding.footerNotice }}</span>
      </div>
      <div class="font-mono text-emerald-400 flex items-center gap-1.5">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
        {{ fwStore.branding.ntpBadgeText }}
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
  Gauge,
  AlertTriangle,
  Server,
  Radio,
  CheckCircle2,
  Cpu,
  Globe
} from 'lucide-vue-next';
import { useAuthStore } from '../stores/auth.store.js';
import { useFirewallStore } from '../stores/firewall.store.js';

const router = useRouter();
const authStore = useAuthStore();
const fwStore = useFirewallStore();

const username = ref('admin');
const password = ref('NcccAdmin@2026!');
const showPassword = ref(false);
const canvasRef = ref<HTMLCanvasElement | null>(null);

function fillCredentials(u: string, p: string) {
  username.value = u;
  password.value = p;
  handleLogin();
}

async function handleLogin() {
  const success = await authStore.login(username.value, password.value);
  if (success) {
    router.push('/');
  }
}

// ============================================================================
// Animated Cyber Threat & Live Attack Global Map on HTML5 Canvas
// ============================================================================
let animId: number;

interface CyberNode {
  name: string;
  x: number;
  y: number;
  isTarget?: boolean;
}

interface AttackArc {
  source: CyberNode;
  target: CyberNode;
  progress: number;
  speed: number;
  color: string;
  threatType: string;
}

onMounted(() => {
  fwStore.fetchSettings();
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  function resize() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Define global nodes relative to canvas dimensions
  function getNodes(): { nodes: CyberNode[]; targetNode: CyberNode } {
    const w = canvas!.width;
    const h = canvas!.height;

    const targetNode: CyberNode = {
      name: 'New Delhi (NCCC / MeitY)',
      x: w * 0.48,
      y: h * 0.44,
      isTarget: true
    };

    const nodes: CyberNode[] = [
      targetNode,
      { name: 'Silicon Valley', x: w * 0.12, y: h * 0.38 },
      { name: 'Frankfurt Hub', x: w * 0.38, y: h * 0.32 },
      { name: 'Moscow Grid', x: w * 0.44, y: h * 0.24 },
      { name: 'Beijing Gateway', x: w * 0.58, y: h * 0.36 },
      { name: 'Singapore Spine', x: w * 0.54, y: h * 0.56 },
      { name: 'Sydney Core', x: w * 0.65, y: h * 0.72 },
      { name: 'London Tier-1', x: w * 0.34, y: h * 0.28 },
      { name: 'Tokyo Node', x: w * 0.64, y: h * 0.38 },
      { name: 'São Paulo', x: w * 0.22, y: h * 0.68 },
    ];
    return { nodes, targetNode };
  }

  const colors = ['#00f0ff', '#ff007f', '#a855f7', '#ffaa00', '#00ffaa'];
  const threatTypes = ['DDoS Flood', 'APT Probe', 'SQLi Scanner', 'Zero-Day Exploit', 'Ransomware C2'];

  let { nodes, targetNode } = getNodes();

  const attacks: AttackArc[] = [];
  function spawnAttack() {
    const sources = nodes.filter(n => !n.isTarget);
    const source = sources[Math.floor(Math.random() * sources.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const threatType = threatTypes[Math.floor(Math.random() * threatTypes.length)];
    attacks.push({
      source,
      target: targetNode,
      progress: 0,
      speed: 0.006 + Math.random() * 0.009,
      color,
      threatType
    });
  }

  // Prepopulate
  for (let i = 0; i < 6; i++) {
    spawnAttack();
  }

  let frame = 0;

  function draw() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    frame++;
    if (frame % 45 === 0 && attacks.length < 12) {
      spawnAttack();
    }

    // 1. Draw subtle cyber coordinate grid
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.07)';
    ctx.lineWidth = 1;
    const gridSize = 60;
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // 2. Draw connecting static defense lines
    nodes.forEach((n) => {
      if (!n.isTarget) {
        ctx.strokeStyle = 'rgba(124, 58, 237, 0.14)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(n.x, n.y);
        ctx.lineTo(targetNode.x, targetNode.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });

    // 3. Draw ballistic laser attack arcs
    for (let i = attacks.length - 1; i >= 0; i--) {
      const arc = attacks[i];
      arc.progress += arc.speed;

      const sx = arc.source.x;
      const sy = arc.source.y;
      const tx = arc.target.x;
      const ty = arc.target.y;

      // Arc curve control point
      const midX = (sx + tx) / 2;
      const midY = (sy + ty) / 2 - 60;

      // Current missile head position
      const t = arc.progress;
      const headX = (1 - t) * (1 - t) * sx + 2 * (1 - t) * t * midX + t * t * tx;
      const headY = (1 - t) * (1 - t) * sy + 2 * (1 - t) * t * midY + t * t * ty;

      // Trail
      ctx.strokeStyle = arc.color;
      ctx.lineWidth = 2;
      ctx.shadowColor = arc.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.quadraticCurveTo(midX, midY, headX, headY);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Glowing missile head
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(headX, headY, 3, 0, Math.PI * 2);
      ctx.fill();

      // Threat Label floating
      if (t > 0.3 && t < 0.7) {
        ctx.font = '9px monospace';
        ctx.fillStyle = arc.color;
        ctx.fillText(arc.threatType, headX + 6, headY - 6);
      }

      if (arc.progress >= 1) {
        attacks.splice(i, 1);
      }
    }

    // 4. Draw Cyber Nodes
    nodes.forEach((n) => {
      if (n.isTarget) {
        // Target: National Cyber Grid Hub (New Delhi)
        const pulse = (Math.sin(frame * 0.05) + 1) * 8;
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 16 + pulse, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#00f0ff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('🇮🇳 ' + n.name, n.x - 60, n.y + 24);
      } else {
        // Source Nodes
        ctx.fillStyle = 'rgba(168, 85, 247, 0.6)';
        ctx.beginPath();
        ctx.arc(n.x, n.y, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = '10px monospace';
        ctx.fillStyle = 'rgba(216, 180, 254, 0.6)';
        ctx.fillText(n.name, n.x + 6, n.y + 3);
      }
    });

    animId = requestAnimationFrame(draw);
  }

  draw();

  onUnmounted(() => {
    cancelAnimationFrame(animId);
    window.removeEventListener('resize', resize);
  });
});
</script>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-4px); }
  40%, 80% { transform: translateX(4px); }
}
.animate-shake {
  animation: shake 0.4s ease-in-out;
}
</style>
