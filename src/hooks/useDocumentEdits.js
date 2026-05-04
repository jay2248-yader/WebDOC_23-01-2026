import { useEffect, useRef, useState } from "react";
import { useDocumentEditStore } from "../store/documentEditStore";

export function useDocumentEdits(rqdid, docData) {
  const initial = () => useDocumentEditStore.getState().edits[rqdid];

  const [titleTableSections, setTitleTableSections] = useState(() => initial()?.titleTableSections ?? []);
  const [reqTo, setReqTo] = useState(() => initial()?.reqTo ?? docData.req_to ?? "");
  const [reqReason, setReqReason] = useState(() => initial()?.reqReason ?? docData.req_reason ?? "");
  const [references, setReferences] = useState(() => initial()?.references ?? docData.references ?? [""]);
  const [bodyParagraph, setBodyParagraph] = useState(() => initial()?.bodyParagraph ?? docData.body_paragraph ?? "");
  const [remark, setRemark] = useState(() => initial()?.remark ?? docData.remark ?? "");
  const [extraPages, setExtraPages] = useState(() => initial()?.extraPages ?? []);

  // Sync reactively on async hydration (Zustand v5)
  const storeEdit = useDocumentEditStore((s) => (rqdid ? s.edits[rqdid] : undefined));
  const syncedRef = useRef(false);
  useEffect(() => {
    if (!rqdid || syncedRef.current || !storeEdit) return;
    /* eslint-disable react-hooks/set-state-in-effect */
    if (storeEdit.reqTo !== undefined) setReqTo(storeEdit.reqTo);
    if (storeEdit.reqReason !== undefined) setReqReason(storeEdit.reqReason);
    if (storeEdit.references !== undefined) setReferences(storeEdit.references);
    if (storeEdit.bodyParagraph !== undefined) setBodyParagraph(storeEdit.bodyParagraph);
    if (storeEdit.remark !== undefined) setRemark(storeEdit.remark);
    if (storeEdit.titleTableSections !== undefined) setTitleTableSections(storeEdit.titleTableSections);
    if (storeEdit.extraPages !== undefined) setExtraPages(storeEdit.extraPages);
    syncedRef.current = true;
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [rqdid, storeEdit]);

  return {
    titleTableSections, setTitleTableSections,
    reqTo, setReqTo,
    reqReason, setReqReason,
    references, setReferences,
    bodyParagraph, setBodyParagraph,
    remark, setRemark,
    extraPages, setExtraPages,
  };
}
