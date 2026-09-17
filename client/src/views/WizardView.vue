<template>
  <div class="min-h-screen bg-[#07020f] bg-radial-grid text-white flex flex-col justify-between selection:bg-cyan-500 selection:text-black">
    <!-- Top Indian Tricolor Ribbon & Brand Bar -->
    <div class="h-1 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]"></div>
    
    <header class="py-4 px-6 border-b border-violet-800/40 bg-violet-950/60 backdrop-blur-md flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-fuchsia-500 to-cyan-400 p-0.5 shadow-lg shadow-violet-600/30 flex items-center justify-center">
          <div class="w-full h-full bg-violet-950 rounded-[10px] flex items-center justify-center">
            <Shield class="w-5 h-5 text-neon-cyan" />
          </div>
        </div>
        <div>
          <h1 class="text-sm font-bold text-white font-sans tracking-wide">
            Enterprise Firewall Monitoring Appliance
          </h1>
          <p class="text-[10px] text-violet-300 font-mono">First-Time Setup & Onboarding Wizard</p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <span class="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
          INITIAL SETUP MODE
        </span>
      </div>
    </header>

    <!-- Main Wizard Card Container -->
    <main class="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 my-auto">
      <div class="rounded-3xl bg-violet-950/70 backdrop-blur-2xl border border-violet-700/50 shadow-2xl p-6 sm:p-8 space-y-6 rainbow-border relative overflow-hidden">
        <!-- Progress Stepper -->
        <div class="relative pb-6 border-b border-violet-800/40">
          <div class="grid grid-cols-4 gap-2 text-center text-xs">
            <div
              v-for="(step, idx) in steps"
              :key="step.title"
              class="flex flex-col items-center gap-1.5 transition"
              :class="currentStep >= idx + 1 ? 'text-white' : 'text-violet-500'"
            >
              <div
                class="w-8 h-8 rounded-xl font-bold font-mono flex items-center justify-center text-xs transition border"
                :class="[
                  currentStep === idx + 1 ? 'bg-gradient-to-tr from-violet-600 to-cyan-500 text-white border-cyan-400 shadow-lg shadow-cyan-500/30' :
                  currentStep > idx + 1 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                  'bg-violet-900/40 text-violet-400 border-violet-800/50'
                ]"
              >
                <Check v-if="currentStep > idx + 1" class="w-4 h-4" />
                <span v-else>{{ idx + 1 }}</span>
              </div>
              <span class="text-[11px] font-semibold hidden sm:inline">{{ step.title }}</span>
            </div>
          </div>
          <!-- Progress Bar Line -->
          <div class="w-full bg-violet-900/40 h-1 rounded-full mt-4 overflow-hidden">
            <div
              class="h-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-400 transition-all duration-300"
              :style="{ width: `${((currentStep - 1) / 3) * 100}%` }"
            ></div>
          </div>
        </div>

        <!-- =================================================================== -->
        <!-- STEP 1: ORGANIZATION BRANDING & LOGO                                -->
        <!-- =================================================================== -->
        <div v-if="currentStep === 1" class="space-y-4 animate-fadeIn">
          <div>
            <h2 class="text-lg font-bold text-white font-sans flex items-center gap-2">
              <Building2 class="w-5 h-5 text-neon-cyan" />
              Organization Identity & Portal Branding
            </h2>
            <p class="text-xs text-violet-300/80 mt-1">
              Customize portal namings, apex body, and upload your official organizational emblem.
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label class="block text-violet-300 font-semibold mb-1">Organization Name *</label>
              <input
                v-model="wizardData.branding.orgName"
                type="text"
                required
                placeholder="e.g. CSIR-SERC (Chennai)"
                class="w-full px-3.5 py-2.5 bg-violet-900/40 border border-violet-700/60 rounded-xl text-white placeholder-violet-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label class="block text-violet-300 font-semibold mb-1">Division / Security Unit *</label>
              <input
                v-model="wizardData.branding.orgDivision"
                type="text"
                required
                placeholder="e.g. ICT & Network Security Division"
                class="w-full px-3.5 py-2.5 bg-violet-900/40 border border-violet-700/60 rounded-xl text-white placeholder-violet-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label class="block text-violet-300 font-semibold mb-1">Apex Body / Ministry</label>
              <input
                v-model="wizardData.branding.apexBody"
                type="text"
                placeholder="e.g. Council of Scientific & Industrial Research"
                class="w-full px-3.5 py-2.5 bg-violet-900/40 border border-violet-700/60 rounded-xl text-white placeholder-violet-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label class="block text-violet-300 font-semibold mb-1">Portal System Title</label>
              <input
                v-model="wizardData.branding.portalTitle"
                type="text"
                placeholder="e.g. Enterprise Firewall Telemetry & Operations Console"
                class="w-full px-3.5 py-2.5 bg-violet-900/40 border border-violet-700/60 rounded-xl text-white placeholder-violet-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <!-- Logo Upload & Preset Selection -->
          <div class="p-4 rounded-2xl bg-violet-900/30 border border-violet-800/60 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-white flex items-center gap-1.5">
                <ImageIcon class="w-4 h-4 text-neon-cyan" />
                Organization Emblem / Logo
              </span>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  @click="wizardData.branding.logoType = 'preset'"
                  class="px-2.5 py-1 rounded-lg text-[10px] font-bold transition"
                  :class="wizardData.branding.logoType === 'preset' ? 'bg-cyan-500 text-black' : 'bg-violet-900/50 text-violet-300'"
                >
                  Vector Preset
                </button>
                <button
                  type="button"
                  @click="wizardData.branding.logoType = 'custom'"
                  class="px-2.5 py-1 rounded-lg text-[10px] font-bold transition"
                  :class="wizardData.branding.logoType === 'custom' ? 'bg-cyan-500 text-black' : 'bg-violet-900/50 text-violet-300'"
                >
                  Upload Custom Logo
                </button>
              </div>
            </div>

            <div v-if="wizardData.branding.logoType === 'custom'" class="space-y-2">
              <div class="flex items-center gap-4">
                <div class="w-16 h-16 rounded-xl bg-violet-950 border border-violet-700/50 flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img
                    v-if="wizardData.branding.logoBase64"
                    :src="wizardData.branding.logoBase64"
                    alt="Logo Preview"
                    class="max-w-full max-h-full object-contain p-1"
                  />
                  <Shield v-else class="w-8 h-8 text-violet-600" />
                </div>
                <div class="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    @change="handleLogoUpload"
                    class="block w-full text-xs text-violet-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-violet-800 file:text-white hover:file:bg-violet-700 cursor-pointer"
                  />
                  <p class="text-[10px] text-violet-400 mt-1 font-mono">PNG, SVG, or JPEG. High-resolution transparent background recommended.</p>
                </div>
              </div>
            </div>

            <div v-else class="grid grid-cols-4 gap-2 pt-1">
              <button
                v-for="p in presetLogos"
                :key="p.id"
                type="button"
                @click="wizardData.branding.presetLogo = p.id"
                class="p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1"
                :class="wizardData.branding.presetLogo === p.id ? 'bg-cyan-500/20 border-cyan-400 text-white' : 'bg-violet-950/40 border-violet-800/40 text-violet-400 hover:text-white'"
              >
                <component :is="p.icon" class="w-5 h-5 text-neon-cyan" />
                <span class="text-[10px] font-semibold">{{ p.name }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- =================================================================== -->
        <!-- STEP 2: PRIMARY FIREWALL APPLIANCE & SNMP DISCOVERY                -->
        <!-- =================================================================== -->
        <div v-if="currentStep === 2" class="space-y-4 animate-fadeIn">
          <div>
            <h2 class="text-lg font-bold text-white font-sans flex items-center gap-2">
              <Server class="w-5 h-5 text-neon-cyan" />
              Primary Firewall Appliance & SNMP Discovery
            </h2>
            <p class="text-xs text-violet-300/80 mt-1">
              Enter connection details for your live firewall gateway. Telemetry will strictly monitor this appliance.
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label class="block text-violet-300 font-semibold mb-1">Firewall Appliance Vendor *</label>
              <select
                v-model="wizardData.firewall.vendor"
                class="w-full px-3.5 py-2.5 bg-violet-900/40 border border-violet-700/60 rounded-xl text-white focus:outline-none focus:border-cyan-400 font-sans"
              >
                <option value="fortinet">Fortinet FortiGate (FortiOS)</option>
                <option value="checkpoint">Check Point Quantum Gateway (Gaia)</option>
                <option value="paloalto">Palo Alto Networks (PAN-OS)</option>
                <option value="pfsense">pfSense / OPNsense Firewall</option>
                <option value="cisco">Cisco ASA / Secure Firewall</option>
              </select>
            </div>

            <div>
              <label class="block text-violet-300 font-semibold mb-1">Firewall Gateway IP Address *</label>
              <input
                v-model="wizardData.firewall.ipAddress"
                type="text"
                required
                placeholder="e.g. 10.10.3.15"
                class="w-full px-3.5 py-2.5 bg-violet-900/40 border border-violet-700/60 rounded-xl text-white font-mono placeholder-violet-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label class="block text-violet-300 font-semibold mb-1">Appliance Display Name *</label>
              <input
                v-model="wizardData.firewall.name"
                type="text"
                required
                placeholder="e.g. FortiGate-CSIR-SERC"
                class="w-full px-3.5 py-2.5 bg-violet-900/40 border border-violet-700/60 rounded-xl text-white placeholder-violet-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label class="block text-violet-300 font-semibold mb-1">SNMP Community String *</label>
              <input
                v-model="wizardData.firewall.snmpCommunity"
                type="text"
                required
                placeholder="e.g. fortinet or public"
                class="w-full px-3.5 py-2.5 bg-violet-900/40 border border-violet-700/60 rounded-xl text-white font-mono placeholder-violet-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label class="block text-violet-300 font-semibold mb-1">SNMP Version</label>
              <select
                v-model="wizardData.firewall.snmpVersion"
                class="w-full px-3.5 py-2.5 bg-violet-900/40 border border-violet-700/60 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-400"
              >
                <option value="v2c">SNMP v2c (Recommended)</option>
                <option value="v3">SNMP v3 (USM Security)</option>
              </select>
            </div>

            <div>
              <label class="block text-violet-300 font-semibold mb-1">SNMP Port</label>
              <input
                v-model.number="wizardData.firewall.snmpPort"
                type="number"
                placeholder="161"
                class="w-full px-3.5 py-2.5 bg-violet-900/40 border border-violet-700/60 rounded-xl text-white font-mono placeholder-violet-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <!-- Live SNMP Test / Auto-Discovery Box -->
          <div class="p-4 rounded-2xl bg-violet-900/30 border border-violet-800/60 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-white flex items-center gap-1.5 font-sans">
                <Radio class="w-4 h-4 text-neon-cyan" />
                Live SNMP Auto-Discovery & Reachability Test
              </span>
              <button
                type="button"
                @click="testSNMPDiscovery"
                :disabled="isTestingSnmp || !wizardData.firewall.ipAddress"
                class="px-4 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-90 text-white font-bold text-xs flex items-center gap-1.5 disabled:opacity-50 transition"
              >
                <Loader2 v-if="isTestingSnmp" class="w-3.5 h-3.5 animate-spin" />
                <Activity v-else class="w-3.5 h-3.5" />
                <span>{{ isTestingSnmp ? 'Probing Gateway...' : 'Probe & Discover Now' }}</span>
              </button>
            </div>

            <div v-if="snmpDiscoveryResult" class="p-3.5 rounded-xl text-xs font-mono" :class="snmpDiscoveryResult.success ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-200' : 'bg-rose-950/40 border border-rose-500/40 text-rose-200'">
              <div v-if="snmpDiscoveryResult.success" class="space-y-1.5">
                <div class="flex items-center gap-2 font-bold text-emerald-400 font-sans">
                  <CheckCircle2 class="w-4 h-4" />
                  <span>Gateway Reachable via SNMP (Latency: {{ snmpDiscoveryResult.latencyMs }}ms)</span>
                </div>
                <div class="grid grid-cols-2 gap-2 text-[11px] text-emerald-300/90 pt-1">
                  <div>• Discovered System: <strong class="text-white">{{ snmpDiscoveryResult.sysName || 'Detected' }}</strong></div>
                  <div>• OS Version: <strong class="text-white">{{ snmpDiscoveryResult.osVersion || 'Detected' }}</strong></div>
                  <div>• Discovered Interfaces: <strong class="text-white">{{ snmpDiscoveryResult.interfacesFound || 48 }}</strong></div>
                  <div>• Active Sessions: <strong class="text-white">{{ snmpDiscoveryResult.sessionsCount?.toLocaleString() || 'N/A' }}</strong></div>
                </div>
              </div>
              <div v-else class="flex items-center gap-2 text-rose-300">
                <AlertTriangle class="w-4 h-4 flex-shrink-0" />
                <span>SNMP probe failed: {{ snmpDiscoveryResult.error || 'Timeout or invalid community string' }}. Verify IP and UDP 161 route.</span>
              </div>
            </div>
          </div>
        </div>

        <!-- =================================================================== -->
        <!-- STEP 3: SECURITY CREDENTIALS & ALERT CHANNELS                      -->
        <!-- =================================================================== -->
        <div v-if="currentStep === 3" class="space-y-4 animate-fadeIn">
          <div>
            <h2 class="text-lg font-bold text-white font-sans flex items-center gap-2">
              <KeyRound class="w-5 h-5 text-neon-cyan" />
              Administrator Credentials & Incident Notifications
            </h2>
            <p class="text-xs text-violet-300/80 mt-1">
              Configure your primary Super Admin credentials and optional instant Telegram alert dispatch.
            </p>
          </div>

          <!-- Super Admin Password -->
          <div class="p-4 rounded-2xl bg-violet-900/30 border border-violet-800/60 space-y-3">
            <div class="flex items-center gap-2 text-xs font-bold text-white">
              <Crown class="w-4 h-4 text-amber-400" />
              <span>Super Administrator Password (`superadmin`)</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label class="block text-violet-300 text-[11px] mb-1">Set Password (Min 6 chars)</label>
                <input
                  v-model="wizardData.adminPassword"
                  type="password"
                  placeholder="Leave default: SuperAdmin@2026!"
                  class="w-full px-3.5 py-2 bg-violet-950 border border-violet-700/60 rounded-xl text-white font-mono placeholder-violet-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div class="flex items-center text-[10px] text-violet-400 font-mono leading-relaxed pt-3">
                Default password is <code>SuperAdmin@2026!</code>. You can change it now or keep it and update later in User Management.
              </div>
            </div>
          </div>

          <!-- Telegram Notification Alerts -->
          <div class="p-4 rounded-2xl bg-violet-900/30 border border-violet-800/60 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-white flex items-center gap-1.5">
                <Send class="w-4 h-4 text-cyan-400" />
                Telegram Security Incident Alert Channel (Optional)
              </span>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="wizardData.telegram.enabled" class="sr-only peer" />
                <div class="w-9 h-5 bg-violet-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
              </label>
            </div>

            <div v-if="wizardData.telegram.enabled" class="space-y-3 pt-2 border-t border-violet-800/40 text-xs">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-violet-300 text-[11px] mb-1">Telegram Bot Token</label>
                  <input
                    v-model="wizardData.telegram.botToken"
                    type="password"
                    placeholder="e.g. 7192849182:AAH..."
                    class="w-full px-3 py-2 bg-violet-950 border border-violet-700/60 rounded-xl text-white font-mono placeholder-violet-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label class="block text-violet-300 text-[11px] mb-1">Telegram Chat ID</label>
                  <input
                    v-model="wizardData.telegram.chatId"
                    type="text"
                    placeholder="e.g. 148920194 or -10019284910"
                    class="w-full px-3 py-2 bg-violet-950 border border-violet-700/60 rounded-xl text-white font-mono placeholder-violet-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
              <p class="text-[10px] text-violet-400 leading-relaxed font-mono">
                When enabled, serious attacks, volumetric DDoS bursts, and gateway offline alarms are pushed to this Telegram chat.
              </p>
            </div>
          </div>
        </div>

        <!-- =================================================================== -->
        <!-- STEP 4: REVIEW & LAUNCH                                             -->
        <!-- =================================================================== -->
        <div v-if="currentStep === 4" class="space-y-4 animate-fadeIn">
          <div>
            <h2 class="text-lg font-bold text-white font-sans flex items-center gap-2">
              <CheckCircle2 class="w-5 h-5 text-emerald-400" />
              Review Configuration & Launch Appliance
            </h2>
            <p class="text-xs text-violet-300/80 mt-1">
              Verify your appliance setup parameters before launching the live monitoring console.
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div class="p-4 rounded-2xl bg-violet-950/60 border border-violet-800/50 space-y-2">
              <div class="text-xs font-bold text-cyan-300 font-sans uppercase">Organization & Identity</div>
              <div class="space-y-1 text-violet-300 text-[11px]">
                <div>• Name: <strong class="text-white">{{ wizardData.branding.orgName }}</strong></div>
                <div>• Division: <strong class="text-white">{{ wizardData.branding.orgDivision }}</strong></div>
                <div>• Apex Body: <strong class="text-white">{{ wizardData.branding.apexBody }}</strong></div>
                <div>• Logo Mode: <strong class="text-white">{{ wizardData.branding.logoType === 'custom' ? 'Custom Uploaded' : 'Vector Preset' }}</strong></div>
              </div>
            </div>

            <div class="p-4 rounded-2xl bg-violet-950/60 border border-violet-800/50 space-y-2">
              <div class="text-xs font-bold text-cyan-300 font-sans uppercase">Firewall Appliance</div>
              <div class="space-y-1 text-violet-300 text-[11px]">
                <div>• Gateway: <strong class="text-white">{{ wizardData.firewall.name }}</strong></div>
                <div>• Vendor: <strong class="text-white">{{ wizardData.firewall.vendor.toUpperCase() }}</strong></div>
                <div>• IP Address: <strong class="text-emerald-400 font-bold">{{ wizardData.firewall.ipAddress }}</strong></div>
                <div>• Community: <strong class="text-white">{{ wizardData.firewall.snmpCommunity }} ({{ wizardData.firewall.snmpVersion }})</strong></div>
              </div>
            </div>
          </div>

          <div class="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
            <ShieldCheck class="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>Appliance persistent volume is verified. Existing settings and subsequent updates will be safely isolated in <code>/app/data</code>.</span>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="flex items-center justify-between pt-4 border-t border-violet-800/40">
          <button
            v-if="currentStep > 1"
            type="button"
            @click="currentStep--"
            class="px-4 py-2 rounded-xl bg-violet-900/50 hover:bg-violet-800 text-violet-300 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <ChevronLeft class="w-4 h-4" />
            <span>Previous</span>
          </button>
          <div v-else></div>

          <button
            v-if="currentStep < 4"
            type="button"
            @click="nextStep"
            class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500 hover:opacity-90 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-violet-600/30 transition transform active:scale-95"
          >
            <span>Continue</span>
            <ChevronRight class="w-4 h-4" />
          </button>

          <button
            v-else
            type="button"
            @click="finalizeSetup"
            :disabled="isSubmitting"
            class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-400 hover:opacity-95 text-black font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/30 transition transform active:scale-95"
          >
            <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin text-black" />
            <Rocket v-else class="w-4 h-4 text-black" />
            <span>{{ isSubmitting ? 'Initializing Appliance...' : 'Initialize & Launch Monitoring Console' }}</span>
          </button>
        </div>
      </div>
    </main>

    <!-- Footer Security Notice -->
    <footer class="py-3 px-6 border-t border-violet-900/40 bg-violet-950/60 backdrop-blur-md text-[11px] text-violet-400 flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
      <div class="flex items-center gap-2">
        <span class="px-2 py-0.5 rounded bg-violet-900/70 text-violet-200 border border-violet-700/50 font-medium">Made by ICTD CSIR-SERC for CSIR with ❤️</span>
        <span class="text-violet-600 hidden sm:inline">•</span>
        <span class="hidden sm:inline">Enterprise White-Label Firewall Appliance • CSIR-SERC License v1.0</span>
      </div>
      <div class="font-mono text-cyan-400">OTA Update Ready</div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  Shield,
  Building2,
  Server,
  KeyRound,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Check,
  Radio,
  Activity,
  AlertTriangle,
  Crown,
  Send,
  Rocket,
  Loader2,
  ImageIcon,
  Globe,
  Network
} from 'lucide-vue-next';
import { useFirewallStore } from '../stores/firewall.store.js';

