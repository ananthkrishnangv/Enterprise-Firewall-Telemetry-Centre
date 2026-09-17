<template>
  <div class="space-y-6 pb-12 select-none">
    <!-- Top Operations Control Toolbar -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-violet-950/70 border border-violet-800/50 backdrop-blur-md shadow-lg shadow-violet-950/40">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-violet-900/60 border border-violet-700/50 flex items-center justify-center text-cyan-300 shadow-md">
          <Activity class="w-5 h-5 text-neon-cyan animate-pulse" />
        </div>
        <div>
          <div class="text-sm font-bold text-white flex items-center gap-2 font-sans">
            <span>Overall Firewall Traffic &amp; Log Analyzer</span>
            <span class="text-violet-500">•</span>
            <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              InfluxDB 180-Day TSDB Active
            </span>
          </div>
          <div class="text-[10px] text-violet-300/80 font-mono">
            Continuous Full-Spectrum Ingress, Egress &amp; Security Drop Inspection
          </div>
        </div>
      </div>

      <!-- Toolbar Actions: View Switcher, Auto-Refresh, Export -->
      <div class="flex flex-wrap items-center gap-2">
        <div class="flex items-center rounded-xl bg-violet-900/50 p-1 border border-violet-700/40 text-xs font-bold">
          <button
            @click="activeTab = 'analytics'"
            class="px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
            :class="activeTab === 'analytics' ? 'bg-violet-600 text-white shadow-md' : 'text-violet-300 hover:text-white'"
          >
            <Layers class="w-3.5 h-3.5 text-cyan-300" />
            <span>Traffic Analytics</span>
          </button>
          <button
            @click="activeTab = 'explorer'"
            class="px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
            :class="activeTab === 'explorer' ? 'bg-violet-600 text-white shadow-md' : 'text-violet-300 hover:text-white'"
          >
            <Database class="w-3.5 h-3.5 text-emerald-400" />
            <span>Log Explorer &amp; Live Stream</span>
          </button>
        </div>

        <button
          @click="exportCsv"
          class="px-3 py-1.5 rounded-xl bg-violet-900/40 hover:bg-violet-800/80 border border-violet-700/50 text-cyan-300 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer"
          title="Download Filtered Logs as CSV"
        >
          <Download class="w-3.5 h-3.5 text-neon-cyan" />
          <span class="hidden sm:inline">Export CSV</span>
        </button>

        <AutoRefreshControl
          storageKey="auto_refresh_log_analyzer"
          :defaultInterval="10"
          :defaultEnabled="true"
          @refresh="handleRefresh"
        />
      </div>
    </div>

    <!-- KPI Summary Metric Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
      <!-- Total Analyzed Events -->
      <div class="ux4g-glass rounded-2xl p-4 relative overflow-hidden border border-violet-800/40">
        <div class="flex items-center justify-between text-xs text-violet-400 mb-1">
          <span>Analyzed Events</span>
          <Database class="w-4 h-4 text-violet-400" />
        </div>
        <div class="text-xl font-mono font-extrabold text-white">{{ stats.totalLogs.toLocaleString() }}</div>
        <div class="text-[10px] text-violet-300/70 mt-1 font-mono">Window: {{ selectedTimeRangeText }}</div>
      </div>

      <!-- Inbound WAN Volume -->
      <div class="ux4g-glass rounded-2xl p-4 relative overflow-hidden border border-cyan-500/20">
        <div class="flex items-center justify-between text-xs text-cyan-300 mb-1">
          <span>Inbound Traffic</span>
          <ArrowDownLeft class="w-4 h-4 text-neon-cyan" />
        </div>
        <div class="text-xl font-mono font-extrabold text-cyan-300">{{ formatBytes(stats.totalBytesIn) }}</div>
        <div class="text-[10px] text-cyan-400/80 mt-1 font-mono">External WAN Ingress</div>
      </div>

      <!-- Outbound Volume -->
      <div class="ux4g-glass rounded-2xl p-4 relative overflow-hidden border border-indigo-500/20">
        <div class="flex items-center justify-between text-xs text-indigo-300 mb-1">
          <span>Outbound Traffic</span>
          <ArrowUpRight class="w-4 h-4 text-indigo-400" />
        </div>
        <div class="text-xl font-mono font-extrabold text-indigo-300">{{ formatBytes(stats.totalBytesOut) }}</div>
        <div class="text-[10px] text-indigo-400/80 mt-1 font-mono">Campus &amp; HPC Egress</div>
      </div>

      <!-- Blocked / Dropped Traffic -->
      <div class="ux4g-glass rounded-2xl p-4 relative overflow-hidden border border-rose-500/30 bg-rose-950/10">
        <div class="flex items-center justify-between text-xs text-rose-300 mb-1">
          <span>Blocked Traffic</span>
          <Shield class="w-4 h-4 text-rose-400" />
        </div>
        <div class="text-xl font-mono font-extrabold text-rose-400">{{ stats.blockedCount.toLocaleString() }}</div>
        <div class="text-[10px] text-rose-300/80 mt-1 font-mono">Security Threat Enforcements</div>
      </div>

      <!-- Block Rate % -->
      <div class="ux4g-glass rounded-2xl p-4 relative overflow-hidden border border-amber-500/20 col-span-2 lg:col-span-1">
        <div class="flex items-center justify-between text-xs text-amber-300 mb-1">
          <span>Threat Interception</span>
          <AlertTriangle class="w-4 h-4 text-neon-amber" />
        </div>
        <div class="text-xl font-mono font-extrabold text-neon-amber">{{ stats.blockRatePercent }}%</div>
        <div class="text-[10px] text-amber-400/80 mt-1 font-mono">Overall Firewall Drop Rate</div>
      </div>
    </div>

    <!-- Multi-Parameter Filter Toolbar -->
    <div class="p-4 rounded-2xl bg-slate-900/90 border border-violet-800/40 space-y-3">
      <div class="flex flex-wrap items-center gap-3">
        <!-- Time Range Selector -->
        <div class="w-40">
          <label class="block text-[10px] uppercase font-bold text-violet-400 mb-1">Time Range</label>
          <select
            v-model="filters.timeRangeMinutes"
            @change="applyFilters"
            class="w-full bg-violet-950/80 border border-violet-700/50 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-medium"
          >
            <option :value="15">Last 15 Minutes</option>
            <option :value="60">Last 1 Hour</option>
            <option :value="360">Last 6 Hours</option>
            <option :value="1440">Last 24 Hours</option>
            <option :value="10080">Last 7 Days</option>
          </select>
        </div>

        <!-- Direction Filter -->
        <div class="w-44">
          <label class="block text-[10px] uppercase font-bold text-violet-400 mb-1">Traffic Direction</label>
          <select
            v-model="filters.direction"
            @change="applyFilters"
            class="w-full bg-violet-950/80 border border-violet-700/50 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-medium"
          >
            <option value="all">All Directions (In &amp; Out)</option>
            <option value="inbound">Inbound (WAN &rarr; LAN)</option>
            <option value="outbound">Outbound (LAN &rarr; WAN)</option>
            <option value="internal">Internal (Inter-VLAN)</option>
          </select>
        </div>

        <!-- Action Filter -->
        <div class="w-44">
          <label class="block text-[10px] uppercase font-bold text-violet-400 mb-1">Enforcement Action</label>
          <select
            v-model="filters.action"
            @change="applyFilters"
            class="w-full bg-violet-950/80 border border-violet-700/50 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-medium"
          >
            <option value="all">All Traffic (Allowed + Blocked)</option>
            <option value="allow">Allowed (Permitted Pass)</option>
            <option value="blocked">Blocked / Dropped (Attacks &amp; Drops)</option>
          </select>
        </div>

        <!-- Protocol Filter -->
        <div class="w-32">
          <label class="block text-[10px] uppercase font-bold text-violet-400 mb-1">Protocol</label>
          <select
            v-model="filters.protocol"
            @change="applyFilters"
            class="w-full bg-violet-950/80 border border-violet-700/50 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-medium"
          >
            <option value="all">All Protocols</option>
            <option value="TCP">TCP</option>
            <option value="UDP">UDP</option>
            <option value="ICMP">ICMP</option>
          </select>
        </div>

        <!-- Free Text IP / Hostname / Subnet / App Search -->
        <div class="flex-1 min-w-[220px]">
          <label class="block text-[10px] uppercase font-bold text-violet-400 mb-1">Search IP / Subnet / Host / App</label>
          <div class="relative">
            <input
              v-model="filters.search"
              @input="handleSearchDebounced"
              type="text"
              placeholder="e.g. 10.10.11.14, 185.220.101.5, Ansys, BitTorrent, ICTD..."
              class="w-full bg-violet-950/80 border border-violet-700/50 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-violet-500 focus:outline-none focus:border-cyan-400 font-mono"
            />
            <Search class="w-3.5 h-3.5 text-violet-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        <!-- Reset Button -->
        <div class="pt-4">
          <button
            @click="resetFilters"
            class="px-3 py-1.5 rounded-lg bg-violet-900/60 hover:bg-violet-800 text-violet-300 text-xs font-medium border border-violet-700/50 transition cursor-pointer"
          >
            Reset
          </button>
        </div>
      </div>
    </div>

    <!-- TAB 1: TRAFFIC ANALYTICS VIEW -->
    <div v-if="activeTab === 'analytics'" class="space-y-6">
      <!-- Inbound vs Outbound vs Blocked Volume Timeline Chart -->
      <div class="ux4g-glass rounded-2xl p-5 border border-violet-800/40 relative overflow-hidden">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-neon-cyan animate-pulse"></span>
            <h2 class="text-sm font-bold text-white font-sans">
              Overall Firewall Traffic &amp; Threat Ingestion Velocity (Allowed vs Blocked)
            </h2>
          </div>
          <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-900/60 text-cyan-300 border border-violet-700/40">
            Time-Series Resolution: Auto-Bucketed
          </span>
        </div>

        <div class="h-64 -my-2">
          <v-chart :option="timelineOption" autoresize />
        </div>
      </div>

      <!-- 4 Analytics Breakdown Cards (Top Sources, Top Blocked, Top Destinations, App Breakdown) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <!-- Top Source Talkers (Entire Institution) -->
        <div class="ux4g-glass rounded-2xl p-5 border border-violet-800/40 flex flex-col justify-between">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <Server class="w-4 h-4 text-neon-cyan" />
              <h3 class="text-xs font-bold uppercase tracking-wider text-violet-200">
                Top Source Talkers (All VLANs &amp; Subnets)
              </h3>
            </div>
            <span class="text-[10px] font-mono text-violet-400">By Transferred Bytes</span>
          </div>

          <div class="space-y-2 overflow-y-auto max-h-72">
            <div
              v-for="(src, idx) in stats.topSources"
              :key="src.ip"
              class="p-2.5 rounded-xl bg-violet-950/60 border border-violet-800/40 flex items-center justify-between text-xs"
            >
              <div class="flex items-center gap-2.5 min-w-0">
                <span class="w-5 h-5 rounded-lg bg-violet-900/80 flex items-center justify-center font-mono font-bold text-[10px] text-cyan-300">
                  {{ idx + 1 }}
                </span>
                <div class="min-w-0">
                  <div class="font-mono font-bold text-white flex items-center gap-2 truncate">
                    <span>{{ src.ip }}</span>
                    <span class="text-[10px] text-violet-400 truncate hidden sm:inline">({{ src.name }})</span>
                  </div>
                  <div class="text-[10px] text-violet-400/80 truncate">{{ src.dept }}</div>
                </div>
              </div>

              <div class="text-right flex-shrink-0 ml-3">
                <div class="font-mono font-bold text-cyan-300">{{ formatBytes(src.bytes) }}</div>
                <div class="text-[10px] text-violet-400 font-mono">{{ src.count }} sessions</div>
              </div>
            </div>

            <div v-if="stats.topSources.length === 0" class="py-8 text-center text-xs text-violet-400">
              No traffic records found matching selected filter.
            </div>
          </div>
        </div>

        <!-- Top Blocked Security Threats & Attack Sources -->
        <div class="ux4g-glass rounded-2xl p-5 border border-rose-500/30 bg-rose-950/10 flex flex-col justify-between">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <Shield class="w-4 h-4 text-rose-400" />
              <h3 class="text-xs font-bold uppercase tracking-wider text-rose-200">
                Top Blocked Threats &amp; Dropped Connections
              </h3>
            </div>
            <span class="text-[10px] font-mono text-rose-400">Security Enforcement</span>
          </div>

          <div class="space-y-2 overflow-y-auto max-h-72">
            <div
              v-for="threat in stats.topBlockedThreats"
              :key="threat.ip + threat.threat"
              class="p-2.5 rounded-xl bg-violet-950/70 border border-rose-500/30 flex items-center justify-between text-xs"
            >
              <div class="min-w-0">
                <div class="font-mono font-bold text-rose-300 flex items-center gap-1.5 truncate">
                  <XCircle class="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                  <span class="truncate">{{ threat.threat }}</span>
                </div>
                <div class="text-[10px] font-mono text-violet-400 truncate">
                  Source: <span class="text-white">{{ threat.ip }}</span> • Last seen: {{ formatRelativeTime(threat.lastSeen) }}
                </div>
              </div>

              <div class="text-right flex-shrink-0 ml-3">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  {{ threat.count }} Blocked
                </span>
              </div>
            </div>

            <div v-if="stats.topBlockedThreats.length === 0" class="py-8 text-center text-xs text-emerald-400">
              Zero blocked threats detected in current time window.
            </div>
          </div>
        </div>

        <!-- Top External Destinations & Cloud Services -->
        <div class="ux4g-glass rounded-2xl p-5 border border-violet-800/40 flex flex-col justify-between">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <Globe class="w-4 h-4 text-indigo-400" />
              <h3 class="text-xs font-bold uppercase tracking-wider text-violet-200">
                Top External Targets &amp; Cloud Services
              </h3>
            </div>
            <span class="text-[10px] font-mono text-violet-400">Destination Endpoints</span>
          </div>

          <div class="space-y-2 overflow-y-auto max-h-72">
            <div
              v-for="(dst, idx) in stats.topDestinations"
              :key="dst.ip"
              class="p-2.5 rounded-xl bg-violet-950/60 border border-violet-800/40 flex items-center justify-between text-xs"
            >
              <div class="flex items-center gap-2.5 min-w-0">
                <span class="w-5 h-5 rounded-lg bg-violet-900/80 flex items-center justify-center font-mono font-bold text-[10px] text-indigo-300">
                  {{ idx + 1 }}
                </span>
                <div class="min-w-0">
                  <div class="font-mono font-bold text-white truncate flex items-center gap-1.5">
                    <span>{{ dst.ip }}</span>
                    <span class="text-[10px] font-sans text-indigo-300 truncate hidden sm:inline">({{ dst.name }})</span>
                  </div>
                  <div class="text-[10px] text-violet-400 font-mono">Geo Location: {{ dst.country }}</div>
                </div>
              </div>

              <div class="text-right flex-shrink-0 ml-3">
                <div class="font-mono font-bold text-indigo-300">{{ formatBytes(dst.bytes) }}</div>
                <div class="text-[10px] text-violet-400 font-mono">{{ dst.count }} flows</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Applications (App-ID Distribution) -->
        <div class="ux4g-glass rounded-2xl p-5 border border-violet-800/40 flex flex-col justify-between">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <Layers class="w-4 h-4 text-cyan-300" />
              <h3 class="text-xs font-bold uppercase tracking-wider text-violet-200">
                Application (App-ID) Traffic Share
              </h3>
            </div>
            <span class="text-[10px] font-mono text-violet-400">Layer-7 Signatures</span>
          </div>

          <div class="space-y-2.5 overflow-y-auto max-h-72">
            <div
              v-for="app in stats.topApplications"
              :key="app.name"
              class="space-y-1"
            >
              <div class="flex items-center justify-between text-xs">
                <span class="font-mono font-bold text-white flex items-center gap-1.5 truncate">
                  <span class="w-2 h-2 rounded-full bg-cyan-400"></span>
                  <span class="truncate">{{ app.name }}</span>
                </span>
                <span class="font-mono text-cyan-300 font-bold ml-2">{{ formatBytes(app.bytes) }}</span>
              </div>
              <div class="w-full h-1.5 rounded-full bg-violet-900/60 overflow-hidden">
                <div
                  class="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400"
                  :style="{ width: `${Math.min(100, Math.max(5, (app.bytes / (stats.totalBytes || 1)) * 100))}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 2: DEEP LOG EXPLORER & LIVE STREAM -->
    <div v-else class="space-y-4">
      <!-- Live Stream Status Bar -->
      <div class="flex items-center justify-between px-4 py-2.5 rounded-xl bg-violet-950/80 border border-violet-800/40 text-xs font-mono text-violet-300">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full" :class="isPaused ? 'bg-amber-400' : 'bg-emerald-400 animate-ping'"></span>
          <span>{{ isPaused ? 'Stream Paused (Historical Review)' : 'Live WebSocket Telemetry Ingest Active' }}</span>
        </div>

        <div class="flex items-center gap-3">
          <span>Displaying {{ logsList.length }} of {{ totalLogsCount }} Total Filtered Records</span>
          <button
            @click="isPaused = !isPaused"
            class="px-2.5 py-1 rounded bg-violet-900/60 hover:bg-violet-800 text-cyan-300 transition cursor-pointer"
          >
            {{ isPaused ? 'Resume Stream' : 'Pause Stream' }}
          </button>
        </div>
      </div>

      <!-- Log Explorer Table -->
      <div class="ux4g-glass rounded-2xl border border-violet-800/40 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-violet-950 border-b border-violet-800/50 text-[10px] uppercase font-bold text-violet-400 tracking-wider font-mono">
              <tr>
                <th class="py-3 px-4">Timestamp</th>
                <th class="py-3 px-3">Direction</th>
                <th class="py-3 px-3">Action</th>
                <th class="py-3 px-4">Source Host &amp; Dept</th>
                <th class="py-3 px-4">Destination Target</th>
                <th class="py-3 px-3">App / Protocol</th>
                <th class="py-3 px-3 text-right">Data Volume</th>
                <th class="py-3 px-3 text-center">Details</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-violet-900/30 font-mono">
              <tr
                v-for="log in logsList"
                :key="log.id"
                class="hover:bg-violet-900/30 transition-colors"
                :class="log.action === 'drop' || log.action === 'block' ? 'bg-rose-950/10' : ''"
              >
                <!-- Timestamp -->
                <td class="py-2.5 px-4 text-violet-300/80 whitespace-nowrap text-[11px]">
                  {{ formatTimestamp(log.timestamp) }}
                </td>

                <!-- Direction -->
                <td class="py-2.5 px-3 whitespace-nowrap">
                  <span
                    class="px-2 py-0.5 rounded text-[9px] font-bold uppercase"
                    :class="[
                      log.direction === 'inbound' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' :
                      log.direction === 'outbound' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' :
                      'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    ]"
                  >
                    {{ log.direction }}
                  </span>
                </td>

                <!-- Action Badge -->
                <td class="py-2.5 px-3 whitespace-nowrap">
                  <span
                    v-if="log.action === 'allow'"
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  >
                    <CheckCircle2 class="w-3 h-3 text-emerald-400" />
                    PASS
                  </span>
                  <span
                    v-else
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40"
                  >
                    <XCircle class="w-3 h-3 text-rose-400" />
                    BLOCKED
                  </span>
                </td>

                <!-- Source Host & Department -->
                <td class="py-2.5 px-4">
                  <div class="text-white font-bold text-xs">{{ log.sourceIp }}:{{ log.sourcePort }}</div>
                  <div class="text-[10px] text-violet-400 truncate max-w-[200px]" :title="log.sourceDept || log.sourceName">
                    {{ log.sourceDept || log.sourceName || 'General Network' }}
                  </div>
                </td>

                <!-- Destination Target -->
                <td class="py-2.5 px-4">
                  <div class="text-cyan-300 font-bold text-xs flex items-center gap-1">
                    <span>{{ log.destIp }}:{{ log.destPort }}</span>
                    <span v-if="log.destCountry" class="text-[9px] px-1 rounded bg-violet-900 text-violet-300">{{ log.destCountry }}</span>
                  </div>
                  <div class="text-[10px] text-violet-400 truncate max-w-[200px]" :title="log.destName">
                    {{ log.destName || 'Public Transit' }}
                  </div>
                </td>

                <!-- App-ID / Protocol -->
                <td class="py-2.5 px-3 whitespace-nowrap">
                  <div class="text-white text-xs font-semibold">{{ log.application }}</div>
                  <div class="text-[10px] text-violet-400">{{ log.protocol }} • {{ log.policyName || 'Policy Rule' }}</div>
                </td>

                <!-- Volume -->
                <td class="py-2.5 px-3 text-right whitespace-nowrap">
                  <div class="font-bold text-xs text-white">{{ formatBytes((log.bytesIn || 0) + (log.bytesOut || 0)) }}</div>
                  <div class="text-[9px] text-violet-400">{{ (log.packetsIn || 1) + (log.packetsOut || 1) }} pkts</div>
                </td>

                <!-- View Detail Button -->
                <td class="py-2.5 px-3 text-center whitespace-nowrap">
                  <button
                    @click="openLogModal(log)"
                    class="p-1 rounded hover:bg-violet-800 text-cyan-300 transition cursor-pointer"
                    title="View Raw Log Details"
                  >
                    <Eye class="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>

              <tr v-if="logsList.length === 0">
                <td colspan="8" class="py-12 text-center text-xs text-violet-400 font-sans">
                  No log events found matching the active filters.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Controls -->
        <div class="p-4 border-t border-violet-800/40 flex items-center justify-between text-xs font-mono">
          <div class="text-violet-400">
            Page {{ currentPage }} of {{ totalPages }}
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="prevPage"
              :disabled="currentPage <= 1"
              class="px-3 py-1.5 rounded-lg bg-violet-900/60 hover:bg-violet-800 disabled:opacity-40 text-cyan-300 transition cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft class="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <button
              @click="nextPage"
              :disabled="currentPage >= totalPages"
              class="px-3 py-1.5 rounded-lg bg-violet-900/60 hover:bg-violet-800 disabled:opacity-40 text-cyan-300 transition cursor-pointer flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Detailed Raw Log Modal -->
    <div
      v-if="selectedModalLog"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      @click.self="selectedModalLog = null"
    >
      <div class="w-full max-w-2xl rounded-2xl bg-slate-950 border border-violet-700/60 p-6 space-y-4 shadow-2xl">
        <div class="flex items-center justify-between border-b border-violet-800/40 pb-3">
          <div class="flex items-center gap-2">
            <Shield class="w-5 h-5 text-neon-cyan" />
            <h3 class="text-sm font-bold text-white font-sans">Packet &amp; Security Log Details</h3>
          </div>
          <button
            @click="selectedModalLog = null"
            class="p-1 rounded text-violet-400 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div class="space-y-3 font-mono text-xs">
          <div class="grid grid-cols-2 gap-3 p-3 rounded-xl bg-violet-950/60 border border-violet-800/40">
            <div><span class="text-violet-400">Timestamp:</span> <span class="text-white">{{ selectedModalLog.timestamp }}</span></div>
            <div><span class="text-violet-400">Action:</span> <span :class="selectedModalLog.action === 'allow' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'">{{ selectedModalLog.action.toUpperCase() }}</span></div>
            <div><span class="text-violet-400">Source:</span> <span class="text-cyan-300">{{ selectedModalLog.sourceIp }}:{{ selectedModalLog.sourcePort }}</span></div>
            <div><span class="text-violet-400">Destination:</span> <span class="text-indigo-300">{{ selectedModalLog.destIp }}:{{ selectedModalLog.destPort }}</span></div>
            <div><span class="text-violet-400">Application:</span> <span class="text-white">{{ selectedModalLog.application }}</span></div>
            <div><span class="text-violet-400">Protocol:</span> <span class="text-white">{{ selectedModalLog.protocol }}</span></div>
            <div><span class="text-violet-400">Department:</span> <span class="text-white">{{ selectedModalLog.sourceDept || 'General' }}</span></div>
            <div><span class="text-violet-400">Policy:</span> <span class="text-white">{{ selectedModalLog.policyName || 'Default' }}</span></div>
            <div v-if="selectedModalLog.threatCategory" class="col-span-2 text-rose-300">
              <span class="text-violet-400">Threat Classification:</span> {{ selectedModalLog.threatCategory }}
            </div>
          </div>

          <div>
            <div class="text-[10px] uppercase font-bold text-violet-400 mb-1">FortiOS Raw Hardware Syslog:</div>
            <pre class="p-3 rounded-xl bg-slate-900 border border-violet-800/40 text-[11px] text-cyan-200 overflow-x-auto whitespace-pre-wrap">{{ selectedModalLog.rawLog || 'Raw hardware log stream record' }}</pre>
          </div>
        </div>

        <div class="flex justify-end pt-2">
          <button
            @click="selectedModalLog = null"
            class="px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import {
  Activity,
  Shield,
  AlertTriangle,
  Search,
  Download,
  Layers,
  Database,
  ArrowDownLeft,
  ArrowUpRight,
  Globe,
  Server,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Eye
} from 'lucide-vue-next';
import AutoRefreshControl from '../components/AutoRefreshControl.vue';

