import { memo, useState, useCallback } from "react";
import { useAuthStore } from "../../store/authstore";
import { updatePwds } from "../../services/userservice";
import { toast } from "../../store/toastStore";

function ChangePasswordModal({ isOpen, onClose }) {
  const user = useAuthStore((state) => state.user);
  const [newPwd, setNewPwd] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = useCallback(() => {
    setNewPwd("");
    setIsSubmitting(false);
    onClose();
  }, [onClose]);

  const handleSubmit = useCallback(async () => {
    if (!newPwd || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await updatePwds({ usercode: user?.usercode, pwds: newPwd });
      toast.success("ປ່ຽນລະຫັດຜ່ານສຳເລັດ");
      handleClose();
    } catch (err) {
      toast.error(err?.message || "ປ່ຽນລະຫັດຜ່ານບໍ່ສຳເລັດ");
      setIsSubmitting(false);
    }
  }, [newPwd, isSubmitting, user, handleClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-linear-to-r from-[#0c5fa0] to-[#1a8fd1] px-6 py-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-white">ປ່ຽນລະຫັດຜ່ານ</h3>
            <p className="text-xs text-blue-100 mt-0.5">{user?.username} · {user?.usercode}</p>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">ລະຫັດຜ່ານໃໝ່</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                type="text"
                autoFocus
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="ກະລຸນາປ້ອນລະຫັດຜ່ານໃໝ່"
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              ຍົກເລີກ
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!newPwd || isSubmitting}
              className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl bg-[#0F75BC] text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  ກຳລັງບັນທຶກ...
                </>
              ) : "ຢືນຢັນ"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(ChangePasswordModal);
