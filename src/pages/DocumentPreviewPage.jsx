import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import TitleTableModal from "../components/documents/TitleTableModal";

import { getDocumentDetailsByDocumentId } from "../services/documentdetailsservice";
import { useDocumentEditStore } from "../store/documentEditStore";

import PageShell from "../components/document-preview/PageShell";
import BelowBody from "../components/document-preview/BelowBody";
import ClosingContent from "../components/document-preview/ClosingContent";
import DocumentDetailsSidebar from "../components/document-preview/DocumentDetailsSidebar";
import DocumentActionBar from "../components/document-preview/DocumentActionBar";
import { useDocumentPagination } from "../hooks/useDocumentPagination";

export default function DocumentPreviewPage() {
  const location = useLocation();
  const docData = location.state?.document || {};

  const [showTitleTableModal, setShowTitleTableModal] = useState(false);
  const [titleTableSections, setTitleTableSections] = useState([]);
  const [reqTo, setReqTo] = useState(docData.req_to || "");
  const [reqReason, setReqReason] = useState(docData.req_reason || "");
  const [references, setReferences] = useState(docData.references || [""]);
  const [bodyParagraph, setBodyParagraph] = useState(docData.body_paragraph || "");
  const [remark, setRemark] = useState(docData.remark || "");
  const [documentDetails, setDocumentDetails] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(!!docData.rqdid);
  const [selectedDetailId, setSelectedDetailId] = useState(null);
  const [extraPages, setExtraPages] = useState([]);
  const printRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  const {
    bodyChunks,
    setBodyChunks,
    tablePageChunks,
    page1Ref,
    body1Ref,
    belowBodyMeasureRef,
    closingMeasureRef,
    measureRef,
    overflowPageRefs,
    extraPageRefs
  } = useDocumentPagination({
    bodyParagraph,
    titleTableSections,
    reqTo,
    reqReason,
    references,
    remark
  });

  const {
    edits,
    setReqTo: storeSetReqTo,
    setReqReason: storeSetReqReason,
    setReferences: storeSetReferences,
    setBodyParagraph: storeSetBodyParagraph,
    setRemark: storeSetRemark,
    setTitleTableSections: storeSetTitleTableSections,
    setExtraPages: storeSetExtraPages,
  } = useDocumentEditStore();

  // ── Detail selection ──────────────────────────────────────────────────────────
  const handleSelectDetail = (detail) => {
    if (selectedDetailId === detail.rddid) {
      setSelectedDetailId(null);
      setReqReason(docData.req_reason || "");
      setReqTo(docData.req_to || "");
      setReferences(docData.references || [""]);
      setBodyParagraph(docData.body_paragraph || "");
      setRemark(docData.remark || "");
      setTitleTableSections([]);
      setExtraPages([]);
    } else {
      setSelectedDetailId(detail.rddid);
      const e = edits[detail.rddid] || {};
      setReqReason(e.reqReason !== undefined ? e.reqReason : detail.req_title || "");
      setReqTo(e.reqTo !== undefined ? e.reqTo : detail.req_subtitle || "");
      setReferences(e.references !== undefined ? e.references : detail.references || docData.references || [""]);
      setBodyParagraph(e.bodyParagraph !== undefined ? e.bodyParagraph : detail.req_moreinfo || "");
      setRemark(e.remark !== undefined ? e.remark : "");
      setTitleTableSections(e.titleTableSections !== undefined ? e.titleTableSections : []);
      setExtraPages(e.extraPages !== undefined ? e.extraPages : []);
    }
  };

  // ── Fetch document details ────────────────────────────────────────────────────
  useEffect(() => {
    if (!docData.rqdid) return;
    getDocumentDetailsByDocumentId(String(docData.rqdid))
      .then((res) => setDocumentDetails(res.data_id?.data || []))
      .catch((err) => console.error("Failed to fetch document details:", err))
      .finally(() => setLoadingDetails(false));
  }, [docData.rqdid]);

  // ── Auto-resize textareas ─────────────────────────────────────────────────────
  useEffect(() => {
    window.document.querySelectorAll("textarea").forEach((ta) => {
      ta.style.height = "auto";
      ta.style.height = ta.scrollHeight + "px";
    });
  }, [reqTo, reqReason, references, bodyParagraph, remark, selectedDetailId, bodyChunks]);

  // (Print handlers removed — textareas keep their on-screen heights during print)

  // ── Body change handlers ──────────────────────────────────────────────────────
  const handleBodyChange = (chunkIdx, newChunkValue) => {
    const newChunks = [...bodyChunks];
    newChunks[chunkIdx] = newChunkValue;
    const newFull = newChunks.join("");
    setBodyParagraph(newFull);
    if (selectedDetailId) storeSetBodyParagraph(selectedDetailId, newFull);
  };

  const handleBodyKeyDown = (e, chunkIdx) => {
    if (e.key !== "Tab") return;
    e.preventDefault();
    const start = e.target.selectionStart;
    const end = e.target.selectionEnd;
    const spaces = "        ";
    const chunk = bodyChunks[chunkIdx] || "";
    handleBodyChange(chunkIdx, chunk.substring(0, start) + spaces + chunk.substring(end));
    requestAnimationFrame(() => { e.target.selectionStart = e.target.selectionEnd = start + spaces.length; });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "......./......./.......";
    const [y, m, d] = dateStr.split(" ")[0].split("-");
    return `${d}/${m}/${y}`;
  };

  const lastChunkIdx = bodyChunks.length - 1;
  const closingProps = { remark, setRemark, selectedDetailId, storeSetRemark };
  const belowBodyProps = {
    titleTableSections, remark, setRemark,
    selectedDetailId, storeSetRemark,
    onOpenTitleTable: () => setShowTitleTableModal(true),
  };

  return (
    <div className="min-h-screen bg-gray-100 print:bg-white print:min-h-0">

      {/* Hidden measurement div */}
      <div ref={measureRef} aria-hidden="true"
        className="print:hidden"
        style={{ position: "absolute", left: "-9999px", top: 0, visibility: "hidden", pointerEvents: "none" }} />

      {/* Off-screen below-body clone for height measurement */}
      <div ref={belowBodyMeasureRef} aria-hidden="true"
        className="print:hidden text-sm text-gray-800 space-y-0.5 leading-relaxed"
        style={{ position: "absolute", left: "-9999px", top: 0, visibility: "hidden", pointerEvents: "none", width: "174mm" }}>
        <BelowBody {...belowBodyProps} interactive={false} />
      </div>

      {/* Off-screen closing content clone for height measurement */}
      <div ref={closingMeasureRef} aria-hidden="true"
        className="print:hidden text-sm text-gray-800 space-y-0.5 leading-relaxed"
        style={{ position: "absolute", left: "-9999px", top: 0, visibility: "hidden", pointerEvents: "none", width: "174mm" }}>
        <ClosingContent {...closingProps} interactive={false} />
      </div>

      <DocumentActionBar onPrint={handlePrint} />

      <div className="flex items-start gap-6 px-6 print:block print:px-0">

        {/* ══════════════════ LEFT: Pages ══════════════════ */}
        <div ref={printRef} className="flex-1 flex flex-col gap-6 print:gap-0">

          {/* ════ PAGE 1 ════ */}
          <div className="max-w-[210mm] mx-auto w-full bg-white shadow-lg print:shadow-none print:mx-0 print:max-w-none print:p-0"
            style={{ fontFamily: "'TimesDoc', 'Phetsarath', sans-serif" }}>
            <PageShell pageRef={page1Ref} isFirstPage extraClass="">
              <div data-content-area className="pt-2 h-full overflow-hidden print:overflow-hidden">
                {/* Doc number + date */}
                <div className="flex items-start justify-between text-sm text-black mb-1 ml-22 -mt-2.5">
                  <p>ຝ່າຍໃດໜຶ່ງ</p>
                  <div className="text-right">
                    <p>ເລກທີ:{docData.req_no || "ອກ"}</p>
                    <p>ນະຄອນຫຼວງວຽງຈັນ, ວັນທີ:{formatDate(docData.createdate)}</p>
                  </div>
                </div>

                <h1 className="text-center text-xl font-bold text-black mt-1 mb-2">ໃບສະເໜີ</h1>

                <div className="text-sm text-gray-800 space-y-0.5 leading-relaxed">
                  {/* ຮຽນ */}
                  <div className="flex">
                    <span className="font-bold text-black whitespace-nowrap">ຮຽນ :&nbsp;</span>
                    <textarea value={reqTo}
                      onChange={(e) => { setReqTo(e.target.value); if (selectedDetailId) storeSetReqTo(selectedDetailId, e.target.value); }}
                      placeholder="ພິມຊື່ຜູ້ຮັບ..." rows={1}
                      onInput={(e) => { e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; }}
                      className="flex-1 border-none outline-none bg-transparent text-gray-800 resize-none overflow-hidden break-all print:p-0" />
                  </div>

                  {/* ເລື່ອງ */}
                  <div className="flex">
                    <span className="font-bold text-black whitespace-nowrap">ເລື່ອງ :&nbsp;</span>
                    <textarea value={reqReason}
                      onChange={(e) => { setReqReason(e.target.value); if (selectedDetailId) storeSetReqReason(selectedDetailId, e.target.value); }}
                      placeholder="ພິມເລື່ອງ..." rows={1}
                      onInput={(e) => { e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; }}
                      className="flex-1 border-none outline-none bg-transparent text-gray-800 resize-none overflow-hidden break-all print:p-0" />
                  </div>

                  {/* ອີງຕາມ */}
                  <div>
                    <ul className="list-none space-y-1">
                      {references.map((item, index) => (
                        <li key={index} className="relative before:content-['-'] before:absolute before:left-[-16px] flex items-start">
                          <span className="whitespace-nowrap">ອີງຕາມ :&nbsp;</span>
                          <textarea value={item}
                            onChange={(e) => {
                              const updated = [...references]; updated[index] = e.target.value;
                              setReferences(updated); if (selectedDetailId) storeSetReferences(selectedDetailId, updated);
                            }}
                            placeholder="ພິມອີງຕາມ..." rows={1}
                            onInput={(e) => { e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; }}
                            className="flex-1 border-none outline-none bg-transparent text-gray-800 resize-none overflow-hidden break-all print:p-0" />
                          {references.length > 1 && (
                            <button onClick={() => {
                              const updated = references.filter((_, i) => i !== index);
                              setReferences(updated); if (selectedDetailId) storeSetReferences(selectedDetailId, updated);
                            }} className="text-red-400 hover:text-red-600 ml-1 print:hidden">✕</button>
                          )}
                        </li>
                      ))}
                    </ul>
                    <button onClick={() => {
                      const updated = [...references, ""];
                      setReferences(updated); if (selectedDetailId) storeSetReferences(selectedDetailId, updated);
                    }} className="text-blue-500 hover:text-blue-700 text-xs mt-1 print:hidden">
                      + ເພີ່ມອີງຕາມ
                    </button>
                  </div>

                  {/* Body chunk 0 */}
                  <div>
                    <textarea ref={body1Ref}
                      value={bodyChunks[0] ?? ""}
                      onChange={(e) => handleBodyChange(0, e.target.value)}
                      onKeyDown={(e) => handleBodyKeyDown(e, 0)}
                      placeholder="ພິມເນື້ອໃນ..." rows={3}
                      onInput={(e) => { e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; }}
                      style={{ textIndent: "1.6rem" }}
                      className="w-full border-none outline-none bg-transparent text-gray-800 resize-none overflow-hidden break-all print:p-0" />
                  </div>

                  {bodyChunks.length === 1 && (
                    tablePageChunks.length === 0
                      ? <BelowBody {...belowBodyProps} />
                      : (tablePageChunks[0] && tablePageChunks[0].length > 0)
                        ? <BelowBody
                          {...belowBodyProps}
                          partialSections={tablePageChunks[0]}
                          showClosing={tablePageChunks.length === 1}
                        />
                        : null
                  )}
                </div>
              </div>
            </PageShell>
          </div>

          {/* ════ OVERFLOW PAGES ════ */}
          {bodyChunks.length > 1 && bodyChunks.slice(1).map((chunk, idx) => {
            const chunkIdx = idx + 1;
            const isLastChunk = chunkIdx === lastChunkIdx;
            const pageNumber = chunkIdx + 1;
            return (
              <div key={chunkIdx}
                className="max-w-[210mm] mx-auto w-full bg-white shadow-lg print:shadow-none print:mx-0 print:max-w-none print:p-0"
                style={{ fontFamily: "'TimesDoc', 'Phetsarath', sans-serif" }}>
                <PageShell pageRef={(el) => { overflowPageRefs.current[idx] = el; }} extraClass="">
                  <div className="pt-2 h-full overflow-hidden print:overflow-hidden">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400 print:text-transparent">ໜ້າ {pageNumber} (ຕໍ່)</span>
                    </div>
                    <div className="text-sm text-gray-800 space-y-0.5 leading-relaxed">
                      <div>
                        <textarea
                          value={chunk}
                          onChange={(e) => handleBodyChange(chunkIdx, e.target.value)}
                          onKeyDown={(e) => handleBodyKeyDown(e, chunkIdx)}
                          placeholder="(ເນື້ອໃນຕໍ່)..." rows={1}
                          onInput={(e) => { e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; }}
                          className="w-full border-none outline-none bg-transparent text-gray-800 resize-none overflow-hidden break-all print:p-0" />
                      </div>
                      {isLastChunk && (
                        tablePageChunks.length === 0
                          ? <BelowBody {...belowBodyProps} />
                          : (tablePageChunks[0] && tablePageChunks[0].length > 0)
                            ? <BelowBody
                              {...belowBodyProps}
                              partialSections={tablePageChunks[0]}
                              showClosing={tablePageChunks.length === 1}
                            />
                            : null
                      )}
                    </div>
                  </div>
                </PageShell>
              </div>
            );
          })}

          {/* ════ TABLE CONTINUATION PAGES ════ */}
          {tablePageChunks.length > 1 && tablePageChunks.slice(1).map((sections, idx) => {
            const isLastTablePage = idx === tablePageChunks.length - 2;
            const pageNumber = bodyChunks.length + 1 + idx;
            return (
              <div key={"table-" + idx}
                className="max-w-[210mm] mx-auto w-full bg-white shadow-lg print:shadow-none print:mx-0 print:max-w-none print:p-0"
                style={{ fontFamily: "'TimesDoc', 'Phetsarath', sans-serif" }}>
                <PageShell extraClass="">
                  <div className="pt-2 h-full overflow-hidden print:overflow-hidden">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400 print:text-transparent">ໜ້າ {pageNumber} (ຕໍ່)</span>
                    </div>
                    <div className="text-sm text-gray-800 space-y-0.5 leading-relaxed">
                      <BelowBody
                        {...belowBodyProps}
                        partialSections={sections}
                        showClosing={isLastTablePage}
                      />
                    </div>
                  </div>
                </PageShell>
              </div>
            );
          })}

          {/* ════ Add extra page ════ */}
          <div className="print:hidden flex justify-center max-w-[210mm] mx-auto w-full">
            <button
              onClick={() => {
                const updated = [...extraPages, { id: Date.now(), body: "" }];
                setExtraPages(updated); if (selectedDetailId) storeSetExtraPages(selectedDetailId, updated);
              }}
              className="flex items-center gap-2 text-[#0F75BC] border-2 border-dashed border-[#0F75BC] px-4 py-2 rounded-lg text-sm hover:bg-blue-50 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              ເພີ່ມໜ້າ
            </button>
          </div>

          {/* ════ Manual extra pages ════ */}
          {extraPages.map((page, idx) => (
            <div key={page.id}
              className="max-w-[210mm] mx-auto w-full bg-white shadow-lg print:shadow-none print:mx-0 print:max-w-none print:p-0"
              style={{ fontFamily: "'TimesDoc', 'Phetsarath', sans-serif" }}>
              <PageShell pageRef={(el) => { extraPageRefs.current[page.id] = el; }} extraClass="">
                <div className="pt-2 h-full overflow-hidden print:overflow-hidden">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400 print:text-transparent">ໜ້າ {bodyChunks.length + tablePageChunks.length + idx}</span>
                    <button
                      onClick={() => {
                        const updated = extraPages.filter((_, i) => i !== idx);
                        setExtraPages(updated); if (selectedDetailId) storeSetExtraPages(selectedDetailId, updated);
                      }}
                      className="text-red-400 hover:text-red-600 text-sm print:hidden">
                      ລົບໜ້ານີ້
                    </button>
                  </div>
                  <div className="text-sm text-gray-800 leading-relaxed">
                    <textarea
                      ref={(el) => { extraPageRefs.current[page.id] = el; }}
                      value={page.body}
                      onChange={(e) => {
                        const updated = extraPages.map((p, i) => i === idx ? { ...p, body: e.target.value } : p);
                        setExtraPages(updated); if (selectedDetailId) storeSetExtraPages(selectedDetailId, updated);
                      }}
                      placeholder="ພິມເນື້ອໃນ..." rows={10}
                      onInput={(e) => { e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; }}
                      onKeyDown={(e) => {
                        if (e.key !== "Tab") return;
                        e.preventDefault();
                        const start = e.target.selectionStart; const end = e.target.selectionEnd;
                        const spaces = "        ";
                        const newValue = page.body.substring(0, start) + spaces + page.body.substring(end);
                        const updated = extraPages.map((p, i) => i === idx ? { ...p, body: newValue } : p);
                        setExtraPages(updated); if (selectedDetailId) storeSetExtraPages(selectedDetailId, updated);
                        requestAnimationFrame(() => { e.target.selectionStart = e.target.selectionEnd = start + spaces.length; });
                      }}
                      style={{ textIndent: "1.6rem" }}
                      className="w-full border-none outline-none bg-transparent text-gray-800 resize-none overflow-hidden break-all print:p-0" />
                  </div>
                </div>
              </PageShell>
            </div>
          ))}

        </div>

        {/* ══════════════════ RIGHT: Details panel ══════════════════ */}
        <DocumentDetailsSidebar
          loadingDetails={loadingDetails}
          documentDetails={documentDetails}
          selectedDetailId={selectedDetailId}
          onSelectDetail={handleSelectDetail}
        />

      </div>

      <TitleTableModal
        isOpen={showTitleTableModal}
        onClose={() => setShowTitleTableModal(false)}
        onSave={(sections) => {
          setTitleTableSections(sections);
          if (selectedDetailId) storeSetTitleTableSections(selectedDetailId, sections);
        }}
        initialSections={titleTableSections}
      />
    </div>
  );
}
