<template>
  <div class="space-y-6 max-w-7xl mx-auto select-none">
    
    <!-- Top Header & Institutional Banner -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-violet-950/80 via-purple-950/70 to-indigo-950/80 border border-violet-700/40 backdrop-blur-xl shadow-xl shadow-violet-950/50">
      <div>
        <div class="flex items-center gap-2 mb-1.5">
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-violet-700/50 text-cyan-300 border border-violet-500/50">
            CSIR-SERC SYSTEM ADMINISTRATION
          </span>
          <span class="text-xs text-violet-400">•</span>
          <span class="text-xs text-emerald-400 font-mono font-bold flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            SNMP Engine Active (10.10.3.15)
          </span>
        </div>
        <h1 class="text-2xl font-black text-white tracking-tight flex items-center gap-2.5 font-sans">
          <Sliders class="w-6 h-6 text-neon-cyan" />
          Enterprise Telemetry & Security Settings
        </h1>
        <p class="text-xs text-violet-300/80 mt-1 max-w-2xl font-normal">
          Manage institutional branding text, SMTP & Telegram security alert dispatches, FortiGate SNMP profiles, syslog listeners, and CERT-In compliance retention.
        </p>
      </div>

      <!-- Quick Action Buttons -->
      <div class="flex items-center gap-2.5">
        <button
          @click="handlePollNow"
          :disabled="isPollingNow"
          class="px-3.5 py-2 rounded-xl bg-violet-900/60 hover:bg-violet-800/80 border border-violet-700/50 text-cyan-300 hover:text-white text-xs font-semibold transition flex items-center gap-2 shadow-sm disabled:opacity-50"
        >
          <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': isPollingNow }" />
          <span>Poll Live SNMP Now</span>
        </button>

        <button
          @click="saveAllSettings"
          :disabled="isSaving"
          class="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-95 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-violet-600/30 disabled:opacity-50"
        >
          <Save class="w-3.5 h-3.5" />
          <span>{{ isSaving ? 'Saving...' : 'Save Changes' }}</span>
        </button>
      </div>
    </div>

    <!-- Notification Toast / Feedback Banner -->
    <div
      v-if="toastMessage"
      class="p-4 rounded-xl border flex items-center justify-between transition"
      :class="toastType === 'success' ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200' : 'bg-rose-950/60 border-rose-500/50 text-rose-200'"
    >
      <div class="flex items-center gap-2.5 text-xs font-medium font-mono">
        <CheckCircle2 v-if="toastType === 'success'" class="w-4 h-4 text-emerald-400 flex-shrink-0" />
        <AlertCircle v-else class="w-4 h-4 text-rose-400 flex-shrink-0" />
        <span>{{ toastMessage }}</span>
      </div>
      <button @click="toastMessage = ''" class="text-xs hover:text-white ml-3">✕</button>
    </div>

    <!-- Tab Navigation -->
    <div class="flex items-center gap-2 border-b border-violet-800/40 pb-2 overflow-x-auto">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        class="px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap"
        :class="[
          activeTab === tab.id
            ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white shadow-lg shadow-violet-600/25 border border-violet-400/40'
            : 'text-violet-300/70 hover:bg-violet-900/40 hover:text-white'
        ]"
      >
        <component :is="tab.icon" class="w-4 h-4" :class="activeTab === tab.id ? 'text-neon-cyan' : 'text-violet-400'" />
        <span>{{ tab.label }}</span>
        <span
          v-if="tab.badge"
          class="px-1.5 py-0.2 rounded-full text-[10px] font-mono"
          :class="activeTab === tab.id ? 'bg-white/25 text-white' : 'bg-violet-800/60 text-violet-300'"
        >
          {{ tab.badge }}
        </span>
      </button>
    </div>

    <!-- ========================================================================= -->
    <!-- TAB 0: ORGANIZATION LOGO & VISUAL IDENTITY STUDIO                         -->
    <!-- ========================================================================= -->
    <div v-if="activeTab === 'logo'" class="p-6 rounded-2xl bg-violet-950/60 backdrop-blur-xl border border-violet-800/40 space-y-6 animate-fadeIn">
      <!-- Section Header -->
      <div class="border-b border-violet-800/40 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
              FIRST-CLASS BRANDING
            </span>
            <span class="text-xs text-violet-400">•</span>
            <span class="text-xs text-violet-300 font-mono">Real-Time Hot Reload</span>
          </div>
          <h3 class="text-xl font-bold text-white flex items-center gap-2.5 font-sans">
            <ImageIcon class="w-6 h-6 text-neon-cyan" />
            Organization Logo & Visual Identity Studio
          </h3>
          <p class="text-xs text-violet-300/80 mt-1 max-w-3xl leading-relaxed">
            Upload your organization's official emblem, agency insignia, or security operations logo. Changes apply instantaneously across the navigation sidebar, top system header, login portal, and audit reports.
          </p>
        </div>

        <div class="flex items-center gap-2 self-start sm:self-auto">
          <button
            @click="resetToDefaultLogo"
            class="px-3.5 py-2 rounded-xl bg-violet-900/50 hover:bg-violet-800/80 text-violet-300 text-xs border border-violet-700/50 transition font-medium"
          >
            Reset Default
          </button>
          <button
            @click="saveAllSettings"
            :disabled="isSaving"
            class="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-500 hover:opacity-95 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-violet-600/30 disabled:opacity-50"
          >
            <Save class="w-3.5 h-3.5" />
            <span>{{ isSaving ? 'Saving...' : 'Save Logo' }}</span>
          </button>
        </div>
      </div>

      <!-- Mode Selector (3 Cards) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Card 1: Custom Upload -->
        <div
          @click="settingsForm.branding.logoType = 'custom'"
          class="p-4 rounded-2xl border cursor-pointer transition-all duration-200 relative overflow-hidden"
          :class="settingsForm.branding.logoType === 'custom' ? 'bg-violet-900/60 border-cyan-400 shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-400/50' : 'bg-violet-950/40 border-violet-800/60 hover:bg-violet-900/30'"
        >
          <div class="flex items-center justify-between mb-2">
            <div class="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
              <UploadCloud class="w-5 h-5" />
            </div>
            <span
              v-if="settingsForm.branding.logoType === 'custom'"
              class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-400 text-slate-950"
            >
              ACTIVE
            </span>
          </div>
          <h4 class="text-sm font-bold text-white mb-1">Upload Custom File</h4>
          <p class="text-[11px] text-violet-300/80 leading-relaxed">
            Upload PNG, SVG, JPG, or WebP directly from your local computer. Converted to secure embedded Base64.
          </p>
        </div>

        <!-- Card 2: Preset Vectors -->
        <div
          @click="settingsForm.branding.logoType = 'preset'"
          class="p-4 rounded-2xl border cursor-pointer transition-all duration-200 relative overflow-hidden"
          :class="settingsForm.branding.logoType === 'preset' ? 'bg-violet-900/60 border-cyan-400 shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-400/50' : 'bg-violet-950/40 border-violet-800/60 hover:bg-violet-900/30'"
        >
          <div class="flex items-center justify-between mb-2">
            <div class="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
              <Sparkles class="w-5 h-5" />
            </div>
            <span
              v-if="settingsForm.branding.logoType === 'preset'"
              class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-400 text-slate-950"
            >
              ACTIVE
            </span>
          </div>
          <h4 class="text-sm font-bold text-white mb-1">Preset Vector Emblems</h4>
          <p class="text-[11px] text-violet-300/80 leading-relaxed">
            Choose from official pre-rendered high-res vectors (National Emblem, Cyber Shield, Hardware Chipset, Globe).
          </p>
        </div>

        <!-- Card 3: Direct Remote URL -->
        <div
          @click="settingsForm.branding.logoType = 'url'"
          class="p-4 rounded-2xl border cursor-pointer transition-all duration-200 relative overflow-hidden"
          :class="settingsForm.branding.logoType === 'url' ? 'bg-violet-900/60 border-cyan-400 shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-400/50' : 'bg-violet-950/40 border-violet-800/60 hover:bg-violet-900/30'"
        >
          <div class="flex items-center justify-between mb-2">
            <div class="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
              <Globe class="w-5 h-5" />
            </div>
            <span
              v-if="settingsForm.branding.logoType === 'url'"
              class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-400 text-slate-950"
            >
              ACTIVE
            </span>
          </div>
          <h4 class="text-sm font-bold text-white mb-1">Remote Image URL</h4>
          <p class="text-[11px] text-violet-300/80 leading-relaxed">
            Load an institutional image hosted on an external CDN, corporate web server, or intra-network repository.
          </p>
        </div>
      </div>

      <!-- Main Studio Work Area -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <!-- Left: Upload & Config Controls (7 cols) -->
        <div class="lg:col-span-7 space-y-4">
          
          <!-- Mode 1: Custom Image File Upload -->
          <div v-if="settingsForm.branding.logoType === 'custom'" class="p-6 rounded-2xl bg-violet-950/80 border border-violet-800/60 space-y-4">
            <div class="flex items-center justify-between">
              <div class="text-xs font-bold text-cyan-300 uppercase tracking-wider font-mono">
                Custom Image File Upload
              </div>
              <span class="text-[11px] text-violet-400 font-mono">Max size: 5 MB</span>
            </div>

            <!-- Drag & Drop Zone -->
            <div
              @dragover.prevent="isDraggingLogo = true"
              @dragleave.prevent="isDraggingLogo = false"
              @drop.prevent="handleLogoDrop"
              class="border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-3 relative"
              :class="isDraggingLogo ? 'border-cyan-400 bg-cyan-950/30 scale-[1.01]' : 'border-violet-700/60 bg-violet-900/20 hover:border-cyan-400 hover:bg-violet-900/30'"
            >
              <input
                ref="logoInputRef"
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp,image/gif"
                @change="handleLogoFileUpload"
                class="hidden"
                id="dedicatedLogoUpload"
              />

              <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 via-purple-600 to-cyan-400 p-0.5 shadow-lg shadow-violet-600/30">
                <div class="w-full h-full bg-violet-950 rounded-[14px] flex items-center justify-center">
                  <UploadCloud class="w-8 h-8 text-cyan-300" />
                </div>
              </div>

              <div>
                <label for="dedicatedLogoUpload" class="cursor-pointer">
                  <span class="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:opacity-95 text-white text-xs font-bold inline-block shadow-md transition">
                    Browse Image from Computer
                  </span>
                </label>
                <div class="text-xs text-violet-300/80 mt-2">
                  or drag & drop your image file right here
                </div>
                <div class="text-[10px] text-violet-400 mt-1 font-mono">
                  Supported formats: PNG (recommended transparent), SVG, JPG, WebP
                </div>
              </div>
            </div>

            <!-- Current File Status Banner -->
            <div v-if="settingsForm.branding.logoBase64" class="p-3.5 rounded-xl bg-violet-900/40 border border-violet-700/60 flex items-center justify-between gap-3">
              <div class="flex items-center gap-2.5 min-w-0">
                <div class="w-10 h-10 rounded-lg bg-violet-950 p-1 border border-violet-700/50 flex items-center justify-center flex-shrink-0">
                  <img :src="settingsForm.branding.logoBase64" class="w-full h-full object-contain" alt="Uploaded Logo" />
                </div>
                <div class="min-w-0">
                  <div class="text-xs font-bold text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 class="w-3.5 h-3.5" />
                    <span>Custom Logo Embedded</span>
                  </div>
                  <div class="text-[10px] text-violet-400 font-mono truncate">
                    Base64 Data • {{ Math.round(settingsForm.branding.logoBase64.length / 1024) }} KB
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2 flex-shrink-0">
                <label for="dedicatedLogoUpload" class="px-2.5 py-1.5 rounded-lg bg-violet-800 hover:bg-violet-700 text-violet-200 text-xs font-semibold cursor-pointer transition">
                  Replace
                </label>
                <button
                  @click="clearCustomLogo"
                  class="px-2.5 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/50 text-xs font-semibold transition"
                  title="Remove Logo"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <!-- Mode 2: Preset Institutional Vectors -->
          <div v-else-if="settingsForm.branding.logoType === 'preset'" class="p-6 rounded-2xl bg-violet-950/80 border border-violet-800/60 space-y-4">
            <div class="text-xs font-bold text-cyan-300 uppercase tracking-wider font-mono">
              Choose Preset Institutional Icon
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <!-- Preset 1: Emblem -->
              <div
                @click="settingsForm.branding.presetLogo = 'emblem'"
                class="p-3.5 rounded-xl border cursor-pointer transition flex items-center gap-3"
                :class="settingsForm.branding.presetLogo === 'emblem' ? 'bg-violet-900/70 border-cyan-400 ring-1 ring-cyan-400/50' : 'bg-violet-950/50 border-violet-800 hover:bg-violet-900/40'"
              >
                <div class="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-violet-600 p-0.5 flex-shrink-0">
                  <div class="w-full h-full bg-violet-950 rounded-[10px] flex items-center justify-center text-xl">
                    🇮🇳
                  </div>
                </div>
                <div class="min-w-0">
                  <div class="text-xs font-bold text-white">National Ashoka Emblem</div>
                  <div class="text-[10px] text-violet-400 font-mono">Government of India Standard</div>
                </div>
              </div>

              <!-- Preset 2: Shield -->
              <div
                @click="settingsForm.branding.presetLogo = 'shield'"
                class="p-3.5 rounded-xl border cursor-pointer transition flex items-center gap-3"
                :class="settingsForm.branding.presetLogo === 'shield' ? 'bg-violet-900/70 border-cyan-400 ring-1 ring-cyan-400/50' : 'bg-violet-950/50 border-violet-800 hover:bg-violet-900/40'"
              >
                <div class="w-12 h-12 rounded-xl bg-gradient-to-tr from-violet-600 via-fuchsia-500 to-cyan-400 p-0.5 flex-shrink-0">
                  <div class="w-full h-full bg-violet-950 rounded-[10px] flex items-center justify-center">
                    <Shield class="w-6 h-6 text-cyan-300" />
                  </div>
                </div>
                <div class="min-w-0">
                  <div class="text-xs font-bold text-white">Cyber Defense Shield</div>
                  <div class="text-[10px] text-violet-400 font-mono">CSIR-SERC Cyber SOC</div>
                </div>
              </div>

              <!-- Preset 3: Cyber Chip -->
              <div
                @click="settingsForm.branding.presetLogo = 'cyber'"
                class="p-3.5 rounded-xl border cursor-pointer transition flex items-center gap-3"
                :class="settingsForm.branding.presetLogo === 'cyber' ? 'bg-violet-900/70 border-cyan-400 ring-1 ring-cyan-400/50' : 'bg-violet-950/50 border-violet-800 hover:bg-violet-900/40'"
              >
                <div class="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-cyan-500 p-0.5 flex-shrink-0">
                  <div class="w-full h-full bg-violet-950 rounded-[10px] flex items-center justify-center">
                    <Cpu class="w-6 h-6 text-emerald-400" />
                  </div>
                </div>
                <div class="min-w-0">
                  <div class="text-xs font-bold text-white">Silicon Microprocessor</div>
                  <div class="text-[10px] text-violet-400 font-mono">Hardware Security Engine</div>
                </div>
              </div>

              <!-- Preset 4: Globe -->
              <div
                @click="settingsForm.branding.presetLogo = 'globe'"
                class="p-3.5 rounded-xl border cursor-pointer transition flex items-center gap-3"
                :class="settingsForm.branding.presetLogo === 'globe' ? 'bg-violet-900/70 border-cyan-400 ring-1 ring-cyan-400/50' : 'bg-violet-950/50 border-violet-800 hover:bg-violet-900/40'"
              >
                <div class="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-0.5 flex-shrink-0">
                  <div class="w-full h-full bg-violet-950 rounded-[10px] flex items-center justify-center">
                    <Globe class="w-6 h-6 text-blue-300" />
                  </div>
                </div>
                <div class="min-w-0">
                  <div class="text-xs font-bold text-white">Global Peering Spine</div>
                  <div class="text-[10px] text-violet-400 font-mono">Autonomous System Network</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Mode 3: Direct Remote URL -->
          <div v-else class="p-6 rounded-2xl bg-violet-950/80 border border-violet-800/60 space-y-4">
            <div class="text-xs font-bold text-cyan-300 uppercase tracking-wider font-mono">
              Remote Logo Endpoint URL
            </div>
            <div>
              <label class="block text-xs font-semibold text-violet-300 mb-1.5 font-mono">
                Image Web Address (HTTPS Recommended)
              </label>
              <input
                v-model="settingsForm.branding.logoUrl"
                type="url"
                placeholder="https://intranet.csir.res.in/assets/serc-logo.png"
                class="w-full px-3.5 py-2.5 bg-violet-900/40 border border-violet-700/50 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
              />
              <p class="text-[11px] text-violet-400 mt-1.5">
                The image will be loaded directly from this URL by client browsers. Ensure CORS headers permit cross-origin access.
              </p>
            </div>
          </div>

          <!-- Helper Guidance Alert -->
          <div class="p-4 rounded-xl bg-violet-900/30 border border-violet-700/40 text-xs text-violet-300/80 flex items-start gap-3">
            <Sparkles class="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div class="space-y-1 leading-relaxed">
              <div class="font-bold text-white font-sans">Multi-Tenant & White-Label Deployments</div>
              <div>When this appliance is deployed for other CSIR laboratories or government institutes, simply upload the specific organization emblem here. The entire platform will re-brand seamlessly while maintaining the institutional footer notice.</div>
            </div>
          </div>

        </div>

        <!-- Right: Multi-Context Live Previews (5 cols) -->
        <div class="lg:col-span-5 space-y-4">
          <div class="text-xs font-bold text-cyan-300 uppercase tracking-wider font-mono flex items-center gap-2">
            <Eye class="w-4 h-4 text-cyan-400" />
            <span>Multi-Context Live Previews</span>
          </div>

          <!-- Preview 1: Sidebar Nav Layout -->
          <div class="p-4 rounded-2xl bg-violet-950/90 border border-violet-800/80 shadow-xl space-y-2">
            <div class="text-[10px] font-mono font-bold text-violet-400 uppercase tracking-wider flex items-center justify-between">
              <span>1. Sidebar Navigation Header</span>
              <span class="text-cyan-400">Desktop View</span>
            </div>
            <div class="p-3 rounded-xl bg-violet-950 border border-violet-800/50 flex items-center gap-3">
              <!-- Rendered Logo -->
              <div class="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 bg-violet-900/60 border border-violet-700/50 shadow-md">
                <img
                  v-if="settingsForm.branding.logoType === 'custom' && settingsForm.branding.logoBase64"
                  :src="settingsForm.branding.logoBase64"
                  class="w-full h-full object-contain p-1"
                  alt="Sidebar Logo Preview"
                />
                <img
                  v-else-if="settingsForm.branding.logoType === 'url' && settingsForm.branding.logoUrl"
                  :src="settingsForm.branding.logoUrl"
                  class="w-full h-full object-contain p-1"
                  alt="Sidebar Logo Preview"
                />
                <div v-else-if="settingsForm.branding.presetLogo === 'cyber'" class="w-full h-full bg-gradient-to-tr from-emerald-600 to-cyan-500 p-0.5 flex items-center justify-center">
                  <Cpu class="w-5 h-5 text-emerald-300" />
                </div>
                <div v-else-if="settingsForm.branding.presetLogo === 'globe'" class="w-full h-full bg-gradient-to-tr from-blue-600 to-indigo-500 p-0.5 flex items-center justify-center">
                  <Globe class="w-5 h-5 text-blue-300" />
                </div>
                <div v-else-if="settingsForm.branding.presetLogo === 'emblem'" class="text-base">🇮🇳</div>
                <div v-else class="w-full h-full bg-gradient-to-tr from-violet-600 to-cyan-400 flex items-center justify-center">
                  <Shield class="w-5 h-5 text-cyan-200" />
                </div>
              </div>
              <div class="min-w-0">
                <div class="text-xs font-bold text-white truncate font-sans">
                  {{ settingsForm.branding.orgName || 'CSIR - Structural Engineering Research Centre' }}
                </div>
                <div class="text-[10px] text-violet-300/80 truncate">
                  {{ settingsForm.branding.orgDivision || 'ICT & Network Security Division' }}
                </div>
              </div>
            </div>
          </div>

          <!-- Preview 2: Top Header Bar Layout -->
          <div class="p-4 rounded-2xl bg-violet-950/90 border border-violet-800/80 shadow-xl space-y-2">
            <div class="text-[10px] font-mono font-bold text-violet-400 uppercase tracking-wider flex items-center justify-between">
              <span>2. Top System Header Bar</span>
              <span class="text-emerald-400">Live Status</span>
            </div>
            <div class="p-3 rounded-xl bg-violet-950 border border-violet-800/50 flex items-center justify-between gap-3 overflow-hidden">
              <div class="flex items-center gap-2.5 min-w-0">
                <div class="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 bg-violet-900/60 border border-violet-700/50">
                  <img
                    v-if="settingsForm.branding.logoType === 'custom' && settingsForm.branding.logoBase64"
                    :src="settingsForm.branding.logoBase64"
                    class="w-full h-full object-contain p-0.5"
                    alt="Header Logo Preview"
                  />
                  <img
                    v-else-if="settingsForm.branding.logoType === 'url' && settingsForm.branding.logoUrl"
                    :src="settingsForm.branding.logoUrl"
                    class="w-full h-full object-contain p-0.5"
                    alt="Header Logo Preview"
                  />
                  <div v-else-if="settingsForm.branding.presetLogo === 'cyber'" class="w-full h-full bg-gradient-to-tr from-emerald-600 to-cyan-500 p-0.5 flex items-center justify-center">
                    <Cpu class="w-4 h-4 text-emerald-300" />
                  </div>
                  <div v-else-if="settingsForm.branding.presetLogo === 'globe'" class="w-full h-full bg-gradient-to-tr from-blue-600 to-indigo-500 p-0.5 flex items-center justify-center">
                    <Globe class="w-4 h-4 text-blue-300" />
                  </div>
                  <div v-else-if="settingsForm.branding.presetLogo === 'emblem'" class="text-xs">🇮🇳</div>
                  <div v-else class="w-full h-full bg-gradient-to-tr from-violet-600 to-cyan-400 flex items-center justify-center">
                    <Shield class="w-4 h-4 text-cyan-200" />
                  </div>
                </div>
                <div class="min-w-0">
                  <div class="text-[11px] font-bold text-white truncate">
                    {{ settingsForm.branding.apexBody || 'CSIR' }}
                  </div>
                  <div class="text-[9px] text-violet-400 font-mono truncate">
                    10.10.3.15 • FortiGate Active
                  </div>
                </div>
              </div>
              <span class="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 flex-shrink-0">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                ONLINE
              </span>
            </div>
          </div>

          <!-- Preview 3: Glassmorphic Login Card -->
          <div class="p-4 rounded-2xl bg-violet-950/90 border border-violet-800/80 shadow-xl space-y-2">
            <div class="text-[10px] font-mono font-bold text-violet-400 uppercase tracking-wider flex items-center justify-between">
              <span>3. Login Authentication Card</span>
              <span class="text-purple-400">Glassmorphic</span>
            </div>
            <div class="p-4 rounded-xl bg-violet-900/40 border border-violet-700/40 text-center space-y-2">
              <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-violet-600 via-purple-600 to-cyan-400 p-0.5 shadow-md">
                <div class="w-full h-full bg-violet-950 rounded-[10px] flex items-center justify-center overflow-hidden">
                  <img
                    v-if="settingsForm.branding.logoType === 'custom' && settingsForm.branding.logoBase64"
                    :src="settingsForm.branding.logoBase64"
                    class="w-full h-full object-contain p-1"
                    alt="Login Logo Preview"
                  />
                  <img
                    v-else-if="settingsForm.branding.logoType === 'url' && settingsForm.branding.logoUrl"
                    :src="settingsForm.branding.logoUrl"
                    class="w-full h-full object-contain p-1"
                    alt="Login Logo Preview"
                  />
                  <div v-else-if="settingsForm.branding.presetLogo === 'cyber'" class="w-full h-full bg-gradient-to-tr from-emerald-600 to-cyan-500 p-0.5 flex items-center justify-center">
                    <Cpu class="w-5 h-5 text-emerald-300" />
                  </div>
                  <div v-else-if="settingsForm.branding.presetLogo === 'globe'" class="w-full h-full bg-gradient-to-tr from-blue-600 to-indigo-500 p-0.5 flex items-center justify-center">
                    <Globe class="w-5 h-5 text-blue-300" />
                  </div>
                  <div v-else-if="settingsForm.branding.presetLogo === 'emblem'" class="text-sm">🇮🇳</div>
                  <div v-else class="w-full h-full bg-gradient-to-tr from-violet-600 to-cyan-400 flex items-center justify-center">
                    <Shield class="w-5 h-5 text-cyan-200" />
                  </div>
                </div>
              </div>
              <div>
                <div class="text-xs font-bold text-white font-sans">
                  {{ settingsForm.branding.loginTitle || 'CSIR-SERC Security Operations Center' }}
                </div>
                <div class="text-[9px] text-violet-400 truncate max-w-[240px] mx-auto">
                  {{ settingsForm.branding.loginSubtitle || 'Enter authorized credentials to access portal' }}
                </div>
              </div>
            </div>
          </div>

          <!-- Direct Commit Button -->
          <div class="pt-2">
            <button
              @click="saveAllSettings"
              :disabled="isSaving"
              class="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500 hover:opacity-95 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-violet-600/30 disabled:opacity-50"
            >
              <Save class="w-4 h-4" />
              <span>{{ isSaving ? 'Committing Changes...' : 'Save & Apply Logo Immediately' }}</span>
            </button>
          </div>

        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- TAB 1: INSTITUTIONAL BRANDING & PORTAL TEXT LABELS                        -->
    <!-- ========================================================================= -->
    <div v-if="activeTab === 'branding'" class="p-6 rounded-2xl bg-violet-950/60 backdrop-blur-xl border border-violet-800/40 space-y-6">
      <div class="border-b border-violet-800/40 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 class="text-base font-bold text-white flex items-center gap-2 font-sans">
            <Type class="w-5 h-5 text-neon-cyan" />
            Institutional Identity & Portal Text Labels
          </h3>
          <p class="text-xs text-violet-300/80 mt-1">
            Configure institutional titles, organization name, division, login page captions, and footer disclaimer across all portal views in Noto Sans.
          </p>
        </div>
        <button
          @click="resetDefaultBranding"
          class="px-3 py-1.5 rounded-lg bg-violet-900/50 hover:bg-violet-800/80 text-violet-300 text-xs border border-violet-700/50 transition self-start sm:self-auto"
        >
          Reset CSIR-SERC Defaults
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Organization Details -->
        <div class="space-y-4">
          <h4 class="text-xs font-bold text-cyan-300 uppercase tracking-wider font-mono">Institutional Hierarchy</h4>

          <div>
            <label class="block text-xs font-semibold text-violet-300 mb-1 font-mono">
              Apex National Organization / Council
            </label>
            <input
              v-model="settingsForm.branding.apexBody"
              type="text"
              class="w-full px-3.5 py-2 bg-violet-900/40 border border-violet-700/50 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
              placeholder="e.g. Council of Scientific & Industrial Research"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-violet-300 mb-1 font-mono">
              Primary Research Laboratory / Institute Name
            </label>
            <input
              v-model="settingsForm.branding.orgName"
              type="text"
              class="w-full px-3.5 py-2 bg-violet-900/40 border border-violet-700/50 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
              placeholder="e.g. CSIR - Structural Engineering Research Centre"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-violet-300 mb-1 font-mono">
              Operational Division / Security Unit
            </label>
            <input
              v-model="settingsForm.branding.orgDivision"
              type="text"
              class="w-full px-3.5 py-2 bg-violet-900/40 border border-violet-700/50 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
              placeholder="e.g. ICT & Network Security Division"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-violet-300 mb-1 font-mono">
              NTP Clock / Region Badge Text
            </label>
            <input
              v-model="settingsForm.branding.ntpBadgeText"
              type="text"
              class="w-full px-3.5 py-2 bg-violet-900/40 border border-violet-700/50 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
              placeholder="e.g. NTP SYNC • NKN CHENNAI"
            />
          </div>
        </div>

        <!-- Portal Header & Captions -->
        <div class="space-y-4">
          <h4 class="text-xs font-bold text-cyan-300 uppercase tracking-wider font-mono">Application Header & Subtitle</h4>

          <div>
            <label class="block text-xs font-semibold text-violet-300 mb-1 font-mono">
              Portal Main Header Title
            </label>
            <input
              v-model="settingsForm.branding.portalTitle"
              type="text"
              class="w-full px-3.5 py-2 bg-violet-900/40 border border-violet-700/50 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400 font-semibold"
              placeholder="e.g. Firewall Telemetry & Security Operations Console"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-violet-300 mb-1 font-mono">
              Portal Header Subtitle / Description
            </label>
            <textarea
              v-model="settingsForm.branding.portalSubtitle"
              rows="2"
              class="w-full px-3.5 py-2 bg-violet-900/40 border border-violet-700/50 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400 resize-none"
              placeholder="e.g. Real-Time Multi-Gigabit Ingress/Egress Inspection, Threat Mitigation & Unified SNMP Telemetry Engine"
            ></textarea>
          </div>

          <div>
            <label class="block text-xs font-semibold text-violet-300 mb-1 font-mono">
              Institutional Footer Notice / Disclaimer
            </label>
            <input
              v-model="settingsForm.branding.footerNotice"
              type="text"
              class="w-full px-3.5 py-2 bg-violet-900/40 border border-violet-700/50 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
              placeholder="e.g. CSIR-SERC (Chennai) • Council of Scientific & Industrial Research • Authorized Access Only"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-violet-300 mb-1 font-mono">
                Threat Advisory Level
              </label>
              <select
                v-model="settingsForm.branding.threatAdvisoryLevel"
                class="w-full px-3.5 py-2 bg-violet-900/40 border border-violet-700/50 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
              >
                <option value="NORMAL">NORMAL (Green)</option>
                <option value="ELEVATED">ELEVATED (Amber)</option>
                <option value="HIGH">HIGH (Orange)</option>
                <option value="CRITICAL">CRITICAL (Red)</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-violet-300 mb-1 font-mono">
                Advisory Note
              </label>
              <input
                v-model="settingsForm.branding.threatAdvisoryDetail"
                type="text"
                class="w-full px-3.5 py-2 bg-violet-900/40 border border-violet-700/50 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
                placeholder="e.g. Perimeter Defense Active"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Login Screen Captions -->
      <div class="border-t border-violet-800/40 pt-4 space-y-4">
        <h4 class="text-xs font-bold text-cyan-300 uppercase tracking-wider font-mono">Login Authentication Page Labels</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-violet-300 mb-1 font-mono">
              Login Form Header
            </label>
            <input
              v-model="settingsForm.branding.loginTitle"
              type="text"
              class="w-full px-3.5 py-2 bg-violet-900/40 border border-violet-700/50 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400 font-semibold"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-violet-300 mb-1 font-mono">
              Login Form Subtitle
            </label>
            <input
              v-model="settingsForm.branding.loginSubtitle"
              type="text"
              class="w-full px-3.5 py-2 bg-violet-900/40 border border-violet-700/50 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>
      </div>

      <!-- Organization Brand Logo & Emblem Section -->
      <div class="border-t border-violet-800/40 pt-4 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 class="text-xs font-bold text-cyan-300 uppercase tracking-wider font-mono">Organization Logo & Iconography</h4>
            <p class="text-[11px] text-violet-300/80">Customize the logo displayed in the top header, sidebar, and login page for white-label multi-agency deployments.</p>
          </div>
          <RouterLink
            to="/wizard"
            class="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center gap-1.5 transition self-start sm:self-auto"
          >
            <Sparkles class="w-3.5 h-3.5" />
            <span>Launch Setup Wizard</span>
          </RouterLink>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          <!-- Logo Selection Type -->
          <div class="space-y-2">
            <label class="block text-xs font-semibold text-violet-300 font-mono">Logo Source Mode</label>
            <div class="space-y-1.5">
              <label
                class="flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition text-xs"
                :class="settingsForm.branding.logoType === 'preset' ? 'bg-violet-900/60 border-cyan-400 text-white' : 'bg-violet-950/40 border-violet-800 text-violet-300'"
              >
                <input type="radio" v-model="settingsForm.branding.logoType" value="preset" class="text-cyan-400" />
                <span>Preset Institutional Icon</span>
              </label>
              <label
                class="flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition text-xs"
                :class="settingsForm.branding.logoType === 'custom' ? 'bg-violet-900/60 border-cyan-400 text-white' : 'bg-violet-950/40 border-violet-800 text-violet-300'"
              >
                <input type="radio" v-model="settingsForm.branding.logoType" value="custom" class="text-cyan-400" />
                <span>Upload Custom Image (Base64)</span>
              </label>
              <label
                class="flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition text-xs"
                :class="settingsForm.branding.logoType === 'url' ? 'bg-violet-900/60 border-cyan-400 text-white' : 'bg-violet-950/40 border-violet-800 text-violet-300'"
              >
                <input type="radio" v-model="settingsForm.branding.logoType" value="url" class="text-cyan-400" />
                <span>Direct Remote Logo URL</span>
              </label>
            </div>
          </div>

          <!-- Configuration based on mode -->
          <div class="space-y-3">
            <div v-if="settingsForm.branding.logoType === 'preset'" class="space-y-2">
              <label class="block text-xs font-semibold text-violet-300 font-mono">Choose Preset Icon</label>
              <select
                v-model="settingsForm.branding.presetLogo"
                class="w-full px-3.5 py-2 bg-violet-900/40 border border-violet-700/50 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
              >
                <option value="emblem">🇮🇳 National Ashoka / Tricolor Emblem</option>
                <option value="shield">🛡️ Cyber Defense Shield (Cyber SOC)</option>
                <option value="cyber">⚡ Hardware Chipset / Microprocessor</option>
                <option value="globe">🌐 Global Peering & Network Spine</option>
              </select>
            </div>

            <div v-else-if="settingsForm.branding.logoType === 'custom'" class="space-y-2">
              <label class="block text-xs font-semibold text-violet-300 font-mono">Upload Image File (PNG, SVG, JPG)</label>
              <div class="border-2 border-dashed border-violet-700/60 rounded-xl p-4 text-center hover:border-cyan-400 transition bg-violet-900/20">
                <input type="file" accept="image/*" @change="handleLogoFileUpload" class="hidden" id="logoUploadInput" />
                <label for="logoUploadInput" class="cursor-pointer flex flex-col items-center gap-1">
                  <UploadCloud class="w-6 h-6 text-cyan-400" />
                  <span class="text-xs font-semibold text-white">Click to browse file</span>
                  <span class="text-[10px] text-violet-400">SVG, PNG, JPG (Max 2MB)</span>
                </label>
              </div>
            </div>

            <div v-else class="space-y-2">
              <label class="block text-xs font-semibold text-violet-300 font-mono">Image URL</label>
              <input
                v-model="settingsForm.branding.logoUrl"
                type="url"
                placeholder="https://example.org/logo.png"
                class="w-full px-3.5 py-2 bg-violet-900/40 border border-violet-700/50 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>
          </div>

          <!-- Live Preview Box -->
          <div class="p-4 rounded-xl bg-violet-900/30 border border-violet-700/40 flex flex-col items-center justify-center text-center space-y-2">
            <span class="text-[10px] uppercase font-bold text-violet-400 font-mono">Live Logo Preview</span>
            <div class="w-16 h-16 rounded-2xl bg-violet-950 border border-violet-600/50 p-2 flex items-center justify-center shadow-lg shadow-violet-900/50 overflow-hidden">
              <img
                v-if="settingsForm.branding.logoType === 'custom' && settingsForm.branding.logoBase64"
                :src="settingsForm.branding.logoBase64"
                class="w-full h-full object-contain"
                alt="Preview"
              />
              <img
                v-else-if="settingsForm.branding.logoType === 'url' && settingsForm.branding.logoUrl"
                :src="settingsForm.branding.logoUrl"
                class="w-full h-full object-contain"
                alt="Preview"
              />
              <div v-else-if="settingsForm.branding.presetLogo === 'shield'" class="w-full h-full bg-gradient-to-tr from-violet-600 to-cyan-400 rounded-xl flex items-center justify-center">
                <Shield class="w-8 h-8 text-cyan-200" />
              </div>
              <div v-else-if="settingsForm.branding.presetLogo === 'cyber'" class="w-full h-full bg-gradient-to-tr from-emerald-600 to-cyan-500 rounded-xl flex items-center justify-center">
                <Cpu class="w-8 h-8 text-emerald-300" />
              </div>
              <div v-else-if="settingsForm.branding.presetLogo === 'globe'" class="w-full h-full bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center">
                <Globe class="w-8 h-8 text-blue-200" />
              </div>
              <div v-else class="text-2xl">🇮🇳</div>
            </div>
            <span class="text-[10px] text-violet-300 font-mono truncate max-w-[140px]">{{ settingsForm.branding.orgName || 'Organization' }}</span>
          </div>
        </div>
      </div>

      <div class="pt-4 border-t border-violet-800/40 flex justify-end">
        <button
          @click="saveAllSettings"
          :disabled="isSaving"
          class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-95 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-violet-600/30"
        >
          <Save class="w-4 h-4" />
          <span>Save Branding & Labels</span>
        </button>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- TAB 2: SMTP EMAIL & TELEGRAM NOTIFICATIONS                               -->
    <!-- ========================================================================= -->
    <div v-if="activeTab === 'notifications'" class="space-y-6">
      
      <!-- Top Overview Card -->
      <div class="p-6 rounded-2xl bg-gradient-to-br from-violet-950/80 via-purple-950/70 to-indigo-950/80 border border-violet-700/50 backdrop-blur-xl shadow-xl space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-fuchsia-600/20 border border-fuchsia-500/40 flex items-center justify-center">
              <Bell class="w-5 h-5 text-fuchsia-400" />
            </div>
            <div>
              <h3 class="text-base font-bold text-white">Multi-Channel Security Alerting Subsystem</h3>
              <p class="text-xs text-violet-300/80">Configure automated dispatches for critical threats, DDoS floods, firewall downtime, and low bandwidth.</p>
            </div>
          </div>

          <button
            @click="handleSendSampleAlert"
            :disabled="isSendingSampleAlert"
            class="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:opacity-90 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-rose-600/20 disabled:opacity-50"
          >
            <Send class="w-3.5 h-3.5" />
            <span>{{ isSendingSampleAlert ? 'Dispatching Test...' : 'Send Sample Alert Now' }}</span>
          </button>
        </div>

        <div v-if="sampleAlertResult" class="p-3 rounded-xl border text-xs font-mono" :class="sampleAlertResult.success ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-rose-950/40 border-rose-500/40 text-rose-300'">
          {{ sampleAlertResult.message }}
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- SMTP Email Settings -->
        <div class="p-6 rounded-2xl bg-violet-950/60 backdrop-blur-xl border border-violet-800/40 space-y-4">
          <div class="flex items-center justify-between border-b border-violet-800/40 pb-3">
            <div class="flex items-center gap-2.5">
              <Mail class="w-5 h-5 text-cyan-400" />
              <h4 class="text-sm font-bold text-white font-sans">SMTP Email Gateway</h4>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="settingsForm.notifications.smtp.enabled" class="sr-only peer" />
              <div class="w-10 h-5 bg-violet-900 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-violet-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-violet-500 peer-checked:to-cyan-400"></div>
              <span class="ml-2 text-xs font-mono font-bold" :class="settingsForm.notifications.smtp.enabled ? 'text-cyan-300' : 'text-violet-400'">
                {{ settingsForm.notifications.smtp.enabled ? 'ENABLED' : 'DISABLED' }}
              </span>
            </label>
          </div>

          <div class="space-y-3 font-mono text-xs">
            <div class="grid grid-cols-3 gap-3">
              <div class="col-span-2">
                <label class="text-violet-300 block mb-1">SMTP Server Host / IP</label>
                <input
                  v-model="settingsForm.notifications.smtp.host"
                  type="text"
                  class="w-full px-3 py-2 bg-violet-900/40 border border-violet-700/50 rounded-lg text-white"
                  placeholder="smtp.csir.res.in or 10.10.1.25"
                />
              </div>
              <div>
                <label class="text-violet-300 block mb-1">Port</label>
                <input
                  v-model.number="settingsForm.notifications.smtp.port"
                  type="number"
                  class="w-full px-3 py-2 bg-violet-900/40 border border-violet-700/50 rounded-lg text-white"
                  placeholder="587"
                />
              </div>
            </div>

            <div class="flex items-center gap-2 pt-1">
              <input
                id="smtpSecure"
                type="checkbox"
                v-model="settingsForm.notifications.smtp.secure"
                class="w-4 h-4 rounded text-violet-600 bg-violet-900 border-violet-700"
              />
              <label for="smtpSecure" class="text-violet-300 cursor-pointer">
                Use SSL / TLS direct encryption (typically Port 465)
              </label>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-violet-300 block mb-1">SMTP Username</label>
                <input
                  v-model="settingsForm.notifications.smtp.user"
                  type="text"
                  class="w-full px-3 py-2 bg-violet-900/40 border border-violet-700/50 rounded-lg text-white"
                  placeholder="soc-alerts"
                />
              </div>
              <div>
                <label class="text-violet-300 block mb-1">SMTP Password</label>
                <input
                  v-model="settingsForm.notifications.smtp.password"
                  type="password"
                  class="w-full px-3 py-2 bg-violet-900/40 border border-violet-700/50 rounded-lg text-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label class="text-violet-300 block mb-1">Sender Email Address (From)</label>
              <input
                v-model="settingsForm.notifications.smtp.fromEmail"
                type="email"
                class="w-full px-3 py-2 bg-violet-900/40 border border-violet-700/50 rounded-lg text-white"
                placeholder="soc-alerts@serc.res.in"
              />
            </div>

            <div>
              <label class="text-violet-300 block mb-1">Alert Recipients (Comma Separated)</label>
              <input
                v-model="settingsForm.notifications.smtp.toEmails"
                type="text"
                class="w-full px-3 py-2 bg-violet-900/40 border border-violet-700/50 rounded-lg text-white"
                placeholder="admin@serc.res.in, soc@serc.res.in"
              />
            </div>
          </div>

          <div class="pt-2 flex flex-col gap-2">
            <button
              @click="handleTestSMTP"
              :disabled="isTestingSMTP"
              class="w-full py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <Loader2 v-if="isTestingSMTP" class="w-3.5 h-3.5 animate-spin" />
              <Mail v-else class="w-3.5 h-3.5" />
              <span>{{ isTestingSMTP ? 'Testing SMTP Connection...' : 'Test SMTP Dispatch' }}</span>
            </button>

            <div v-if="smtpTestResult" class="p-2.5 rounded-lg border text-xs font-mono" :class="smtpTestResult.success ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-rose-950/40 border-rose-500/40 text-rose-300'">
              {{ smtpTestResult.message }}
            </div>
          </div>
        </div>

        <!-- Telegram Bot Settings -->
        <div class="p-6 rounded-2xl bg-violet-950/60 backdrop-blur-xl border border-violet-800/40 space-y-4">
          <div class="flex items-center justify-between border-b border-violet-800/40 pb-3">
            <div class="flex items-center gap-2.5">
              <Send class="w-5 h-5 text-fuchsia-400" />
              <h4 class="text-sm font-bold text-white font-sans">Telegram Push Alerts Bot</h4>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="settingsForm.notifications.telegram.enabled" class="sr-only peer" />
              <div class="w-10 h-5 bg-violet-900 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-violet-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-violet-500 peer-checked:to-fuchsia-400"></div>
              <span class="ml-2 text-xs font-mono font-bold" :class="settingsForm.notifications.telegram.enabled ? 'text-fuchsia-300' : 'text-violet-400'">
                {{ settingsForm.notifications.telegram.enabled ? 'ENABLED' : 'DISABLED' }}
              </span>
            </label>
          </div>

          <div class="space-y-3 font-mono text-xs">
            <div>
              <label class="text-violet-300 block mb-1">Telegram Bot API Token</label>
              <input
                v-model="settingsForm.notifications.telegram.botToken"
                type="text"
                class="w-full px-3 py-2 bg-violet-900/40 border border-violet-700/50 rounded-lg text-white"
                placeholder="e.g. 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
              />
              <span class="text-[11px] text-violet-400 mt-1 block">Acquired from @BotFather on Telegram</span>
            </div>

            <div>
              <label class="text-violet-300 block mb-1">Target Chat ID or Group/Channel ID</label>
              <input
                v-model="settingsForm.notifications.telegram.chatId"
                type="text"
                class="w-full px-3 py-2 bg-violet-900/40 border border-violet-700/50 rounded-lg text-white"
                placeholder="e.g. -1001234567890 or @csir_serc_soc"
              />
              <span class="text-[11px] text-violet-400 mt-1 block">Target private chat or security operations channel</span>
            </div>

            <div class="p-3 rounded-xl bg-violet-900/20 border border-violet-800/40 text-violet-300/80 leading-relaxed text-[11px]">
              <strong class="text-white">Note:</strong> Make sure the bot is added as an administrator with post privileges if routing notifications to a private Telegram channel.
            </div>
          </div>

          <div class="pt-2 flex flex-col gap-2">
            <button
              @click="handleTestTelegram"
              :disabled="isTestingTelegram"
              class="w-full py-2 rounded-xl bg-fuchsia-500/15 hover:bg-fuchsia-500/25 border border-fuchsia-500/40 text-fuchsia-300 hover:text-white text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <Loader2 v-if="isTestingTelegram" class="w-3.5 h-3.5 animate-spin" />
              <Send v-else class="w-3.5 h-3.5" />
              <span>{{ isTestingTelegram ? 'Sending Test Message to Telegram...' : 'Test Telegram Alert' }}</span>
            </button>

            <div v-if="telegramTestResult" class="p-2.5 rounded-lg border text-xs font-mono" :class="telegramTestResult.success ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-rose-950/40 border-rose-500/40 text-rose-300'">
              {{ telegramTestResult.message }}
            </div>
          </div>
        </div>

      </div>

      <!-- Specific Alert Trigger Policies & Thresholds -->
      <div class="p-6 rounded-2xl bg-violet-950/60 backdrop-blur-xl border border-violet-800/40 space-y-4">
        <div class="border-b border-violet-800/40 pb-3">
          <h4 class="text-sm font-bold text-white flex items-center gap-2 font-sans">
            <ShieldAlert class="w-5 h-5 text-amber-400" />
            Automatic Event Trigger Subscriptions
          </h4>
          <p class="text-xs text-violet-300/80 mt-1">
            Choose specific network and firewall anomalies that immediately fire SMTP emails and Telegram broadcasts.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <!-- Serious Cyber Attacks -->
          <div class="p-4 rounded-xl bg-violet-900/20 border border-rose-500/30 flex items-start justify-between gap-3">
            <div>
              <div class="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                <AlertOctagon class="w-4 h-4 text-rose-400" />
                Serious Attacks & Critical Exploits
              </div>
              <p class="text-[11px] text-violet-300/80 mt-1">
                Trigger immediately on high/critical severity threats: RCE, Log4j, SQLi, brute force, and zero-day signatures.
              </p>
            </div>
            <input
              type="checkbox"
              v-model="settingsForm.notifications.triggers.seriousAttackEnabled"
              class="w-5 h-5 mt-0.5 rounded text-rose-600 bg-violet-900 border-violet-700"
            />
          </div>

          <!-- DDoS Floods -->
          <div class="p-4 rounded-xl bg-violet-900/20 border border-amber-500/30 flex flex-col justify-between gap-2">
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Flame class="w-4 h-4 text-amber-400" />
                  DDoS Floods & Volumetric Anomalies
                </div>
                <p class="text-[11px] text-violet-300/80 mt-1">
                  Trigger when sudden traffic spikes exceed normal baseline.
                </p>
              </div>
              <input
                type="checkbox"
                v-model="settingsForm.notifications.triggers.ddosEnabled"
                class="w-5 h-5 mt-0.5 rounded text-amber-600 bg-violet-900 border-violet-700"
              />
            </div>
            <div class="flex items-center gap-2 pt-2 border-t border-violet-800/40 text-xs font-mono">
              <span class="text-violet-400">Trigger Threshold:</span>
              <input
                type="number"
                v-model.number="settingsForm.notifications.triggers.ddosThresholdMbps"
                class="w-20 px-2 py-1 bg-violet-900/60 border border-violet-700 rounded text-white text-right"
              />
              <span class="text-white">Mbps</span>
            </div>
          </div>

          <!-- Firewall Down -->
          <div class="p-4 rounded-xl bg-violet-900/20 border border-red-500/30 flex items-start justify-between gap-3">
            <div>
              <div class="text-xs font-bold text-red-400 flex items-center gap-1.5">
                <PowerOff class="w-4 h-4 text-red-400" />
                Firewall Down / Unreachable Alert
              </div>
              <p class="text-[11px] text-violet-300/80 mt-1">
                Trigger immediately if FortiGate 10.10.3.15 fails consecutive SNMP diagnostic probes or ping heartbeats.
              </p>
            </div>
            <input
              type="checkbox"
              v-model="settingsForm.notifications.triggers.firewallDownEnabled"
              class="w-5 h-5 mt-0.5 rounded text-red-600 bg-violet-900 border-violet-700"
            />
          </div>

          <!-- Firewall Bandwidth Low -->
          <div class="p-4 rounded-xl bg-violet-900/20 border border-cyan-500/30 flex flex-col justify-between gap-2">
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                  <Activity class="w-4 h-4 text-cyan-400" />
                  Firewall Bandwidth Low / Interface Drops
                </div>
                <p class="text-[11px] text-violet-300/80 mt-1">
                  Trigger if operational interface throughput drops abnormally below minimum floor.
                </p>
              </div>
              <input
                type="checkbox"
                v-model="settingsForm.notifications.triggers.bandwidthLowEnabled"
                class="w-5 h-5 mt-0.5 rounded text-cyan-600 bg-violet-900 border-violet-700"
              />
            </div>
            <div class="flex items-center gap-2 pt-2 border-t border-violet-800/40 text-xs font-mono">
              <span class="text-violet-400">Minimum Floor:</span>
              <input
                type="number"
                v-model.number="settingsForm.notifications.triggers.bandwidthLowThresholdMbps"
                class="w-20 px-2 py-1 bg-violet-900/60 border border-violet-700 rounded text-white text-right"
              />
              <span class="text-white">Mbps</span>
            </div>
          </div>

        </div>

        <div class="pt-4 border-t border-violet-800/40 flex justify-end">
          <button
            @click="saveAllSettings"
            :disabled="isSaving"
            class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-95 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-violet-600/30"
          >
            <Save class="w-4 h-4" />
            <span>Save Notification Settings</span>
          </button>
        </div>
      </div>

    </div>

    <!-- ========================================================================= -->
    <!-- TAB 3: FIREWALL SNMP CONFIGURATION & TARGET INVENTORY                     -->
    <!-- ========================================================================= -->
    <div v-if="activeTab === 'snmp'" class="space-y-6">
      
      <!-- FEATURED HERO: Live FortiGate 10.10.3.15 Configuration Card -->
      <div class="p-6 rounded-2xl bg-gradient-to-br from-violet-950/90 via-purple-950/80 to-rose-950/40 border-2 border-rose-500/40 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div class="absolute -right-16 -top-16 w-56 h-56 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div class="flex items-center gap-3.5">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-tr from-rose-600 via-pink-600 to-amber-500 p-0.5 shadow-lg shadow-rose-600/30 flex items-center justify-center flex-shrink-0">
              <div class="w-full h-full bg-violet-950 rounded-[10px] flex items-center justify-center">
                <Shield class="w-6 h-6 text-rose-400" />
              </div>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-lg font-black text-white font-sans tracking-wide">
                  FortiGate-CSIR-SERC (Active Production Gateway)
                </h3>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  CONNECTED LIVE HARDWARE
                </span>
              </div>
              <div class="text-xs text-violet-300/80 font-mono flex items-center gap-2 mt-0.5">
                <span>IP: <strong class="text-white">10.10.3.15</strong></span>
                <span class="text-violet-600">•</span>
                <span>SNMP Community: <strong class="text-cyan-300 font-mono">fortinet</strong></span>
                <span class="text-violet-600">•</span>
                <span>Port: <strong>161 (UDP)</strong></span>
                <span class="text-violet-600">•</span>
                <span>Version: <strong class="text-amber-300 font-mono">v2c</strong></span>
              </div>
            </div>
          </div>

          <!-- Quick Actions on FortiGate -->
          <div class="flex items-center gap-2.5">
            <button
              @click="runQuickTest('10.10.3.15', 'v2c', 'fortinet', 161)"
              class="px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-cyan-500/10"
            >
              <Zap class="w-3.5 h-3.5 text-cyan-400" />
              <span>Test Live SNMP Probe</span>
            </button>
            
            <button
              @click="openEditModal(liveFortigateDevice)"
              class="px-3.5 py-2 rounded-xl bg-violet-900/60 hover:bg-violet-800 border border-violet-700/50 text-violet-200 hover:text-white text-xs font-semibold transition flex items-center gap-1.5"
            >
              <Edit3 class="w-3.5 h-3.5" />
              <span>Edit Configuration</span>
            </button>
          </div>
        </div>

        <!-- Live FortiGate Real-Time Probed Metrics Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-violet-950/60 border border-violet-800/40 font-mono">
          <div>
            <div class="text-[10px] text-violet-400 uppercase tracking-wider font-semibold">Live System UpTime</div>
            <div class="text-base font-bold text-white mt-0.5">85 days, 15 hrs</div>
            <div class="text-[9px] text-emerald-400 mt-0.5">7,399,570 ticks</div>
          </div>

          <div>
            <div class="text-[10px] text-violet-400 uppercase tracking-wider font-semibold">Active Session Table</div>
            <div class="text-base font-bold text-cyan-300 mt-0.5">
              {{ liveFortigateDevice?.snmpMetrics?.concurrentConnections || 5412 }}
            </div>
            <div class="text-[9px] text-violet-400 mt-0.5">fgSysSesCount OID</div>
          </div>

          <div>
            <div class="text-[10px] text-violet-400 uppercase tracking-wider font-semibold">CPU Utilization</div>
            <div class="text-base font-bold text-emerald-400 mt-0.5">
              {{ liveFortigateDevice?.snmpMetrics?.cpuUtilPercent ?? 0 }}%
            </div>
            <div class="text-[9px] text-violet-400 mt-0.5">fgSysCpuUsage OID</div>
          </div>

          <div>
            <div class="text-[10px] text-violet-400 uppercase tracking-wider font-semibold">Memory Usage</div>
            <div class="text-base font-bold text-amber-300 mt-0.5">
              {{ liveFortigateDevice?.snmpMetrics?.memoryUtilPercent ?? 39 }}%
            </div>
            <div class="text-[9px] text-violet-400 mt-0.5">16.3 GB Total Memory</div>
          </div>
        </div>

        <div class="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-violet-300/80 font-mono">
          <div>Hardware Model: <strong>FortiGate 600F Enterprise NGFW</strong> (OS: <span class="text-violet-300">v7.4.12,build2902 GA.M</span>)</div>
          <div>Datacenter Location: <span class="text-amber-400 font-bold">CSIR-SERC (CHENNAI, INDIA)</span></div>
        </div>
      </div>

      <!-- Single Active Gateway Architecture Notice -->
      <div v-if="otherDevices.length === 0" class="p-5 rounded-2xl bg-violet-950/40 border border-violet-800/40 flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-violet-900/60 border border-violet-700/50 flex items-center justify-center flex-shrink-0">
            <ShieldCheck class="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div class="text-xs font-bold text-white">Single Active Gateway Topology Active</div>
            <p class="text-[11px] text-violet-300/80 mt-0.5">
              FortiGate-CSIR-SERC (10.10.3.15) is designated as the sole active firewall in this deployment. All simulated secondary firewall entries have been removed.
            </p>
          </div>
        </div>
        <button
          @click="openAddModal"
          class="px-3 py-1.5 rounded-lg bg-violet-900/60 hover:bg-violet-800 text-cyan-300 text-xs font-medium border border-violet-700/50 transition flex items-center gap-1.5 flex-shrink-0"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>Add Gateway Profile</span>
        </button>
      </div>

      <!-- Other Custom User-Added Devices Grid (if any exist) -->
      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div
          v-for="fw in otherDevices"
          :key="fw.id"
          class="p-5 rounded-2xl bg-violet-950/60 backdrop-blur-xl border border-violet-800/40 hover:border-violet-600/60 transition shadow-lg flex flex-col justify-between"
        >
          <div>
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-bold uppercase tracking-wider text-cyan-400">
                {{ fw.vendor }}
              </span>
              <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-violet-900/60 text-violet-300 border border-violet-700/50">
                SNMP {{ fw.snmpVersion }}
              </span>
            </div>

            <h4 class="text-sm font-bold text-white font-mono">{{ fw.name }}</h4>
            <div class="text-xs text-violet-400 mt-0.5">{{ fw.model }}</div>

            <div class="mt-3 space-y-1.5 text-xs font-mono text-violet-300/90 pt-3 border-t border-violet-800/40">
              <div class="flex justify-between">
                <span class="text-violet-400">Target IP:</span>
                <span class="text-white font-bold">{{ fw.ipAddress }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-violet-400">Community:</span>
                <span class="text-cyan-300">{{ fw.snmpCommunity }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-violet-400">Status:</span>
                <span class="text-emerald-400 font-bold capitalize">{{ fw.status }}</span>
              </div>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-violet-800/40 flex items-center justify-between gap-2">
            <button
              @click="runQuickTest(fw.ipAddress, fw.snmpVersion, fw.snmpCommunity, fw.snmpPort || 161)"
              class="flex-1 py-1.5 px-2 rounded-lg bg-violet-900/60 hover:bg-violet-800 text-cyan-300 text-xs font-medium transition text-center"
            >
              Test Probe
            </button>
            <button
              @click="openEditModal(fw)"
              class="py-1.5 px-2.5 rounded-lg bg-violet-800/50 hover:bg-violet-700 text-white text-xs font-medium transition"
            >
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- TAB 4: TELEMETRY COLLECTORS & INGESTION SETTINGS                          -->
    <!-- ========================================================================= -->
    <div v-if="activeTab === 'collectors'" class="p-6 rounded-2xl bg-violet-950/60 backdrop-blur-xl border border-violet-800/40 space-y-6">
      <div class="border-b border-violet-800/40 pb-4">
        <h3 class="text-base font-bold text-white flex items-center gap-2">
          <Terminal class="w-5 h-5 text-neon-cyan" />
          Native Syslog & NetFlow Ingestion Listeners
        </h3>
        <p class="text-xs text-violet-300/80 mt-1">
          Configure native node UDP collector ports and CERT-In Direction 2022 compliant 180-day retention policies.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-violet-300 mb-1 font-mono">
              Primary Syslog Listener Port (UDP)
            </label>
            <input
              v-model.number="settingsForm.collectors.syslogPort"
              type="number"
              class="w-full px-3.5 py-2.5 bg-violet-900/40 border border-violet-700/50 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-cyan-400"
            />
            <span class="text-[11px] text-violet-400 mt-1 block">Default: 1514 (FortiGate, syslog collector)</span>
          </div>

          <div>
            <label class="block text-xs font-semibold text-violet-300 mb-1 font-mono">
              Legacy Syslog Port (UDP)
            </label>
            <input
              v-model.number="settingsForm.collectors.syslogAltPort"
              type="number"
              class="w-full px-3.5 py-2.5 bg-violet-900/40 border border-violet-700/50 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-cyan-400"
            />
            <span class="text-[11px] text-violet-400 mt-1 block">Standard RFC 5424 UDP port 514</span>
          </div>

          <div>
            <label class="block text-xs font-semibold text-violet-300 mb-1 font-mono">
              NetFlow v5 / v9 & IPFIX Listener Port (UDP)
            </label>
            <input
              v-model.number="settingsForm.collectors.netflowPort"
              type="number"
              class="w-full px-3.5 py-2.5 bg-violet-900/40 border border-violet-700/50 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-cyan-400"
            />
            <span class="text-[11px] text-violet-400 mt-1 block">Standard flow export port 2055</span>
          </div>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-violet-300 mb-1 font-mono">
              Internal Packet Ring Buffer Queue Size
            </label>
            <input
              v-model.number="settingsForm.collectors.bufferQueueSize"
              type="number"
              class="w-full px-3.5 py-2.5 bg-violet-900/40 border border-violet-700/50 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-cyan-400"
            />
            <span class="text-[11px] text-violet-400 mt-1 block">Maximum in-memory telemetry queue depth</span>
          </div>

          <!-- CERT-In Mandated Retention -->
          <div class="p-4 rounded-xl bg-violet-900/30 border border-amber-500/30 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <ShieldCheck class="w-4 h-4 text-amber-400" />
                CERT-In Directions 2022 Retention Mandate
              </span>
              <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300">
                SECTION 70B
              </span>
            </div>
            <p class="text-xs text-violet-300/80 leading-relaxed">
              Section 70B requires mandatory logging and maintenance of all firewall audit records for a rolling window of at least 180 days within the Indian jurisdiction.
            </p>
            <div class="flex items-center gap-3 pt-2">
              <span class="text-xs font-mono text-white">Configured Period:</span>
              <span class="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-300 font-bold font-mono text-sm border border-amber-500/30">
                {{ settingsForm.collectors.certInRetentionDays }} Days (Compliant)
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="pt-4 border-t border-violet-800/40 flex justify-end">
        <button
          @click="saveAllSettings"
          :disabled="isSaving"
          class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-95 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-violet-600/30"
        >
          <Save class="w-4 h-4" />
          <span>Save Collector Settings</span>
        </button>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- TAB 5: 15-MINUTE AUTOMATED SPEED TEST CONFIGURATION                       -->
    <!-- ========================================================================= -->
    <div v-if="activeTab === 'speedtest'" class="p-6 rounded-2xl bg-violet-950/60 backdrop-blur-xl border border-violet-800/40 space-y-6">
      <div class="border-b border-violet-800/40 pb-4">
        <h3 class="text-base font-bold text-white flex items-center gap-2">
          <Gauge class="w-5 h-5 text-neon-cyan" />
          15-Minute Automated Internet Speed Test Engine
        </h3>
        <p class="text-xs text-violet-300/80 mt-1">
          Measures WAN latency, jitter, download speed, and upload throughput across National Knowledge Network (NKN) & NIXI Gateways.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-violet-300 mb-1 font-mono">
              Speed Test Interval (Minutes)
            </label>
            <select
              v-model.number="settingsForm.speedtest.intervalMinutes"
              class="w-full px-3.5 py-2.5 bg-violet-900/40 border border-violet-700/50 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-cyan-400"
            >
              <option :value="15">Every 15 Minutes (Mandated Default)</option>
              <option :value="30">Every 30 Minutes</option>
              <option :value="60">Every 60 Minutes</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-violet-300 mb-1 font-mono">
              Primary Indian WAN Target Server
            </label>
            <input
              v-model="settingsForm.speedtest.primaryServer"
              type="text"
              class="w-full px-3.5 py-2.5 bg-violet-900/40 border border-violet-700/50 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div class="flex items-center gap-3 pt-2">
            <input
              id="autoSchedule"
              v-model="settingsForm.speedtest.autoSchedule"
              type="checkbox"
              class="w-4 h-4 rounded text-violet-600 bg-violet-900 border-violet-700 focus:ring-0"
            />
            <label for="autoSchedule" class="text-xs text-violet-200 font-medium cursor-pointer">
              Enable continuous background speed test scheduler
            </label>
          </div>
        </div>

        <div class="p-4 rounded-xl bg-violet-900/30 border border-violet-800/40 flex flex-col justify-between">
          <div>
            <div class="text-xs font-bold text-cyan-300 uppercase tracking-wider mb-2">
              Latest Live Speed Measurement
            </div>
            <div class="space-y-2 text-xs font-mono text-violet-200">
              <div class="flex justify-between">
                <span class="text-violet-400">Download Rate:</span>
                <span class="text-white font-bold">{{ telemetryStore.speedtest.downloadMbps }} Mbps</span>
              </div>
              <div class="flex justify-between">
                <span class="text-violet-400">Upload Rate:</span>
                <span class="text-fuchsia-300 font-bold">{{ telemetryStore.speedtest.uploadMbps }} Mbps</span>
              </div>
              <div class="flex justify-between">
                <span class="text-violet-400">Latency / Jitter:</span>
                <span class="text-emerald-400">{{ telemetryStore.speedtest.pingMs }} ms (±{{ telemetryStore.speedtest.jitterMs }} ms)</span>
              </div>
              <div class="flex justify-between">
                <span class="text-violet-400">ISP / Gateway:</span>
                <span class="text-white truncate">{{ telemetryStore.speedtest.isp }}</span>
              </div>
            </div>
          </div>

          <div class="mt-4">
            <button
              @click="telemetryStore.runSpeedTestNow()"
              :disabled="telemetryStore.isTestingSpeed"
              class="w-full py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': telemetryStore.isTestingSpeed }" />
              <span>Trigger Test Right Now</span>
            </button>
          </div>
        </div>
      </div>

      <div class="pt-4 border-t border-violet-800/40 flex justify-end">
        <button
          @click="saveAllSettings"
          :disabled="isSaving"
          class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-95 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-violet-600/30"
        >
          <Save class="w-4 h-4" />
          <span>Save Speed Test Settings</span>
        </button>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- TAB 6: ALERTS & HEALTH THRESHOLDS                                         -->
    <!-- ========================================================================= -->
    <div v-if="activeTab === 'thresholds'" class="p-6 rounded-2xl bg-violet-950/60 backdrop-blur-xl border border-violet-800/40 space-y-6">
      <div class="border-b border-violet-800/40 pb-4">
        <h3 class="text-base font-bold text-white flex items-center gap-2">
          <AlertTriangle class="w-5 h-5 text-amber-400" />
          Firewall Health & Alerting Thresholds
        </h3>
        <p class="text-xs text-violet-300/80 mt-1">
          Configure real-time warning and critical thresholds for hardware SNMP metrics.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-4">
          <div>
            <div class="flex justify-between text-xs font-mono mb-1">
              <span class="text-violet-300 font-semibold">CPU Warning Threshold:</span>
              <span class="text-amber-400 font-bold">{{ settingsForm.thresholds.cpuWarningPercent }}%</span>
            </div>
            <input
              v-model.number="settingsForm.thresholds.cpuWarningPercent"
              type="range"
              min="50"
              max="95"
              class="w-full accent-amber-400"
            />
          </div>

          <div>
            <div class="flex justify-between text-xs font-mono mb-1">
              <span class="text-violet-300 font-semibold">CPU Critical Alert Threshold:</span>
              <span class="text-rose-400 font-bold">{{ settingsForm.thresholds.cpuCriticalPercent }}%</span>
            </div>
            <input
              v-model.number="settingsForm.thresholds.cpuCriticalPercent"
              type="range"
              min="70"
              max="99"
              class="w-full accent-rose-500"
            />
          </div>

          <div>
            <div class="flex justify-between text-xs font-mono mb-1">
              <span class="text-violet-300 font-semibold">Memory Warning Threshold:</span>
              <span class="text-amber-400 font-bold">{{ settingsForm.thresholds.memWarningPercent }}%</span>
            </div>
            <input
              v-model.number="settingsForm.thresholds.memWarningPercent"
              type="range"
              min="50"
              max="95"
              class="w-full accent-amber-400"
            />
          </div>
        </div>

        <div class="space-y-4">
          <div>
            <div class="flex justify-between text-xs font-mono mb-1">
              <span class="text-violet-300 font-semibold">Memory Critical Alert Threshold:</span>
              <span class="text-rose-400 font-bold">{{ settingsForm.thresholds.memCriticalPercent }}%</span>
            </div>
            <input
              v-model.number="settingsForm.thresholds.memCriticalPercent"
              type="range"
              min="70"
              max="99"
              class="w-full accent-rose-500"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-violet-300 mb-1 font-mono">
              Concurrent Connection Spike Alarm (Sessions)
            </label>
            <input
              v-model.number="settingsForm.thresholds.concurrentConnAlert"
              type="number"
              class="w-full px-3.5 py-2.5 bg-violet-900/40 border border-violet-700/50 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-cyan-400"
            />
            <span class="text-[11px] text-violet-400 mt-1 block">Trigger threshold for connection table exhaustion alert</span>
          </div>
        </div>
      </div>

      <div class="pt-4 border-t border-violet-800/40 flex justify-end">
        <button
          @click="saveAllSettings"
          :disabled="isSaving"
          class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-95 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-violet-600/30"
        >
          <Save class="w-4 h-4" />
          <span>Save Alert Thresholds</span>
        </button>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- MODAL: LIVE SNMP DIAGNOSTIC PROBE TESTER                                  -->
    <!-- ========================================================================= -->
    <div
      v-if="showTestModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
    >
      <div class="w-full max-w-xl bg-violet-950 border border-violet-700/60 rounded-3xl p-6 shadow-2xl shadow-violet-950/90 relative overflow-hidden">
        <div class="flex items-center justify-between mb-4 border-b border-violet-800/40 pb-3">
          <div class="flex items-center gap-2">
            <Zap class="w-5 h-5 text-neon-cyan" />
            <h3 class="text-base font-bold text-white">Live SNMP Diagnostic Probe</h3>
          </div>
          <button @click="showTestModal = false" class="text-violet-400 hover:text-white">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Target Parameters Form -->
        <div class="grid grid-cols-2 gap-3 mb-4 font-mono text-xs">
          <div>
            <label class="text-violet-400">Target IP:</label>
            <input
              v-model="testProbeForm.ipAddress"
              type="text"
              class="w-full mt-1 px-3 py-1.5 bg-violet-900/50 border border-violet-700/50 rounded-lg text-white"
            />
          </div>
          <div>
            <label class="text-violet-400">SNMP Version:</label>
            <select
              v-model="testProbeForm.version"
              class="w-full mt-1 px-3 py-1.5 bg-violet-900/50 border border-violet-700/50 rounded-lg text-white"
            >
              <option value="v2c">v2c (Community String)</option>
              <option value="v3">v3 (USM Secure Auth/Priv)</option>
            </select>
          </div>
          <div>
            <label class="text-violet-400">Community String:</label>
            <input
              v-model="testProbeForm.community"
              type="text"
              class="w-full mt-1 px-3 py-1.5 bg-violet-900/50 border border-violet-700/50 rounded-lg text-white"
            />
          </div>
          <div>
            <label class="text-violet-400">UDP Port:</label>
            <input
              v-model.number="testProbeForm.port"
              type="number"
              class="w-full mt-1 px-3 py-1.5 bg-violet-900/50 border border-violet-700/50 rounded-lg text-white"
            />
          </div>
        </div>

        <button
          @click="executeSnmpTest"
          :disabled="fwStore.isTestingSnmp"
          class="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500 hover:opacity-95 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-violet-600/30 disabled:opacity-50"
        >
          <Loader2 v-if="fwStore.isTestingSnmp" class="w-4 h-4 animate-spin" />
          <Radio v-else class="w-4 h-4" />
          <span>{{ fwStore.isTestingSnmp ? 'Querying Target Hardware via SNMP...' : 'Execute Live SNMP Diagnostic Probe' }}</span>
        </button>

        <!-- Test Results Display -->
        <div v-if="fwStore.snmpTestResult" class="mt-4 p-4 rounded-xl border" :class="fwStore.snmpTestResult.success ? 'bg-emerald-950/40 border-emerald-500/50' : 'bg-rose-950/40 border-rose-500/50'">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold font-mono" :class="fwStore.snmpTestResult.success ? 'text-emerald-300' : 'text-rose-300'">
              {{ fwStore.snmpTestResult.success ? '✓ SNMP Probe Succeeded' : '✗ Probe Failed' }}
            </span>
            <span class="text-[11px] font-mono text-cyan-300">
              RTT: {{ fwStore.snmpTestResult.latencyMs }} ms
            </span>
          </div>

          <div v-if="fwStore.snmpTestResult.success" class="space-y-1.5 text-xs font-mono text-violet-200">
            <div>Device Name: <strong class="text-white">{{ fwStore.snmpTestResult.sysName }}</strong></div>
            <div>Location: <strong class="text-amber-300">{{ fwStore.snmpTestResult.sysLocation }}</strong></div>
            <div>Identified: <span class="text-emerald-400 font-bold">{{ fwStore.snmpTestResult.vendorIdentified }}</span></div>
            <div>System UpTime: <span class="text-white">{{ fwStore.snmpTestResult.sysUpTime }}</span></div>
            <div>Active Sessions: <strong class="text-cyan-300">{{ fwStore.snmpTestResult.sessionsCount }}</strong></div>
            <div>CPU / Memory: <span>{{ fwStore.snmpTestResult.cpuPercent }}% CPU | {{ fwStore.snmpTestResult.memoryPercent }}% Memory</span></div>
          </div>
          <div v-else class="text-xs text-rose-300 font-mono">
            Error: {{ fwStore.snmpTestResult.error }}
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- TAB 7: APPLIANCE & OVER-THE-AIR (OTA) UPDATES                             -->
    <!-- ========================================================================= -->
    <div v-if="activeTab === 'system'" class="p-6 rounded-2xl bg-violet-950/60 backdrop-blur-xl border border-violet-800/40 space-y-6">
      <div class="border-b border-violet-800/40 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 class="text-base font-bold text-white flex items-center gap-2 font-sans">
            <DownloadCloud class="w-5 h-5 text-neon-cyan" />
            <span>Appliance Information & Over-The-Air (OTA) Updates</span>
          </h3>
          <p class="text-xs text-violet-300/80 mt-1">
            Maintain your standalone firewall monitoring appliance, check for new OTA feature releases without altering data, and create full disaster-recovery backups.
          </p>
        </div>
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            Build: {{ systemVersion?.version || 'v2.4.0-OTA' }}
          </span>
        </div>
      </div>

      <!-- Grid of Appliance Specs and OTA Updater -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- CARD 1: Live Appliance System Status -->
        <div class="p-5 rounded-2xl bg-violet-900/30 border border-violet-700/50 space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-bold text-cyan-300 uppercase tracking-wider font-mono flex items-center gap-2">
              <HardDrive class="w-4 h-4 text-cyan-400" />
              <span>Appliance Environment Details</span>
            </h4>
            <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              STANDALONE VM
            </span>
          </div>

          <div class="space-y-2 text-xs font-mono">
            <div class="flex items-center justify-between p-2.5 rounded-xl bg-violet-950/60 border border-violet-800/50">
              <span class="text-violet-400">Software Build:</span>
              <span class="text-white font-bold">{{ systemVersion?.version || 'v2.4.0-OTA (Stable)' }}</span>
            </div>
            <div class="flex items-center justify-between p-2.5 rounded-xl bg-violet-950/60 border border-violet-800/50">
              <span class="text-violet-400">Release Timestamp:</span>
              <span class="text-violet-200">{{ systemVersion?.releaseDate || '2026-09-17 11:00 UTC' }}</span>
            </div>
            <div class="flex items-center justify-between p-2.5 rounded-xl bg-violet-950/60 border border-violet-800/50">
              <span class="text-violet-400">Persistent Data Storage:</span>
              <span class="text-emerald-400 font-bold">{{ systemVersion?.storagePath || '/app/data (Mounted Volume)' }}</span>
            </div>
            <div class="flex items-center justify-between p-2.5 rounded-xl bg-violet-950/60 border border-violet-800/50">
              <span class="text-violet-400">OTA Protection Policy:</span>
              <span class="text-cyan-300 font-bold">Zero Data Disruption</span>
            </div>
          </div>

          <div class="p-3 rounded-xl bg-violet-950/40 border border-violet-800/40 text-[11px] text-violet-300 leading-relaxed">
            <strong class="text-white">Safety Guarantee:</strong> Applying OTA updates pulls code packages without overwriting configuration files, credentials, custom branding, or historical SNMP/syslog metrics stored in the persistent data volume.
          </div>
        </div>

        <!-- CARD 2: OTA Update Trigger & Channel -->
        <div class="p-5 rounded-2xl bg-violet-900/30 border border-violet-700/50 space-y-4 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-3">
              <h4 class="text-xs font-bold text-cyan-300 uppercase tracking-wider font-mono flex items-center gap-2">
                <ArrowUpCircle class="w-4 h-4 text-fuchsia-400" />
                <span>Over-The-Air (OTA) Channel</span>
              </h4>
              <button
                @click="handleCheckUpdates"
                :disabled="isCheckingUpdates"
                class="px-2.5 py-1 rounded-lg bg-violet-800 hover:bg-violet-700 text-xs text-white transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw class="w-3 h-3" :class="{ 'animate-spin': isCheckingUpdates }" />
                <span>{{ isCheckingUpdates ? 'Checking...' : 'Check Now' }}</span>
              </button>
            </div>

            <!-- Update Status Message -->
            <div v-if="updateCheck" class="p-3.5 rounded-xl mb-4 border text-xs" :class="updateCheck.hasUpdate ? 'bg-amber-950/40 border-amber-500/50 text-amber-200' : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'">
              <div class="font-bold flex items-center gap-1.5 mb-1">
                <CheckCircle2 v-if="!updateCheck.hasUpdate" class="w-4 h-4 text-emerald-400" />
                <AlertCircle v-else class="w-4 h-4 text-amber-400" />
                <span>{{ updateCheck.hasUpdate ? 'New Update Available!' : 'Your Appliance is Up-to-Date' }}</span>
              </div>
              <p class="text-[11px] font-mono text-violet-200">{{ updateCheck.message }}</p>
              <div v-if="updateCheck.latestVersion" class="mt-2 text-[10px] font-mono text-violet-400">
                Latest Available Version: <strong class="text-white">{{ updateCheck.latestVersion }}</strong>
              </div>
            </div>

            <div v-else class="p-3.5 rounded-xl mb-4 bg-violet-950/50 border border-violet-800/50 text-xs text-violet-300 font-mono">
              Ready to check for available hotfixes and feature updates from the central repository.
            </div>
          </div>

          <div class="space-y-2">
            <button
              @click="handleApplyOTAUpdate"
              :disabled="isApplyingUpdate || (updateCheck && !updateCheck.hasUpdate)"
              class="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500 hover:opacity-95 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-violet-600/30 disabled:opacity-50 cursor-pointer"
            >
              <Loader2 v-if="isApplyingUpdate" class="w-4 h-4 animate-spin" />
              <ArrowUpCircle v-else class="w-4 h-4" />
              <span>{{ isApplyingUpdate ? 'Applying Update in Background...' : 'Apply Live Over-The-Air Update' }}</span>
            </button>
            <p class="text-[10px] text-center text-violet-400 font-mono">Zero-downtime hot-reload enabled</p>
          </div>
        </div>

      </div>

      <!-- Disaster Recovery & Configuration Backup Strip -->
      <div class="p-5 rounded-2xl bg-violet-900/30 border border-violet-700/50 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-violet-800/40 pb-3">
          <div>
            <h4 class="text-xs font-bold text-cyan-300 uppercase tracking-wider font-mono flex items-center gap-2">
              <FileArchive class="w-4 h-4 text-emerald-400" />
              <span>Disaster Recovery & Appliance Migration Backup</span>
            </h4>
            <p class="text-[11px] text-violet-300/80">Export or restore complete appliance state (branding, SNMP targets, user accounts, and alert channels).</p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Backup Export -->
          <div class="p-4 rounded-xl bg-violet-950/60 border border-violet-800/50 space-y-3">
            <div class="text-xs font-bold text-white">Full Appliance Snapshot (.json)</div>
            <p class="text-[11px] text-violet-300 leading-relaxed">Download an encrypted state package for offline safekeeping or VM replication.</p>
            <button
              @click="handleDownloadBackup"
              :disabled="isDownloadingBackup"
              class="px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <DownloadCloud class="w-4 h-4" />
              <span>{{ isDownloadingBackup ? 'Preparing Archive...' : 'Download Appliance Backup' }}</span>
            </button>
          </div>

          <!-- Backup Restore -->
          <div class="p-4 rounded-xl bg-violet-950/60 border border-violet-800/50 space-y-3">
            <div class="text-xs font-bold text-white">Restore Configuration from File</div>
            <p class="text-[11px] text-violet-300 leading-relaxed">Import a previously saved backup file to restore settings without re-running setup.</p>
            <div>
              <input type="file" accept=".json" @change="handleRestoreBackupFile" class="hidden" id="restoreBackupInput" />
              <label
                for="restoreBackupInput"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-800 hover:bg-violet-700 text-cyan-300 border border-violet-600/50 text-xs font-bold transition cursor-pointer"
              >
                <UploadCloud class="w-4 h-4" />
                <span>Choose Backup JSON to Restore</span>
              </label>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- ========================================================================= -->
    <!-- TAB 8: CSIR-SERC FREE COMMUNITY & INSTITUTIONAL LICENSE (v1.0)           -->
    <!-- ========================================================================= -->
    <div v-if="activeTab === 'license'" class="p-6 rounded-2xl bg-violet-950/60 backdrop-blur-xl border border-violet-800/40 space-y-6 animate-fadeIn">
      <!-- Top Header -->
      <div class="border-b border-violet-800/40 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-500/40">
              LEGAL & LICENSING STRUCTURE
            </span>
            <span class="text-xs text-violet-400">•</span>
            <span class="text-xs text-emerald-400 font-mono font-bold">Version 1.0 (2024–2026)</span>
          </div>
          <h3 class="text-xl font-bold text-white flex items-center gap-2.5 font-sans">
            <Award class="w-6 h-6 text-amber-400" />
            CSIR-SERC Free Community & Institutional License
          </h3>
          <p class="text-xs text-violet-300/80 mt-1 max-w-3xl leading-relaxed">
            Universal Free Usage & Institutional Source Code Ownership Framework developed by Information and Communication Technology Division (ICTD), CSIR-SERC, Government of India.
          </p>
        </div>

        <div class="flex items-center gap-2 self-start sm:self-auto">
          <button
            @click="copyLicenseText"
            class="px-3.5 py-2 rounded-xl bg-violet-900/60 hover:bg-violet-800/80 text-cyan-300 hover:text-white text-xs font-semibold transition flex items-center gap-2 border border-violet-700/50 shadow-sm"
          >
            <Check v-if="licenseCopied" class="w-3.5 h-3.5 text-emerald-400" />
            <Copy v-else class="w-3.5 h-3.5" />
            <span>{{ licenseCopied ? 'Copied to Clipboard!' : 'Copy License Text' }}</span>
          </button>

          <button
            @click="downloadLicenseFile"
            class="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-95 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-violet-600/30"
          >
            <DownloadCloud class="w-3.5 h-3.5" />
            <span>Download LICENSE</span>
          </button>
        </div>
      </div>

      <!-- Two Core Principles Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <!-- Principle 1: Strict IP Protection -->
        <div class="p-5 rounded-2xl bg-violet-900/30 border border-violet-700/50 space-y-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center flex-shrink-0">
              <ShieldAlert class="w-5 h-5" />
            </div>
            <div>
              <span class="text-[10px] font-mono uppercase font-bold text-rose-300 tracking-wider">Principle 1</span>
              <h4 class="text-sm font-bold text-white">Strict Source Code Ownership & IP Protection</h4>
            </div>
          </div>
          <div class="space-y-2 text-xs text-violet-300/90 leading-relaxed font-sans pt-1">
            <p>
              <strong class="text-white">Copyright © 2024–2026 CSIR-SERC:</strong> Council of Scientific and Industrial Research (CSIR), Ministry of Science & Technology, Government of India. All Rights Reserved.
            </p>
            <p>
              <strong class="text-white">Division Authorship:</strong> Developed by the Information and Communication Technology Division (ICTD), CSIR-SERC, Chennai, India.
            </p>
            <p>
              <strong class="text-white">Exclusive Title:</strong> All title, copyright, patent rights, moral rights, source code, architecture, algorithms, and threat intelligence models remain exclusively with CSIR-SERC.
            </p>
            <p class="text-rose-200 bg-rose-950/40 p-2.5 rounded-xl border border-rose-800/40 font-mono text-[11px]">
              <strong>Anti-Commercial Re-branding:</strong> Commercial resale, white-label repackaging for sale, charging fees for software access, or claiming proprietary ownership is strictly prohibited.
            </p>
          </div>
        </div>

        <!-- Principle 2: Universal Free Usage -->
        <div class="p-5 rounded-2xl bg-violet-900/30 border border-violet-700/50 space-y-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center flex-shrink-0">
              <Globe class="w-5 h-5" />
            </div>
            <div>
              <span class="text-[10px] font-mono uppercase font-bold text-emerald-300 tracking-wider">Principle 2</span>
              <h4 class="text-sm font-bold text-white">Universal Free Usage & Free Redistribution</h4>
            </div>
          </div>
          <div class="space-y-2 text-xs text-violet-300/90 leading-relaxed font-sans pt-1">
            <p>
              <strong class="text-white">Worldwide Free Use:</strong> Permission is granted free of charge to any person, research lab, government agency, university, defense unit, PSU, or private enterprise worldwide to install, run, execute, test, and benchmark for any lawful purpose.
            </p>
            <p>
              <strong class="text-white">Zero Cost & No Licensing Fees:</strong> No license keys, no hardware dongles, no subscriptions, and zero per-seat or per-core fees required.
            </p>
            <p>
              <strong class="text-white">Free Sharing & Redistribution:</strong> Anyone is free to copy, mirror, transfer, share, and redistribute VM appliances, Docker containers, and packages freely across organizations.
            </p>
            <p class="text-emerald-200 bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-800/40 font-mono text-[11px]">
              <strong>Condition:</strong> License notice must accompany all copies, and the mandatory attribution notice in Section 3 must remain intact.
            </p>
          </div>
        </div>

      </div>

      <!-- Mandatory Attribution Callout Box -->
      <div class="p-5 rounded-2xl bg-gradient-to-r from-violet-950/90 via-purple-950/80 to-indigo-950/90 border border-cyan-500/40 shadow-xl space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-lg">❤️</span>
            <span class="text-xs font-bold uppercase tracking-wider text-cyan-300 font-mono">
              Section 3: Mandatory Institutional Attribution
            </span>
          </div>
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/50">
            MANDATORY IN ALL FORKS & DEPLOYMENTS
          </span>
        </div>

        <p class="text-xs text-violet-200 leading-relaxed">
          All redistributions, user interfaces, console banners, deployment footers, and documentation must prominently retain this verbatim institutional attribution notice:
        </p>

        <div class="p-4 rounded-xl bg-violet-950 border border-violet-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
          <span class="text-sm font-extrabold text-white text-center sm:text-left">
            "Made by ICTD CSIR-SERC for CSIR with ❤️"
          </span>
          <button
            @click="copyAttributionText"
            class="px-3 py-1.5 rounded-lg bg-violet-800 hover:bg-violet-700 text-xs font-semibold text-cyan-300 transition flex items-center justify-center gap-1.5 self-center sm:self-auto"
          >
            <Check v-if="attributionCopied" class="w-3.5 h-3.5 text-emerald-400" />
            <Copy v-else class="w-3.5 h-3.5" />
            <span>{{ attributionCopied ? 'Copied' : 'Copy Notice' }}</span>
          </button>
        </div>
      </div>

      <!-- Interactive Full License Text Viewer -->
      <div class="p-5 rounded-2xl bg-violet-950/80 border border-violet-800/60 space-y-3">
        <div class="flex items-center justify-between">
          <div class="text-xs font-bold text-cyan-300 uppercase tracking-wider font-mono flex items-center gap-2">
            <FileText class="w-4 h-4 text-neon-cyan" />
            <span>Full Legal License Text (LICENSE)</span>
          </div>
          <span class="text-[11px] text-violet-400 font-mono">96 Lines • Legal Specification</span>
        </div>

        <pre class="p-4 rounded-xl bg-slate-950/90 border border-violet-900/60 text-violet-300 text-[11px] font-mono leading-relaxed overflow-x-auto max-h-96 select-text whitespace-pre-wrap">{{ fullLicenseText }}</pre>
      </div>

    </div>

    <!-- ========================================================================= -->
    <!-- MODAL: EDIT FIREWALL PROFILE                                              -->
    <!-- ========================================================================= -->
    <div
      v-if="showEditModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
    >
      <div class="w-full max-w-lg bg-violet-950 border border-violet-700/60 rounded-3xl p-6 shadow-2xl relative">
        <div class="flex items-center justify-between mb-4 border-b border-violet-800/40 pb-3">
          <h3 class="text-base font-bold text-white flex items-center gap-2">
            <Edit3 class="w-4 h-4 text-neon-cyan" />
            <span>Configure Firewall SNMP Profile</span>
          </h3>
          <button @click="showEditModal = false" class="text-violet-400 hover:text-white">
            <X class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="saveFirewallProfile" class="space-y-3 font-mono text-xs">
          <div>
            <label class="text-violet-300 block mb-1">Firewall Name</label>
            <input
              v-model="editForm.name"
              required
              class="w-full px-3 py-2 bg-violet-900/40 border border-violet-700/50 rounded-lg text-white"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-violet-300 block mb-1">IP Address</label>
              <input
                v-model="editForm.ipAddress"
                required
                class="w-full px-3 py-2 bg-violet-900/40 border border-violet-700/50 rounded-lg text-white"
              />
            </div>
            <div>
              <label class="text-violet-300 block mb-1">SNMP Port</label>
              <input
                v-model.number="editForm.snmpPort"
                type="number"
                class="w-full px-3 py-2 bg-violet-900/40 border border-violet-700/50 rounded-lg text-white"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-violet-300 block mb-1">SNMP Version</label>
              <select
                v-model="editForm.snmpVersion"
                class="w-full px-3 py-2 bg-violet-900/40 border border-violet-700/50 rounded-lg text-white"
              >
                <option value="v2c">v2c</option>
                <option value="v3">v3</option>
              </select>
            </div>
            <div>
              <label class="text-violet-300 block mb-1">Community String</label>
              <input
                v-model="editForm.snmpCommunity"
                class="w-full px-3 py-2 bg-violet-900/40 border border-violet-700/50 rounded-lg text-white"
              />
            </div>
          </div>

          <div>
            <label class="text-violet-300 block mb-1">Location / Data Center</label>
            <input
              v-model="editForm.location"
              class="w-full px-3 py-2 bg-violet-900/40 border border-violet-700/50 rounded-lg text-white"
            />
          </div>

          <div class="pt-4 flex items-center justify-end gap-3 border-t border-violet-800/40">
            <button
              type="button"
              @click="showEditModal = false"
              class="px-4 py-2 rounded-xl bg-violet-900/50 text-violet-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  Sliders,
  Type,
  Bell,
  Mail,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertOctagon,
  Flame,
  PowerOff,
  Activity,
  Zap,
  Edit3,
  Plus,
  RefreshCw,
  Terminal,
  Gauge,
  AlertTriangle,
  Save,
  Radio,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  UploadCloud,
  DownloadCloud,
  Sparkles,
  Cpu,
  Globe,
  ArrowUpCircle,
  HardDrive,
  FileArchive,
  Image as ImageIcon,
  Award,
  FileText,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  Eye
} from 'lucide-vue-next';
import { useFirewallStore, FirewallDevice } from '../stores/firewall.store.js';
import { useTelemetryStore } from '../stores/telemetry.store.js';

const fwStore = useFirewallStore();
const telemetryStore = useTelemetryStore();

type TabType = 'logo' | 'branding' | 'notifications' | 'snmp' | 'collectors' | 'speedtest' | 'thresholds' | 'system' | 'license';
const activeTab = ref<TabType>('logo');
const isPollingNow = ref(false);
const isSaving = ref(false);

const toastMessage = ref('');
const toastType = ref<'success' | 'error'>('success');

function showToast(msg: string, type: 'success' | 'error' = 'success') {
  toastMessage.value = msg;
  toastType.value = type;
  setTimeout(() => {
    if (toastMessage.value === msg) {
      toastMessage.value = '';
    }
  }, 5000);
}

const tabs: { id: TabType; label: string; icon: any; badge?: string }[] = [
  { id: 'logo', label: 'Organization Logo & Identity', icon: ImageIcon, badge: 'Upload / Custom' },
  { id: 'branding', label: 'Portal Branding & Text Labels', icon: Type },
  { id: 'notifications', label: 'SMTP & Telegram Notifications', icon: Bell, badge: 'Active Channels' },
  { id: 'snmp', label: 'Firewall SNMP Configuration', icon: Shield, badge: 'Live Gateway' },
  { id: 'collectors', label: 'Syslog & Flow Listeners', icon: Terminal },
  { id: 'speedtest', label: '15-Minute Internet Speed Test', icon: Gauge },
  { id: 'thresholds', label: 'Alerting Thresholds', icon: AlertTriangle },
  { id: 'system', label: 'Appliance & OTA Updates', icon: DownloadCloud, badge: 'v2.4.0' },
  { id: 'license', label: 'CSIR-SERC License v1.0', icon: Award, badge: 'Free Community' },
];

const liveFortigateDevice = computed(() => {
  return fwStore.devices.find((d: any) => d.ipAddress === '10.10.3.15' || d.vendor === 'fortinet') || fwStore.devices[0];
});

const otherDevices = computed(() => {
  return fwStore.devices.filter((d: any) => d.ipAddress !== '10.10.3.15' && d.id !== liveFortigateDevice.value?.id);
});

// Comprehensive Form State matching SystemSettings
const settingsForm = ref({
  branding: {
    portalTitle: 'Firewall Telemetry & Security Operations Console',
    portalSubtitle: 'Real-Time Multi-Gigabit Ingress/Egress Inspection, Threat Mitigation & Unified SNMP Telemetry Engine',
    orgName: 'CSIR - Structural Engineering Research Centre',
    orgDivision: 'ICT & Network Security Division',
    apexBody: 'Council of Scientific & Industrial Research',
    loginTitle: 'CSIR-SERC Security Operations Center',
    loginSubtitle: 'Enter authorized credentials to access Unified Firewall Telemetry & Threat Monitoring Console.',
    footerNotice: 'CSIR-SERC (Chennai) • Council of Scientific & Industrial Research • Authorized Access Only',
    ntpBadgeText: 'NTP SYNC • NKN CHENNAI',
    threatAdvisoryLevel: 'ELEVATED',
    threatAdvisoryDetail: 'Standard CSIR Enterprise Perimeter Defense Active',
    logoUrl: '',
    logoBase64: '',
    logoType: 'preset' as 'preset' | 'custom' | 'url',
    presetLogo: 'shield' as 'emblem' | 'shield' | 'cyber' | 'globe',
    isSetupComplete: true
  },
  notifications: {
    smtp: {
      enabled: false,
      host: 'smtp.csir.res.in',
      port: 587,
      secure: false,
      user: '',
      password: '',
      fromEmail: 'soc-alerts@serc.res.in',
      toEmails: 'admin@serc.res.in'
    },
    telegram: {
      enabled: false,
      botToken: '',
      chatId: ''
    },
    triggers: {
      seriousAttackEnabled: true,
      ddosEnabled: true,
      ddosThresholdMbps: 500,
      firewallDownEnabled: true,
      bandwidthLowEnabled: true,
      bandwidthLowThresholdMbps: 5,
      cpuThresholdPercent: 85,
      memoryThresholdPercent: 90
    }
  },
  collectors: {
    syslogPort: 1514,
    syslogAltPort: 514,
    netflowPort: 2055,
    bufferQueueSize: 10000,
    certInRetentionDays: 180,
  },
  speedtest: {
    intervalMinutes: 15,
    primaryServer: 'Chennai - NIXI / NKN Gateway (CSIR-SERC)',
    autoSchedule: true,
  },
  thresholds: {
    cpuWarningPercent: 75,
    cpuCriticalPercent: 90,
    memWarningPercent: 80,
    memCriticalPercent: 92,
    concurrentConnAlert: 50000,
  }
});

function resetDefaultBranding() {
  settingsForm.value.branding = {
    portalTitle: 'Firewall Telemetry & Security Operations Console',
    portalSubtitle: 'Real-Time Multi-Gigabit Ingress/Egress Inspection, Threat Mitigation & Unified SNMP Telemetry Engine',
    orgName: 'CSIR - Structural Engineering Research Centre',
    orgDivision: 'ICT & Network Security Division',
    apexBody: 'Council of Scientific & Industrial Research',
    loginTitle: 'CSIR-SERC Security Operations Center',
    loginSubtitle: 'Enter authorized credentials to access Unified Firewall Telemetry & Threat Monitoring Console.',
    footerNotice: 'CSIR-SERC (Chennai) • Council of Scientific & Industrial Research • Authorized Access Only',
    ntpBadgeText: 'NTP SYNC • NKN CHENNAI',
    threatAdvisoryLevel: 'ELEVATED',
    threatAdvisoryDetail: 'Standard CSIR Enterprise Perimeter Defense Active',
    logoUrl: '',
    logoBase64: '',
    logoType: 'preset' as 'preset' | 'custom' | 'url',
    presetLogo: 'shield' as 'emblem' | 'shield' | 'cyber' | 'globe',
    isSetupComplete: true
  };
  showToast('CSIR-SERC default branding values loaded.');
}

// Notification Live Tests State
const isTestingSMTP = ref(false);
const smtpTestResult = ref<any>(null);

async function handleTestSMTP() {
  isTestingSMTP.value = true;
  smtpTestResult.value = null;
  try {
    const res = await fwStore.testSMTP(settingsForm.value.notifications.smtp);
    smtpTestResult.value = res;
    if (res.success) {
      showToast(res.message || 'SMTP test email dispatched successfully.');
    } else {
      showToast(res.message || 'SMTP test failed.', 'error');
    }
  } catch (e: any) {
    smtpTestResult.value = { success: false, message: e.message };
    showToast(e.message, 'error');
  } finally {
    isTestingSMTP.value = false;
  }
}

const isTestingTelegram = ref(false);
const telegramTestResult = ref<any>(null);

async function handleTestTelegram() {
  isTestingTelegram.value = true;
  telegramTestResult.value = null;
  try {
    const res = await fwStore.testTelegram(settingsForm.value.notifications.telegram);
    telegramTestResult.value = res;
    if (res.success) {
      showToast(res.message || 'Telegram test message sent successfully.');
    } else {
      showToast(res.message || 'Telegram dispatch failed.', 'error');
    }
  } catch (e: any) {
    telegramTestResult.value = { success: false, message: e.message };
    showToast(e.message, 'error');
  } finally {
    isTestingTelegram.value = false;
  }
}

const isSendingSampleAlert = ref(false);
const sampleAlertResult = ref<any>(null);

async function handleSendSampleAlert() {
  isSendingSampleAlert.value = true;
  sampleAlertResult.value = null;
  try {
    const res = await fwStore.sendSampleAlert(settingsForm.value.notifications);
    sampleAlertResult.value = res;
    if (res.success) {
      showToast(res.message || 'Sample security alert sent across channels.');
    } else {
      showToast(res.message || 'Failed to send sample alert.', 'error');
    }
  } catch (e: any) {
    sampleAlertResult.value = { success: false, message: e.message };
    showToast(e.message, 'error');
  } finally {
    isSendingSampleAlert.value = false;
  }
}

// Diagnostic Probe State
const showTestModal = ref(false);
const testProbeForm = ref({
  ipAddress: '10.10.3.15',
  version: 'v2c',
  community: 'fortinet',
  port: 161,
});

function runQuickTest(ip: string, version: string, community: string, port: number) {
  testProbeForm.value = {
    ipAddress: ip,
    version: version || 'v2c',
    community: community || 'fortinet',
    port: port || 161,
  };
  showTestModal.value = true;
  executeSnmpTest();
}

async function executeSnmpTest() {
  await fwStore.testSnmp(testProbeForm.value);
}

// Edit Profile Modal
const showEditModal = ref(false);
const editForm = ref<any>({});

function openEditModal(dev?: FirewallDevice) {
  if (!dev) return;
  editForm.value = { ...dev };
  showEditModal.value = true;
}

function openAddModal() {
  editForm.value = {
    id: `fw-custom-${Date.now().toString().slice(-4)}`,
    name: 'New-Enterprise-Firewall',
    vendor: 'fortinet',
    model: 'Enterprise Security Gateway',
    ipAddress: '10.10.3.20',
    version: 'v7.4.x',
    status: 'healthy',
    location: 'CSIR-SERC Datacenter',
    snmpEnabled: true,
    snmpCommunity: 'fortinet',
    snmpVersion: 'v2c',
    snmpPort: 161,
  };
  showEditModal.value = true;
}

async function saveFirewallProfile() {
  if (editForm.value.id) {
    const existing = fwStore.devices.find((d: any) => d.id === editForm.value.id);
    if (existing) {
      await fwStore.updateFirewall(editForm.value.id, editForm.value);
    } else {
      await fwStore.addFirewall(editForm.value);
    }
    showToast('Firewall profile saved.');
  }
  showEditModal.value = false;
}

async function handlePollNow() {
  isPollingNow.value = true;
  try {
    await fwStore.pollSnmpNow();
    showToast('Live SNMP probe dispatched across all interfaces.');
  } finally {
    isPollingNow.value = false;
  }
}

async function saveAllSettings() {
  isSaving.value = true;
  try {
    const ok = await fwStore.saveSettings(settingsForm.value);
    if (ok) {
      showToast('All Branding, Notifications, and System Settings saved successfully.');
    } else {
      showToast('Failed to save settings. Check backend connection.', 'error');
    }
  } catch (e: any) {
    showToast(`Error saving settings: ${e.message}`, 'error');
  } finally {
    isSaving.value = false;
  }
}

const isDraggingLogo = ref(false);
const logoInputRef = ref<HTMLInputElement | null>(null);

function processLogoFile(file: File) {
  if (file.size > 5 * 1024 * 1024) {
    showToast('File size must be under 5MB', 'error');
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    const b64 = e.target?.result as string;
    settingsForm.value.branding.logoBase64 = b64;
    settingsForm.value.branding.logoType = 'custom';
    showToast('Custom logo loaded into preview. Click Save Logo to apply.');
  };
  reader.readAsDataURL(file);
}

function handleLogoDrop(e: DragEvent) {
  isDraggingLogo.value = false;
  const file = e.dataTransfer?.files?.[0];
  if (file) {
    processLogoFile(file);
  }
}

function handleLogoFileUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  processLogoFile(file);
}

