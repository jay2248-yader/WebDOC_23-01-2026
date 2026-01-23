import { useState } from "react";
import Button from "./Button";

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "ຢືນຢັນ",
  cancelText = "ຍົກເລີກ",
  onConfirm,
  onCancel,
  confirmVariant = "primary",
  cancelVariant = "secondary",
  danger = false,
}) {
  const [isClosing, setIsClosing] = useState(false);

  if (!isOpen && !isClosing) return null;

  const handleConfirm = () => {
    setIsClosing(true);
    setTimeout(() => {
      onConfirm();
      setIsClosing(false);
    }, 300);
  };

  const handleCancel = () => {
    setIsClosing(true);
    setTimeout(() => {
      onCancel();
      setIsClosing(false);
    }, 300);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm ${
        isClosing ? "animate-fadeOut" : "animate-fadeIn"
      }`}
      onClick={handleCancel}
    >
      <div
        className={`bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 ${
          isClosing ? "animate-slideDown" : "animate-slideUp"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <div className="text-gray-600 mb-6">{message}</div>
        <div className="flex justify-end gap-3">
          <Button
            fullWidth={false}
            variant={cancelVariant}
            size="md"
            onClick={handleCancel}
            className="min-w-20"
          >
            {cancelText}
          </Button>
          <Button
            fullWidth={false}
            variant={danger ? "secondary" : confirmVariant}
            size="md"
            onClick={handleConfirm}
            className={
              danger
                ? "min-w-20 bg-red-500 text-white hover:bg-red-600"
                : "min-w-20"
            }
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