interface TrafficStats {
  totalLogs: number;
  totalBytesIn: number;
  totalBytesOut: number;
  totalBytes: number;
  allowedCount: number;
  blockedCount: number;
  blockRatePercent: number;
  topSources: { ip: string; name: string; dept: string; bytes: number; count: number }[];
  topDestinations: { ip: string; name: string; country: string; bytes: number; count: number }[];
  topBlockedThreats: { ip: string; threat: string; count: number; lastSeen: string }[];
  topApplications: { name: string; bytes: number; count: number; risk: string }[];
  protocolDistribution: { protocol: string; bytes: number; count: number }[];
}

const activeTab = ref<'analytics' | 'explorer'>('analytics');
const isPaused = ref(false);
const currentPage = ref(1);
const pageSize = 50;
const totalLogsCount = ref(0);
const selectedModalLog = ref<any | null>(null);

const stats = reactive<TrafficStats>({
  totalLogs: 0,
  totalBytesIn: 0,
  totalBytesOut: 0,
  totalBytes: 0,
  allowedCount: 0,
  blockedCount: 0,
  blockRatePercent: 0,
  topSources: [],
  topDestinations: [],
  topBlockedThreats: [],
  topApplications: [],
  protocolDistribution: []
});

const filters = reactive({
  timeRangeMinutes: 60,
  direction: 'all',
  action: 'all',
  protocol: 'all',
  severity: 'all',
  search: ''
});

