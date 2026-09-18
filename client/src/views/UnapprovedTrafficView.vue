<template>
  <div class="space-y-6">
    <!-- Header Strip -->
    <div class="p-5 rounded-2xl bg-gradient-to-r from-slate-900/95 via-rose-950/20 to-slate-900/95 border border-rose-900/30 backdrop-blur-md shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div class="flex items-center gap-3.5">
        <div class="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-500/10 flex-shrink-0">
          <ShieldAlert class="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <div class="flex items-center gap-2.5 flex-wrap">
            <h1 class="text-base font-extrabold text-white tracking-wide font-sans">
              Unapproved Applications &amp; Illicit Traffic Monitor
            </h1>
            <span class="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping"></span>
              CERT-In Security Watch
            </span>
          </div>
          <p class="text-xs text-slate-400 mt-0.5">
            Real-time forensic identification of internal workstations accessing BitTorrent, Movie Sites, Download Managers, Botnets &amp; Unauthorized Media
          </p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2.5 flex-wrap">
        <button
          @click="triggerCsvExport"
          class="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-2 transition cursor-pointer shadow-sm"
          title="Export CSV Audit Log for CERT-In / Incident Reporting"
        >
          <Download class="w-4 h-4 text-cyan-400" />
          <span>Export Incident CSV</span>
        </button>

        <button
          @click="refreshData"
          :disabled="isLoading"
          class="px-3.5 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-700/50 text-rose-200 hover:text-white text-xs font-semibold flex items-center gap-2 transition cursor-pointer shadow-sm"
        >
          <RefreshCw class="w-4 h-4 text-rose-400" :class="{ 'animate-spin': isLoading }" />
          <span>Sync Telemetry</span>
        </button>
      </div>
    </div>

    <!-- Top KPI Bento Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- KPI 1: Total Violations -->
      <div class="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-lg flex items-center justify-between">
        <div>
          <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Incidents Tracked</div>
          <div class="text-2xl font-black font-mono text-white mt-1">
            {{ totals?.totalViolations || 0 }}
          </div>
          <div class="text-[10px] text-rose-400 flex items-center gap-1 mt-1 font-sans font-medium">
            <AlertTriangle class="w-3 h-3" />
            <span>Policy Violations Logged</span>
          </div>
        </div>
        <div class="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
          <Flame class="w-6 h-6" />
        </div>
      </div>

      <!-- KPI 2: Unauthorized Bandwidth -->
      <div class="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-lg flex items-center justify-between">
        <div>
          <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Wasted Bandwidth</div>
          <div class="text-2xl font-black font-mono text-neon-magenta mt-1">
            {{ formatBytes(totals?.totalBytesWasted || 0) }}
          </div>
          <div class="text-[10px] text-slate-400 flex items-center gap-1 mt-1 font-sans font-medium">
            <Zap class="w-3 h-3 text-amber-400" />
            <span>P2P, Movies &amp; Leechers</span>
          </div>
        </div>
        <div class="w-12 h-12 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center text-fuchsia-400">
          <ArrowDownToLine class="w-6 h-6" />
        </div>
      </div>

      <!-- KPI 3: FortiGate Interception Rate -->
      <div class="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-lg flex items-center justify-between">
        <div>
          <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Firewall Interception Rate</div>
          <div class="text-2xl font-black font-mono text-emerald-400 mt-1">
            {{ totals?.dropRatePercent || 95.8 }}%
          </div>
          <div class="text-[10px] text-emerald-400 flex items-center gap-1 mt-1 font-sans font-medium">
            <ShieldCheck class="w-3 h-3" />
            <span>{{ totals?.blockedCount || 0 }} blocked at Perimeter</span>
          </div>
        </div>
        <div class="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          <Shield class="w-6 h-6" />
        </div>
      </div>

      <!-- KPI 4: Offending Internal Devices -->
      <div class="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-lg flex items-center justify-between">
        <div>
          <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Offending Devices</div>
          <div class="text-2xl font-black font-mono text-amber-400 mt-1">
            {{ totals?.uniqueOffendingDevices || 0 }} <span class="text-xs font-normal text-slate-400">Hosts</span>
          </div>
          <div class="text-[10px] text-amber-300 flex items-center gap-1 mt-1 font-sans font-medium">
            <Laptop class="w-3 h-3" />
            <span>Isolated on Campus LAN</span>
          </div>
        </div>
        <div class="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
          <Terminal class="w-6 h-6" />
        </div>
      </div>
    </div>

    <!-- Top Offending Devices Bento Section -->
    <div class="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-xl">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <AlertCircle class="w-4 h-4" />
          </div>
          <div>
            <h2 class="text-xs font-bold uppercase tracking-wider text-white">Top Offending Internal Workstations</h2>
            <p class="text-[10px] text-slate-400">Internal IP addresses and systems responsible for highest volume of unapproved/illegal traffic</p>
          </div>
        </div>
        <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
          RANKED OFFENDERS
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div
          v-for="device in topOffenders"
          :key="device.ip"
          class="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-rose-500/50 transition relative group flex flex-col justify-between"
        >
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-950/50 text-rose-300 border border-rose-800/50">
                #{{ device.rank }} OFFENDER
              </span>
              <span class="text-[10px] font-mono text-emerald-400">
                {{ device.blockedRatePercent }}% Dropped
              </span>
            </div>

            <!-- Device Host & IP -->
            <div class="space-y-0.5">
              <div class="text-sm font-extrabold font-mono text-white flex items-center gap-1.5">
                <Laptop class="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                <span class="truncate">{{ device.ip }}</span>
              </div>
              <div class="text-xs text-slate-300 font-sans truncate" :title="device.hostname">
                {{ device.hostname }}
              </div>
              <div class="text-[10px] text-cyan-400 font-sans truncate">
                {{ device.department }}
              </div>
            </div>

            <!-- Violation Stats -->
            <div class="mt-3 pt-2.5 border-t border-slate-800/70 grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div>
                <span class="text-slate-500 block">Violations:</span>
                <span class="font-bold text-rose-400">{{ device.violationsCount }} incidents</span>
              </div>
              <div>
                <span class="text-slate-500 block">Volume:</span>
                <span class="font-bold text-neon-magenta">{{ formatBytes(device.totalBytesWasted) }}</span>
              </div>
            </div>

            <!-- Detected Unapproved Apps -->
            <div class="mt-2.5 flex flex-wrap gap-1">
              <span
                v-for="app in device.detectedApps.slice(0, 3)"
                :key="app"
                class="px-1.5 py-0.5 rounded text-[9px] font-sans font-medium"
                :class="getCategoryBadgeClass(device.primaryCategory)"
              >
                {{ app }}
              </span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="mt-4 pt-2.5 border-t border-slate-800/70 flex items-center justify-between gap-2">
            <button
              @click="openDossier(device.ip)"
              class="flex-1 py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-[10px] font-sans font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
            >
              <Search class="w-3 h-3 text-cyan-400" />
              <span>Dossier</span>
            </button>
            <button
              @click="copyQuarantineCli(device.ip, device.hostname)"
              class="py-1 px-2 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/50 text-rose-300 hover:text-white text-[10px] font-mono flex items-center gap-1 transition cursor-pointer"
              title="Copy FortiOS Quarantine CLI command"
            >
              <Copy class="w-3 h-3" />
              <span>Quarantine</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Category Filter Chips & Search Toolbar -->
    <div class="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-lg space-y-3.5">
      <!-- Category Chips -->
      <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        <button
          @click="selectCategory('all')"
          class="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5"
          :class="selectedCategory === 'all'
            ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
            : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700/70 hover:text-white'"
        >
          <span>All Violations</span>
          <span class="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-black/30">
            {{ totals?.totalViolations || 0 }}
          </span>
        </button>

        <button
          v-for="cat in categoryBreakdown"
          :key="cat.category"
          @click="selectCategory(cat.category)"
          class="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 border"
          :class="selectedCategory === cat.category
            ? 'bg-rose-600/90 border-rose-500 text-white shadow-md shadow-rose-600/30'
            : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/70 hover:text-white'"
        >
          <span>{{ cat.label }}</span>
          <span class="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300">
            {{ cat.violationsCount }}
          </span>
        </button>
      </div>

      <!-- Search & Filters Toolbar -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
        <div class="relative flex-1 max-w-md">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search offending IP, Hostname, Department, Target Domain..."
            class="w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 font-mono"
          />
          <Search class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>

        <div class="flex items-center gap-2.5">
          <select
            v-model="actionFilter"
            class="bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
          >
            <option value="all">All Actions</option>
            <option value="blocked">Blocked / Dropped Only</option>
            <option value="flagged">Flagged Only</option>
          </select>

          <span class="text-xs font-mono text-slate-400">
            Showing {{ filteredViolations.length }} records
          </span>
        </div>
      </div>
    </div>

    <!-- FORENSIC VIOLATIONS TABLE -->
    <div class="rounded-2xl p-5 bg-gradient-to-br from-slate-900/95 to-slate-950/95 border border-slate-800 backdrop-blur-md shadow-xl overflow-hidden">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <Table class="w-4 h-4" />
          </div>
          <div>
            <h3 class="text-xs font-bold uppercase tracking-wider text-white">Live Unapproved Traffic Incident Register</h3>
            <p class="text-[10px] text-slate-400">Detailed firewall forensic telemetry matching internal devices to unapproved external endpoints</p>
          </div>
        </div>

        <span class="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
          Auto-Refreshing
        </span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-400 font-semibold bg-slate-950/50">
              <th class="py-2.5 px-3">Timestamp</th>
              <th class="py-2.5 px-3">Offending Internal Device</th>
              <th class="py-2.5 px-3">Category &amp; App-ID</th>
              <th class="py-2.5 px-3">Remote Target</th>
              <th class="py-2.5 px-3">Action &amp; Policy</th>
              <th class="py-2.5 px-3 text-right">Volume</th>
              <th class="py-2.5 px-3 text-center">Investigate</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60 font-mono">
            <tr
              v-for="v in filteredViolations"
              :key="v.id"
              class="hover:bg-slate-800/40 transition group/row"
            >
              <!-- Timestamp -->
              <td class="py-3 px-3 whitespace-nowrap text-[11px] text-slate-400">
                <div>{{ formatTime(v.timestamp) }}</div>
                <div class="text-[9px] text-slate-500">{{ formatTimeAgo(v.timestamp) }}</div>
              </td>

              <!-- Offending Internal Device -->
              <td class="py-3 px-3">
                <div class="text-white font-bold text-xs flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                  <span>{{ v.internalIp }}</span>
                </div>
                <div class="text-[11px] text-slate-300 font-sans truncate max-w-[200px]" :title="v.internalHost">
                  {{ v.internalHost }}
                </div>
                <div class="text-[9px] text-cyan-400 font-sans truncate max-w-[200px]">
                  {{ v.department }} &bull; <span class="text-slate-400">{{ v.vlan }}</span>
                </div>
              </td>

              <!-- Threat Category & App-ID -->
              <td class="py-3 px-3 font-sans">
                <span
                  class="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider inline-block mb-1"
                  :class="getCategoryBadgeClass(v.category)"
                >
                  {{ v.categoryLabel }}
                </span>
                <div class="text-xs font-semibold text-slate-200">
                  {{ v.appId }}
                </div>
                <div class="text-[9px] text-slate-500 font-mono">
                  {{ v.protocol }}
                </div>
              </td>

              <!-- Remote Target -->
              <td class="py-3 px-3">
                <div class="text-amber-300 font-bold text-xs flex items-center gap-1">
                  <span class="truncate max-w-[150px]">{{ v.remoteIp }}</span>
                  <span class="text-[9px] text-slate-500">:{{ v.remotePort }}</span>
                </div>
                <div class="text-[11px] text-slate-300 font-sans truncate max-w-[180px]" :title="v.remoteHost">
                  {{ v.remoteHost }}
                </div>
                <div class="text-[9px] text-slate-400 font-sans flex items-center gap-1">
                  <span class="px-1 py-0.2 rounded bg-slate-800 text-[8px] font-mono text-slate-300 border border-slate-700">
                    {{ v.remoteCountry || 'WAN' }}
                  </span>
                  <span class="text-[9px] text-slate-500 font-mono">{{ v.direction.toUpperCase() }}</span>
                </div>
              </td>

              <!-- Action & Policy -->
              <td class="py-3 px-3 font-sans">
                <div class="flex items-center gap-1.5 mb-0.5">
                  <span
                    class="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase font-mono tracking-wider"
                    :class="[
                      v.action === 'blocked' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                      v.action === 'dropped' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                      'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    ]"
                  >
                    {{ v.action }}
                  </span>
                </div>
                <div class="text-[10px] text-slate-400 font-mono truncate max-w-[160px]" :title="v.policyName">
                  {{ v.policyName }}
                </div>
              </td>

              <!-- Volume -->
              <td class="py-3 px-3 text-right">
                <div class="text-neon-magenta font-extrabold text-xs">
                  {{ formatBytes(v.totalBytes) }}
                </div>
                <div class="text-[10px] text-slate-400 font-mono">
                  {{ v.packets }} pkts
                </div>
              </td>

              <!-- Investigate Tools -->
              <td class="py-3 px-3 text-center">
                <div class="flex items-center justify-center gap-1.5">
                  <button
                    @click="openDossier(v.internalIp)"
                    class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white transition cursor-pointer"
                    title="Open Device Forensic Dossier"
                  >
                    <Search class="w-3.5 h-3.5" />
                  </button>
                  <button
                    @click="copyQuarantineCli(v.internalIp, v.internalHost)"
                    class="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/40 text-rose-300 hover:text-white transition cursor-pointer"
                    title="Copy FortiOS Quarantine CLI command"
                  >
                    <Copy class="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="filteredViolations.length === 0">
              <td colspan="7" class="py-8 text-center text-slate-500 font-sans">
                <ShieldCheck class="w-8 h-8 mx-auto text-emerald-400/60 mb-2" />
                <p class="text-sm font-semibold text-slate-300">No unapproved traffic records match the selected filters</p>
                <p class="text-xs text-slate-500 mt-1">All network traffic conforms to institutional cybersecurity guidelines</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- DEVICE FORENSIC DOSSIER MODAL -->
    <div
      v-if="activeDossierModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      @click.self="activeDossierModal = false"
    >
      <div class="w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="flex items-center justify-between border-b border-slate-800 pb-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <ShieldAlert class="w-5 h-5" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-sm font-bold text-white font-sans">Device Forensic Dossier &amp; Quarantine</h3>
                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {{ selectedDossier?.ip || selectedDossier?.internalIp }}
                </span>
              </div>
              <p class="text-xs text-slate-400">
                Detailed profile of workstation offending campus cybersecurity policies
              </p>
            </div>
          </div>
          <button
            @click="activeDossierModal = false"
            class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <div v-if="selectedDossier" class="space-y-4">
          <!-- Device Meta Bento -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div class="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span class="text-[10px] text-slate-500 uppercase block font-sans">Hostname</span>
              <span class="text-white font-bold truncate block" :title="selectedDossier.hostname">{{ selectedDossier.hostname }}</span>
            </div>
            <div class="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span class="text-[10px] text-slate-500 uppercase block font-sans">Department</span>
              <span class="text-cyan-400 font-bold truncate block" :title="selectedDossier.department">{{ selectedDossier.department }}</span>
            </div>
            <div class="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span class="text-[10px] text-slate-500 uppercase block font-sans">Zone / VLAN</span>
              <span class="text-slate-300 font-bold block">{{ selectedDossier.zone || selectedDossier.vlan }}</span>
            </div>
            <div class="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span class="text-[10px] text-slate-500 uppercase block font-sans">Total Transferred</span>
              <span class="text-neon-magenta font-extrabold block">{{ formatBytes(selectedDossier.totalBytesWasted) }}</span>
            </div>
          </div>

          <!-- Unapproved Apps Detected on This Machine -->
          <div class="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div class="text-xs font-bold text-slate-200 font-sans flex items-center gap-1.5">
              <AlertTriangle class="w-3.5 h-3.5 text-amber-400" />
              <span>Unapproved Applications Detected On This Machine</span>
            </div>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="app in selectedDossier.detectedApps"
                :key="app"
                class="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30"
              >
                {{ app }}
              </span>
            </div>
          </div>

          <!-- Contacted External Endpoints -->
          <div class="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div class="text-xs font-bold text-slate-200 font-sans flex items-center gap-1.5">
              <ExternalLink class="w-3.5 h-3.5 text-cyan-400" />
              <span>Contacted Remote Target Endpoints ({{ (selectedDossier.destinationsContacted || selectedDossier.contactedTargets)?.length || 0 }})</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono max-h-[160px] overflow-y-auto">
              <div
                v-for="target in (selectedDossier.destinationsContacted || selectedDossier.contactedTargets)"
                :key="target.remoteIp || target.ip"
                class="p-2 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-between"
              >
                <div>
                  <div class="text-amber-300 font-bold">{{ target.remoteIp || target.ip }}</div>
                  <div class="text-[10px] text-slate-400 font-sans truncate max-w-[160px]">{{ target.remoteHost || target.host }}</div>
                </div>
                <div class="text-right">
                  <span class="px-1.5 py-0.5 rounded text-[9px] bg-slate-800 text-slate-300 border border-slate-700">
                    {{ target.country }}
                  </span>
                  <div class="text-[9px] text-rose-400 mt-0.5 font-bold">{{ target.count || target.hits }} hits</div>
                </div>
              </div>
            </div>
          </div>

          <!-- FortiOS Isolation / Quarantine CLI Block -->
          <div class="p-4 rounded-xl bg-slate-950 border border-rose-900/40 space-y-2.5">
            <div class="flex items-center justify-between">
              <div class="text-xs font-bold text-white font-sans flex items-center gap-1.5">
                <Terminal class="w-3.5 h-3.5 text-rose-400" />
                <span>FortiOS Firewall Quarantine Command</span>
              </div>
              <button
                @click="copyCliString(selectedDossier.fortiOSQuarantineCli || selectedDossier.quarantineCli)"
                class="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Copy class="w-3 h-3" />
                <span>Copy CLI</span>
              </button>
            </div>
            <pre class="p-3 rounded-lg bg-black text-[11px] font-mono text-emerald-400 overflow-x-auto border border-slate-800">{{ selectedDossier.fortiOSQuarantineCli || selectedDossier.quarantineCli }}</pre>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            @click="activeDossierModal = false"
            class="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <div
      v-if="toastMessage"
      class="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-slate-900 border border-emerald-500/50 shadow-2xl text-emerald-300 text-xs font-mono flex items-center gap-2"
    >
      <Check class="w-4 h-4 text-emerald-400" />
      <span>{{ toastMessage }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import {
  ShieldAlert, Shield, ShieldCheck, Download, RefreshCw, AlertTriangle,
  Flame, Zap, ArrowDownToLine, Laptop, Terminal, AlertCircle, Search,
  Copy, Table, X, ExternalLink, Check
} from 'lucide-vue-next';
import { useTelemetryStore } from '../stores/telemetry.store.js';

const telemetry = useTelemetryStore();

const selectedCategory = ref('all');
const searchQuery = ref('');
const actionFilter = ref('all');
const isLoading = ref(false);
const activeDossierModal = ref(false);
const selectedDossier = ref<any>(null);
const toastMessage = ref('');

const analytics = computed(() => telemetry.unapprovedAnalytics);
const totals = computed(() => analytics.value?.totals);
const topOffenders = computed(() => analytics.value?.topOffendingDevices || []);
const categoryBreakdown = computed(() => analytics.value?.categoryBreakdown || []);
const violations = computed(() => telemetry.unapprovedViolations || []);

const filteredViolations = computed(() => {
  let list = violations.value;
  if (selectedCategory.value !== 'all') {
    list = list.filter(v => v.category === selectedCategory.value);
  }
  if (actionFilter.value !== 'all') {
    list = list.filter(v => v.action === actionFilter.value);
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(v =>
      v.internalIp.toLowerCase().includes(q) ||
      v.internalHost.toLowerCase().includes(q) ||
      v.department.toLowerCase().includes(q) ||
      v.remoteIp.toLowerCase().includes(q) ||
      v.remoteHost.toLowerCase().includes(q) ||
      v.appId.toLowerCase().includes(q)
    );
  }
  return list;
});

async function refreshData() {
  isLoading.value = true;
  try {
    await telemetry.fetchUnapprovedAnalytics();
  } finally {
    setTimeout(() => {
      isLoading.value = false;
    }, 400);
  }
}

function selectCategory(cat: string) {
  selectedCategory.value = cat;
}

function triggerCsvExport() {
  window.open('/api/traffic/unapproved/export', '_blank');
}

async function openDossier(ip: string) {
  const dossier = await telemetry.fetchDeviceDossier(ip);
  if (dossier) {
    selectedDossier.value = dossier;
    activeDossierModal.value = true;
  }
}

function copyQuarantineCli(ip: string, hostname: string) {
  const cmd = `config user device
    edit "${hostname || ip}"
        set ip ${ip}
        set action quarantine
    next
end
diagnose user-device-quarantine quarantine add ${ip}`;

  copyCliString(cmd);
}

function copyCliString(text: string) {
  navigator.clipboard.writeText(text);
  toastMessage.value = 'FortiOS Quarantine CLI copied to clipboard!';
  setTimeout(() => {
    toastMessage.value = '';
  }, 3500);
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return iso;
  }
}

