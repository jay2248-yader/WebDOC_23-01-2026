import { useState, useRef } from "react";
import FormInput from "../common/FormInput";
import Select from "../common/Select";
import Button from "../common/Button";
import ConfirmProgressDialog from "../common/ConfirmProgressDialog";

export default function BoardFormModal({
  isOpen,
  onClose,
  onSubmit,
  board = null,
}) {
  const [formData, setFormData] = useState({
    bdid: board?.bdid || "",
    boardtname: board?.boardtname || "",
    moreinfo: board?.moreinfo || "",
    statustype: board?.statustype || "ADD",
  });

  // ไม่ต้องใช้ useEffect แล้ว เพราะใช้ key prop ใน parent component
  // Component จะถูก remount ใหม่เมื่อ board เปลี่ยน

  const [errors, setErrors] = useState({});
  const [isClosing, setIsClosing] = useState(false);
  const [submitDialog, setSubmitDialog] = useState({
    open: false,
    status: "confirm",
  });

  // Refs for input fields
  const boardtnameRef = useRef(null);
  const moreinfoRef = useRef(null);
  const statustypeRef = useRef(null);

  if (!isOpen && !isClosing) return null;

  // Refs object for easy access
  const inputRefs = {
    boardtname: boardtnameRef,
    moreinfo: moreinfoRef,
    statustype: statustypeRef,
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

    // Assuming bdid is numeric ID
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
    if (!formData.bdid) newErrors.bdid = "ກະລຸນາປ້ອນລະຫັດ";
    if (!formData.boardtname) newErrors.boardtname = "ກະລຸນາປ້ອນຊື່ຄະນະກໍາມະການ";
    if (!formData.moreinfo) newErrors.moreinfo = "ກະລຸນາປ້ອນລາຍລະອຽດເພີ່ມເຕີມ";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Show confirm dialog
    setSubmitDialog({ open: true, status: "confirm" });
  };

  const handleConfirmSubmit = async () => {
    setSubmitDialog({ open: true, status: "loading" });
    await onSubmit(formData);
    setSubmitDialog({ open: true, status: "success" });
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

  const statusOptions = [
    { value: "ADD", label: "ເພີ່ມ" },
    { value: "INACTIVE", label: "ປິດໃຊ້ງານ" }, 
  ];

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
          {board ? "ແກ້ໄຂຄະນະກໍາມະການ" : "ເພີ່ມຄະນະກໍາມະການ"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="ລະຫັດ"
            theme="light"
            placeholder="ກະລຸນາປ້ອນລະຫັດ"
            value={formData.bdid}
            onChange={handleChange("bdid")}
            onKeyDown={handleKeyDown("boardtname")}
            error={errors.bdid}
            hasError={!!errors.bdid}
            inputMode="numeric"
            autoComplete="off"
            disabled={!!board} // Disable ID on edit if it's a primary key/unique ID
          />

          <FormInput
            label="ຊື່ຄະນະກໍາມະການ"
            theme="light"
            placeholder="ກະລຸນາປ້ອນຊື່ຄະນະກໍາມະການ"
            value={formData.boardtname}
            onChange={handleChange("boardtname")}
            onKeyDown={handleKeyDown("moreinfo")}
            inputRef={boardtnameRef}
            error={errors.boardtname}
            hasError={!!errors.boardtname}
          />

          <FormInput
            label="ລາຍລະອຽດເພີ່ມເຕີມ"
            theme="light"
            placeholder="ກະລຸນາປ້ອນລາຍລະອຽດ"
            value={formData.moreinfo}
            onChange={handleChange("moreinfo")}
            onKeyDown={handleKeyDown("statustype")}
            inputRef={moreinfoRef}
            error={errors.moreinfo}
            hasError={!!errors.moreinfo}
          />

          <Select
            label="ສະຖານະ"
            theme="light"
            value={formData.statustype}
            onChange={handleChange("statustype")}
            options={statusOptions}
            placeholder="ເລືອກສະຖານະ"
            inputRef={statustypeRef}
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
        title={board ? "ຢືນຢັນການແກ້ໄຂ" : "ຢືນຢັນການເພີ່ມ"}
        message={
          board
            ? `ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການແກ້ໄຂຂໍ້ມູນຄະນະກໍາມະການ "${formData.boardtname}"?`
            : `ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການເພີ່ມຄະນະກໍາມະການ "${formData.boardtname}"?`
        }
        confirmText={board ? "ແກ້ໄຂ" : "ເພີ່ມ"}
        cancelText="ຍົກເລີກ"
        loadingMessage={board ? "ກຳລັງແກ້ໄຂຂໍ້ມູນ..." : "ກຳລັງເພີ່ມຄະນະກໍາມະການ..."}
        successMessage={board ? "ແກ້ໄຂຂໍ້ມູນສຳເລັດແລ້ວ" : "ເພີ່ມຄະນະກໍາມະການສຳເລັດແລ້ວ"}
        onConfirm={handleConfirmSubmit}
        onCancel={handleCancelSubmit}
        onClose={handleCloseSubmit}
      />
    </div>
  );
}
