import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import ApproveModal from "./ApproveModal";
import RejectModal from "./RejectModal";
import { getDocumentGroupByCategory } from "../../services/documentgroupservice";
import { getDocumentGroupDetailsByDocgroupId } from "../../services/documentgroupdetailsservice";
import { editRequestDocumentDetails } from "../../services/approvaldocumentservice";
import { useAuthStore } from "../../store/authstore";

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const [datePart, timePart] = dateStr.split(" ");
  const [y, m, d] = datePart.split("-");
  return `${d}/${m}/${y}${timePart ? " " + timePart.substring(0, 5) : ""}`;
}

function StepIcon({ status, isMe }) {
  if (status === "APPROVED") {
    return (
      <div className="w-11 h-11 rounded-full bg-green-500 flex items-center justify-center shadow-lg ring-4 ring-white">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      </div>
    );
  }
  if (status === "REJECTED") {
    return (
      <div className="w-11 h-11 rounded-full bg-red-500 flex items-center justify-center shadow-lg ring-4 ring-white">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
    );
  }
  if (isMe) {
    return (
      <div className="w-11 h-11 rounded-full bg-[#0F75BC] flex items-center justify-center shadow-lg ring-4 ring-blue-100">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
    );
  }
  return (
    <div className="w-11 h-11 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center ring-4 ring-white">
      <div className="w-3 h-3 rounded-full bg-gray-300" />
    </div>
  );
}

