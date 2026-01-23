import { useState, useMemo, useRef } from "react";
import GenericToolbar from "../components/common/GenericToolbar";
import GenericDataTable, { Button } from "../components/common/GenericDataTable";
import DepartmentFormModal from "../components/departments/DepartmentFormModal";
import LoadingDialog from "../components/common/LoadingDialog";

const departments = [
  {
    createdate: "2025-11-27 00:00:00",
    dpid: 11,
    bdid: 11,
    departmentname: "ກວດສອບພາຍໃນ",
    moreinfo: "",
    statustype: "ADD",
    createby: "IT",
  },
  {
    createdate: "2025-11-28 10:00:00",
    dpid: 12,
    bdid: 12,
    departmentname: "ການເງິນ",
    moreinfo: "ພະແນກການເງິນ",
    statustype: "ADD",
    createby: "IT",
  },
];

export default function DepartmentPage() {
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Reference to the delete handler from GenericDataTable
  const tableRef = useRef(null);

  // 1) Filter departments
  const filtered = useMemo(() => {
    if (!searchText) return departments;
    const lower = searchText.toLowerCase();
    return departments.filter(
      (d) =>
        d.dpid.toString().includes(lower) ||
        d.departmentname.toLowerCase().includes(lower) ||
        d.moreinfo.toLowerCase().includes(lower) ||
        d.createby.toLowerCase().includes(lower)
    );
  }, [searchText]);

  // 2) Total pages
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;

  // 3) Safe page
  const safePage = Math.min(Math.max(page, 1), totalPages);

  // 4) Paginate
  const pageDepartments = useMemo(
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

  const handleCreateDepartment = () => {
    setIsLoading(true);
    setEditingDepartment(null);

    setTimeout(() => {
      setIsLoading(false);
      setShowFormModal(true);
    }, 500);
  };

  const handleEditDepartment = (department) => {
    setIsLoading(true);
    setEditingDepartment(department);

    setTimeout(() => {
      setIsLoading(false);
      setShowFormModal(true);
    }, 500);
  };

  const handleCloseModal = () => {
    setShowFormModal(false);
    setEditingDepartment(null);
  };

  const handleSubmitDepartment = async (formData) => {
    const isEdit = !!editingDepartment;

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    if (isEdit) {
      console.log("update department", editingDepartment.dpid, formData);
    } else {
      console.log("create department", formData);
    }
  };

  const handleDeleteDepartment = async (department) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("delete department", department);
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
      key: "dpid",
      label: "ລະຫັດພະແນກ",
      align: "left",
    },
    {
      key: "bdid",
      label: "ລະຫັດຄະນະ",
      align: "left",
    },
    {
      key: "departmentname",
      label: "ຊື່ພະແນກ",
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
      render: (department) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            department.statustype === "ADD"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {department.statustype}
        </span>
      ),
    },
    {
      key: "actions",
      label: "ຈັດການ",
      align: "left",
      render: (department) => (
        <div className="flex items-center gap-2">
          <Button
            fullWidth={false}
            variant="ghost"
            size="sm"
            onClick={() => handleEditDepartment(department)}
            className="w-16 inline-flex items-center justify-center rounded-md bg-blue-200 px-2 py-1 text-xs text-blue-700 hover:bg-blue-50 hover:scale-100 hover:shadow-none"
          >
            ແກ້ໄຂ
          </Button>

          <Button
            fullWidth={false}
            variant="ghost"
            size="sm"
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
        searchText={searchText}
        onSearchChange={handleSearchChange}
        onCreate={handleCreateDepartment}
        searchPlaceholder="ຄົ້ນຫາພະແນກ..."
        createButtonText="ເພີ່ມພະແນກ"
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
        data={pageDepartments}
        columns={columns}
        page={safePage}
        pageSize={pageSize}
        totalPages={totalPages}
        totalItems={filtered.length}
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
