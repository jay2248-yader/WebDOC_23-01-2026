import { useState, useEffect, useCallback, useLayoutEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import TitleTableModal from "../components/documents/TitleTableModal";
import DocumentFormModal from "../components/documents/DocumentFormModal";
import { successFinishedDocument, uploadDocumentFile, getAllDocuments } from "../services/documentservice";
import { getDocumentDetailsByDocumentId } from "../services/documentdetailsservice";
import ApprovalFlowPanel from "../components/document-preview/ApprovalFlowPanel";
import { useDocumentEditStore } from "../store/documentEditStore";

import DocumentInfoPanel from "../components/documents/DocumentInfoPanel";
import DocumentActionBar from "../components/document-preview/DocumentActionBar";
import LoadingDialog from "../components/common/LoadingDialog";
import MeasurementClones from "../components/document-preview/MeasurementClones";
import Page1 from "../components/document-preview/Page1";
import BodyOverflowPages from "../components/document-preview/BodyOverflowPages";
import TableContinuationPages from "../components/document-preview/TableContinuationPages";
import RemarkOverflowPages from "../components/document-preview/RemarkOverflowPages";
import ExtraPages from "../components/document-preview/ExtraPages";

import { useDocumentPagination } from "../hooks/useDocumentPagination";
import { useApprovalDetails } from "../hooks/useApprovalDetails";
import { useSignatureGroups } from "../hooks/useSignatureGroups";
import { useDocumentEdits } from "../hooks/useDocumentEdits";
import { useBodyChunkEditor } from "../hooks/useBodyChunkEditor";
import {
  HEADER_HEIGHT_PX,
  FOOTER_HEIGHT_PX,
  COMPACT_HEADER_HEIGHT_PX,
  COMPACT_FOOTER_HEIGHT_PX,
} from "../components/document-preview/constants";
import capturePagesToPDF from "../utils/capturePagesToPDF";

export default function DocumentPreviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [docData, setDocData] = useState(() => location.state?.document || {});
  const rqdid = docData.rqdid;

  const [showTitleTableModal, setShowTitleTableModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [compactLevel, setCompactLevel] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const pagesContainerRef = useRef(null);
  const containerRef = useRef(null);

  const {
    titleTableSections, setTitleTableSections,
    reqTo, setReqTo,
    reqReason, setReqReason,
    references, setReferences,
    bodyParagraph, setBodyParagraph,
    remark, setRemark,
    extraPages, setExtraPages,
  } = useDocumentEdits(rqdid, docData);

  const { approvalDetails, loadingApproval, fetchApprovalDetails } = useApprovalDetails(rqdid);
  const signatureGroups = useSignatureGroups(docData.doccategoryid, approvalDetails);

  const headerH = HEADER_HEIGHT_PX - (HEADER_HEIGHT_PX - COMPACT_HEADER_HEIGHT_PX) * (compactLevel / 100);
  const footerH = FOOTER_HEIGHT_PX - (FOOTER_HEIGHT_PX - COMPACT_FOOTER_HEIGHT_PX) * (compactLevel / 100);

  // Inject @page rule via JS (ป้องกัน Tailwind strip)
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = "@page { size: A4; margin: 2mm; }";
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
    extraPageRefs,
  } = useDocumentPagination({
    bodyParagraph,
    titleTableSections,
    reqTo,
    reqReason,
    references,
    remark,
    headerHeight: headerH,
    footerHeight: footerH,
    visible: !docData.req_file || isEditing,
  });

  const {
    setReqTo: storeSetReqTo,
    setReqReason: storeSetReqReason,
    setReferences: storeSetReferences,
    setBodyParagraph: storeSetBodyParagraph,
    setRemark: storeSetRemark,
    setTitleTableSections: storeSetTitleTableSections,
    setExtraPages: storeSetExtraPages,
    clearEdit,
  } = useDocumentEditStore();

  const { handleBodyChange, handleBodyKeyDown, bodyTextareaRefs } = useBodyChunkEditor({
    bodyChunks,
    setBodyChunks,
    setBodyParagraph,
    rqdid,
    storeSetBodyParagraph,
    body1Ref,
  });

  // Upload main document file
  const handleUploadMainFile = useCallback(
    async (file) => {
      const res = await getDocumentDetailsByDocumentId(String(rqdid));
      const details = res.data_id?.data || [];
      const rddid = details[details.length - 1]?.rddid ?? rqdid;
      await uploadDocumentFile(file, rddid, rqdid);
      if (docData.statustype !== "SUCCESS") {
        await successFinishedDocument(rqdid);
      }
      const freshDocs = await getAllDocuments({ page: 1, limit: 1000 });
      const freshDoc = freshDocs.data.find((d) => String(d.rqdid) === String(rqdid));
      if (freshDoc) setDocData(freshDoc);
    },
    [rqdid, docData.statustype]
  );

  // Save: generate PDF → upload → successFinished
  const handleSaveDocument = useCallback(async () => {
    if (!pagesContainerRef.current || !rqdid) return;
    setPdfBusy(true);
    try {
      const blob = await capturePagesToPDF(pagesContainerRef.current);
      const file = new File([blob], `${docData.req_no || "document"}.pdf`, { type: "application/pdf" });
      const res = await getDocumentDetailsByDocumentId(String(rqdid));
      const details = res.data_id?.data || [];
      const rddid = details[details.length - 1]?.rddid ?? rqdid;
      await uploadDocumentFile(file, rddid, rqdid);
      if (docData.statustype !== "SUCCESS") {
        await successFinishedDocument(rqdid);
      }
      const freshDocs = await getAllDocuments({ page: 1, limit: 1000 });
      const freshDoc = freshDocs.data.find((d) => String(d.rqdid) === String(rqdid));
      if (freshDoc) setDocData(freshDoc);
      setIsEditing(false);
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setPdfBusy(false);
    }
  }, [rqdid, docData]);

  // Fetch fresh document data on mount (ป้องกัน location.state stale หลัง save/reload)
  useEffect(() => {
    const initRqdid = location.state?.document?.rqdid;
    if (!initRqdid) return;
    getAllDocuments({ page: 1, limit: 1000 })
      .then((res) => {
        const fresh = (res.data || []).find((d) => String(d.rqdid) === String(initRqdid));
        if (fresh) setDocData(fresh);
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-resize textareas (fire ก่อน paint → ไม่กระพริบ)
  useLayoutEffect(() => {
    containerRef.current?.querySelectorAll("textarea").forEach((ta) => {
      ta.style.height = "auto";
      ta.style.height = ta.scrollHeight + "px";
    });
  }, [bodyChunks, remark, isEditing]);

  const openTitleTableModal = useCallback(() => setShowTitleTableModal(true), []);

  const remarkOverflowCount = remarkChunks ? Math.max(0, remarkChunks.length - 1) : 0;
  const renderedPageCount =
    bodyChunks.length + Math.max(0, tablePageChunks.length - 1) + remarkOverflowCount;
  const creatorName = docData.createBy?.username || "";

  const closingProps = useMemo(
    () => ({ remark, setRemark, storeKey: rqdid, storeSetRemark, creatorName, signatureGroups }),
    [remark, rqdid, storeSetRemark, creatorName, signatureGroups, setRemark]
  );
  const belowBodyProps = useMemo(
    () => ({
      titleTableSections,
      remark,
      setRemark,
      storeKey: rqdid,
      storeSetRemark,
      onOpenTitleTable: openTitleTableModal,
      creatorName,
      signatureGroups,
    }),
    [titleTableSections, remark, rqdid, storeSetRemark, openTitleTableModal, creatorName, signatureGroups, setRemark]
  );

  // Props เพิ่มเติมสำหรับ remark split
  const remarkSplitProps = remarkChunks
    ? { remarkOverride: remarkChunks[0], showSignature: remarkChunks.length === 1 }
    : {};

  return (
    <div ref={containerRef} className="min-h-screen bg-gray-100 print:bg-white print:min-h-0 -m-5 print:m-0">
      <LoadingDialog isOpen={pdfBusy} message="ກຳລັງບັນທຶກເອກະສານ..." />

      <MeasurementClones
        measureRef={measureRef}
        belowBodyMeasureRef={belowBodyMeasureRef}
        closingMeasureRef={closingMeasureRef}
        belowBodyProps={belowBodyProps}
        closingProps={closingProps}
      />

      <div className="flex items-start gap-6 px-6 pt-4 print:block print:px-0 print:pt-0 print:gap-0">
        {/* LEFT: Back button + ApprovalFlowPanel */}
        <div className="print:hidden w-72  shrink-0 sticky  self-start max-h-[calc(100vh-4rem)] overflow-y-auto flex flex-col gap-3">
          <button
            onClick={() => navigate(-1)}
            style={{ boxShadow: "0 0 0 2px #bfdbfe, 0 4px 10px rgba(0, 10, 31, 0.15)" }}
            className="ml-1 mt-1 group inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white text-[#0F75BC] text-sm font-semibold transition-all duration-200 hover:bg-[#0F75BC] hover:text-white hover:gap-3 w-fit"
          >
            <svg className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
            ກັບຄືນ
          </button>
          <ApprovalFlowPanel
            docData={docData}
            approvalItems={approvalDetails}
            loading={loadingApproval}
            onApproved={() => {
              fetchApprovalDetails();
              if (rqdid) clearEdit(rqdid);
            }}
          />
        </div>

        {/* CENTER: Pages / PDF */}
        <div className="flex-1 flex flex-col gap-4 print:gap-0">
          {docData.req_file && !isEditing && (
            <iframe
              src={`http://30.30.1.222:65533/${docData.req_file}`}
              className="w-full rounded-lg shadow-lg bg-white"
              style={{ height: "calc(100vh - 80px)", minHeight: 500 }}
              title={docData.req_file}
            />
          )}
          {(!docData.req_file || isEditing) && (
            <div ref={pagesContainerRef}>
              <div className="print:hidden max-w-[210mm] mx-auto w-full relative h-0">
                <button
                  onClick={() => window.print()}
                  title="ພິມເອກະສານ"
                  className="absolute top-4 right-4 z-20 inline-flex items-center justify-center h-14 w-14 rounded-full bg-white text-[#466FEA] hover:bg-[#466FEA] hover:text-white transition-all"
                  style={{
                    boxShadow: "0 0 0 3px #466FEA, 0 6px 12px rgba(0, 10, 31, 0.45)",
                  }}
                >
                  <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                </button>
              </div>
              <Page1
                docData={docData}
                headerH={headerH}
                footerH={footerH}
                page1Ref={page1Ref}
                body1Ref={body1Ref}
                rqdid={rqdid}
                reqTo={reqTo}
                setReqTo={setReqTo}
                storeSetReqTo={storeSetReqTo}
                reqReason={reqReason}
                setReqReason={setReqReason}
                storeSetReqReason={storeSetReqReason}
                references={references}
                setReferences={setReferences}
                storeSetReferences={storeSetReferences}
                bodyChunks={bodyChunks}
                handleBodyChange={handleBodyChange}
                handleBodyKeyDown={handleBodyKeyDown}
                tablePageChunks={tablePageChunks}
                belowBodyProps={belowBodyProps}
                remarkSplitProps={remarkSplitProps}
              />

              <BodyOverflowPages
                bodyChunks={bodyChunks}
                headerH={headerH}
                footerH={footerH}
                overflowPageRefs={overflowPageRefs}
                bodyTextareaRefs={bodyTextareaRefs}
                handleBodyChange={handleBodyChange}
                handleBodyKeyDown={handleBodyKeyDown}
                tablePageChunks={tablePageChunks}
                belowBodyProps={belowBodyProps}
                remarkSplitProps={remarkSplitProps}
              />

              <TableContinuationPages
                tablePageChunks={tablePageChunks}
                headerH={headerH}
                footerH={footerH}
                belowBodyProps={belowBodyProps}
                remarkSplitProps={remarkSplitProps}
              />

              <RemarkOverflowPages
                remarkChunks={remarkChunks}
                headerH={headerH}
                footerH={footerH}
                closingProps={closingProps}
              />

              <ExtraPages
                extraPages={extraPages}
                setExtraPages={setExtraPages}
                rqdid={rqdid}
                storeSetExtraPages={storeSetExtraPages}
                headerH={headerH}
                footerH={footerH}
                extraPageRefs={extraPageRefs}
                renderedPageCount={renderedPageCount}
              />
            </div>
          )}
        </div>

        {/* RIGHT: Details panel */}
        <div className="print:hidden w-75 shrink-0 sticky  self-start flex flex-col gap-3">
          <DocumentInfoPanel
            document={docData}
            rqdid={rqdid}
            approvalLevels={signatureGroups.map((g, i) => ({
              level: i + 1,
              name: g.label,
              status: g.approverName ? "approved" : "pending",
            }))}
            onCancel={() => window.history.back()}
          />
          <DocumentActionBar
            compactLevel={compactLevel}
            onCompactLevelChange={setCompactLevel}
            reqFile={docData.req_file}
            isViewMode={!!(docData.req_file && !isEditing)}
            isEditing={isEditing}
            onToggleMode={() => setIsEditing((prev) => !prev)}
            rqdid={rqdid}
            onUploadFile={handleUploadMainFile}
          />
          {(docData.statustype === "ADD-DATA" || isEditing) && (
            <button onClick={handleSaveDocument} disabled={pdfBusy}
              className={`w-full text-white py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors
                ${pdfBusy ? "bg-blue-400 cursor-not-allowed" : "bg-[#0F75BC] hover:bg-blue-700"}`}>
              {pdfBusy ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  ກຳລັງບັນທຶກ...
                </>
              ) : "ບັນທຶກ"}
            </button>
          )}
        </div>
      </div>

      <TitleTableModal
        isOpen={showTitleTableModal}
        onClose={() => setShowTitleTableModal(false)}
        onSave={(sections) => {
          setTitleTableSections(sections);
          if (rqdid) storeSetTitleTableSections(rqdid, sections);
        }}
        initialSections={titleTableSections}
      />

      <DocumentFormModal
        key={docData?.rqdid || "edit"}
        isOpen={showEditModal}
        document={docData}
        onClose={() => setShowEditModal(false)}
        onSubmit={async () => {
          setShowEditModal(false);
          if (!rqdid) return;
          try {
            const res = await getAllDocuments({ page: 1, limit: 1000 });
            const fresh = (res.data || []).find((d) => String(d.rqdid) === String(rqdid));
            if (fresh) setDocData(fresh);
          } catch { /* ignore */ }
        }}
      />
    </div>
  );
}
