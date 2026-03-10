import React from "react";
import { useNavigate } from "react-router-dom";

export default function DocumentActionBar() {
    const navigate = useNavigate();
    return (
        <div className="print:hidden flex items-center justify-between px-6 py-4 bg-white shadow-sm mb-4">
            <button onClick={() => navigate("/documents")} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                ກັບຄືນ
            </button>
            <button onClick={() => window.print()} className="flex items-center gap-2 bg-[#0F75BC] text-white px-2 py-2 rounded-lg text-sm hover:bg-blue-700">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                ພິມເອກະສານ
            </button>
        </div>
    );
}
