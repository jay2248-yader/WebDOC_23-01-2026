import { useRef } from "react";
import useFormModal from "../../hooks/useFormModal";
import FormModalShell from "../common/FormModalShell";
import FormInput from "../common/FormInput";
import Button from "../common/Button";

export default function GroupappFormModal({
  isOpen,
  onClose,
  onSubmit,
  groupapp = null,
}) {
  const groupnameRef = useRef(null);
  const groupinfoRef = useRef(null);

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
      groupname: groupapp?.groupname || "",
      groupinfo: groupapp?.groupinfo || "",
    },
    validate: (data) => {
      const e = {};
      if (!data.groupname) e.groupname = "ກະລຸນາປ້ອນຊື່ Groupapp";
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
      isEditing={!!groupapp}
      entityName="Groupapp"
      displayName={formData.groupname}
      submitDialog={submitDialog}
      onClose={handleClose}
      onConfirm={handleConfirmSubmit}
      onCancelSubmit={handleCancelSubmit}
      onCloseSubmit={handleCloseSubmit}
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center border-b border-blue-400 pb-2">
        {groupapp ? "ແກ້ໄຂ Groupapp" : "ເພີ່ມ Groupapp"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {groupapp && (
          <FormInput label="ລະຫັດ" theme="light" value={groupapp.gid} disabled />
        )}

        <FormInput
          label="ຊື່ Groupapp"
          theme="light"
          placeholder="ກະລຸນາປ້ອນຊື່ Groupapp"
          value={formData.groupname}
          onChange={handleChange("groupname")}
          onKeyDown={handleKeyDown(() => groupinfoRef)}
          inputRef={groupnameRef}
          error={errors.groupname}
          hasError={!!errors.groupname}
        />

        <FormInput
          label="ລາຍລະອຽດເພີ່ມເຕີມ (ທາງເລືອກ)"
          theme="light"
          placeholder="ກະລຸນາປ້ອນລາຍລະອຽດ"
          value={formData.groupinfo}
          onChange={handleChange("groupinfo")}
          inputRef={groupinfoRef}
          error={errors.groupinfo}
          hasError={!!errors.groupinfo}
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