const logsList = ref<any[]>([]);
const timelineData = ref<{ timestamp: string; allowedBytes: number; blockedBytes: number }[]>([]);

let searchTimeout: any = null;

const selectedTimeRangeText = computed(() => {
  const m = filters.timeRangeMinutes;
  if (m === 15) return 'Last 15m';
  if (m === 60) return 'Last 1h';
  if (m === 360) return 'Last 6h';
  if (m === 1440) return 'Last 24h';
  if (m === 10080) return 'Last 7d';
  return `${m}m`;
});

const totalPages = computed(() => Math.max(1, Math.ceil(totalLogsCount.value / pageSize)));

// ECharts Volume Timeline Configuration
const timelineOption = computed(() => {
  const times = timelineData.value.map(d => {
    const dt = new Date(d.timestamp);
    return dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  });
  const allowed = timelineData.value.map(d => parseFloat(((d.allowedBytes * 8) / (1024 * 1024)).toFixed(2)));
  const blocked = timelineData.value.map(d => parseFloat(((d.blockedBytes * 8) / (1024 * 1024)).toFixed(2)));

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#0f172a',
      borderColor: '#4f46e5',
      textStyle: { color: '#f8fafc', fontSize: 11 }
    },
    legend: {
      data: ['Permitted Bandwidth (Mbps)', 'Blocked Threat Traffic (Mbps)'],
      textStyle: { color: '#cbd5e1', fontSize: 11 },
      top: 0
    },
    grid: {
      left: '3%',
      right: '3%',
      bottom: '5%',
      top: '16%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: times,
      axisLine: { lineStyle: { color: '#475569' } },
      axisLabel: { color: '#94a3b8', fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      name: 'Mbps',
      nameTextStyle: { color: '#94a3b8', fontSize: 10 },
      splitLine: { lineStyle: { color: '#334155', type: 'dashed' } },
      axisLabel: { color: '#94a3b8', fontSize: 10 }
    },
    series: [
      {
        name: 'Permitted Bandwidth (Mbps)',
        type: 'line',
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 2.5, color: '#06b6d4' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(6, 182, 212, 0.4)' },
              { offset: 1, color: 'rgba(6, 182, 212, 0.0)' }
            ]
          }
        },
        data: allowed
      },
      {
        name: 'Blocked Threat Traffic (Mbps)',
        type: 'line',
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 2.5, color: '#f43f5e' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(244, 63, 94, 0.5)' },
              { offset: 1, color: 'rgba(244, 63, 94, 0.0)' }
            ]
          }
        },
        data: blocked
      }
    ]
  };
});

