import { memo } from "react";
import Button from "./Button";
import { WARN_SECS } from "../../hooks/useInactivityTimeout";

const RADIUS = 28;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function SessionTimeoutDialog({ isOpen, countdown, onContinue, onLogout }) {
  if (!isOpen) return null;

  const progress = Math.max(0, countdown / WARN_SECS);
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);
  const isDanger = countdown <= 10;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Countdown circle */}
        <div className="flex justify-center mb-5">
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 64 64">
              <circle
                cx="32" cy="32" r={RADIUS}
                fill="none" stroke="#E5E7EB" strokeWidth="4"
              />
              <circle
                cx="32" cy="32" r={RADIUS}
                fill="none"
                stroke={isDanger ? "#EF4444" : "#F59E0B"}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: "stroke-dashoffset 1s linear" }}
              />
            </svg>
            <span
              className={`absolute inset-0 flex items-center justify-center text-2xl font-bold ${
                isDanger ? "text-red-500" : "text-amber-500"
              }`}
            >
              {countdown}
            </span>
          </div>
        </div>

        {/* Text */}
        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
          ໝົດເວລາໃຊ້ງານ
        </h3>
        <p className="text-gray-500 text-center text-sm mb-6">
          ທ່ານໄດ້ຢຸດໃຊ້ງານເປັນເວລານານ<br />
          ລະບົບຈະ logout ອັດຕະໂນມັດໃນ{" "}
          <strong className={isDanger ? "text-red-500" : "text-amber-600"}>
            {countdown}
          </strong>{" "}
          ວິນາທີ
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            fullWidth
            variant="secondary"
            size="md"
            onClick={onLogout}
          >
            ອອກຈາກລະບົບ
          </Button>
          <Button
            fullWidth
            variant="outline"
            size="md"
            className="bg-[#0F75BC] text-white hover:bg-blue-700"
            onClick={onContinue}
          >
            ສືບຕໍ່ໃຊ້ງານ
          </Button>
        </div>
      </div>
    </div>
  );
}

export default memo(SessionTimeoutDialog);
