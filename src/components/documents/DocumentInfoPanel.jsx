import { useRef, useState, useEffect, useCallback } from "react";
import {
  createDocumentDetails,
  getDocumentDetailsByDocumentId,
  uploadRequestImageDetails,
} from "../../services/documentdetailsservice";
import { toast } from "../../store/toastStore";
import { useAuthStore } from "../../store/authstore";

const FILE_BASE_URL = import.meta.env.VITE_FILE_BASE_URL;
const IMAGE_EXTS = ["png", "jpg", "jpeg", "gif", "webp"];

// ── Icons ──────────────────────────────────────────────────────────────────────

function PdfIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 shrink-0">
      <rect x="3" y="2" width="14" height="18" rx="1.5" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="0.5" />
      <path d="M13 2v5h5" fill="none" stroke="#9ca3af" strokeWidth="0.5" />
      <path d="M13 2l4 5H13V2z" fill="#d1d5db" />
      <text x="5" y="17" fontSize="5.5" fontWeight="bold" fill="#ef4444" fontFamily="Arial">PDF</text>
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 shrink-0">
      <rect x="3" y="3" width="18" height="18" rx="2" fill="#dbeafe" stroke="#93c5fd" strokeWidth="0.8" />
      <circle cx="8.5" cy="8.5" r="1.5" fill="#60a5fa" />
      <path d="M3 15l5-5 4 4 3-3 6 5" stroke="#60a5fa" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-gray-400" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  );
}

// ── Helper components ──────────────────────────────────────────────────────────

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start gap-2 py-0.5 text-sm">
      <span className="text-gray-500 shrink-0 w-24 leading-snug">{label}</span>
      <span className="text-gray-400 shrink-0">:</span>
      <span className="text-gray-800 leading-snug min-w-0 break-all">{value || "-"}</span>
    </div>
  );
}

function ExistingFileRow({ filename, status, onReplace }) {
  const ext = filename.split(".").pop().toLowerCase();
  const isImage = IMAGE_EXTS.includes(ext);
  const shortName = filename.length > 20 ? filename.substring(0, 13) + "…." + ext : filename;
  const url = `${FILE_BASE_URL}/${filename}`;
  return (
    <div className="flex items-center gap-2 py-1">
      {isImage ? <ImageIcon /> : <PdfIcon />}
      <div className="flex-1 min-w-0">
        <a href={url} target="_blank" rel="noreferrer"
          className="text-xs text-[#0F75BC] hover:underline truncate block">
          {shortName}
        </a>
        {status === "uploading"
          ? <p className="text-xs text-blue-500">ກຳລັງອັບໂຫລດ...</p>
          : status === "done"
          ? <p className="text-xs text-green-600">ອັບໂຫລດແລ້ວ ✓</p>
          : status === "error"
          ? <p className="text-xs text-red-500">ຜິດພາດ</p>
          : <p className="text-xs text-green-600">ອັບໂຫລດແລ້ວ</p>
        }
      </div>
      {onReplace && (
        <button onClick={onReplace}
          disabled={status === "uploading"}
          className="text-xs text-gray-400 hover:text-[#0F75BC] shrink-0 disabled:opacity-40">
          ແກ້ໄຂ
        </button>
      )}
    </div>
  );
}

function NewFileRow({ file, status, error, onRemove }) {
  const ext = file.name.split(".").pop().toLowerCase();
  const isImage = IMAGE_EXTS.includes(ext);
  const shortName = file.name.length > 20 ? file.name.substring(0, 13) + "…." + ext : file.name;
  return (
    <div className="flex items-center gap-2 py-1">
      {isImage ? <ImageIcon /> : <PdfIcon />}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-700 truncate">{shortName}</p>
        {status === "creating" && <p className="text-xs text-gray-400">ກຳລັງສ້າງ...</p>}
        {status === "uploading" && <p className="text-xs text-blue-500">ກຳລັງອັບໂຫລດ...</p>}
        {status === "done" && <p className="text-xs text-green-600">ສຳເລັດ</p>}
        {status === "error" && <p className="text-xs text-red-500 truncate">{error || "ຜິດພາດ"}</p>}
      </div>
      {(status === "done" || status === "error") && (
        <button onClick={onRemove} className="text-gray-300 hover:text-red-400 shrink-0 text-sm leading-none">✕</button>
      )}
    </div>
  );
}

