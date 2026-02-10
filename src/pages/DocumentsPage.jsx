import { useState, useRef, useEffect } from "react";
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

    // Reference to the delete handler from GenericDataTable
    const tableRef = useRef(null);

    // Load documents from API
    const loadDocuments = async () => {
        try {
            setIsLoading(true);
            const result = await getAllDocuments({
                page,
                limit: pageSize,
                search: searchText,
            });
            console.log("Loaded documents:", result);
            setDocuments(result.data);
            setTotalItems(result.total);
            setTotalPages(result.lastPage || 1);
        } catch (error) {
            console.error("Error loading documents:", error);
            alert(error.message || "ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ");
        } finally {
            setIsLoading(false);
        }
    };

    // Load documents on mount and when search/page changes
    useEffect(() => {
        loadDocuments();
    }, [page, pageSize, searchText]);

    const safePage = Math.min(Math.max(page, 1), totalPages);

    const handleSearchChange = (v) => {
        setSearchText(v);
        setPage(1);
    };

    const handlePageSizeChange = (nextSize) => {
        setPageSize(nextSize);
        setPage(1);
    };

    const handlePageChange = (nextPage) => {
        const clamped = Math.min(Math.max(nextPage, 1), totalPages);
        setPage(clamped);
    };

    const handleCreateDocument = () => {
        setIsLoading(true);
        setEditingDocument(null);

        setTimeout(() => {
            setIsLoading(false);
            setShowFormModal(true);
        }, 500);
    };

    const handleEditDocument = (doc) => {
        setIsLoading(true);
        setEditingDocument(doc);

        setTimeout(() => {
            setIsLoading(false);
            setShowFormModal(true);
        }, 500);
    };

    const handleViewDocument = (doc) => {
        setViewingDocument(doc);
        setShowDetailModal(true);
    };

    const handlePreviewDocument = (doc) => {
        navigate("/document-preview", { state: { document: doc } });
    };

    const handleCloseDetailModal = () => {
        setShowDetailModal(false);
        setViewingDocument(null);
    };

    const handleAddDetail = () => {
        // เปิด form ให้กรอกข้อมูลรายละเอียดก่อน
        setDetailFormDocument(null);
        setShowDetailFormModal(true);
    };

    const handleCloseDetailFormModal = () => {
        setShowDetailFormModal(false);
        setDetailFormDocument(null);
    };

    const handleSubmitDetail = async (formData) => {
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
            console.log("Created document:", result);

            // 2. ได้ rqdid จากเอกสารที่สร้างใหม่
            const newDocument = result.data_id?.fn_newrequestdoc || result.data_id || result.data || result;
            const rqdid = newDocument?.rqdid;

            console.log("New document rqdid:", rqdid);
            console.log("Detail form data:", formData);

            // TODO: 3. เพิ่มรายละเอียดเอกสาร เมื่อมี API แล้ว
            // await createDocumentDetail({ rqdid, ...formData });

            // Reload documents
            await loadDocuments();
        } catch (error) {
            console.error("Error creating document:", error);
            throw error; // ส่ง error กลับไปให้ modal แสดง
        }
    };

    const handleCloseModal = () => {
        setShowFormModal(false);
        setEditingDocument(null);
    };

    const handleSubmitDocument = async (formData) => {
        const isEdit = !!editingDocument;

        if (isEdit) {
            console.log("update document", editingDocument.rqdid, formData);
            // TODO: await updateDocument({ rqdid: editingDocument.rqdid, ...formData });
        } else {
            await createNewDocument(formData);
        }

        // Reload documents after successful create/edit
        await loadDocuments();
    };

    const handleDeleteDocument = async (doc) => {
        console.log("delete document", doc);
        // TODO: await deleteDocument(doc.rqdid);

        // Reload documents after successful delete
        await loadDocuments();
    };

    // Define columns configuration
    const columns = [
        {
            key: "index",
            label: "ລຳດັບ", // Order
            align: "center",
            render: (item, index, page, pageSize) => (page - 1) * pageSize + index + 1,
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
            render: (doc) => (
                <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                        doc.statustype === "ADD"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                    }`}
                >
                    {doc.statustype}
                </span>
            ),
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
                        onClick={() => handleViewDocument(doc)}
                        className="w-16 inline-flex items-center justify-center rounded-md bg-green-200 px-2 py-1 text-xs text-green-700 hover:bg-green-50 hover:scale-100 hover:shadow-none"
                    >
                        ເບິ່ງ
                    </Button>

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
    ];

    return (
        <div className="space-y-6">
            <GenericToolbar
                searchText={searchText}
                onSearchChange={handleSearchChange}
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
                extraButtons={
                    <Button
                        fullWidth={false}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAddDetail(null)}
                        className="bg-purple-600 text-white hover:bg-purple-700 hover:scale-100 hover:shadow-none"
                    >
                        <span className="flex items-center gap-2">
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
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                            ເພີ່ມລາຍລະອຽດ
                        </span>
                    </Button>
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
