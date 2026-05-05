import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import GenericToolbar from "../components/common/GenericToolbar";
import GenericDataTable, { Button } from "../components/common/GenericDataTable";
import DocumentGroupFormModal from "../components/document-groups/DocumentGroupFormModal";
import LoadingDialog from "../components/common/LoadingDialog";
import ConfirmProgressDialog from "../components/common/ConfirmProgressDialog";
import useCrudPage from "../hooks/useCrudPage";
import { getAllDocumentGroup, createNewDocumentGroup, deleteDocumentGroup, updateDocumentGroup } from "../services/documentgroupservice";
import { getDocumentGroupDetailsByDocgroupId } from "../services/documentgroupdetailsservice";

const plusIcon = (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

export default function DocumentGroupPage() {
  const navigate = useNavigate();
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

  const [blockAlert, setBlockAlert] = useState({ open: false, message: "", dcdid: null });
  const [checkingDelete, setCheckingDelete] = useState(false);

  const requestDelete = useCallback(async (dg) => {
    setCheckingDelete(true);
    try {
      const res = await getDocumentGroupDetailsByDocgroupId(dg.dcdid);
      const count = res?.data?.length || 0;
      if (count > 0) {
        setBlockAlert({
          open: true,
          message: `ບໍ່ສາມາດລົບກຸ່ມ "${dg.docgroupname}" ໄດ້. ກະລຸນາລົບລາຍລະອຽດທັງໝົດ (${count} ລາຍການ) ກ່ອນ`,
          dcdid: dg.dcdid,
        });
        return;
      }
      tableRef.current?.handleDeleteClick?.(dg);
    } catch (err) {
      console.error(err);
      tableRef.current?.handleDeleteClick?.(dg);
    } finally {
      setCheckingDelete(false);
    }
  }, [tableRef]);

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
          <Button fullWidth={false} variant="ghost" size="sm" onClick={() => handleEdit(dg)} className="w-24 inline-flex items-center justify-center gap-1.5 rounded-md bg-blue-200 px-2 py-1 text-xs text-blue-700 hover:bg-blue-50 hover:scale-100 hover:shadow-none"><svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>ແກ້ໄຂ</Button>
          <Button fullWidth={false} variant="ghost" size="sm" onClick={() => requestDelete(dg)} className="w-24 inline-flex items-center justify-center gap-1.5 rounded-md bg-red-400 px-2 py-1 text-xs text-white hover:bg-red-500 hover:scale-100 hover:shadow-none"><svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" /></svg>ລົບ</Button>
        </div>
      ),
    },
  ], [handleEdit, requestDelete]);

  return (
    <div className="space-y-6">
      <GenericToolbar searchText={searchText} onSearchChange={handleSearchChange} onCreate={handleCreate} searchPlaceholder="ຄົ້ນຫາກຸ່ມເອກະສານ..." createButtonText="ເພີ່ມກຸ່ມເອກະສານ" createButtonIcon={plusIcon} />
      <GenericDataTable data={pageItems} columns={columns} page={safePage} pageSize={pageSize} totalPages={totalPages} totalItems={totalItems} loading={loadingData} onEdit={handleEdit} onDelete={handleDelete} onPageChange={handlePageChange} onPageSizeChange={handlePageSizeChange} rowKey="dcdid" entityName="ກຸ່ມເອກະສານ" getEntityDisplayName={(dg) => dg.docgroupname} ref={tableRef} />
      <DocumentGroupFormModal key={editingItem?.dcdid || "new"} isOpen={showFormModal} documentGroup={editingItem} existingLevels={pageItems.map((g) => g.levelapprove).filter((v) => v != null)} onClose={handleCloseModal} onSubmit={handleSubmit} />
      <LoadingDialog isOpen={isLoading || checkingDelete} message={checkingDelete ? "ກຳລັງກວດສອບ..." : "ກຳລັງໂຫຼດ..."} />
      <ConfirmProgressDialog
        isOpen={blockAlert.open}
        status="confirm"
        danger
        title="ບໍ່ສາມາດລົບໄດ້"
        message={blockAlert.message}
        confirmText="ດູ"
        cancelText="ຍົກເລີກ"
        onConfirm={() => {
          const { dcdid } = blockAlert;
          setBlockAlert({ open: false, message: "", dcdid: null });
          navigate("/document-group-details", { state: { dcdid } });
        }}
        onCancel={() => setBlockAlert({ open: false, message: "", dcdid: null })}
        onClose={() => setBlockAlert({ open: false, message: "", dcdid: null })}
      />
    </div>
  );
}
