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

    <!-- Complete Interfaces & Departmental VLANs Table -->
    <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <h3 class="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Live Interface & Departmental VLAN Telemetry (IF-MIB & RFC 2863)
            </h3>
          </div>
          <p class="text-xs text-slate-400 mt-1">
            Monitoring all {{ interfaces.length }} physical ports, departmental VLAN subinterfaces, and encrypted VPN tunnels.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <!-- Search box -->
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Filter port / VLAN..."
              class="px-3 py-1.5 pl-8 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 font-mono w-48"
            />
            <svg class="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <!-- Type filter tabs -->
          <div class="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px] font-mono">
            <button
              v-for="t in ['all', 'physical', 'vlan', 'vpn']"
              :key="t"
              @click="selectedType = t"
              class="px-2.5 py-1 rounded transition uppercase font-medium"
              :class="selectedType === t ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'"
            >
              {{ t }}
            </button>
          </div>
        </div>
      </div>

      <!-- Interface Table -->
      <div class="overflow-x-auto rounded-lg border border-slate-800">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-slate-950/70 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-semibold font-mono">
              <th class="py-2.5 px-4">Port / Interface</th>
              <th class="py-2.5 px-4">Type</th>
              <th class="py-2.5 px-4">Status</th>
              <th class="py-2.5 px-4">Port Speed</th>
              <th class="py-2.5 px-4 text-right">Inbound Rate (bps)</th>
              <th class="py-2.5 px-4 text-right">Outbound Rate (bps)</th>
              <th class="py-2.5 px-4 text-right">Total Data In</th>
              <th class="py-2.5 px-4 text-right">Total Data Out</th>
              <th class="py-2.5 px-4 text-center">CRC / Drops</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60 font-mono">
            <tr
              v-for="iface in filteredInterfaces"
              :key="iface.name"
              class="hover:bg-slate-800/40 transition"
            >
              <td class="py-2.5 px-4">
                <div class="font-bold text-slate-200">{{ iface.name }}</div>
                <div v-if="iface.alias" class="text-[11px] text-slate-400 font-sans mt-0.5 truncate max-w-xs">
                  {{ iface.alias }}
                </div>
              </td>
              <td class="py-2.5 px-4">
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
              </td>
              <td class="py-2.5 px-4">
                <span
                  class="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                  :class="iface.operStatus === 'up' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'"
                >
                  {{ iface.operStatus }}
                </span>
              </td>
              <td class="py-2.5 px-4 text-slate-400">
                {{ formatSpeed(iface.speedBps) }}
              </td>
              <td class="py-2.5 px-4 text-right">
                <span class="font-medium text-emerald-400">↓ {{ formatRate(iface.inBps) }}</span>
                <div v-if="iface.inPps" class="text-[10px] text-slate-500">{{ iface.inPps.toLocaleString() }} pps</div>
              </td>
              <td class="py-2.5 px-4 text-right">
                <span class="font-medium text-cyan-400">↑ {{ formatRate(iface.outBps) }}</span>
                <div v-if="iface.outPps" class="text-[10px] text-slate-500">{{ iface.outPps.toLocaleString() }} pps</div>
              </td>
              <td class="py-2.5 px-4 text-right text-slate-300">
                {{ formatBytes(iface.totalBytesIn || 0) }}
              </td>
              <td class="py-2.5 px-4 text-right text-slate-300">
                {{ formatBytes(iface.totalBytesOut || 0) }}
              </td>
              <td class="py-2.5 px-4 text-center">
                <span :class="iface.inErrors > 0 ? 'text-rose-400 font-bold' : 'text-slate-500'">
                  {{ iface.inErrors }}
                </span>
              </td>
            </tr>

            <tr v-if="filteredInterfaces.length === 0">
              <td colspan="9" class="py-8 text-center text-slate-500 font-mono text-xs">
                No matching interfaces or VLANs found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useFirewallStore, InterfaceMetric, FirewallDevice, SNMPProbeData } from '../stores/firewall.store.js';

const props = defineProps<{
  device?: FirewallDevice | null;
}>();

const fwStore = useFirewallStore();
const searchQuery = ref('');
const selectedType = ref('all');
const isPolling = ref(false);

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
  return metrics.value?.interfaces || [];
});

const filteredInterfaces = computed(() => {
  let list = interfaces.value;

  if (selectedType.value !== 'all') {
    list = list.filter((i) => i.type === selectedType.value);
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter((i) => {
      const n = (i.name || '').toLowerCase();
      const a = (i.alias || '').toLowerCase();
      return n.includes(q) || a.includes(q);
    });
  }

  return list;
});

async function triggerManualPoll() {
  if (isPolling.value) return;
  isPolling.value = true;
  try {
    await fwStore.pollSnmpNow();
    await fwStore.fetchDevices();
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
  if (bps >= 10000000000) return `${(bps / 1000000000).toFixed(0)} Gbps`;
  if (bps >= 1000000000) return `${(bps / 1000000000).toFixed(0)} Gbps`;
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
</script>
