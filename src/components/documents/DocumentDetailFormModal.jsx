import { useRef } from "react";
import useFormModal from "../../hooks/useFormModal";
import FormModalShell from "../common/FormModalShell";
import Button from "../common/Button";

export default function DocumentDetailFormModal({
  isOpen,
  onClose,
  onSubmit,
  document = null,
}) {
  const reqToRef = useRef(null);
  const reqTitleRef = useRef(null);
  const reqSubtitleRef = useRef(null);
  const reqMoreinfoRef = useRef(null);

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
      rqdid: document?.rqdid || "",
      req_to: "",
      req_title: "",
      req_subtitle: "",
      req_moreinfo: "",
    },
    validate: (data) => {
      const e = {};
      if (!data.req_to) e.req_to = "ກະລຸນາປ້ອນຮຽນ";
      if (!data.req_title) e.req_title = "ກະລຸນາປ້ອນຫົວຂໍ້";
      if (!data.req_subtitle) e.req_subtitle = "ກະລຸນາປ້ອນຫົວຂໍ້ຍ່ອຍ";
      if (!data.req_moreinfo) e.req_moreinfo = "ກະລຸນາປ້ອນລາຍລະອຽດເພີ່ມເຕີມ";
      return e;
    },
  });

  const handleKeyDown = (getRef) => (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      getRef().current?.focus();
    }
  };

  const inputCls = (field) =>
    `w-full rounded-lg border ${errors[field] ? "border-red-500" : "border-blue-300"} bg-white px-4 py-2.5 text-sm text-gray-700 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-400`;

  return (
    <FormModalShell
      shouldRender={shouldRender}
      isClosing={isClosing}
      isEditing={false}
      entityName="ລາຍລະອຽດເອກະສານ"
      displayName={formData.req_title}
      submitDialog={submitDialog}
      onClose={handleClose}
      onConfirm={handleConfirmSubmit}
      onCancelSubmit={handleCancelSubmit}
      onCloseSubmit={handleCloseSubmit}
      maxWidth="max-w-xl"
    >
      <h3 className="text-xl font-bold text-gray-900 mb-6 text-center border-b-2 border-[#0F75BC] pb-3">
        ເພີ່ມລາຍລະອຽດເອກະສານ
      </h3>

      <form onSubmit={handleSubmit} className="space-y-5">
        {[
          { field: "req_to", label: "ຮຽນ", placeholder: "ກະລຸນາປ້ອນຮຽນ", ref: reqToRef, nextRef: () => reqTitleRef },
          { field: "req_title", label: "ຫົວຂໍ້", placeholder: "ກະລຸນາປ້ອນຫົວຂໍ້", ref: reqTitleRef, nextRef: () => reqSubtitleRef },
          { field: "req_subtitle", label: "ຫົວຂໍ້ຍ່ອຍ", placeholder: "ກະລຸນາປ້ອນຫົວຂໍ້ຍ່ອຍ", ref: reqSubtitleRef, nextRef: () => reqMoreinfoRef, minH: "min-h-[70px]" },
        ].map(({ field, label, placeholder, ref, nextRef, minH }) => (
          <div key={field} className="flex items-start gap-4">
            <label className="w-32 shrink-0 text-sm font-medium text-gray-700 pt-2.5">{label}</label>
            <div className="flex-1">
              <input
                type="text"
                ref={ref}
                value={formData[field]}
                onChange={handleChange(field)}
                onKeyDown={handleKeyDown(nextRef)}
                placeholder={placeholder}
                className={`${inputCls(field)} ${minH || ""}`}
              />
              {errors[field] && <p className="mt-1 text-xs text-red-500">{errors[field]}</p>}
            </div>
          </div>
        ))}

        <div className="flex items-start gap-4">
          <label className="w-32 shrink-0 text-sm font-medium text-gray-700 pt-2.5">ລາຍລະອຽດ</label>
          <div className="flex-1">
            <textarea
              ref={reqMoreinfoRef}
              value={formData.req_moreinfo}
              onChange={handleChange("req_moreinfo")}
              placeholder="ກະລຸນາປ້ອນລາຍລະອຽດເພີ່ມເຕີມ"
              rows={4}
              className={`${inputCls("req_moreinfo")} min-h-30 resize-none`}
            />
            {errors.req_moreinfo && <p className="mt-1 text-xs text-red-500">{errors.req_moreinfo}</p>}
          </div>
        </div>

        <div className="flex justify-between pt-8">
          <Button type="button" fullWidth={false} variant="outline" size="md" onClick={handleClose}>
            ຍົກເລີກ
          </Button>
          <Button type="submit" fullWidth={false} variant="outline" size="md" className="bg-red-500 text-white border-red-500 hover:bg-red-600">
            ສຳເລັດ
          </Button>
        </div>
      </form>
    </FormModalShell>
  );
}
