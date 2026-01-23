import { useState, useMemo, useRef } from "react";
import GenericToolbar from "../components/common/GenericToolbar";
import GenericDataTable, { Button } from "../components/common/GenericDataTable";
import PositionFormModal from "../components/positions/PositionFormModal";
import LoadingDialog from "../components/common/LoadingDialog";

const positions = [
  {
    createdate: "2025-11-27 00:00:00",
    pid: "2",
    positionname: "ຮອງອຳນວຍການຊີ້ນຳ ຝ່າຍບັນຊີ-ການເງິນ",
    moreinfo: "",
    statustype: "ADD",
    createby: "IT",
  },
  {
    createdate: "2025-11-28 09:30:00",
    pid: "3",
    positionname: "ຫົວໜ້າພະແນກໄອທີ",
    moreinfo: "ຮັບຜິດຊອບລະບົບ",
    statustype: "ADD",
    createby: "IT",
  },
];

export default function PositionPage() {
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingPosition, setEditingPosition] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Reference to the delete handler from GenericDataTable
  const tableRef = useRef(null);

  // 1) Filter positions
  const filtered = useMemo(() => {
    if (!searchText) return positions;
    const lower = searchText.toLowerCase();
    return positions.filter(
      (p) =>
        p.pid.toString().includes(lower) ||
        p.positionname.toLowerCase().includes(lower) ||
        p.moreinfo.toLowerCase().includes(lower) ||
        p.createby.toLowerCase().includes(lower)
    );
  }, [searchText]);

  // 2) Total pages
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;

  // 3) Safe page
  const safePage = Math.min(Math.max(page, 1), totalPages);

  // 4) Paginate
  const pagePositions = useMemo(
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

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    if (isEdit) {
      console.log("update position", editingPosition.pid, formData);
    } else {
      console.log("create position", formData);
    }
  };

  const handleDeletePosition = async (position) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("delete position", position);
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
        data={pagePositions}
        columns={columns}
        page={safePage}
        pageSize={pageSize}
        totalPages={totalPages}
        totalItems={filtered.length}
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
