import { useRef, useLayoutEffect } from "react";

export default function ClosingContent({
    remark, setRemark, selectedDetailId, storeSetRemark, interactive,
    remarkOverride,   // ถ้ามี → ใช้แทน remark (สำหรับ chunk ที่ถูก split)
    showSignature = true, // false → ซ่อนส่วนลายเซ็น (ยังไม่ใช่ chunk สุดท้าย)
    showLabel = true, // false → ซ่อน "ໝາຍເຫດ:" label (overflow chunk)
}) {
    const displayRemark = remarkOverride !== undefined ? remarkOverride : remark;
    const taRef = useRef(null);

    // Auto-resize เมื่อ displayRemark เปลี่ยน (mount / remount / value เปลี่ยนแบบ programmatic)
    useLayoutEffect(() => {
        const ta = taRef.current;
        if (!ta) return;
        ta.style.height = "auto";
        ta.style.height = ta.scrollHeight + "px";
    }, [displayRemark]);

    return (
        <>
            {showLabel && (
                <div className="flex items-start mt-6">
                    <span className="text-black whitespace-nowrap ml-10">ໝາຍເຫດ:</span>
                    {interactive && remarkOverride === undefined ? (
                        <textarea
                            ref={taRef}
                            value={displayRemark}
                            onChange={(e) => { setRemark(e.target.value); if (selectedDetailId) storeSetRemark(selectedDetailId, e.target.value); }}
                            placeholder="ພິມໝາຍເຫດ..." rows={1}
                            onInput={(e) => { e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; }}
                            className="flex-1 border-none outline-none bg-transparent text-gray-800 resize-none overflow-hidden break-all ml-1 print:p-0"
                        />
                    ) : (
                        <span className="flex-1 ml-1 text-gray-800 whitespace-pre-wrap break-all">{displayRemark}</span>
                    )}
                </div>
            )}
            {!showLabel && displayRemark && (
                <div className="flex items-start">
                    <span className="flex-1 ml-11 text-gray-800 whitespace-pre-wrap break-all">{displayRemark}</span>
                </div>
            )}
            {showSignature && (
                <>
                    <p className="indent-20">ດັ່ງນັ້ນ, ຂ້ານະເຈົ້າຈຶ່ງຂໍສະເໜີມາຍັງທ່ານ ເພື່ອພິຈາລະນາອະນຸມັດຕາມທີ່ເຫັນສົມຄວນດ້ວຍ.</p>
                    <div className="text-right">
                        <p className="text-sm">ຮຽນມາດ້ວຍຄວາມນັບຖື,</p>
                        <div className="mt-2"><p className="font-bold text-black">ຜູ້ສະເໜີ</p></div>
                    </div>
                </>
            )}
        </>
    );
}
