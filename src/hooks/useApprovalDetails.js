import { useCallback, useEffect, useState } from "react";
import { getApprovalDetailsByRqid } from "../services/approvaldocumentservice";

export function useApprovalDetails(rqdid) {
  const [approvalDetails, setApprovalDetails] = useState([]);
  const [loadingApproval, setLoadingApproval] = useState(!!rqdid);

  const fetchApprovalDetails = useCallback(() => {
    if (!rqdid) return;
    getApprovalDetailsByRqid(rqdid)
      .then((res) => setApprovalDetails(res.data))
      .catch((err) => console.error("[ApprovalDetails] error:", err))
      .finally(() => setLoadingApproval(false));
  }, [rqdid]);

  useEffect(() => { fetchApprovalDetails(); }, [fetchApprovalDetails]);

  return { approvalDetails, loadingApproval, fetchApprovalDetails };
}
