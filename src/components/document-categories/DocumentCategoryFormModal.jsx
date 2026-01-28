import { useState, useRef, useEffect } from "react";
import FormInput from "../common/FormInput";
import Button from "../common/Button";
import ConfirmProgressDialog from "../common/ConfirmProgressDialog";

export default function DocumentCategoryFormModal({
  isOpen,
  onClose,
  onSubmit,
  category = null,
}) {
  const [formData, setFormData] = useState({
    doccategoryname: category?.doccategoryname || "",
    moreinfo: category?.moreinfo || "",
  });

  const [errors, setErrors] = useState({});
  const [isClosing, setIsClosing] = useState(false);
  const [submitDialog, setSubmitDialog] = useState({
    open: false,
    status: "confirm",
  });

  // Refs for input fields
  const nameRef = useRef(null);
  const infoRef = useRef(null);

  // Reset form state when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        doccategoryname: category?.doccategoryname || "",
        moreinfo: category?.moreinfo || "",
      });
      setSubmitDialog({ open: false, status: "confirm" });
      setErrors({});
    }
  }, [isOpen, category]);

  if (!isOpen && !isClosing) return null;

  // Refs object for easy access
  const inputRefs = {
    doccategoryname: nameRef,
    moreinfo: infoRef,
  };

  // Handle Enter key to move to next input
  const handleKeyDown = (nextFieldName) => (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      inputRefs[nextFieldName]?.current?.focus();
    }
  };

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setFormData({ ...formData, [field]: value });

    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    const newErrors = {};
    if (!formData.doccategoryname) newErrors.doccategoryname = "ກະລຸນາປ້ອນຊື່ປະເພດເອກະສານ";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Show confirm dialog
    setSubmitDialog({ open: true, status: "confirm" });
  };

  const handleConfirmSubmit = async () => {
    try {
      setSubmitDialog({ open: true, status: "loading" });
      await onSubmit(formData);
      setSubmitDialog({ open: true, status: "success" });
    } catch (error) {
      console.error("Error submitting document category:", error);
      alert(error.message || "ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນ");
      setSubmitDialog({ open: false, status: "confirm" });
    }
  };

  const handleCancelSubmit = () => {
    setSubmitDialog({ open: false, status: "confirm" });
  };

  const handleCloseSubmit = () => {
    setSubmitDialog({ open: false, status: "confirm" });

    // Close form modal
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      // Reset form
      setFormData({
        doccategoryname: "",
        moreinfo: "",
      });
      setErrors({});
      setIsClosing(false);
    }, 300);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setFormData({
        doccategoryname: "",
        moreinfo: "",
      });
      setErrors({});
      setIsClosing(false);
    }, 300);
  };

  const handleCancel = () => {
    handleClose();
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm ${
        isClosing ? "animate-fadeOut" : "animate-fadeIn"
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto ${
          isClosing ? "animate-slideDown" : "animate-slideUp"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center border-b border-blue-400 pb-2">
          {category ? "ແກ້ໄຂປະເພດເອກະສານ" : "ເພີ່ມປະເພດເອກະສານ"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {category && (
            <FormInput
              label="ລະຫັດປະເພດເອກະສານ"
              theme="light"
              placeholder="ລະຫັດປະເພດເອກະສານ"
              value={category.dctid}
              onChange={() => {}}
              disabled={true}
            />
          )}

          <FormInput
            label="ຊື່ປະເພດເອກະສານ"
            theme="light"
            placeholder="ກະລຸນາປ້ອນຊື່ປະເພດເອກະສານ"
            value={formData.doccategoryname}
            onChange={handleChange("doccategoryname")}
            onKeyDown={handleKeyDown("moreinfo")}
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
            <Button
              type="button"
              fullWidth={false}
              variant="secondary"
              size="md"
              onClick={handleCancel}
            >
              ຍົກເລີກ
            </Button>
            <Button
              type="submit"
              fullWidth={false}
              variant="outline"
              size="md"
              className="bg-[#0F75BC] text-white hover:bg-blue-700"
            >
              ສຳເລັດ
            </Button>
          </div>
        </form>
      </div>

      <ConfirmProgressDialog
        isOpen={submitDialog.open}
        status={submitDialog.status}
        title={category ? "ຢືນຢັນການແກ້ໄຂ" : "ຢືນຢັນການເພີ່ມ"}
        message={
          category
            ? `ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການແກ້ໄຂປະເພດເອກະສານ "${formData.doccategoryname}"?`
            : `ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການເພີ່ມປະເພດເອກະສານ "${formData.doccategoryname}"?`
        }
        confirmText={category ? "ແກ້ໄຂ" : "ເພີ່ມ"}
        cancelText="ຍົກເລີກ"
        loadingMessage={category ? "ກຳລັງແກ້ໄຂຂໍ້ມູນ..." : "ກຳລັງເພີ່ມປະເພດເອກະສານ..."}
        successMessage={category ? "ແກ້ໄຂຂໍ້ມູນສຳເລັດແລ້ວ" : "ເພີ່ມປະເພດເອກະສານສຳເລັດແລ້ວ"}
        onConfirm={handleConfirmSubmit}
        onCancel={handleCancelSubmit}
        onClose={handleCloseSubmit}
      />
    </div>
  );
}
