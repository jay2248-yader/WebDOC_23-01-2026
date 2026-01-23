export default function LoadingDialog({ isOpen, message = "ກຳລັງດຳເນີນການ..." }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4 animate-slideUp">
        <div className="flex flex-col items-center gap-4">
          {/* Spinner */}
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
          </div>

          {/* Message */}
          <p className="text-gray-700 text-center">{message}</p>
        </div>
      </div>
    </div>
  );
}
