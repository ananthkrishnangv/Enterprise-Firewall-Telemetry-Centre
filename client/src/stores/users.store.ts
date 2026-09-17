import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { User, UserRole, useAuthStore } from './auth.store.js';

export interface CreateUserData {
  username: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  department?: string;
  badgeNumber?: string;
  telegramChatId?: string;
  telegramEnabled?: boolean;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  department?: string;
  badgeNumber?: string;
  telegramChatId?: string;
  telegramEnabled?: boolean;
  status?: 'active' | 'disabled';
}

export const useUsersStore = defineStore('users', () => {
  const users = ref<User[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const successMessage = ref<string | null>(null);
  const authStore = useAuthStore();

  const totalUsers = computed(() => users.value.length);
  const superAdminsCount = computed(() => users.value.filter(u => u.role === 'super_admin').length);
  const activeUsersCount = computed(() => users.value.filter(u => u.status !== 'disabled').length);
  const telegramSubscribersCount = computed(() => users.value.filter(u => u.telegramEnabled && !!u.telegramChatId).length);

  function getAuthHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (authStore.token) {
      headers['Authorization'] = `Bearer ${authStore.token}`;
    }
    return headers;
  }

  async function fetchUsers(): Promise<boolean> {
    isLoading.value = true;
    error.value = null;
    try {
      const res = await fetch('/api/users', {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch user list.');
      }
      users.value = data.users || [];
      return true;
    } catch (err: any) {
      error.value = err.message;
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function createUser(data: CreateUserData): Promise<{ success: boolean; error?: string; user?: User }> {
    isLoading.value = true;
    error.value = null;
    successMessage.value = null;
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to create user account.');
      }
      await fetchUsers();
      successMessage.value = `User account "${data.username}" created successfully!`;
      return { success: true, user: resData.user };
    } catch (err: any) {
      error.value = err.message;
      return { success: false, error: err.message };
    } finally {
      isLoading.value = false;
    }
  }

  async function updateUser(id: string, data: UpdateUserData): Promise<{ success: boolean; error?: string; user?: User }> {
    isLoading.value = true;
    error.value = null;
    successMessage.value = null;
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to update user profile.');
      }
      await fetchUsers();

      // If updating currently logged in user, update authStore.user as well
      if (authStore.user?.id === id) {
        authStore.user = {
          ...authStore.user,
          ...resData.user
        };
        localStorage.setItem('nccc_auth_user', JSON.stringify(authStore.user));
      }

      successMessage.value = `User profile updated successfully!`;
      return { success: true, user: resData.user };
    } catch (err: any) {
      error.value = err.message;
      return { success: false, error: err.message };
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteUser(id: string): Promise<{ success: boolean; error?: string }> {
    isLoading.value = true;
    error.value = null;
    successMessage.value = null;
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to delete user.');
      }
      await fetchUsers();
      successMessage.value = 'User account deleted successfully.';
      return { success: true };
    } catch (err: any) {
      error.value = err.message;
      return { success: false, error: err.message };
    } finally {
      isLoading.value = false;
    }
  }

  async function testTelegram(id: string, customChatId?: string): Promise<{ success: boolean; message: string }> {
    error.value = null;
    try {
      const res = await fetch(`/api/users/${id}/test-telegram`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ chatId: customChatId })
      });
      const resData = await res.json();
      if (!res.ok || !resData.success) {
        return { success: false, message: resData.message || resData.error || 'Telegram test failed.' };
      }
      return { success: true, message: resData.message };
    } catch (err: any) {
      return { success: false, message: `Telegram test request failed: ${err.message}` };
    }
  }

  return {
    users,
    isLoading,
    error,
    successMessage,
    totalUsers,
    superAdminsCount,
    activeUsersCount,
    telegramSubscribersCount,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    testTelegram
  };
});
