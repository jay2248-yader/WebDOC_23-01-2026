import { useState, useMemo, useRef, useEffect } from "react";
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
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingDetail, setEditingDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [details, setDetails] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  const tableRef = useRef(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoadingData(true);
        const params = { page, limit: pageSize, search: searchText };
        const result = await getAllDocumentGroupDetails(params);
        setDetails(result.data);
      } catch (error) {
        console.error("Failed to fetch document group details:", error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchDetails();
  }, [page, pageSize, searchText]);

  const filtered = useMemo(() => {
    if (!searchText) return details;
    const lower = searchText.toLowerCase();
    return details.filter(
      (d) =>
        d.dcgid?.toString().includes(lower) ||
        d.detailsinfo?.toLowerCase().includes(lower) ||
        d.documentgroupmodel?.docgroupname?.toLowerCase().includes(lower)
    );
  }, [searchText, details]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const safePage = Math.min(Math.max(page, 1), totalPages);

  const pageDetails = useMemo(
    () => filtered.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filtered, safePage, pageSize]
  );

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

  const handleCreateDetail = () => {
    setIsLoading(true);
    setEditingDetail(null);

    setTimeout(() => {
      setIsLoading(false);
      setShowFormModal(true);
    }, 500);
  };

  const handleEditDetail = (detail) => {
    setIsLoading(true);
    setEditingDetail(detail);

    setTimeout(() => {
      setIsLoading(false);
      setShowFormModal(true);
    }, 500);
  };

  const handleCloseModal = () => {
    setShowFormModal(false);
    setEditingDetail(null);
  };

  const handleSubmitDetail = async (formData) => {
    const isEdit = !!editingDetail;

    try {
      if (isEdit) {
        await updateDocumentGroupDetails({ dcgid: editingDetail.dcgid, ...formData });
      } else {
        await createNewDocumentGroupDetails(formData);
      }

      const params = { page, limit: pageSize, search: searchText };
      const result = await getAllDocumentGroupDetails(params);
      setDetails(result.data);
    } catch (error) {
      console.error("Failed to submit document group details:", error);
      throw error;
    }
  };

  const handleDeleteDetail = async (detail) => {
    try {
      await deleteDocumentGroupDetails(detail.dcgid);

      const params = { page, limit: pageSize, search: searchText };
      const result = await getAllDocumentGroupDetails(params);
      setDetails(result.data);
    } catch (error) {
      console.error("Failed to delete document group details:", error);
      throw error;
    }
  };

  const columns = [
    {
      key: "index",
      label: "ລຳດັບ",
      align: "center",
      render: (item, index, page, pageSize) => (page - 1) * pageSize + index + 1,
    },
    {
      key: "dcgid",
      label: "ລະຫັດ",
      align: "left",
    },
    {
      key: "dcdid",
      label: "ລະຫັດກຸ່ມ",
      align: "left",
    },
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
    {
      key: "userid",
      label: "ລະຫັດຜູ້ໃຊ້",
      align: "left",
    },
    {
      key: "detailsinfo",
      label: "ລາຍລະອຽດ",
      align: "left",
    },
    {
      key: "maxsignmoney",
      label: "ເງິນສູງສຸດ",
      align: "right",
      render: (d) => d.maxsignmoney?.toLocaleString() ?? "-",
    },
    {
      key: "createdate",
      label: "ວັນທີສ້າງ",
      align: "left",
    },
    {
      key: "createby",
      label: "ສ້າງໂດຍ",
      align: "left",
    },
    {
      key: "statustype",
      label: "ສະຖານະ",
      align: "center",
      render: (d) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            d.statustype === "ADD"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {d.statustype}
        </span>
      ),
    },
    {
      key: "actions",
      label: "ຈັດການ",
      align: "center",
      render: (d) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            fullWidth={false}
            variant="ghost"
            size="sm"
            onClick={() => handleEditDetail(d)}
            className="w-16 inline-flex items-center justify-center rounded-md bg-blue-200 px-2 py-1 text-xs text-blue-700 hover:bg-blue-50 hover:scale-100 hover:shadow-none"
          >
            ແກ້ໄຂ
          </Button>

          <Button
            fullWidth={false}
            variant="ghost"
            size="sm"
            onClick={() => tableRef.current?.handleDeleteClick?.(d)}
            className="w-16 inline-flex items-center justify-center rounded-md bg-red-400 px-2 py-1 text-xs text-white hover:bg-red-500 hover:scale-100 hover:shadow-none"
          >
            ລົບ
          </Button>
        </div>
      ),
    },
  ];

  if (loadingData) {
    return <LoadingDialog isOpen={true} message="ກຳລັງໂຫຼດຂໍ້ມູນ..." />;
  }

  return (
    <div className="space-y-6">
      <GenericToolbar
        searchText={searchText}
        onSearchChange={handleSearchChange}
        onCreate={handleCreateDetail}
        searchPlaceholder="ຄົ້ນຫາລາຍລະອຽດກຸ່ມເອກະສານ..."
        createButtonText="ເພີ່ມລາຍລະອຽດ"
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
        data={pageDetails}
        columns={columns}
        page={safePage}
        pageSize={pageSize}
        totalPages={totalPages}
        totalItems={filtered.length}
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
