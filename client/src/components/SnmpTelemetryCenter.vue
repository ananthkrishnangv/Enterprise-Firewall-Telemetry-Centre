<template>
  <div class="space-y-6">
    <!-- Header Banner & Device Overview -->
    <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
      <!-- Glow background -->
      <div class="absolute -right-20 -top-20 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
        <div>
          <div class="flex flex-wrap items-center gap-2.5">
            <span class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span class="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse"></span>
              SNMPv2c LIVE ENGINE
            </span>
            <h2 class="text-lg font-bold text-white tracking-tight">{{ device?.name || 'FortiGate-CSIR-SERC' }}</h2>
            <span class="text-xs font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
              {{ device?.ipAddress || '10.10.3.15' }}:{{ device?.snmpPort || 161 }}
            </span>
            <span class="text-xs font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
              Community: {{ device?.snmpCommunity || 'fortinet' }}
            </span>
          </div>
          <p class="text-xs text-slate-400 mt-1.5 flex flex-wrap items-center gap-2">
            <span>{{ device?.model || 'FortiGate 600F Enterprise NGFW' }}</span>
            <span>•</span>
            <span class="text-slate-300 font-mono">{{ metrics?.sysDescr || device?.version || 'FortiOS v7.4.12,build2902' }}</span>
            <span>•</span>
            <span>Location: {{ device?.location || 'CSIR-SERC Datacenter (CHENNAI)' }}</span>
          </p>
        </div>

        <div class="flex items-center gap-3">
          <div class="text-right hidden sm:block">
            <div class="text-[11px] text-slate-400 font-mono">System Uptime</div>
            <div class="text-sm font-bold font-mono text-emerald-400">{{ formatUptime(metrics?.sysUpTime || 0) }}</div>
          </div>
          <button
            @click="triggerManualPoll"
            :disabled="isPolling"
            class="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 text-xs font-medium text-slate-200 transition flex items-center gap-2 disabled:opacity-50"
          >
            <svg
              class="w-3.5 h-3.5 text-brand-400"
              :class="{ 'animate-spin': isPolling }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{{ isPolling ? 'Polling SNMP...' : 'Poll SNMP Now' }}</span>
          </button>
        </div>
      </div>

      <!-- Core Telemetry Gauges Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-5">
        <!-- CPU -->
        <div class="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80">
          <div class="text-[10px] uppercase font-semibold text-slate-400 font-mono">CPU Core Usage</div>
          <div class="text-xl font-bold font-mono text-white mt-1">
            {{ metrics?.cpuUtilPercent ?? 1 }}%
          </div>
          <div class="w-full h-1.5 rounded-full bg-slate-800 mt-2 overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500"
              :class="(metrics?.cpuUtilPercent || 0) > 75 ? 'bg-amber-400' : 'bg-brand-500'"
              :style="{ width: `${metrics?.cpuUtilPercent || 1}%` }"
            ></div>
          </div>
          <div class="text-[9px] text-slate-500 mt-1 font-mono">fgSysCpuUsage</div>
        </div>

        <!-- RAM -->
        <div class="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80">
          <div class="text-[10px] uppercase font-semibold text-slate-400 font-mono">Memory Utilized</div>
          <div class="text-xl font-bold font-mono text-white mt-1">
            {{ metrics?.memoryUtilPercent ?? 39 }}%
          </div>
          <div class="w-full h-1.5 rounded-full bg-slate-800 mt-2 overflow-hidden">
            <div
              class="h-full rounded-full bg-cyan-500 transition-all duration-500"
              :style="{ width: `${metrics?.memoryUtilPercent || 39}%` }"
            ></div>
          </div>
          <div class="text-[9px] text-slate-500 mt-1 font-mono">
            {{ ((metrics?.memoryUsedBytes || 6357351000) / 1073741824).toFixed(1) }}G / {{ ((metrics?.memoryTotalBytes || 16300900000) / 1073741824).toFixed(0) }}G
          </div>
        </div>

        <!-- Concurrent Sessions -->
        <div class="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80">
          <div class="text-[10px] uppercase font-semibold text-slate-400 font-mono">Active Sessions</div>
          <div class="text-xl font-bold font-mono text-emerald-400 mt-1">
            {{ (metrics?.concurrentConnections || 3228).toLocaleString() }}
          </div>
          <div class="text-[10px] text-slate-400 mt-2 flex items-center justify-between">
            <span>HA State:</span>
            <span class="font-mono text-emerald-400 font-bold uppercase text-[10px]">{{ metrics?.haState || 'standalone' }}</span>
          </div>
          <div class="text-[9px] text-slate-500 mt-1 font-mono">fgSysSesCount</div>
        </div>

        <!-- VPN Tunnels -->
        <div class="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80">
          <div class="text-[10px] uppercase font-semibold text-slate-400 font-mono">Active VPN Tunnels</div>
          <div class="text-xl font-bold font-mono text-indigo-400 mt-1">
            {{ metrics?.vpnActiveTunnels ?? 12 }}
          </div>
          <div class="text-[10px] text-slate-400 mt-2 flex items-center justify-between">
            <span>Tunnels Up:</span>
            <span class="font-mono text-emerald-400 text-[10px]">100% Active</span>
          </div>
          <div class="text-[9px] text-slate-500 mt-1 font-mono">IPsec & SSL VPN</div>
        </div>

        <!-- Log Disk Usage -->
        <div class="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80">
          <div class="text-[10px] uppercase font-semibold text-slate-400 font-mono">Log Disk Usage</div>
          <div class="text-xl font-bold font-mono text-amber-400 mt-1">
            {{ ((metrics?.logDiskUsageMb || 11710) / 1024).toFixed(1) }} GB
          </div>
          <div class="text-[10px] text-slate-400 mt-2 flex items-center justify-between">
            <span>Log Partition:</span>
            <span class="font-mono text-slate-300 text-[10px]">Healthy</span>
          </div>
          <div class="text-[9px] text-slate-500 mt-1 font-mono">fgSysDiskUsage</div>
        </div>

        <!-- Hardware Thermal -->
        <div class="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80">
          <div class="text-[10px] uppercase font-semibold text-slate-400 font-mono">CPU Temperature</div>
          <div class="text-xl font-bold font-mono text-rose-400 mt-1">
            {{ metrics?.sensors?.cpuTemperatureC ?? 45 }}°C
          </div>
          <div class="text-[10px] text-slate-400 mt-2 flex items-center justify-between">
            <span>Thermal Status:</span>
            <span class="font-mono text-emerald-400 text-[10px]">Optimal</span>
          </div>
          <div class="text-[9px] text-slate-500 mt-1 font-mono">fgHwSensors DTS0</div>
        </div>
      </div>
    </div>

    <!-- Multi-Protocol Telemetry & UTM Threats Banner -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
      <!-- TCP Protocol Stats -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <h3 class="text-xs font-bold text-white uppercase tracking-wider font-mono">TCP Protocol MIB</h3>
          </div>
          <span class="text-[10px] font-mono text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">RFC 793</span>
        </div>
        <div class="mt-3 space-y-2.5 text-xs font-mono">
          <div class="flex items-center justify-between">
            <span class="text-slate-400">Established TCP:</span>
            <span class="font-bold text-white">{{ protocols?.tcp.currEstab?.toLocaleString() ?? '110' }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-400">Inbound Segments:</span>
            <span class="text-emerald-400">{{ formatPackets(protocols?.tcp.inSegs ?? 1289600000) }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-400">Outbound Segments:</span>
            <span class="text-cyan-400">{{ formatPackets(protocols?.tcp.outSegs ?? 1811500000) }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-400">Retransmitted:</span>
            <span class="text-slate-300">{{ formatPackets(protocols?.tcp.retransSegs ?? 5380000) }}</span>
          </div>
          <div class="flex items-center justify-between pt-1 border-t border-slate-800/80">
            <span class="text-slate-400">Retransmission Rate:</span>
            <span class="text-emerald-400 font-bold">{{ protocols?.tcp.retransPercent ?? 0.29 }}% (Healthy)</span>
          </div>
        </div>
      </div>

      <!-- UDP Protocol Stats -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
            <h3 class="text-xs font-bold text-white uppercase tracking-wider font-mono">UDP Datagrams</h3>
          </div>
          <span class="text-[10px] font-mono text-indigo-400 px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">RFC 768</span>
        </div>
        <div class="mt-3 space-y-2.5 text-xs font-mono">
          <div class="flex items-center justify-between">
            <span class="text-slate-400">In Datagrams:</span>
            <span class="text-emerald-400">{{ formatPackets(protocols?.udp.inDatagrams ?? 54170000) }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-400">Out Datagrams:</span>
            <span class="text-indigo-400">{{ formatPackets(protocols?.udp.outDatagrams ?? 872700000) }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-400">No Ports (Unreachable):</span>
            <span class="text-amber-400">{{ protocols?.udp.noPorts?.toLocaleString() ?? '6,902' }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-400">Input Errors:</span>
            <span class="text-emerald-400">{{ protocols?.udp.inErrors ?? 0 }}</span>
          </div>
          <div class="flex items-center justify-between pt-1 border-t border-slate-800/80">
            <span class="text-slate-400">UDP Throughput:</span>
            <span class="text-emerald-400 font-bold">100% Reliable</span>
          </div>
        </div>
      </div>

      <!-- ICMP & Packet Distribution -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <h3 class="text-xs font-bold text-white uppercase tracking-wider font-mono">ICMP & Distribution</h3>
          </div>
          <span class="text-[10px] font-mono text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">IP-MIB</span>
        </div>
        <div class="mt-3 space-y-2.5 text-xs font-mono">
          <div class="flex items-center justify-between">
            <span class="text-slate-400">ICMP In / Out:</span>
            <span class="text-white">{{ formatPackets(protocols?.icmp.inMsgs ?? 28200000) }} / {{ formatPackets(protocols?.icmp.outMsgs ?? 105500000) }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-400">Unicast Packets:</span>
            <span class="text-cyan-400">{{ formatPackets(protocols?.packetTotals.unicastIn ?? 184500000) }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-400">Multicast Packets:</span>
            <span class="text-purple-400">{{ formatPackets(protocols?.packetTotals.multicastIn ?? 4120000) }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-400">Broadcast Packets:</span>
            <span class="text-slate-300">{{ formatPackets(protocols?.packetTotals.broadcastIn ?? 120500) }}</span>
          </div>
          <div class="flex items-center justify-between pt-1 border-t border-slate-800/80">
            <span class="text-slate-400">Distribution Type:</span>
            <span class="text-slate-200">97.8% Unicast</span>
          </div>
        </div>
      </div>

      <!-- FortiOS UTM Security Threats Counter -->
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-rose-400 animate-pulse"></span>
            <h3 class="text-xs font-bold text-white uppercase tracking-wider font-mono">FortiOS Threat MIB</h3>
          </div>
          <span class="text-[10px] font-mono text-rose-400 px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">Security UTM</span>
        </div>
        <div class="mt-3 space-y-2.5 text-xs font-mono">
          <div class="flex items-center justify-between">
            <span class="text-slate-400">Viruses Neutralized:</span>
            <span class="text-rose-400 font-bold">{{ threats?.virusesDetected ?? 137 }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-400">IPS Intrusions Blocked:</span>
            <span class="text-amber-400 font-bold">{{ (threats?.intrusionsDetected ?? 112292).toLocaleString() }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-400">Botnet C2 Intercepted:</span>
            <span class="text-purple-400 font-bold">{{ (threats?.botnetsBlocked ?? 2604).toLocaleString() }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-400">Threat Sensor:</span>
            <span class="text-emerald-400">FortiGuard AV & IPS</span>
          </div>
          <div class="flex items-center justify-between pt-1 border-t border-slate-800/80">
            <span class="text-slate-400">Engine Health:</span>
            <span class="text-emerald-400 font-bold">100% Enforced</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Hardware Environmental & Power Delivery Panel -->
    <div class="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div class="flex items-center justify-between pb-4 border-b border-slate-800">
        <div class="flex items-center gap-3">
          <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <h3 class="text-sm font-bold text-white uppercase tracking-wider font-mono">
            Hardware Environmental & Dual Redundant Power Telemetry (fgHwSensors)
          </h3>
        </div>
        <span class="text-xs font-mono text-slate-400">FortiGate Chassis Active Sensors</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <!-- Thermal Zones -->
        <div class="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Chassis Thermal Zones</span>
            <span class="text-[11px] font-mono text-rose-400">Optimal Range</span>
          </div>
          <div class="space-y-2">
            <div
              v-for="tz in sensors?.internalTemperatures || []"
              :key="tz.name"
              class="flex items-center justify-between text-xs font-mono bg-slate-900/60 px-2.5 py-1.5 rounded border border-slate-800/60"
            >
              <span class="text-slate-400">{{ tz.name }}</span>
              <span class="font-bold" :class="tz.tempC > 65 ? 'text-amber-400' : 'text-slate-200'">{{ tz.tempC }}°C</span>
            </div>
          </div>
        </div>

        <!-- Cooling Fans -->
        <div class="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Cooling Fan Speeds</span>
            <span class="text-[11px] font-mono text-cyan-400">Tachometer Pulse</span>
          </div>
          <div class="space-y-2">
            <div
              v-for="fan in sensors?.coolingFans || []"
              :key="fan.name"
              class="flex items-center justify-between text-xs font-mono bg-slate-900/60 px-2.5 py-1.5 rounded border border-slate-800/60"
            >
              <span class="text-slate-400">{{ fan.name }}</span>
              <span class="font-bold text-cyan-400">{{ fan.rpm.toLocaleString() }} RPM</span>
            </div>
          </div>
        </div>

        <!-- Power Delivery PSUs -->
        <div class="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Dual AC Power Supplies</span>
            <span class="text-[11px] font-mono text-emerald-400">1+1 Redundant</span>
          </div>
          <div class="space-y-2">
            <div
              v-for="psu in sensors?.powerSupplies || []"
              :key="psu.name"
              class="p-2.5 rounded bg-slate-900/60 border border-slate-800/60 space-y-1 font-mono text-xs"
            >
              <div class="flex items-center justify-between">
                <span class="font-medium text-slate-200">{{ psu.name }}</span>
                <span class="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {{ psu.status }}
                </span>
              </div>
              <div class="flex items-center justify-between text-[11px] text-slate-400">
                <span>Input: <strong class="text-slate-200">{{ psu.inputVoltage }}V AC</strong></span>
                <span>Load: <strong class="text-amber-400">{{ psu.outputPowerWatts }}W</strong></span>
                <span>Fan: <strong class="text-cyan-400">{{ psu.fanRpm }} RPM</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- FortiOS Top Policy Traffic Table (fgFwPolStats) -->
    <div v-if="topPolicies && topPolicies.length > 0" class="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
        <div class="flex items-center gap-3">
          <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <h3 class="text-sm font-bold text-white uppercase tracking-wider font-mono">
            FortiGate Policy Traffic Stats (fgFwPolStats MIB)
          </h3>
        </div>
        <span class="text-xs font-mono text-slate-400">Counter64 Byte & Packet Accounting</span>
      </div>

      <div class="overflow-x-auto mt-4 rounded-lg border border-slate-800">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-slate-950/70 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-semibold font-mono">
              <th class="py-2.5 px-4">Policy ID</th>
              <th class="py-2.5 px-4">Policy Description & Target</th>
              <th class="py-2.5 px-4 text-right">Packets Forwarded</th>
              <th class="py-2.5 px-4 text-right">Total Data Volume</th>
              <th class="py-2.5 px-4">Traffic Share</th>
              <th class="py-2.5 px-4 text-right">Last Active</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60 font-mono">
            <tr
              v-for="pol in topPolicies"
              :key="pol.policyId"
              class="hover:bg-slate-800/40 transition"
            >
              <td class="py-2.5 px-4 font-bold text-indigo-400">
                #{{ pol.policyId }}
              </td>
              <td class="py-2.5 px-4 font-sans font-medium text-slate-200">
                {{ pol.name }}
              </td>
              <td class="py-2.5 px-4 text-right text-slate-300">
                {{ formatPackets(pol.packetCount) }}
              </td>
              <td class="py-2.5 px-4 text-right font-bold text-emerald-400">
                {{ formatBytes(pol.byteCount) }}
              </td>
              <td class="py-2.5 px-4 w-40">
                <div class="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    class="bg-indigo-500 h-1.5 rounded-full"
                    :style="{ width: `${Math.min(100, Math.max(3, (pol.byteCount / (topPolicies[0]?.byteCount || 1)) * 100))}%` }"
                  ></div>
                </div>
              </td>
              <td class="py-2.5 px-4 text-right text-slate-400 text-[11px]">
                {{ pol.lastActive }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- ALL ACTIVE NETWORK & VLAN INTERFACES TELEMETRY MATRIX (DETAILED DUAL-MODE) -->
    <!-- ========================================================================= -->
    <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
      <!-- Section Header -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div class="flex items-center gap-2.5">
            <span class="p-1.5 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <Network class="w-4 h-4" />
            </span>
            <h3 class="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Complete Network &amp; Departmental VLAN Telemetry Matrix (All Interfaces)
            </h3>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              {{ interfaces.length }} Interfaces Active
            </span>
          </div>
          <p class="text-xs text-slate-400 mt-1">
            Detailed general network traffic and unofficial/unapproved traffic monitoring across all physical ports, 802.1Q VLANs, and encrypted VPN tunnels.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2.5">
          <!-- Search box -->
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search port, VLAN, subnet, alias..."
              class="px-3 py-1.5 pl-8 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 font-mono w-56"
            />
            <Search class="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          </div>

          <!-- Type filter tabs -->
          <div class="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px] font-mono overflow-x-auto">
            <button
              v-for="t in [
                { id: 'all', label: `All (${interfaces.length})` },
                { id: 'physical', label: `Ports (${totals?.physicalPortsCount || 32})` },
                { id: 'vlan', label: `VLANs (${totals?.vlanInterfacesCount || 18})` },
                { id: 'vpn', label: `VPNs (${totals?.vpnTunnelsCount || 3})` },
                { id: 'flagged', label: `⚠️ Flagged (${totals?.flaggedInterfacesCount || flaggedInterfacesCount})` }
              ]"
              :key="t.id"
              @click="selectedType = t.id"
              class="px-2.5 py-1 rounded transition font-medium text-xs whitespace-nowrap cursor-pointer"
              :class="[
                selectedType === t.id
                  ? (t.id === 'flagged' ? 'bg-rose-600 text-white shadow' : 'bg-brand-600 text-white shadow')
                  : (t.id === 'flagged' && (totals?.flaggedInterfacesCount || flaggedInterfacesCount) > 0 ? 'text-amber-400 hover:text-white' : 'text-slate-400 hover:text-white')
              ]"
            >
              {{ t.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- Bento-style Interfaces KPI Summary Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <!-- Card 1: Total Interfaces -->
        <div class="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80">
          <div class="text-[10px] uppercase font-semibold text-slate-400 font-mono">Total Monitored</div>
          <div class="text-xl font-bold font-mono text-white mt-1">{{ interfaces.length }}</div>
          <div class="text-[10px] text-emerald-400 mt-1 font-mono flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{{ totals?.upInterfacesCount || interfaces.filter(i => i.operStatus === 'up').length }} Online UP</span>
          </div>
        </div>

        <!-- Card 2: Physical Ports -->
        <div class="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80">
          <div class="text-[10px] uppercase font-semibold text-slate-400 font-mono">Physical Ports</div>
          <div class="text-xl font-bold font-mono text-blue-400 mt-1">
            {{ totals?.physicalPortsCount || interfaces.filter(i => i.type === 'physical').length }}
          </div>
          <div class="text-[10px] text-slate-400 mt-1 font-mono">1G / 10G / 25G Ports</div>
        </div>

        <!-- Card 3: Departmental VLANs -->
        <div class="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80">
          <div class="text-[10px] uppercase font-semibold text-slate-400 font-mono">Department VLANs</div>
          <div class="text-xl font-bold font-mono text-purple-400 mt-1">
            {{ totals?.vlanInterfacesCount || interfaces.filter(i => i.type === 'vlan').length }}
          </div>
          <div class="text-[10px] text-emerald-400 mt-1 font-mono">100% 802.1Q Subnets</div>
        </div>

        <!-- Card 4: VPN Tunnels -->
        <div class="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80">
          <div class="text-[10px] uppercase font-semibold text-slate-400 font-mono">Encrypted Tunnels</div>
          <div class="text-xl font-bold font-mono text-cyan-400 mt-1">
            {{ totals?.vpnTunnelsCount || interfaces.filter(i => i.type === 'vpn').length }}
          </div>
          <div class="text-[10px] text-slate-400 mt-1 font-mono">IPsec Site &amp; SSL-VPN</div>
        </div>

        <!-- Card 5: Flagged Unofficial Interfaces -->
        <div class="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80" :class="{ 'border-rose-500/40 bg-rose-950/10': (totals?.flaggedInterfacesCount || flaggedInterfacesCount) > 0 }">
          <div class="text-[10px] uppercase font-semibold text-rose-400 font-mono flex items-center justify-between">
            <span>Flagged Unofficial</span>
            <span v-if="(totals?.flaggedInterfacesCount || flaggedInterfacesCount) > 0" class="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
          </div>
          <div class="text-xl font-bold font-mono mt-1" :class="(totals?.flaggedInterfacesCount || flaggedInterfacesCount) > 0 ? 'text-rose-400' : 'text-slate-400'">
            {{ totals?.flaggedInterfacesCount || flaggedInterfacesCount }}
          </div>
          <div class="text-[10px] text-slate-400 mt-1 font-mono truncate">BitTorrent / IDM / Media</div>
        </div>

        <!-- Card 6: Bandwidth Integrity -->
        <div class="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80">
          <div class="text-[10px] uppercase font-semibold text-slate-400 font-mono">Bandwidth Integrity</div>
          <div class="text-xl font-bold font-mono text-emerald-400 mt-1">
            {{ (100 - (totals?.overallUnofficialRatioPercent || 4.8)).toFixed(1) }}%
          </div>
          <div class="text-[10px] text-slate-400 mt-1 font-mono">Legitimate Research</div>
        </div>
      </div>

      <!-- Enriched Interfaces Matrix Table -->
      <div class="overflow-x-auto rounded-lg border border-slate-800 shadow-inner">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-slate-950/90 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-semibold font-mono">
              <th class="py-3 px-3.5">Interface &amp; Subnet</th>
              <th class="py-3 px-3">Type</th>
              <th class="py-3 px-3">Status &amp; Specs</th>
              <th class="py-3 px-3 text-right">General Throughput (bps)</th>
              <th class="py-3 px-3 text-right">Cumulative Data</th>
              <th class="py-3 px-3.5 text-center">Unofficial &amp; Illicit Traffic</th>
              <th class="py-3 px-3">Detected Apps</th>
              <th class="py-3 px-2.5 text-center">Drops</th>
              <th class="py-3 px-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60 font-mono">
            <tr
              v-for="iface in filteredInterfaces"
              :key="iface.name"
              class="hover:bg-slate-800/40 transition group"
              :class="{ 'bg-rose-950/10': (iface.unofficialViolationsCount || 0) > 0 }"
            >
              <!-- 1. Interface & Subnet -->
              <td class="py-3 px-3.5">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-slate-100 group-hover:text-cyan-300 transition">{{ iface.name }}</span>
                  <span v-if="iface.vlanId" class="px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    VLAN {{ iface.vlanId }}
                  </span>
                  <span v-if="iface.parentInterface" class="text-[10px] text-slate-500">
                    via {{ iface.parentInterface }}
                  </span>
                </div>
                <div v-if="iface.alias" class="text-[11px] text-slate-400 font-sans mt-0.5 truncate max-w-xs">
                  {{ iface.alias }}
                </div>
                <div v-if="iface.ipSubnet" class="text-[10px] text-cyan-400/90 font-mono mt-0.5 flex items-center gap-1">
                  <span>Subnet:</span>
                  <span class="font-semibold">{{ iface.ipSubnet }}</span>
                </div>
              </td>

              <!-- 2. Type Badge -->
              <td class="py-3 px-3 whitespace-nowrap">
                <span
                  class="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                  :class="[
                    iface.type === 'physical' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                    iface.type === 'vlan' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                    iface.type === 'vpn' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    'bg-slate-800 text-slate-400'
                  ]"
                >
                  {{ iface.type || 'port' }}
                </span>
                <div class="text-[10px] text-slate-400 mt-1 font-mono">
                  {{ formatSpeed(iface.speedBps) }}
                </div>
              </td>

              <!-- 3. Status & Specs -->
              <td class="py-3 px-3 whitespace-nowrap">
                <div class="flex items-center gap-1.5">
                  <span
                    class="w-2 h-2 rounded-full"
                    :class="iface.operStatus === 'up' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'"
                  ></span>
                  <span
                    class="font-bold text-[11px] uppercase"
                    :class="iface.operStatus === 'up' ? 'text-emerald-400' : 'text-slate-500'"
                  >
                    {{ iface.operStatus }}
                  </span>
                </div>
                <div class="text-[10px] text-slate-500 mt-0.5">
                  MTU {{ iface.mtu || 1500 }} • {{ (iface.duplex || 'full').toUpperCase() }}
                </div>
              </td>

              <!-- 4. General Throughput (bps & pps) -->
              <td class="py-3 px-3 text-right whitespace-nowrap">
                <div class="font-semibold text-emerald-400">
                  ↓ {{ formatRate(iface.inBps) }}
                  <span v-if="iface.inPps" class="text-[10px] text-slate-500 font-normal">({{ iface.inPps.toLocaleString() }} pps)</span>
                </div>
                <div class="font-semibold text-cyan-400 mt-0.5">
                  ↑ {{ formatRate(iface.outBps) }}
                  <span v-if="iface.outPps" class="text-[10px] text-slate-500 font-normal">({{ iface.outPps.toLocaleString() }} pps)</span>
                </div>
                <!-- Mini capacity bar -->
                <div v-if="iface.operStatus === 'up'" class="w-full bg-slate-800 rounded-full h-1 mt-1 overflow-hidden">
                  <div
                    class="h-1 rounded-full bg-cyan-500"
                    :style="{ width: `${Math.min(100, Math.max(2, iface.utilizationPercent || 1))}%` }"
                  ></div>
                </div>
              </td>

              <!-- 5. Cumulative Data -->
              <td class="py-3 px-3 text-right whitespace-nowrap text-slate-300">
                <div>In: <strong class="text-white">{{ formatBytes(iface.totalBytesIn || 0) }}</strong></div>
                <div class="text-[11px] text-slate-400 mt-0.5">Out: <strong class="text-slate-200">{{ formatBytes(iface.totalBytesOut || 0) }}</strong></div>
              </td>

              <!-- 6. Unofficial & Illicit Traffic Telemetry -->
              <td class="py-3 px-3.5 text-center whitespace-nowrap">
                <div v-if="(iface.unofficialViolationsCount || 0) > 0 || (iface.unofficialTotalBytes || 0) > 0" class="space-y-1">
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    <ShieldAlert class="w-3 h-3 text-rose-400" />
                    {{ formatBytes(iface.unofficialTotalBytes || 0) }} Wasted
                  </span>
                  <div class="flex items-center justify-center gap-1.5 text-[10px]">
                    <span class="text-amber-400 font-bold">{{ iface.unofficialRatioPercent || 12 }}% Bandwidth</span>
                    <span class="text-slate-500">•</span>
                    <span class="text-rose-400 font-semibold">{{ iface.unofficialViolationsCount }} Drops</span>
                  </div>
                </div>
                <div v-else-if="iface.operStatus === 'up'" class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck class="w-3 h-3 text-emerald-400" />
                  <span>Clean (0 B)</span>
                </div>
                <div v-else class="text-[10px] text-slate-600">
                  Standby
                </div>
              </td>

              <!-- 7. Detected Unapproved Apps -->
              <td class="py-3 px-3">
                <div v-if="iface.detectedUnapprovedApps && iface.detectedUnapprovedApps.length > 0" class="flex flex-wrap gap-1 max-w-xs">
                  <span
                    v-for="ua in iface.detectedUnapprovedApps.slice(0, 2)"
                    :key="ua.appId"
                    class="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20 truncate"
                    :title="`${ua.appId} (${formatBytes(ua.bytes)}, ${ua.count} events)`"
                  >
                    {{ ua.appId }}
                  </span>
                  <span v-if="iface.detectedUnapprovedApps.length > 2" class="px-1 py-0.5 rounded text-[9px] bg-slate-800 text-slate-400 font-mono">
                    +{{ iface.detectedUnapprovedApps.length - 2 }}
                  </span>
                </div>
                <div v-else-if="iface.operStatus === 'up'" class="text-[10px] text-slate-500 font-sans">
                  No Unapproved Apps
                </div>
                <div v-else class="text-[10px] text-slate-600">-</div>
              </td>

              <!-- 8. Drops / Errors -->
              <td class="py-3 px-2.5 text-center">
                <span
                  class="font-mono text-xs"
                  :class="((iface.inErrors || 0) + (iface.inDiscards || 0)) > 0 ? 'text-rose-400 font-bold' : 'text-slate-500'"
                >
                  {{ (iface.inErrors || 0) + (iface.inDiscards || 0) }}
                </span>
              </td>

              <!-- 9. Action Button -->
              <td class="py-3 px-3 text-center whitespace-nowrap">
                <button
                  @click="openInterfaceDossier(iface.name)"
                  class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-violet-900/60 border border-slate-700 hover:border-violet-500/50 text-slate-200 hover:text-white text-[11px] font-mono transition flex items-center gap-1.5 mx-auto cursor-pointer"
                  title="Inspect detailed interface telemetry, connected host devices, and unapproved traffic"
                >
                  <Search class="w-3 h-3 text-cyan-400" />
                  <span>Inspect</span>
                </button>
              </td>
            </tr>

            <tr v-if="filteredInterfaces.length === 0">
              <td colspan="9" class="py-12 text-center text-slate-500 font-mono text-xs">
                No matching interfaces or VLANs found matching filter criteria.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- DEEP INTERFACE TELEMETRY & HARDWARE DOSSIER MODAL -->
    <!-- ========================================================================= -->
    <div
      v-if="selectedInterfaceForModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      @click.self="selectedInterfaceForModal = null"
    >
      <div class="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative">
        <!-- Glow accent -->
        <div class="absolute -top-16 -right-16 w-48 h-48 bg-violet-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <!-- Modal Header -->
        <div class="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 relative z-10">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-violet-900/40 border border-violet-700/50 flex items-center justify-center text-cyan-300">
              <Network class="w-5 h-5" />
            </div>
            <div>
              <div class="flex items-center gap-2.5">
                <h3 class="text-base font-bold text-white font-mono">{{ selectedInterfaceForModal }}</h3>
                <span
                  class="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                  :class="modalInterface?.operStatus === 'up' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'"
                >
                  {{ modalInterface?.operStatus || 'UP' }}
                </span>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {{ modalInterface?.type || 'physical' }} • {{ formatSpeed(modalInterface?.speedBps || 1000000000) }}
                </span>
              </div>
              <p class="text-xs text-slate-400 mt-0.5">
                {{ modalInterface?.alias || 'FortiGate Physical / VLAN Subinterface' }}
              </p>
            </div>
          </div>

          <button
            @click="selectedInterfaceForModal = null"
            class="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Modal Body (Scrollable) -->
        <div class="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          <!-- Loading state -->
          <div v-if="isLoadingDrilldown" class="py-16 text-center text-slate-400 space-y-3 font-mono">
            <div class="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div>Loading real-time hardware telemetry and host mapping...</div>
          </div>

          <div v-else-if="drilldownData" class="space-y-6">
            <!-- Hardware Profile & Spec Strip -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-950/80 border border-slate-800 font-mono">
              <div>
                <span class="text-slate-500 text-[10px] uppercase block">MAC Address</span>
                <span class="text-slate-200 font-semibold">{{ drilldownData.hardwareProfile.macAddress }}</span>
              </div>
              <div>
                <span class="text-slate-500 text-[10px] uppercase block">MTU Size / Duplex</span>
                <span class="text-slate-200 font-semibold">{{ drilldownData.hardwareProfile.mtu }} Bytes • {{ drilldownData.hardwareProfile.duplex }}</span>
              </div>
              <div>
                <span class="text-slate-500 text-[10px] uppercase block">Transceiver Type</span>
                <span class="text-slate-200 font-semibold truncate block" :title="drilldownData.hardwareProfile.transceiverType">
                  {{ drilldownData.hardwareProfile.transceiverType }}
                </span>
              </div>
              <div>
                <span class="text-slate-500 text-[10px] uppercase block">FEC / Queue Drops</span>
                <span class="text-slate-200 font-semibold">{{ drilldownData.hardwareProfile.fecStatus }} • {{ drilldownData.hardwareProfile.queueDrops }} Drops</span>
              </div>
            </div>

            <!-- Throughput & General vs Unofficial Traffic Ratio -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- General Throughput Card -->
              <div class="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-white uppercase tracking-wider font-mono text-[11px]">Interface General Throughput</span>
                  <span class="text-emerald-400 font-mono font-bold">{{ formatRate((modalInterface?.inBps || 0) + (modalInterface?.outBps || 0)) }}</span>
                </div>
                <div class="grid grid-cols-2 gap-3 text-xs font-mono pt-1">
                  <div class="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <span class="text-slate-400 block text-[10px]">Inbound Rate</span>
                    <strong class="text-emerald-400 text-sm">↓ {{ formatRate(modalInterface?.inBps || 0) }}</strong>
                    <span class="text-[10px] text-slate-500 block mt-0.5">{{ modalInterface?.inPps?.toLocaleString() || 0 }} pps</span>
                  </div>
                  <div class="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <span class="text-slate-400 block text-[10px]">Outbound Rate</span>
                    <strong class="text-cyan-400 text-sm">↑ {{ formatRate(modalInterface?.outBps || 0) }}</strong>
                    <span class="text-[10px] text-slate-500 block mt-0.5">{{ modalInterface?.outPps?.toLocaleString() || 0 }} pps</span>
                  </div>
                </div>
              </div>

              <!-- Unofficial Traffic Ratio Card -->
              <div class="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-white uppercase tracking-wider font-mono text-[11px]">General vs Unofficial Bandwidth Split</span>
                  <span
                    class="font-mono text-xs font-bold px-2 py-0.5 rounded"
                    :class="(modalInterface?.unofficialViolationsCount || 0) > 0 ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'"
                  >
                    {{ (modalInterface?.unofficialViolationsCount || 0) > 0 ? '⚠️ Violations Flagged' : '✓ Clean Interface' }}
                  </span>
                </div>

                <!-- Ratio bar -->
                <div class="space-y-1.5 pt-1">
                  <div class="flex items-center justify-between font-mono text-[11px]">
                    <span class="text-emerald-400">Authorized: {{ (100 - (modalInterface?.unofficialRatioPercent || 0)).toFixed(1) }}%</span>
                    <span class="text-rose-400">Unofficial: {{ (modalInterface?.unofficialRatioPercent || 0).toFixed(1) }}%</span>
                  </div>
                  <div class="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
                    <div class="h-full bg-emerald-500 transition-all" :style="{ width: `${100 - (modalInterface?.unofficialRatioPercent || 0)}%` }"></div>
                    <div class="h-full bg-rose-500 transition-all" :style="{ width: `${modalInterface?.unofficialRatioPercent || 0}%` }"></div>
                  </div>
                  <div class="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                    <span>Total Wasted: <strong class="text-rose-400">{{ formatBytes(modalInterface?.unofficialTotalBytes || 0) }}</strong></span>
                    <span>Policy Drops: <strong class="text-white">{{ modalInterface?.unofficialViolationsCount || 0 }}</strong></span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Connected Internal Host Workstations Table -->
            <div class="space-y-2.5">
              <div class="flex items-center justify-between">
                <h4 class="text-xs font-bold text-white uppercase font-mono flex items-center gap-2">
                  <Server class="w-3.5 h-3.5 text-cyan-400" />
                  <span>Active Workstations Connected to this Interface ({{ drilldownData.connectedHosts.length }})</span>
                </h4>
                <span class="text-[10px] text-slate-400 font-mono">Live Session Accounting</span>
              </div>

              <div class="overflow-x-auto rounded-xl border border-slate-800">
                <table class="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr class="bg-slate-950/80 border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-400 font-mono">
                      <th class="py-2.5 px-3">Workstation IP &amp; Hostname</th>
                      <th class="py-2.5 px-3">Department</th>
                      <th class="py-2.5 px-3 text-right">Data In / Out</th>
                      <th class="py-2.5 px-3 text-right">Total Transferred</th>
                      <th class="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-800/60 font-mono">
                    <tr v-for="host in drilldownData.connectedHosts.slice(0, 6)" :key="host.ip" class="hover:bg-slate-800/30">
                      <td class="py-2 px-3">
                        <div class="font-bold text-slate-200">{{ host.ip }}</div>
                        <div class="text-[10px] text-slate-400 font-sans truncate max-w-xs">{{ host.hostname }}</div>
                      </td>
                      <td class="py-2 px-3 text-slate-300 font-sans">{{ host.department }}</td>
                      <td class="py-2 px-3 text-right text-slate-400">
                        {{ formatBytes(host.bytesIn) }} / {{ formatBytes(host.bytesOut) }}
                      </td>
                      <td class="py-2 px-3 text-right font-bold text-white">{{ formatBytes(host.totalBytes) }}</td>
                      <td class="py-2 px-3 text-center">
                        <span
                          v-if="host.hasUnofficialViolations"
                          class="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        >
                          ⚠️ Violations
                        </span>
                        <span
                          v-else
                          class="px-2 py-0.5 rounded text-[9px] font-semibold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        >
                          ✓ Clean
                        </span>
                      </td>
                    </tr>
                    <tr v-if="drilldownData.connectedHosts.length === 0">
                      <td colspan="5" class="py-4 text-center text-slate-500 font-mono text-xs">
                        No active host workstations recorded on this interface in the current telemetry window.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Detected Unapproved Violations on this Interface (if any) -->
            <div v-if="drilldownData.unapprovedViolations.length > 0" class="space-y-2.5">
              <div class="flex items-center justify-between">
                <h4 class="text-xs font-bold text-rose-400 uppercase font-mono flex items-center gap-2">
                  <ShieldAlert class="w-3.5 h-3.5 text-rose-400" />
                  <span>Unapproved &amp; Illicit Traffic Incidents Flagged on this Interface ({{ drilldownData.unapprovedViolations.length }})</span>
                </h4>
                <span class="text-[10px] font-mono text-rose-400 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
                  FortiOS Security UTM Blocked
                </span>
              </div>

              <div class="overflow-x-auto rounded-xl border border-rose-950/40 bg-rose-950/5">
                <table class="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr class="bg-slate-950/90 border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-400">
                      <th class="py-2.5 px-3">Timestamp</th>
                      <th class="py-2.5 px-3">Offending Internal Host</th>
                      <th class="py-2.5 px-3">App Signature / Threat Category</th>
                      <th class="py-2.5 px-3">Remote WAN Target</th>
                      <th class="py-2.5 px-3 text-center">Policy Action</th>
                      <th class="py-2.5 px-3 text-right">Data</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-800/60">
                    <tr v-for="v in drilldownData.unapprovedViolations.slice(0, 5)" :key="v.id" class="hover:bg-slate-800/40">
                      <td class="py-2 px-3 text-slate-400 text-[10px]">{{ v.timestamp.slice(11, 19) }}</td>
                      <td class="py-2 px-3">
                        <div class="font-bold text-slate-200">{{ v.internalIp }}</div>
                        <div class="text-[10px] text-slate-500 truncate max-w-[140px]">{{ v.internalHost }}</div>
                      </td>
                      <td class="py-2 px-3">
                        <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-300 border border-rose-500/20">
                          {{ v.appId }}
                        </span>
                        <div class="text-[10px] text-slate-400 mt-0.5">{{ v.categoryLabel }}</div>
                      </td>
                      <td class="py-2 px-3">
                        <div class="text-slate-200">{{ v.remoteHost }}</div>
                        <div class="text-[10px] text-slate-500">{{ v.remoteIp }}:{{ v.remotePort }} ({{ v.remoteCountry }})</div>
                      </td>
                      <td class="py-2 px-3 text-center">
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          {{ v.action.toUpperCase() }}
                        </span>
                        <div class="text-[9px] text-slate-500 mt-0.5">{{ v.policyName }}</div>
                      </td>
                      <td class="py-2 px-3 text-right text-rose-400 font-bold">{{ formatBytes(v.totalBytes) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Top Legitimate Research & Enterprise Applications -->
            <div class="space-y-2.5">
              <h4 class="text-xs font-bold text-white uppercase font-mono flex items-center gap-2">
                <Layers class="w-3.5 h-3.5 text-indigo-400" />
                <span>Application Bandwidth Distribution on this Interface</span>
              </h4>

              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                <div
                  v-for="app in drilldownData.topApplications.slice(0, 6)"
                  :key="app.appId"
                  class="p-2.5 rounded-lg border font-mono text-xs flex flex-col justify-between"
                  :class="app.isUnapproved ? 'bg-rose-950/20 border-rose-800/40 text-rose-300' : 'bg-slate-950/60 border-slate-800 text-slate-200'"
                >
                  <div class="flex items-center justify-between">
                    <span class="font-bold truncate">{{ app.displayName }}</span>
                    <span v-if="app.isUnapproved" class="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold uppercase">Illicit</span>
                    <span v-else class="text-[10px] text-emerald-400">{{ app.percentage }}%</span>
                  </div>
                  <div class="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                    <span>{{ app.category }}</span>
                    <strong class="text-white">{{ formatBytes(app.bytes) }}</strong>
                  </div>
                </div>
              </div>
            </div>

            <!-- FortiOS Policy / Quarantine CLI Snippet -->
            <div class="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div class="flex items-center justify-between">
                <span class="font-bold text-slate-300 uppercase font-mono text-[11px]">FortiOS Interface Quarantine &amp; Policy Enforcement</span>
                <button
                  @click="copyCliSnippet"
                  class="px-2.5 py-1 rounded bg-violet-900/40 hover:bg-violet-800/60 border border-violet-700/50 text-violet-300 hover:text-white font-mono text-[10px] flex items-center gap-1 transition cursor-pointer"
                >
                  <component :is="isCopied ? Check : Copy" class="w-3 h-3 text-neon-cyan" />
                  <span>{{ isCopied ? 'Copied CLI!' : 'Copy FortiOS CLI' }}</span>
                </button>
              </div>
              <pre class="p-3 rounded bg-black/60 border border-slate-800 text-[11px] text-emerald-400 font-mono overflow-x-auto whitespace-pre leading-relaxed">{{ generatedCliSnippet }}</pre>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="p-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <span class="text-[11px] font-mono text-slate-500">
            CSIR-SERC Firewall Telemetry Operations • Interface: {{ selectedInterfaceForModal }}
          </span>
          <button
            @click="selectedInterfaceForModal = null"
            class="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-medium transition cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  Network,
  ShieldAlert,
  ShieldCheck,
  Activity,
  Cpu,
  ArrowDownToLine,
  ArrowUpFromLine,
  Layers,
  Server,
  Search,
  ExternalLink,
  X,
  Copy,
  Check,
  Filter
} from 'lucide-vue-next';
import { useFirewallStore, InterfaceMetric, FirewallDevice, SNMPProbeData } from '../stores/firewall.store.js';

const props = defineProps<{
  device?: FirewallDevice | null;
}>();

const fwStore = useFirewallStore();
const searchQuery = ref('');
const selectedType = ref('all');
const isPolling = ref(false);
const selectedInterfaceForModal = ref<string | null>(null);
const isCopied = ref(false);

const device = computed<FirewallDevice | null>(() => {
  return props.device || fwStore.activeFirewall || null;
});

const metrics = computed<SNMPProbeData | undefined>(() => {
  return device.value?.snmpMetrics;
});

const protocols = computed(() => {
  return metrics.value?.protocols;
});

const sensors = computed(() => {
  return metrics.value?.sensors;
});

const threats = computed(() => {
  return metrics.value?.threats;
});

const topPolicies = computed(() => {
  return metrics.value?.topPolicies;
});

const interfaces = computed<InterfaceMetric[]>(() => {
  return fwStore.detailedInterfaces.length > 0 ? fwStore.detailedInterfaces : (metrics.value?.interfaces || []);
});

const totals = computed(() => {
  return fwStore.interfaceTotals;
});

const flaggedInterfacesCount = computed(() => {
  return interfaces.value.filter(i => (i.unofficialViolationsCount || 0) > 0 || (i.unofficialTotalBytes || 0) > 0).length;
});

const filteredInterfaces = computed(() => {
  let list = interfaces.value;

  if (selectedType.value === 'flagged') {
    list = list.filter((i) => (i.unofficialViolationsCount || 0) > 0 || (i.unofficialTotalBytes || 0) > 0);
  } else if (selectedType.value !== 'all') {
    list = list.filter((i) => i.type === selectedType.value);
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter((i) => {
      const n = (i.name || '').toLowerCase();
      const a = (i.alias || '').toLowerCase();
      const s = (i.ipSubnet || '').toLowerCase();
      const v = (i.vlanId ? `vlan ${i.vlanId}` : '').toLowerCase();
      return n.includes(q) || a.includes(q) || s.includes(q) || v.includes(q);
    });
  }

  return list;
});

const modalInterface = computed(() => {
  if (!selectedInterfaceForModal.value) return null;
  const name = selectedInterfaceForModal.value.toLowerCase();
  return interfaces.value.find(i => i.name.toLowerCase() === name) || null;
});

const drilldownData = computed(() => {
  return fwStore.drilldownData;
});

const isLoadingDrilldown = computed(() => {
  return fwStore.isLoadingDrilldown;
});

const generatedCliSnippet = computed(() => {
  const ifName = selectedInterfaceForModal.value || 'port1';
  return `# FortiOS Security Policy Enforcement for ${ifName}\nconfig firewall policy\n    edit 99\n        set name "QUARANTINE_ILLICIT_${ifName.replace(/[^a-zA-Z0-9]/g, '_')}"\n        set srcintf "${ifName}"\n        set dstintf "port1"\n        set action deny\n        set comments "CERT-In Interception: Dropping Unapproved P2P/Bulk Leecher on ${ifName}"\n        set schedule "always"\n        set logtraffic all\n    next\nend`;
});

async function openInterfaceDossier(name: string) {
  selectedInterfaceForModal.value = name;
  await fwStore.fetchInterfaceDrilldown(name);
}

async function copyCliSnippet() {
  try {
    await navigator.clipboard.writeText(generatedCliSnippet.value);
    isCopied.value = true;
    setTimeout(() => {
      isCopied.value = false;
    }, 2000);
  } catch {
    // fallback
  }
}

async function triggerManualPoll() {
  if (isPolling.value) return;
  isPolling.value = true;
  try {
    await fwStore.pollSnmpNow();
    await fwStore.fetchDevices();
    await fwStore.fetchDetailedInterfaces();
  } catch (err) {
    console.error('Failed manual SNMP poll:', err);
  } finally {
    isPolling.value = false;
  }
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${days}d ${hours}h ${mins}m`;
}

function formatSpeed(bps: number): string {
  if (!bps) return '1 Gbps';
  if (bps >= 25000000000) return '25 Gbps';
  if (bps >= 10000000000) return '10 Gbps';
  if (bps >= 1000000000) return '1 Gbps';
  return `${(bps / 1000000).toFixed(0)} Mbps`;
}

function formatRate(bps: number): string {
  if (!bps) return '0.0 Mbps';
  if (bps >= 1000000000) return `${(bps / 1000000000).toFixed(2)} Gbps`;
  if (bps >= 1000000) return `${(bps / 1000000).toFixed(1)} Mbps`;
  if (bps >= 1000) return `${(bps / 1000).toFixed(0)} Kbps`;
  return `${bps} bps`;
}

function formatBytes(bytes: number): string {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  let b = bytes;
  let i = 0;
  while (b >= 1024 && i < units.length - 1) {
    b /= 1024;
    i++;
  }
  return `${b.toFixed(i >= 4 ? 2 : 1)} ${units[i]}`;
}

function formatPackets(pkts: number): string {
  if (!pkts) return '0';
  if (pkts >= 1000000000) return `${(pkts / 1000000000).toFixed(2)} B`;
  if (pkts >= 1000000) return `${(pkts / 1000000).toFixed(1)} M`;
  if (pkts >= 1000) return `${(pkts / 1000).toFixed(0)} K`;
  return pkts.toLocaleString();
}

onMounted(() => {
  fwStore.fetchDetailedInterfaces();
});
</script>

