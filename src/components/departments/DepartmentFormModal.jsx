import { useState, useRef, useEffect } from "react";
import FormInput from "../common/FormInput";
import Button from "../common/Button";
import ConfirmProgressDialog from "../common/ConfirmProgressDialog";

export default function DepartmentFormModal({
  isOpen,
  onClose,
  onSubmit,
  department = null,
}) {
  const [formData, setFormData] = useState({
    bdid: department?.bdid || "",
    departmentname: department?.departmentname || "",
    moreinfo: department?.moreinfo || "",
  });

  // Reset formData and submitDialog when modal opens or department changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        bdid: department?.bdid || "",
        departmentname: department?.departmentname || "",
        moreinfo: department?.moreinfo || "",
      });
      setSubmitDialog({ open: false, status: "confirm" });
      setErrors({});
    }
  }, [isOpen, department]);

  const [errors, setErrors] = useState({});
  const [isClosing, setIsClosing] = useState(false);
  const [submitDialog, setSubmitDialog] = useState({
    open: false,
    status: "confirm",
  });

  // Refs for input fields
  const bdidRef = useRef(null);
  const departmentnameRef = useRef(null);
  const moreinfoRef = useRef(null);

  if (!isOpen && !isClosing) return null;

  // Refs object for easy access
  const inputRefs = {
    bdid: bdidRef,
    departmentname: departmentnameRef,
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

    // bdid is numeric
    if (field === "bdid") {
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
    if (!formData.bdid) newErrors.bdid = "ກະລຸນາປ້ອນລະຫັດຄະນະ";
    if (!formData.departmentname) newErrors.departmentname = "ກະລຸນາປ້ອນຊື່ພະແນກ";

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
          {department ? "ແກ້ໄຂພະແນກ" : "ເພີ່ມພະແນກ"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {department && (
            <FormInput
              label="ລະຫັດພະແນກ"
              theme="light"
              placeholder="ລະຫັດພະແນກ"
              value={department.dpid}
              onChange={() => {}}
              disabled={true}
            />
          )}

          <FormInput
            label="ລະຫັດຄະນະ"
            theme="light"
            placeholder="ກະລຸນາປ້ອນລະຫັດຄະນະ"
            value={formData.bdid}
            onChange={handleChange("bdid")}
            onKeyDown={handleKeyDown("departmentname")}
            inputRef={bdidRef}
            error={errors.bdid}
            hasError={!!errors.bdid}
            inputMode="numeric"
            autoComplete="off"
          />

          <FormInput
            label="ຊື່ພະແນກ"
            theme="light"
            placeholder="ກະລຸນາປ້ອນຊື່ພະແນກ"
            value={formData.departmentname}
            onChange={handleChange("departmentname")}
            onKeyDown={handleKeyDown("moreinfo")}
            inputRef={departmentnameRef}
            error={errors.departmentname}
            hasError={!!errors.departmentname}
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
        title={department ? "ຢືນຢັນການແກ້ໄຂ" : "ຢືນຢັນການເພີ່ມ"}
        message={
          department
            ? `ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການແກ້ໄຂຂໍ້ມູນພະແນກ "${formData.departmentname}"?`
            : `ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການເພີ່ມພະແນກ "${formData.departmentname}"?`
        }
        confirmText={department ? "ແກ້ໄຂ" : "ເພີ່ມ"}
        cancelText="ຍົກເລີກ"
        loadingMessage={department ? "ກຳລັງແກ້ໄຂຂໍ້ມູນ..." : "ກຳລັງເພີ່ມພະແນກ..."}
        successMessage={department ? "ແກ້ໄຂຂໍ້ມູນສຳເລັດແລ້ວ" : "ເພີ່ມພະແນກສຳເລັດແລ້ວ"}
        onConfirm={handleConfirmSubmit}
        onCancel={handleCancelSubmit}
        onClose={handleCloseSubmit}
      />
    </div>
  );
}
