import { useState } from "react";
import Button from "../common/Button";

export default function DocumentDetailModal({ isOpen, document, onClose }) {
    const [isClosing, setIsClosing] = useState(false);

    if (!isOpen && !isClosing) return null;
    if (!document) return null;

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
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
                className={`bg-white rounded-lg shadow-xl p-8 max-w-xl w-full mx-4 max-h-[90vh] overflow-y-auto ${
                    isClosing ? "animate-slideDown" : "animate-slideUp"
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-6 text-center border-b-2 border-[#0F75BC] pb-3">
                    ຟອມເອກະສານ
                </h3>

                <div className="space-y-5">
                    {/* ກຸ່ມເອກະສານ - Dropdown style */}
                    <div className="flex items-center gap-4">
                        <label className="w-32 shrink-0 text-sm font-medium text-gray-700">
                            ກຸ່ມເອກະສານ
                        </label>
                        <div className="flex-1 relative">
                            <div className="w-full rounded-lg border border-blue-300 bg-white px-4 py-2.5 text-sm text-gray-700 pr-10">
                                {document.doccategoryid ?? "-"}
                            </div>
                            <svg
                                className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>

                    {/* ຮຽນ */}
                    <div className="flex items-start gap-4">
                        <label className="w-32 shrink-0 text-sm font-medium text-gray-700 pt-2.5">
                            ຮຽນ
                        </label>
                        <div className="flex-1">
                            <div className="w-full rounded-lg border border-blue-300 bg-white px-4 py-2.5 text-sm text-gray-700 min-h-[44px] whitespace-pre-wrap">
                                {document.req_to ?? "-"}
                            </div>
                        </div>
                    </div>

                    {/* ເລື່ອງ */}
                    <div className="flex items-start gap-4">
                        <label className="w-32 shrink-0 text-sm font-medium text-gray-700 pt-2.5">
                            ເລື່ອງ
                        </label>
                        <div className="flex-1">
                            <div className="w-full rounded-lg border border-blue-300 bg-white px-4 py-2.5 text-sm text-gray-700 min-h-[44px] whitespace-pre-wrap">
                                {document.req_reason ?? "-"}
                            </div>
                        </div>
                    </div>

                    {/* ອ້າງຕາມ */}
                    <div className="flex items-start gap-4">
                        <label className="w-32 shrink-0 text-sm font-medium text-gray-700 pt-2.5">
                            ອີງຕາມ
                        </label>
                        <div className="flex-1">
                            <div className="w-full rounded-lg border border-blue-300 bg-white px-4 py-2.5 text-sm text-gray-700 min-h-[70px] whitespace-pre-wrap">
                                {document.req_shortboard ?? "-"}
                            </div>
                        </div>
                    </div>

                    {/* ເນື້ອໃນ */}
                    <div className="flex items-start gap-4">
                        <label className="w-32 shrink-0 text-sm font-medium text-gray-700 pt-2.5">
                            ເນື້ອໃນ
                        </label>
                        <div className="flex-1">
                            <div className="w-full rounded-lg border border-blue-300 bg-white px-4 py-2.5 text-sm text-gray-700 min-h-[120px] whitespace-pre-wrap">
                                {document.req_reason ?? "-"}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-between pt-8">
                    <Button
                        type="button"
                        fullWidth={false}
                        variant="outline"
                        size="md"
                        onClick={handleClose}
                    >
                        ຍົກເລີກ
                    </Button>
                    <Button
                        type="button"
                        fullWidth={false}
                        variant="outline"
                        size="md"
                        className="bg-red-500 text-white border-red-500 hover:bg-red-600"
                        onClick={handleClose}
                    >
                        ສ້າງຮວບນີ້
                    </Button>
                </div>
            </div>
        </div>
    );
}
