import { useState, useEffect, useMemo } from "react";
import ApproveModal from "./ApproveModal";
import RejectModal from "./RejectModal";
import { getDocumentGroupByCategory } from "../../services/documentgroupservice";
import { getDocumentGroupDetailsByDocgroupId } from "../../services/documentgroupdetailsservice";
import { useAuthStore } from "../../store/authstore";

export default function ApproverPanel({ docData = {}, approvalItems = [], loading = false, onApproved }) {
  const currentUser = useAuthStore((s) => s.user);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  // null = loading, [] = loaded empty
  const [docGroups, setDocGroups] = useState(null);
  // map: dcdid -> { data[] }
  const [groupDetailsMap, setGroupDetailsMap] = useState({});

  const doccategoryid =
    docData.doccategoryid ??
    approvalItems[0]?.requestdocumentmodel?.doccategoryid ??
    null;

  useEffect(() => {
    if (!doccategoryid) return;
    getDocumentGroupByCategory(doccategoryid)
      .then((data) => setDocGroups(data))
      .catch((err) => console.error("[ApproverPanel] fetchDocGroups error:", err));
  }, [doccategoryid]);


  // check if current user has already approved this document
  const alreadyApproved = useMemo(() => {
    if (!currentUser?.usercode) return false;
    return approvalItems.some(
      (item) =>
        String(item.approveby) === String(currentUser.usercode) &&
        item.requestdocumentmodel?.req_statusapprove === "APPROVED"
    );
  }, [approvalItems, currentUser]);

  // find which group the current user belongs to, return its levelapprove from docGroups
  const myLevelApprove = useMemo(() => {
    if (!currentUser?.usercode) return null;
    for (const g of (docGroups ?? [])) {
      const state = groupDetailsMap[g.dcdid];
      if (!state) continue;
      const found = state.data.find(
        (d) => d.usersmodel?.usercode === String(currentUser.usercode)
      );
      if (found) return found.documentgroupmodel?.levelapprove ?? g.levelapprove ?? null;
    }
    return null;
  }, [groupDetailsMap, currentUser, docGroups]);

  // fetch details for each group when docGroups changes
  useEffect(() => {
    if (!docGroups?.length) return;
    docGroups.forEach((g) => {
      const dcdid = g.dcdid;
      if (!dcdid) return;
      getDocumentGroupDetailsByDocgroupId(dcdid)
        .then((res) =>
          setGroupDetailsMap((prev) => ({ ...prev, [dcdid]: { data: res.data } }))
        )
        .catch(() =>
          setGroupDetailsMap((prev) => ({ ...prev, [dcdid]: { data: [] } }))
        );
    });
  }, [docGroups]);

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-4 pt-4 pb-0">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="flex-1 text-center text-base font-bold text-gray-800">ຜູ້ອະນຸມັດ</h2>
          </div>
          <div className="border-b-2 border-[#0F75BC]" />
        </div>

        {/* Body */}
        <div className="px-4 py-3 space-y-3">
          {/* doccategoryid — featured */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-blue-500 font-medium uppercase tracking-wide">ປະເພດເອກະສານ</p>
              {loading ? (
                <div className="h-5 w-20 bg-blue-100 rounded animate-pulse mt-0.5" />
              ) : (
                <p className="text-base font-bold text-blue-800 truncate">{doccategoryid ?? "-"}</p>
              )}
            </div>
          </div>

          {/* Other doc info */}
          <div className="space-y-1.5 text-sm">
            <Row label="ເລກທີ" value={docData.req_no} />
            <Row label="rqdid"  value={docData.rqdid} />
          </div>

          {/* Document groups + their details */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Document Group
            </p>
            {docGroups === null ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : docGroups.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-2">ບໍ່ມີ Document Group</p>
            ) : (
              <div className="space-y-2.5">
                {docGroups.map((g, i) => {
                  const dcdid = g.dcdid;
                  const detailState = groupDetailsMap[dcdid] ?? { data: [] };
                  // levelapprove from details API (first item), fallback to group field
                  const levelapprove = detailState.data[0]?.documentgroupmodel?.levelapprove ?? g.levelapprove;
                  return (
                    <div key={dcdid ?? i} className="border border-gray-200 rounded-xl overflow-hidden">
                      {/* Group header */}
                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 border-b border-gray-200">
                        <span className="w-5 h-5 rounded-full bg-[#0F75BC] text-white text-xs flex items-center justify-center shrink-0 font-bold">
                          {i + 1}
                        </span>
                        <span className="text-sm font-semibold text-gray-700 min-w-0 truncate">
                          {g.docgroupname ?? "-"}
                        </span>
                        {levelapprove != null && (
                          <span className="ml-auto text-xs text-[#0F75BC] font-medium shrink-0">
                            Level {levelapprove}
                          </span>
                        )}
                      </div>

                      {/* Show only current user's entry in this group */}
                      {(() => {
                        const myEntry = detailState.data.find(
                          (d) => d.usersmodel?.usercode === String(currentUser?.usercode ?? "")
                        );
                        if (!myEntry) return null;
                        return (
                          <div>
                            <div className="px-3 py-2 flex items-center gap-2 text-sm">
                              <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                                <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-gray-800 font-medium truncate">
                                  {myEntry.usersmodel?.username ?? myEntry.userid}
                                </p>
                                {myEntry.detailsinfo && (
                                  <p className="text-xs text-gray-500">{myEntry.detailsinfo}</p>
                                )}
                              </div>
                              {myEntry.maxsignmoney != null && (
                                <span className="text-xs text-gray-400 shrink-0">
                                  {Number(myEntry.maxsignmoney).toLocaleString()}
                                </span>
                              )}
                            </div>

                            {/* Approve/Reject buttons inside this group card */}
                            <div className="px-3 pb-3">
                              {alreadyApproved ? (
                                <div className="flex items-center justify-center gap-2 bg-green-50 border border-green-200 rounded-xl py-2 px-3">
                                  <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <p className="text-xs text-green-600 font-medium">ທ່ານໄດ້ອະນຸມັດເອກະສານນີ້ແລ້ວ</p>
                                </div>
                              ) : (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setShowApproveModal(true)}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 rounded-xl transition-colors"
                                  >
                                    ອະນຸມັດ
                                  </button>
                                  <button
                                    onClick={() => setShowRejectModal(true)}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 rounded-xl transition-colors"
                                  >
                                    ປະຕິເສດ
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

      <ApproveModal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onApproved={() => { setShowApproveModal(false); onApproved?.(); }}
        docData={docData}
        levelapprove={myLevelApprove}
      />
      <RejectModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onRejected={() => { setShowRejectModal(false); onApproved?.(); }}
        docData={docData}
      />
    </>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-start gap-1">
      <span className="text-gray-500 shrink-0 w-14">{label}</span>
      <span className="text-gray-800 min-w-0 wrap-break-word">: {value ?? "-"}</span>
    </div>
  );
}
