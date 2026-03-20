import { useRef, useEffect, useMemo } from "react";
import useFormModal from "../../hooks/useFormModal";
import useSelectPagination from "../../hooks/useSelectPagination";
import FormModalShell from "../common/FormModalShell";
import FormInput from "../common/FormInput";
import Button from "../common/Button";
import Select from "../common/Select";
import { getAllBoards } from "../../services/boardservice";

export default function DepartmentFormModal({
  isOpen,
  onClose,
  onSubmit,
  department = null,
}) {
  const departmentnameRef = useRef(null);
  const moreinfoRef = useRef(null);

  const {
    items: boardItems,
    hasMore: hasMoreBoards,
    loadingMore: isLoadingBoards,
    reset: resetBoards,
    handleSearch: handleBoardSearch,
    handleLoadMore: handleLoadMoreBoards,
  } = useSelectPagination(getAllBoards);

  const boards = useMemo(
    () => boardItems.map((b) => ({
      value: String(b.bdid),
      label: b.boardtname || b.boardname || String(b.bdid),
    })),
    [boardItems]
  );

  useEffect(() => {
    if (isOpen) resetBoards();
  }, [isOpen, resetBoards]);

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
      bdid: department?.bdid || "",
      departmentname: department?.departmentname || "",
      moreinfo: department?.moreinfo || "",
    },
    validate: (data) => {
      const e = {};
      if (!data.bdid) e.bdid = "ກະລຸນາປ້ອນລະຫັດຄະນະ";
      if (!data.departmentname) e.departmentname = "ກະລຸນາປ້ອນຊື່ພະແນກ";
      return e;
    },
  });

  const handleKeyDown = (getRef) => (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      getRef().current?.focus();
    }
  };

  return (
    <FormModalShell
      shouldRender={shouldRender}
      isClosing={isClosing}
      isEditing={!!department}
      entityName="ພະແນກ"
      displayName={formData.departmentname}
      submitDialog={submitDialog}
      onClose={handleClose}
      onConfirm={handleConfirmSubmit}
      onCancelSubmit={handleCancelSubmit}
      onCloseSubmit={handleCloseSubmit}
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center border-b border-blue-400 pb-2">
        {department ? "ແກ້ໄຂພະແນກ" : "ເພີ່ມພະແນກ"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {department && (
          <FormInput label="ລະຫັດພະແນກ" theme="light" value={department.dpid} disabled />
        )}

        <Select
          label="ລະຫັດຄະນະ"
          theme="light"
          placeholder="ກະລຸນາເລືອກຄະນະ"
          value={String(formData.bdid)}
          onChange={handleChange("bdid")}
          options={boards}
          searchable
          onSearch={handleBoardSearch}
          error={errors.bdid}
          hasError={!!errors.bdid}
          hasMore={hasMoreBoards}
          isLoadingMore={isLoadingBoards}
          onLoadMore={handleLoadMoreBoards}
        />

        <FormInput
          label="ຊື່ພະແນກ"
          theme="light"
          placeholder="ກະລຸນາປ້ອນຊື່ພະແນກ"
          value={formData.departmentname}
          onChange={handleChange("departmentname")}
          onKeyDown={handleKeyDown(() => moreinfoRef)}
          inputRef={departmentnameRef}
          error={errors.departmentname}
          hasError={!!errors.departmentname}
        />

        <FormInput
          label="ລາຍລະອຽດເພີ່ມເຕີມ (ທາງເລືອກ)"
          theme="light"
          placeholder="ກະລຸນາປ້ອນລາຍລະອຽດ"
          value={formData.moreinfo}
          onChange={handleChange("moreinfo")}
          inputRef={moreinfoRef}
          error={errors.moreinfo}
          hasError={!!errors.moreinfo}
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
