import { useState, useRef, useEffect } from "react";
import GenericToolbar from "../components/common/GenericToolbar";
import GenericDataTable, { Button } from "../components/common/GenericDataTable";
import DocumentFormModal from "../components/documents/DocumentFormModal";
import LoadingDialog from "../components/common/LoadingDialog";
import { getAllDocuments } from "../services/documentservice";

export default function DocumentsPage() {
    const [documents, setDocuments] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [searchText, setSearchText] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingDocument, setEditingDocument] = useState(null);
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
            console.log("create document", formData);
            // TODO: await createNewDocument(formData);
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

            <LoadingDialog isOpen={isLoading} message="ກຳລັງໂຫຼດ..." />
        </div>
    );
}
