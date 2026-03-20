import { useAuthStore } from "../store/authstore";
import { useDocumentEditStore } from "../store/documentEditStore";

/**
 * Full logout with memory cleanup:
 *  1. Clear in-memory Zustand stores
 *  2. Remove persisted data from localStorage
 *  3. Hard reload → browser resets JS heap completely
 */
export function performLogout() {
  // Clear document edits (in-memory + localStorage)
  useDocumentEditStore.setState({ edits: {} });
  try { localStorage.removeItem("document-edit-storage"); } catch {}

  // Clear auth (in-memory + localStorage)
  useAuthStore.getState().logout();
  try { localStorage.removeItem("auth-storage"); } catch {}

  // Hard reload to /login → fully releases JS heap
  window.location.replace("/login");
}
