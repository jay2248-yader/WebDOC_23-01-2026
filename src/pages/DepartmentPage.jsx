import { useMemo } from "react";
import GenericToolbar from "../components/common/GenericToolbar";
import GenericDataTable, { Button } from "../components/common/GenericDataTable";
import DepartmentFormModal from "../components/departments/DepartmentFormModal";
import LoadingDialog from "../components/common/LoadingDialog";
import useCrudPage from "../hooks/useCrudPage";
import { getAllDepartments, deleteDepartment, createNewDepartment, updateDepartment } from "../services/departmentservice";

const plusIcon = (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

export default function DepartmentPage() {
  const {
    searchText, safePage, pageSize, totalPages, totalItems, pageItems,
    loadingData, isLoading, showFormModal, editingItem, tableRef,
    handleSearchChange, handlePageChange, handlePageSizeChange,
    handleCreate, handleEdit, handleCloseModal, handleSubmit, handleDelete,
  } = useCrudPage({
    fetchAll: getAllDepartments,
    createItem: createNewDepartment,
    updateItem: updateDepartment,
    deleteItem: deleteDepartment,
    idKey: "dpid",
  });

  const columns = useMemo(() => [
    { key: "index", label: "ລຳດັບ", align: "left", render: (_item, index, page, pageSize) => (page - 1) * pageSize + index + 1 },
    { key: "dpid", label: "ລະຫັດພະແນກ", align: "left" },
    { key: "bdid", label: "ລະຫັດຄະນະ", align: "left" },
    { key: "departmentname", label: "ຊື່ພະແນກ", align: "left" },
    { key: "createdate", label: "ວັນທີສ້າງ", align: "left" },
    { key: "moreinfo", label: "ລາຍລະອຽດເພີ່ມເຕີມ", align: "left" },
    { key: "createby", label: "ສ້າງໂດຍ", align: "left" },
    {
      key: "actions", label: "ຈັດການ", align: "left",
      render: (d) => (
        <div className="flex items-center gap-2">
          <Button fullWidth={false} variant="ghost" size="sm" onClick={() => handleEdit(d)} className="w-16 inline-flex items-center justify-center rounded-md bg-blue-200 px-2 py-1 text-xs text-blue-700 hover:bg-blue-50 hover:scale-100 hover:shadow-none">ແກ້ໄຂ</Button>
          <Button fullWidth={false} variant="ghost" size="sm" onClick={() => tableRef.current?.handleDeleteClick?.(d)} className="w-16 inline-flex items-center justify-center rounded-md bg-red-400 px-2 py-1 text-xs text-white hover:bg-red-500 hover:scale-100 hover:shadow-none">ລົບ</Button>
        </div>
      ),
    },
  ], [handleEdit, tableRef]);

  return (
    <div className="space-y-6">
      <GenericToolbar searchText={searchText} onSearchChange={handleSearchChange} onCreate={handleCreate} searchPlaceholder="ຄົ້ນຫາພະແນກ..." createButtonText="ເພີ່ມພະແນກ" createButtonIcon={plusIcon} />
      <GenericDataTable data={pageItems} columns={columns} page={safePage} pageSize={pageSize} totalPages={totalPages} totalItems={totalItems} loading={loadingData} onEdit={handleEdit} onDelete={handleDelete} onPageChange={handlePageChange} onPageSizeChange={handlePageSizeChange} rowKey="dpid" entityName="ພະແນກ" getEntityDisplayName={(d) => d.departmentname} ref={tableRef} />
      <DepartmentFormModal key={editingItem?.dpid || "new"} isOpen={showFormModal} department={editingItem} onClose={handleCloseModal} onSubmit={handleSubmit} />
      <LoadingDialog isOpen={isLoading} message="ກຳລັງໂຫຼດ..." />
    </div>
  );
}
