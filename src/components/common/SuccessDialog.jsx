import { useEffect, useRef, useState, useCallback } from "react";

export default function SuccessDialog({
  isOpen,
  onClose,
  autoClose = true,
  autoCloseDuration = 2000,
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

  useEffect(() => {
    if (isOpen) {
      closedRef.current = false;
      const checkTimer = setTimeout(() => setShowCheck(true), 200);

      let autoCloseTimer = null;
      if (autoClose) {
        clearTimer();
        autoCloseTimer = setTimeout(handleClose, autoCloseDuration);
        timerRef.current = autoCloseTimer;
      }

      return () => {
        clearTimeout(checkTimer);
        clearTimer();
      };
    } else {
      clearTimer();
    }
  }, [isOpen, autoClose, autoCloseDuration, handleClose, clearTimer]);

  if (!isOpen && !isClosing) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl p-10 max-w-sm w-full mx-4 transform transition-all duration-300 ${
          isClosing
            ? "scale-95 opacity-0 translate-y-4"
            : "scale-100 opacity-100 translate-y-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center">
          {/* Animated success circle */}
          <div
            className={`relative w-24 h-24 mb-6 transition-all duration-500 ${
              showCheck ? "scale-100" : "scale-0"
            }`}
          >
            {/* Outer ring animation */}
            <div
              className={`absolute inset-0 rounded-full border-4 border-green-200 transition-all duration-700 ${
                showCheck ? "scale-110 opacity-0" : "scale-100 opacity-100"
              }`}
            />

            {/* Main circle */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-500 rounded-full shadow-lg flex items-center justify-center">
              {/* Checkmark */}
              <svg
                className={`w-12 h-12 text-white transition-all duration-300 delay-200 ${
                  showCheck ? "opacity-100 scale-100" : "opacity-0 scale-50"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                  className={showCheck ? "animate-draw-check" : ""}
                  style={{
                    strokeDasharray: 24,
                    strokeDashoffset: showCheck ? 0 : 24,
                    transition: "stroke-dashoffset 0.4s ease-out 0.3s",
                  }}
                />
              </svg>
            </div>

            {/* Sparkles */}
            <div
              className={`absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full transition-all duration-500 delay-300 ${
                showCheck ? "opacity-100 scale-100" : "opacity-0 scale-0"
              }`}
            />
            <div
              className={`absolute -bottom-1 -left-1 w-3 h-3 bg-green-300 rounded-full transition-all duration-500 delay-400 ${
                showCheck ? "opacity-100 scale-100" : "opacity-0 scale-0"
              }`}
            />
            <div
              className={`absolute top-0 -left-3 w-2 h-2 bg-blue-400 rounded-full transition-all duration-500 delay-500 ${
                showCheck ? "opacity-100 scale-100" : "opacity-0 scale-0"
              }`}
            />
          </div>

          {/* Text */}
          <h3
            className={`text-2xl font-semibold text-[#0F75BC] text-center transition-all duration-500 delay-300 ${
              showCheck
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            ສຳເລັດແລ້ວ
          </h3>
        </div>
      </div>
    </div>
  );
}
