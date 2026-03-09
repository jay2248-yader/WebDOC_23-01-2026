import React from "react";

export default function DocumentDetailsSidebar({
    loadingDetails,
    documentDetails,
    selectedDetailId,
    onSelectDetail
}) {
    return (
        <div className="print:hidden flex flex-col gap-4 w-[380px] shrink-0">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-lg font-bold text-[#0F75BC] mb-4 border-b-2 border-[#0F75BC] pb-2">
                    ລາຍລະອຽດເອກະສານ
                </h2>
                {loadingDetails ? (
                    <p className="text-sm text-gray-400 text-center py-4">ກຳລັງໂຫລດ...</p>
                ) : documentDetails.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">ບໍ່ມີຂໍ້ມູນ</p>
                ) : (
                    <div className="space-y-3">
                        {documentDetails.map((detail, index) => (
                            <div key={detail.rddid || index} onClick={() => onSelectDetail(detail)}
                                className={`border rounded-lg p-3 text-sm cursor-pointer transition-all hover:bg-blue-50 ${selectedDetailId === detail.rddid ? "border-[#0F75BC] bg-blue-50" : "border-gray-200"}`}>
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-[#0F75BC]">{detail.req_title || "-"}</span>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${detail.statustype === "ADD" ? "bg-blue-100 text-blue-700" : detail.statustype === "APPROVED" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                                            {detail.statustype || "-"}
                                        </span>
                                        <svg className={`h-4 w-4 text-gray-400 transition-transform ${selectedDetailId === detail.rddid ? "rotate-180" : ""}`}
                                            fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                                {selectedDetailId === detail.rddid && (
                                    <div className="mt-3 pt-3 border-t border-gray-200 space-y-1.5 text-gray-600">
                                        {[
                                            ["ຫົວຂໍ້ຍ່ອຍ", detail.req_subtitle],
                                            ["ລາຍລະອຽດ", detail.req_moreinfo],
                                            ["ເລກທີ່", detail.requestdocumentmodel?.req_no],
                                            ["ພະແນກ", detail.requestdocumentmodel?.req_shortboard],
                                            ["ສ້າງໂດຍ", detail.createby],
                                            ["ວັນທີ່", detail.createdate],
                                        ].map(([label, value]) => (
                                            <div key={label} className="flex">
                                                <span className="text-gray-400 w-20 shrink-0">{label}</span>
                                                <span>: {value || "-"}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
