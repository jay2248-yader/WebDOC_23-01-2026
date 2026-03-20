import { useMemo } from "react";
import GenericToolbar from "../components/common/GenericToolbar";
import GenericDataTable, { Button } from "../components/common/GenericDataTable";
import DocumentGroupDetailsFormModal from "../components/document-group-details/DocumentGroupDetailsFormModal";
import LoadingDialog from "../components/common/LoadingDialog";
import useCrudPage from "../hooks/useCrudPage";
import { getAllDocumentGroupDetails, createNewDocumentGroupDetails, deleteDocumentGroupDetails, updateDocumentGroupDetails } from "../services/documentgroupdetailsservice";

const plusIcon = (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

export default function DocumentGroupDetailsPage() {
  const {
    searchText, safePage, pageSize, totalPages, totalItems, pageItems,
    loadingData, isLoading, showFormModal, editingItem, tableRef,
    handleSearchChange, handlePageChange, handlePageSizeChange,
    handleCreate, handleEdit, handleCloseModal, handleSubmit, handleDelete,
  } = useCrudPage({
    fetchAll: getAllDocumentGroupDetails,
    createItem: createNewDocumentGroupDetails,
    updateItem: updateDocumentGroupDetails,
    deleteItem: deleteDocumentGroupDetails,
    idKey: "dcgid",
  });

  const columns = useMemo(() => [
    { key: "index", label: "ລຳດັບ", align: "center", render: (_item, index, page, pageSize) => (page - 1) * pageSize + index + 1 },
    { key: "dcgid", label: "ລະຫັດ", align: "left" },
    { key: "dcdid", label: "ລະຫັດກຸ່ມ", align: "left" },
    {
      key: "docgroupname", label: "ຊື່ກຸ່ມເອກະສານ", align: "left",
      render: (d) => d.documentgroupmodel?.docgroupname || "-",
    },
    {
      key: "levelapprove", label: "ລະດັບອະນຸມັດ", align: "center",
      render: (d) => d.documentgroupmodel?.levelapprove || "-",
    },
    {
      key: "doccategoryname", label: "ປະເພດເອກະສານ", align: "left",
      render: (d) => d.documentgroupmodel?.documentcategorymodel?.doccategoryname || "-",
    },
    { key: "userid", label: "ລະຫັດຜູ້ໃຊ້", align: "left" },
    { key: "detailsinfo", label: "ລາຍລະອຽດ", align: "left" },
    {
      key: "maxsignmoney", label: "ຈຳນວນເງິນສູງສຸດ", align: "right",
      render: (d) => d.maxsignmoney?.toLocaleString() || "-",
    },
    { key: "createdate", label: "ວັນທີສ້າງ", align: "left" },
    { key: "createby", label: "ສ້າງໂດຍ", align: "left" },
    {
      key: "actions", label: "ຈັດການ", align: "center",
      render: (d) => (
        <div className="flex items-center justify-center gap-2">
          <Button fullWidth={false} variant="ghost" size="sm" onClick={() => handleEdit(d)} className="w-16 inline-flex items-center justify-center rounded-md bg-blue-200 px-2 py-1 text-xs text-blue-700 hover:bg-blue-50 hover:scale-100 hover:shadow-none">ແກ້ໄຂ</Button>
          <Button fullWidth={false} variant="ghost" size="sm" onClick={() => tableRef.current?.handleDeleteClick?.(d)} className="w-16 inline-flex items-center justify-center rounded-md bg-red-400 px-2 py-1 text-xs text-white hover:bg-red-500 hover:scale-100 hover:shadow-none">ລົບ</Button>
        </div>
      ),
    },
  ], [handleEdit, tableRef]);

  return (
    <div className="space-y-6">
      <GenericToolbar searchText={searchText} onSearchChange={handleSearchChange} onCreate={handleCreate} searchPlaceholder="ຄົ້ນຫາລາຍລະອຽດກຸ່ມເອກະສານ..." createButtonText="ເພີ່ມລາຍລະອຽດ" createButtonIcon={plusIcon} />
      <GenericDataTable data={pageItems} columns={columns} page={safePage} pageSize={pageSize} totalPages={totalPages} totalItems={totalItems} loading={loadingData} onEdit={handleEdit} onDelete={handleDelete} onPageChange={handlePageChange} onPageSizeChange={handlePageSizeChange} rowKey="dcgid" entityName="ລາຍລະອຽດກຸ່ມເອກະສານ" getEntityDisplayName={(d) => d.detailsinfo} ref={tableRef} />
      <DocumentGroupDetailsFormModal key={editingItem?.dcgid || "new"} isOpen={showFormModal} detail={editingItem} onClose={handleCloseModal} onSubmit={handleSubmit} />
      <LoadingDialog isOpen={isLoading} message="ກຳລັງໂຫຼດ..." />
    </div>
  );
}
