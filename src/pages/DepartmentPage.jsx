import { useState, useRef, useEffect, useCallback } from "react";
import GenericToolbar from "../components/common/GenericToolbar";
import GenericDataTable, { Button } from "../components/common/GenericDataTable";
import DepartmentFormModal from "../components/departments/DepartmentFormModal";
import LoadingDialog from "../components/common/LoadingDialog";
import { getAllDepartments, deleteDepartment, createNewDepartment, updateDepartment } from "../services/departmentservice";


export default function DepartmentPage() {
  const [departments, setDepartments] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [inputText, setInputText] = useState("");
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const tableRef = useRef(null);

  const loadDepartments = useCallback(async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const result = await getAllDepartments({ page, limit: pageSize, search: searchText });
      setDepartments(result.data);
      setTotalItems(result.total);
      setTotalPages(result.lastPage || 1);
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [page, pageSize, searchText]);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

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

  const handleCreateDepartment = () => {
    setEditingDepartment(null);
    setShowFormModal(true);
  };

  const handleEditDepartment = (department) => {
    setEditingDepartment(department);
    setShowFormModal(true);
  };

  const handleCloseModal = () => {
    setShowFormModal(false);
    setEditingDepartment(null);
  };

  const handleSubmitDepartment = async (formData) => {
    if (editingDepartment) {
      await updateDepartment({ dpid: editingDepartment.dpid, ...formData });
    } else {
      await createNewDepartment(formData);
    }
    await loadDepartments(true);
  };

  const handleDeleteDepartment = async (department) => {
    await deleteDepartment(department.dpid);
    await loadDepartments(true);
  };

  const columns = [
    {
      key: "index",
      label: "ລຳດັບ",
      align: "left",
      render: (_item, index, page, pageSize) => (page - 1) * pageSize + index + 1,
    },
    { key: "dpid", label: "ລະຫັດພະແນກ", align: "left" },
    { key: "bdid", label: "ລະຫັດຄະນະ", align: "left" },
    { key: "departmentname", label: "ຊື່ພະແນກ", align: "left" },
    { key: "createdate", label: "ວັນທີສ້າງ", align: "left" },
    { key: "moreinfo", label: "ລາຍລະອຽດເພີ່ມເຕີມ", align: "left" },
    { key: "createby", label: "ສ້າງໂດຍ", align: "left" },
    {
      key: "actions",
      label: "ຈັດການ",
      align: "left",
      render: (department) => (
        <div className="flex items-center gap-2">
          <Button
            fullWidth={false} variant="ghost" size="sm"
            onClick={() => handleEditDepartment(department)}
            className="w-16 inline-flex items-center justify-center rounded-md bg-blue-200 px-2 py-1 text-xs text-blue-700 hover:bg-blue-50 hover:scale-100 hover:shadow-none"
          >
            ແກ້ໄຂ
          </Button>
          <Button
            fullWidth={false} variant="ghost" size="sm"
            onClick={() => tableRef.current?.handleDeleteClick?.(department)}
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
        onCreate={handleCreateDepartment}
        searchPlaceholder="ຄົ້ນຫາພະແນກ..."
        createButtonText="ເພີ່ມພະແນກ"
        createButtonIcon={
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        }
      />

      <GenericDataTable
        data={departments}
        columns={columns}
        page={safePage}
        pageSize={pageSize}
        totalPages={totalPages}
        totalItems={totalItems}
        onEdit={handleEditDepartment}
        onDelete={handleDeleteDepartment}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        entityName="ພະແນກ"
        getEntityDisplayName={(department) => department.departmentname}
        ref={tableRef}
      />

      <DepartmentFormModal
        key={editingDepartment?.dpid || "new"}
        isOpen={showFormModal}
        department={editingDepartment}
        onClose={handleCloseModal}
        onSubmit={handleSubmitDepartment}
      />

      <LoadingDialog isOpen={isLoading} message="ກຳລັງໂຫຼດ..." />
    </div>
  );
}
