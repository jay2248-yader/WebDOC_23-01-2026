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
  user = null,
}) {
  const authUser = useAuthStore((state) => state.user);

  const pwdsRef = useRef(null);
  const usernameRef = useRef(null);
  const shortnameRef = useRef(null);
  const gendernameRef = useRef(null);
  const groupappdetailidRef = useRef(null);
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
      groupappdetailid: user?.groupappdetailid || "",
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
      if (!data.groupappdetailid) e.groupappdetailid = "ກະລຸນາປ້ອນລະຫັດກຸ່ມ";
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
  const numFilter = (v) => v.replace(/[^0-9]/g, "");

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
      <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center border-b border-blue-400 pb-2">
        {user ? "ແກ້ໄຂຜູ້ໃຊ້" : "ສ້າງຜູ້ໃຊ້"}
      </h3>

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

        <FormInput
          label="ລະຫັດກຸ່ມ (Group App Detail ID)"
          theme="light"
          placeholder="ກະລຸນາປ້ອນລະຫັດກຸ່ມ"
          value={formData.groupappdetailid}
          onChange={handleChange("groupappdetailid", numFilter)}
          onKeyDown={handleKeyDown(() => createbyRef)}
          inputRef={groupappdetailidRef}
          error={errors.groupappdetailid}
          hasError={!!errors.groupappdetailid}
          inputMode="numeric"
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
