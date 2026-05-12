import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import GenericToolbar from "../components/common/GenericToolbar";
import GenericDataTable, { Button } from "../components/common/GenericDataTable";
import Select from "../components/common/Select";
import DocumentGroupDetailsFormModal from "../components/document-group-details/DocumentGroupDetailsFormModal";
import LoadingDialog from "../components/common/LoadingDialog";
import useCrudPage from "../hooks/useCrudPage";
import {
  getAllDocumentGroupDetails,
  createNewDocumentGroupDetails,
  deleteDocumentGroupDetails,
  updateDocumentGroupDetails,
  getDocumentGroupDetailsByDocgroupId,
} from "../services/documentgroupdetailsservice";
import { getAllDocumentGroup } from "../services/documentgroupservice";

const plusIcon = (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

export default function DocumentGroupDetailsPage() {
  const location = useLocation();
  const initialDcdid = location.state?.dcdid != null ? String(location.state.dcdid) : "";
  const [groups, setGroups] = useState([]);
  const [selectedDcdid, setSelectedDcdid] = useState(initialDcdid);

  useEffect(() => {
    const controller = new AbortController();
    getAllDocumentGroup({ page: 1, limit: 1000 }, controller.signal)
      .then((res) => {
        const list = Array.isArray(res) ? res : (res?.data || []);
        setGroups(list);
      })
      .catch((err) => {
        if (err?.name !== "CanceledError" && err?.name !== "AbortError") {
          console.error("Failed to load document groups:", err);
        }
      });
    return () => controller.abort();
  }, []);

  const fetchAll = useCallback(async (params, signal) => {
    if (selectedDcdid) {
      const res = await getDocumentGroupDetailsByDocgroupId(
        selectedDcdid,
        { page: params.page, limit: params.limit, search: params.search },
        signal
      );
      const total = res.total ?? res.data.length;
      const limit = Number(params.limit) || 10;
      return {
        data: res.data,
        total,
        lastPage: Math.ceil(total / limit) || 1,
      };
    }
    return getAllDocumentGroupDetails(params, signal);
  }, [selectedDcdid]);

  const {
    searchText, safePage, pageSize, totalPages, totalItems, pageItems,
    loadingData, isLoading, showFormModal, editingItem, tableRef,
    handleSearchChange, handlePageChange, handlePageSizeChange,
    handleCreate, handleEdit, handleCloseModal, handleSubmit, handleDelete,
  } = useCrudPage({
    fetchAll,
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
          <Button fullWidth={false} variant="ghost" size="sm" onClick={() => handleEdit(d)} className="w-24 inline-flex items-center justify-center gap-1.5 rounded-md bg-blue-200 px-2 py-1 text-xs text-blue-700 hover:bg-blue-50 hover:scale-100 hover:shadow-none"><svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>ແກ້ໄຂ</Button>
          <Button fullWidth={false} variant="ghost" size="sm" onClick={() => tableRef.current?.handleDeleteClick?.(d)} className="w-24 inline-flex items-center justify-center gap-1.5 rounded-md bg-red-400 px-2 py-1 text-xs text-white hover:bg-red-500 hover:scale-100 hover:shadow-none"><svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" /></svg>ລຶບ</Button>
        </div>
      ),
    },
  ], [handleEdit, tableRef]);

  const groupOptions = useMemo(
    () => [
      { value: "", label: "ທຸກກຸ່ມເອກະສານ" },
      ...groups.map((g) => ({ value: String(g.dcdid), label: g.docgroupname })),
    ],
    [groups]
  );

  const groupSelect = (
    <div className="w-56">
      <Select
        value={selectedDcdid}
        onChange={(e) => {
          setSelectedDcdid(e.target.value);
          handlePageChange(1);
        }}
        options={groupOptions}
        placeholder="ເລືອກກຸ່ມເອກະສານ"
        searchable
        rounded="full"
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <GenericToolbar
        searchText={searchText}
        onSearchChange={handleSearchChange}
        onCreate={handleCreate}
        searchPlaceholder="ຄົ້ນຫາລາຍລະອຽດກຸ່ມເອກະສານ..."
        createButtonText="ເພີ່ມລາຍລະອຽດ"
        createButtonIcon={plusIcon}
        searchAddon={groupSelect}
      />
      <GenericDataTable data={pageItems} columns={columns} page={safePage} pageSize={pageSize} totalPages={totalPages} totalItems={totalItems} loading={loadingData} onEdit={handleEdit} onDelete={handleDelete} onPageChange={handlePageChange} onPageSizeChange={handlePageSizeChange} rowKey="dcgid" entityName="ລາຍລະອຽດກຸ່ມເອກະສານ" getEntityDisplayName={(d) => d.detailsinfo} ref={tableRef} />
      <DocumentGroupDetailsFormModal key={editingItem?.dcgid || "new"} isOpen={showFormModal} detail={editingItem} onClose={handleCloseModal} onSubmit={handleSubmit} />
      <LoadingDialog isOpen={isLoading} message="ກຳລັງໂຫຼດ..." />
    </div>
  );
}
