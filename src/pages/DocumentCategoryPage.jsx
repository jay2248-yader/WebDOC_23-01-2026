import { useState, useRef, useEffect } from "react";
import GenericToolbar from "../components/common/GenericToolbar";
import GenericDataTable, { Button } from "../components/common/GenericDataTable";
import DocumentCategoryFormModal from "../components/document-categories/DocumentCategoryFormModal";
import LoadingDialog from "../components/common/LoadingDialog";
import {
  getAllDocumentCategories,
  createNewDocumentCategory,
  updateDocumentCategory,
  deleteDocumentCategory,
} from "../services/documentcategoryservice";

export default function DocumentCategoryPage() {
  const [documentCategories, setDocumentCategories] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Reference to the delete handler from GenericDataTable
  const tableRef = useRef(null);

  // Load document categories from API
  const loadDocumentCategories = async () => {
    try {
      setIsLoading(true);
      const result = await getAllDocumentCategories({
        page,
        limit: pageSize,
        search: searchText,
      });
      console.log("Loaded document categories:", result);
      setDocumentCategories(result.data);
      setTotalItems(result.total);
      setTotalPages(result.lastPage || 1);
    } catch (error) {
      console.error("Error loading document categories:", error);
      alert(error.message || "ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ");
    } finally {
      setIsLoading(false);
    }
  };

  // Load document categories on mount and when search/page changes
  useEffect(() => {
    loadDocumentCategories();
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

  const handleCreateCategory = () => {
    setIsLoading(true);
    setEditingCategory(null);

    setTimeout(() => {
      setIsLoading(false);
      setShowFormModal(true);
    }, 500);
  };

  const handleEditCategory = (category) => {
    setIsLoading(true);
    setEditingCategory(category);

    setTimeout(() => {
      setIsLoading(false);
      setShowFormModal(true);
    }, 500);
  };

  const handleCloseModal = () => {
    setShowFormModal(false);
    setEditingCategory(null);
  };

  const handleSubmitCategory = async (formData) => {
    const isEdit = !!editingCategory;

    if (isEdit) {
      await updateDocumentCategory({
        dctid: editingCategory.dctid,
        ...formData,
      });
    } else {
      await createNewDocumentCategory(formData);
    }

    // Reload document categories after successful create/edit
    await loadDocumentCategories();
  };

  const handleDeleteCategory = async (category) => {
    await deleteDocumentCategory(category.dctid);

    // Reload document categories after successful delete
    await loadDocumentCategories();
  };

  // Define columns configuration
  const columns = [
    {
      key: "index",
      label: "ລຳດັບ",
      align: "left",
      render: (item, index, page, pageSize) => (page - 1) * pageSize + index + 1,
    },
    {
      key: "dctid",
      label: "ລະຫັດ (ID)",
      align: "left",
    },
    {
      key: "doccategoryname",
      label: "ຊື່ປະເພດເອກະສານ",
      align: "left",
    },
    {
      key: "moreinfo",
      label: "ລາຍລະອຽດ",
      align: "left",
    },
    {
      key: "createdate",
      label: "ວັນທີສ້າງ",
      align: "left",
    },
    {
      key: "createby",
      label: "ຜູ້ສ້າງ",
      align: "left",
    },
    {
      key: "statustype",
      label: "ສະຖານະ",
      align: "left",
      render: (category) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            category.statustype === "ADD"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {category.statustype}
        </span>
      ),
    },
    {
      key: "actions",
      label: "ຈັດການ",
      align: "left",
      render: (category) => (
        <div className="flex items-center gap-2">
          <Button
            fullWidth={false}
            variant="ghost"
            size="sm"
            onClick={() => handleEditCategory(category)}
            className="w-16 inline-flex items-center justify-center rounded-md bg-blue-200 px-2 py-1 text-xs text-blue-700 hover:bg-blue-50 hover:scale-100 hover:shadow-none"
          >
            ແກ້ໄຂ
          </Button>

          <Button
            fullWidth={false}
            variant="ghost"
            size="sm"
            onClick={() => tableRef.current?.handleDeleteClick?.(category)}
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
        onCreate={handleCreateCategory}
        searchPlaceholder="ຄົ້ນຫາປະເພດເອກະສານ..."
        createButtonText="ເພີ່ມປະເພດ"
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
        data={documentCategories}
        columns={columns}
        page={safePage}
        pageSize={pageSize}
        totalPages={totalPages}
        totalItems={totalItems}
        onEdit={handleEditCategory}
        onDelete={handleDeleteCategory}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        entityName="ປະເພດເອກະສານ"
        getEntityDisplayName={(category) => category.doccategoryname}
        ref={tableRef}
      />

      <DocumentCategoryFormModal
        key={editingCategory?.doccategoryid || "new"}
        isOpen={showFormModal}
        category={editingCategory}
        onClose={handleCloseModal}
        onSubmit={handleSubmitCategory}
      />

      <LoadingDialog isOpen={isLoading} message="ກຳລັງໂຫຼດ..." />
    </div>
  );
}
