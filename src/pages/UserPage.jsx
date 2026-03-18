import { useState, useRef, useEffect } from "react";
import GenericToolbar from "../components/common/GenericToolbar";
import GenericDataTable, { Button } from "../components/common/GenericDataTable";
import UserFormModal from "../components/users/UserFormModal";
import LoadingDialog from "../components/common/LoadingDialog";
import { getAllUsers, createNewUser, updatePwds } from "../services/userservice";

import userplus from "../assets/icon/userplus.svg";

export default function UserPage() {
  const [users, setUsers] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [inputText, setInputText] = useState("");
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pwdModal, setPwdModal] = useState({ open: false, user: null, newPwd: "", isSubmitting: false });

  const tableRef = useRef(null);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const result = await getAllUsers({ page, limit: pageSize, search: searchText });
      setUsers(result.data);
      setTotalItems(result.total);
      setTotalPages(result.lastPage || 1);
    } catch (error) {
      alert(error.message || "ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page, pageSize, searchText]);

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

  const handleCreateUser = () => {
    setIsLoading(true);
    setEditingUser(null);
    setTimeout(() => { setIsLoading(false); setShowFormModal(true); }, 500);
  };

  const handleEditUser = (user) => {
    setIsLoading(true);
    setEditingUser(user);
    setTimeout(() => { setIsLoading(false); setShowFormModal(true); }, 500);
  };

  const handleCloseModal = () => {
    setShowFormModal(false);
    setEditingUser(null);
  };

  const handleSubmitUser = async (formData) => {
    if (editingUser) {
      console.log("update user", editingUser.usid, formData);
    } else {
      await createNewUser(formData);
    }
    await loadUsers();
  };

  const handleDeleteUser = async (user) => {
    console.log("delete user", user);
    await loadUsers();
  };

  // ── Password modal ──────────────────────────────
  const openPwdModal = (user) =>
    setPwdModal({ open: true, user, newPwd: "", isSubmitting: false });

  const closePwdModal = () =>
    setPwdModal({ open: false, user: null, newPwd: "", isSubmitting: false });

  const handleUpdatePwd = async () => {
    if (!pwdModal.newPwd) return;
    setPwdModal((p) => ({ ...p, isSubmitting: true }));
    try {
      await updatePwds({ usercode: pwdModal.user.usercode, pwds: pwdModal.newPwd });
      closePwdModal();
    } catch (error) {
      alert(error.message || "ເກີດຂໍ້ຜິດພາດ");
      setPwdModal((p) => ({ ...p, isSubmitting: false }));
    }
  };
  // ────────────────────────────────────────────────

  const columns = [
    {
      key: "index",
      label: "ລຳດັບ",
      align: "left",
      render: (_item, index, page, pageSize) => (page - 1) * pageSize + index + 1,
    },
    { key: "usercode", label: "ລະຫັດ", align: "left" },
    { key: "username", label: "ຊື່", align: "left" },
    { key: "gendername", label: "ເພດ", align: "left" },
    {
      key: "department",
      label: "ພະແນກ",
      align: "left",
      render: (user) => user.departmentmodel?.departmentname || "-",
    },
    {
      key: "board",
      label: "ຄະນະ",
      align: "left",
      render: (user) => user.departmentmodel?.boardmodel?.boardtname || "-",
    },
    {
      key: "actions",
      label: "ຈັດການ",
      align: "left",
      render: (user) => (
        <div className="flex items-center gap-2">
          <Button
            fullWidth={false} variant="ghost" size="sm"
            onClick={() => handleEditUser(user)}
            className="w-16 inline-flex items-center justify-center rounded-md bg-blue-200 px-2 py-1 text-xs text-blue-700 hover:bg-blue-50 hover:scale-100 hover:shadow-none"
          >
            ແກ້ໄຂ
          </Button>

          <Button
            fullWidth={false} variant="ghost" size="sm"
            onClick={() => openPwdModal(user)}
            className="w-20 inline-flex items-center justify-center rounded-md bg-yellow-100 px-2 py-1 text-xs text-yellow-700 hover:bg-yellow-200 hover:scale-100 hover:shadow-none"
          >
            ປ່ຽນລະຫັດ
          </Button>

          <Button
            fullWidth={false} variant="ghost" size="sm"
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
        searchText={inputText}
        onSearchChange={handleSearchChange}
        onSearch={handleSearch}
        onCreate={handleCreateUser}
        searchPlaceholder="ຄົ້ນຫາ"
        createButtonText="ສ້າງ User"
        createButtonIcon={<img src={userplus} alt="Add user" className="h-7 w-7 brightness-0 invert" />}
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

      <LoadingDialog isOpen={isLoading} message="ກຳລັງໂຫຼດ..." />

      {/* Password Modal */}
      {pwdModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn"
          onClick={closePwdModal}
        >
          <div
            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-4 animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-1 text-center border-b border-blue-400 pb-2">
              ປ່ຽນລະຫັດຜ່ານ
            </h3>
            <p className="text-sm text-gray-500 text-center mb-4">{pwdModal.user?.username} ({pwdModal.user?.usercode})</p>

            <div className="space-y-2 mb-6">
              <label className="block text-sm font-medium text-gray-700">ລະຫັດຜ່ານໃໝ່</label>
              <input
                type="text"
                autoFocus
                value={pwdModal.newPwd}
                onChange={(e) => setPwdModal((p) => ({ ...p, newPwd: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && handleUpdatePwd()}
                placeholder="ກະລຸນາປ້ອນລະຫັດຜ່ານໃໝ່"
                className="w-full rounded-lg px-4 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={closePwdModal}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                ຍົກເລີກ
              </button>
              <button
                type="button"
                onClick={handleUpdatePwd}
                disabled={!pwdModal.newPwd || pwdModal.isSubmitting}
                className="px-4 py-2 text-sm rounded-lg bg-[#0F75BC] text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {pwdModal.isSubmitting ? "ກຳລັງບັນທຶກ..." : "ຢືນຢັນ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
