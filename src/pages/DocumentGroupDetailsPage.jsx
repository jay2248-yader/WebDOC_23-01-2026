import { useState, useRef, useEffect, useCallback } from "react";
import GenericToolbar from "../components/common/GenericToolbar";
import GenericDataTable, { Button } from "../components/common/GenericDataTable";
import DocumentGroupDetailsFormModal from "../components/document-group-details/DocumentGroupDetailsFormModal";
import LoadingDialog from "../components/common/LoadingDialog";
import {
  getAllDocumentGroupDetails,
  createNewDocumentGroupDetails,
  deleteDocumentGroupDetails,
  updateDocumentGroupDetails,
} from "../services/documentgroupdetailsservice";

export default function DocumentGroupDetailsPage() {
  const [details, setDetails] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [inputText, setInputText] = useState("");
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingDetail, setEditingDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const tableRef = useRef(null);

  const loadDetails = useCallback(async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const result = await getAllDocumentGroupDetails({ page, limit: pageSize, search: searchText });
      setDetails(result.data);
      setTotalItems(result.total);
      setTotalPages(result.lastPage || 1);
    } catch (error) {
      console.error("Failed to fetch document group details:", error);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [page, pageSize, searchText]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

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

  const handleCreateDetail = () => {
    setEditingDetail(null);
    setShowFormModal(true);
  };

  const handleEditDetail = (detail) => {
    setEditingDetail(detail);
    setShowFormModal(true);
  };

  const handleCloseModal = () => {
    setShowFormModal(false);
    setEditingDetail(null);
  };

  const handleSubmitDetail = async (formData) => {
    if (editingDetail) {
      await updateDocumentGroupDetails({ dcgid: editingDetail.dcgid, ...formData });
    } else {
      await createNewDocumentGroupDetails(formData);
    }
    await loadDetails(true);
  };

  const handleDeleteDetail = async (detail) => {
    await deleteDocumentGroupDetails(detail.dcgid);
    await loadDetails(true);
  };

  const columns = [
    {
      key: "index",
      label: "ລຳດັບ",
      align: "center",
      render: (_item, index, page, pageSize) => (page - 1) * pageSize + index + 1,
    },
    { key: "dcgid", label: "ລະຫັດ", align: "left" },
    { key: "dcdid", label: "ລະຫັດກຸ່ມ", align: "left" },
    {
      key: "docgroupname",
      label: "ຊື່ກຸ່ມເອກະສານ",
      align: "left",
      render: (d) => d.documentgroupmodel?.docgroupname || "-",
    },
    {
      key: "levelapprove",
      label: "ລະດັບອະນຸມັດ",
      align: "center",
      render: (d) => d.documentgroupmodel?.levelapprove ?? "-",
    },
    {
      key: "doccategoryname",
      label: "ປະເພດເອກະສານ",
      align: "left",
      render: (d) => d.documentgroupmodel?.documentcategorymodel?.doccategoryname || "-",
    },
    { key: "userid", label: "ລະຫັດຜູ້ໃຊ້", align: "left" },
    { key: "detailsinfo", label: "ລາຍລະອຽດ", align: "left" },
    {
      key: "maxsignmoney",
      label: "ເງິນສູງສຸດ",
      align: "right",
      render: (d) => d.maxsignmoney?.toLocaleString() ?? "-",
    },
    { key: "createdate", label: "ວັນທີສ້າງ", align: "left" },
    { key: "createby", label: "ສ້າງໂດຍ", align: "left" },
    {
      key: "actions",
      label: "ຈັດການ",
      align: "center",
      render: (d) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            fullWidth={false} variant="ghost" size="sm"
            onClick={() => handleEditDetail(d)}
            className="w-16 inline-flex items-center justify-center rounded-md bg-blue-200 px-2 py-1 text-xs text-blue-700 hover:bg-blue-50 hover:scale-100 hover:shadow-none"
          >
            ແກ້ໄຂ
          </Button>
          <Button
            fullWidth={false} variant="ghost" size="sm"
            onClick={() => tableRef.current?.handleDeleteClick?.(d)}
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
        onCreate={handleCreateDetail}
        searchPlaceholder="ຄົ້ນຫາລາຍລະອຽດກຸ່ມເອກະສານ..."
        createButtonText="ເພີ່ມລາຍລະອຽດ"
        createButtonIcon={
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        }
      />

      <GenericDataTable
        data={details}
        columns={columns}
        page={safePage}
        pageSize={pageSize}
        totalPages={totalPages}
        totalItems={totalItems}
        onEdit={handleEditDetail}
        onDelete={handleDeleteDetail}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        entityName="ລາຍລະອຽດກຸ່ມເອກະສານ"
        getEntityDisplayName={(d) => d.detailsinfo}
        ref={tableRef}
      />

      <DocumentGroupDetailsFormModal
        key={editingDetail?.dcgid || "new"}
        isOpen={showFormModal}
        detail={editingDetail}
        onClose={handleCloseModal}
        onSubmit={handleSubmitDetail}
      />

      <LoadingDialog isOpen={isLoading} message="ກຳລັງໂຫຼດ..." />
    </div>
  );
}
