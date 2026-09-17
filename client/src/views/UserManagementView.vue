<template>
  <div class="space-y-6">
    <!-- Header Banner -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-violet-800/40">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
            RBAC ACCESS CONTROL
          </span>
          <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <ShieldCheck class="w-3 h-3 text-emerald-400" />
            SUPER ADMIN PROTOCOL
          </span>
        </div>
        <h1 class="text-2xl font-bold text-white tracking-tight flex items-center gap-2 font-sans">
          <Users class="w-6 h-6 text-neon-cyan" />
          Enterprise User Management
        </h1>
        <p class="text-xs text-violet-300/80 mt-1">
          Role-based identity management, user credential provisioning, and personalized Telegram security alert subscriptions.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button
          @click="usersStore.fetchUsers"
          :disabled="usersStore.isLoading"
          class="px-3 py-2 rounded-xl bg-violet-900/40 hover:bg-violet-800/50 border border-violet-700/40 text-violet-200 text-xs font-semibold flex items-center gap-2 transition"
          title="Refresh Users"
        >
          <RotateCw class="w-3.5 h-3.5" :class="{ 'animate-spin': usersStore.isLoading }" />
          <span>Refresh</span>
        </button>

        <button
          @click="openCreateModal"
          class="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500 hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-violet-600/30 flex items-center gap-2 transition transform active:scale-95"
        >
          <UserPlus class="w-4 h-4" />
          <span>Add New User</span>
        </button>
      </div>
    </div>

    <!-- Alert / Toast Messages -->
    <div
      v-if="usersStore.successMessage"
      class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between animate-fadeIn"
    >
      <div class="flex items-center gap-2">
        <CheckCircle2 class="w-4 h-4 text-emerald-400 flex-shrink-0" />
        <span>{{ usersStore.successMessage }}</span>
      </div>
      <button @click="usersStore.successMessage = null" class="text-emerald-400 hover:text-white">
        <X class="w-3.5 h-3.5" />
      </button>
    </div>

    <div
      v-if="usersStore.error"
      class="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between animate-fadeIn"
    >
      <div class="flex items-center gap-2">
        <AlertTriangle class="w-4 h-4 text-rose-400 flex-shrink-0" />
        <span>{{ usersStore.error }}</span>
      </div>
      <button @click="usersStore.error = null" class="text-rose-400 hover:text-white">
        <X class="w-3.5 h-3.5" />
      </button>
    </div>

    <div
      v-if="telegramBanner"
      :class="telegramBanner.success ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300' : 'bg-amber-500/10 border-amber-500/30 text-amber-300'"
      class="p-3 rounded-xl border text-xs flex items-center justify-between animate-fadeIn"
    >
      <div class="flex items-center gap-2">
        <Send class="w-4 h-4 flex-shrink-0" />
        <span>{{ telegramBanner.message }}</span>
      </div>
      <button @click="telegramBanner = null" class="hover:text-white">
        <X class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- Metrics Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="p-4 rounded-2xl bg-violet-950/60 backdrop-blur-xl border border-violet-800/40 hover:border-violet-600/50 transition">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-violet-300">Total Users</span>
          <div class="p-2 rounded-xl bg-violet-900/50 text-neon-cyan">
            <Users class="w-4 h-4" />
          </div>
        </div>
        <div class="mt-2 text-2xl font-black font-mono text-white tracking-tight">
          {{ usersStore.totalUsers }}
        </div>
        <div class="mt-1 text-[11px] text-violet-400">Configured in Local Directory</div>
      </div>

      <div class="p-4 rounded-2xl bg-violet-950/60 backdrop-blur-xl border border-violet-800/40 hover:border-amber-500/50 transition">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-violet-300">Super Administrators</span>
          <div class="p-2 rounded-xl bg-amber-500/20 text-amber-400">
            <Crown class="w-4 h-4" />
          </div>
        </div>
        <div class="mt-2 text-2xl font-black font-mono text-amber-300 tracking-tight">
          {{ usersStore.superAdminsCount }}
        </div>
        <div class="mt-1 text-[11px] text-violet-400">Full System & Gateway Authority</div>
      </div>

      <div class="p-4 rounded-2xl bg-violet-950/60 backdrop-blur-xl border border-violet-800/40 hover:border-emerald-500/50 transition">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-violet-300">Active Accounts</span>
          <div class="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 class="w-4 h-4" />
          </div>
        </div>
        <div class="mt-2 text-2xl font-black font-mono text-emerald-300 tracking-tight">
          {{ usersStore.activeUsersCount }}
        </div>
        <div class="mt-1 text-[11px] text-violet-400">Ready for Session Authentication</div>
      </div>

      <div class="p-4 rounded-2xl bg-violet-950/60 backdrop-blur-xl border border-violet-800/40 hover:border-cyan-500/50 transition">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-violet-300">Telegram Alert Feeds</span>
          <div class="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
            <Send class="w-4 h-4" />
          </div>
        </div>
        <div class="mt-2 text-2xl font-black font-mono text-cyan-300 tracking-tight">
          {{ usersStore.telegramSubscribersCount }}
        </div>
        <div class="mt-1 text-[11px] text-violet-400">Subscribed to Threat Notifications</div>
      </div>
    </div>

    <!-- Filter & Search Toolbar -->
    <div class="p-4 rounded-2xl bg-violet-950/50 border border-violet-800/40 flex flex-col sm:flex-row items-center justify-between gap-3">
      <div class="relative w-full sm:w-80">
        <Search class="w-4 h-4 text-violet-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by name, email, role, or ID..."
          class="w-full pl-9 pr-3 py-2 bg-violet-900/40 border border-violet-700/50 rounded-xl text-xs text-white placeholder-violet-400/60 focus:outline-none focus:border-cyan-400 transition"
        />
      </div>

      <div class="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
        <select
          v-model="roleFilter"
          class="px-3 py-2 bg-violet-900/40 border border-violet-700/50 rounded-xl text-xs text-violet-200 focus:outline-none focus:border-cyan-400 transition"
        >
          <option value="all">All Roles</option>
          <option value="super_admin">Super Admin</option>
          <option value="admin">Security Admin</option>
          <option value="operator">Network Operator</option>
          <option value="auditor">Compliance Auditor</option>
        </select>

        <select
          v-model="statusFilter"
          class="px-3 py-2 bg-violet-900/40 border border-violet-700/50 rounded-xl text-xs text-violet-200 focus:outline-none focus:border-cyan-400 transition"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="disabled">Disabled</option>
        </select>
      </div>
    </div>

    <!-- Users Table Card -->
    <div class="rounded-2xl bg-violet-950/60 backdrop-blur-xl border border-violet-800/40 overflow-hidden shadow-xl shadow-violet-950/40">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-violet-200 border-collapse">
          <thead>
            <tr class="border-b border-violet-800/60 bg-violet-900/40 text-[11px] font-bold text-violet-300 uppercase tracking-wider font-mono">
              <th class="py-3 px-4">User / Identity</th>
              <th class="py-3 px-4">Mail ID</th>
              <th class="py-3 px-4">Role & Authority</th>
              <th class="py-3 px-4">Department / Unit</th>
              <th class="py-3 px-4">Telegram Security Feed</th>
              <th class="py-3 px-4">Status</th>
              <th class="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-violet-800/30">
            <tr
              v-for="u in filteredUsers"
              :key="u.id"
              class="hover:bg-violet-900/20 transition group"
            >
              <!-- Identity -->
              <td class="py-3.5 px-4">
                <div class="flex items-center gap-3">
                  <div
                    class="w-9 h-9 rounded-xl p-0.5 flex-shrink-0"
                    :class="u.role === 'super_admin' ? 'bg-gradient-to-tr from-amber-500 via-fuchsia-500 to-cyan-400' : 'bg-gradient-to-tr from-violet-600 to-cyan-500'"
                  >
                    <div class="w-full h-full bg-violet-950 rounded-[10px] flex items-center justify-center font-bold text-white text-xs">
                      {{ getInitials(u.name) }}
                    </div>
                  </div>
                  <div>
                    <div class="font-bold text-white flex items-center gap-1.5 font-sans text-sm">
                      <span>{{ u.name }}</span>
                      <span
                        v-if="u.isProtected"
                        class="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-0.5"
                        title="Protected System Account"
                      >
                        <Lock class="w-2.5 h-2.5" />
                        DEFAULT SUPER ADMIN
                      </span>
                    </div>
                    <div class="text-[11px] text-violet-400 font-mono flex items-center gap-2 mt-0.5">
                      <span>@{{ u.username }}</span>
                      <span>•</span>
                      <span class="text-violet-500">{{ u.badgeNumber || 'No Badge' }}</span>
                    </div>
                  </div>
                </div>
              </td>

              <!-- Mail ID -->
              <td class="py-3.5 px-4 font-mono text-xs">
                <div class="flex items-center gap-1.5 text-cyan-300">
                  <Mail class="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                  <span class="truncate max-w-[180px]">{{ u.email }}</span>
                </div>
              </td>

              <!-- Role -->
              <td class="py-3.5 px-4">
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono border"
                  :class="getRoleBadgeClass(u.role)"
                >
                  <Crown v-if="u.role === 'super_admin'" class="w-3 h-3 text-amber-300" />
                  <Shield v-else-if="u.role === 'admin'" class="w-3 h-3 text-cyan-300" />
                  <Activity v-else-if="u.role === 'operator'" class="w-3 h-3 text-emerald-300" />
                  <FileCheck2 v-else class="w-3 h-3 text-fuchsia-300" />
                  <span>{{ formatRole(u.role) }}</span>
                </span>
              </td>

              <!-- Department -->
              <td class="py-3.5 px-4">
                <div class="text-violet-300 text-xs font-medium truncate max-w-[200px]">
                  {{ u.department || 'CSIR-SERC General' }}
                </div>
              </td>

              <!-- Telegram Notification Status -->
              <td class="py-3.5 px-4">
                <div v-if="u.telegramEnabled && u.telegramChatId" class="flex items-center gap-2">
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                    <Send class="w-2.5 h-2.5" />
                    ID: {{ u.telegramChatId }}
                  </span>
                  <button
                    @click="triggerUserTelegramTest(u)"
                    :disabled="testingTelegramId === u.id"
                    class="p-1 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/40 text-cyan-300 hover:text-white transition text-[10px] flex items-center gap-1"
                    title="Send Test Alert to Telegram"
                  >
                    <Send class="w-2.5 h-2.5" :class="{ 'animate-pulse': testingTelegramId === u.id }" />
                    <span>Ping</span>
                  </button>
                </div>
                <div v-else-if="u.telegramEnabled && !u.telegramChatId">
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    <AlertCircle class="w-2.5 h-2.5" />
                    Chat ID Unset
                  </span>
                </div>
                <div v-else>
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono text-violet-500">
                    Disabled
                  </span>
                </div>
              </td>

              <!-- Status -->
              <td class="py-3.5 px-4">
                <span
                  class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold"
                  :class="u.status === 'disabled' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="u.status === 'disabled' ? 'bg-rose-400' : 'bg-emerald-400'"></span>
                  {{ u.status === 'disabled' ? 'Disabled' : 'Active' }}
                </span>
              </td>

              <!-- Actions -->
              <td class="py-3.5 px-4 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <button
                    @click="openEditModal(u)"
                    class="p-1.5 rounded-lg bg-violet-900/50 hover:bg-violet-800 text-violet-300 hover:text-white border border-violet-700/40 transition"
                    title="Edit User (Name, Email, Role, Telegram)"
                  >
                    <Edit3 class="w-3.5 h-3.5" />
                  </button>

                  <button
                    @click="openDeleteModal(u)"
                    :disabled="u.isProtected || u.role === 'super_admin' || authStore.user?.id === u.id"
                    class="p-1.5 rounded-lg border transition"
                    :class="u.isProtected || u.role === 'super_admin' || authStore.user?.id === u.id
                      ? 'bg-violet-950/40 border-violet-900/40 text-violet-600 cursor-not-allowed'
                      : 'bg-rose-950/40 hover:bg-rose-900/60 border-rose-800/40 text-rose-400 hover:text-rose-200'"
                    :title="u.isProtected ? 'Super Admin cannot be deleted' : (authStore.user?.id === u.id ? 'Cannot delete yourself' : 'Delete User')"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="filteredUsers.length === 0">
              <td colspan="7" class="py-8 text-center text-violet-400 text-xs font-mono">
                No users matching current filters.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create User Modal -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
    >
      <div class="w-full max-w-lg rounded-2xl bg-violet-950 border border-violet-700/60 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between pb-3 border-b border-violet-800/40">
          <div class="flex items-center gap-2">
            <div class="p-2 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 text-white">
              <UserPlus class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-white font-sans">Create New User Account</h3>
              <p class="text-[11px] text-violet-300 font-mono">Assign portal credentials and security privileges</p>
            </div>
          </div>
          <button @click="showCreateModal = false" class="text-violet-400 hover:text-white">
            <X class="w-4 h-4" />
          </button>
        </div>

        <form @submit.prevent="handleCreateSubmit" class="space-y-3.5 text-xs">
          <!-- Username & Password -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-violet-300 font-semibold mb-1">Username *</label>
              <input
                v-model="createForm.username"
                type="text"
                required
                placeholder="e.g. j.sharma"
                class="w-full px-3 py-2 bg-violet-900/40 border border-violet-700/60 rounded-xl text-white font-mono placeholder-violet-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label class="block text-violet-300 font-semibold mb-1">Password *</label>
              <input
                v-model="createForm.password"
                type="password"
                required
                placeholder="Min 6 characters"
                class="w-full px-3 py-2 bg-violet-900/40 border border-violet-700/60 rounded-xl text-white font-mono placeholder-violet-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <!-- Full Name & Email -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-violet-300 font-semibold mb-1">Full Name *</label>
              <input
                v-model="createForm.name"
                type="text"
                required
                placeholder="e.g. Dr. Jyoti Sharma"
                class="w-full px-3 py-2 bg-violet-900/40 border border-violet-700/60 rounded-xl text-white placeholder-violet-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label class="block text-violet-300 font-semibold mb-1">Mail ID (Email) *</label>
              <input
                v-model="createForm.email"
                type="email"
                required
                placeholder="e.g. j.sharma@serc.res.in"
                class="w-full px-3 py-2 bg-violet-900/40 border border-violet-700/60 rounded-xl text-white font-mono placeholder-violet-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <!-- Role & Department -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-violet-300 font-semibold mb-1">Role / Security Clearance</label>
              <select
                v-model="createForm.role"
                class="w-full px-3 py-2 bg-violet-900/40 border border-violet-700/60 rounded-xl text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="operator">Network Operator</option>
                <option value="admin">Security Administrator</option>
                <option value="auditor">Compliance Auditor</option>
                <option value="super_admin">Super Administrator</option>
              </select>
            </div>

            <div>
              <label class="block text-violet-300 font-semibold mb-1">Department / Division</label>
              <input
                v-model="createForm.department"
                type="text"
                placeholder="e.g. ICT & Network Security"
                class="w-full px-3 py-2 bg-violet-900/40 border border-violet-700/60 rounded-xl text-white placeholder-violet-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <!-- Telegram Notification Settings -->
          <div class="p-3.5 rounded-xl bg-violet-900/30 border border-violet-800/60 space-y-3">
            <div class="flex items-center justify-between">
              <span class="font-bold text-violet-200 flex items-center gap-1.5 text-xs">
                <Send class="w-3.5 h-3.5 text-cyan-400" />
                Telegram Incident Notification Settings
              </span>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="createForm.telegramEnabled" class="sr-only peer" />
                <div class="w-9 h-5 bg-violet-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
              </label>
            </div>

            <div v-if="createForm.telegramEnabled" class="space-y-2 pt-1 border-t border-violet-800/40">
              <div>
                <label class="block text-violet-300 text-[11px] mb-1">Telegram Chat ID / User ID</label>
                <input
                  v-model="createForm.telegramChatId"
                  type="text"
                  placeholder="e.g. 148920194 or -10019284910"
                  class="w-full px-3 py-1.5 bg-violet-950 border border-violet-700/60 rounded-lg text-white font-mono text-xs placeholder-violet-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div class="text-[10px] text-violet-400/80 leading-relaxed font-mono">
                Tip: Send <code>/start</code> to your Telegram bot or get your ID from <code>@userinfobot</code>.
              </div>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-violet-800/40">
            <button
              type="button"
              @click="showCreateModal = false"
              class="px-4 py-2 rounded-xl bg-violet-900/50 hover:bg-violet-800 text-violet-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="usersStore.isLoading"
              class="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-90 text-white font-bold flex items-center gap-1.5 shadow-lg shadow-violet-600/30"
            >
              <Loader2 v-if="usersStore.isLoading" class="w-3.5 h-3.5 animate-spin" />
              <span>Create Account</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit User Modal (Name Change, Mail ID Change, Role, Telegram) -->
    <div
      v-if="showEditModal && editingUser"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
    >
      <div class="w-full max-w-lg rounded-2xl bg-violet-950 border border-violet-700/60 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between pb-3 border-b border-violet-800/40">
          <div class="flex items-center gap-2">
            <div class="p-2 rounded-xl bg-cyan-600/30 text-cyan-300 border border-cyan-500/40">
              <Edit3 class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-white font-sans">Edit User Profile & Settings</h3>
              <p class="text-[11px] text-violet-300 font-mono">Modify full name, mail ID, clearance, and Telegram alerts</p>
            </div>
          </div>
          <button @click="showEditModal = false" class="text-violet-400 hover:text-white">
            <X class="w-4 h-4" />
          </button>
        </div>

        <form @submit.prevent="handleEditSubmit" class="space-y-3.5 text-xs">
          <!-- Username (Readonly) & Password Reset -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-violet-400 font-semibold mb-1">Username (System Locked)</label>
              <input
                :value="editingUser.username"
                disabled
                type="text"
                class="w-full px-3 py-2 bg-violet-900/20 border border-violet-800/50 rounded-xl text-violet-400 font-mono cursor-not-allowed"
              />
            </div>

            <div>
              <label class="block text-violet-300 font-semibold mb-1">Reset Password (Optional)</label>
              <input
                v-model="editForm.password"
                type="password"
                placeholder="Leave blank to preserve"
                class="w-full px-3 py-2 bg-violet-900/40 border border-violet-700/60 rounded-xl text-white font-mono placeholder-violet-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <!-- Name Change & Mail ID Change -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-violet-300 font-semibold mb-1">Full Name (Name Change) *</label>
              <input
                v-model="editForm.name"
                type="text"
                required
                placeholder="Full name"
                class="w-full px-3 py-2 bg-violet-900/40 border border-violet-700/60 rounded-xl text-white placeholder-violet-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label class="block text-violet-300 font-semibold mb-1">Mail ID (Email Change) *</label>
              <input
                v-model="editForm.email"
                type="email"
                required
                placeholder="Email address"
                class="w-full px-3 py-2 bg-violet-900/40 border border-violet-700/60 rounded-xl text-white font-mono placeholder-violet-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <!-- Role & Status -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-violet-300 font-semibold mb-1">Role / Authority</label>
              <select
                v-model="editForm.role"
                :disabled="editingUser.isProtected"
                class="w-full px-3 py-2 bg-violet-900/40 border border-violet-700/60 rounded-xl text-white focus:outline-none focus:border-cyan-400 disabled:opacity-50"
              >
                <option value="super_admin">Super Administrator</option>
                <option value="admin">Security Administrator</option>
                <option value="operator">Network Operator</option>
                <option value="auditor">Compliance Auditor</option>
              </select>
            </div>

            <div>
              <label class="block text-violet-300 font-semibold mb-1">Account State</label>
              <select
                v-model="editForm.status"
                :disabled="editingUser.isProtected"
                class="w-full px-3 py-2 bg-violet-900/40 border border-violet-700/60 rounded-xl text-white focus:outline-none focus:border-cyan-400 disabled:opacity-50"
              >
                <option value="active">Active (Permitted to Log In)</option>
                <option value="disabled">Disabled (Lockout Access)</option>
              </select>
            </div>
          </div>

          <!-- Department & Badge -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-violet-300 font-semibold mb-1">Department / Division</label>
              <input
                v-model="editForm.department"
                type="text"
                placeholder="Department"
                class="w-full px-3 py-2 bg-violet-900/40 border border-violet-700/60 rounded-xl text-white placeholder-violet-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label class="block text-violet-300 font-semibold mb-1">Badge / Employee ID</label>
              <input
                v-model="editForm.badgeNumber"
                type="text"
                placeholder="Badge Number"
                class="w-full px-3 py-2 bg-violet-900/40 border border-violet-700/60 rounded-xl text-white font-mono placeholder-violet-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <!-- Telegram Notification Settings -->
          <div class="p-3.5 rounded-xl bg-violet-900/30 border border-violet-800/60 space-y-3">
            <div class="flex items-center justify-between">
              <span class="font-bold text-violet-200 flex items-center gap-1.5 text-xs">
                <Send class="w-3.5 h-3.5 text-cyan-400" />
                Telegram Incident Notification Settings
              </span>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="editForm.telegramEnabled" class="sr-only peer" />
                <div class="w-9 h-5 bg-violet-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
              </label>
            </div>

            <div v-if="editForm.telegramEnabled" class="space-y-2.5 pt-1 border-t border-violet-800/40">
              <div>
                <label class="block text-violet-300 text-[11px] mb-1">Telegram Chat ID / User ID</label>
                <div class="flex gap-2">
                  <input
                    v-model="editForm.telegramChatId"
                    type="text"
                    placeholder="e.g. 148920194 or -10019284910"
                    class="flex-1 px-3 py-1.5 bg-violet-950 border border-violet-700/60 rounded-lg text-white font-mono text-xs placeholder-violet-500 focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="button"
                    @click="testModalTelegram"
                    :disabled="!editForm.telegramChatId || testingTelegramId === editingUser.id"
                    class="px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/50 text-cyan-300 text-xs font-bold flex items-center gap-1 disabled:opacity-50 transition"
                  >
                    <Send class="w-3 h-3" :class="{ 'animate-pulse': testingTelegramId === editingUser.id }" />
                    <span>Send Ping</span>
                  </button>
                </div>
              </div>
              <div class="text-[10px] text-violet-400/80 leading-relaxed font-mono">
                When enabled, security incident dispatches and firewall health warnings will route to this chat ID.
              </div>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-violet-800/40">
            <button
              type="button"
              @click="showEditModal = false"
              class="px-4 py-2 rounded-xl bg-violet-900/50 hover:bg-violet-800 text-violet-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="usersStore.isLoading"
              class="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:opacity-90 text-white font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-600/30"
            >
              <Loader2 v-if="usersStore.isLoading" class="w-3.5 h-3.5 animate-spin" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete User Confirmation Modal -->
    <div
      v-if="showDeleteModal && deletingUser"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
    >
      <div class="w-full max-w-md rounded-2xl bg-violet-950 border border-rose-700/60 shadow-2xl p-6 space-y-4">
        <div class="flex items-center gap-3 pb-3 border-b border-rose-800/40">
          <div class="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40">
            <AlertTriangle class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-sm font-bold text-white font-sans">Confirm Account Deletion</h3>
            <p class="text-[11px] text-rose-300 font-mono">Irrevocable credential removal</p>
          </div>
        </div>

        <p class="text-xs text-violet-200 leading-relaxed">
          Are you sure you want to permanently delete user account <strong class="text-white font-mono">@{{ deletingUser.username }}</strong> (<span class="text-cyan-300">{{ deletingUser.name }}</span>)?
        </p>

        <div class="p-3 rounded-xl bg-rose-950/40 border border-rose-900/50 text-[11px] text-rose-300 font-mono space-y-1">
          <div>• Email: {{ deletingUser.email }}</div>
          <div>• Role: {{ formatRole(deletingUser.role) }}</div>
          <div>• Immediate revocation of all API tokens & sessions.</div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2">
          <button
            @click="showDeleteModal = false"
            class="px-4 py-2 rounded-xl bg-violet-900/50 hover:bg-violet-800 text-violet-300 font-semibold text-xs"
          >
            Cancel
          </button>
          <button
            @click="confirmDelete"
            :disabled="usersStore.isLoading"
            class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-rose-600/30"
          >
            <Loader2 v-if="usersStore.isLoading" class="w-3.5 h-3.5 animate-spin" />
            <span>Delete User</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Shield,
  Crown,
  Activity,
  FileCheck2,
  Lock,
  Mail,
  Send,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  RotateCw,
  Search,
  X,
  Loader2
} from 'lucide-vue-next';
import { useUsersStore, CreateUserData, UpdateUserData } from '../stores/users.store.js';
import { useAuthStore, User, UserRole } from '../stores/auth.store.js';

