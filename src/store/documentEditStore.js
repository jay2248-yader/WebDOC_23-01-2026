import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export const useDocumentEditStore = create(
  devtools(
    persist(
      (set, get) => ({
        // edits keyed by rddid (detail id)
        // { [rddid]: { reqTo: "..." } }
        edits: {},

        setReqTo: (rddid, value) =>
          set((state) => ({
            edits: {
              ...state.edits,
              [rddid]: { ...state.edits[rddid], reqTo: value },
            },
          })),

        setReqReason: (rddid, value) =>
          set((state) => ({
            edits: {
              ...state.edits,
              [rddid]: { ...state.edits[rddid], reqReason: value },
            },
          })),

        setReferences: (rddid, value) =>
          set((state) => ({
            edits: {
              ...state.edits,
              [rddid]: { ...state.edits[rddid], references: value },
            },
          })),

        setBodyParagraph: (rddid, value) =>
          set((state) => ({
            edits: {
              ...state.edits,
              [rddid]: { ...state.edits[rddid], bodyParagraph: value },
            },
          })),

        setRemark: (rddid, value) =>
          set((state) => ({
            edits: {
              ...state.edits,
              [rddid]: { ...state.edits[rddid], remark: value },
            },
          })),

        setTitleTableSections: (rddid, value) =>
          set((state) => ({
            edits: {
              ...state.edits,
              [rddid]: { ...state.edits[rddid], titleTableSections: value },
            },
          })),

        setExtraPages: (rddid, value) =>
          set((state) => ({
            edits: {
              ...state.edits,
              [rddid]: { ...state.edits[rddid], extraPages: value },
            },
          })),

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
