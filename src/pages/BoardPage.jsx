import { useState, useMemo, useRef, useEffect } from "react";
import GenericToolbar from "../components/common/GenericToolbar";
import GenericDataTable, { Button } from "../components/common/GenericDataTable";
import BoardFormModal from "../components/boards/BoardFormModal";
import LoadingDialog from "../components/common/LoadingDialog";
import { getAllBoards, deleteBoard } from "../services/boardservice";


export default function BoardPage() {
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingBoard, setEditingBoard] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [boards, setBoards] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Reference to the delete handler from GenericDataTable
  const tableRef = useRef(null);

  // Fetch boards on mount
  useEffect(() => {
    const fetchBoards = async () => {
      try {
        setLoadingData(true);
        const params = { page, limit: pageSize, search: searchText };
        const data = await getAllBoards(params);
        setBoards(data);
      } catch (error) {
        console.error("Failed to fetch boards:", error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchBoards();
  }, [page, pageSize, searchText]);

  // 1) Filter boards
  const filtered = useMemo(() => {
    if (!searchText) return boards;
    const lower = searchText.toLowerCase();
    return boards.filter(
      (b) =>
        b.bdid.toString().includes(lower) ||
        b.boardtname.toLowerCase().includes(lower) ||
        b.moreinfo.toLowerCase().includes(lower) ||
        b.createby.toLowerCase().includes(lower)
    );
  }, [searchText, boards]);

  // 2) Total pages
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;

  // 3) Safe page
  const safePage = Math.min(Math.max(page, 1), totalPages);

  // 4) Paginate
  const pageBoards = useMemo(
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

  const handleCreateBoard = () => {
    setIsLoading(true);
    setEditingBoard(null);

    setTimeout(() => {
      setIsLoading(false);
      setShowFormModal(true);
    }, 500);
  };

  const handleEditBoard = (board) => {
    setIsLoading(true);
    setEditingBoard(board);

    setTimeout(() => {
      setIsLoading(false);
      setShowFormModal(true);
    }, 500);
  };

  const handleCloseModal = () => {
    setShowFormModal(false);
    setEditingBoard(null);
  };

  const handleSubmitBoard = async (formData) => {
    const isEdit = !!editingBoard;

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    if (isEdit) {
      console.log("update board", editingBoard.bdid, formData);
    } else {
      console.log("create board", formData);
    }
  };

  const handleDeleteBoard = async (board) => {
    try {
      await deleteBoard(board.bdid);

      // Refresh data หลังจากลบสำเร็จ
      const params = { page, limit: pageSize, search: searchText };
      const data = await getAllBoards(params);
      setBoards(data);
    } catch (error) {
      console.error("Failed to delete board:", error);
      throw error;
    }
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
      key: "bdid",
      label: "ລະຫັດ",
      align: "left",
    },
    {
      key: "boardtname",
      label: "ຊື່ຄະນະກໍາມະການ",
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
      render: (board) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            board.statustype === "ADD"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {board.statustype}
        </span>
      ),
    },
    {
      key: "actions",
      label: "ຈັດການ",
      align: "left",
      render: (board) => (
        <div className="flex items-center gap-2">
          <Button
            fullWidth={false}
            variant="ghost"
            size="sm"
            onClick={() => handleEditBoard(board)}
            className="w-16 inline-flex items-center justify-center rounded-md bg-blue-200 px-2 py-1 text-xs text-blue-700 hover:bg-blue-50 hover:scale-100 hover:shadow-none"
          >
            ແກ້ໄຂ
          </Button>

          <Button
            fullWidth={false}
            variant="ghost"
            size="sm"
            onClick={() => tableRef.current?.handleDeleteClick?.(board)}
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
        onCreate={handleCreateBoard}
        searchPlaceholder="ຄົ້ນຫາຄະນະກໍາມະການ..."
        createButtonText="ເພີ່ມຄະນະກໍາມະການ"
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
        data={pageBoards}
        columns={columns}
        page={safePage}
        pageSize={pageSize}
        totalPages={totalPages}
        totalItems={filtered.length}
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
