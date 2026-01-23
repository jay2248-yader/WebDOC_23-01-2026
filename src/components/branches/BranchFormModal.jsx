import { useState, useRef } from "react";
import FormInput from "../common/FormInput";
import Button from "../common/Button";
import ConfirmProgressDialog from "../common/ConfirmProgressDialog";

export default function BranchFormModal({
  isOpen,
  onClose,
  onSubmit,
  branch = null,
}) {
  const [formData, setFormData] = useState({
    brid: branch?.brid || "",
    branchname: branch?.branchname || "",
    phone: branch?.phone || "",
    fax: branch?.fax || "",
    moreinfo: branch?.moreinfo || "",
  });

  const [errors, setErrors] = useState({});
  const [isClosing, setIsClosing] = useState(false);
  const [submitDialog, setSubmitDialog] = useState({
    open: false,
    status: "confirm",
  });

  // Refs
  const branchnameRef = useRef(null);
  const phoneRef = useRef(null);
  const faxRef = useRef(null);
  const moreinfoRef = useRef(null);

  if (!isOpen && !isClosing) return null;

  const inputRefs = {
    branchname: branchnameRef,
    phone: phoneRef,
    fax: faxRef,
    moreinfo: moreinfoRef,
  };

  const handleKeyDown = (nextFieldName) => (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      inputRefs[nextFieldName]?.current?.focus();
    }
  };

  const handleChange = (field) => (e) => {
    let value = e.target.value;

    if (field === "phone" || field === "fax") {
      value = value.replace(/[^0-9-]/g, "");
    }

    if (field === "brid") {
      value = value.replace(/[^0-9]/g, "");
    }

    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (branch && !formData.brid) newErrors.brid = "ກະລຸນາປ້ອນລະຫັດສາຂາ";
    if (!formData.branchname) newErrors.branchname = "ກະລຸນາປ້ອນຊື່ສາຂາ";
    if (!formData.moreinfo) newErrors.moreinfo = "ກະລຸນາປ້ອນລາຍລະອຽດເພີ່ມເຕີມ";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitDialog({ open: true, status: "confirm" });
  };

  const handleConfirmSubmit = async () => {
    setSubmitDialog({ open: true, status: "loading" });

    const payload = {
      branchname: formData.branchname,
      phone: formData.phone,
      fax: formData.fax,
      moreinfo: formData.moreinfo,
    };

    await onSubmit(payload);
    setSubmitDialog({ open: true, status: "success" });
  };

  const handleCancelSubmit = () => {
    setSubmitDialog({ open: false, status: "confirm" });
  };

  const handleCloseSubmit = () => {
    setSubmitDialog({ open: false, status: "confirm" });

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
          {branch ? "ແກ້ໄຂສາຂາ" : "ເພີ່ມສາຂາ"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* brid เฉพาะตอนแก้ไข */}
          {branch && (
            <FormInput
              label="ລະຫັດ"
              theme="light"
              placeholder="ກະລຸນາປ້ອນລະຫັດສາຂາ"
              value={formData.brid}
              onChange={handleChange("brid")}
              onKeyDown={handleKeyDown("branchname")}
              error={errors.brid}
              hasError={!!errors.brid}
              inputMode="numeric"
              autoComplete="off"
              disabled={true}
            />
          )}

          <FormInput
            label="ຊື່ສາຂາ"
            theme="light"
            placeholder="ກະລຸນາປ້ອນຊື່ສາຂາ"
            value={formData.branchname}
            onChange={handleChange("branchname")}
            onKeyDown={handleKeyDown("phone")}
            inputRef={branchnameRef}
            error={errors.branchname}
            hasError={!!errors.branchname}
          />

          <FormInput
            label="ເບີໂທ"
            theme="light"
            placeholder="ກະລຸນາປ້ອນເບີໂທ"
            value={formData.phone}
            onChange={handleChange("phone")}
            onKeyDown={handleKeyDown("fax")}
            inputRef={phoneRef}
            error={errors.phone}
            hasError={!!errors.phone}
          />

          <FormInput
            label="ແຟັກ"
            theme="light"
            placeholder="ກະລຸນາປ້ອນແຟັກ"
            value={formData.fax}
            onChange={handleChange("fax")}
            onKeyDown={handleKeyDown("moreinfo")}
            inputRef={faxRef}
            error={errors.fax}
            hasError={!!errors.fax}
          />

          <FormInput
            label="ລາຍລະອຽດເພີ່ມເຕີມ"
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
              onClick={handleClose}
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
        title={branch ? "ຢືນຢັນການແກ້ໄຂ" : "ຢືນຢັນການເພີ່ມ"}
        message={
          branch
            ? `ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການແກ້ໄຂຂໍ້ມູນສາຂາ "${formData.branchname}"?`
            : `ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການເພີ່ມສາຂາ "${formData.branchname}"?`
        }
        confirmText={branch ? "ແກ້ໄຂ" : "ເພີ່ມ"}
        cancelText="ຍົກເລີກ"
        loadingMessage={branch ? "ກຳລັງແກ້ໄຂຂໍ້ມູນ..." : "ກຳລັງເພີ່ມສາຂາ..."}
        successMessage={branch ? "ແກ້ໄຂຂໍ້ມູນສຳເລັດແລ້ວ" : "ເພີ່ມສາຂາສຳເລັດແລ້ວ"}
        onConfirm={handleConfirmSubmit}
        onCancel={handleCancelSubmit}
        onClose={handleCloseSubmit}
      />
    </div>
  );
}
