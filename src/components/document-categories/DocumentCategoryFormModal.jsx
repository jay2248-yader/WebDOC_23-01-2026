import { useRef } from "react";
import useFormModal from "../../hooks/useFormModal";
import FormModalShell from "../common/FormModalShell";
import FormInput from "../common/FormInput";
import Button from "../common/Button";

export default function DocumentCategoryFormModal({
  isOpen,
  onClose,
  onSubmit,
  category = null,
}) {
  const nameRef = useRef(null);
  const infoRef = useRef(null);

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
      doccategoryname: category?.doccategoryname || "",
      moreinfo: category?.moreinfo || "",
    },
    validate: (data) => {
      const e = {};
      if (!data.doccategoryname) e.doccategoryname = "ກະລຸນາປ້ອນຊື່ປະເພດເອກະສານ";
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
      isEditing={!!category}
      entityName="ປະເພດເອກະສານ"
      displayName={formData.doccategoryname}
      submitDialog={submitDialog}
      onClose={handleClose}
      onConfirm={handleConfirmSubmit}
      onCancelSubmit={handleCancelSubmit}
      onCloseSubmit={handleCloseSubmit}
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center border-b border-blue-400 pb-2">
        {category ? "ແກ້ໄຂປະເພດເອກະສານ" : "ເພີ່ມປະເພດເອກະສານ"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {category && (
          <FormInput label="ລະຫັດປະເພດເອກະສານ" theme="light" value={category.dctid} disabled />
        )}

        <FormInput
          label="ຊື່ປະເພດເອກະສານ"
          theme="light"
          placeholder="ກະລຸນາປ້ອນຊື່ປະເພດເອກະສານ"
          value={formData.doccategoryname}
          onChange={handleChange("doccategoryname")}
          onKeyDown={handleKeyDown(() => infoRef)}
          inputRef={nameRef}
          error={errors.doccategoryname}
          hasError={!!errors.doccategoryname}
        />

        <FormInput
          label="ລາຍລະອຽດເພີ່ມເຕີມ"
          theme="light"
          placeholder="ກະລຸນາປ້ອນລາຍລະອຽດເພີ່ມເຕີມ"
          value={formData.moreinfo}
          onChange={handleChange("moreinfo")}
          inputRef={infoRef}
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
