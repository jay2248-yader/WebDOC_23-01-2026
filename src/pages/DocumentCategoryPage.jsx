import { useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import GenericToolbar from "../components/common/GenericToolbar";
import GenericDataTable, { Button } from "../components/common/GenericDataTable";
import DocumentCategoryFormModal from "../components/document-categories/DocumentCategoryFormModal";
import LoadingDialog from "../components/common/LoadingDialog";
import useCrudPage from "../hooks/useCrudPage";
import { getAllDocumentCategories, createNewDocumentCategory, updateDocumentCategory, deleteDocumentCategory } from "../services/documentcategoryservice";

function extractCreated(res, formData) {
  const candidates = [res?.data_id, res?.message, res?.data, res];
  for (const c of candidates) {
    if (c && typeof c === "object" && !Array.isArray(c) && c.dctid != null) return c;
  }
  return { ...formData };
}

const plusIcon = (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

export default function DocumentCategoryPage() {
  const navigate = useNavigate();
  const createdRef = useRef(null);
  const createItem = async (payload) => {
    const res = await createNewDocumentCategory(payload);
    createdRef.current = extractCreated(res, payload);
    return res;
  };
  const {
    searchText, safePage, pageSize, totalPages, totalItems, pageItems,
    loadingData, loadError, isLoading, showFormModal, editingItem, tableRef,
    handleSearchChange, handlePageChange, handlePageSizeChange,
    handleCreate, handleEdit, handleCloseModal, handleSubmit: rawHandleSubmit, handleDelete,
  } = useCrudPage({
    fetchAll: getAllDocumentCategories,
    createItem,
    updateItem: updateDocumentCategory,
    deleteItem: deleteDocumentCategory,
    idKey: "dctid",
  });

  const handleSubmit = async (formData) => {
    const isCreate = !editingItem;
    createdRef.current = null;
    await rawHandleSubmit(formData);
    if (isCreate) {
      let category = createdRef.current;
      if (!category?.dctid) {
        try {
          const res = await getAllDocumentCategories({ page: 1, limit: 10, search: formData.doccategoryname || "" });
          const list = Array.isArray(res) ? res : res?.data || [];
          category = list.find((c) => c.doccategoryname === formData.doccategoryname) || list[0];
        } catch { /* ignore */ }
      }
      if (category?.dctid) {
        navigate("/document-category/detail", { state: { category } });
      }
    }
  };

  const columns = useMemo(() => [
    { key: "index", label: "ລຳດັບ", align: "left", render: (_item, index, page, pageSize) => (page - 1) * pageSize + index + 1 },
    { key: "dctid", label: "ລະຫັດ", align: "left" },
    { key: "doccategoryname", label: "ຊື່ປະເພດເອກະສານ", align: "left" },
    { key: "moreinfo", label: "ລາຍລະອຽດ", align: "left" },
    { key: "createdate", label: "ວັນທີສ້າງ", align: "left" },
    { key: "createby", label: "ສ້າງໂດຍ", align: "left" },
    {
      key: "actions", label: "ຈັດການ", align: "left",
      render: (c) => (
        <div className="flex items-center gap-2">
          <Button fullWidth={false} variant="ghost" size="sm" onClick={() => navigate("/document-category/detail", { state: { category: c } })} className="w-24 inline-flex items-center justify-center gap-1.5 rounded-md bg-blue-200 px-2 py-1 text-xs text-blue-700 hover:bg-blue-50 hover:scale-100 hover:shadow-none"><svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>ແກ້ໄຂ</Button>
          <Button fullWidth={false} variant="ghost" size="sm" onClick={() => tableRef.current?.handleDeleteClick?.(c)} className="w-24 inline-flex items-center justify-center gap-1.5 rounded-md bg-red-400 px-2 py-1 text-xs text-white hover:bg-red-500 hover:scale-100 hover:shadow-none"><svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" /></svg>ລົບ</Button>
        </div>
      ),
    },
  ], [handleEdit, tableRef, navigate]);

  return (
    <div className="space-y-6">
      <GenericToolbar searchText={searchText} onSearchChange={handleSearchChange} onCreate={handleCreate} searchPlaceholder="ຄົ້ນຫາປະເພດເອກະສານ..." createButtonText="ເພີ່ມປະເພດ" createButtonIcon={plusIcon} />
      <GenericDataTable data={pageItems} columns={columns} page={safePage} pageSize={pageSize} totalPages={totalPages} totalItems={totalItems} loading={loadingData} error={loadError} onEdit={handleEdit} onDelete={handleDelete} onPageChange={handlePageChange} onPageSizeChange={handlePageSizeChange} rowKey="dctid" entityName="ປະເພດເອກະສານ" getEntityDisplayName={(c) => c.doccategoryname} ref={tableRef} />
      <DocumentCategoryFormModal key={editingItem?.dctid || "new"} isOpen={showFormModal} category={editingItem} onClose={handleCloseModal} onSubmit={handleSubmit} />
      <LoadingDialog isOpen={isLoading} message="ກຳລັງໂຫຼດ..." />
    </div>
  );
}
