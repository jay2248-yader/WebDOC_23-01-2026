import { useEffect, useMemo, useState } from "react";
import { getDocumentGroupByCategory } from "../services/documentgroupservice";
import { getDocumentGroupDetailsByDocgroupId } from "../services/documentgroupdetailsservice";

export function useSignatureGroups(doccategoryid, approvalDetails) {
  const [groupsData, setGroupsData] = useState([]);

  useEffect(() => {
    if (!doccategoryid) return;
    let mounted = true;
    getDocumentGroupByCategory(doccategoryid)
      .then(async (data) => {
        const sorted = [...(data || [])].sort((a, b) => (a.levelapprove ?? 0) - (b.levelapprove ?? 0));
        const withDetails = await Promise.all(
          sorted.map(async (g) => {
            try {
              const res = await getDocumentGroupDetailsByDocgroupId(g.dcdid);
              const userCodes = res.data.map((d) => ({
                usercode: String(d.usersmodel?.usercode ?? ""),
                username: d.usersmodel?.username ?? "",
              }));
              return { label: g.docgroupname, levelapprove: g.levelapprove, userCodes };
            } catch (err) {
              console.error("Failed to load group details:", g.dcdid, err);
              return { label: g.docgroupname, levelapprove: g.levelapprove, userCodes: [] };
            }
          })
        );
        if (mounted) setGroupsData(withDetails.filter((g) => g.label));
      })
      .catch((err) => console.error("Failed to load document groups:", err));
    return () => { mounted = false; };
  }, [doccategoryid]);

  const signatureGroups = useMemo(
    () =>
      groupsData.map((g) => {
        const record = approvalDetails.find(
          (item) =>
            g.userCodes.some((u) => u.usercode === String(item.approveby)) &&
            String(item.get_descriptions ?? "").toLowerCase().startsWith(`lv${g.levelapprove}`)
        );
        const approverName = record
          ? g.userCodes.find((u) => u.usercode === String(record.approveby))?.username ?? ""
          : "";
        return { label: g.label, approverName };
      }),
    [groupsData, approvalDetails]
  );

  return signatureGroups;
}
