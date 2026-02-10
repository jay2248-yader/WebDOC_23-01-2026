import { useState, useRef, useEffect } from "react";
import FormInput from "../common/FormInput";
import Button from "../common/Button";
import ConfirmProgressDialog from "../common/ConfirmProgressDialog";

export default function DocumentGroupFormModal({
  isOpen,
  onClose,
  onSubmit,
  documentGroup = null,
}) {
  const [formData, setFormData] = useState({
    docgroupname: documentGroup?.docgroupname || "",
    levelapprove: documentGroup?.levelapprove || "",
    comparing: documentGroup?.comparing || "N",
    dctid: documentGroup?.dctid || "",
  });

  const [errors, setErrors] = useState({});
  const [isClosing, setIsClosing] = useState(false);
  const [submitDialog, setSubmitDialog] = useState({
    open: false,
    status: "confirm",
  });

  // Refs for input fields
  const docgroupnameRef = useRef(null);
  const levelapproveRef = useRef(null);
  const comparingRef = useRef(null);
  const dctidRef = useRef(null);

  // Reset formData and submitDialog when modal opens or documentGroup changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        docgroupname: documentGroup?.docgroupname || "",
        levelapprove: documentGroup?.levelapprove || "",
        comparing: documentGroup?.comparing || "N",
        dctid: documentGroup?.dctid || "",
      });
      setSubmitDialog({ open: false, status: "confirm" });
      setErrors({});
    }
  }, [isOpen, documentGroup]);

  if (!isOpen && !isClosing) return null;

  // Refs object for easy access
  const inputRefs = {
    docgroupname: docgroupnameRef,
    levelapprove: levelapproveRef,
    comparing: comparingRef,
    dctid: dctidRef,
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

    // Filter numeric fields
    if (field === "levelapprove" || field === "dctid") {
      value = value.replace(/[^0-9]/g, "");
    }

    setFormData({ ...formData, [field]: value });

    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    const newErrors = {};
    if (!formData.docgroupname) newErrors.docgroupname = "ກະລຸນາປ້ອນຊື່ກຸ່ມເອກະສານ";
    if (!formData.levelapprove) newErrors.levelapprove = "ກະລຸນາປ້ອນລະດັບອະນຸມັດ";
    if (!formData.dctid) newErrors.dctid = "ກະລຸນາປ້ອນລະຫັດປະເພດເອກະສານ";

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

      // Convert to proper types before submitting
      const submitData = {
        docgroupname: formData.docgroupname,
        levelapprove: parseInt(formData.levelapprove),
        comparing: formData.comparing,
        dctid: parseInt(formData.dctid),
      };

      await onSubmit(submitData);
      setSubmitDialog({ open: true, status: "success" });
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitDialog({ open: false, status: "confirm" });
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
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm ${isClosing ? "animate-fadeOut" : "animate-fadeIn"
        }`}
      onClick={handleClose}
    >
      <div
        className={`bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto ${isClosing ? "animate-slideDown" : "animate-slideUp"
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center border-b border-blue-400 pb-2">
          {documentGroup ? "ແກ້ໄຂກຸ່ມເອກະສານ" : "ເພີ່ມກຸ່ມເອກະສານ"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {documentGroup && (
            <FormInput
              label="ລະຫັດ (dcdid)"
              theme="light"
              placeholder="ລະຫັດ"
              value={documentGroup.dcdid}
              onChange={() => { }}
              disabled={true}
            />
          )}

          <FormInput
            label="ລະຫັດປະເພດເອກະສານ (dctid)"
            theme="light"
            placeholder="ກະລຸນາປ້ອນລະຫັດປະເພດເອກະສານ"
            value={formData.dctid}
            onChange={handleChange("dctid")}
            onKeyDown={handleKeyDown("docgroupname")}
            inputRef={dctidRef}
            error={errors.dctid}
            hasError={!!errors.dctid}
          />

          <FormInput
            label="ຊື່ກຸ່ມເອກະສານ (docgroupname)"
            theme="light"
            placeholder="ກະລຸນາປ້ອນຊື່ກຸ່ມເອກະສານ"
            value={formData.docgroupname}
            onChange={handleChange("docgroupname")}
            onKeyDown={handleKeyDown("levelapprove")}
            inputRef={docgroupnameRef}
            error={errors.docgroupname}
            hasError={!!errors.docgroupname}
          />

          <FormInput
            label="ລະດັບອະນຸມັດ (levelapprove)"
            theme="light"
            placeholder="ກະລຸນາປ້ອນລະດັບອະນຸມັດ (ຕົວເລກ)"
            value={formData.levelapprove}
            onChange={handleChange("levelapprove")}
            onKeyDown={handleKeyDown("comparing")}
            inputRef={levelapproveRef}
            error={errors.levelapprove}
            hasError={!!errors.levelapprove}
          />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              ການປຽບທຽບ (comparing)
            </label>
            <select
              ref={comparingRef}
              value={formData.comparing}
              onChange={handleChange("comparing")}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="Y">ແມ່ນ (Y)</option>
              <option value="N">ບໍ່ແມ່ນ (N)</option>
            </select>
          </div>

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
        title={documentGroup ? "ຢືນຢັນການແກ້ໄຂ" : "ຢືນຢັນການເພີ່ມ"}
        message={
          documentGroup
            ? `ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການແກ້ໄຂຂໍ້ມູນກຸ່ມເອກະສານ "${formData.docgroupname}"?`
            : `ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການເພີ່ມກຸ່ມເອກະສານ "${formData.docgroupname}"?`
        }
        confirmText={documentGroup ? "ແກ້ໄຂ" : "ເພີ່ມ"}
        cancelText="ຍົກເລີກ"
        loadingMessage={documentGroup ? "ກຳລັງແກ້ໄຂຂໍ້ມູນ..." : "ກຳລັງເພີ່ມກຸ່ມເອກະສານ..."}
        successMessage={documentGroup ? "ແກ້ໄຂຂໍ້ມູນສຳເລັດແລ້ວ" : "ເພີ່ມກຸ່ມເອກະສານສຳເລັດແລ້ວ"}
        onConfirm={handleConfirmSubmit}
        onCancel={handleCancelSubmit}
        onClose={handleCloseSubmit}
      />
    </div>
  );
}
