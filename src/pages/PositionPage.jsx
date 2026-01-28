import { useState, useRef, useEffect } from "react";
import GenericToolbar from "../components/common/GenericToolbar";
import GenericDataTable, { Button } from "../components/common/GenericDataTable";
import PositionFormModal from "../components/positions/PositionFormModal";
import LoadingDialog from "../components/common/LoadingDialog";
import {
  getAllPositions,
  createNewPosition,
  updatePosition,
  deletePosition,
} from "../services/positionservice";

export default function PositionPage() {
  const [positions, setPositions] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingPosition, setEditingPosition] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Reference to the delete handler from GenericDataTable
  const tableRef = useRef(null);

  // Load positions from API
  const loadPositions = async () => {
    try {
      setIsLoading(true);
      const result = await getAllPositions({
        page,
        limit: pageSize,
        search: searchText,
      });
      console.log("Loaded positions:", result);
      setPositions(result.data);
      setTotalItems(result.total);
      setTotalPages(result.lastPage || 1);
    } catch (error) {
      console.error("Error loading positions:", error);
      alert(error.message || "ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ");
    } finally {
      setIsLoading(false);
    }
  };

  // Load positions on mount and when search/page changes
  useEffect(() => {
    loadPositions();
  }, [page, pageSize, searchText]);

  const safePage = Math.min(Math.max(page, 1), totalPages);

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

  const handleCreatePosition = () => {
    setIsLoading(true);
    setEditingPosition(null);

    setTimeout(() => {
      setIsLoading(false);
      setShowFormModal(true);
    }, 500);
  };

  const handleEditPosition = (position) => {
    setIsLoading(true);
    setEditingPosition(position);

    setTimeout(() => {
      setIsLoading(false);
      setShowFormModal(true);
    }, 500);
  };

  const handleCloseModal = () => {
    setShowFormModal(false);
    setEditingPosition(null);
  };

  const handleSubmitPosition = async (formData) => {
    const isEdit = !!editingPosition;

    if (isEdit) {
      await updatePosition({
        pid: editingPosition.pid,
        ...formData,
      });
    } else {
      await createNewPosition(formData);
    }

    // Reload positions after successful create/edit
    await loadPositions();
  };

  const handleDeletePosition = async (position) => {
    await deletePosition(position.pid);

    // Reload positions after successful delete
    await loadPositions();
  };

  // Define columns configuration
  const columns = [
    {
      key: "index",
      label: "ລຳດັບ",
      align: "left",
      render: (item, index, page, pageSize) => (page - 1) * pageSize + index + 1,
    },
    {
      key: "pid",
      label: "ລະຫັດ",
      align: "left",
    },
    {
      key: "positionname",
      label: "ຊື່ຕຳແໜ່ງ",
      align: "left",
    },
    {
      key: "createdate",
      label: "ວັນທີສ້າງ",
      align: "left",
    },
    {
      key: "moreinfo",
      label: "ລາຍລະອຽດເພີ່ມເຕີມ",
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
      align: "left",
      render: (position) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            position.statustype === "ADD"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {position.statustype}
        </span>
      ),
    },
    {
      key: "actions",
      label: "ຈັດການ",
      align: "left",
      render: (position) => (
        <div className="flex items-center gap-2">
          <Button
            fullWidth={false}
            variant="ghost"
            size="sm"
            onClick={() => handleEditPosition(position)}
            className="w-16 inline-flex items-center justify-center rounded-md bg-blue-200 px-2 py-1 text-xs text-blue-700 hover:bg-blue-50 hover:scale-100 hover:shadow-none"
          >
            ແກ້ໄຂ
          </Button>

          <Button
            fullWidth={false}
            variant="ghost"
            size="sm"
            onClick={() => tableRef.current?.handleDeleteClick?.(position)}
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
        searchText={searchText}
        onSearchChange={handleSearchChange}
        onCreate={handleCreatePosition}
        searchPlaceholder="ຄົ້ນຫາຕຳແໜ່ງ..."
        createButtonText="ເພີ່ມຕຳແໜ່ງ"
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
        data={positions}
        columns={columns}
        page={safePage}
        pageSize={pageSize}
        totalPages={totalPages}
        totalItems={totalItems}
        onEdit={handleEditPosition}
        onDelete={handleDeletePosition}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        entityName="ຕຳແໜ່ງ"
        getEntityDisplayName={(position) => position.positionname}
        ref={tableRef}
      />

      <PositionFormModal
        key={editingPosition?.pid || "new"}
        isOpen={showFormModal}
        position={editingPosition}
        onClose={handleCloseModal}
        onSubmit={handleSubmitPosition}
      />

      <LoadingDialog isOpen={isLoading} message="ກຳລັງໂຫຼດ..." />
    </div>
  );
}
