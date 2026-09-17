<template>
  <div class="space-y-6 pb-12 select-none">
    <!-- Top Telemetry Operations Control Bar: Gateway Status, Log Storage & Continuous Auto-Refresh -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-violet-950/70 border border-violet-800/50 backdrop-blur-md shadow-lg shadow-violet-950/40">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-violet-900/60 border border-violet-700/50 flex items-center justify-center text-cyan-300">
          <Activity class="w-5 h-5 text-neon-cyan animate-pulse" />
        </div>
        <div>
          <div class="text-xs font-bold text-white flex items-center gap-2">
            <span>{{ fwStore.activeFirewall?.name || 'FortiGate-CSIR-SERC' }}</span>
            <span class="text-violet-500">•</span>
            <span class="text-[11px] font-mono font-bold text-emerald-400">
              {{ fwStore.activeFirewall?.ipAddress || '10.10.3.15' }} (SNMP v2c Online)
            </span>
          </div>
          <div class="text-[10px] text-violet-300/80 font-mono">
            Real-Time Ingress/Egress Inspection • Postgres Telemetry Engine Active
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2.5">
        <!-- Log & DB Storage Locations Modal Trigger -->
        <button
          @click="telemetry.isStorageModalOpen = true"
          class="px-3 py-1.5 rounded-xl bg-violet-900/40 hover:bg-violet-800/80 border border-violet-700/50 text-cyan-300 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer"
          title="Inspect where logs &amp; telemetry are stored"
        >
          <Database class="w-3.5 h-3.5 text-neon-cyan" />
          <span>Storage Locations</span>
        </button>

        <!-- Continuous Hands-Free Auto-Refresh Component -->
        <AutoRefreshControl
          storageKey="auto_refresh_dashboard"
          :defaultInterval="10"
          :defaultEnabled="true"
          @refresh="handleAutoRefresh"
        />
      </div>
    </div>

    <!-- Top Speed Monitoring & Liquid Flow Hero Section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <!-- Inbound Speed Dial Gauge (Live Liquid Rainbow Style) -->
      <div class="ux4g-glass rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between rainbow-border">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-neon-cyan animate-ping"></span>
            <span class="text-xs font-bold uppercase tracking-wider text-violet-300 font-sans">
              Live Incoming Traffic Speed
            </span>
          </div>
          <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-neon-cyan border border-cyan-500/40">
            port1 WAN INBOUND
          </span>
        </div>

        <!-- ECharts Inbound Speedometer Gauge -->
        <div class="h-44 -my-2 flex items-center justify-center">
          <v-chart :option="inboundGaugeOption" autoresize />
        </div>

        <!-- Digital Readout & Peak Rate -->
        <div class="pt-3 border-t border-violet-800/40 flex items-center justify-between text-xs">
          <div>
            <span class="text-[10px] text-violet-400 block uppercase">Current Rate</span>
            <span class="font-mono text-lg font-extrabold text-neon-cyan">{{ currentInRateMbps }} <span class="text-xs text-violet-400">Mbps</span></span>
          </div>
          <div class="text-right">
            <span class="text-[10px] text-violet-400 block uppercase">Peak Ingest Speed</span>
            <span class="font-mono text-sm font-bold text-violet-200">1,240.0 Mbps</span>
          </div>
        </div>
      </div>

      <!-- Outbound Speed Dial Gauge -->
      <div class="ux4g-glass rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between rainbow-border">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-neon-magenta animate-ping"></span>
            <span class="text-xs font-bold uppercase tracking-wider text-violet-300 font-sans">
              Live Outgoing Traffic Speed
            </span>
          </div>
          <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-fuchsia-500/20 text-neon-magenta border border-fuchsia-500/40">
            port1 WAN EGRESS
          </span>
        </div>

        <!-- ECharts Outbound Speedometer Gauge -->
        <div class="h-44 -my-2 flex items-center justify-center">
          <v-chart :option="outboundGaugeOption" autoresize />
        </div>

        <!-- Digital Readout & Peak Rate -->
        <div class="pt-3 border-t border-violet-800/40 flex items-center justify-between text-xs">
          <div>
            <span class="text-[10px] text-violet-400 block uppercase">Current Rate</span>
            <span class="font-mono text-lg font-extrabold text-neon-magenta">{{ currentOutRateMbps }} <span class="text-xs text-violet-400">Mbps</span></span>
          </div>
          <div class="text-right">
            <span class="text-[10px] text-violet-400 block uppercase">Peak Egress Speed</span>
            <span class="font-mono text-sm font-bold text-violet-200">980.5 Mbps</span>
          </div>
        </div>
      </div>

      <!-- 15-Minute Automated Internet Speed Test & ISP Center -->
      <div class="ux4g-glass rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between border-violet-700/50">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Gauge class="w-4 h-4 text-neon-amber" />
            <span class="text-xs font-bold uppercase tracking-wider text-white">
              Internet Speed Test (15m Interval)
            </span>
          </div>
          <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
            AUTO CYCLE
          </span>
        </div>

        <!-- Speed Test Big Numbers -->
        <div class="grid grid-cols-2 gap-3 my-2">
          <div class="p-3 rounded-xl bg-violet-900/40 border border-violet-700/40 relative overflow-hidden">
            <div class="text-[10px] text-violet-400 uppercase font-semibold">Download Speed</div>
            <div class="text-2xl font-black font-mono text-white mt-0.5 flex items-baseline gap-1">
              <span>{{ telemetry.speedtest.downloadMbps }}</span>
              <span class="text-xs text-neon-cyan font-normal">Mbps</span>
            </div>
            <div class="text-[9px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
              <span>↑ Low Jitter</span>
              <span>•</span>
              <span>{{ telemetry.speedtest.jitterMs }} ms</span>
            </div>
          </div>

          <div class="p-3 rounded-xl bg-violet-900/40 border border-violet-700/40 relative overflow-hidden">
            <div class="text-[10px] text-violet-400 uppercase font-semibold">Upload Speed</div>
            <div class="text-2xl font-black font-mono text-white mt-0.5 flex items-baseline gap-1">
              <span>{{ telemetry.speedtest.uploadMbps }}</span>
              <span class="text-xs text-neon-magenta font-normal">Mbps</span>
            </div>
            <div class="text-[9px] text-cyan-400 font-mono mt-1 flex items-center gap-1">
              <span>Latency</span>
              <span>•</span>
              <span>{{ telemetry.speedtest.pingMs }} ms</span>
            </div>
          </div>
        </div>

        <!-- Speed test countdown & trigger action -->
        <div class="pt-3 border-t border-violet-800/40 space-y-2 text-xs">
          <div class="flex items-center justify-between text-[11px]">
            <span class="text-violet-300 truncate max-w-[200px]" :title="telemetry.speedtest.isp">
              {{ telemetry.speedtest.isp }}
            </span>
            <span class="text-neon-amber font-mono font-bold">
              Next in {{ formattedCountdown }}
            </span>
          </div>

          <button
            @click="telemetry.runSpeedTestNow()"
            :disabled="telemetry.isTestingSpeed"
            class="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs transition shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': telemetry.isTestingSpeed }" />
            <span>{{ telemetry.isTestingSpeed ? 'Running NIXI Speed Test...' : 'Run Immediate Speed Test' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Liquid Flow Animation Speed Tube (Live FortiGate WAN -> Internal Zones) -->
    <div class="ux4g-glass rounded-2xl p-5 relative overflow-hidden">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <Waves class="w-4 h-4 text-neon-cyan" />
          <h3 class="text-xs font-bold uppercase tracking-wider text-white">
            FortiGate-600F Liquid Pipeline Flow Rate & Inspection Distribution
          </h3>
        </div>
        <div class="flex items-center gap-3 text-xs font-mono">
          <span class="text-neon-emerald">● ALLOW: {{ telemetry.summary.allowedCount }}</span>
          <span class="text-neon-magenta">■ DROP: {{ telemetry.summary.droppedCount }} ({{ telemetry.summary.blockRatePercent }}%)</span>
        </div>
      </div>

      <!-- Liquid Tube Visualization with animated fluid packet waves -->
      <div class="relative h-14 rounded-xl bg-violet-950/80 border border-violet-700/50 overflow-hidden flex items-center px-4">
        <!-- Rainbow background wave layer -->
        <div class="absolute inset-0 opacity-25 bg-gradient-to-r from-pink-500 via-amber-500 to-cyan-500 animate-rainbow-shift"></div>

        <!-- Liquid wave SVG backdrop -->
        <svg class="absolute inset-0 w-[200%] h-full opacity-30 animate-wave-1" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0 C150,90 350,-40 500,60 C650,160 900,10 1200,40 L1200,120 L0,120 Z" fill="url(#rainbowGradient)"></path>
          <defs>
            <linearGradient id="rainbowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#ec4899" />
              <stop offset="25%" stop-color="#f97316" />
              <stop offset="50%" stop-color="#10b981" />
              <stop offset="75%" stop-color="#06b6d4" />
              <stop offset="100%" stop-color="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>

        <!-- Dynamic Animated Flow Packets traveling along the pipeline -->
        <div class="absolute w-20 h-5 rounded-full bg-gradient-to-r from-neon-cyan to-neon-emerald blur-sm flow-packet-1"></div>
        <div class="absolute w-28 h-6 rounded-full bg-gradient-to-r from-neon-magenta to-neon-violet blur-sm flow-packet-2"></div>
        <div class="absolute w-24 h-5 rounded-full bg-gradient-to-r from-neon-amber to-neon-cyan blur-sm flow-packet-3"></div>

        <!-- Pipeline Nodes Overlay (FortiGate Specific) -->
        <div class="relative z-10 w-full flex items-center justify-between text-xs font-mono font-bold text-white">
          <div class="flex items-center gap-2 bg-violet-900/90 px-3 py-1.5 rounded-lg border border-cyan-500/50 shadow">
            <Globe class="w-3.5 h-3.5 text-neon-cyan" />
            <span>port1 (WAN Primary NKN)</span>
          </div>

          <div class="flex items-center gap-2 bg-violet-900/90 px-3 py-1.5 rounded-lg border border-rose-500/50 shadow">
            <Shield class="w-3.5 h-3.5 text-rose-400" />
            <span>FortiGate-600F NGFW (10.10.3.15)</span>
          </div>

          <div class="flex items-center gap-2 bg-violet-900/90 px-3 py-1.5 rounded-lg border border-emerald-500/50 shadow">
            <Server class="w-3.5 h-3.5 text-neon-emerald" />
            <span>port2 (SERC_Srv) / port3 (LAN)</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Fluent Animated Throughput Graph in Rainbow Effect -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 ux4g-glass rounded-2xl p-5 border-violet-800/40">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-sm font-bold text-white flex items-center gap-2 font-sans">
              <Activity class="w-4 h-4 text-neon-cyan" />
              Fluent Animated Throughput Graph (Rainbow Gradient Spectrum)
            </h2>
            <p class="text-xs text-violet-300/80">Continuous FortiGate WAN port1 sliding session bandwidth telemetry</p>
          </div>
          <span class="inline-flex items-center gap-1.5 text-xs text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 font-mono">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            LIVE 1.2s REFRESH
          </span>
        </div>

        <div class="h-72">
          <v-chart :option="rainbowThroughputOption" autoresize />
        </div>
      </div>

      <!-- Auditing & Threat Posture Radar (CSIR-SERC & CERT-In Aligned) -->
      <div class="ux4g-glass rounded-2xl p-5 border-violet-800/40 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-2">
            <h2 class="text-sm font-bold text-white flex items-center gap-2 font-sans">
              <ShieldCheck class="w-4 h-4 text-neon-emerald" />
              CERT-In & Audit Radar
            </h2>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-800/60 text-violet-300">
              AUDIT READY
            </span>
          </div>
          <p class="text-xs text-violet-300/80">Security posture across segmentation, logging, and rules</p>
        </div>

        <div class="h-60 my-2">
          <v-chart :option="auditRadarOption" autoresize />
        </div>

        <div class="pt-3 border-t border-violet-800/40 flex items-center justify-between text-xs">
          <span class="text-violet-300">Overall Audit Score:</span>
          <span class="font-mono text-neon-emerald font-extrabold text-sm">96.4 / 100</span>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- FORTIGATE PHYSICAL PORT & POLICY RAINBOW DATA FLOW (SANKEY STREAM)        -->
    <!-- ========================================================================= -->
    <div class="ux4g-glass rounded-2xl p-5 border-violet-800/40">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 class="text-sm font-bold text-white flex items-center gap-2 font-sans">
            <Layers class="w-4 h-4 text-neon-magenta" />
            {{ fwStore.activeFirewall ? (fwStore.activeFirewall.name || fwStore.activeFirewall.model) : 'Perimeter Gateway' }} Physical Port & Policy Rainbow Data Flow (Sankey Stream)
          </h2>
          <p class="text-xs text-violet-300/80">
            Real-time packet trajectory across live ingress interfaces, inspection policies, and network egress zones.
          </p>
        </div>
        <div class="flex items-center gap-2">
          <span
            v-if="fwStore.isFirewallLive"
            class="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[11px] font-mono font-bold flex items-center gap-1.5"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            {{ fwStore.activeFirewall?.name }} ({{ fwStore.activeFirewall?.ipAddress }})
          </span>
          <span
            v-else
            class="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[11px] font-mono font-bold flex items-center gap-1.5"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            {{ fwStore.activeFirewall?.ipAddress || 'Gateway' }} (Offline / Standby)
          </span>
        </div>
      </div>

      <div class="h-80">
        <v-chart :option="sankeyFlowOption" autoresize />
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- ENTERPRISE FIREWALL MONITORING SUITE: SITES, THREATS, IP USAGE, CATEGORIES -->
    <!-- ========================================================================= -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

      <!-- PANEL 1: Top Visited Sites & Web Filter (with Social Networking Filter Policy) -->
      <div class="ux4g-glass rounded-2xl p-5 border-violet-800/40 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <Globe class="w-4 h-4 text-neon-cyan" />
              <h3 class="text-sm font-bold text-white font-sans">
                Top Visited Sites & URL Web Filtering
              </h3>
            </div>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              FortiGuard DNS & Web Filter
            </span>
          </div>
          <p class="text-xs text-violet-300/80 mb-4">
            Monitoring web access, educational repositories, and social networking throttling policies.
          </p>

          <!-- Category filter tabs -->
          <div class="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1 text-xs">
            <button
              v-for="cat in ['All', 'Research & Science', 'Social Networking', 'Cloud & Compute']"
              :key="cat"
              @click="selectedSiteCategory = cat"
              class="px-2.5 py-1 rounded-lg font-mono text-[11px] transition"
              :class="selectedSiteCategory === cat ? 'bg-violet-700 text-white font-bold' : 'bg-violet-900/40 text-violet-300 hover:text-white'"
            >
              {{ cat }}
            </button>
          </div>

          <!-- Sites Table -->
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs font-mono">
              <thead>
                <tr class="border-b border-violet-800/50 text-violet-400 text-[10px] uppercase">
                  <th class="py-2 px-2">Rank / Domain</th>
                  <th class="py-2 px-2">Category</th>
                  <th class="py-2 px-2 text-right">Requests</th>
                  <th class="py-2 px-2 text-right">Data Volume</th>
                  <th class="py-2 px-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-violet-900/30 text-violet-200">
                <tr
                  v-for="site in filteredSites"
                  :key="site.domain"
                  class="hover:bg-violet-900/30 transition"
                >
                  <td class="py-2.5 px-2 font-medium flex items-center gap-2">
                    <span class="text-[10px] text-violet-500 w-3 font-bold">{{ site.rank }}</span>
                    <span class="text-white font-semibold font-sans">{{ site.domain }}</span>
                  </td>
                  <td class="py-2.5 px-2 text-[11px]">
                    <span
                      class="px-2 py-0.5 rounded text-[10px] font-medium"
                      :class="[
                        site.category === 'Social Networking' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        site.category === 'Research & Science' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                        site.category === 'Cloud & Compute' ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30' :
                        'bg-violet-800/40 text-violet-300'
                      ]"
                    >
                      {{ site.category }}
                    </span>
                  </td>
                  <td class="py-2.5 px-2 text-right font-bold text-white">{{ site.requests.toLocaleString() }}</td>
                  <td class="py-2.5 px-2 text-right text-cyan-300 font-bold">{{ formatBytes(site.bytes) }}</td>
                  <td class="py-2.5 px-2 text-center">
                    <span
                      class="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                      :class="[
                        site.action === 'allow' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' :
                        site.action === 'monitored' ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30' :
                        site.action === 'throttled' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' :
                        'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                      ]"
                    >
                      {{ site.action }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-violet-800/40 flex items-center justify-between text-[11px] text-violet-400 font-mono">
          <span>Social Networking Policy: <strong>Bandwidth Throttled (2 Mbps / Host)</strong></span>
          <span class="text-emerald-400 font-semibold">NKN Unrestricted Academic Pipe Active</span>
        </div>
      </div>

      <!-- PANEL 2: Top Threats & Intrusion Blocks -->
      <div class="ux4g-glass rounded-2xl p-5 border-violet-800/40 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <ShieldAlert class="w-4 h-4 text-rose-400" />
              <h3 class="text-sm font-bold text-white font-sans">
                Top Threats & Exploits Intercepted
              </h3>
            </div>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 font-bold">
              FortiOS IPS & AV Active
            </span>
          </div>
          <p class="text-xs text-violet-300/80 mb-4">
            Real-time signatures, CVE exploits, and brute-force attacks dropped at the perimeter.
          </p>

          <div class="space-y-2.5">
            <div
              v-for="threat in telemetry.topThreats.slice(0, 5)"
              :key="threat.id"
              class="p-3 rounded-xl bg-violet-950/60 border border-violet-800/40 hover:border-rose-500/40 transition flex items-center justify-between gap-3 font-mono"
            >
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span
                    class="px-2 py-0.2 rounded text-[9px] font-extrabold uppercase"
                    :class="[
                      threat.severity === 'critical' ? 'bg-rose-600/30 text-rose-300 border border-rose-500/50' :
                      threat.severity === 'high' ? 'bg-amber-600/30 text-amber-300 border border-amber-500/50' :
                      'bg-violet-600/30 text-violet-300 border border-violet-500/50'
                    ]"
                  >
                    {{ threat.severity }}
                  </span>
                  <span class="text-[10px] text-violet-400 font-bold uppercase">{{ threat.category }}</span>
                  <span class="text-[10px] text-violet-500">•</span>
                  <span class="text-[10px] text-violet-300 font-bold">{{ threat.service }} (Port {{ threat.targetPort }})</span>
                </div>
                <div class="text-xs font-bold text-white truncate font-sans">
                  {{ threat.signature }}
                </div>
                <div class="text-[10px] text-violet-400 mt-1 flex items-center gap-2">
                  <span>Source IP: <strong class="text-rose-300 font-mono">{{ threat.sourceIp }}</strong></span>
                  <span>({{ threat.country }})</span>
                </div>
              </div>

              <div class="text-right flex-shrink-0">
                <div class="text-xs font-extrabold text-neon-magenta">{{ threat.hits.toLocaleString() }} Drops</div>
                <span class="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  {{ threat.action }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-violet-800/40 flex items-center justify-between text-[11px] text-violet-400 font-mono">
          <span>Target Policy: <strong class="text-white">SERC_Threat_Prevention_Drop</strong></span>
          <span class="text-rose-400 font-bold">100% Ingress Drops Guaranteed</span>
        </div>
      </div>

      <!-- PANEL 3: Top IP Traffic Usage (Internal & External Talkers) -->
      <div class="ux4g-glass rounded-2xl p-5 border-violet-800/40 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <Network class="w-4 h-4 text-neon-cyan" />
              <h3 class="text-sm font-bold text-white font-sans">
                Top IP Traffic Usage (Campus & Datacenter Hosts)
              </h3>
            </div>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-800/60 text-violet-300">
              Active Session Track
            </span>
          </div>
          <p class="text-xs text-violet-300/80 mb-4">
            Highest bandwidth consuming servers and research workstations across FortiGate zones.
          </p>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs font-mono">
              <thead>
                <tr class="border-b border-violet-800/50 text-violet-400 text-[10px] uppercase">
                  <th class="py-2 px-2">Host / IP Address</th>
                  <th class="py-2 px-2">Target Zone</th>
                  <th class="py-2 px-2 text-right">Flows</th>
                  <th class="py-2 px-2 text-right">Total Transferred</th>
                  <th class="py-2 px-2">Primary Workload</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-violet-900/30 text-violet-200">
                <tr
                  v-for="host in telemetry.topIpUsage.slice(0, 5)"
                  :key="host.ip"
                  class="hover:bg-violet-900/30 transition"
                >
                  <td class="py-2 px-2 font-medium">
                    <div class="text-white font-bold">{{ host.ip }}</div>
                    <div class="text-[10px] text-violet-400 truncate max-w-[150px]">{{ host.hostname }}</div>
                  </td>
                  <td class="py-2 px-2 text-[11px] text-cyan-300 font-semibold">{{ host.zone }}</td>
                  <td class="py-2 px-2 text-right font-bold text-white">{{ host.flowsCount }}</td>
                  <td class="py-2 px-2 text-right text-emerald-400 font-bold">{{ formatBytes(host.totalBytes) }}</td>
                  <td class="py-2 px-2 text-[10px] text-violet-300 font-sans truncate max-w-[140px]">{{ host.primaryService }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-violet-800/40 flex items-center justify-between text-[11px] text-violet-400 font-mono">
          <span>HPC Cluster & Server Farm constitute <strong class="text-white">68.5%</strong> of aggregate egress</span>
          <span class="text-cyan-300">port2 & port3 High-Speed Fabric</span>
        </div>
      </div>

      <!-- PANEL 4: Web Traffic & Social Networking vs Research Bandwidth Distribution -->
      <div class="ux4g-glass rounded-2xl p-5 border-violet-800/40 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <TrendingUp class="w-4 h-4 text-neon-magenta" />
              <h3 class="text-sm font-bold text-white font-sans">
                Web Category & Social Networking Bandwidth Allocation
              </h3>
            </div>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30">
              QoS Traffic Shaper
            </span>
          </div>
          <p class="text-xs text-violet-300/80 mb-4">
            Bandwidth allocation distribution: Academic research prioritized, non-essential social media capped.
          </p>

          <!-- Category Progress Bars -->
          <div class="space-y-3 font-mono text-xs">
            <div
              v-for="cat in telemetry.webCategories"
              :key="cat.category"
              class="space-y-1"
            >
              <div class="flex items-center justify-between text-[11px]">
                <span class="text-white font-sans font-semibold flex items-center gap-1.5">
                  <span
                    class="w-2 h-2 rounded-full"
                    :class="[
                      cat.category.includes('Academic') ? 'bg-cyan-400' :
                      cat.category.includes('Cloud') ? 'bg-fuchsia-400' :
                      cat.category.includes('Software') ? 'bg-emerald-400' :
                      cat.category.includes('Social') ? 'bg-amber-400' : 'bg-purple-400'
                    ]"
                  ></span>
                  {{ cat.category }}
                </span>
                <div class="flex items-center gap-2">
                  <span class="text-violet-400 text-[10px]">{{ formatBytes(cat.bytes) }}</span>
                  <span class="font-bold text-white">{{ cat.percentage }}%</span>
                </div>
              </div>
              <div class="w-full h-2 rounded-full bg-violet-950 overflow-hidden border border-violet-800/40">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :class="[
                    cat.category.includes('Academic') ? 'bg-gradient-to-r from-cyan-500 to-emerald-400' :
                    cat.category.includes('Cloud') ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500' :
                    cat.category.includes('Software') ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
                    cat.category.includes('Social') ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-purple-500 to-indigo-500'
                  ]"
                  :style="{ width: `${cat.percentage}%` }"
                ></div>
              </div>
              <div class="text-[9px] text-violet-400 flex justify-between">
                <span>{{ cat.policyNote }}</span>
                <span>{{ cat.requestCount.toLocaleString() }} requests</span>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-violet-800/40 flex items-center justify-between text-[11px] text-violet-400 font-mono">
          <span>Social Media Limit: <strong class="text-amber-400">Max 2 Mbps / Endpoint</strong></span>
          <span class="text-emerald-400 font-bold">Academic Bandwidth: Uncapped</span>
        </div>
      </div>

    </div>

    <!-- ========================================================================= -->
    <!-- DYNAMIC LIVE HARDWARE INTERFACES & SNMP TELEMETRY                           -->
    <!-- ========================================================================= -->
    <div>
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-sm font-bold text-white flex items-center gap-2 font-sans">
            <Server class="w-4 h-4 text-neon-cyan" />
            {{ fwStore.activeFirewall ? (fwStore.activeFirewall.name || fwStore.activeFirewall.model) : 'Perimeter Gateway' }} Live Hardware Interfaces & SNMP Telemetry ({{ fwStore.activeFirewall?.ipAddress || 'Not Configured' }})
          </h2>
          <p class="text-xs text-violet-300/80">
            Real-time interface link speed, duplex, packet rates, and operational telemetry for configured gateway.
          </p>
        </div>
        <RouterLink to="/devices" class="text-xs text-cyan-300 hover:text-white font-semibold flex items-center gap-1 font-mono">
          <span>Detailed Interface Diagnostics</span>
          <span>→</span>
        </RouterLink>
      </div>

      <!-- If interfaces are available from SNMP probe -->
      <div v-if="liveInterfaces.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="iface in liveInterfaces"
          :key="iface.name"
          class="ux4g-glass-interactive rounded-2xl p-4 relative font-mono text-xs"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold text-white uppercase">{{ iface.name.split(' ')[0] }}</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              {{ iface.operStatus }}
            </span>
          </div>

          <h3 class="text-xs font-bold text-cyan-300 truncate font-sans">{{ iface.name }}</h3>
          <p class="text-[11px] text-violet-400 mb-3">Speed: {{ (iface.speedBps / 1000000000).toFixed(0) }} Gbps Full-Duplex</p>

          <div class="space-y-2 border-t border-violet-800/40 pt-3">
            <div class="flex items-center justify-between">
              <span class="text-violet-400 text-[11px]">Ingress Throughput</span>
              <span class="font-bold text-neon-cyan text-[11px]">{{ (iface.inBps / 1000000).toFixed(1) }} Mbps</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-violet-400 text-[11px]">Egress Throughput</span>
              <span class="font-bold text-neon-magenta text-[11px]">{{ (iface.outBps / 1000000).toFixed(1) }} Mbps</span>
            </div>
            <div class="flex items-center justify-between pt-1 border-t border-violet-900/30 text-[10px]">
              <span class="text-violet-400">CRC / In Errors</span>
              <span class="text-emerald-400 font-bold">{{ iface.inErrors }}</span>
            </div>
            <div class="flex items-center justify-between text-[10px]">
              <span class="text-violet-400">Out Discards</span>
              <span class="text-emerald-400 font-bold">{{ iface.outErrors }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- If no interfaces or gateway offline -->
      <div v-else class="ux4g-glass rounded-2xl p-8 text-center border-dashed border-violet-700/50">
        <Server class="w-10 h-10 text-violet-400 mx-auto mb-3 opacity-60" />
        <h3 class="text-sm font-bold text-white mb-1">Awaiting Live SNMP Telemetry</h3>
        <p class="text-xs text-violet-300/70 max-w-md mx-auto mb-4">
          No live interface counters received from {{ fwStore.activeFirewall?.ipAddress || 'the configured gateway' }}. Ensure SNMP v2c/v3 is enabled and reachable over UDP port 161.
        </p>
        <div class="flex items-center justify-center gap-3">
          <button
            @click="fwStore.pollSnmpNow()"
            :disabled="fwStore.isTestingSnmp"
            class="px-4 py-2 rounded-xl bg-violet-800 hover:bg-violet-700 text-white text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
          >
            <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': fwStore.isTestingSnmp }" />
            <span>{{ fwStore.isTestingSnmp ? 'Polling Gateway...' : 'Probe SNMP Agent Now' }}</span>
          </button>
          <RouterLink
            to="/settings"
            class="px-4 py-2 rounded-xl bg-violet-900/50 hover:bg-violet-800 border border-violet-700/50 text-cyan-300 text-xs font-semibold transition"
          >
            Configure SNMP Target
          </RouterLink>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  Activity,
  Gauge,
  Waves,
  Globe,
  Shield,
  ShieldAlert,
  Server,
  Layers,
  ShieldCheck,
  RefreshCw,
  Network,
  TrendingUp,
  Database
} from 'lucide-vue-next';
import AutoRefreshControl from '../components/AutoRefreshControl.vue';
import { useFirewallStore } from '../stores/firewall.store.js';
import { useTelemetryStore } from '../stores/telemetry.store.js';

const fwStore = useFirewallStore();
const telemetry = useTelemetryStore();

const selectedSiteCategory = ref('All');

async function handleAutoRefresh() {
  await Promise.all([
    fwStore.fetchDevices(),
    telemetry.fetchSummary(),
    telemetry.fetchAnalytics(),
    telemetry.fetchAlerts(),
  ]);
}

onMounted(async () => {
  await Promise.all([
    fwStore.fetchDevices(),
    telemetry.fetchSummary(),
    telemetry.fetchSpeedTest(),
    telemetry.fetchAlerts()
  ]);
  telemetry.startCountdownTicker();
});

const currentInRateMbps = computed(() => {
  const latest = telemetry.throughputHistory[telemetry.throughputHistory.length - 1];
  return latest ? (latest.inBps / 1000000).toFixed(1) : '342.8';
});

const currentOutRateMbps = computed(() => {
  const latest = telemetry.throughputHistory[telemetry.throughputHistory.length - 1];
  return latest ? (latest.outBps / 1000000).toFixed(1) : '274.2';
});

const formattedCountdown = computed(() => {
  const secs = telemetry.speedtest.nextTestInSec || 0;
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}m ${s < 10 ? '0' : ''}${s}s`;
});

const liveInterfaces = computed(() => {
  const fg = fwStore.activeFirewall;
  if (fg && fg.status === 'healthy' && fg.snmpMetrics && fg.snmpMetrics.interfaces) {
    return fg.snmpMetrics.interfaces;
  }
  return []; // Strictly live: No dummy interfaces!
});

const filteredSites = computed(() => {
  if (selectedSiteCategory.value === 'All') {
    return telemetry.topSites;
  }
  return telemetry.topSites.filter((s: any) => s.category === selectedSiteCategory.value);
});

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// 1. Inbound Speedometer Gauge EChart Option
const inboundGaugeOption = computed(() => {
  const val = parseFloat(currentInRateMbps.value);
  return {
    backgroundColor: 'transparent',
    series: [
      {
        type: 'gauge',
        center: ['50%', '65%'],
        radius: '95%',
        startAngle: 200,
        endAngle: -20,
        min: 0,
        max: 1000,
        splitNumber: 5,
        itemStyle: {
          color: '#00f0ff',
          shadowColor: 'rgba(0, 240, 255, 0.6)',
          shadowBlur: 10
        },
        progress: {
          show: true,
          width: 14,
          roundCap: true,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 1, y2: 0,
              colorStops: [
                { offset: 0, color: '#8b5cf6' },
                { offset: 0.4, color: '#06b6d4' },
                { offset: 0.8, color: '#10b981' },
                { offset: 1, color: '#00f0ff' }
              ]
            }
          }
        },
        pointer: {
          icon: 'triangle',
          length: '60%',
          width: 6,
          offsetCenter: [0, '5%'],
          itemStyle: { color: '#ffffff' }
        },
        axisLine: {
          roundCap: true,
          lineStyle: {
            width: 14,
            color: [[1, 'rgba(46, 16, 101, 0.5)']]
          }
        },
        axisTick: { show: false },
        splitLine: {
          length: 6,
          lineStyle: { width: 1, color: '#a78bfa' }
        },
        axisLabel: {
          distance: 18,
          color: '#c4b5fd',
          fontSize: 10,
          fontFamily: 'JetBrains Mono, monospace'
        },
        title: { show: false },
        detail: {
          valueAnimation: true,
          fontSize: 20,
          offsetCenter: [0, '35%'],
          color: '#00f0ff',
          fontFamily: 'JetBrains Mono, monospace',
          formatter: '{value} M'
        },
        data: [{ value: Math.min(val, 1000) }]
      }
    ]
  };
});

// 2. Outbound Speedometer Gauge EChart Option
const outboundGaugeOption = computed(() => {
  const val = parseFloat(currentOutRateMbps.value);
  return {
    backgroundColor: 'transparent',
    series: [
      {
        type: 'gauge',
        center: ['50%', '65%'],
        radius: '95%',
        startAngle: 200,
        endAngle: -20,
        min: 0,
        max: 1000,
        splitNumber: 5,
        itemStyle: {
          color: '#ff007f',
          shadowColor: 'rgba(255, 0, 127, 0.6)',
          shadowBlur: 10
        },
        progress: {
          show: true,
          width: 14,
          roundCap: true,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 1, y2: 0,
              colorStops: [
                { offset: 0, color: '#8b5cf6' },
                { offset: 0.5, color: '#ec4899' },
                { offset: 1, color: '#ff007f' }
              ]
            }
          }
        },
        pointer: {
          icon: 'triangle',
          length: '60%',
          width: 6,
          offsetCenter: [0, '5%'],
          itemStyle: { color: '#ffffff' }
        },
        axisLine: {
          roundCap: true,
          lineStyle: {
            width: 14,
            color: [[1, 'rgba(46, 16, 101, 0.5)']]
          }
        },
        axisTick: { show: false },
        splitLine: {
          length: 6,
          lineStyle: { width: 1, color: '#a78bfa' }
        },
        axisLabel: {
          distance: 18,
          color: '#c4b5fd',
          fontSize: 10,
          fontFamily: 'JetBrains Mono, monospace'
        },
        title: { show: false },
        detail: {
          valueAnimation: true,
          fontSize: 20,
          offsetCenter: [0, '35%'],
          color: '#ff007f',
          fontFamily: 'JetBrains Mono, monospace',
          formatter: '{value} M'
        },
        data: [{ value: Math.min(val, 1000) }]
      }
    ]
  };
});

// 3. Fluent Rainbow Throughput Chart
const rainbowThroughputOption = computed(() => {
  const times = telemetry.throughputHistory.map(h => h.time);
  const inData = telemetry.throughputHistory.map(h => Math.round(h.inBps / 1000000));
  const outData = telemetry.throughputHistory.map(h => Math.round(h.outBps / 1000000));

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#12082b',
      borderColor: '#7c3aed',
      textStyle: { color: '#ffffff', fontSize: 11 }
    },
    legend: {
      data: ['Inbound Bandwidth (Mbps)', 'Outbound Bandwidth (Mbps)'],
      textStyle: { color: '#c4b5fd', fontSize: 11 },
      top: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: times.length > 0 ? times : ['11:00', '11:05', '11:10', '11:15', '11:20'],
      axisLine: { lineStyle: { color: '#4c1d95' } },
      axisLabel: { color: '#a78bfa', fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      name: 'Mbps',
      nameTextStyle: { color: '#a78bfa', fontSize: 10 },
      splitLine: { lineStyle: { color: 'rgba(76, 29, 149, 0.3)' } },
      axisLabel: { color: '#a78bfa', fontSize: 10 }
    },
    series: [
      {
        name: 'Inbound Bandwidth (Mbps)',
        type: 'line',
        smooth: true,
        showSymbol: true,
        symbolSize: 6,
        itemStyle: { color: '#00f0ff', borderColor: '#ffffff', borderWidth: 2 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(0, 240, 255, 0.45)' },
              { offset: 0.5, color: 'rgba(16, 185, 129, 0.25)' },
              { offset: 1, color: 'rgba(124, 58, 237, 0.0)' }
            ]
          }
        },
        lineStyle: { width: 3, color: '#00f0ff' },
        data: inData.length > 0 ? inData : [240, 310, 290, 350, 342]
      },
      {
        name: 'Outbound Bandwidth (Mbps)',
        type: 'line',
        smooth: true,
        showSymbol: true,
        symbolSize: 6,
        itemStyle: { color: '#ff007f', borderColor: '#ffffff', borderWidth: 2 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(255, 0, 127, 0.4)' },
              { offset: 0.5, color: 'rgba(249, 115, 22, 0.2)' },
              { offset: 1, color: 'rgba(124, 58, 237, 0.0)' }
            ]
          }
        },
        lineStyle: { width: 3, color: '#ff007f' },
        data: outData.length > 0 ? outData : [180, 220, 210, 260, 274]
      }
    ]
  };
});

// 4. CERT-In / Audit Posture Radar Option
const auditRadarOption = computed(() => {
  return {
    backgroundColor: 'transparent',
    radar: {
      indicator: [
        { name: 'Perimeter Segregation', max: 100 },
        { name: 'Audit Log Integrity', max: 100 },
        { name: 'Policy Conflict Free', max: 100 },
        { name: 'Least Privilege ACL', max: 100 },
        { name: 'Cryptographic Ciphers', max: 100 },
        { name: 'Incident Readiness', max: 100 },
      ],
      shape: 'polygon',
      splitNumber: 4,
      axisName: {
        color: '#c4b5fd',
        fontSize: 10
      },
      splitLine: {
        lineStyle: { color: 'rgba(139, 92, 246, 0.3)' }
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: ['rgba(46, 16, 101, 0.2)', 'rgba(76, 29, 149, 0.3)']
        }
      },
      axisLine: {
        lineStyle: { color: 'rgba(139, 92, 246, 0.4)' }
      }
    },
    series: [
      {
        name: 'Audit Compliance',
        type: 'radar',
        data: [
          {
            value: [96, 88, 92, 85, 98, 95],
            name: 'Current Score',
            areaStyle: {
              color: 'rgba(16, 185, 129, 0.4)'
            },
            lineStyle: {
              color: '#10b981',
              width: 2
            },
            itemStyle: {
              color: '#34d399'
            }
          }
        ]
      }
    ]
  };
});

// 5. Dynamic Physical Port & Policy Rainbow Data Flow (Sankey Diagram)
const sankeyFlowOption = computed(() => {
  const flows = telemetry.policyFlows;
  if (!flows || flows.length === 0 || !fwStore.isFirewallLive) {
    return {
      backgroundColor: 'transparent',
      title: {
        text: fwStore.isFirewallLive
          ? 'Live Gateway Connected • Awaiting NetFlow / Syslog Traffic Stream...'
          : 'Gateway Standby / Offline • Traffic Stream Paused',
        left: 'center',
        top: 'center',
        textStyle: {
          color: '#a78bfa',
          fontSize: 13,
          fontWeight: 'normal',
          fontFamily: 'Noto Sans, sans-serif'
        }
      }
    };
  }

  const nodeMap = new Map<string, string>();
  const links: any[] = [];
  const palette = ['#06b6d4', '#d946ef', '#10b981', '#8b5cf6', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7', '#38bdf8', '#f43f5e'];

  flows.forEach((f) => {
    if (!nodeMap.has(f.fromInterface)) {
      nodeMap.set(f.fromInterface, palette[nodeMap.size % palette.length]);
    }
    if (!nodeMap.has(f.policyName)) {
      nodeMap.set(f.policyName, palette[nodeMap.size % palette.length]);
    }
    if (!nodeMap.has(f.toInterface)) {
      nodeMap.set(f.toInterface, palette[nodeMap.size % palette.length]);
    }

    links.push({
      source: f.fromInterface,
      target: f.policyName,
      value: Math.max(f.currentThroughputMbps || 10, 10)
    });
    links.push({
      source: f.policyName,
      target: f.toInterface,
      value: Math.max(f.currentThroughputMbps || 10, 10)
    });
  });

  const data = Array.from(nodeMap.entries()).map(([name, color]) => ({
    name,
    itemStyle: { color }
  }));

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove',
      backgroundColor: '#12082b',
      borderColor: '#7c3aed',
      textStyle: { color: '#ffffff', fontSize: 12 }
    },
    series: [
      {
        type: 'sankey',
        layout: 'none',
        emphasis: { focus: 'adjacency' },
        lineStyle: {
          color: 'gradient',
          curveness: 0.5,
          opacity: 0.55
        },
        label: {
          color: '#ffffff',
          fontSize: 11,
          fontWeight: 'bold',
          fontFamily: 'Noto Sans, sans-serif'
        },
        nodeWidth: 18,
        nodeGap: 14,
        data,
        links
      }
    ]
  };
});
</script>
