/**
 * UserPage
 *
 * หน้าจัดการผู้ใช้งาน — สร้าง / แก้ไข / เปลี่ยนรหัสผ่าน
 * ไม่รองรับการลบ User เนื่องจากไม่มี API endpoint
 *
 * หมายเหตุ: หน้านี้ไม่ใช้ useCrudPage เนื่องจาก:
 *   1. Search เป็น manual (ต้องกดปุ่มค้นหา ไม่ใช่ auto)
 *   2. มี Password Modal พิเศษที่ไม่มีใน useCrudPage
 *
 * Flow หลัก:
 *   - โหลดข้อมูล: loadUsers() ถูกเรียกเมื่อ page/pageSize/searchText เปลี่ยน
 *   - สร้าง: handleCreateUser() → UserFormModal → createNewUser()
 *   - แก้ไข: handleEditUser() → UserFormModal (ไม่มี API update — แสดงข้อมูลเดิมเท่านั้น)
 *   - เปลี่ยนรหัสผ่าน: openPwdModal() → inline modal → updatePwds()
 *
 * ถ้าต้องการเพิ่ม API update user → แก้ handleSubmitUser() เพิ่ม else branch
 */
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import GenericToolbar from "../components/common/GenericToolbar";
import GenericDataTable, { Button } from "../components/common/GenericDataTable";
import UserFormModal from "../components/users/UserFormModal";
import LoadingDialog from "../components/common/LoadingDialog";
import { getAllUsers, createNewUser, updatePwds } from "../services/userservice";
import { toast } from "../store/toastStore";


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
  const [tableLoading, setTableLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [pwdModal, setPwdModal] = useState({ open: false, user: null, newPwd: "", isSubmitting: false });

  const tableRef = useRef(null);
  const modalTimerRef = useRef(null);

  useEffect(() => () => clearTimeout(modalTimerRef.current), []);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const loadUsers = useCallback(async (signal) => {
    setTableLoading(true);
    try {
      const result = await getAllUsers({ page, limit: pageSize, search: searchText }, signal);
      if (!mountedRef.current || signal?.aborted) return;
      setUsers(result.data);
      setTotalItems(result.total);
      setTotalPages(result.lastPage || 1);
    } catch (error) {
      if (error?.code === "ERR_CANCELED" || error?.name === "CanceledError") return;
      if (mountedRef.current) toast.error(error.message || "ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ");
    } finally {
      if (mountedRef.current && !signal?.aborted) setTableLoading(false);
    }
  }, [page, pageSize, searchText]);

  useEffect(() => {
    const controller = new AbortController();
    loadUsers(controller.signal);
    return () => controller.abort();
  }, [loadUsers]);

  const safePage = Math.min(Math.max(page, 1), totalPages);

  const handleSearchChange = useCallback((v) => setInputText(v), []);
  const handleSearch = useCallback(() => { setSearchText(inputText); setPage(1); }, [inputText]);
  const handlePageSizeChange = useCallback((nextSize) => { setPageSize(nextSize); setPage(1); }, []);
  const handlePageChange = useCallback((nextPage) => { setPage(Math.min(Math.max(nextPage, 1), totalPages)); }, [totalPages]);

  const handleCreateUser = useCallback(() => {
    setModalLoading(true);
    setEditingUser(null);
    clearTimeout(modalTimerRef.current);
    modalTimerRef.current = setTimeout(() => { setModalLoading(false); setShowFormModal(true); }, 500);
  }, []);

  const handleEditUser = useCallback((user) => {
    setModalLoading(true);
    setEditingUser(user);
    clearTimeout(modalTimerRef.current);
    modalTimerRef.current = setTimeout(() => { setModalLoading(false); setShowFormModal(true); }, 500);
  }, []);

  const handleCloseModal = useCallback(() => { setShowFormModal(false); setEditingUser(null); }, []);
  const handleSubmitUser = useCallback(async (formData) => {
    if (!editingUser) await createNewUser(formData);
    await loadUsers();
  }, [editingUser, loadUsers]);
  const handleDeleteUser = useCallback(async () => loadUsers(), [loadUsers]);

  // ── Password modal ──────────────────────────────
  const openPwdModal = useCallback((user) =>
    setPwdModal({ open: true, user, newPwd: "", isSubmitting: false }), []);

  const closePwdModal = useCallback(() =>
    setPwdModal({ open: false, user: null, newPwd: "", isSubmitting: false }), []);

  const handleUpdatePwd = useCallback(async () => {
    if (!pwdModal.newPwd) return;
    setPwdModal((p) => ({ ...p, isSubmitting: true }));
    try {
      await updatePwds({ usercode: pwdModal.user.usercode, pwds: pwdModal.newPwd });
      closePwdModal();
    } catch (error) {
      toast.error(error.message || "ເກີດຂໍ້ຜິດພາດ");
      setPwdModal((p) => ({ ...p, isSubmitting: false }));
    }
  }, [pwdModal.newPwd, pwdModal.user, closePwdModal]);
  // ────────────────────────────────────────────────

  const columns = useMemo(() => [
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
      label: "ຝ່າຍ",
      align: "left",
      render: (user) => user.departmentmodel?.boardmodel?.boardtname || "-",
    },
    {
      key: "position",
      label: "ຕຳແໜ່ງ",
      align: "left",
      render: (user) => user.positionmodel?.positionname || "-",
    },
    {
      key: "branch",
      label: "ສາຂາ",
      align: "left",
      render: (user) => user.branchmodel?.branchname || "-",
    },
    {
      key: "actions",
      label: "ຈັດການ",
      align: "left",
      render: (user) => (
        <div className="flex items-center">
          <Button
            fullWidth={false} variant="ghost" size="sm"
            onClick={() => handleEditUser(user)}
            className="w-34 inline-flex items-center justify-center gap-1.5 rounded-md bg-blue-200 px-2 py-1 text-xs text-blue-700 hover:bg-blue-50 hover:scale-100 hover:shadow-none"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            ແກ້ໄຂ
          </Button>
        </div>
      ),
    },
  ], [handleEditUser]);

  return (
    <div className="space-y-6">
      <GenericToolbar
        searchText={inputText}
        onSearchChange={handleSearchChange}
        onSearch={handleSearch}
        onCreate={handleCreateUser}
        searchPlaceholder="ຄົ້ນຫາ"
        createButtonText="ສ້າງຜູ້ໃຊ້"
        createButtonIcon={
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        }
      />

      <GenericDataTable
        data={users}
        columns={columns}
        page={safePage}
        pageSize={pageSize}
        totalPages={totalPages}
        totalItems={totalItems}
        loading={tableLoading}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        rowKey="usid"
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
        onChangePwd={openPwdModal}
      />

      <LoadingDialog isOpen={modalLoading} message="ກຳລັງໂຫຼດ..." />

      {/* Password Modal */}
      {pwdModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn"
          onClick={closePwdModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-linear-to-r from-[#0c5fa0] to-[#1a8fd1] px-6 py-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">ປ່ຽນລະຫັດຜ່ານ</h3>
                <p className="text-xs text-blue-100 mt-0.5">{pwdModal.user?.username} · {pwdModal.user?.usercode}</p>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">ລະຫັດຜ່ານໃໝ່</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    autoFocus
                    value={pwdModal.newPwd}
                    onChange={(e) => setPwdModal((p) => ({ ...p, newPwd: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && handleUpdatePwd()}
                    placeholder="ກະລຸນາປ້ອນລະຫັດຜ່ານໃໝ່"
                    className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={closePwdModal}
                  className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  ຍົກເລີກ
                </button>
                <button
                  type="button"
                  onClick={handleUpdatePwd}
                  disabled={!pwdModal.newPwd || pwdModal.isSubmitting}
                  className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl bg-[#0F75BC] text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {pwdModal.isSubmitting ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      ກຳລັງບັນທຶກ...
                    </>
                  ) : "ຢືນຢັນ"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
