import { useRef } from "react";
import useFormModal from "../../hooks/useFormModal";
import FormModalShell from "../common/FormModalShell";
import FormInput from "../common/FormInput";
import Button from "../common/Button";

export default function BranchFormModal({
  isOpen,
  onClose,
  onSubmit,
  branch = null,
}) {
  const branchnameRef = useRef(null);
  const phoneRef = useRef(null);
  const faxRef = useRef(null);
  const moreinfoRef = useRef(null);

  const numericFilter = (v) => v.replace(/[^0-9-]/g, "");

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
      brid: branch?.brid || "",
      branchname: branch?.branchname || "",
      phone: branch?.phone || "",
      fax: branch?.fax || "",
      moreinfo: branch?.moreinfo || "",
    },
    validate: (data) => {
      const e = {};
      if (branch && !data.brid) e.brid = "ກະລຸນາປ້ອນລະຫັດສາຂາ";
      if (!data.branchname) e.branchname = "ກະລຸນາປ້ອນຊື່ສາຂາ";
      if (!data.moreinfo) e.moreinfo = "ກະລຸນາປ້ອນລາຍລະອຽດເພີ່ມເຕີມ";
      return e;
    },
    transformData: (data) => ({
      branchname: data.branchname,
      phone: data.phone,
      fax: data.fax,
      moreinfo: data.moreinfo,
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
      isEditing={!!branch}
      entityName="ສາຂາ"
      displayName={formData.branchname}
      submitDialog={submitDialog}
      onClose={handleClose}
      onConfirm={handleConfirmSubmit}
      onCancelSubmit={handleCancelSubmit}
      onCloseSubmit={handleCloseSubmit}
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center border-b border-blue-400 pb-2">
        {branch ? "ແກ້ໄຂສາຂາ" : "ເພີ່ມສາຂາ"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {branch && (
          <FormInput
            label="ລະຫັດ"
            theme="light"
            placeholder="ກະລຸນາປ້ອນລະຫັດສາຂາ"
            value={formData.brid}
            onChange={handleChange("brid", (v) => v.replace(/[^0-9]/g, ""))}
            error={errors.brid}
            hasError={!!errors.brid}
            disabled
          />
        )}

        <FormInput
          label="ຊື່ສາຂາ"
          theme="light"
          placeholder="ກະລຸນາປ້ອນຊື່ສາຂາ"
          value={formData.branchname}
          onChange={handleChange("branchname")}
          onKeyDown={handleKeyDown(() => phoneRef)}
          inputRef={branchnameRef}
          error={errors.branchname}
          hasError={!!errors.branchname}
        />

        <FormInput
          label="ເບີໂທ"
          theme="light"
          placeholder="ກະລຸນາປ້ອນເບີໂທ"
          value={formData.phone}
          onChange={handleChange("phone", numericFilter)}
          onKeyDown={handleKeyDown(() => faxRef)}
          inputRef={phoneRef}
          error={errors.phone}
          hasError={!!errors.phone}
        />

        <FormInput
          label="ແຟັກ"
          theme="light"
          placeholder="ກະລຸນາປ້ອນແຟັກ"
          value={formData.fax}
          onChange={handleChange("fax", numericFilter)}
          onKeyDown={handleKeyDown(() => moreinfoRef)}
          inputRef={faxRef}
          error={errors.fax}
          hasError={!!errors.fax}
        />

        <FormInput
          label="ລາຍລະອຽດເພີ່ມເຕີມ"
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
