import { useState, useRef, useEffect, useCallback } from "react";
import GenericToolbar from "../components/common/GenericToolbar";
import GenericDataTable, { Button } from "../components/common/GenericDataTable";
import BoardFormModal from "../components/boards/BoardFormModal";
import LoadingDialog from "../components/common/LoadingDialog";
import { getAllBoards, deleteBoard, createNewBoard, updateBoard } from "../services/boardservice";

export default function BoardPage() {
  const [boards, setBoards] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [inputText, setInputText] = useState("");
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingBoard, setEditingBoard] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const tableRef = useRef(null);

  const loadBoards = useCallback(async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const result = await getAllBoards({ page, limit: pageSize, search: searchText });
      setBoards(result.data);
      setTotalItems(result.total);
      setTotalPages(result.lastPage || 1);
    } catch (error) {
      console.error("Failed to fetch boards:", error);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [page, pageSize, searchText]);

  useEffect(() => {
    loadBoards();
  }, [loadBoards]);

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

  const handleCreateBoard = () => {
    setEditingBoard(null);
    setShowFormModal(true);
  };

  const handleEditBoard = (board) => {
    setEditingBoard(board);
    setShowFormModal(true);
  };

  const handleCloseModal = () => {
    setShowFormModal(false);
    setEditingBoard(null);
  };

  const handleSubmitBoard = async (formData) => {
    if (editingBoard) {
      await updateBoard({ bdid: editingBoard.bdid, ...formData });
    } else {
      await createNewBoard(formData);
    }
    await loadBoards(true);
  };

  const handleDeleteBoard = async (board) => {
    await deleteBoard(board.bdid);
    await loadBoards(true);
  };

  const columns = [
    {
      key: "index",
      label: "ລຳດັບ",
      align: "left",
      render: (_item, index, page, pageSize) => (page - 1) * pageSize + index + 1,
    },
    { key: "bdid", label: "ລະຫັດ", align: "left" },
    { key: "boardtname", label: "ຊື່ຄະນະກໍາມະການ", align: "left" },
    { key: "createdate", label: "ວັນທີສ້າງ", align: "left" },
    { key: "moreinfo", label: "ລາຍລະອຽດເພີ່ມເຕີມ", align: "left" },
    { key: "createby", label: "ສ້າງໂດຍ", align: "left" },
    {
      key: "actions",
      label: "ຈັດການ",
      align: "left",
      render: (board) => (
        <div className="flex items-center gap-2">
          <Button
            fullWidth={false} variant="ghost" size="sm"
            onClick={() => handleEditBoard(board)}
            className="w-16 inline-flex items-center justify-center rounded-md bg-blue-200 px-2 py-1 text-xs text-blue-700 hover:bg-blue-50 hover:scale-100 hover:shadow-none"
          >
            ແກ້ໄຂ
          </Button>
          <Button
            fullWidth={false} variant="ghost" size="sm"
            onClick={() => tableRef.current?.handleDeleteClick?.(board)}
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
        onCreate={handleCreateBoard}
        searchPlaceholder="ຄົ້ນຫາຄະນະກໍາມະການ..."
        createButtonText="ເພີ່ມຄະນະກໍາມະການ"
        createButtonIcon={
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        }
      />

      <GenericDataTable
        data={boards}
        columns={columns}
        page={safePage}
        pageSize={pageSize}
        totalPages={totalPages}
        totalItems={totalItems}
        onEdit={handleEditBoard}
        onDelete={handleDeleteBoard}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        entityName="ຄະນະກໍາມະການ"
        getEntityDisplayName={(board) => board.boardtname}
        ref={tableRef}
      />

      <BoardFormModal
        key={editingBoard?.bdid || "new"}
        isOpen={showFormModal}
        board={editingBoard}
        onClose={handleCloseModal}
        onSubmit={handleSubmitBoard}
      />

      <LoadingDialog isOpen={isLoading} message="ກຳລັງໂຫຼດ..." />
    </div>
  );
}
