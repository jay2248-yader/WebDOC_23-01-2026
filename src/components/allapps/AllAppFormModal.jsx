import { useRef } from "react";
import useFormModal from "../../hooks/useFormModal";
import FormModalShell from "../common/FormModalShell";
import FormInput from "../common/FormInput";
import Button from "../common/Button";

export default function AllAppFormModal({
  isOpen,
  onClose,
  onSubmit,
  allApp = null,
}) {
  const appnameRef = useRef(null);
  const applinkRef = useRef(null);
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
      appname: allApp?.appname || "",
      applink: allApp?.applink || "",
      moreinfo: allApp?.moreinfo || "",
    },
    validate: (data) => {
      const e = {};
      if (!data.appname) e.appname = "ກະລຸນາປ້ອນຊື່ AllApp";
      if (!data.applink) e.applink = "ກະລຸນາປ້ອນລິ້ງ";
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
      isEditing={!!allApp}
      entityName="AllApp"
      displayName={formData.appname}
      submitDialog={submitDialog}
      onClose={handleClose}
      onConfirm={handleConfirmSubmit}
      onCancelSubmit={handleCancelSubmit}
      onCloseSubmit={handleCloseSubmit}
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center border-b border-blue-400 pb-2">
        {allApp ? "ແກ້ໄຂ AllApp" : "ເພີ່ມ AllApp"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {allApp && (
          <FormInput label="ລະຫັດ" theme="light" value={allApp.aaid} disabled />
        )}

        <FormInput
          label="ຊື່ AllApp"
          theme="light"
          placeholder="ກະລຸນາປ້ອນຊື່ AllApp"
          value={formData.appname}
          onChange={handleChange("appname")}
          onKeyDown={handleKeyDown(() => applinkRef)}
          inputRef={appnameRef}
          error={errors.appname}
          hasError={!!errors.appname}
        />

        <FormInput
          label="ລິ້ງ"
          theme="light"
          placeholder="ກະລຸນາປ້ອນລິ້ງ (ເຊັ່ນ: http://...)"
          value={formData.applink}
          onChange={handleChange("applink")}
          onKeyDown={handleKeyDown(() => moreinfoRef)}
          inputRef={applinkRef}
          error={errors.applink}
          hasError={!!errors.applink}
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
