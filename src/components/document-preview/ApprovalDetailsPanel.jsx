import { useState } from "react";
import ApproveModal from "./ApproveModal";
import RejectModal from "./RejectModal";

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const [datePart, timePart] = dateStr.split(" ");
  const [y, m, d] = datePart.split("-");
  return `${d}/${m}/${y}${timePart ? " " + timePart.substring(0, 5) : ""}`;
}

function StatusBadge({ status }) {
  const map = {
    APPROVED: { label: "ອະນຸມັດແລ້ວ", bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
    PENDING:  { label: "ລໍຖ້າ",        bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-500" },
    REJECTED: { label: "ປະຕິເສດ",      bg: "bg-red-100",    text: "text-red-700",    dot: "bg-red-500" },
  };
  const s = map[status] ?? { label: status || "-", bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function ApprovalCard({ item, index }) {
  const rdm = item.requestdocumentmodel || {};
  const approveStatus = rdm.req_statusapprove;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
        <span className="text-xs font-semibold text-gray-500">ລຳດັບ {index + 1}</span>
        <StatusBadge status={approveStatus} />
      </div>
      <div className="px-3 py-2.5 space-y-1.5 text-sm">
        <Row label="ເລກທີ" value={item.req_no} />
        <Row label="ຜູ້ອະນຸມັດ" value={item.approveby ? `#${item.approveby}` : "-"} />
        <Row label="ຮຽນ" value={rdm.req_to} />
        <Row label="ເລື່ອງ" value={rdm.req_reason} />
        {item.get_descriptions && (
          <Row label="ໝາຍເຫດ" value={item.get_descriptions} />
        )}
        <Row label="ວັນທີ" value={formatDate(item.createdate)} />
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-start gap-1">
      <span className="text-gray-500 shrink-0 w-20">{label}</span>
      <span className="text-gray-800 min-w-0 break-words">: {value || "-"}</span>
    </div>
  );
}

export default function ApprovalDetailsPanel({ items = [], loading = false, docData = {}, onApproved }) {
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-4 pt-4 pb-0">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="flex-1 text-center text-base font-bold text-gray-800">
              ປະຫວັດການອະນຸມັດ
            </h2>
          </div>
          <div className="border-b-2 border-[#0F75BC]" />
        </div>

        {/* Body */}
        <div className="px-4 py-3">
          {loading ? (
            <div className="flex justify-center py-6">
              <div className="w-6 h-6 border-2 border-[#0F75BC] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-4">ບໍ່ມີຂໍ້ມູນ</p>
          ) : (
            <div className="space-y-2.5">
              {items.map((item, i) => (
                <ApprovalCard key={item.id ?? i} item={item} index={i} />
              ))}
            </div>
          )}
        </div>

        {/* Approve / Reject buttons */}
        <div className="px-4 pb-4 flex gap-2">
          <button
            onClick={() => setShowApproveModal(true)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
          >
            ອະນຸມັດ
          </button>
          <button
            onClick={() => setShowRejectModal(true)}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
          >
            ປະຕິເສດ
          </button>
        </div>
      </div>

      <ApproveModal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onApproved={() => { setShowApproveModal(false); onApproved?.(); }}
        docData={docData}
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
