import { useRef } from "react";
import useFormModal from "../../hooks/useFormModal";
import FormModalShell from "../common/FormModalShell";
import FormInput from "../common/FormInput";
import Button from "../common/Button";

export default function BoardFormModal({
  isOpen,
  onClose,
  onSubmit,
  board = null,
}) {
  const boardnameRef = useRef(null);
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
      boardname: board?.boardtname || "",
      moreinfo: board?.moreinfo || "",
    },
    validate: (data) => {
      const e = {};
      if (!data.boardname) e.boardname = "ກະລຸນາປ້ອນຊື່ຄະນະກໍາມະການ";
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
      isEditing={!!board}
      entityName="ຄະນະກໍາມະການ"
      displayName={formData.boardname}
      submitDialog={submitDialog}
      onClose={handleClose}
      onConfirm={handleConfirmSubmit}
      onCancelSubmit={handleCancelSubmit}
      onCloseSubmit={handleCloseSubmit}
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center border-b border-blue-400 pb-2">
        {board ? "ແກ້ໄຂຄະນະກໍາມະການ" : "ເພີ່ມຄະນະກໍາມະການ"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {board && (
          <FormInput label="ລະຫັດ" theme="light" value={board.bdid} disabled />
        )}

        <FormInput
          label="ຊື່ຄະນະກໍາມະການ"
          theme="light"
          placeholder="ກະລຸນາປ້ອນຊື່ຄະນະກໍາມະການ"
          value={formData.boardname}
          onChange={handleChange("boardname")}
          onKeyDown={handleKeyDown(() => moreinfoRef)}
          inputRef={boardnameRef}
          error={errors.boardname}
          hasError={!!errors.boardname}
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
