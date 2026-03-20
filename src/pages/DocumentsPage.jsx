import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import GenericToolbar from "../components/common/GenericToolbar";
import GenericDataTable, { Button } from "../components/common/GenericDataTable";
import DocumentFormModal from "../components/documents/DocumentFormModal";
import DocumentDetailModal from "../components/documents/DocumentDetailModal";
import DocumentDetailFormModal from "../components/documents/DocumentDetailFormModal";
import LoadingDialog from "../components/common/LoadingDialog";
import { getAllDocuments, createNewDocument } from "../services/documentservice";
import { useAuthStore } from "../store/authstore";

export default function DocumentsPage() {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);

    const [documents, setDocuments] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [inputText, setInputText] = useState("");
    const [searchText, setSearchText] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingDocument, setEditingDocument] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [viewingDocument, setViewingDocument] = useState(null);
    const [showDetailFormModal, setShowDetailFormModal] = useState(false);
    const [detailFormDocument, setDetailFormDocument] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const tableRef = useRef(null);
    const mountedRef = useRef(true);
    useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);

    const loadDocuments = useCallback(async (signal, silent = false) => {
        try {
            if (!silent) setIsLoading(true);
            const result = await getAllDocuments({ page, limit: pageSize, search: searchText }, signal);
            if (!mountedRef.current) return;
            setDocuments(result.data);
            setTotalItems(result.total);
            setTotalPages(result.lastPage || 1);
        } catch (error) {
            if (error?.code === "ERR_CANCELED" || error?.name === "CanceledError") return;
            console.error("Error loading documents:", error);
        } finally {
            if (mountedRef.current && !silent) setIsLoading(false);
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
    const handleCloseDetailModal = useCallback(() => { setShowDetailModal(false); setViewingDocument(null); }, []);
    const handleCloseDetailFormModal = useCallback(() => { setShowDetailFormModal(false); setDetailFormDocument(null); }, []);
    const handleCloseModal = useCallback(() => { setShowFormModal(false); setEditingDocument(null); }, []);
    const handleDeleteDocument = useCallback(async () => { await loadDocuments(undefined, true); }, [loadDocuments]);

    const handleSubmitDetail = useCallback(async (formData) => {
        try {
            // 1. สร้างเอกสารใหม่ก่อนโดยดึงข้อมูลจาก store
            const documentPayload = {
                doccategoryid: 1, // ค่าคงที่ไปก่อน เพราะยังไม่มี api
                req_user: user?.usid || 1,
                req_to: formData.req_to, // จาก form input
                req_reason: "Request", // ต้องมีค่า
                branchid: user?.brid || 1,
                departmentid: 1,
                boardId: 1, // ใช้ boardId ไม่ใช่ boardid
                totalmoney: 0,
            };

            const result = await createNewDocument(documentPayload);

            // 2. ได้ rqdid จากเอกสารที่สร้างใหม่
            const newDocument = result.data_id?.fn_newrequestdoc || result.data_id || result.data || result;
            const _rqdid = newDocument?.rqdid;

            // TODO: 3. เพิ่มรายละเอียดเอกสาร เมื่อมี API แล้ว
            // await createDocumentDetail({ rqdid, ...formData });

            // Reload documents
            await loadDocuments(undefined);
        } catch (error) {
            console.error("Error creating document:", error);
            throw error;
        }
    }, [user, loadDocuments]);

    const handleSubmitDocument = useCallback(async (formData) => {
        if (editingDocument) {
            // TODO: await updateDocument({ rqdid: editingDocument.rqdid, ...formData });
        } else {
            await createNewDocument(formData);
        }
        await loadDocuments(undefined, true);
    }, [editingDocument, loadDocuments]);

    // Define columns configuration
    const columns = useMemo(() => [
        {
            key: "index",
            label: "ລຳດັບ", // Order
            align: "center",
            render: (_item, index, page, pageSize) => (page - 1) * pageSize + index + 1,
        },
        {
            key: "req_no",
            label: "ເລກທີ", // No.
            align: "left",
        },
        {
            key: "req_reason",
            label: "ເນື້ອໃນ", // Content/Reason
            align: "left",
        },
        {
            key: "req_shortboard",
            label: "ພາກສ່ວນ", // Section
            align: "left",
        },
        {
            key: "req_to",
            label: "ຮຽນ", // To
            align: "left",
        },
        {
            key: "createdate",
            label: "ວັນທີ", // Date
            align: "left",
        },
        {
            key: "createBy",
            label: "ຜູ້ສ້າງ", // Created By
            align: "left",
            render: (doc) => doc.createBy?.username || "-",
        },
        {
            key: "statustype",
            label: "ສະຖານະ",
            align: "center",
            render: (doc) => {
                const colorMap = {
                    "ADD":      "bg-emerald-100 text-emerald-700 border-emerald-300",
                    "ADD-DATA": "bg-blue-100    text-blue-700    border-blue-300",
                    "EDIT":     "bg-amber-100   text-amber-700   border-amber-300",
                    "APPROVE":  "bg-teal-100    text-teal-700    border-teal-300",
                    "REJECT":   "bg-red-100     text-red-700     border-red-300",
                    "PENDING":  "bg-orange-100  text-orange-700  border-orange-300",
                    "DELETE":   "bg-rose-100    text-rose-700    border-rose-300",
                };
                const cls = colorMap[doc.statustype] ?? "bg-gray-100 text-gray-600 border-gray-300";
                return (
                    <span className={`inline-flex items-center whitespace-nowrap px-2.5 py-1 rounded-full text-xs font-semibold border ${cls}`}>
                        {doc.statustype}
                    </span>
                );
            },
        },
        {
            key: "actions",
            label: "ຈັດການ", // Actions
            align: "center",
            render: (doc) => (
                <div className="flex items-center justify-center gap-2">
                    <Button
                        fullWidth={false}
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreviewDocument(doc)}
                        className="w-16 inline-flex items-center justify-center rounded-md bg-orange-200 px-2 py-1 text-xs text-orange-700 hover:bg-orange-50 hover:scale-100 hover:shadow-none"
                    >
                        ພິມ
                    </Button>

                    <Button
                        fullWidth={false}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditDocument(doc)}
                        className="w-16 inline-flex items-center justify-center rounded-md bg-blue-200 px-2 py-1 text-xs text-blue-700 hover:bg-blue-50 hover:scale-100 hover:shadow-none"
                    >
                        ແກ້ໄຂ
                    </Button>

                    <Button
                        fullWidth={false}
                        variant="ghost"
                        size="sm"
                        onClick={() => tableRef.current?.handleDeleteClick?.(doc)}
                        className="w-16 inline-flex items-center justify-center rounded-md bg-red-400 px-2 py-1 text-xs text-white hover:bg-red-500 hover:scale-100 hover:shadow-none"
                    >
                        ລົບ
                    </Button>
                </div>
            ),
        },
    ], [handlePreviewDocument, handleEditDocument, tableRef]);

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
                ref={tableRef}
            />

            <DocumentFormModal
                key={editingDocument?.rqdid || "new"}
                isOpen={showFormModal}
                document={editingDocument}
                onClose={handleCloseModal}
                onSubmit={handleSubmitDocument}
            />

            <DocumentDetailModal
                isOpen={showDetailModal}
                document={viewingDocument}
                onClose={handleCloseDetailModal}
            />

            <DocumentDetailFormModal
                key={detailFormDocument?.rqdid || "new-detail"}
                isOpen={showDetailFormModal}
                document={detailFormDocument}
                onClose={handleCloseDetailFormModal}
                onSubmit={handleSubmitDetail}
            />

            <LoadingDialog isOpen={isLoading} message="ກຳລັງໂຫຼດ..." />
        </div>
    );
}
