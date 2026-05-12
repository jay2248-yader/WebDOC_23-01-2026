import { useState, useEffect, useCallback, useLayoutEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import TitleTableModal from "../components/documents/TitleTableModal";
import DocumentFormModal from "../components/documents/DocumentFormModal";
import DatatableHeaderModal from "../components/document-preview/DatatableHeaderModal";
import { successFinishedDocument, uploadDocumentFile, getAllDocuments, getDatatableHeaders, updateDatatableHeader, addDatatableHeader, getDatatables, addDatatable, updateDatatable } from "../services/documentservice";
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
import { useAuthStore } from "../store/authstore";

export default function DocumentPreviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [docData, setDocData] = useState(() => location.state?.document || {});
  const rqdid = docData.rqdid;

  const [showTitleTableModal, setShowTitleTableModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDatatableHeaderModal, setShowDatatableHeaderModal] = useState(false);
  const [compactLevel, setCompactLevel] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const pagesContainerRef = useRef(null);
  const containerRef = useRef(null);

  // ตรวจสอบสิทธิ์แก้ไข: เฉพาะ user ที่สร้างเอกะสารเท่านั้นถึงจะแก้ได้
  const currentUserId = useAuthStore((s) => s.user?.usid);
  const canEdit = currentUserId != null && docData.createby != null
    && String(docData.createby) === String(currentUserId);

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

  const [datatableHeaders, setDatatableHeaders] = useState([]);
  // forsItems: array of strings split from fors by " L2 ", for display/edit in Page1
  const [forsItems, setForsItems] = useState([]);
  const [datatableEdits, setDatatableEdits] = useState({});

  const fetchDatatableHeaders = useCallback(() => {
    if (!rqdid) return;
    getDatatableHeaders(rqdid)
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setDatatableHeaders(list);
        setDatatableEdits({});
        // Split fors by " L2 ", " L3 ", " L4 " in order
        const firstFors = list[0]?.fors ?? "";
        setForsItems(firstFors ? firstFors.split(/ L\d+ /) : [""]);
      })
      .catch((err) => console.error("[DatatableHeaders]", err));
  }, [rqdid]);
  useEffect(() => { fetchDatatableHeaders(); }, [fetchDatatableHeaders]);

  const handleDatatableHeaderChange = useCallback((ids, patch) => {
    setDatatableEdits((prev) => ({ ...prev, [ids]: { ...(prev[ids] || {}), ...patch } }));
  }, []);

  // forsItems handlers — add/remove/change individual fors lines
  const handleForsItemChange = useCallback((index, value) => {
    setForsItems((prev) => prev.map((v, i) => (i === index ? value : v)));
  }, []);

  const handleAddForsItem = useCallback(() => {
    setForsItems((prev) => [...prev, ""]);
  }, []);

  const handleDeleteForsItem = useCallback((index) => {
    setForsItems((prev) => prev.length > 1 ? prev.filter((_, i) => i !== index) : prev);
  }, []);

  const saveDirtyDatatableHeaders = useCallback(async () => {
    console.log("[saveDirtyDatatableHeaders] start", {
      statustype: docData.statustype,
      datatableHeadersLen: datatableHeaders.length,
      datatableHeaders,
      forsItems,
      datatableEdits,
      rqdid,
      currentUserId,
    });

    const original = datatableHeaders[0];
    const isSuccess = docData.statustype === "SUCCESS";
    // ADD-DATA → ADD, SUCCESS → UPDATE, อื่นๆ (default) → UPDATE
    const useAdd = !isSuccess && docData.statustype === "ADD-DATA";

    // ADD: header อาจยังไม่มีใน DB → ไม่ต้องมี original
    // UPDATE: ต้องมี original
    if (!original && !useAdd) {
      console.log("[saveDirtyDatatableHeaders] skip: no original and not ADD-DATA");
      return;
    }

    // fors: ถ้ามี header เดิม ใช้ forsItems (Page1 ใช้ array นี้)
    // ถ้าไม่มี (ADD-DATA ครั้งแรก) ใช้ references จาก useDocumentEdits
    const forsSource = forsItems.length > 0 ? forsItems : references;
    const filtered = (forsSource || []).filter((v) => v && v.trim());
    const mergedFors = filtered.reduce((acc, val, i) =>
      i === 0 ? val : `${acc} L${i + 1} ${val}`, "");

    const edit = (original && datatableEdits[original.ids]) || {};
    const mergedDetails = edit.details ?? original?.details ?? (bodyParagraph || "");
    const mergedNote = edit.note ?? original?.note ?? (remark || "");

    const payload = {
      rqdid: Number(original?.rqdid ?? rqdid),
      fors: mergedFors,
      details: mergedDetails,
      note: mergedNote,
      createby: String(original?.createby ?? currentUserId ?? ""),
    };

    console.log("[saveDirtyDatatableHeaders] payload", JSON.stringify(payload, null, 2), "→", useAdd ? "ADD" : "UPDATE");
    console.log("[saveDirtyDatatableHeaders] field types", {
      rqdid: typeof payload.rqdid,
      fors: typeof payload.fors,
      forsLen: payload.fors.length,
      details: typeof payload.details,
      detailsLen: payload.details.length,
      note: typeof payload.note,
      createby: typeof payload.createby,
    });

    try {
      if (useAdd) {
        const res = await addDatatableHeader(payload);
        console.log("[saveDirtyDatatableHeaders] addDatatableHeader OK", res);
      } else {
        const res = await updateDatatableHeader(payload);
        console.log("[saveDirtyDatatableHeaders] updateDatatableHeader OK", res);
      }
    } catch (err) {
      console.error("[saveDirtyDatatableHeaders] API error", {
        message: err?.message,
        status: err?.response?.status,
        responseData: err?.response?.data,
        responseText: err?.response?.statusText,
        sentPayload: payload,
      });
      throw err;
    }

    await fetchDatatableHeaders();
    console.log("[saveDirtyDatatableHeaders] done");
  }, [forsItems, datatableEdits, datatableHeaders, rqdid, currentUserId, fetchDatatableHeaders, docData.statustype, references, bodyParagraph, remark]);

  const headerH = HEADER_HEIGHT_PX - (HEADER_HEIGHT_PX - COMPACT_HEADER_HEIGHT_PX) * (compactLevel / 100);
  const footerH = FOOTER_HEIGHT_PX - (FOOTER_HEIGHT_PX - COMPACT_FOOTER_HEIGHT_PX) * (compactLevel / 100);

  // ในโหมด datatableHeaders เนื้อหา ໝາຍເຫດ จะถูกเก็บใน datatableHeader.note ไม่ใช่ remark state
  // ต้องส่งค่าที่ render จริงเข้า pagination เพื่อให้ split remark ทำงานถูกต้อง
  const datatableEdit0 = datatableEdits[datatableHeaders[0]?.ids] || {};
  const rawDatatableNote = datatableEdit0.note ?? datatableHeaders[0]?.note;
  const effectiveRemark = datatableHeaders.length > 0 && rawDatatableNote != null ? rawDatatableNote : remark;

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
    remark: effectiveRemark,
    headerHeight: headerH,
    footerHeight: footerH,
    visible: !docData.req_file || isEditing,
    extraLayoutDeps: [
      forsItems.join(" "),
      datatableHeaders[0]?.details ?? "",
      datatableEdits[datatableHeaders[0]?.ids]?.details ?? "",
    ],
  });

  const {
    setReqTo: storeSetReqTo,
    setReqReason: storeSetReqReason,
    setReferences: storeSetReferences,
    setBodyParagraph: storeSetBodyParagraph,
    setRemark: storeSetRemark,
    setTitleTableSections: storeSetTitleTableSections,
    setExtraPages: storeSetExtraPages,
  } = useDocumentEditStore();

  // Fetch datatables (TitleTable) from backend and sync to titleTableSections
  const fetchDatatables = useCallback(() => {
    if (!rqdid) return;
    getDatatables(rqdid)
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        if (list.length === 0) {
          setTitleTableSections([]);
          storeSetTitleTableSections(rqdid, []);
          return;
        }
        const makeCell = (value = "") => ({ value, colspan: 1, rowspan: 1 });
        const sections = list.map((item) => {
          const headers = item.tabledata?.headers ?? [];
          const rows = item.tabledata?.rows ?? [];
          const headerRow = headers.map((h) => makeCell(String(h ?? "")));
          const dataCells = rows.map((row) =>
            (Array.isArray(row) ? row : []).map((v) => makeCell(String(v ?? "")))
          );
          return {
            _id: item.id,
            title: item.tablename ?? "",
            colCount: headers.length || 1,
            cells: [headerRow, ...dataCells],
            summaryRow: null,
          };
        });
        setTitleTableSections(sections);
        storeSetTitleTableSections(rqdid, sections);
      })
      .catch((err) => console.error("[Datatables]", err));
  }, [rqdid, setTitleTableSections, storeSetTitleTableSections]);
  useEffect(() => { fetchDatatables(); }, [fetchDatatables]);

  // Persist titleTableSections → ADD (new) / UPDATE (has _id). Returns updated sections with _id filled.
  const saveDirtyDatatables = useCallback(async () => {
    console.log("[saveDirtyDatatables] start", { rqdid, sectionsLen: titleTableSections?.length, titleTableSections });
    if (!rqdid || !titleTableSections || titleTableSections.length === 0) {
      console.log("[saveDirtyDatatables] skip: no rqdid or no sections");
      return titleTableSections;
    }
    const createby = String(currentUserId ?? "");
    const updated = [];
    for (let i = 0; i < titleTableSections.length; i++) {
      const section = titleTableSections[i];
      const headers = section.cells[0]?.map((c) => c?.value ?? "") ?? [];
      const rows = section.cells.slice(1).map((row) => row.map((c) => c?.value ?? ""));
      const tabledata = { headers, rows };
      const tablename = (section.title ?? "").trim() || `Table ${i + 1}`;
      const isUpdate = !!section._id;
      const payload = isUpdate
        ? { id: section._id, tablename, tabledata, createby }
        : { rqdid: Number(rqdid), tablename, tabledata, createby };
      console.log("[saveDirtyDatatables] payload", JSON.stringify(payload, null, 2), "→", isUpdate ? "UPDATE" : "ADD");
      try {
        if (isUpdate) {
          const res = await updateDatatable(payload);
          console.log("[saveDirtyDatatables] updateDatatable OK", res);
          updated.push(section);
        } else {
          const res = await addDatatable(payload);
          console.log("[saveDirtyDatatables] addDatatable OK", res);
          const newId = res?.data_id?.id ?? res?.data?.id ?? res?.id;
          updated.push(newId ? { ...section, _id: newId } : section);
        }
      } catch (err) {
        console.error("[saveDirtyDatatables] API error", {
          message: err?.message,
          status: err?.response?.status,
          responseData: err?.response?.data,
          responseText: err?.response?.statusText,
          sentPayload: payload,
        });
        throw err;
      }
    }
    setTitleTableSections(updated);
    storeSetTitleTableSections(rqdid, updated);
    console.log("[saveDirtyDatatables] done", updated);
    return updated;
  }, [rqdid, titleTableSections, currentUserId, setTitleTableSections, storeSetTitleTableSections]);

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

  // Save: update datatable headers (if dirty) → generate PDF → upload → successFinished
  const handleSaveDocument = useCallback(async () => {
    if (!pagesContainerRef.current || !rqdid) return;
    setPdfBusy(true);
    try {
      await saveDirtyDatatables();
      await saveDirtyDatatableHeaders();
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
  }, [rqdid, docData, saveDirtyDatatableHeaders, saveDirtyDatatables]);

  // Fetch fresh document data on mount (ป้องกัน location.state stale หลัง save/reload)
  useEffect(() => {
    const initRqdid = location.state?.document?.rqdid;
    if (!initRqdid) return;
    getAllDocuments({ page: 1, limit: 1000 })
      .then((res) => {
        const fresh = (res.data || []).find((d) => String(d.rqdid) === String(initRqdid));
        if (fresh) setDocData(fresh);
      })
      .catch(() => { });
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

  const mergedDatatableHeaders = useMemo(() => {
    if (datatableHeaders.length === 0) return [];
    const original = datatableHeaders[0];
    const edit = datatableEdits[original.ids] || {};
    return [{ ...original, ...edit, fors: forsItems.filter((v) => v.trim()).join(" L2 ") }];
  }, [datatableHeaders, datatableEdits, forsItems]);

  const datatableNote = mergedDatatableHeaders[0]?.note || undefined;

  const closingProps = useMemo(
    () => ({ remark: effectiveRemark, setRemark, storeKey: rqdid, storeSetRemark, creatorName, signatureGroups }),
    [effectiveRemark, rqdid, storeSetRemark, creatorName, signatureGroups, setRemark]
  );

  const datatableNoteTargetIds = mergedDatatableHeaders[0]?.ids;
  const setDatatableNote = useCallback((value) => {
    if (!canEdit || datatableNoteTargetIds == null) return;
    handleDatatableHeaderChange(datatableNoteTargetIds, { note: value });
  }, [canEdit, datatableNoteTargetIds, handleDatatableHeaderChange]);

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
      datatableNote,
      setDatatableNote: mergedDatatableHeaders.length > 0 ? setDatatableNote : undefined,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [titleTableSections, remark, rqdid, storeSetRemark, openTitleTableModal, creatorName, signatureGroups, setRemark, datatableNote, setDatatableNote, mergedDatatableHeaders.length]
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
            }}
          />

        </div>

        {/* CENTER: Pages / PDF */}
        <div className="flex-1 flex flex-col gap-4 print:gap-0 relative">
          {/* Modal overlay เตือน — แสดงทับ pages ตอน ADD-DATA + ไม่ใช่เจ้าของ
              ใช้ absolute inset-0 ให้อยู่กลางพื้นที่ CENTER (เหนือเอกะสาร) ไม่ใช่กลางจอ */}
          {docData.statustype === "ADD-DATA" && !canEdit && (
            <div className="print:hidden absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
              <div className="max-w-sm w-full mx-4 bg-white rounded-2xl shadow-2xl border border-amber-200 p-6 flex flex-col items-center text-center pointer-events-auto">
                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-3">
                  <svg className="h-8 w-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">ທ່ານບໍ່ມີສິດໃນເອກະສານນີ້</h2>
                <p className="text-xs text-gray-600 leading-relaxed mb-4">
                  ເອກະສານນີ້ເປັນສະບັບຮ່າງຂອງຜູ້ໃຊ້ອື່ນ<br />
                  ສາມາດເບິ່ງໄດ້ສະເພາະເຈົ້າຂອງເທົ່ານັ້ນ
                </p>
                <button
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#0F75BC] text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                  </svg>
                  ກັບຄືນ
                </button>
              </div>
            </div>
          )}
          {/* Wrapper ที่จะเบลอ + inert ตอนไม่มีสิทธิ์ */}
          <div className={!canEdit && docData.statustype === "ADD-DATA" ? "opacity-40 pointer-events-none select-none" : ""}>
            {docData.req_file && !isEditing && (
              <iframe
                src={`${import.meta.env.VITE_FILE_BASE_URL}/${docData.req_file}`}
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
                  datatableHeaders={mergedDatatableHeaders}
                  forsItems={forsItems}
                  onChangeForsItem={canEdit ? handleForsItemChange : null}
                  onAddForsItem={canEdit ? handleAddForsItem : null}
                  onDeleteForsItem={canEdit ? handleDeleteForsItem : null}
                  onChangeDatatableHeader={canEdit ? handleDatatableHeaderChange : null}
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
            onCompactLevelChange={canEdit ? setCompactLevel : null}
            reqFile={docData.req_file}
            isViewMode={!!(docData.req_file && !isEditing)}
            isEditing={isEditing}
            onToggleMode={canEdit ? () => setIsEditing((prev) => !prev) : null}
            rqdid={rqdid}
            onUploadFile={canEdit ? handleUploadMainFile : null}
          />
          {canEdit && (docData.statustype === "ADD-DATA" || isEditing) && (
            <button onClick={handleSaveDocument} disabled={pdfBusy}
              className={`w-full text-white py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors
                ${pdfBusy ? "bg-blue-400 cursor-not-allowed" : "bg-[#0F75BC] hover:bg-blue-700"}`}>
              {pdfBusy ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
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

      <DatatableHeaderModal
        isOpen={showDatatableHeaderModal}
        onClose={() => setShowDatatableHeaderModal(false)}
        onSaved={() => { setShowDatatableHeaderModal(false); fetchDatatableHeaders(); }}
        docData={docData}
        createby={currentUserId}
      />
    </div>
  );
}
