import { useMemo, useState, useRef } from "react";
import GenericToolbar from "../components/common/GenericToolbar";
import GenericDataTable, { Button } from "../components/common/GenericDataTable";
import UserFormModal from "../components/users/UserFormModal";
import LoadingDialog from "../components/common/LoadingDialog";


import userplus from "../assets/icon/userplus.svg";

// Note: ConfirmProgressDialog is used in GenericDataTable and UserFormModal

const users = [
  {
    usid: 136,
    usercode: "150282",
    username: "ທ້າວ ທອງໄມ ສີຮັກສາ",
    shortname: "",
    gendername: "ຊາຍ",
    statustype: "ADD",
    createby: "IT",
    changeme: "YES",
    groupappId: 0,
    departmentmodel: {
      departmentname: "ການເງິນ ",
      boardmodel: {
        boardtname: "ຝ່າຍການເງິນ "
      }
    }
  },
  {
    usid: 137,
    usercode: "150283",
    username: "ນາງ ສົມໃຈ",
    shortname: "ໃຈ",
    gendername: "ຍິງ",
    statustype: "ADD",
    createby: "Admin",
    changeme: "KC",
    groupappId: 1,
    departmentmodel: {
      departmentname: "ບັນຊີ",
      boardmodel: {
        boardtname: "ຝ່າຍບັນຊີ"
      }
    }
  }
];

export default function UserPage() {
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formKey, setFormKey] = useState(0); // Key to reset form state

  // Reference to the delete handler from GenericDataTable
  const tableRef = useRef(null);

  // 1) filter
  // Since we changed the data structure, we might need to adjust filterUsers utility or just filter inline if filterUsers assumes old structure.
  // For safety, I will implement inline filtering here or assume filterUsers can handle generic objects if updated. 
  // Given I can't see/edit utils/filter right now easily without context switch, I'll filter inline to be safe and consistent with previous pages.
  const filtered = useMemo(() => {
    if (!searchText) return users;
    const lower = searchText.toLowerCase();
    return users.filter(u => 
        u.usercode.toLowerCase().includes(lower) || 
        u.username.toLowerCase().includes(lower) || 
        (u.departmentmodel?.departmentname || "").toLowerCase().includes(lower)
    );
  }, [searchText]);

  // 2) total pages
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;

  // 3) safePage (derive only — no setState)
  const safePage = Math.min(Math.max(page, 1), totalPages);

  // 4) paginate
  const pageUsers = useMemo(
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

  const handleCreateUser = () => {
    setIsLoading(true);
    setEditingUser(null);

    setTimeout(() => {
      setIsLoading(false);
      setFormKey((k) => k + 1); // Increment key to reset form
      setShowFormModal(true);
    }, 500);
  };

  const handleEditUser = (user) => {
    setIsLoading(true);
    setEditingUser(user);

    setTimeout(() => {
      setIsLoading(false);
      setFormKey((k) => k + 1); // Increment key to reset form
      setShowFormModal(true);
    }, 500);
  };

  const handleCloseModal = () => {
    setShowFormModal(false);
    setEditingUser(null);
  };

  const handleSubmitUser = async (formData) => {
    const isEdit = !!editingUser;

    await new Promise(resolve => setTimeout(resolve, 2000));

    if (isEdit) {
      console.log("update user", editingUser.usid, formData);
    } else {
      console.log("create user", formData);
    }
  };

  const handleDeleteUser = async (user) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log("delete user", user);
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
      key: "usercode",
      label: "ລະຫັດ",
      align: "left",
    },
    {
      key: "username",
      label: "ຊື່",
      align: "left",
    },
    {
      key: "gendername",
      label: "ເພດ",
      align: "left",
    },
    {
      key: "department",
      label: "ພະແນກ",
      align: "left",
      render: (user) => user.departmentmodel?.departmentname || "-"
    },
    {
      key: "board",
      label: "ຄະນະ",
      align: "left",
      render: (user) => user.departmentmodel?.boardmodel?.boardtname || "-"
    },
    {
      key: "statustype",
      label: "ສະຖານະ",
      align: "left",
      render: (user) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            user.statustype === "ADD"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {user.statustype}
        </span>
      ),
    },
    {
      key: "actions",
      label: "ຈັດການ",
      align: "left",
      render: (user) => (
        <div className="flex items-center gap-2">
          <Button
            fullWidth={false}
            variant="ghost"
            size="sm"
            onClick={() => handleEditUser(user)}
            className="w-16 inline-flex items-center justify-center rounded-md bg-blue-200 px-2 py-1 text-xs text-blue-700 hover:bg-blue-50 hover:scale-100 hover:shadow-none"
          >
            ແກ້ໄຂ
          </Button>

          <Button
            fullWidth={false}
            variant="ghost"
            size="sm"
            onClick={() => tableRef.current?.handleDeleteClick?.(user)}
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
        onCreate={handleCreateUser}
        searchPlaceholder="ຄົ້ນຫາ"
        createButtonText="ສ້າງ User"
        createButtonIcon={
          <img src={userplus} alt="Add user" className="h-7 w-7 brightness-0 invert" />
        }
      />

      <GenericDataTable
        data={pageUsers}
        columns={columns}
        page={safePage}
        pageSize={pageSize}
        totalPages={totalPages}
        totalItems={filtered.length}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        entityName="ຜູ້ໃຊ້"
        getEntityDisplayName={(user) => user.username}
        ref={tableRef}
      />

      <UserFormModal
        key={formKey}
        isOpen={showFormModal}
        user={editingUser}
        onClose={handleCloseModal}
        onSubmit={handleSubmitUser}
      />

      <LoadingDialog
        isOpen={isLoading}
        message="ກຳລັງໂຫຼດ..."
      />
    </div>
  );
}
