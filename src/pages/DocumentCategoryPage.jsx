import { useState, useRef, useEffect, useCallback } from "react";
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
  const [inputText, setInputText] = useState("");
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const tableRef = useRef(null);

  const loadDocumentCategories = useCallback(async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const result = await getAllDocumentCategories({ page, limit: pageSize, search: searchText });
      setDocumentCategories(result.data);
      setTotalItems(result.total);
      setTotalPages(result.lastPage || 1);
    } catch (error) {
      console.error("Failed to fetch document categories:", error);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [page, pageSize, searchText]);

  useEffect(() => {
    loadDocumentCategories();
  }, [loadDocumentCategories]);

  const safePage = Math.min(Math.max(page, 1), totalPages);

  const handleSearchChange = (v) => setInputText(v);

  const handleSearch = () => {
    setSearchText(inputText);
    setPage(1);
  };

  const handlePageSizeChange = (nextSize) => {
    setPageSize(nextSize);
    setPage(1);
  };

  const handlePageChange = (nextPage) => {
    setPage(Math.min(Math.max(nextPage, 1), totalPages));
  };

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setShowFormModal(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setShowFormModal(true);
  };

  const handleCloseModal = () => {
    setShowFormModal(false);
    setEditingCategory(null);
  };

  const handleSubmitCategory = async (formData) => {
    if (editingCategory) {
      await updateDocumentCategory({ dctid: editingCategory.dctid, ...formData });
    } else {
      await createNewDocumentCategory(formData);
    }
    await loadDocumentCategories(true);
  };

  const handleDeleteCategory = async (category) => {
    await deleteDocumentCategory(category.dctid);
    await loadDocumentCategories(true);
  };

  const columns = [
    {
      key: "index",
      label: "ລຳດັບ",
      align: "left",
      render: (_item, index, page, pageSize) => (page - 1) * pageSize + index + 1,
    },
    { key: "dctid", label: "ລະຫັດ (ID)", align: "left" },
    { key: "doccategoryname", label: "ຊື່ປະເພດເອກະສານ", align: "left" },
    { key: "moreinfo", label: "ລາຍລະອຽດ", align: "left" },
    { key: "createdate", label: "ວັນທີສ້າງ", align: "left" },
    { key: "createby", label: "ຜູ້ສ້າງ", align: "left" },
    {
      key: "actions",
      label: "ຈັດການ",
      align: "left",
      render: (category) => (
        <div className="flex items-center gap-2">
          <Button
            fullWidth={false} variant="ghost" size="sm"
            onClick={() => handleEditCategory(category)}
            className="w-16 inline-flex items-center justify-center rounded-md bg-blue-200 px-2 py-1 text-xs text-blue-700 hover:bg-blue-50 hover:scale-100 hover:shadow-none"
          >
            ແກ້ໄຂ
          </Button>
          <Button
            fullWidth={false} variant="ghost" size="sm"
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
        searchText={inputText}
        onSearchChange={handleSearchChange}
        onSearch={handleSearch}
        onCreate={handleCreateCategory}
        searchPlaceholder="ຄົ້ນຫາປະເພດເອກະສານ..."
        createButtonText="ເພີ່ມປະເພດ"
        createButtonIcon={
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
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
