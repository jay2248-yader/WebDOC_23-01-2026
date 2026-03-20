import { useMemo } from "react";
import GenericToolbar from "../components/common/GenericToolbar";
import GenericDataTable, { Button } from "../components/common/GenericDataTable";
import GroupappFormModal from "../components/groupapps/GroupappFormModal";
import LoadingDialog from "../components/common/LoadingDialog";
import useCrudPage from "../hooks/useCrudPage";
import { getAllGroupapps, deleteGroupapp, createNewGroupapp, updateGroupapp } from "../services/groupappservice";

const plusIcon = (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

export default function GroupappPage() {
  const {
    searchText, safePage, pageSize, totalPages, totalItems, pageItems,
    loadingData, isLoading, showFormModal, editingItem, tableRef,
    handleSearchChange, handlePageChange, handlePageSizeChange,
    handleCreate, handleEdit, handleCloseModal, handleSubmit, handleDelete,
  } = useCrudPage({
    fetchAll: getAllGroupapps,
    createItem: createNewGroupapp,
    updateItem: updateGroupapp,
    deleteItem: deleteGroupapp,
    idKey: "gid",
    filterFn: (g, s) =>
      g.gid.toString().includes(s) ||
      g.groupname.toLowerCase().includes(s) ||
      (g.groupinfo && g.groupinfo.toLowerCase().includes(s)) ||
      g.createby.toLowerCase().includes(s),
  });

  const columns = useMemo(() => [
    { key: "index", label: "ລຳດັບ", align: "left", render: (_item, index, page, pageSize) => (page - 1) * pageSize + index + 1 },
    { key: "gid", label: "ລະຫັດ", align: "left" },
    { key: "groupname", label: "ຊື່", align: "left" },
    { key: "createdate", label: "ວັນທີສ້າງ", align: "left" },
    { key: "groupinfo", label: "ລາຍລະອຽດເພີ່ມເຕີມ", align: "left" },
    { key: "createby", label: "ສ້າງໂດຍ", align: "left" },
    {
      key: "statustype", label: "ສະຖານະ", align: "left",
      render: (g) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${g.statustype === "ADD" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
          {g.statustype}
        </span>
      ),
    },
    {
      key: "actions", label: "ຈັດການ", align: "left",
      render: (g) => (
        <div className="flex items-center gap-2">
          <Button fullWidth={false} variant="ghost" size="sm" onClick={() => handleEdit(g)} className="w-16 inline-flex items-center justify-center rounded-md bg-blue-200 px-2 py-1 text-xs text-blue-700 hover:bg-blue-50 hover:scale-100 hover:shadow-none">ແກ້ໄຂ</Button>
          <Button fullWidth={false} variant="ghost" size="sm" onClick={() => tableRef.current?.handleDeleteClick?.(g)} className="w-16 inline-flex items-center justify-center rounded-md bg-red-400 px-2 py-1 text-xs text-white hover:bg-red-500 hover:scale-100 hover:shadow-none">ລົບ</Button>
        </div>
      ),
    },
  ], [handleEdit, tableRef]);

  return (
    <div className="space-y-6">
      <GenericToolbar searchText={searchText} onSearchChange={handleSearchChange} onCreate={handleCreate} searchPlaceholder="ຄົ້ນຫາ Groupapp..." createButtonText="ເພີ່ມ Groupapp" createButtonIcon={plusIcon} />
      <GenericDataTable data={pageItems} columns={columns} page={safePage} pageSize={pageSize} totalPages={totalPages} totalItems={totalItems} loading={loadingData} onEdit={handleEdit} onDelete={handleDelete} onPageChange={handlePageChange} onPageSizeChange={handlePageSizeChange} rowKey="gid" entityName="Groupapp" getEntityDisplayName={(g) => g.groupname} ref={tableRef} />
      <GroupappFormModal key={editingItem?.gid || "new"} isOpen={showFormModal} groupapp={editingItem} onClose={handleCloseModal} onSubmit={handleSubmit} />
      <LoadingDialog isOpen={isLoading} message="ກຳລັງໂຫຼດ..." />
    </div>
  );
}
