import { useState, useMemo, useRef, useEffect } from "react";
import GenericToolbar from "../components/common/GenericToolbar";
import GenericDataTable, { Button } from "../components/common/GenericDataTable";
import BranchFormModal from "../components/branches/BranchFormModal";
import LoadingDialog from "../components/common/LoadingDialog";
import { getAllBranches, createBranch, deleteBranch, updateBranch } from "../services/branchservice";


export default function BranchPage() {
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [branches, setBranches] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Reference to the delete handler from GenericDataTable
  const tableRef = useRef(null);

  // Fetch branches on mount
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoadingData(true);
        const params = { page, limit: pageSize, search: searchText };
        const data = await getAllBranches(params);
        setBranches(data);
      } catch (error) {
        console.error("Failed to fetch branches:", error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchBranches();
  }, [page, pageSize, searchText]);

  // 1) Filter branches
  const filtered = useMemo(() => {
    if (!searchText) return branches;
    const lower = searchText.toLowerCase();
    return branches.filter(
      (b) =>
        b.brid.toString().includes(lower) ||
        b.branchname.toLowerCase().includes(lower) ||
        b.moreinfo.toLowerCase().includes(lower) ||
        b.createby.toLowerCase().includes(lower)
    );
  }, [searchText, branches]);

  // 2) Total pages
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;

  // 3) Safe page
  const safePage = Math.min(Math.max(page, 1), totalPages);

  // 4) Paginate
  const pageBranches = useMemo(
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

  const handleCreateBranch = () => {
    setIsLoading(true);
    setEditingBranch(null);

    setTimeout(() => {
      setIsLoading(false);
      setShowFormModal(true);
    }, 500);
  };

  const handleEditBranch = (branch) => {
    setIsLoading(true);
    setEditingBranch(branch);

    setTimeout(() => {
      setIsLoading(false);
      setShowFormModal(true);
    }, 500);
  };

  const handleCloseModal = () => {
    setShowFormModal(false);
    setEditingBranch(null);
  };

  const handleSubmitBranch = async (formData) => {
  const isEdit = !!editingBranch;

  try {
    if (isEdit) {
      // ✅ update ต้องส่ง brid ไปด้วย (ตามรูปที่คุณส่ง PUT body)
      await updateBranch({
        brid: editingBranch.brid,
        ...formData,
      });
    } else {
      await createBranch(formData);
    }

    // ✅ Refresh data หลังทำสำเร็จ (ทั้ง add และ edit)
    const params = { page, limit: pageSize, search: searchText };
    const data = await getAllBranches(params);
    setBranches(data);
  } catch (error) {
    console.error("Failed to submit branch:", error);
    throw error;
  }
};


  const handleDeleteBranch = async (branch) => {
    try {
      // เรียก API ลบ branch
      await deleteBranch(branch.brid);

      // Refresh data หลังจากลบสำเร็จ
      const params = { page, limit: pageSize, search: searchText };
      const data = await getAllBranches(params);
      setBranches(data);
    } catch (error) {
      console.error("Failed to delete branch:", error);
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
      key: "brid",
      label: "ລະຫັດ",
      align: "left",
    },
    {
      key: "branchname",
      label: "ຊື່ສາຂາ",
      align: "left",
    },
    {
      key: "createdate",
      label: "ວັນທີສ້າງ",
      align: "left",
    },
    {
      key: "phone",
      label: "ເບີໂທ",
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
      render: (branch) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            branch.statustype === "ADD"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {branch.statustype}
        </span>
      ),
    },
    {
      key: "actions",
      label: "ຈັດການ",
      align: "left",
      render: (branch) => (
        <div className="flex items-center gap-2">
          <Button
            fullWidth={false}
            variant="ghost"
            size="sm"
            onClick={() => handleEditBranch(branch)}
            className="w-16 inline-flex items-center justify-center rounded-md bg-blue-200 px-2 py-1 text-xs text-blue-700 hover:bg-blue-50 hover:scale-100 hover:shadow-none"
          >
            ແກ້ໄຂ
          </Button>

          <Button
            fullWidth={false}
            variant="ghost"
            size="sm"
            onClick={() => tableRef.current?.handleDeleteClick?.(branch)}
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
        onCreate={handleCreateBranch}
        searchPlaceholder="ຄົ້ນຫາສາຂາ..."
        createButtonText="ເພີ່ມສາຂາ"
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
        data={pageBranches}
        columns={columns}
        page={safePage}
        pageSize={pageSize}
        totalPages={totalPages}
        totalItems={filtered.length}
        onEdit={handleEditBranch}
        onDelete={handleDeleteBranch}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        entityName="ສາຂາ"
        getEntityDisplayName={(branch) => branch.branchname}
        ref={tableRef}
      />

      <BranchFormModal
        key={editingBranch?.brid || "new"}
        isOpen={showFormModal}
        branch={editingBranch}
        onClose={handleCloseModal}
        onSubmit={handleSubmitBranch}
      />

      <LoadingDialog isOpen={isLoading} message="ກຳລັງໂຫຼດ..." />
    </div>
  );
}
