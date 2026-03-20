import { useState, useEffect, useCallback, useLayoutEffect, useMemo, useRef } from "react";

import { useLocation } from "react-router-dom";
import TitleTableModal from "../components/documents/TitleTableModal";

import { getDocumentDetailsByDocumentId } from "../services/documentdetailsservice";
import { useDocumentEditStore } from "../store/documentEditStore";

import PageShell from "../components/document-preview/PageShell";
import BelowBody from "../components/document-preview/BelowBody";
import ClosingContent from "../components/document-preview/ClosingContent";
import DocumentInfoPanel from "../components/documents/DocumentInfoPanel";
import DocumentActionBar from "../components/document-preview/DocumentActionBar";
import { useDocumentPagination } from "../hooks/useDocumentPagination";
import { HEADER_HEIGHT_PX, FOOTER_HEIGHT_PX, COMPACT_HEADER_HEIGHT_PX, COMPACT_FOOTER_HEIGHT_PX } from "../components/document-preview/constants";
import DocNumberRow from "../components/document-preview/DocNumberRow";

function formatDate(dateStr) {
  if (!dateStr) return "......./......./.......";
  const [y, m, d] = dateStr.split(" ")[0].split("-");
  return `${d}/${m}/${y}`;
}

export default function DocumentPreviewPage() {
  const location = useLocation();
  const docData = useMemo(() => location.state?.document || {}, [location.state]);

  const [showTitleTableModal, setShowTitleTableModal] = useState(false);
  const [titleTableSections, setTitleTableSections] = useState([]);
  const [reqTo, setReqTo] = useState(docData.req_to || "");
  const [reqReason, setReqReason] = useState(docData.req_reason || "");
  const [references, setReferences] = useState(docData.references || [""]);
  const [bodyParagraph, setBodyParagraph] = useState(docData.body_paragraph || "");
  const [remark, setRemark] = useState(docData.remark || "");
  const [documentDetails, setDocumentDetails] = useState([]);
  const [_loadingDetails, setLoadingDetails] = useState(!!docData.rqdid);
  const [selectedDetailId, setSelectedDetailId] = useState(null);
  const [extraPages, setExtraPages] = useState([]);
  const [compactLevel, setCompactLevel] = useState(0); // 0-100
  const headerH = HEADER_HEIGHT_PX - (HEADER_HEIGHT_PX - COMPACT_HEADER_HEIGHT_PX) * (compactLevel / 100);
  const footerH = FOOTER_HEIGHT_PX - (FOOTER_HEIGHT_PX - COMPACT_FOOTER_HEIGHT_PX) * (compactLevel / 100);
  const containerRef = useRef(null);
  const cursorStateRef = useRef({ chunkIdx: null, start: 0, end: 0 });
  const bodyTextareaRefs = useRef([]);

  // ── Inject @page rule via JS (ป้องกัน Tailwind strip) ──
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = "@page { size: A4; margin: 0; }";
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const {
    bodyChunks,
    setBodyChunks,
    tablePageChunks,
    remarkChunks,
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
    remark,
    headerHeight: headerH,
    footerHeight: footerH,
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
  const _handleSelectDetail = useCallback((detail) => {
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
  }, [selectedDetailId, docData, edits]);

  // ── Fetch document details ────────────────────────────────────────────────────
  useEffect(() => {
    if (!docData.rqdid) return;
    let mounted = true;
    getDocumentDetailsByDocumentId(String(docData.rqdid))
      .then((res) => { if (mounted) setDocumentDetails(res.data_id?.data || []); })
      .catch((err) => console.error("Failed to fetch document details:", err))
      .finally(() => { if (mounted) setLoadingDetails(false); });
    return () => { mounted = false; };
  }, [docData.rqdid]);

  // ── Auto-resize textareas ────────────────────────────────────────────────────
  // useLayoutEffect: fire ก่อน paint → ไม่มีการกระพริบ 1 แถว
  useLayoutEffect(() => {
    containerRef.current?.querySelectorAll("textarea").forEach((ta) => {
      ta.style.height = "auto";
      ta.style.height = ta.scrollHeight + "px";
    });
  }, [selectedDetailId, bodyChunks, remark]);

  // (Print handlers removed — textareas keep their on-screen heights during print)

  // ── Restore cursor after recalcChunks re-splits bodyChunks ──────────────────
  useLayoutEffect(() => {
    const { chunkIdx, start, end } = cursorStateRef.current;
    if (chunkIdx === null) return;
    const ta = chunkIdx === 0 ? body1Ref.current : bodyTextareaRefs.current[chunkIdx];
    if (!ta) return;
    ta.selectionStart = start;
    ta.selectionEnd = end;
  }, [bodyChunks, body1Ref]);

  // ── Body change handlers ──────────────────────────────────────────────────────
  const handleBodyChange = useCallback((chunkIdx, newChunkValue, cursorStart, cursorEnd) => {
    if (cursorStart !== undefined) {
      cursorStateRef.current = { chunkIdx, start: cursorStart, end: cursorEnd ?? cursorStart };
    }
    const newChunks = [...bodyChunks];
    newChunks[chunkIdx] = newChunkValue;
    setBodyChunks(newChunks);
    const newFull = newChunks.join("");
    setBodyParagraph(newFull);
    if (selectedDetailId) storeSetBodyParagraph(selectedDetailId, newFull);
  }, [bodyChunks, selectedDetailId, storeSetBodyParagraph, setBodyChunks]);

  const handleBodyKeyDown = useCallback((e, chunkIdx) => {
    if (e.key !== "Tab") return;
    e.preventDefault();
    const start = e.target.selectionStart;
    const end = e.target.selectionEnd;
    const spaces = "        ";
    const chunk = bodyChunks[chunkIdx] || "";
    const newPos = start + spaces.length;
    handleBodyChange(chunkIdx, chunk.substring(0, start) + spaces + chunk.substring(end), newPos, newPos);
    requestAnimationFrame(() => { e.target.selectionStart = e.target.selectionEnd = newPos; });
  }, [bodyChunks, handleBodyChange]);

  const openTitleTableModal = useCallback(() => setShowTitleTableModal(true), []);

  const lastChunkIdx = bodyChunks.length - 1;
  // จำนวนหน้าจริงที่ render ก่อน extra pages:
  // page1 + overflow pages + table continuation pages (slice(1) ไม่รวม chunk[0] ที่อยู่ใน body page สุดท้าย)
  const remarkOverflowCount = remarkChunks ? Math.max(0, remarkChunks.length - 1) : 0;
  const renderedPageCount = bodyChunks.length + Math.max(0, tablePageChunks.length - 1) + remarkOverflowCount;
  const closingProps = useMemo(() => ({ remark, setRemark, selectedDetailId, storeSetRemark }),
    [remark, selectedDetailId, storeSetRemark]);
  const belowBodyProps = useMemo(() => ({
    titleTableSections, remark, setRemark,
    selectedDetailId, storeSetRemark,
    onOpenTitleTable: openTitleTableModal,
  }), [titleTableSections, remark, selectedDetailId, storeSetRemark, openTitleTableModal]);

  // Props เพิ่มเติมสำหรับ remark split (ถ้า remarkChunks !== null)
  const remarkSplitProps = remarkChunks ? {
    remarkOverride: remarkChunks[0],
    showSignature: remarkChunks.length === 1,
  } : {};

  return (
    <div ref={containerRef} className="min-h-screen bg-gray-100 print:bg-white print:min-h-0">

      {/* Hidden measurement div */}
      <div ref={measureRef} aria-hidden="true"
        className="print:hidden"
        style={{ position: "absolute", left: "-9999px", top: 0, visibility: "hidden", pointerEvents: "none" }} />

      {/* Off-screen below-body clone for height measurement */}
      <div ref={belowBodyMeasureRef} aria-hidden="true"
        className="print:hidden text-sm text-gray-800 space-y-0.5 leading-relaxed"
        style={{ position: "absolute", left: "-9999px", top: 0, visibility: "hidden", pointerEvents: "none", width: "174mm", fontFamily: "'TimesDoc', 'Phetsarath', sans-serif" }}>
        <BelowBody {...belowBodyProps} interactive={false} />
      </div>

      {/* Off-screen closing content clone for height measurement */}
      <div ref={closingMeasureRef} aria-hidden="true"
        className="print:hidden text-sm text-gray-800 space-y-0.5 leading-relaxed"
        style={{ position: "absolute", left: "-9999px", top: 0, visibility: "hidden", pointerEvents: "none", width: "174mm", fontFamily: "'TimesDoc', 'Phetsarath', sans-serif" }}>
        <ClosingContent {...closingProps} interactive={false} />
      </div>

      <DocumentActionBar compactLevel={compactLevel} onCompactLevelChange={setCompactLevel} />

      <div className="flex items-start gap-6 px-6 print:block print:px-0">

        {/* ══════════════════ LEFT: Pages ══════════════════ */}
        <div className="flex-1 flex flex-col gap-6 print:gap-0">

          {/* ════ PAGE 1 ════ */}
          <div className="relative max-w-[210mm] mx-auto w-full bg-white shadow-lg print:shadow-none print:mx-0 print:max-w-none print:p-0"
            style={{ fontFamily: "'TimesDoc', 'Phetsarath', sans-serif" }}>
            {/* Doc number + date row — positioned over the decorative lines area */}
            <div style={{ position: "absolute", top: Math.round(0.52 * headerH + 20), left: 8, right: 8, zIndex: 15, pointerEvents: "none" }}>
              <DocNumberRow reqNo={docData.req_no} date={formatDate(docData.createdate)} />
            </div>
            <PageShell pageRef={page1Ref} isFirstPage extraClass="" headerH={headerH} footerH={footerH}>
              <div data-content-area className="h-full overflow-hidden print:overflow-hidden">
                <h1 className="text-center text-xl font-bold text-black mb-2"
                  style={{ marginTop: Math.max(4, Math.round(61 - 0.48 * headerH)) }}>ໃບສະເໜີ</h1>

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
                  <div className={references.every(r => !r.trim()) ? "print:hidden" : ""}>
                    <ul className="list-none space-y-1">
                      {references.map((item, index) => (
                        <li key={index} className="relative before:content-['-'] before:absolute before:-left-4 flex items-start">
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
                  <div className={!(bodyChunks[0] ?? "").trim() ? "print:hidden" : ""}>
                    <textarea ref={body1Ref}
                      value={bodyChunks[0] ?? ""}
                      onChange={(e) => handleBodyChange(0, e.target.value, e.target.selectionStart, e.target.selectionEnd)}
                      onKeyDown={(e) => handleBodyKeyDown(e, 0)}
                      placeholder="ພິມເນື້ອໃນ..." rows={3}
                      onInput={(e) => { e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; }}
                      style={{ textIndent: "1.6rem" }}
                      className="w-full border-none outline-none bg-transparent text-gray-800 resize-none overflow-hidden break-all print:p-0" />
                  </div>

                  {bodyChunks.length === 1 && (
                    tablePageChunks.length === 0
                      ? <BelowBody {...belowBodyProps} {...remarkSplitProps} />
                      : (tablePageChunks[0] && tablePageChunks[0].length > 0)
                        ? <BelowBody
                          {...belowBodyProps}
                          partialSections={tablePageChunks[0]}
                          showClosing={tablePageChunks.length === 1}
                          {...(tablePageChunks.length === 1 ? remarkSplitProps : {})}
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
            return (
              <div key={chunkIdx}
                className="max-w-[210mm] mx-auto w-full bg-white shadow-lg print:shadow-none print:mx-0 print:max-w-none print:p-0"
                style={{ fontFamily: "'TimesDoc', 'Phetsarath', sans-serif" }}>
                <PageShell pageRef={(el) => { overflowPageRefs.current[idx] = el; }} extraClass="" headerH={headerH} footerH={footerH}>
                  <div className="pt-2 h-full overflow-hidden print:overflow-hidden">

                    <div className="text-sm text-gray-800 space-y-0.5 leading-relaxed">
                      <div>
                        <textarea
                          ref={(el) => { bodyTextareaRefs.current[chunkIdx] = el; }}
                          value={chunk}
                          onChange={(e) => handleBodyChange(chunkIdx, e.target.value, e.target.selectionStart, e.target.selectionEnd)}
                          onKeyDown={(e) => handleBodyKeyDown(e, chunkIdx)}
                          placeholder="(ເນື້ອໃນຕໍ່)..." rows={1}
                          onInput={(e) => { e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; }}
                          className="w-full border-none outline-none bg-transparent text-gray-800 resize-none overflow-hidden break-all print:p-0" />
                      </div>
                      {isLastChunk && (
                        tablePageChunks.length === 0
                          ? <BelowBody {...belowBodyProps} {...remarkSplitProps} />
                          : (tablePageChunks[0] && tablePageChunks[0].length > 0)
                            ? <BelowBody
                              {...belowBodyProps}
                              partialSections={tablePageChunks[0]}
                              showClosing={tablePageChunks.length === 1}
                              {...(tablePageChunks.length === 1 ? remarkSplitProps : {})}
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
            return (
              <div key={"table-" + idx}
                className="max-w-[210mm] mx-auto w-full bg-white shadow-lg print:shadow-none print:mx-0 print:max-w-none print:p-0"
                style={{ fontFamily: "'TimesDoc', 'Phetsarath', sans-serif" }}>
                <PageShell extraClass="" headerH={headerH} footerH={footerH}>
                  <div className="pt-2 h-full overflow-hidden print:overflow-hidden">

                    <div className="text-sm text-gray-800 space-y-0.5 leading-relaxed">
                      <BelowBody
                        {...belowBodyProps}
                        partialSections={sections}
                        showClosing={isLastTablePage}
                        {...(isLastTablePage ? remarkSplitProps : {})}
                      />
                    </div>
                  </div>
                </PageShell>
              </div>
            );
          })}

          {/* ════ REMARK OVERFLOW PAGES ════ */}
          {remarkChunks && remarkChunks.length > 1 && remarkChunks.slice(1).map((rmChunk, idx) => {
            const isLastRemarkChunk = idx === remarkChunks.length - 2;
            return (
              <div key={"remark-" + idx}
                className="max-w-[210mm] mx-auto w-full bg-white shadow-lg print:shadow-none print:mx-0 print:max-w-none print:p-0"
                style={{ fontFamily: "'TimesDoc', 'Phetsarath', sans-serif" }}>
                <PageShell extraClass="" headerH={headerH} footerH={footerH}>
                  <div className="pt-2 h-full overflow-hidden print:overflow-hidden">

                    <div className="text-sm text-gray-800 space-y-0.5 leading-relaxed">
                      <ClosingContent
                        {...closingProps}
                        interactive={false}
                        remarkOverride={rmChunk}
                        showLabel={false}
                        showSignature={isLastRemarkChunk}
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
              <PageShell pageRef={(el) => { extraPageRefs.current[page.id] = el; }} extraClass="" headerH={headerH} footerH={footerH}>
                <div className="pt-2 h-full overflow-hidden print:overflow-hidden">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400 print:text-transparent">ໜ້າ {renderedPageCount + 1 + idx}</span>
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
        <div className="print:hidden w-75 shrink-0 sticky top-6 self-start">
          <DocumentInfoPanel
            document={docData}
            approvalLevels={documentDetails.map((d, i) => ({
              level: i + 1,
              name: d.req_title || "-",
              status: d.statustype === "APPROVED" ? "current" : "pending",
            }))}
            attachments={[]}
            onCancel={() => window.history.back()}
            onEdit={() => {}}
          />
        </div>

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