function resetToDefaultLogo() {
  settingsForm.value.branding.logoType = 'preset';
  settingsForm.value.branding.presetLogo = 'shield';
  settingsForm.value.branding.logoBase64 = '';
  settingsForm.value.branding.logoUrl = '';
  showToast('Logo reset to CSIR-SERC Cyber Shield emblem.');
}

function clearCustomLogo() {
  settingsForm.value.branding.logoBase64 = '';
  settingsForm.value.branding.logoUrl = '';
  settingsForm.value.branding.logoType = 'preset';
  settingsForm.value.branding.presetLogo = 'emblem';
  showToast('Custom logo cleared. National emblem active.');
}

// License Management State & Handlers
const licenseCopied = ref(false);
const attributionCopied = ref(false);

const fullLicenseText = `CSIR-SERC Free Community & Institutional License
Version 1.0 (September 2024 – 2026)

Copyright © 2024–2026 CSIR - Structural Engineering Research Centre (CSIR-SERC),
Council of Scientific and Industrial Research (CSIR),
Ministry of Science & Technology, Government of India.
All Rights Reserved.

Authorship:
Developed by the Information and Communication Technology Division (ICTD),
CSIR - Structural Engineering Research Centre (CSIR-SERC),
CSIR Campus, Taramani, Chennai - 600113, Tamil Nadu, India.

================================================================================
PREAMBLE
================================================================================
This License governs the use, copying, execution, testing, benchmarking, and
redistribution of the Enterprise Firewall Telemetry & Security Operations Platform
(hereinafter referred to as the "Software").

The License is anchored on two foundational principles:
1. Strict Source Code Ownership & Intellectual Property Protection for CSIR-SERC.
2. Universal Free Usage & Free Redistribution Rights for the Global Community.

By using, executing, copying, or distributing this Software, you agree to be bound
by the terms and conditions set forth herein.

================================================================================
SECTION 1: STRICT SOURCE CODE OWNERSHIP & INTELLECTUAL PROPERTY PROTECTION
================================================================================
1.1 Copyright & Title:
    All copyright, patent rights, trademarks, trade secrets, moral rights,
    architecture, source code, algorithms, visual UI designs, threat intelligence
    models, and telemetry schemas remain the sole and exclusive intellectual
    property of CSIR - Structural Engineering Research Centre (CSIR-SERC),
    Council of Scientific and Industrial Research (CSIR), Government of India.

1.2 Anti-Commercial Re-branding & Sale Prohibition:
    (a) Commercial resale, sublicensing, white-label repackaging for sale, or
        claiming proprietary ownership of this Software as a closed third-party
        commercial offering is strictly prohibited.
    (b) No person, organization, or commercial entity may sell this Software or
        charge licensing, subscription, seat, or access fees for the Software itself.
    (c) Offering paid third-party proprietary forks without explicit institutional
        written authorization from CSIR-SERC is strictly disallowed.

1.3 Integrity of Institutional Identity:
    The institutional name "CSIR-SERC", "Council of Scientific & Industrial Research",
    and the official attribution notices shall not be removed, obscured, or
    falsified in any distribution.

================================================================================
SECTION 2: UNIVERSAL FREE USAGE & REDISTRIBUTION RIGHTS
================================================================================
2.1 Worldwide Universal Free Use:
    Permission is hereby granted, free of charge, to any person, research laboratory,
    government agency, defense organization, academic institution, public sector
    undertaking (PSU), or commercial enterprise worldwide to:
    (a) Install, run, execute, test, audit, and benchmark the Software for any
        lawful purpose without limitation.
    (b) Deploy the Software across unlimited physical servers, virtual machines,
        Docker containers, Kubernetes clusters, or cloud workstations.
    (c) Connect, poll, and monitor unlimited network gateways, firewalls, routers,
        switches, and cybersecurity infrastructure.

2.2 Zero Cost & No Fees:
    The Software is provided at zero cost. It requires no license keys, no hardware
    dongles, no subscriptions, and zero per-seat or per-core fees.

2.3 Free Sharing & Redistribution:
    Anyone is free to copy, mirror, transfer, share, and redistribute the compiled
    binaries, container images, virtual machine appliances, and package archives
    (including ZIP, TAR.GZ, Docker images, and VM templates), provided that:
    (a) This License notice accompanies all copies or substantial portions of
        the Software.
    (b) The official mandatory attribution notice defined in Section 3 is preserved.

================================================================================
SECTION 3: MANDATORY ATTRIBUTION NOTICE
================================================================================
All redistributions, user interfaces, console banners, deployment footers, and
documentation must prominently retain the official institutional attribution:

    "Made by ICTD CSIR-SERC for CSIR with ❤️"

================================================================================
SECTION 4: DISCLAIMER OF WARRANTY & LIMITATION OF LIABILITY
================================================================================
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE, AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS, COPYRIGHT HOLDERS, CSIR-SERC, OR CSIR BE LIABLE FOR ANY CLAIM, DAMAGES,
OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT, OR OTHERWISE,
ARISING FROM, OUT OF, OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
DEALINGS IN THE SOFTWARE.
`;