const usersStore = useUsersStore();
const authStore = useAuthStore();

const searchQuery = ref('');
const roleFilter = ref('all');
const statusFilter = ref('all');

const showCreateModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);

const editingUser = ref<User | null>(null);
const deletingUser = ref<User | null>(null);
const testingTelegramId = ref<string | null>(null);

const telegramBanner = ref<{ success: boolean; message: string } | null>(null);

const createForm = ref<CreateUserData>({
  username: '',
  name: '',
  email: '',
  password: '',
  role: 'operator',
  department: 'CSIR-SERC ICT Division',
  badgeNumber: '',
  telegramChatId: '',
  telegramEnabled: false
});

const editForm = ref<UpdateUserData>({
  name: '',
  email: '',
  password: '',
  role: 'operator',
  department: '',
  badgeNumber: '',
  telegramChatId: '',
  telegramEnabled: false,
  status: 'active'
});

onMounted(() => {
  usersStore.fetchUsers();
});

const filteredUsers = computed(() => {
  return usersStore.users.filter(u => {
    // Search filter
    const query = searchQuery.value.toLowerCase().trim();
    if (query) {
      const matchName = u.name.toLowerCase().includes(query);
      const matchUser = u.username.toLowerCase().includes(query);
      const matchEmail = u.email.toLowerCase().includes(query);
      const matchDept = (u.department || '').toLowerCase().includes(query);
      const matchRole = u.role.toLowerCase().includes(query);
      if (!matchName && !matchUser && !matchEmail && !matchDept && !matchRole) return false;
    }

    // Role filter
    if (roleFilter.value !== 'all' && u.role !== roleFilter.value) {
      return false;
    }

    // Status filter
    if (statusFilter.value !== 'all') {
      const userStatus = u.status || 'active';
      if (userStatus !== statusFilter.value) return false;
    }

    return true;
  });
});