function formatCreateDate(dateStr) {
  if (!dateStr) return "-";
  return dateStr.replace("T", " ").split(".")[0];
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function DocumentInfoPanel({
  document = {},
  rqdid,
}) {
  const fileInputRef = useRef(null);
  const replaceInputRef = useRef(null);
  const replacingRddidRef = useRef(null);
  const [items, setItems] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [existingFiles, setExistingFiles] = useState([]);

  // เช็คสิทธิ์: เฉพาะคนที่สร้างเอกะสารถึงจะแนบไฟล์ได้
  const currentUserId = useAuthStore((s) => s.user?.usid);
  const canEdit = currentUserId != null && document.createby != null
    && String(document.createby) === String(currentUserId);
  const [replaceStatus, setReplaceStatus] = useState({});

  const fetchExistingFiles = useCallback(() => {
    if (!rqdid) return;
    getDocumentDetailsByDocumentId(String(rqdid))
      .then((res) => {
        const details = res.data_id?.data || [];
        setExistingFiles(
          details.filter((d) => d.req_attachfile).map((d) => ({
            filename: d.req_attachfile,
            rddid: d.rddid,
          }))
        );
      })
      .catch(() => {});
  }, [rqdid]);

  useEffect(() => { fetchExistingFiles(); }, [rqdid, fetchExistingFiles]);

  const uploadSingleFile = async (file) => {
    const id = `${Date.now()}-${Math.random()}`;
    setItems((prev) => [...prev, { id, file, status: "creating", error: null }]);
    try {
      const ext = file.name.split(".").pop();
      const nameWithoutExt = file.name.replace(/\.[^.]+$/, "");
      const { rddid } = await createDocumentDetails({
        rqdid: String(rqdid),
        req_title: nameWithoutExt,
        req_subtitle: ext.toUpperCase(),
        req_moreinfo: "",
      });
      if (!rddid) throw new Error("ບໍ່ສາມາດຊອກຫາ rddid ຂອງ record ໃໝ່ໄດ້");
      setItems((prev) => prev.map((it) => it.id === id ? { ...it, status: "uploading" } : it));
      await uploadRequestImageDetails(rddid, file);
      setItems((prev) => prev.map((it) => it.id === id ? { ...it, status: "done" } : it));
    } catch (err) {
      setItems((prev) => prev.map((it) => it.id === id ? { ...it, status: "error", error: err.message } : it));
    }
  };

  const replaceFile = async (file, existingRddid) => {
    setReplaceStatus((prev) => ({ ...prev, [existingRddid]: "uploading" }));
    try {
      await uploadRequestImageDetails(existingRddid, file);
      setReplaceStatus((prev) => ({ ...prev, [existingRddid]: "done" }));
      fetchExistingFiles();
    } catch (err) {
      toast.error(err?.message || "ອັບໂຫຼດໄຟລ໌ບໍ່ສຳເລັດ");
      setReplaceStatus((prev) => ({ ...prev, [existingRddid]: "error" }));
    }
  };

  const handleReplaceClick = (existingRddid) => {
    replacingRddidRef.current = existingRddid;
    replaceInputRef.current?.click();
  };

  const handleReplaceInputChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file && replacingRddidRef.current) {
      replaceFile(file, replacingRddidRef.current);
    }
  };

  const handleFiles = (files) => {
    [...files].forEach(uploadSingleFile);
  };
  const handleInputChange = (e) => { if (e.target.files?.length) handleFiles(e.target.files); e.target.value = ""; };
  const handleDrop = (e) => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files); };

  return (
    <div className="flex flex-col gap-3">
      {/* Card */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="px-4 pt-4 pb-0">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="flex-1 text-center text-base font-bold text-gray-800">
              ຂໍ້ມູນຜູ້ຮ້ອງຂໍ
            </h2>
          </div>
          <div className="border-b-2 border-[#0F75BC]" />
        </div>

        {/* Info rows */}
        <div className="px-4 pt-3 pb-1 space-y-0.5">
          <InfoRow label="ເລກທີຝ່າຍ" value={document.req_no ? `${document.req_no}` : null} />
          <InfoRow label="ວັນທີສ້າງ" value={formatCreateDate(document.createdate)} />
          <InfoRow label="ປະເພດ" value={document.documentcategorymodel?.doccategoryname || document.doc_category_name || null} />
          <InfoRow label="ຫົວເລື່ອງ" value={document.req_reason || null} />
          <InfoRow
            label="ຈຳນວນເງິນ"
            value={
              document.totalmoney != null && document.totalmoney !== ""
                ? `${Number(document.totalmoney).toLocaleString("en-US")} ກີບ`
                : null
            }
          />
        </div>


        {/* Divider */}
        <div className="mx-4 border-t border-gray-100 mt-2" />

        {/* ເອກະສານແນບ section */}
        <div className="px-4 pt-3 pb-4">
          <p className="text-sm font-semibold text-gray-700 mb-2">ເອກະສານແນບ</p>

          {/* Drop zone — แสดงเฉพาะเจ้าของเอกะสาร */}
          {canEdit && (
            <>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed cursor-pointer py-4 transition-colors
                  ${dragging ? "border-[#0F75BC] bg-blue-50" : "border-gray-300 hover:border-[#0F75BC] hover:bg-blue-50"}`}
              >
                <UploadIcon />
                <p className="text-xs text-gray-500 text-center">
                  ລາກໄຟລ໌ ຫຼື <span className="text-[#0F75BC] font-medium">ຄລິກເລືອກ</span>
                </p>
                <p className="text-xs text-gray-400">PDF, PNG, JPG</p>
              </div>
              <input ref={fileInputRef} type="file" multiple accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                className="hidden" onChange={handleInputChange} />
              <input ref={replaceInputRef} type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                className="hidden" onChange={handleReplaceInputChange} />
            </>
          )}

          {/* Existing files — แสดงทุกคน แต่ปุ่ม "ແກ້ໄຂ" ขึ้นเฉพาะเจ้าของ */}
          {existingFiles.length > 0 && (
            <div className="mt-2 divide-y divide-gray-100">
              {existingFiles.map((f) => (
                <ExistingFileRow
                  key={f.filename}
                  filename={f.filename}
                  status={replaceStatus[f.rddid]}
                  onReplace={canEdit ? () => handleReplaceClick(f.rddid) : null}
                />
              ))}
            </div>
          )}

          {/* New uploads */}
          {items.length > 0 && (
            <div className="mt-2 divide-y divide-gray-100">
              {items.map((it) => (
                <NewFileRow key={it.id} file={it.file} status={it.status} error={it.error}
                  onRemove={() => setItems((prev) => prev.filter((x) => x.id !== it.id))} />
              ))}
            </div>
          )}

          {existingFiles.length === 0 && items.length === 0 && (
            <p className="text-xs text-gray-400 text-center mt-2">ຍັງບໍ່ມີໄຟລ໌ແນບ</p>
          )}
        </div>
      </div>

    </div>
  );
}
