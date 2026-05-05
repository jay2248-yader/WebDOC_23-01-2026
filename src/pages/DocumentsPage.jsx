import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import GenericToolbar from "../components/common/GenericToolbar";
import GenericDataTable, { Button } from "../components/common/GenericDataTable";
import DocumentFormModal from "../components/documents/DocumentFormModal";
import LoadingDialog from "../components/common/LoadingDialog";
import { getAllDocuments, createNewDocument } from "../services/documentservice";


export default function DocumentsPage() {
    const navigate = useNavigate();

    const [documents, setDocuments] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [inputText, setInputText] = useState("");
    const [searchText, setSearchText] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingDocument, setEditingDocument] = useState(null);
    const [tableLoading, setTableLoading] = useState(false);

    const tableRef = useRef(null);
    const mountedRef = useRef(true);
    useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);

    const loadDocuments = useCallback(async (signal, silent = false) => {
        if (!silent) setTableLoading(true);
        try {
            const result = await getAllDocuments({ page, limit: pageSize, search: searchText }, signal);
            if (!mountedRef.current || signal?.aborted) return;
            setDocuments(result.data);
            setTotalItems(result.total);
            setTotalPages(result.lastPage || 1);
        } catch (error) {
            if (error?.code === "ERR_CANCELED" || error?.name === "CanceledError") return;
            console.error("Error loading documents:", error);
        } finally {
            if (mountedRef.current && !silent && !signal?.aborted) setTableLoading(false);
        }
    }, [page, pageSize, searchText]);

    useEffect(() => {
        const controller = new AbortController();
        loadDocuments(controller.signal);
        return () => controller.abort();
    }, [loadDocuments]);

    const safePage = Math.min(Math.max(page, 1), totalPages);

    const handleSearchChange = useCallback((v) => setInputText(v), []);
    const handleSearch = useCallback(() => { setSearchText(inputText); setPage(1); }, [inputText]);
    const handlePageSizeChange = useCallback((nextSize) => { setPageSize(nextSize); setPage(1); }, []);
    const handlePageChange = useCallback((nextPage) => { setPage(Math.min(Math.max(nextPage, 1), totalPages)); }, [totalPages]);
    const handleCreateDocument = useCallback(() => { setEditingDocument(null); setShowFormModal(true); }, []);
    const handleEditDocument = useCallback((doc) => { setEditingDocument(doc); setShowFormModal(true); }, []);
    const handlePreviewDocument = useCallback((doc) => { navigate("/document-preview", { state: { document: doc } }); }, [navigate]);
    const handleCloseModal = useCallback(() => { setShowFormModal(false); setEditingDocument(null); }, []);
    const handleDeleteDocument = useCallback(async () => { await loadDocuments(undefined, true); }, [loadDocuments]);

    const handleSubmitDocument = useCallback(async (formData) => {
        if (editingDocument) {
            // TODO: await updateDocument({ rqdid: editingDocument.rqdid, ...formData });
            await loadDocuments(undefined, true);
        } else {
            const res = await createNewDocument(formData);
            const created = res?.data_id || res?.message || null;
            let newDoc = created && typeof created === "object" && created.rqdid ? created : null;
            if (!newDoc) {
                try {
                    const list = await getAllDocuments({ page: 1, limit: 1, search: "" });
                    newDoc = list.data?.[0] || null;
                } catch { /* ignore */ }
            }
            await loadDocuments(undefined, true);
            if (newDoc?.rqdid) {
                navigate("/document-preview", { state: { document: newDoc } });
            }
        }
    }, [editingDocument, loadDocuments, navigate]);

    // Define columns configuration
    const columns = useMemo(() => [
        {
            key: "index",
            label: "ລຳດັບ",
            align: "center",
            render: (_item, index, page, pageSize) => (page - 1) * pageSize + index + 1,
        },
        {
            key: "req_no",
            label: "ເລກທີ",
            align: "left",
        },
        {
            key: "req_reason",
            label: "ເນື້ອໃນ",
            align: "left",
        },
        {
            key: "req_shortboard",
            label: "ພາກສ່ວນ",
            align: "left",
        },
        {
            key: "req_to",
            label: "ຮຽນ",
            align: "left",
        },
        {
            key: "totalmoney",
            label: "ຈຳນວນເງິນ",
            align: "right",
            render: (doc) =>
                doc.totalmoney != null && doc.totalmoney !== ""
                    ? Number(doc.totalmoney).toLocaleString()
                    : "-",
        },
        {
            key: "createdate",
            label: "ວັນທີ",
            align: "left",
        },
        {
            key: "createBy",
            label: "ຜູ້ສ້າງ",
            align: "left",
            render: (doc) => doc.createBy?.username || "-",
        },
        {
            key: "statustype",
            label: "ສະຖານະ",
            align: "center",
            render: (doc) => {
                const styleMap = {
                    "ADD":      { bg: "bg-emerald-500", dot: "bg-white/70" },
                    "ADD-DATA": { bg: "bg-slate-400",   dot: "bg-white/70" },
                    "SUCCESS":  { bg: "bg-green-500",   dot: "bg-white/70" },
                    "EDIT":     { bg: "bg-amber-400",   dot: "bg-white/70" },
                    "APPROVE":  { bg: "bg-teal-500",    dot: "bg-white/70" },
                    "REJECT":   { bg: "bg-rose-500",    dot: "bg-white/70" },
                    "PENDING":  { bg: "bg-orange-400",  dot: "bg-white/70" },
                    "DELETE":   { bg: "bg-red-500",     dot: "bg-white/70" },
                };
                const labelMap = {
                    "ADD-DATA": "ເອກະສານສະບັບຮ່າງ",
                    "SUCCESS":  "ເອກະສານສຳເລັດແລ້ວ",
                };
                const s = styleMap[doc.statustype] ?? { bg: "bg-gray-400", dot: "bg-white/70" };
                return (
                    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap px-2.5 py-1 rounded-full text-xs font-semibold text-white ${s.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        {labelMap[doc.statustype] ?? doc.statustype}
                    </span>
                );
            },
        },
        {
            key: "actions",
            label: "ຈັດການ",
            align: "center",
            render: (doc) => (
                <div className="flex items-center justify-center gap-2">
                    <Button
                        fullWidth={false}
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreviewDocument(doc)}
                        className="w-24 inline-flex items-center justify-center gap-1.5 rounded-md bg-blue-200 px-2 py-1 text-xs text-blue-700 hover:bg-blue-50 hover:scale-100 hover:shadow-none"
                    >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        ເບິ່ງ
                    </Button>
                </div>
            ),
        },
    ], [handlePreviewDocument]);

    return (
        <div className="space-y-6">
            <GenericToolbar
                searchText={inputText}
                onSearchChange={handleSearchChange}
                onSearch={handleSearch}
                onCreate={handleCreateDocument}
                searchPlaceholder="ຄົ້ນຫາເອກະສານ..."
                createButtonText="ເພີ່ມເອກະສານ"
                createButtonIcon={
                    <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                        />
                    </svg>
                }
            />

            <GenericDataTable
                data={documents}
                columns={columns}
                page={safePage}
                pageSize={pageSize}
                totalPages={totalPages}
                totalItems={totalItems}
                onEdit={handleEditDocument}
                onDelete={handleDeleteDocument}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                rowKey="rqdid"
                entityName="ເອກະສານ"
                getEntityDisplayName={(doc) => doc.req_no}
                loading={tableLoading}
                ref={tableRef}
            />

            <DocumentFormModal
                key={editingDocument?.rqdid || "new"}
                isOpen={showFormModal}
                document={editingDocument}
                onClose={handleCloseModal}
                onSubmit={handleSubmitDocument}
            />
        </div>
    );
}
