import { useEffect, useRef, useState, useCallback } from "react";


export default function ProgressDialog({
  isOpen,
  status = "loading",
  onClose,
  loadingMessage = "ກຳລັງດຳເນີນການ...",
  successMessage = "ສຳເລັດແລ້ວ",
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

  const handleClose = useCallback(() => {
    if (closedRef.current) return;
    closedRef.current = true;

    clearTimer();
    setIsClosing(true);

    setTimeout(() => {
      onClose?.();
      setIsClosing(false);
      setShowCheck(false);
      closedRef.current = false;
    }, 300);
  }, [onClose, clearTimer]);

  // Handle success animation and auto close
  useEffect(() => {
    if (isOpen && status === "success") {
      const checkTimer = setTimeout(() => setShowCheck(true), 100);

      let autoCloseTimer = null;
      if (autoClose) {
        autoCloseTimer = setTimeout(handleClose, autoCloseDuration);
        timerRef.current = autoCloseTimer;
      }

      return () => {
        clearTimeout(checkTimer);
        clearTimer();
      };
    }
  }, [isOpen, status, autoClose, autoCloseDuration, handleClose, clearTimer]);

  // Reset closedRef when dialog opens
  useEffect(() => {
    if (isOpen) {
      closedRef.current = false;
    }
  }, [isOpen]);

  // Cleanup timer when dialog closes
  useEffect(() => {
    if (!isOpen) {
      clearTimer();
    }
  }, [isOpen, clearTimer]);

  // Derive displayCheck - only show check when dialog is open and in success state
  const displayCheck = isOpen && status === "success" && showCheck;

  if (!isOpen && !isClosing) return null;

  const isSuccess = status === "success";

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
      onClick={isSuccess ? handleClose : undefined}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 transform transition-all duration-300 ${
          isClosing
            ? "scale-95 opacity-0 translate-y-4"
            : "scale-100 opacity-100 translate-y-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center">
          {/* Icon container */}
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
                isSuccess && displayCheck
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-50"
              }`}
            >
              {/* Outer ring animation */}
              <div
                className={`absolute inset-0 rounded-full border-4 border-green-200 transition-all duration-700 ${
                  displayCheck ? "scale-125 opacity-0" : "scale-100 opacity-100"
                }`}
              />

              {/* Main circle */}
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
                      strokeDashoffset: displayCheck ? 0 : 24,
                      transition: "stroke-dashoffset 0.4s ease-out 0.2s",
                    }}
                  />
                </svg>
              </div>

              {/* Sparkles */}
              <div
                className={`absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full transition-all duration-500 delay-300 ${
                  displayCheck ? "opacity-100 scale-100" : "opacity-0 scale-0"
                }`}
              />
              <div
                className={`absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-green-300 rounded-full transition-all duration-500 delay-400 ${
                  displayCheck ? "opacity-100 scale-100" : "opacity-0 scale-0"
                }`}
              />
              <div
                className={`absolute top-0 -left-2 w-2 h-2 bg-blue-400 rounded-full transition-all duration-500 delay-500 ${
                  displayCheck ? "opacity-100 scale-100" : "opacity-0 scale-0"
                }`}
              />
            </div>
          </div>

          {/* Message */}
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
  );
}
