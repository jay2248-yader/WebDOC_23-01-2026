import { useState, useRef, useEffect, useCallback } from "react";
import GenericToolbar from "../components/common/GenericToolbar";
import GenericDataTable, { Button } from "../components/common/GenericDataTable";
import BranchFormModal from "../components/branches/BranchFormModal";
import LoadingDialog from "../components/common/LoadingDialog";
import { getAllBranches, createBranch, deleteBranch, updateBranch } from "../services/branchservice";

export default function BranchPage() {
  const [branches, setBranches] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [inputText, setInputText] = useState("");
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const tableRef = useRef(null);

  const loadBranches = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await getAllBranches({ page, limit: pageSize, search: searchText });
      setBranches(result.data);
      setTotalItems(result.total);
      setTotalPages(result.lastPage || 1);
    } catch (error) {
      console.error("Failed to fetch branches:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, searchText]);

  useEffect(() => {
    loadBranches();
  }, [loadBranches]);

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

  const handleCreateBranch = () => {
    setEditingBranch(null);
    setShowFormModal(true);
  };

  const handleEditBranch = (branch) => {
    setEditingBranch(branch);
    setShowFormModal(true);
  };

  const handleCloseModal = () => {
    setShowFormModal(false);
    setEditingBranch(null);
  };

  const handleSubmitBranch = async (formData) => {
    if (editingBranch) {
      await updateBranch({ brid: editingBranch.brid, ...formData });
    } else {
      await createBranch(formData);
    }
    await loadBranches();
  };

  const handleDeleteBranch = async (branch) => {
    await deleteBranch(branch.brid);
    await loadBranches();
  };

  const columns = [
    {
      key: "index",
      label: "ລຳດັບ",
      align: "left",
      render: (_item, index, page, pageSize) => (page - 1) * pageSize + index + 1,
    },
    { key: "brid", label: "ລະຫັດ", align: "left" },
    { key: "branchname", label: "ຊື່ສາຂາ", align: "left" },
    { key: "createdate", label: "ວັນທີສ້າງ", align: "left" },
    { key: "phone", label: "ເບີໂທ", align: "left" },
    { key: "moreinfo", label: "ລາຍລະອຽດເພີ່ມເຕີມ", align: "left" },
    { key: "createby", label: "ສ້າງໂດຍ", align: "left" },
    {
      key: "actions",
      label: "ຈັດການ",
      align: "left",
      render: (branch) => (
        <div className="flex items-center gap-2">
          <Button
            fullWidth={false} variant="ghost" size="sm"
            onClick={() => handleEditBranch(branch)}
            className="w-16 inline-flex items-center justify-center rounded-md bg-blue-200 px-2 py-1 text-xs text-blue-700 hover:bg-blue-50 hover:scale-100 hover:shadow-none"
          >
            ແກ້ໄຂ
          </Button>
          <Button
            fullWidth={false} variant="ghost" size="sm"
            onClick={() => tableRef.current?.handleDeleteClick?.(branch)}
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
        onCreate={handleCreateBranch}
        searchPlaceholder="ຄົ້ນຫາສາຂາ..."
        createButtonText="ເພີ່ມສາຂາ"
        createButtonIcon={
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        }
      />

      <GenericDataTable
        data={branches}
        columns={columns}
        page={safePage}
        pageSize={pageSize}
        totalPages={totalPages}
        totalItems={totalItems}
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
