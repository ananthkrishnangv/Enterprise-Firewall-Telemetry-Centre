<template>
  <div class="space-y-6">
    <!-- Bento Top Control & Filter Strip -->
    <div class="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-violet-900/40 border border-violet-700/50 flex items-center justify-center text-violet-300">
          <Layers class="w-5 h-5 text-neon-cyan animate-pulse" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-sm font-bold text-white tracking-wide">Bento Traffic Intelligence Analyzer</h2>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
              App-ID &amp; Host Telemetry
            </span>
          </div>
          <p class="text-xs text-slate-400">
            Mapping IP endpoints, system workstations, bidirectional uploads/downloads, and Layer-7 application signatures
          </p>
        </div>
      </div>

      <!-- Search & Filters -->
      <div class="flex items-center gap-2.5 flex-wrap">
        <div class="relative min-w-[240px]">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search IP, System Name, App-ID..."
            class="w-full bg-slate-950/70 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 font-mono"
          />
          <Search class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>

        <select
          v-model="selectedCategory"
          class="bg-slate-950/70 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
        >
          <option value="">All App Categories</option>
          <option value="High Performance Computing">HPC &amp; Modeling</option>
          <option value="Database Systems">Database Systems</option>
          <option value="Software Engineering">Software &amp; Git</option>
          <option value="Cloud Collaboration">Cloud Collaboration</option>
          <option value="Enterprise Office">Enterprise Office</option>
          <option value="Research Library">Research Library</option>
        </select>

        <button
          @click="refreshBentoData"
          :disabled="isRefreshing"
          class="px-3 py-1.5 rounded-xl bg-violet-900/30 hover:bg-violet-800/60 border border-violet-700/40 text-violet-300 hover:text-white text-xs font-mono font-medium flex items-center gap-1.5 transition cursor-pointer"
          title="Refresh Bento Analytics"
        >
          <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': isRefreshing }" />
          <span>Sync</span>
        </button>
      </div>
    </div>

    <!-- MAIN BENTO GRID -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">

      <!-- ==================================================================== -->
      <!-- BENTO CARD 1: Bidirectional Data Pipe & Traffic Ratio Gauge (5 cols) -->
      <!-- ==================================================================== -->
      <div class="lg:col-span-5 rounded-2xl p-5 bg-gradient-to-br from-slate-900/95 to-slate-950/95 border border-slate-800 backdrop-blur-md shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-violet-500/40 transition">
        <div class="absolute -top-12 -right-12 w-36 h-36 bg-violet-600/10 rounded-full blur-2xl pointer-events-none"></div>

        <div>
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-neon-cyan animate-ping"></span>
              <h3 class="text-xs font-bold uppercase tracking-wider text-white">Bidirectional Traffic Ratio</h3>
            </div>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              Live Ingress vs Egress
            </span>
          </div>

          <!-- Segmented Ratio Bar -->
          <div class="space-y-1.5 mb-4">
            <div class="flex items-center justify-between text-xs font-mono">
              <span class="text-neon-cyan flex items-center gap-1 font-bold">
                <ArrowDownToLine class="w-3 h-3" />
                <span>Download {{ downloadPercent }}%</span>
              </span>
              <span class="text-neon-magenta flex items-center gap-1 font-bold">
                <span>Upload {{ uploadPercent }}%</span>
                <ArrowUpFromLine class="w-3 h-3" />
              </span>
            </div>
            <div class="w-full h-3 rounded-full bg-slate-950 overflow-hidden flex border border-slate-800 p-0.5">
              <div
                class="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-l-full transition-all duration-500 shadow-sm shadow-cyan-500/50"
                :style="{ width: `${downloadPercent}%` }"
              ></div>
              <div
                class="h-full bg-gradient-to-r from-fuchsia-500 to-rose-500 rounded-r-full transition-all duration-500 shadow-sm shadow-rose-500/50"
                :style="{ width: `${uploadPercent}%` }"
              ></div>
            </div>
          </div>
        </div>

        <!-- 3-Column Metrics Stat Breakdown -->
        <div class="grid grid-cols-3 gap-3 pt-3 border-t border-slate-800/80 font-mono text-center">
          <div class="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <span class="text-[9px] uppercase tracking-wider text-slate-400 block">Total Volume</span>
            <span class="text-sm font-extrabold text-white">{{ formatBytes(bento?.totals.totalBytes || 0) }}</span>
          </div>
          <div class="p-2 rounded-xl bg-cyan-950/30 border border-cyan-900/40">
            <span class="text-[9px] uppercase tracking-wider text-cyan-300 block">Inbound (DL)</span>
            <span class="text-sm font-extrabold text-neon-cyan">{{ formatBytes(bento?.totals.totalDownloadBytes || 0) }}</span>
          </div>
          <div class="p-2 rounded-xl bg-fuchsia-950/30 border border-fuchsia-900/40">
            <span class="text-[9px] uppercase tracking-wider text-fuchsia-300 block">Outbound (UL)</span>
            <span class="text-sm font-extrabold text-neon-magenta">{{ formatBytes(bento?.totals.totalUploadBytes || 0) }}</span>
          </div>
        </div>
      </div>

      <!-- ==================================================================== -->
      <!-- BENTO CARD 2: App-ID Inspection & Gateway Health Status (4 cols)   -->
      <!-- ==================================================================== -->
      <div class="lg:col-span-4 rounded-2xl p-5 bg-gradient-to-br from-slate-900/95 to-slate-950/95 border border-slate-800 backdrop-blur-md shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-violet-500/40 transition">
        <div>
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <ShieldCheck class="w-4 h-4 text-emerald-400" />
              <h3 class="text-xs font-bold uppercase tracking-wider text-white">App-ID Engine</h3>
            </div>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              L7 Active
            </span>
          </div>

          <div class="grid grid-cols-2 gap-3 mb-3">
            <div class="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div class="text-[10px] text-slate-400 font-sans">Active App-IDs</div>
              <div class="text-lg font-black font-mono text-violet-300">
                {{ bento?.totals.activeAppIdsCount || 12 }} <span class="text-xs font-normal text-slate-500">Profiles</span>
              </div>
            </div>
            <div class="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div class="text-[10px] text-slate-400 font-sans">Monitored Hosts</div>
              <div class="text-lg font-black font-mono text-cyan-300">
                {{ bento?.totals.monitoredHostsCount || 8 }} <span class="text-xs font-normal text-slate-500">Endpoints</span>
              </div>
            </div>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
          <div class="flex items-center gap-1.5 text-slate-400 truncate">
            <Server class="w-3.5 h-3.5 text-violet-400 shrink-0" />
            <span class="truncate">{{ bento?.activeGateway || 'FortiGate-CSIR-SERC (10.10.3.15)' }}</span>
          </div>
          <span class="text-[10px] text-emerald-400 font-bold shrink-0">DPI ENFORCED</span>
        </div>
      </div>

      <!-- ==================================================================== -->
      <!-- BENTO CARD 3: Peak Throughput & Speed Snapshot (3 cols)             -->
      <!-- ==================================================================== -->
      <div class="lg:col-span-3 rounded-2xl p-5 bg-gradient-to-br from-slate-900/95 to-slate-950/95 border border-slate-800 backdrop-blur-md shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-violet-500/40 transition">
        <div>
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <Zap class="w-4 h-4 text-neon-amber" />
              <h3 class="text-xs font-bold uppercase tracking-wider text-white">Peak Speed</h3>
            </div>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              NKN WAN
            </span>
          </div>

          <div class="space-y-2 font-mono">
            <div class="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/70">
              <span class="text-[11px] text-slate-400 flex items-center gap-1">
                <ArrowDownToLine class="w-3 h-3 text-neon-cyan" /> Max DL
              </span>
              <span class="text-xs font-bold text-neon-cyan">{{ bento?.totals.peakDownloadMbps || 894.6 }} Mbps</span>
            </div>
            <div class="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/70">
              <span class="text-[11px] text-slate-400 flex items-center gap-1">
                <ArrowUpFromLine class="w-3 h-3 text-neon-magenta" /> Max UL
              </span>
              <span class="text-xs font-bold text-neon-magenta">{{ bento?.totals.peakUploadMbps || 480.2 }} Mbps</span>
            </div>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-800/80 text-[10px] font-mono text-slate-400 text-center">
          1-Gbps Dedicated National Knowledge Network
        </div>
      </div>

      <!-- ==================================================================== -->
      <!-- BENTO CARD 4: TOP UPLOADS (IP • System Name • App-ID) (6 cols)     -->
      <!-- ==================================================================== -->
      <div class="lg:col-span-6 rounded-2xl p-5 bg-gradient-to-br from-slate-900/95 to-slate-950/95 border border-slate-800 backdrop-blur-md shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-violet-500/40 transition">
        <div>
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <ArrowUpRight class="w-4 h-4" />
              </div>
              <div>
                <h3 class="text-xs font-bold uppercase tracking-wider text-white">Top Outbound Uploads</h3>
                <p class="text-[10px] text-slate-400">Ranked by outbound data pushed with IP, System Name &amp; App-ID</p>
              </div>
            </div>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
              EGRESS TALKERS
            </span>
          </div>

          <!-- Table of Top Uploaders -->
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                  <th class="py-2 px-2.5">#</th>
                  <th class="py-2 px-2.5">Host IP &amp; System Name</th>
                  <th class="py-2 px-2.5">Primary App-ID</th>
                  <th class="py-2 px-2.5 text-right">Upload Vol</th>
                  <th class="py-2 px-2.5 text-right">Speed</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60 font-mono">
                <tr
                  v-for="item in filteredUploaders"
                  :key="item.ip"
                  class="hover:bg-slate-800/40 transition group/row"
                >
                  <td class="py-2.5 px-2.5 text-slate-500 text-[10px] font-bold">
                    {{ item.rank }}
                  </td>
                  <td class="py-2.5 px-2.5">
                    <div class="text-slate-200 font-bold text-xs flex items-center gap-1.5">
                      <span>{{ item.ip }}</span>
                    </div>
                    <div class="text-[10px] text-slate-400 font-sans truncate max-w-[210px]" :title="item.systemName">
                      {{ item.systemName }}
                    </div>
                    <div class="text-[9px] text-violet-400 font-sans truncate max-w-[210px]">
                      {{ item.department }}
                    </div>
                  </td>
                  <td class="py-2.5 px-2.5 font-sans">
                    <span
                      class="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider inline-block"
                      :class="getAppBadgeClass(item.appId)"
                    >
                      {{ item.appId }}
                    </span>
                    <div class="text-[9px] text-slate-500 font-mono truncate max-w-[130px] mt-0.5">
                      &rarr; {{ item.destEndpoint }}
                    </div>
                  </td>
                  <td class="py-2.5 px-2.5 text-right">
                    <div class="text-neon-magenta font-extrabold text-xs">{{ formatBytes(item.uploadBytes) }}</div>
                    <div class="w-16 h-1 rounded-full bg-slate-800 ml-auto mt-1 overflow-hidden">
                      <div
                        class="h-full bg-rose-500 rounded-full"
                        :style="{ width: `${Math.min(100, Math.max(15, (item.uploadBytes / (maxUploadBytes || 1)) * 100))}%` }"
                      ></div>
                    </div>
                  </td>
                  <td class="py-2.5 px-2.5 text-right text-slate-300 text-xs font-medium">
                    {{ item.uploadRateMbps }} <span class="text-[9px] text-slate-500 font-normal">Mbps</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ==================================================================== -->
      <!-- BENTO CARD 5: TOP DOWNLOADS (IP • System Name • App-ID) (6 cols)   -->
      <!-- ==================================================================== -->
      <div class="lg:col-span-6 rounded-2xl p-5 bg-gradient-to-br from-slate-900/95 to-slate-950/95 border border-slate-800 backdrop-blur-md shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-violet-500/40 transition">
        <div>
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <ArrowDownLeft class="w-4 h-4" />
              </div>
              <div>
                <h3 class="text-xs font-bold uppercase tracking-wider text-white">Top Inbound Downloads</h3>
                <p class="text-[10px] text-slate-400">Ranked by inbound data pulled with IP, System Name &amp; App-ID</p>
              </div>
            </div>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              INGRESS TALKERS
            </span>
          </div>

          <!-- Table of Top Downloaders -->
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                  <th class="py-2 px-2.5">#</th>
                  <th class="py-2 px-2.5">Host IP &amp; System Name</th>
                  <th class="py-2 px-2.5">Primary App-ID</th>
                  <th class="py-2 px-2.5 text-right">Download Vol</th>
                  <th class="py-2 px-2.5 text-right">Speed</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60 font-mono">
                <tr
                  v-for="item in filteredDownloaders"
                  :key="item.ip"
                  class="hover:bg-slate-800/40 transition group/row"
                >
                  <td class="py-2.5 px-2.5 text-slate-500 text-[10px] font-bold">
                    {{ item.rank }}
                  </td>
                  <td class="py-2.5 px-2.5">
                    <div class="text-slate-200 font-bold text-xs flex items-center gap-1.5">
                      <span>{{ item.ip }}</span>
                    </div>
                    <div class="text-[10px] text-slate-400 font-sans truncate max-w-[210px]" :title="item.systemName">
                      {{ item.systemName }}
                    </div>
                    <div class="text-[9px] text-cyan-400 font-sans truncate max-w-[210px]">
                      {{ item.department }}
                    </div>
                  </td>
                  <td class="py-2.5 px-2.5 font-sans">
                    <span
                      class="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider inline-block"
                      :class="getAppBadgeClass(item.appId)"
                    >
                      {{ item.appId }}
                    </span>
                    <div class="text-[9px] text-slate-500 font-mono truncate max-w-[130px] mt-0.5">
                      &larr; {{ item.sourceEndpoint }}
                    </div>
                  </td>
                  <td class="py-2.5 px-2.5 text-right">
                    <div class="text-neon-cyan font-extrabold text-xs">{{ formatBytes(item.downloadBytes) }}</div>
                    <div class="w-16 h-1 rounded-full bg-slate-800 ml-auto mt-1 overflow-hidden">
                      <div
                        class="h-full bg-cyan-500 rounded-full"
                        :style="{ width: `${Math.min(100, Math.max(15, (item.downloadBytes / (maxDownloadBytes || 1)) * 100))}%` }"
                      ></div>
                    </div>
                  </td>
                  <td class="py-2.5 px-2.5 text-right text-slate-300 text-xs font-medium">
                    {{ item.downloadRateMbps }} <span class="text-[9px] text-slate-500 font-normal">Mbps</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ==================================================================== -->
      <!-- BENTO CARD 6: IP ADDRESS TO APP-ID MAPPING MATRIX (7 cols)          -->
      <!-- ==================================================================== -->
      <div class="lg:col-span-7 rounded-2xl p-5 bg-gradient-to-br from-slate-900/95 to-slate-950/95 border border-slate-800 backdrop-blur-md shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-violet-500/40 transition">
        <div>
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <Network class="w-4 h-4 text-neon-cyan" />
              <div>
                <h3 class="text-xs font-bold uppercase tracking-wider text-white">IP Address to APP-ID Mapping Matrix</h3>
                <p class="text-[10px] text-slate-400">Granular endpoint inventory mapping system hostnames to active Layer-7 profiles</p>
              </div>
            </div>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
              {{ filteredMappings.length }} Endpoints
            </span>
          </div>

          <!-- Mapping Matrix Table -->
          <div class="overflow-x-auto max-h-[380px] overflow-y-auto pr-1">
            <table class="w-full text-left border-collapse text-xs">
              <thead class="sticky top-0 bg-slate-950/90 backdrop-blur-md z-10">
                <tr class="border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                  <th class="py-2 px-2.5">Endpoint IP &amp; Hostname</th>
                  <th class="py-2 px-2.5">Primary App-ID</th>
                  <th class="py-2 px-2.5">Secondary Applications</th>
                  <th class="py-2 px-2.5">Upload / Download Split</th>
                  <th class="py-2 px-2.5 text-right">Sessions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60 font-mono">
                <tr
                  v-for="host in filteredMappings"
                  :key="host.ip"
                  class="hover:bg-slate-800/40 transition"
                >
                  <td class="py-2.5 px-2.5">
                    <div class="flex items-center gap-2">
                      <span class="w-2 h-2 rounded-full" :class="host.status === 'active' ? 'bg-emerald-400' : 'bg-slate-600'"></span>
                      <span class="text-slate-100 font-bold">{{ host.ip }}</span>
                    </div>
                    <div class="text-[10px] text-slate-400 font-sans truncate max-w-[210px]" :title="host.systemName">
                      {{ host.systemName }}
                    </div>
                    <div class="text-[9px] text-slate-500 font-sans truncate max-w-[210px]">
                      {{ host.zone }}
                    </div>
                  </td>
                  <td class="py-2.5 px-2.5 font-sans">
                    <span
                      class="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider inline-block"
                      :class="getAppBadgeClass(host.primaryAppId)"
                    >
                      {{ host.primaryAppId }}
                    </span>
                  </td>
                  <td class="py-2.5 px-2.5 font-sans">
                    <div class="flex flex-wrap gap-1 max-w-[180px]">
                      <span
                        v-for="sec in host.secondaryApps"
                        :key="sec"
                        class="px-1.5 py-0.2 rounded text-[9px] bg-slate-800 text-slate-300 border border-slate-700 font-mono"
                      >
                        {{ sec }}
                      </span>
                    </div>
                  </td>
                  <td class="py-2.5 px-2.5">
                    <div class="text-xs text-slate-200">
                      <span class="text-neon-magenta text-[11px] font-bold">&uarr; {{ formatBytes(host.uploadBytes) }}</span>
                      <span class="text-slate-600 mx-1">|</span>
                      <span class="text-neon-cyan text-[11px] font-bold">&darr; {{ formatBytes(host.downloadBytes) }}</span>
                    </div>
                    <div class="text-[10px] text-slate-500">
                      Total: {{ formatBytes(host.totalBytes) }}
                    </div>
                  </td>
                  <td class="py-2.5 px-2.5 text-right">
                    <span class="text-violet-300 font-bold text-xs">{{ host.activeSessions }}</span>
                    <span class="text-[9px] text-slate-500 block">flows</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ==================================================================== -->
      <!-- BENTO CARD 7: TOP APPLICATION USAGE (App-ID Distribution) (5 cols) -->
      <!-- ==================================================================== -->
      <div class="lg:col-span-5 rounded-2xl p-5 bg-gradient-to-br from-slate-900/95 to-slate-950/95 border border-slate-800 backdrop-blur-md shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-violet-500/40 transition">
        <div>
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <Cpu class="w-4 h-4 text-violet-400" />
              <div>
                <h3 class="text-xs font-bold uppercase tracking-wider text-white">Top Application Usage</h3>
                <p class="text-[10px] text-slate-400">Layer-7 App-ID distribution, protocol &amp; bandwidth share</p>
              </div>
            </div>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
              App-ID Analytics
            </span>
          </div>

          <!-- Application List Cards -->
          <div class="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            <div
              v-for="app in filteredApplications"
              :key="app.appId"
              class="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-violet-500/30 transition flex flex-col gap-1.5"
            >
              <div class="flex items-center justify-between text-xs">
                <div class="flex items-center gap-2 truncate">
                  <span class="font-bold text-white truncate">{{ app.appId }}</span>
                  <span class="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                    {{ app.protocol }}
                  </span>
                  <span
                    class="text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase tracking-wider"
                    :class="getRiskBadgeClass(app.riskLevel)"
                  >
                    {{ app.riskLevel }}
                  </span>
                </div>
                <span class="font-mono text-neon-cyan font-bold text-xs shrink-0">
                  {{ formatBytes(app.totalBytes) }}
                </span>
              </div>

              <!-- Progress Bar -->
              <div class="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full"
                  :style="{ width: `${Math.min(100, Math.max(8, app.percentage * 2))}%` }"
                ></div>
              </div>

              <div class="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span class="font-sans truncate text-slate-400">{{ app.category }}</span>
                <span>{{ app.sessionCount }} active sessions &bull; {{ app.percentage }}% pipe</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ==================================================================== -->
      <!-- BENTO CARD 8: IPS USING MORE DATA (Heavy Consumers) (12 cols)        -->
      <!-- ==================================================================== -->
      <div class="lg:col-span-12 rounded-2xl p-5 bg-gradient-to-br from-slate-900/95 to-slate-950/95 border border-slate-800 backdrop-blur-md shadow-xl relative overflow-hidden group hover:border-violet-500/40 transition">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Flame class="w-4 h-4" />
            </div>
            <div>
              <h3 class="text-xs font-bold uppercase tracking-wider text-white">IPs Using More Data (Gateway Bandwidth Heavy Consumers)</h3>
              <p class="text-[10px] text-slate-400">Ranked internal systems consuming the largest aggregate traffic slice through FortiGate</p>
            </div>
          </div>
          <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            TOP DATA CONSUMERS
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div
            v-for="item in bento?.heavyDataIps.slice(0, 8)"
            :key="item.ip"
            class="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-amber-500/30 transition flex flex-col justify-between"
          >
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-amber-300 font-bold">
                  Rank #{{ item.rank }}
                </span>
                <span class="text-[11px] font-mono text-amber-400 font-bold">
                  {{ item.percentOfTotal }}% Pipe
                </span>
              </div>
              <div class="font-mono text-xs font-bold text-white truncate">{{ item.ip }}</div>
              <div class="text-[10px] text-slate-400 font-sans truncate" :title="item.systemName">
                {{ item.systemName }}
              </div>
              <div class="text-[9px] text-violet-400 font-sans truncate mt-0.5">
                {{ item.zone }}
              </div>
            </div>

            <div class="mt-3 pt-2.5 border-t border-slate-800/80">
              <div class="flex items-center justify-between text-[11px] font-mono mb-1">
                <span class="text-slate-400">Volume:</span>
                <span class="font-bold text-white">{{ formatBytes(item.totalBytes) }}</span>
              </div>
              <div class="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full"
                  :style="{ width: `${Math.min(100, Math.max(10, item.percentOfTotal * 3))}%` }"
                ></div>
              </div>
              <div class="flex items-center justify-between text-[9px] text-slate-400 font-sans mt-1">
                <span class="truncate">App: {{ item.primaryAppId }}</span>
                <span class="font-mono text-slate-400">{{ item.flowsCount }} fl</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  Layers, Search, RefreshCw, ArrowDownToLine, ArrowUpFromLine,
  ShieldCheck, Server, Zap, ArrowUpRight, ArrowDownLeft, Network,
  Cpu, Flame
} from 'lucide-vue-next';
import { useTelemetryStore } from '../stores/telemetry.store.js';

