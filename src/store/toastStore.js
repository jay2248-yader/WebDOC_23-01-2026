/**
 * toastStore.js
 *
 * Global Toast notification system — ใช้ Zustand
 *
 * การใช้งาน (ใช้ได้ทั้งใน และนอก React component):
 *   import { toast } from "../store/toastStore"
 *   toast.success("บันทึกสำเร็จ")
 *   toast.error("เกิดข้อผิดพลาด")
 *   toast.info("ข้อมูลทั่วไป")
 *
 * Toast จะหายเองอัตโนมัติหลัง 3500ms (แก้ได้โดยส่ง duration เป็น argument ที่ 2)
 * ถ้าต้องการ dismiss เอง → useToastStore.getState().dismiss(id)
 *
 * UI ที่แสดง toast อยู่ใน ToastContainer component (ใน MainLayout)
 */
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
