import { useState, useRef, useEffect } from "react";
import GenericToolbar from "../components/common/GenericToolbar";
import GenericDataTable, { Button } from "../components/common/GenericDataTable";
import UserFormModal from "../components/users/UserFormModal";
import LoadingDialog from "../components/common/LoadingDialog";
import { getAllUsers, createNewUser } from "../services/userservice";

import userplus from "../assets/icon/userplus.svg";

export default function UserPage() {
  const [users, setUsers] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Reference to the delete handler from GenericDataTable
  const tableRef = useRef(null);

  // Load users from API
  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const result = await getAllUsers({
        page,
        limit: pageSize,
        search: searchText,
      });
      console.log("Loaded users:", result);
      setUsers(result.data);
      setTotalItems(result.total);
      setTotalPages(result.lastPage || 1);
    } catch (error) {
      console.error("Error loading users:", error);
      alert(error.message || "ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ");
    } finally {
      setIsLoading(false);
    }
  };

  // Load users on mount and when search/page changes
  useEffect(() => {
    loadUsers();
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

  const handleCreateUser = () => {
    setIsLoading(true);
    setEditingUser(null);

    setTimeout(() => {
      setIsLoading(false);
      setShowFormModal(true);
    }, 500);
  };

  const handleEditUser = (user) => {
    setIsLoading(true);
    setEditingUser(user);

    setTimeout(() => {
      setIsLoading(false);
      setShowFormModal(true);
    }, 500);
  };

  const handleCloseModal = () => {
    setShowFormModal(false);
    setEditingUser(null);
  };

  const handleSubmitUser = async (formData) => {
    const isEdit = !!editingUser;

    if (isEdit) {
      console.log("update user", editingUser.usid, formData);
      // TODO: await updateUser({ usid: editingUser.usid, ...formData });
    } else {
      await createNewUser(formData);
    }

    // Reload users after successful create/edit
    await loadUsers();
  };

  const handleDeleteUser = async (user) => {
    console.log("delete user", user);
    // TODO: await deleteUser(user.usid);

    // Reload users after successful delete
    await loadUsers();
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
        data={users}
        columns={columns}
        page={safePage}
        pageSize={pageSize}
        totalPages={totalPages}
        totalItems={totalItems}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        entityName="ຜູ້ໃຊ້"
        getEntityDisplayName={(user) => user.username}
        ref={tableRef}
      />

      <UserFormModal
        key={editingUser?.usid || "new"}
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