async function fetchStats() {
  try {
    const res = await fetch(`/api/logs/analyzer/stats?timeRange=${filters.timeRangeMinutes}`);
    const data = await res.json();
    if (data.success) {
      Object.assign(stats, data);
    }
  } catch (err) {
    console.error('Failed to fetch traffic stats', err);
  }
}

async function fetchTimeline() {
  try {
    const res = await fetch(`/api/logs/analyzer/timeline?timeRange=${filters.timeRangeMinutes}`);
    const data = await res.json();
    if (data.success && data.timeline) {
      timelineData.value = data.timeline;
    }
  } catch (err) {
    console.error('Failed to fetch timeline', err);
  }
}

async function fetchLogs() {
  if (isPaused.value) return;

  try {
    const offset = (currentPage.value - 1) * pageSize;
    const q = new URLSearchParams({
      direction: filters.direction,
      action: filters.action,
      protocol: filters.protocol,
      severity: filters.severity,
      search: filters.search,
      timeRange: filters.timeRangeMinutes.toString(),
      limit: pageSize.toString(),
      offset: offset.toString()
    });

    const res = await fetch(`/api/logs/analyzer/query?${q.toString()}`);
    const data = await res.json();
    if (data.success) {
      logsList.value = data.logs || [];
      totalLogsCount.value = data.total || 0;
    }
  } catch (err) {
    console.error('Failed to fetch logs query', err);
  }
}

function handleRefresh() {
  fetchStats();
  fetchTimeline();
  fetchLogs();
}

function applyFilters() {
  currentPage.value = 1;
  handleRefresh();
}

function handleSearchDebounced() {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    applyFilters();
  }, 350);
}

function resetFilters() {
  filters.timeRangeMinutes = 60;
  filters.direction = 'all';
  filters.action = 'all';
  filters.protocol = 'all';
  filters.severity = 'all';
  filters.search = '';
  applyFilters();
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
    fetchLogs();
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    fetchLogs();
  }
}

function openLogModal(log: any) {
  selectedModalLog.value = log;
}

function exportCsv() {
  window.open('/api/logs/analyzer/export', '_blank');
}

function formatBytes(bytes: number = 0): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function formatTimestamp(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatRelativeTime(iso: string): string {
  if (!iso) return 'just now';
  const diffSec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  return `${Math.floor(diffSec / 3600)}h ago`;
}

onMounted(() => {
  handleRefresh();
});

onUnmounted(() => {
  if (searchTimeout) clearTimeout(searchTimeout);
});
</script>