function getInitials(name: string): string {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatRole(role: UserRole): string {
  switch (role) {
    case 'super_admin': return 'Super Admin';
    case 'admin': return 'Security Admin';
    case 'operator': return 'Network Operator';
    case 'auditor': return 'Compliance Auditor';
    default: return role;
  }
}

function getRoleBadgeClass(role: UserRole): string {
  switch (role) {
    case 'super_admin':
      return 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/20';
    case 'admin':
      return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    case 'operator':
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    case 'auditor':
      return 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40';
    default:
      return 'bg-violet-500/20 text-violet-300 border-violet-500/40';
  }
}

function openCreateModal() {
  createForm.value = {
    username: '',
    name: '',
    email: '',
    password: '',
    role: 'operator',
    department: 'CSIR-SERC ICT Division',
    badgeNumber: `SERC-${Math.floor(1000 + Math.random() * 9000)}`,
    telegramChatId: '',
    telegramEnabled: false
  };
  showCreateModal.value = true;
}

async function handleCreateSubmit() {
  const res = await usersStore.createUser(createForm.value);
  if (res.success) {
    showCreateModal.value = false;
  }
}

function openEditModal(u: User) {
  editingUser.value = u;
  editForm.value = {
    name: u.name,
    email: u.email,
    password: '',
    role: u.role,
    department: u.department,
    badgeNumber: u.badgeNumber,
    telegramChatId: u.telegramChatId || '',
    telegramEnabled: !!u.telegramEnabled,
    status: u.status || 'active'
  };
  showEditModal.value = true;
}

async function handleEditSubmit() {
  if (!editingUser.value) return;
  const payload: UpdateUserData = {
    name: editForm.value.name,
    email: editForm.value.email,
    role: editForm.value.role,
    department: editForm.value.department,
    badgeNumber: editForm.value.badgeNumber,
    telegramChatId: editForm.value.telegramChatId,
    telegramEnabled: editForm.value.telegramEnabled,
    status: editForm.value.status
  };
  if (editForm.value.password && editForm.value.password.trim()) {
    payload.password = editForm.value.password.trim();
  }

  const res = await usersStore.updateUser(editingUser.value.id, payload);
  if (res.success) {
    showEditModal.value = false;
  }
}

function openDeleteModal(u: User) {
  deletingUser.value = u;
  showDeleteModal.value = true;
}

async function confirmDelete() {
  if (!deletingUser.value) return;
  const res = await usersStore.deleteUser(deletingUser.value.id);
  if (res.success) {
    showDeleteModal.value = false;
    deletingUser.value = null;
  }
}

async function triggerUserTelegramTest(u: User) {
  testingTelegramId.value = u.id;
  telegramBanner.value = null;
  const res = await usersStore.testTelegram(u.id);
  testingTelegramId.value = null;
  telegramBanner.value = {
    success: res.success,
    message: res.message
  };
}

async function testModalTelegram() {
  if (!editingUser.value || !editForm.value.telegramChatId) return;
  testingTelegramId.value = editingUser.value.id;
  const res = await usersStore.testTelegram(editingUser.value.id, editForm.value.telegramChatId);
  testingTelegramId.value = null;
  telegramBanner.value = {
    success: res.success,
    message: res.message
  };
}
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
  animation: fadeIn 0.2s ease-out forwards;
}
</style>
