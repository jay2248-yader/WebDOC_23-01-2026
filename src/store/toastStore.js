import { create } from "zustand";

let _nextId = 0;
const _timers = new Map();

export const useToastStore = create((set, get) => ({
  toasts: [],
  show(type, message, duration = 3500) {
    const id = ++_nextId;
    set((s) => ({ toasts: [...s.toasts, { id, type, message }] }));
    const timer = setTimeout(() => get().dismiss(id), duration);
    _timers.set(id, timer);
  },
  dismiss(id) {
    const timer = _timers.get(id);
    if (timer !== undefined) { clearTimeout(timer); _timers.delete(id); }
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },
}));

/** Callable outside React components — import { toast } from "../store/toastStore" */
export const toast = {
  success: (msg, dur) => useToastStore.getState().show("success", msg, dur),
  error:   (msg, dur) => useToastStore.getState().show("error",   msg, dur),
  info:    (msg, dur) => useToastStore.getState().show("info",    msg, dur),
};
