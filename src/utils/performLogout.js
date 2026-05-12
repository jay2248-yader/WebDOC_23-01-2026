import { useAuthStore } from "../store/authstore";

/**
 * Full logout with memory cleanup:
 *  1. Clear in-memory Zustand stores
 *  2. Remove persisted data from localStorage
 *  3. Hard reload → browser resets JS heap completely
 */
export function performLogout() {
  // Clear auth (in-memory + localStorage)
  useAuthStore.getState().logout();
  try { localStorage.removeItem("auth-storage"); } catch { /* ignore */ }

  // Hard reload to /login → fully releases JS heap
  window.location.replace("/login");
}
