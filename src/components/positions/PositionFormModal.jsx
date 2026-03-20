import { useRef } from "react";
import useFormModal from "../../hooks/useFormModal";
import FormModalShell from "../common/FormModalShell";
import FormInput from "../common/FormInput";
import Button from "../common/Button";

export default function PositionFormModal({
  isOpen,
  onClose,
  onSubmit,
  position = null,
}) {
  const positionnameRef = useRef(null);
  const moreinfoRef = useRef(null);

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
      positionname: position?.positionname || "",
      moreinfo: position?.moreinfo || "",
    },
    validate: (data) => {
      const e = {};
      if (!data.positionname) e.positionname = "ກະລຸນາປ້ອນຊື່ຕຳແໜ່ງ";
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
      isEditing={!!position}
      entityName="ຕຳແໜ່ງ"
      displayName={formData.positionname}
      submitDialog={submitDialog}
      onClose={handleClose}
      onConfirm={handleConfirmSubmit}
      onCancelSubmit={handleCancelSubmit}
      onCloseSubmit={handleCloseSubmit}
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center border-b border-blue-400 pb-2">
        {position ? "ແກ້ໄຂຕຳແໜ່ງ" : "ເພີ່ມຕຳແໜ່ງ"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {position && (
          <FormInput label="ລະຫັດຕຳແໜ່ງ" theme="light" value={position.pid} disabled />
        )}

        <FormInput
          label="ຊື່ຕຳແໜ່ງ"
          theme="light"
          placeholder="ກະລຸນາປ້ອນຊື່ຕຳແໜ່ງ"
          value={formData.positionname}
          onChange={handleChange("positionname")}
          onKeyDown={handleKeyDown(() => moreinfoRef)}
          inputRef={positionnameRef}
          error={errors.positionname}
          hasError={!!errors.positionname}
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
