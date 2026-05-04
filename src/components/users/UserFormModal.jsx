/**
 * UserFormModal
 *
 * Modal สร้าง / แก้ไข User — ใช้ร่วมกันทั้ง 2 mode โดย prop `user`
 *   - user = null  → mode สร้าง (แสดง field pwds)
 *   - user = {...} → mode แก้ไข (ซ่อน field pwds, แสดง createby แบบ disabled)
 *
 * Dropdown ที่ใช้ useSelectPagination (search + load more):
 *   - Department  (departmentid) → getAllDepartments
 *   - Position    (positionid)   → getAllPositions
 *   - Branch      (branch)       → getAllBranches
 *
 * กด Enter ที่ field ไหน → focus ย้ายไป field ถัดไปอัตโนมัติ (handleKeyDown)
 *
 * หมายเหตุ: createby ถูก auto-fill จาก authStore (username ของผู้ login อยู่)
 * ถ้าต้องการเพิ่ม field ใหม่ → เพิ่มใน initialData + validate + JSX
 */
import { useRef, useEffect } from "react";
import useFormModal from "../../hooks/useFormModal";
import useSelectPagination from "../../hooks/useSelectPagination";
import FormModalShell from "../common/FormModalShell";
import FormInput from "../common/FormInput";
import Select from "../common/Select";
import Button from "../common/Button";
import { getAllDepartments } from "../../services/departmentservice";
import { getAllPositions } from "../../services/positionservice";
import { getAllBranches } from "../../services/branchservice";
import { useAuthStore } from "../../store/authstore";

