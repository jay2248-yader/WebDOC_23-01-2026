import { useState, useRef } from "react";

export default function DocumentInfoPanel({ document, documentDetails = [], onCancel }) {
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setAttachedFiles((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    setAttachedFiles((prev) => [...prev, ...files]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeFile = (index) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-bold text-[#0F75BC] mb-4 border-b-2 border-[#0F75BC] pb-2">
          ຂໍ້ມູນຜູ້ຮ້ອງຂໍ
        </h2>

        <div className="space-y-3 text-sm">
          <div className="flex">
            <span className="text-gray-500 w-24 shrink-0">ເລກທີ່ນຳ</span>
            <span className="font-medium">: {documentDetails[0]?.requestdocumentmodel?.req_no || document.req_no || "-"}/ອກ</span>
          </div>
          <div className="flex">
            <span className="text-gray-500 w-24 shrink-0">ວ/ດ/ປ ສ້າງ</span>
            <span className="font-medium">: {document.createdate || "-"}</span>
          </div>
          <div className="flex">
            <span className="text-gray-500 w-24 shrink-0">ປະເພດ</span>
            <span className="font-medium">: {document.doc_category_name || "ໜັງສືສະເໜີ"}</span>
          </div>
          <div className="flex">
            <span className="text-gray-500 w-24 shrink-0">ຫົວເລື່ອງ</span>
            <span className="font-medium">: {document.req_reason || "-"}</span>
          </div>
          <div className="flex">
            <span className="text-gray-500 w-24 shrink-0">ໝາຍເຫດ</span>
            <span className="font-medium">: {document.remark || "-"}</span>
          </div>
        </div>

        {/* Approval Level */}
        <div className="mt-4 flex items-center gap-2 text-sm">
          <span className="bg-blue-100 text-[#0F75BC] px-2 py-0.5 rounded font-bold text-xs">
            Lv 2
          </span>
          <span className="text-gray-600">ຮອງຜູ້ອຳນວຍ</span>
        </div>

        {/* Attachments Section */}
        <div className="mt-6">
          <h3 className="text-sm font-bold text-gray-700 mb-3">ແນບເອກະສານ</h3>

          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragging
                ? "border-[#0F75BC] bg-blue-50"
                : "border-gray-300"
            }`}
          >
            <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-xs text-gray-500">choose a file or drag & drop it here</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 bg-[#0F75BC] text-white px-4 py-1.5 rounded-lg text-xs hover:bg-blue-700"
            >
              ເລືອກໄຟ
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.png,.jpg"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* File list */}
          {attachedFiles.length > 0 && (
            <div className="mt-3 space-y-2">
              {attachedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <svg className="h-4 w-4 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 18h12a2 2 0 002-2V8l-6-6H4a2 2 0 00-2 2v12a2 2 0 002 2zm8-14l4 4h-4V4z" />
                    </svg>
                    <span className="truncate text-gray-700">{file.name}</span>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-gray-400 hover:text-red-500 ml-2 shrink-0"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50"
          >
            ຍົກເລີກ
          </button>
          <button
            className="flex-1 bg-[#0F75BC] text-white py-2 rounded-lg text-sm hover:bg-blue-700"
          >
            ບັນທຶກ
          </button>
        </div>
      </div>
  );
}