export default function ApprovalFlowPanel({ docData = {}, approvalItems = [], loading = false, onApproved }) {
  const currentUser = useAuthStore((s) => s.user);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [docGroups, setDocGroups] = useState(null);
  const [groupDetailsMap, setGroupDetailsMap] = useState({});

  const handleEdit = async () => {
    if (!docData.rqdid || editLoading) return;
    setEditLoading(true);
    try {
      await editRequestDocumentDetails({ rqdid: docData.rqdid });
      onApproved?.();
    } catch (err) {
      console.error("[ApprovalFlowPanel] editRequestDocumentDetails error:", err);
    } finally {
      setEditLoading(false);
    }
  };

  const doccategoryid =
    docData.doccategoryid ??
    approvalItems[0]?.requestdocumentmodel?.doccategoryid ??
    null;

  useEffect(() => {
    if (!doccategoryid) return;
    getDocumentGroupByCategory(doccategoryid)
      .then((data) => setDocGroups(data))
      .catch((err) => console.error("[ApprovalFlowPanel] fetchDocGroups error:", err));
  }, [doccategoryid]);

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

  const sortedGroups = useMemo(() => {
    if (!docGroups) return null;
    return [...docGroups].sort((a, b) => (a.levelapprove ?? 0) - (b.levelapprove ?? 0));
  }, [docGroups]);

  // Derive document-level status from any approval record (they all share the same requestdocumentmodel)
  const docStatus = approvalItems.length > 0
    ? (approvalItems[0].requestdocumentmodel?.req_statusapprove ?? null)
    : null;

  // When REJECTED: identify which lv rejected (the highest lv with a record = the rejector)
  const rejectorLv = useMemo(() => {
    if (docStatus !== "REJECTED") return null;
    return approvalItems.reduce((maxLv, item) => {
      const m = String(item.get_descriptions ?? "").match(/^lv(\d+)/i);
      const lv = m ? parseInt(m[1]) : 0;
      return lv > maxLv ? lv : maxLv;
    }, 0);
  }, [docStatus, approvalItems]);

  // Pre-compute per-step data so we can reference adjacent step colors for the track
  const stepData = useMemo(() => {
    if (!sortedGroups) return [];
    return sortedGroups.map((g) => {
      const detailState = groupDetailsMap[g.dcdid] ?? { data: [] };
      const groupUsers = detailState.data;
      const groupUserCodes = groupUsers
        .map((d) => String(d.usersmodel?.usercode ?? ""))
        .filter(Boolean);
      const levelapprove =
        detailState.data[0]?.documentgroupmodel?.levelapprove ?? g.levelapprove;

      // All records are statustype:"ADD" regardless of action type — no statustype filter needed
      const approvalRecord = approvalItems.find(
        (item) =>
          groupUserCodes.includes(String(item.approveby)) &&
          (levelapprove == null ||
            String(item.get_descriptions ?? "").toLowerCase().startsWith(`lv${levelapprove}`))
      );

      let isApproved = false;
      let isRejected = false;
      if (approvalRecord) {
        if (docStatus === "REJECTED") {
          // Highest lv with a record = the rejector; lower levels = already approved
          if (levelapprove === rejectorLv) {
            isRejected = true;
          } else {
            isApproved = true;
          }
        } else {
          // APPROVED / EDIT / PENDING / any other: record present = level was processed
          isApproved = true;
        }
      }

      const myEntry = groupUsers.find(
        (d) => d.usersmodel?.usercode === String(currentUser?.usercode ?? "")
      );
      return { g, groupUsers, approvalRecord, isApproved, isRejected, levelapprove, myEntry };
    });
  }, [sortedGroups, groupDetailsMap, approvalItems, currentUser, docStatus, rejectorLv]);

  const myLevelApprove = useMemo(() => {
    const pendingStep = stepData.find((s) => s.myEntry && !s.isApproved && !s.isRejected);
    return pendingStep?.levelapprove ?? null;
  }, [stepData]);

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">

        {/* ── Header ── */}
        <div className="bg-linear-to-r from-[#0c5fa0] to-[#1a8fd1] px-5 py-3 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm font-bold text-white tracking-wide">ກະແສການອະນຸມັດ</span>
          </div>
          <div className="h-4 w-px bg-white/30 shrink-0" />
          <div className="flex items-center gap-4 text-xs text-white/70 flex-wrap">
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-white/50 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {loading ? (
                <div className="h-3 w-14 bg-white/30 rounded animate-pulse" />
              ) : (
                <span className="font-semibold text-white">{doccategoryid ?? "-"}</span>
              )}
            </div>
            {docData.req_no && (
              <span>ເລກທີ <span className="font-semibold text-white">{docData.req_no}</span></span>
            )}
          </div>
        </div>

        {/* ── Stepper ── */}
        <div className="px-4 py-4">
          {sortedGroups === null ? (
            /* Loading skeleton */
            <div className="flex gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex-1 min-w-36 flex flex-col items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gray-100 animate-pulse" />
                  <div className="h-3 bg-gray-100 rounded-full animate-pulse w-3/4" />
                  <div className="h-20 bg-gray-100 rounded-2xl animate-pulse w-full" />
                </div>
              ))}
            </div>
          ) : sortedGroups.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">ບໍ່ມີ Document Group</p>
          ) : (
            <div className="flex flex-col">
              {stepData.map(({ g, groupUsers, approvalRecord, isApproved, isRejected, levelapprove, myEntry }, i) => {
                const dcdid = g.dcdid;
                const isMyGroup = !!myEntry;
                const isFirst = i === 0;
                const isLast = i === stepData.length - 1;

                const ownTrack = isApproved ? "bg-green-400" : isRejected ? "bg-red-400" : "bg-gray-200";
                const prevTrack = i > 0
                  ? (stepData[i - 1].isApproved ? "bg-green-400"
                    : stepData[i - 1].isRejected ? "bg-red-400"
                    : "bg-gray-200")
                  : "bg-gray-200";

                return (
                  <div key={dcdid ?? i} className="flex gap-3">

                    {/* ── Icon column with vertical track ── */}
                    <div className="flex flex-col items-center shrink-0" style={{ width: 44 }}>
                      {/* Track above icon */}
                      {!isFirst && (
                        <div className={`w-0.5 h-4 shrink-0 ${prevTrack}`} />
                      )}
                      {/* Icon */}
                      <div className="relative z-10 shrink-0">
                        <StepIcon
                          status={isApproved ? "APPROVED" : isRejected ? "REJECTED" : null}
                          isMe={isMyGroup && !approvalRecord}
                        />
                      </div>
                      {/* Track below icon — stretches to fill remaining step height */}
                      {!isLast && (
                        <div className={`w-0.5 flex-1 min-h-4 ${ownTrack}`} />
                      )}
                    </div>

                    {/* ── Content column ── */}
                    <div className={`flex-1 min-w-0 ${!isLast ? "pb-4" : ""}`}>
                      {/* Group label */}
                      <div className="mb-2 pt-2">
                        <p className="text-[11px] font-bold text-gray-700 leading-tight">
                          {g.docgroupname ?? "-"}
                        </p>
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          {levelapprove != null && (
                            <span className="text-[10px] font-bold text-[#0F75BC] bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                              Lv.{levelapprove}
                            </span>
                          )}
                          {isApproved && (
                            <span className="text-[10px] font-bold text-green-600 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full">
                              ✓ ອະນຸມັດ
                            </span>
                          )}
                          {isRejected && (
                            <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
                              ✕ ປະຕິເສດ
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content card */}
                      {/* ── Case 1: Approval record exists ── */}
                      {approvalRecord ? (
                        <div className={`rounded-xl border overflow-hidden shadow-sm ${
                          isApproved ? "border-green-200" : isRejected ? "border-red-200" : "border-gray-200"
                        }`}>
                          <div className={`h-1 ${isApproved ? "bg-green-400" : isRejected ? "bg-red-400" : "bg-gray-300"}`} />
                          <div className={`px-3 py-2 text-xs ${
                            isApproved ? "bg-green-50" : isRejected ? "bg-red-50" : "bg-gray-50"
                          }`}>
                            <div className="flex items-center gap-1.5 mb-1">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                                isApproved ? "bg-green-200" : isRejected ? "bg-red-200" : "bg-gray-200"
                              }`}>
                                <svg className={`w-3 h-3 ${
                                  isApproved ? "text-green-700" : isRejected ? "text-red-700" : "text-gray-500"
                                }`} fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-3.33 0-10 1.674-10 5v2h20v-2c0-3.326-6.67-5-10-5z"/>
                                </svg>
                              </div>
                              <span className={`font-bold truncate text-[11px] ${
                                isApproved ? "text-green-800" : isRejected ? "text-red-800" : "text-gray-700"
                              }`}>
                                {groupUsers.find(
                                  (d) => String(d.usersmodel?.usercode) === String(approvalRecord.approveby)
                                )?.usersmodel?.username ?? `#${approvalRecord.approveby}`}
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-400 pl-6">
                              {formatDate(approvalRecord.createdate)}
                            </p>
                            {approvalRecord.get_descriptions && (
                              <p className={`text-[11px] pl-6 mt-1 italic leading-snug line-clamp-2 ${
                                isApproved ? "text-green-700" : isRejected ? "text-red-700" : "text-gray-500"
                              }`}>
                                "{approvalRecord.get_descriptions}"
                              </p>
                            )}
                          </div>
                        </div>

                      /* ── Case 2: Current user's turn ── */
                      ) : isMyGroup ? (
                        <div className="rounded-xl border border-blue-200 overflow-hidden shadow-sm">
                          <div className="h-1 bg-linear-to-r from-[#0F75BC] to-[#1a8fd1]" />
                          <div className="bg-blue-50 px-3 py-2">
                            <div className="flex items-center gap-1.5 mb-2">
                              <div className="w-5 h-5 rounded-full bg-[#0F75BC] flex items-center justify-center shrink-0">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-3.33 0-10 1.674-10 5v2h20v-2c0-3.326-6.67-5-10-5z"/>
                                </svg>
                              </div>
                              <span className="font-bold text-[#0F75BC] truncate text-[11px] flex-1">
                                {myEntry.usersmodel?.username ?? myEntry.userid}
                              </span>
                              <span className="shrink-0 text-[9px] font-bold text-[#0F75BC] bg-white border border-blue-200 px-1.5 py-0.5 rounded-full">
                                ທ່ານ
                              </span>
                            </div>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => setShowApproveModal(true)}
                                className="flex-1 bg-green-500 hover:bg-green-600 active:scale-95 text-white text-[11px] font-bold py-1.5 rounded-lg transition-all shadow-sm"
                              >
                                ✓&nbsp;ອະນຸມັດ
                              </button>
                              <button
                                onClick={() => setShowRejectModal(true)}
                                className="flex-1 bg-red-500 hover:bg-red-600 active:scale-95 text-white text-[11px] font-bold py-1.5 rounded-lg transition-all shadow-sm"
                              >
                                ✕&nbsp;ປະຕິເສດ
                              </button>
                            </div>
                            <button
                              onClick={handleEdit}
                              disabled={editLoading}
                              className="w-full mt-1.5 bg-yellow-400 hover:bg-yellow-500 active:scale-95 disabled:opacity-50 text-white text-[11px] font-bold py-1.5 rounded-lg transition-all shadow-sm"
                            >
                              {editLoading ? "..." : "✎\u00a0ສົ່ງແກ້ໄຂ"}
                            </button>
                          </div>
                        </div>

                      /* ── Case 3: Waiting ── */
                      ) : (
                        <div className="rounded-xl border border-gray-200 overflow-hidden">
                          <div className="h-1 bg-gray-200" />
                          <div className="bg-gray-50 px-3 py-2 space-y-1">
                            {groupUsers.length === 0 ? (
                              <p className="text-[10px] text-gray-400 text-center">ບໍ່ມີຂໍ້ມູນ</p>
                            ) : (
                              groupUsers.map((d, j) => (
                                <div key={j} className="flex items-center gap-1.5 text-[11px] text-gray-500">
                                  <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                                    <svg className="w-2.5 h-2.5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-3.33 0-10 1.674-10 5v2h20v-2c0-3.326-6.67-5-10-5z"/>
                                    </svg>
                                  </div>
                                  <span className="truncate">{d.usersmodel?.username ?? d.userid ?? "-"}</span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {createPortal(
        <>
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
        </>,
        document.body
      )}
    </>
  );
}
