import { useRef, useLayoutEffect } from "react";

function SignatureBox({ label, name }) {
    return (
        <div className="flex flex-col items-center">
            <p className="font-bold text-black">{label}</p>
            <div className="h-3" /> {/* space for signature */}
            <p className="text-black min-h-5">{name || ""}</p>
        </div>
    );
}

export default function ClosingContent({
    remark, setRemark, storeKey, storeSetRemark, interactive,
    remarkOverride,   // ถ้ามี → ใช้แทน remark (สำหรับ chunk ที่ถูก split)
    showSignature = true, // false → ซ่อนส่วนลายเซ็น (ยังไม่ใช่ chunk สุดท้าย)
    showLabel = true, // false → ซ่อน "ໝາຍເຫດ:" label (overflow chunk)
    creatorName,      // ชื่อผู้สร้าง — แสดงใต้ "ຜູ້ສະເໜີ"
    signatureGroups = [], // docgroupname[] เรียงตาม levelapprove
}) {
    const displayRemark = remarkOverride !== undefined ? remarkOverride : remark;
    const taRef = useRef(null);
    const readonlyTaRef = useRef(null);

    // Auto-resize เมื่อ displayRemark เปลี่ยน (mount / remount / value เปลี่ยนแบบ programmatic)
    useLayoutEffect(() => {
        for (const ta of [taRef.current, readonlyTaRef.current]) {
            if (!ta) continue;
            ta.style.height = "auto";
            ta.style.height = ta.scrollHeight + "px";
        }
    }, [displayRemark]);

    return (
        <>
            {showLabel && (
                <div className={`flex items-start mt-6${!displayRemark ? " print:hidden" : ""}`}>
                    <span className="text-black whitespace-nowrap ml-10">ໝາຍເຫດ:</span>
                    {interactive && remarkOverride === undefined ? (
                        <textarea
                            ref={taRef}
                            value={displayRemark}
                            onChange={(e) => { setRemark(e.target.value); if (storeKey) storeSetRemark(storeKey, e.target.value); }}
                            placeholder="ພິມໝາຍເຫດ..." rows={1}
                            onInput={(e) => { e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; }}
                            className="flex-1 border-none outline-none bg-transparent text-gray-800 resize-none overflow-hidden break-all ml-1 print:p-0"
                        />
                    ) : (
                        <textarea
                            readOnly
                            ref={readonlyTaRef}
                            value={displayRemark}
                            rows={1}
                            className="flex-1 border-none outline-none bg-transparent text-gray-800 resize-none overflow-hidden break-all ml-1 print:p-0"
                        />
                    )}
                </div>
            )}
            {!showLabel && displayRemark && (
                <div className="flex items-start">
                    <textarea
                        readOnly
                        ref={readonlyTaRef}
                        value={displayRemark}
                        rows={1}
                        className="flex-1 ml-11 border-none outline-none bg-transparent text-gray-800 resize-none overflow-hidden break-all print:p-0"
                    />
                </div>
            )}
            {showSignature && (
                <>
                    <p className="indent-20">ດັ່ງນັ້ນ, ຂ້ານະເຈົ້າຈຶ່ງຂໍສະເໜີມາຍັງທ່ານ ເພື່ອພິຈາລະນາອະນຸມັດຕາມທີ່ເຫັນສົມຄວນດ້ວຍ.</p>
                    <p className="text-right text-sm mt-1">ຮຽນມາດ້ວຍຄວາມນັບຖື,</p>
                    {/* ── Signature rows ── */}
                    {(() => {
                        const groups = signatureGroups.length > 0
                            ? signatureGroups
                            : [{ label: "ຫົວໜ້າຝ່າຍໄອທີ", approverName: "" }, { label: "ຜູ້ຈັດການສາຂາ", approverName: "" }];
                        // แถว 1: groups[0], groups[1], ຜູ້ສະເໜີ
                        const firstRow = [
                            ...groups.slice(0, 2),
                            { label: "ຜູ້ສະເໜີ", approverName: creatorName },
                        ];
                        // แถวถัดไป: groups[2..] แถวละ 3
                        const rest = groups.slice(2);
                        const extraRows = [];
                        for (let i = 0; i < rest.length; i += 3) extraRows.push(rest.slice(i, i + 3));
                        return (
                            <>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8rem", marginTop: "1rem", fontSize: "0.875rem", textAlign: "center" }}>
                                    {firstRow.map((box, i) => (
                                        <SignatureBox key={i} label={box.label} name={box.approverName} />
                                    ))}
                                </div>
                                {extraRows.map((row, ri) => (
                                    <div key={ri} style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8rem", marginTop: "1rem", fontSize: "0.875rem", textAlign: "center" }}>
                                        {row.map((box, bi) => (
                                            <SignatureBox key={bi} label={box.label} name={box.approverName} />
                                        ))}
                                    </div>
                                ))}
                            </>
                        );
                    })()}
                </>
            )}
        </>
    );
}
