import { useRef } from "react";

function PdfIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 shrink-0">
      <rect x="3" y="2" width="14" height="18" rx="1.5" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="0.5" />
      <path d="M13 2v5h5" fill="none" stroke="#9ca3af" strokeWidth="0.5" />
      <path d="M13 2l4 5H13V2z" fill="#d1d5db" />
      <text x="5" y="17" fontSize="5.5" fontWeight="bold" fill="#ef4444" fontFamily="Arial">PDF</text>
    </svg>
  );
}

function LvIcon({ status }) {
  if (status === "current") {
    return (
      <svg viewBox="0 0 22 22" className="w-6 h-6 shrink-0" fill="none">
        <circle cx="11" cy="11" r="10" fill="#dcfce7" />
        <path d="M6 11.5l3.5 3.5 6.5-7" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 22 22" className="w-6 h-6 shrink-0" fill="none">
      <circle cx="11" cy="11" r="10" fill="#dbeafe" />
      <path d="M11 7v4l2.5 2.5" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.5 15.5A6.5 6.5 0 1 1 11 17.5" stroke="#2563eb" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start gap-1 text-sm py-0.5">
      <span className="text-gray-500 shrink-0 w-24">{label}</span>
      <span className="text-gray-800 min-w-0">: {value || "-"}</span>
    </div>
  );
}

export default function DocumentInfoPanel({
  document = {},
  approvalLevels = [],
  attachments = [],
  onCancel,
  onEdit,
}) {
  const fileInputRef = useRef(null);

  return (
    <div className="flex flex-col gap-3">
      {/* Card */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-4 pt-4 pb-0">
          <div className="flex items-center gap-2 mb-3">
            <button onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 text-base font-semibold leading-none">
              &gt;
            </button>
            <h2 className="flex-1 text-center text-base font-bold text-gray-800 pr-5">
              ຂໍ້ມູນຜູ້ຮ້ອງຂໍ
            </h2>
          </div>
          <div className="border-b-2 border-[#0F75BC]" />
        </div>

        {/* Body */}
        <div className="px-4 py-3 space-y-1">
          {/* Info rows */}
          <InfoRow label="ເລກທີ່ຝ່າຍ" value={document.req_no ? `${document.req_no}/ອກ` : "-"} />
          <InfoRow label="ວ/ດ/ປ ສ້າງ" value={document.createdate} />
          <InfoRow label="ປະເພດ" value={document.doc_category_name || "ໃບສະເໜີ"} />
          <InfoRow label="ຫົວເລື່ອງ" value={document.req_reason} />
          <InfoRow label="ໝາຍເຫດ" value={document.remark} />

          {/* ເອກະສານແນບ */}
          {attachments.length > 0 && (
            <div className="flex items-start gap-1 text-sm py-0.5">
              <span className="text-gray-500 shrink-0 w-24">ເອກະສານແນບ</span>
              <div className="flex flex-col gap-1.5 min-w-0">
                {attachments.map((file, i) => {
                  const name = typeof file === "string" ? file : file.name;
                  const short = name.length > 18
                    ? name.substring(0, 12) + "...." + name.split(".").pop()
                    : name;
                  return (
                    <div key={i} className="flex items-center gap-1.5">
                      <PdfIcon />
                      <span className="text-gray-700 text-xs">{short}</span>
                    </div>
                  );
                })}
                <button onClick={() => fileInputRef.current?.click()}
                  className="text-[#0F75BC] text-xs hover:underline self-start mt-0.5">
                  + ເພີ່ມໄຟລ໌
                </button>
                <input ref={fileInputRef} type="file" multiple accept=".pdf,.doc,.docx,.png,.jpg"
                  className="hidden" />
              </div>
            </div>
          )}

          {attachments.length === 0 && (
            <div className="flex items-center gap-1 text-sm py-0.5">
              <span className="text-gray-500 shrink-0 w-24">ເອກະສານແນບ</span>
              <button onClick={() => fileInputRef.current?.click()}
                className="text-[#0F75BC] text-xs hover:underline">
                + ເພີ່ມໄຟລ໌
              </button>
              <input ref={fileInputRef} type="file" multiple accept=".pdf,.doc,.docx,.png,.jpg"
                className="hidden" />
            </div>
          )}

          {/* Approval levels */}
          {approvalLevels.length > 0 && (
            <div className="pt-1 space-y-1.5">
              {approvalLevels.map((lv) => (
                <div key={lv.level} className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500 w-10 shrink-0">Lv {lv.level}</span>
                  <LvIcon status={lv.status} />
                  <span className="text-gray-800">{lv.name}</span>
                </div>
              ))}
            </div>
          )}

          {/* ຄຳອະທິບາຍ */}
          {document.description && (
            <InfoRow label="ຄຳອະທິບາຍ" value={document.description} />
          )}
        </div>
      </div>

      {/* Buttons — outside the card */}
      <div className="flex gap-3">
        <button onClick={onCancel}
          className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm hover:bg-gray-50">
          ຍົກເລີກ
        </button>
        <button onClick={onEdit}
          className="flex-1 bg-[#0F75BC] text-white py-2.5 rounded-xl text-sm hover:bg-blue-700">
          ແກ້ໄຂ
        </button>
      </div>
    </div>
  );
}
