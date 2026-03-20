import { memo, useState, useCallback } from "react";
import { useAuthStore } from "../../store/authstore";
import { updatePwds } from "../../services/userservice";
import FormInput from "./FormInput";
import Button from "./Button";
import ConfirmProgressDialog from "./ConfirmProgressDialog";

function ChangePasswordModal({ isOpen, onClose }) {
  const user = useAuthStore((state) => state.user);

  const [form, setForm] = useState({ newPwd: "", confirmPwd: "" });
  const [errors, setErrors] = useState({});
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [dialog, setDialog] = useState({ open: false, status: "confirm" });

  const validate = useCallback(() => {
    const e = {};
    if (!form.newPwd) e.newPwd = "ກະລຸນາປ້ອນລະຫັດຜ່ານໃໝ່";
    else if (form.newPwd.length < 6) e.newPwd = "ລະຫັດຜ່ານຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ";
    if (!form.confirmPwd) e.confirmPwd = "ກະລຸນາຢືນຢັນລະຫັດຜ່ານ";
    else if (form.newPwd !== form.confirmPwd) e.confirmPwd = "ລະຫັດຜ່ານບໍ່ຕົງກັນ";
    return e;
  }, [form]);

  const handleSubmit = useCallback(() => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setDialog({ open: true, status: "confirm" });
  }, [validate]);

  const handleConfirm = useCallback(async () => {
    setDialog({ open: true, status: "loading" });
    try {
      await updatePwds({ usercode: user?.usercode, pwds: form.newPwd });
      setDialog({ open: true, status: "success" });
    } catch {
      setDialog({ open: false, status: "confirm" });
    }
  }, [user, form.newPwd]);

  const handleClose = useCallback(() => {
    setForm({ newPwd: "", confirmPwd: "" });
    setErrors({});
    setShowNew(false);
    setShowConfirm(false);
    setDialog({ open: false, status: "confirm" });
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4 animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-[#0F75BC]" />
            <h2 className="text-lg font-bold text-gray-800">ປ່ຽນລະຫັດຜ່ານ</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* User info */}
        <div className="mb-4 px-3 py-2 bg-blue-50 rounded-xl text-sm text-gray-600">
          ຜູ້ໃຊ້: <span className="font-semibold text-[#0F75BC]">{user?.username}</span>{" "}({user?.usercode})
        </div>

        {/* Fields */}
        <div className="space-y-4">
          <FormInput
            label="ລະຫັດຜ່ານໃໝ່"
            type="password"
            placeholder="ປ້ອນລະຫັດຜ່ານໃໝ່"
            value={form.newPwd}
            onChange={(e) => setForm((f) => ({ ...f, newPwd: e.target.value }))}
            showPassword={showNew}
            onTogglePassword={() => setShowNew((v) => !v)}
            hasError={!!errors.newPwd}
            error={errors.newPwd}
            theme="light"
            rounded="xl"
            size="md"
            maxLength={50}
          />
          <FormInput
            label="ຢືນຢັນລະຫັດຜ່ານໃໝ່"
            type="password"
            placeholder="ປ້ອນລະຫັດຜ່ານໃໝ່ອີກຄັ້ງ"
            value={form.confirmPwd}
            onChange={(e) => setForm((f) => ({ ...f, confirmPwd: e.target.value }))}
            showPassword={showConfirm}
            onTogglePassword={() => setShowConfirm((v) => !v)}
            hasError={!!errors.confirmPwd}
            error={errors.confirmPwd}
            theme="light"
            rounded="xl"
            size="md"
            maxLength={50}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <Button variant="secondary" size="md" onClick={handleClose}>
            ຍົກເລີກ
          </Button>
          <Button
            size="md"
            variant="outline"
            onClick={handleSubmit}
            className="bg-[#0F75BC] text-white hover:bg-blue-700"
          >
            ປ່ຽນລະຫັດຜ່ານ
          </Button>
        </div>
      </div>

      <ConfirmProgressDialog
        isOpen={dialog.open}
        status={dialog.status}
        title="ຢືນຢັນການປ່ຽນລະຫັດຜ່ານ"
        message="ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການປ່ຽນລະຫັດຜ່ານ?"
        confirmText="ປ່ຽນ"
        cancelText="ຍົກເລີກ"
        loadingMessage="ກຳລັງປ່ຽນລະຫັດຜ່ານ..."
        successMessage="ປ່ຽນລະຫັດຜ່ານສຳເລັດແລ້ວ"
        onConfirm={handleConfirm}
        onCancel={() => setDialog({ open: false, status: "confirm" })}
        onClose={handleClose}
      />
    </div>
  );
}

export default memo(ChangePasswordModal);
