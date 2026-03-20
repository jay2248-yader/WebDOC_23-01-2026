import { useMemo } from "react";
import GenericToolbar from "../components/common/GenericToolbar";
import GenericDataTable, { Button } from "../components/common/GenericDataTable";
import DocumentGroupFormModal from "../components/document-groups/DocumentGroupFormModal";
import LoadingDialog from "../components/common/LoadingDialog";
import useCrudPage from "../hooks/useCrudPage";
import { getAllDocumentGroup, createNewDocumentGroup, deleteDocumentGroup, updateDocumentGroup } from "../services/documentgroupservice";

const plusIcon = (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

export default function DocumentGroupPage() {
  const {
    searchText, safePage, pageSize, totalPages, totalItems, pageItems,
    loadingData, isLoading, showFormModal, editingItem, tableRef,
    handleSearchChange, handlePageChange, handlePageSizeChange,
    handleCreate, handleEdit, handleCloseModal, handleSubmit, handleDelete,
  } = useCrudPage({
    fetchAll: getAllDocumentGroup,
    createItem: createNewDocumentGroup,
    updateItem: updateDocumentGroup,
    deleteItem: deleteDocumentGroup,
    idKey: "dcdid",
  });

  const columns = useMemo(() => [
    { key: "index", label: "ລຳດັບ", align: "center", render: (_item, index, page, pageSize) => (page - 1) * pageSize + index + 1 },
    { key: "dcdid", label: "ລະຫັດ", align: "left" },
    { key: "docgroupname", label: "ຊື່ກຸ່ມເອກະສານ", align: "left" },
    { key: "levelapprove", label: "ລະດັບອະນຸມັດ", align: "center" },
    {
      key: "comparing", label: "ປຽບທຽບ", align: "center",
      render: (dg) => (
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${dg.comparing === "Y" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
          {dg.comparing}
        </span>
      ),
    },
    {
      key: "doccategoryname", label: "ປະເພດເອກະສານ", align: "left",
      render: (dg) => dg.documentcategorymodel?.doccategoryname || "-",
    },
    { key: "createdate", label: "ວັນທີສ້າງ", align: "left" },
    { key: "createby", label: "ສ້າງໂດຍ", align: "left" },
    {
      key: "actions", label: "ຈັດການ", align: "center",
      render: (dg) => (
        <div className="flex items-center justify-center gap-2">
          <Button fullWidth={false} variant="ghost" size="sm" onClick={() => handleEdit(dg)} className="w-16 inline-flex items-center justify-center rounded-md bg-blue-200 px-2 py-1 text-xs text-blue-700 hover:bg-blue-50 hover:scale-100 hover:shadow-none">ແກ້ໄຂ</Button>
          <Button fullWidth={false} variant="ghost" size="sm" onClick={() => tableRef.current?.handleDeleteClick?.(dg)} className="w-16 inline-flex items-center justify-center rounded-md bg-red-400 px-2 py-1 text-xs text-white hover:bg-red-500 hover:scale-100 hover:shadow-none">ລົບ</Button>
        </div>
      ),
    },
  ], [handleEdit, tableRef]);

  return (
    <div className="space-y-6">
      <GenericToolbar searchText={searchText} onSearchChange={handleSearchChange} onCreate={handleCreate} searchPlaceholder="ຄົ້ນຫາກຸ່ມເອກະສານ..." createButtonText="ເພີ່ມກຸ່ມເອກະສານ" createButtonIcon={plusIcon} />
      <GenericDataTable data={pageItems} columns={columns} page={safePage} pageSize={pageSize} totalPages={totalPages} totalItems={totalItems} loading={loadingData} onEdit={handleEdit} onDelete={handleDelete} onPageChange={handlePageChange} onPageSizeChange={handlePageSizeChange} rowKey="dcdid" entityName="ກຸ່ມເອກະສານ" getEntityDisplayName={(dg) => dg.docgroupname} ref={tableRef} />
      <DocumentGroupFormModal key={editingItem?.dcdid || "new"} isOpen={showFormModal} documentGroup={editingItem} onClose={handleCloseModal} onSubmit={handleSubmit} />
      <LoadingDialog isOpen={isLoading} message="ກຳລັງໂຫຼດ..." />
    </div>
  );
}
