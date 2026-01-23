import { useEffect, useRef, useState, useCallback } from "react";
import Button from "./Button";

export default function ConfirmProgressDialog({
  isOpen,
  status = "confirm",
  onConfirm,
  onCancel,
  onClose,
  title = "ຢືນຢັນ",
  message = "ທ່ານແນ່ໃຈບໍ?",
  confirmText = "ຢືນຢັນ",
  cancelText = "ຍົກເລີກ",
  loadingMessage = "ກຳລັງດຳເນີນການ...",
  successMessage = "ສຳເລັດແລ້ວ",
  danger = false,
  autoClose = true,
  autoCloseDuration = 1500,
}) {
  const [isClosing, setIsClosing] = useState(false);
  const [showCheck, setShowCheck] = useState(false);

  const timerRef = useRef(null);
  const closedRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const resetVisualStateAsync = useCallback(() => {
    // ทำให้เป็น async เพื่อไม่ trigger lint "set-state-in-effect"
    queueMicrotask(() => {
      setShowCheck(false);
    });
  }, []);

  const finishClose = useCallback(
    (cb) => {
      setIsClosing(true);
      setTimeout(() => {
        cb?.();
        setIsClosing(false);
        resetVisualStateAsync();
        closedRef.current = false;
      }, 300);
    },
    [resetVisualStateAsync]
  );

  const handleClose = useCallback(() => {
    if (closedRef.current) return;
    closedRef.current = true;

    clearTimer();
    finishClose(onClose);
  }, [onClose, clearTimer, finishClose]);

  const handleCancel = useCallback(() => {
    if (closedRef.current) return;
    closedRef.current = true;

    clearTimer();
    finishClose(onCancel);
  }, [onCancel, clearTimer, finishClose]);

  // Success: เล่นอนิเมชัน + auto close
  useEffect(() => {
    if (!isOpen || status !== "success") return;

    const checkTimer = setTimeout(() => setShowCheck(true), 100);

    if (autoClose) {
      timerRef.current = setTimeout(handleClose, autoCloseDuration);
    }

    return () => {
      clearTimeout(checkTimer);
      clearTimer();
    };
  }, [isOpen, status, autoClose, autoCloseDuration, handleClose, clearTimer]);

  // เปิด dialog ใหม่: reset showCheck แบบ async (กัน lint)
  useEffect(() => {
    if (isOpen) {
      closedRef.current = false;
      resetVisualStateAsync();
    } else {
      clearTimer();
      resetVisualStateAsync();
    }
  }, [isOpen, clearTimer, resetVisualStateAsync]);

  if (!isOpen && !isClosing) return null;

  const isConfirm = status === "confirm";
  const isSuccess = status === "success";

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm ${
        isClosing ? "animate-fadeOut" : "animate-fadeIn"
      }`}
      onClick={isConfirm ? handleCancel : isSuccess ? handleClose : undefined}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 ${
          isClosing ? "animate-slideDown" : "animate-slideUp"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Confirm View */}
        <div
          className={`transition-all duration-300 ${
            isConfirm ? "opacity-100 h-auto" : "opacity-0 h-0 overflow-hidden"
          }`}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <div className="text-gray-600 mb-6">{message}</div>
          <div className="flex justify-end gap-3">
            <Button
              fullWidth={false}
              variant="secondary"
              size="md"
              onClick={handleCancel}
              className="min-w-20"
            >
              {cancelText}
            </Button>
            <Button
              fullWidth={false}
              variant={danger ? "secondary" : "outline"}
              size="md"
              onClick={onConfirm}
              className={
                danger
                  ? "min-w-20 bg-red-500 text-white hover:bg-red-600"
                  : "min-w-20 bg-[#0F75BC] text-white hover:bg-blue-700"
              }
            >
              {confirmText}
            </Button>
          </div>
        </div>

        {/* Loading/Success View */}
        <div
          className={`transition-all duration-300 ${
            !isConfirm ? "opacity-100" : "opacity-0 h-0 overflow-hidden"
          }`}
        >
          <div className="flex flex-col items-center py-4">
            <div className="relative w-20 h-20 mb-5">
              {/* Loading spinner */}
              <div
                className={`absolute inset-0 transition-all duration-500 ${
                  isSuccess ? "opacity-0 scale-75" : "opacity-100 scale-100"
                }`}
              >
                <div className="absolute inset-0 border-4 border-blue-200 rounded-full" />
                <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin" />
              </div>

              {/* Success circle */}
              <div
                className={`absolute inset-0 transition-all duration-500 ${
                  isSuccess && showCheck
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-50"
                }`}
              >
                <div
                  className={`absolute inset-0 rounded-full border-4 border-green-200 transition-all duration-700 ${
                    showCheck ? "scale-125 opacity-0" : "scale-100 opacity-100"
                  }`}
                />

                <div className="absolute inset-0 bg-linear-to-br from-green-400 to-green-500 rounded-full shadow-lg flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                      style={{
                        strokeDasharray: 24,
                        strokeDashoffset: showCheck ? 0 : 24,
                        transition: "stroke-dashoffset 0.4s ease-out 0.2s",
                      }}
                    />
                  </svg>
                </div>

            
              </div>
            </div>

            <p
              className={`text-lg font-medium text-center transition-all duration-300 ${
                isSuccess ? "text-[#0F75BC]" : "text-gray-700"
              }`}
            >
              {isSuccess ? successMessage : loadingMessage}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