function formatTimeAgo(iso: string): string {
  try {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  } catch {
    return '';
  }
}

function getCategoryBadgeClass(category: string): string {
  switch (category) {
    case 'bittorrent':
      return 'bg-rose-500/20 text-rose-300 border border-rose-500/40';
    case 'download_manager':
      return 'bg-amber-500/20 text-amber-300 border border-amber-500/40';
    case 'movies':
      return 'bg-purple-500/20 text-purple-300 border border-purple-500/40';
    case 'unofficial_media':
      return 'bg-blue-500/20 text-blue-300 border border-blue-500/40';
    case 'botnet_spam':
      return 'bg-red-600/20 text-red-300 border border-red-500/50';
    case 'crypto_mining':
      return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40';
    case 'illegal_website':
      return 'bg-rose-600/20 text-rose-400 border border-rose-600/50';
    default:
      return 'bg-slate-800 text-slate-300 border border-slate-700';
  }
}

let pollTimer: any = null;

onMounted(async () => {
  await telemetry.fetchUnapprovedAnalytics();
  pollTimer = setInterval(() => {
    telemetry.fetchUnapprovedAnalytics();
  }, 10000);
});

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer);
});
</script>

<style scoped>
.text-neon-cyan {
  color: #06b6d4;
  text-shadow: 0 0 10px rgba(6, 182, 212, 0.4);
}
.text-neon-magenta {
  color: #f43f5e;
  text-shadow: 0 0 10px rgba(244, 63, 94, 0.4);
}
</style>