const telemetry = useTelemetryStore();
const searchQuery = ref('');
const selectedCategory = ref('');
const isRefreshing = ref(false);

const bento = computed(() => telemetry.bentoAnalytics);

const downloadPercent = computed(() => bento.value?.totals.downloadRatioPercent || 54.2);
const uploadPercent = computed(() => bento.value?.totals.uploadRatioPercent || 45.8);

const maxUploadBytes = computed(() => {
  if (!bento.value?.topUploaders.length) return 1;
  return Math.max(...bento.value.topUploaders.map(u => u.uploadBytes));
});

const maxDownloadBytes = computed(() => {
  if (!bento.value?.topDownloaders.length) return 1;
  return Math.max(...bento.value.topDownloaders.map(d => d.downloadBytes));
});

const filteredUploaders = computed(() => {
  if (!bento.value?.topUploaders) return [];
  let list = bento.value.topUploaders;
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(u =>
      u.ip.toLowerCase().includes(q) ||
      u.systemName.toLowerCase().includes(q) ||
      u.appId.toLowerCase().includes(q) ||
      u.department.toLowerCase().includes(q)
    );
  }
  return list;
});

const filteredDownloaders = computed(() => {
  if (!bento.value?.topDownloaders) return [];
  let list = bento.value.topDownloaders;
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(d =>
      d.ip.toLowerCase().includes(q) ||
      d.systemName.toLowerCase().includes(q) ||
      d.appId.toLowerCase().includes(q) ||
      d.department.toLowerCase().includes(q)
    );
  }
  return list;
});

