import { useRef, useEffect } from "react";
import useFormModal from "../../hooks/useFormModal";
import useSelectPagination from "../../hooks/useSelectPagination";
import FormModalShell from "../common/FormModalShell";
import FormInput from "../common/FormInput";
import Select from "../common/Select";
import Button from "../common/Button";
import { getAllDocumentCategories } from "../../services/documentcategoryservice";
import { getAllUsers } from "../../services/userservice";
import { getAllBranches } from "../../services/branchservice";
import { getAllDepartments } from "../../services/departmentservice";

export default function DocumentFormModal({
  isOpen,
  onClose,
  onSubmit,
  document = null,
}) {
  const reqToRef = useRef(null);
  const reqReasonRef = useRef(null);
  const totalmoneyRef = useRef(null);

  const categories = useSelectPagination(getAllDocumentCategories);
  const users = useSelectPagination(getAllUsers);
  const branches = useSelectPagination(getAllBranches);
  const departments = useSelectPagination(getAllDepartments);

  useEffect(() => {
    if (isOpen) {
      categories.reset();
      users.reset();
      branches.reset();
      departments.reset();
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

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
      doccategoryid: document?.doccategoryid ? String(document.doccategoryid) : "",
      req_user: document?.req_user ? String(document.req_user) : "",
      req_to: document?.req_to || "",
      req_reason: document?.req_reason || "",
      branchid: document?.branchid ? String(document.branchid) : "",
      departmentid: document?.departmentid ? String(document.departmentid) : "",
      totalmoney: document?.totalmoney || "",
    },
    validate: (data) => {
      const e = {};
      if (!data.doccategoryid) e.doccategoryid = "ກະລຸນາເລືອກປະເພດເອກະສານ";
      if (!data.req_user) e.req_user = "ກະລຸນາປ້ອນຜູ້ຮ້ອງຂໍ";
      if (!data.req_to) e.req_to = "ກະລຸນາປ້ອນຮຽນ";
      if (!data.req_reason) e.req_reason = "ກະລຸນາປ້ອນເຫດຜົນ";
      if (!data.branchid) e.branchid = "ກະລຸນາເລືອກສາຂາ";
      if (!data.departmentid) e.departmentid = "ກະລຸນາເລືອກພະແນກ";
      return e;
    },
    transformData: (data) => ({
      doccategoryid: parseInt(data.doccategoryid),
      req_user: parseInt(data.req_user),
      req_to: data.req_to,
      req_reason: data.req_reason,
      branchid: parseInt(data.branchid),
      departmentid: parseInt(data.departmentid),
      totalmoney: data.totalmoney ? parseInt(data.totalmoney) : 0,
    }),
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
      isEditing={!!document}
      entityName="ເອກະສານ"
      displayName={formData.req_reason}
      submitDialog={submitDialog}
      onClose={handleClose}
      onConfirm={handleConfirmSubmit}
      onCancelSubmit={handleCancelSubmit}
      onCloseSubmit={handleCloseSubmit}
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center border-b border-blue-400 pb-2">
        {document ? "ແກ້ໄຂເອກະສານ" : "ເພີ່ມເອກະສານ"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {document && (
          <FormInput label="ລະຫັດ (ID)" theme="light" value={document.rqdid} disabled />
        )}

        <Select
          label="ປະເພດເອກະສານ"
          theme="light"
          placeholder="ກະລຸນາເລືອກປະເພດເອກະສານ"
          value={formData.doccategoryid}
          onChange={handleChange("doccategoryid")}
          options={categories.items.map((c) => ({ value: String(c.dctid), label: c.doccategoryname }))}
          error={errors.doccategoryid}
          hasError={!!errors.doccategoryid}
          searchable
          onSearch={categories.handleSearch}
          hasMore={categories.hasMore}
          onLoadMore={categories.handleLoadMore}
          isLoadingMore={categories.loadingMore}
        />

        <Select
          label="ຜູ້ຮ້ອງຂໍ"
          theme="light"
          placeholder="ກະລຸນາເລືອກຜູ້ຮ້ອງຂໍ"
          value={formData.req_user}
          onChange={handleChange("req_user")}
          options={users.items.map((u) => ({ value: String(u.usid), label: `${u.username} (${u.usercode})` }))}
          error={errors.req_user}
          hasError={!!errors.req_user}
          searchable
          onSearch={users.handleSearch}
          hasMore={users.hasMore}
          onLoadMore={users.handleLoadMore}
          isLoadingMore={users.loadingMore}
        />

        <FormInput
          label="ຮຽນ"
          theme="light"
          placeholder="ກະລຸນາປ້ອນຮຽນ (ເຊັ່ນ: Director 3)"
          value={formData.req_to}
          onChange={handleChange("req_to")}
          onKeyDown={handleKeyDown(() => reqReasonRef)}
          inputRef={reqToRef}
          error={errors.req_to}
          hasError={!!errors.req_to}
        />

        <FormInput
          label="ເຫດຜົນ"
          theme="light"
          placeholder="ກະລຸນາປ້ອນເຫດຜົນ"
          value={formData.req_reason}
          onChange={handleChange("req_reason")}
          inputRef={reqReasonRef}
          error={errors.req_reason}
          hasError={!!errors.req_reason}
        />

        <Select
          label="ສາຂາ"
          theme="light"
          placeholder="ກະລຸນາເລືອກສາຂາ"
          value={formData.branchid}
          onChange={handleChange("branchid")}
          options={branches.items.map((b) => ({ value: String(b.brid), label: b.branchname }))}
          error={errors.branchid}
          hasError={!!errors.branchid}
          searchable
          onSearch={branches.handleSearch}
          hasMore={branches.hasMore}
          onLoadMore={branches.handleLoadMore}
          isLoadingMore={branches.loadingMore}
        />

        <Select
          label="ພະແນກ"
          theme="light"
          placeholder="ກະລຸນາເລືອກພະແນກ"
          value={formData.departmentid}
          onChange={handleChange("departmentid")}
          options={departments.items.map((d) => ({ value: String(d.dpid), label: d.departmentname }))}
          error={errors.departmentid}
          hasError={!!errors.departmentid}
          searchable
          onSearch={departments.handleSearch}
          hasMore={departments.hasMore}
          onLoadMore={departments.handleLoadMore}
          isLoadingMore={departments.loadingMore}
        />

        <FormInput
          label="ຈຳນວນເງິນ (ບໍ່ບັງຄັບ)"
          theme="light"
          placeholder="ກະລຸນາປ້ອນຈຳນວນເງິນ"
          value={formData.totalmoney}
          onChange={handleChange("totalmoney", (v) => v.replace(/[^0-9]/g, ""))}
          inputRef={totalmoneyRef}
          error={errors.totalmoney}
          hasError={!!errors.totalmoney}
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
