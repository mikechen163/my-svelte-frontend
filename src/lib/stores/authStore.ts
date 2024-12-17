// src/lib/stores/authStore.ts
import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import type { User, LoginCredentials } from '$lib/types/auth';
import { api } from '$lib/services/api';

function createAuthStore() {
  const storedUser = browser ? localStorage.getItem('user') : null;
  const { subscribe, set } = writable<User | null>(storedUser ? JSON.parse(storedUser) : null);

  return {
    subscribe,
    login: async (credentials: LoginCredentials) => {
      try {
        const user = await api.login(credentials);
        set(user);
        if (browser) {
          localStorage.setItem('user', JSON.stringify(user));
        }
        return user;
      } catch (error) {
        console.error('Login failed:', error);
        throw error;
      }
    },
    logout: async () => {
      try {
        const user = browser ? localStorage.getItem('user') : null;
        if (user) {
          const { token } = JSON.parse(user);
          await api.logout(token);
        }
      } finally {
        set(null);
        if (browser) {
          localStorage.removeItem('user');
        }
      }
    },
    checkAuth: async () => {
      if (browser) {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const { token } = JSON.parse(storedUser);
            const user = await api.getCurrentUser(token);
            set(user);
            localStorage.setItem('user', JSON.stringify(user));
            return true;
          } catch (error) {
            console.error('Auth check failed:', error);
            set(null);
            localStorage.removeItem('user');
            return false;
          }
        }
      }
      return false;
    }
  };
}

export const auth = createAuthStore();
export const isAuthenticated = derived(auth, $auth => $auth !== null);
