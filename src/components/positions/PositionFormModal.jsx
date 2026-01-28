import { useState, useRef, useEffect } from "react";
import FormInput from "../common/FormInput";
import Button from "../common/Button";
import ConfirmProgressDialog from "../common/ConfirmProgressDialog";

export default function PositionFormModal({
  isOpen,
  onClose,
  onSubmit,
  position = null,
}) {
  const [formData, setFormData] = useState({
    positionname: position?.positionname || "",
    moreinfo: position?.moreinfo || "",
  });

  const [errors, setErrors] = useState({});
  const [isClosing, setIsClosing] = useState(false);
  const [submitDialog, setSubmitDialog] = useState({
    open: false,
    status: "confirm",
  });

  // Refs for input fields
  const positionnameRef = useRef(null);
  const moreinfoRef = useRef(null);

  // Reset formData and submitDialog when modal opens or position changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        positionname: position?.positionname || "",
        moreinfo: position?.moreinfo || "",
      });
      setSubmitDialog({ open: false, status: "confirm" });
      setErrors({});
    }
  }, [isOpen, position]);

  if (!isOpen && !isClosing) return null;

  // Refs object for easy access
  const inputRefs = {
    positionname: positionnameRef,
    moreinfo: moreinfoRef,
  };

  // Handle Enter key to move to next input
  const handleKeyDown = (nextFieldName) => (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      inputRefs[nextFieldName]?.current?.focus();
    }
  };

  const handleChange = (field) => (e) => {
    let value = e.target.value;

    setFormData({ ...formData, [field]: value });

    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    const newErrors = {};
    if (!formData.positionname) newErrors.positionname = "ກະລຸນາປ້ອນຊື່ຕຳແໜ່ງ";

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
      console.error("Error submitting form:", error);
      setSubmitDialog({ open: false, status: "confirm" });
      // Show error to user
      alert(error.message || "ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນ");
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
      // Reset form handled by useEffect
      setErrors({});
      setIsClosing(false);
    }, 300);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
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
          {position ? "ແກ້ໄຂຕຳແໜ່ງ" : "ເພີ່ມຕຳແໜ່ງ"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {position && (
            <FormInput
              label="ລະຫັດຕຳແໜ່ງ"
              theme="light"
              placeholder="ລະຫັດຕຳແໜ່ງ"
              value={position.pid}
              onChange={() => {}}
              disabled={true}
            />
          )}

          <FormInput
            label="ຊື່ຕຳແໜ່ງ"
            theme="light"
            placeholder="ກະລຸນາປ້ອນຊື່ຕຳແໜ່ງ"
            value={formData.positionname}
            onChange={handleChange("positionname")}
            onKeyDown={handleKeyDown("moreinfo")}
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
        title={position ? "ຢືນຢັນການແກ້ໄຂ" : "ຢືນຢັນການເພີ່ມ"}
        message={
          position
            ? `ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການແກ້ໄຂຂໍ້ມູນຕຳແໜ່ງ "${formData.positionname}"?`
            : `ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການເພີ່ມຕຳແໜ່ງ "${formData.positionname}"?`
        }
        confirmText={position ? "ແກ້ໄຂ" : "ເພີ່ມ"}
        cancelText="ຍົກເລີກ"
        loadingMessage={position ? "ກຳລັງແກ້ໄຂຂໍ້ມູນ..." : "ກຳລັງເພີ່ມຕຳແໜ່ງ..."}
        successMessage={position ? "ແກ້ໄຂຂໍ້ມູນສຳເລັດແລ້ວ" : "ເພີ່ມຕຳແໜ່ງສຳເລັດແລ້ວ"}
        onConfirm={handleConfirmSubmit}
        onCancel={handleCancelSubmit}
        onClose={handleCloseSubmit}
      />
    </div>
  );
}
