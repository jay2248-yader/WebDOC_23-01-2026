import { useState, useRef } from "react";
import FormInput from "../common/FormInput";
import Select from "../common/Select";
import Button from "../common/Button";
import ConfirmProgressDialog from "../common/ConfirmProgressDialog";

// Parent should pass a unique `key` prop when opening modal to reset form state
export default function UserFormModal({
  isOpen,
  onClose,
  onSubmit,
  user = null,
}) {
  // Initialize form with user data (runs once per formKey change due to parent key prop)
  const [formData, setFormData] = useState(() => ({
    usercode: user?.usercode || "",
    username: user?.username || "",
    shortname: user?.shortname || "",
    gendername: user?.gendername || "ຊາຍ",
    statustype: user?.statustype || "ADD",
    changeme: user?.changeme || "YES",
    departmentname: user?.departmentmodel?.departmentname || "",
  }));

  const [errors, setErrors] = useState({});
  const [isClosing, setIsClosing] = useState(false);
  const [submitDialog, setSubmitDialog] = useState({
    open: false,
    status: "confirm",
  });

  // Refs for input fields
  const usernameRef = useRef(null);
  const shortnameRef = useRef(null);
  const gendernameRef = useRef(null);
  const statustypeRef = useRef(null);
  const changemeRef = useRef(null);
  const departmentnameRef = useRef(null);

  if (!isOpen && !isClosing) return null;

  // Refs object for easy access
  const inputRefs = {
    username: usernameRef,
    shortname: shortnameRef,
    gendername: gendernameRef,
    statustype: statustypeRef,
    changeme: changemeRef,
    departmentname: departmentnameRef,
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

    // allow only English letters + numbers for usercode
    if (field === "usercode") {
      value = value.replace(/[^a-zA-Z0-9]/g, "");
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
    if (!formData.usercode) newErrors.usercode = "ກະລຸນາປ້ອນລະຫັດ";
    if (!formData.username) newErrors.username = "ກະລຸນາປ້ອນຊື່";
    if (!formData.departmentname) newErrors.departmentname = "ກະລຸນາປ້ອນພະແນກ";

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

  const genderOptions = [
    { value: "ຊາຍ", label: "ຊາຍ" },
    { value: "ຍິງ", label: "ຍິງ" },
  ];

  const statusOptions = [
    { value: "ADD", label: "ເພີ່ມ" },
    { value: "INACTIVE", label: "ປິດໃຊ້ງານ" },
  ];

  const changemeOptions = [
    { value: "YES", label: "YES" },
    { value: "NO", label: "NO" },
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4  text-center border-b border-blue-400 pb-2">
          {user ? "ແກ້ໄຂຜູ້ໃຊ້" : "ສ້າງຜູ້ໃຊ້"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="ລະຫັດ"
            theme="light"
            placeholder="ກະລຸນາປ້ອນລະຫັດ"
            value={formData.usercode}
            onChange={handleChange("usercode")}
            onKeyDown={handleKeyDown("username")}
            error={errors.usercode}
            hasError={!!errors.usercode}
            inputMode="text"
            autoComplete="off"
          />

          <FormInput
            label="ຊື່"
            theme="light"
            placeholder="ກະລຸນາປ້ອນຊື່"
            value={formData.username}
            onChange={handleChange("username")}
            onKeyDown={handleKeyDown("shortname")}
            inputRef={usernameRef}
            error={errors.username}
            hasError={!!errors.username}
          />

           <FormInput
            label="ຊື່ຫຍໍ້"
            theme="light"
            placeholder="ກະລຸນາປ້ອນຊື່ຫຍໍ້"
            value={formData.shortname}
            onChange={handleChange("shortname")}
            onKeyDown={handleKeyDown("gendername")}
            inputRef={shortnameRef}
          />

           <Select
            label="ເພດ"
            theme="light"
            value={formData.gendername}
            onChange={handleChange("gendername")}
            options={genderOptions}
            inputRef={gendernameRef}
          />

           <FormInput
            label="ພະແນກ"
            theme="light"
            placeholder="ກະລຸນາປ້ອນພະແນກ"
            value={formData.departmentname}
            onChange={handleChange("departmentname")}
            onKeyDown={handleKeyDown("statustype")}
            inputRef={departmentnameRef}
            error={errors.departmentname}
            hasError={!!errors.departmentname}
          />

           <Select
            label="ສະຖານະ"
            theme="light"
            value={formData.statustype}
            onChange={handleChange("statustype")}
            options={statusOptions}
            inputRef={statustypeRef}
          />

           <Select
            label="Change Me"
            theme="light"
            value={formData.changeme}
            onChange={handleChange("changeme")}
            options={changemeOptions}
            inputRef={changemeRef}
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
        title={user ? "ຢືນຢັນການແກ້ໄຂ" : "ຢືນຢັນການສ້າງ"}
        message={
          user
            ? `ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການແກ້ໄຂຂໍ້ມູນຜູ້ໃຊ້ "${formData.username}"?`
            : `ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການສ້າງຜູ້ໃຊ້ "${formData.username}"?`
        }
        confirmText={user ? "ແກ້ໄຂ" : "ສ້າງ"}
        cancelText="ຍົກເລີກ"
        loadingMessage={user ? "ກຳລັງແກ້ໄຂຂໍ້ມູນ..." : "ກຳລັງສ້າງຜູ້ໃຊ້..."}
        successMessage={user ? "ແກ້ໄຂຂໍ້ມູນສຳເລັດແລ້ວ" : "ສ້າງຜູ້ໃຊ້ສຳເລັດແລ້ວ"}
        onConfirm={handleConfirmSubmit}
        onCancel={handleCancelSubmit}
        onClose={handleCloseSubmit}
      />
    </div>
  );
}