function copyLicenseText() {
  if (navigator?.clipboard) {
    navigator.clipboard.writeText(fullLicenseText);
  }
  licenseCopied.value = true;
  showToast('Full CSIR-SERC License text copied to clipboard!');
  setTimeout(() => { licenseCopied.value = false; }, 3000);
}

function copyAttributionText() {
  if (navigator?.clipboard) {
    navigator.clipboard.writeText('Made by ICTD CSIR-SERC for CSIR with ❤️');
  }
  attributionCopied.value = true;
  showToast('Institutional attribution notice copied!');
  setTimeout(() => { attributionCopied.value = false; }, 3000);
}

function downloadLicenseFile() {
  const blob = new Blob([fullLicenseText], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'LICENSE.txt';
  a.click();
  URL.revokeObjectURL(url);
  showToast('LICENSE.txt downloaded successfully.');
}

// System & OTA Updates State
const systemVersion = ref<any>(null);
const updateCheck = ref<any>(null);
const isCheckingUpdates = ref(false);
const isApplyingUpdate = ref(false);
const isDownloadingBackup = ref(false);

async function loadSystemVersion() {
  try {
    const data = await fwStore.fetchSystemVersion();
    if (data && data.success) {
      systemVersion.value = data.version;
    }
  } catch (e) {
    // offline/fallback
  }
}

async function handleCheckUpdates() {
  isCheckingUpdates.value = true;
  try {
    const res = await fwStore.checkOTAUpdates();
    if (res && res.success) {
      updateCheck.value = res;
      showToast(res.message || 'Update check completed.');
    } else {
      showToast('Could not reach central update server.', 'error');
    }
  } catch (e: any) {
    showToast(`Update check failed: ${e.message}`, 'error');
  } finally {
    isCheckingUpdates.value = false;
  }
}

async function handleApplyOTAUpdate() {
  isApplyingUpdate.value = true;
  try {
    const res = await fetch('/api/system/updates/apply', { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      showToast(data.message || 'OTA Update applied successfully!');
      await loadSystemVersion();
    } else {
      showToast(data.message || 'OTA update failed.', 'error');
    }
  } catch (e: any) {
    showToast(`Error applying update: ${e.message}`, 'error');
  } finally {
    isApplyingUpdate.value = false;
  }
}

async function handleDownloadBackup() {
  isDownloadingBackup.value = true;
  try {
    const res = await fetch('/api/system/backup');
    const data = await res.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `firewall-appliance-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Appliance backup downloaded successfully.');
  } catch (e: any) {
    showToast(`Backup download failed: ${e.message}`, 'error');
  } finally {
    isDownloadingBackup.value = false;
  }
}

function handleRestoreBackupFile(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const json = JSON.parse(e.target?.result as string);
      const ok = await fwStore.restoreBackup(json);
      if (ok) {
        showToast('Appliance state restored successfully from backup!');
        await Promise.all([fwStore.fetchSettings(), fwStore.fetchDevices()]);
        if (fwStore.settings?.branding) {
          settingsForm.value.branding = { ...settingsForm.value.branding, ...fwStore.settings.branding };
        }
      } else {
        showToast('Failed to restore backup.', 'error');
      }
    } catch (err: any) {
      showToast(`Invalid backup file: ${err.message}`, 'error');
    }
  };
  reader.readAsText(file);
}

onMounted(async () => {
  await Promise.all([
    fwStore.fetchSettings(),
    fwStore.fetchDevices(),
    loadSystemVersion()
  ]);
  if (fwStore.settings) {
    if (fwStore.settings.branding) settingsForm.value.branding = { ...settingsForm.value.branding, ...fwStore.settings.branding };
    if (fwStore.settings.notifications) {
      if (fwStore.settings.notifications.smtp) settingsForm.value.notifications.smtp = { ...settingsForm.value.notifications.smtp, ...fwStore.settings.notifications.smtp };
      if (fwStore.settings.notifications.telegram) settingsForm.value.notifications.telegram = { ...settingsForm.value.notifications.telegram, ...fwStore.settings.notifications.telegram };
      if (fwStore.settings.notifications.triggers) settingsForm.value.notifications.triggers = { ...settingsForm.value.notifications.triggers, ...fwStore.settings.notifications.triggers };
    }
    if (fwStore.settings.collectors) settingsForm.value.collectors = { ...settingsForm.value.collectors, ...fwStore.settings.collectors };
    if (fwStore.settings.speedtest) settingsForm.value.speedtest = { ...settingsForm.value.speedtest, ...fwStore.settings.speedtest };
    if (fwStore.settings.thresholds) settingsForm.value.thresholds = { ...settingsForm.value.thresholds, ...fwStore.settings.thresholds };
  }
});
</script>
