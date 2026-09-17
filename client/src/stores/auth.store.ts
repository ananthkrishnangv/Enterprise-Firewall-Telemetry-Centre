import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export type UserRole = 'super_admin' | 'admin' | 'auditor' | 'operator';

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  badgeNumber: string;
  telegramChatId?: string;
  telegramEnabled?: boolean;
  status?: 'active' | 'disabled';
  createdAt?: string;
  lastLogin?: string;
  isProtected?: boolean;
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('nccc_auth_token'));
  const user = ref<User | null>(
    localStorage.getItem('nccc_auth_user')
      ? JSON.parse(localStorage.getItem('nccc_auth_user')!)
      : null
  );
  const isLoading = ref(false);
  const authError = ref<string | null>(null);

  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const isSuperAdmin = computed(() => user.value?.role === 'super_admin');
  const isAdmin = computed(() => user.value?.role === 'admin' || user.value?.role === 'super_admin');
  const isAuditor = computed(() => user.value?.role === 'auditor');

  async function login(username: string, password: string): Promise<boolean> {
    isLoading.value = true;
    authError.value = null;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        authError.value = data.error || 'Authentication failed. Please verify credentials.';
        return false;
      }

      token.value = data.token;
      user.value = data.user;
      localStorage.setItem('nccc_auth_token', data.token);
      localStorage.setItem('nccc_auth_user', JSON.stringify(data.user));
      return true;
    } catch (err: any) {
      authError.value = `Connection error: ${err.message}`;
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function checkAuth(): Promise<boolean> {
    if (!token.value) return false;

    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        user.value = data.user;
        localStorage.setItem('nccc_auth_user', JSON.stringify(data.user));
        return true;
      } else {
        logout();
        return false;
      }
    } catch {
      return !!user.value;
    }
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('nccc_auth_token');
    localStorage.removeItem('nccc_auth_user');
  }

  return {
    token,
    user,
    isLoading,
    authError,
    isAuthenticated,
    isAdmin,
    isAuditor,
    login,
    logout,
    checkAuth
  };
});
