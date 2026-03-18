import { useState, useRef, useEffect, useCallback } from "react";
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
  const [inputText, setInputText] = useState("");
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingPosition, setEditingPosition] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const tableRef = useRef(null);

  const loadPositions = useCallback(async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const result = await getAllPositions({ page, limit: pageSize, search: searchText });
      setPositions(result.data);
      setTotalItems(result.total);
      setTotalPages(result.lastPage || 1);
    } catch (error) {
      console.error("Failed to fetch positions:", error);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [page, pageSize, searchText]);

  useEffect(() => {
    loadPositions();
  }, [loadPositions]);

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

  const handleCreatePosition = () => {
    setEditingPosition(null);
    setShowFormModal(true);
  };

  const handleEditPosition = (position) => {
    setEditingPosition(position);
    setShowFormModal(true);
  };

  const handleCloseModal = () => {
    setShowFormModal(false);
    setEditingPosition(null);
  };

  const handleSubmitPosition = async (formData) => {
    if (editingPosition) {
      await updatePosition({ pid: editingPosition.pid, ...formData });
    } else {
      await createNewPosition(formData);
    }
    await loadPositions(true);
  };

  const handleDeletePosition = async (position) => {
    await deletePosition(position.pid);
    await loadPositions(true);
  };

  const columns = [
    {
      key: "index",
      label: "ລຳດັບ",
      align: "left",
      render: (item, index, page, pageSize) => (page - 1) * pageSize + index + 1,
    },
    { key: "pid", label: "ລະຫັດ", align: "left" },
    { key: "positionname", label: "ຊື່ຕຳແໜ່ງ", align: "left" },
    { key: "createdate", label: "ວັນທີສ້າງ", align: "left" },
    { key: "moreinfo", label: "ລາຍລະອຽດເພີ່ມເຕີມ", align: "left" },
    { key: "createby", label: "ສ້າງໂດຍ", align: "left" },
    {
      key: "actions",
      label: "ຈັດການ",
      align: "left",
      render: (position) => (
        <div className="flex items-center gap-2">
          <Button
            fullWidth={false} variant="ghost" size="sm"
            onClick={() => handleEditPosition(position)}
            className="w-16 inline-flex items-center justify-center rounded-md bg-blue-200 px-2 py-1 text-xs text-blue-700 hover:bg-blue-50 hover:scale-100 hover:shadow-none"
          >
            ແກ້ໄຂ
          </Button>
          <Button
            fullWidth={false} variant="ghost" size="sm"
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
        searchText={inputText}
        onSearchChange={handleSearchChange}
        onSearch={handleSearch}
        onCreate={handleCreatePosition}
        searchPlaceholder="ຄົ້ນຫາຕຳແໜ່ງ..."
        createButtonText="ເພີ່ມຕຳແໜ່ງ"
        createButtonIcon={
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
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