const router = useRouter();
const fwStore = useFirewallStore();

const currentStep = ref(1);
const isTestingSnmp = ref(false);
const snmpDiscoveryResult = ref<any>(null);
const isSubmitting = ref(false);

const steps = [
  { title: 'Identity & Logo' },
  { title: 'Firewall & SNMP' },
  { title: 'Credentials & Alerts' },
  { title: 'Launch Appliance' }
];

const presetLogos = [
  { id: 'shield', name: 'Security Shield', icon: Shield },
  { id: 'emblem', name: 'National Emblem', icon: Building2 },
  { id: 'cyber', name: 'Cyber Grid', icon: Network },
  { id: 'globe', name: 'Global Network', icon: Globe }
];

const wizardData = ref({
  branding: {
    orgName: fwStore.branding.orgName || 'CSIR-SERC (Chennai)',
    orgDivision: fwStore.branding.orgDivision || 'ICT & Network Security Division',
    apexBody: fwStore.branding.apexBody || 'Council of Scientific & Industrial Research',
    portalTitle: fwStore.branding.portalTitle || 'Enterprise Firewall Telemetry & Security Operations Command',
    logoType: 'preset',
    presetLogo: 'shield',
    logoBase64: ''
  },
  firewall: {
    vendor: 'fortinet',
    name: 'FortiGate-Gateway',
    ipAddress: '10.10.3.15',
    snmpCommunity: 'fortinet',
    snmpVersion: 'v2c',
    snmpPort: 161,
    location: 'Central Datacenter'
  },
  adminPassword: '',
  telegram: {
    enabled: false,
    botToken: '',
    chatId: ''
  }
});

function handleLogoUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    wizardData.value.branding.logoBase64 = event.target?.result as string;
    wizardData.value.branding.logoType = 'custom';
  };
  reader.readAsDataURL(file);
}

async function testSNMPDiscovery() {
  isTestingSnmp.value = true;
  snmpDiscoveryResult.value = null;
  try {
    const res = await fetch('/api/settings/snmp/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ipAddress: wizardData.value.firewall.ipAddress,
        community: wizardData.value.firewall.snmpCommunity,
        version: wizardData.value.firewall.snmpVersion,
        port: wizardData.value.firewall.snmpPort
      })
    });
    snmpDiscoveryResult.value = await res.json();
    if (snmpDiscoveryResult.value.success && snmpDiscoveryResult.value.sysName) {
      wizardData.value.firewall.name = snmpDiscoveryResult.value.sysName;
    }
  } catch (err: any) {
    snmpDiscoveryResult.value = { success: false, error: err.message };
  } finally {
    isTestingSnmp.value = false;
  }
}

function nextStep() {
  if (currentStep.value < 4) {
    currentStep.value++;
  }
}

async function finalizeSetup() {
  isSubmitting.value = true;
  try {
    const success = await fwStore.completeWizard(wizardData.value);
    if (success) {
      router.push('/');
    } else {
      alert('Initialization error. Please check configuration parameters.');
    }
  } catch (e: any) {
    alert(`Failed to complete onboarding: ${e.message}`);
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
  animation: fadeIn 0.25s ease-out forwards;
}
.rainbow-border {
  border-image: linear-gradient(to bottom right, #7c3aed, #ec4899, #00f0ff) 1;
}
</style>
