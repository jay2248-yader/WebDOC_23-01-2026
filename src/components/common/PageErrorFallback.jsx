import { useNavigate } from "react-router-dom";

/**
 * PageErrorFallback — shown by ErrorBoundary when a page crashes.
 * Provides retry (reset boundary) and go-home options.
 */
export default function PageErrorFallback({ error, reset }) {
  const navigate = useNavigate();

  const handleGoHome = () => {
    reset();
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center animate-fadeIn">

        {/* Icon */}
        <div className="flex justify-center mb-5">
          <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          ເກີດຂໍ້ຜິດພາດ
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          ຫນ້ານີ້ບໍ່ສາມາດໂຫຼດໄດ້ໃນຂະນະນີ້
        </p>

        {/* Error detail */}
        {error?.message && (
          <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-2 mb-6 text-left">
            <p className="text-xs text-red-500 font-mono break-all leading-relaxed">
              {error.message}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-5 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            ລອງໃໝ່
          </button>
          <button
            onClick={handleGoHome}
            className="px-5 py-2 rounded-lg bg-[#0F75BC] text-white text-sm hover:bg-blue-700 transition-colors"
          >
            ກັບໜ້າຫຼັກ
          </button>
        </div>
      </div>
    </div>
  );
}