export default function UserFormModal({
  isOpen,
  onClose,
  onSubmit,
  onChangePwd,
  user = null,
}) {
  const authUser = useAuthStore((state) => state.user);

  const pwdsRef = useRef(null);
  const usernameRef = useRef(null);
  const shortnameRef = useRef(null);
  const gendernameRef = useRef(null);
  const createbyRef = useRef(null);
  const ipaddressRef = useRef(null);
  const branchRef = useRef(null);

  const {
    items: departments, hasMore: deptsHasMore, loadingMore: deptsLoadingMore,
    reset: resetDepts, handleSearch: handleDepartmentSearch, handleLoadMore: handleDeptLoadMore,
  } = useSelectPagination(getAllDepartments);

  const {
    items: positions, hasMore: posHasMore, loadingMore: posLoadingMore,
    reset: resetPositions, handleSearch: handlePositionSearch, handleLoadMore: handlePosLoadMore,
  } = useSelectPagination(getAllPositions);

  const {
    items: branches, hasMore: branchesHasMore, loadingMore: branchesLoadingMore,
    reset: resetBranches, handleSearch: handleBranchSearch, handleLoadMore: handleBranchLoadMore,
  } = useSelectPagination(getAllBranches);

  useEffect(() => {
    if (isOpen) {
      resetDepts();
      resetPositions();
      resetBranches();
    }
  }, [isOpen, resetDepts, resetPositions, resetBranches]);

  const {
    formData,
    errors,
    isClosing,
    submitDialog,
    shouldRender,
    handleChange,
    handleSubmit,
    handleConfirmSubmit,
    handleCancelSubmit,
    handleCloseSubmit,
    handleClose,
  } = useFormModal({
    isOpen,
    onClose,
    onSubmit,
    initialData: {
      usercode: user?.usercode || "",
      pwds: "",
      username: user?.username || "",
      shortname: user?.shortname || "",
      gendername: user?.gendername || "ຊາຍ",
      departmentid: user?.departmentid ? String(user.departmentid) : "",
      groupappdetailid: user?.groupappdetailid ?? 0,
      positionid: user?.positionid || "",
      createby: user?.createby || authUser?.username || authUser?.usercode || "",
      ipaddress: user?.ipaddress || "",
      branch: user?.branch ? String(user.branch) : "",
    },
    validate: (data) => {
      const e = {};
      if (!data.usercode) e.usercode = "ກະລຸນາປ້ອນລະຫັດພະນັກງານ";
      if (!user && !data.pwds) e.pwds = "ກະລຸນາປ້ອນລະຫັດຜ່ານ";
      if (!data.username) e.username = "ກະລຸນາປ້ອນຊື່";
      if (!data.gendername) e.gendername = "ກະລຸນາເລືອກເພດ";
      if (!data.departmentid) e.departmentid = "ກະລຸນາປ້ອນລະຫັດພະແນກ";
      if (!data.positionid) e.positionid = "ກະລຸນາປ້ອນລະຫັດຕຳແໜ່ງ";
      if (!data.createby) e.createby = "ກະລຸນາປ້ອນຜູ້ສ້າງ";
      if (!data.ipaddress) e.ipaddress = "ກະລຸນາປ້ອນ IP Address";
      if (!data.branch) e.branch = "ກະລຸນາປ້ອນລະຫັດສາຂາ";
      return e;
    },
  });

  const handleKeyDown = (getRef) => (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      getRef().current?.focus();
    }
  };

  const alphanumFilter = (v) => v.replace(/[^a-zA-Z0-9]/g, "");

  const genderOptions = [
    { value: "ຊາຍ", label: "ຊາຍ" },
    { value: "ຍິງ", label: "ຍິງ" },
  ];

  return (
    <FormModalShell
      shouldRender={shouldRender}
      isClosing={isClosing}
      isEditing={!!user}
      entityName="ຜູ້ໃຊ້"
      displayName={formData.username}
      submitDialog={submitDialog}
      onClose={handleClose}
      onConfirm={handleConfirmSubmit}
      onCancelSubmit={handleCancelSubmit}
      onCloseSubmit={handleCloseSubmit}
    >
      <div className="flex items-center justify-between mb-4 border-b border-blue-400 pb-2">
        <h3 className="text-lg font-semibold text-gray-900">
          {user ? "ແກ້ໄຂຜູ້ໃຊ້" : "ສ້າງຜູ້ໃຊ້"}
        </h3>
        {user && (
          <button
            type="button"
            onClick={() => onChangePwd?.(user)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            ປ່ຽນລະຫັດຜ່ານ
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {user && (
          <FormInput label="ລະຫັດພະນັກງານ" theme="light" value={user.usid} disabled />
        )}

        <FormInput
          label="ລະຫັດພະນັກງານ"
          theme="light"
          placeholder="ກະລຸນາປ້ອນລະຫັດພະນັກງານ"
          value={formData.usercode}
          onChange={handleChange("usercode", alphanumFilter)}
          onKeyDown={handleKeyDown(() => pwdsRef)}
          error={errors.usercode}
          hasError={!!errors.usercode}
          inputMode="text"
          autoComplete="off"
        />

        {!user && (
          <FormInput
            label="ລະຫັດຜ່ານ"
            theme="light"
            type="text"
            placeholder="ກະລຸນາປ້ອນລະຫັດຜ່ານ"
            value={formData.pwds}
            onChange={handleChange("pwds")}
            onKeyDown={handleKeyDown(() => usernameRef)}
            inputRef={pwdsRef}
            error={errors.pwds}
            hasError={!!errors.pwds}
            autoComplete="new-password"
          />
        )}


        <FormInput
          label="ຊື່"
          theme="light"
          placeholder="ກະລຸນາປ້ອນຊື່"
          value={formData.username}
          onChange={handleChange("username")}
          onKeyDown={handleKeyDown(() => shortnameRef)}
          inputRef={usernameRef}
          error={errors.username}
          hasError={!!errors.username}
        />

        <FormInput
          label="ຊື່ຫຍໍ້"
          theme="light"
          placeholder="ກະລຸນາປ້ອນຊື່ຫຍໍ້"
          value={formData.shortname}
          onChange={handleChange("shortname")}
          onKeyDown={handleKeyDown(() => gendernameRef)}
          inputRef={shortnameRef}
        />

        <Select
          label="ເພດ"
          theme="light"
          value={formData.gendername}
          onChange={handleChange("gendername")}
          options={genderOptions}
          inputRef={gendernameRef}
          error={errors.gendername}
          hasError={!!errors.gendername}
        />

        <Select
          label="ພະແນກ"
          theme="light"
          placeholder="ກະລຸນາເລືອກພະແນກ"
          value={formData.departmentid}
          onChange={handleChange("departmentid")}
          options={departments.map((d) => ({ value: String(d.dpid), label: d.departmentname }))}
          error={errors.departmentid}
          hasError={!!errors.departmentid}
          searchable
          onSearch={handleDepartmentSearch}
          hasMore={deptsHasMore}
          onLoadMore={handleDeptLoadMore}
          isLoadingMore={deptsLoadingMore}
        />

        <Select
          label="ຕຳແໜ່ງ"
          theme="light"
          placeholder="ກະລຸນາເລືອກຕຳແໜ່ງ"
          value={formData.positionid}
          onChange={handleChange("positionid")}
          options={positions.map((p) => ({ value: String(p.pid), label: p.positionname }))}
          error={errors.positionid}
          hasError={!!errors.positionid}
          searchable
          onSearch={handlePositionSearch}
          hasMore={posHasMore}
          onLoadMore={handlePosLoadMore}
          isLoadingMore={posLoadingMore}
        />

        {user && (
          <FormInput
            label="ຜູ້ສ້າງ"
            theme="light"
            placeholder="ກະລຸນາປ້ອນຜູ້ສ້າງ"
            value={formData.createby}
            onChange={handleChange("createby")}
            inputRef={createbyRef}
            error={errors.createby}
            hasError={!!errors.createby}
            disabled
          />
        )}

        <FormInput
          label="IP Address"
          theme="light"
          placeholder="ກະລຸນາປ້ອນ IP Address"
          value={formData.ipaddress}
          onChange={handleChange("ipaddress")}
          onKeyDown={handleKeyDown(() => branchRef)}
          inputRef={ipaddressRef}
          error={errors.ipaddress}
          hasError={!!errors.ipaddress}
        />

        <Select
          label="ສາຂາ"
          theme="light"
          placeholder="ກະລຸນາເລືອກສາຂາ"
          value={formData.branch}
          onChange={handleChange("branch")}
          options={branches.map((b) => ({ value: String(b.brid), label: b.branchname }))}
          inputRef={branchRef}
          error={errors.branch}
          hasError={!!errors.branch}
          searchable
          onSearch={handleBranchSearch}
          hasMore={branchesHasMore}
          onLoadMore={handleBranchLoadMore}
          isLoadingMore={branchesLoadingMore}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" fullWidth={false} variant="secondary" size="md" onClick={handleClose}>
            ຍົກເລີກ
          </Button>
          <Button type="submit" fullWidth={false} variant="outline" size="md" className="bg-[#0F75BC] text-white hover:bg-blue-700">
            ສຳເລັດ
          </Button>
        </div>
      </form>
    </FormModalShell>
  );
}
