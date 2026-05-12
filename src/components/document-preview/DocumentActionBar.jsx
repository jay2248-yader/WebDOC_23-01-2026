import { useRef, useState } from "react";
import { toast } from "../../store/toastStore";

export default function DocumentActionBar({ compactLevel = 0, onCompactLevelChange, reqFile, onUploadFile, isViewMode = false, onToggleMode }) {
    const fileInputRef = useRef(null);
    const [uploadStatus, setUploadStatus] = useState("idle"); // idle | uploading | done | error

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file || !onUploadFile) return;
        setUploadStatus("uploading");
        try {
            await onUploadFile(file);
            setUploadStatus("done");
            setTimeout(() => setUploadStatus("idle"), 2000);
        } catch (err) {
            toast.error(err?.message || "ອັບໂຫຼດໄຟລ໌ບໍ່ສຳເລັດ");
            setUploadStatus("error");
            setTimeout(() => setUploadStatus("idle"), 3000);
        }
    };

    return (
        <div className="print:hidden flex flex-col gap-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-3">

            {reqFile && onToggleMode && (
                <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
                    <button
                        onClick={() => !isViewMode && onToggleMode()}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 transition-colors
                            ${isViewMode ? "bg-[#0F75BC] text-white font-medium" : "bg-white text-gray-500 hover:bg-gray-50"}`}
                    >
                        <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        ເບິ່ງ
                    </button>
                    <button
                        onClick={() => isViewMode && onToggleMode()}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 transition-colors
                            ${!isViewMode ? "bg-[#0F75BC] text-white font-medium" : "bg-white text-gray-500 hover:bg-gray-50"}`}
                    >
                        <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        ແກ້ໄຂ
                    </button>
                </div>
            )}

{/* Compact slider — แสดงเฉพาะตอนมีสิทธิ์แก้ (onCompactLevelChange ไม่ใช่ null) */}
            {!isViewMode && onCompactLevelChange && <div className="flex flex-col gap-1 px-3 py-2">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Header/Footer</span>
                    <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500">{compactLevel}%</span>
                        {compactLevel > 0 && (
                            <button
                                onClick={() => onCompactLevelChange?.(0)}
                                className="text-xs text-gray-400 hover:text-gray-600 ml-1"
                                title="Reset"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>
                <input
                    type="range"
                    min={0}
                    max={100}
                    value={compactLevel}
                    onChange={(e) => onCompactLevelChange?.(Number(e.target.value))}
                    className="w-full accent-[#0F75BC] cursor-pointer"
                />
            </div>}

            {onUploadFile && (
                <>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadStatus === "uploading"}
                        className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm w-full transition-colors
                            ${uploadStatus === "uploading" ? "bg-gray-100 text-gray-400 cursor-not-allowed" :
                              uploadStatus === "done"      ? "bg-green-50 border border-green-300 text-green-700" :
                              uploadStatus === "error"     ? "bg-red-50 border border-red-300 text-red-700" :
                              "bg-gray-50 border border-gray-300 text-gray-700 hover:bg-gray-100"}`}
                    >
                        {uploadStatus === "uploading" ? (
                            <>
                                <svg className="h-4 w-4 shrink-0 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                                </svg>
                                ກຳລັງອັບໂຫລດ...
                            </>
                        ) : uploadStatus === "done" ? (
                            <>
                                <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                                </svg>
                                ອັບໂຫລດສຳເລັດ
                            </>
                        ) : uploadStatus === "error" ? (
                            <>
                                <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                                ອັບໂຫລດຜິດພາດ
                            </>
                        ) : (
                            <>
                                <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
                                </svg>
                                ອັບໂຫລດໄຟລ໌
                            </>
                        )}
                    </button>
                </>
            )}

        </div>
    );
}
