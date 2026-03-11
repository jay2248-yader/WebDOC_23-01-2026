import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

// Helper: update เฉพาะ field ของ rddid ที่เปลี่ยน ไม่ spread edits ทั้ง object ถ้าค่าเดิมเหมือนกัน
const updateField = (state, rddid, field, value) => {
  const existing = state.edits[rddid];
  if (existing && existing[field] === value) return state; // skip ถ้าค่าเดิม
  return {
    edits: {
      ...state.edits,
      [rddid]: { ...existing, [field]: value },
    },
  };
};

export const useDocumentEditStore = create(
  devtools(
    persist(
      (set, get) => ({
        edits: {},

        setReqTo: (rddid, value) =>
          set((state) => updateField(state, rddid, "reqTo", value)),

        setReqReason: (rddid, value) =>
          set((state) => updateField(state, rddid, "reqReason", value)),

        setReferences: (rddid, value) =>
          set((state) => updateField(state, rddid, "references", value)),

        setBodyParagraph: (rddid, value) =>
          set((state) => updateField(state, rddid, "bodyParagraph", value)),

        setRemark: (rddid, value) =>
          set((state) => updateField(state, rddid, "remark", value)),

        setTitleTableSections: (rddid, value) =>
          set((state) => updateField(state, rddid, "titleTableSections", value)),

        setExtraPages: (rddid, value) =>
          set((state) => updateField(state, rddid, "extraPages", value)),

        getReqTo: (rddid) => get().edits[rddid]?.reqTo,
        getReqReason: (rddid) => get().edits[rddid]?.reqReason,
        getReferences: (rddid) => get().edits[rddid]?.references,
        getBodyParagraph: (rddid) => get().edits[rddid]?.bodyParagraph,
        getRemark: (rddid) => get().edits[rddid]?.remark,
        getTitleTableSections: (rddid) => get().edits[rddid]?.titleTableSections,
        getExtraPages: (rddid) => get().edits[rddid]?.extraPages,

        clearEdit: (rddid) =>
          set((state) => {
            const { [rddid]: _, ...rest } = state.edits;
            return { edits: rest };
          }),
      }),
      {
        name: "document-edit-storage",
        partialize: (state) => ({ edits: state.edits }),
      }
    ),
    { name: "DocumentEditStore" }
  )
);