const filteredMappings = computed(() => {
  if (!bento.value?.ipAppIdMappings) return [];
  let list = bento.value.ipAppIdMappings;
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(m =>
      m.ip.toLowerCase().includes(q) ||
      m.systemName.toLowerCase().includes(q) ||
      m.primaryAppId.toLowerCase().includes(q) ||
      m.secondaryApps.some(s => s.toLowerCase().includes(q)) ||
      m.department.toLowerCase().includes(q)
    );
  }
  return list;
});

const filteredApplications = computed(() => {
  if (!bento.value?.topApplications) return [];
  let list = bento.value.topApplications;
  if (selectedCategory.value) {
    list = list.filter(a => a.category === selectedCategory.value);
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(a =>
      a.appId.toLowerCase().includes(q) ||
      a.displayName.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q)
    );
  }
  return list;
});

async function refreshBentoData() {
  isRefreshing.value = true;
  try {
    await telemetry.fetchBentoAnalytics();
  } finally {
    setTimeout(() => {
      isRefreshing.value = false;
    }, 400);
  }
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function getAppBadgeClass(appId: string): string {
  if (appId.includes('HPC') || appId.includes('Parallel') || appId.includes('Ansys')) {
    return 'bg-purple-500/15 text-purple-300 border border-purple-500/30';
  }
  if (appId.includes('Database') || appId.includes('Postgre') || appId.includes('Lustre')) {
    return 'bg-blue-500/15 text-blue-300 border border-blue-500/30';
  }
  if (appId.includes('Git') || appId.includes('Software')) {
    return 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30';
  }
  if (appId.includes('365') || appId.includes('Office') || appId.includes('Zoom')) {
    return 'bg-amber-500/15 text-amber-300 border border-amber-500/30';
  }
  if (appId.includes('BitTorrent') || appId.includes('Threat')) {
    return 'bg-rose-500/15 text-rose-300 border border-rose-500/30';
  }
  return 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30';
}

function getRiskBadgeClass(risk: string): string {
  switch (risk) {
    case 'Critical Infrastructure':
      return 'bg-blue-500/20 text-blue-300 border border-blue-500/40';
    case 'Productive Research':
      return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';
    case 'Collaboration':
      return 'bg-violet-500/20 text-violet-300 border border-violet-500/40';
    case 'High Risk':
      return 'bg-rose-500/20 text-rose-300 border border-rose-500/40';
    default:
      return 'bg-slate-800 text-slate-400 border border-slate-700';
  }
}

onMounted(() => {
  telemetry.fetchBentoAnalytics();
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
.text-neon-amber {
  color: #f59e0b;
  text-shadow: 0 0 10px rgba(245, 158, 11, 0.4);
}
</style>
