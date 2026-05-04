import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

const MAX_EDITS = 50; // เก็บสูงสุด 50 รายการ ป้องกัน unbounded growth
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 วัน

// Helper: update เฉพาะ field ของ rddid ที่เปลี่ยน ไม่ spread edits ทั้ง object ถ้าค่าเดิมเหมือนกัน
const updateField = (state, rqdid, field, value) => {
  const existing = state.edits[rqdid];
  if (existing && existing[field] === value) return state; // skip ถ้าค่าเดิม
  const updated = {
    ...state.edits,
    [rqdid]: { ...existing, [field]: value, savedAt: Date.now() },
  };
  // ถ้าเกิน limit ให้ลบ entry เก่าสุดออก
  const keys = Object.keys(updated);
  if (keys.length > MAX_EDITS) {
    delete updated[keys[0]];
  }
  return { edits: updated };
};

export const useDocumentEditStore = create(
  devtools(
    persist(
      (set, get) => ({
        edits: {},

        setReqTo: (rqdid, value) =>
          set((state) => updateField(state, rqdid, "reqTo", value)),

        setReqReason: (rqdid, value) =>
          set((state) => updateField(state, rqdid, "reqReason", value)),

        setReferences: (rqdid, value) =>
          set((state) => updateField(state, rqdid, "references", value)),

        setBodyParagraph: (rqdid, value) =>
          set((state) => updateField(state, rqdid, "bodyParagraph", value)),

        setRemark: (rqdid, value) =>
          set((state) => updateField(state, rqdid, "remark", value)),

        setTitleTableSections: (rqdid, value) =>
          set((state) => updateField(state, rqdid, "titleTableSections", value)),

        setExtraPages: (rqdid, value) =>
          set((state) => updateField(state, rqdid, "extraPages", value)),

        getReqTo: (rqdid) => get().edits[rqdid]?.reqTo,
        getReqReason: (rqdid) => get().edits[rqdid]?.reqReason,
        getReferences: (rqdid) => get().edits[rqdid]?.references,
        getBodyParagraph: (rqdid) => get().edits[rqdid]?.bodyParagraph,
        getRemark: (rqdid) => get().edits[rqdid]?.remark,
        getTitleTableSections: (rqdid) => get().edits[rqdid]?.titleTableSections,
        getExtraPages: (rqdid) => get().edits[rqdid]?.extraPages,

        clearEdit: (rqdid) =>
          set((state) => {
            const { [rqdid]: _, ...rest } = state.edits;
            return { edits: rest };
          }),

        cleanupExpired: () =>
          set((state) => ({
            edits: Object.fromEntries(
              Object.entries(state.edits).filter(
                ([, v]) => v.savedAt && Date.now() - v.savedAt < TTL_MS
              )
            ),
          })),
      }),
      {
        name: "document-edit-storage",
        partialize: (state) => ({ edits: state.edits }),
        onRehydrateStorage: () => (state) => {
          if (state) Promise.resolve().then(() => state.cleanupExpired());
        },
      }
    ),
    { name: "DocumentEditStore" }
  )
);
