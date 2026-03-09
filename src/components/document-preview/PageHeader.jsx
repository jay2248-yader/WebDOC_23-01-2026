import React from "react";
import cscLogo from "../../assets/Logo/CSC_LOGO_HD.png";

export default function PageHeader() {
    return (
        <div className="px-2 pt-5">
            <div className="relative w-full mb-2">
                <div className="absolute left-6 -top-5 z-10 w-23 h-23">
                    <img src={cscLogo} alt="CSC Logo" width="400" height="400"
                        className="w-full h-full object-contain object-center"
                        style={{ imageRendering: "auto" }} />
                </div>
                <div className="w-full text-center pt-2 pb-8 relative z-0">
                    <p className="text-sm font-bold text-[#0F75BC] leading-tight">
                        ສາທາລະນະລັດ ປະຊາທິປະໄຕ ປະຊາຊົນລາວ
                    </p>
                    <p className="text-sm font-bold text-[#0F75BC] mt-1">
                        ສັນຕິພາບ ເອກະລາດ ປະຊາທິປະໄຕ ເອກະພາບ ວັດທະນະຖາວອນ
                    </p>
                </div>
                <div className="absolute -bottom-2 left-0 w-full h-[40px]">
                    <svg width="100%" height="100%" viewBox="0 0 800 40"
                        preserveAspectRatio="none" className="overflow-visible">
                        <path d="M800 5 L170 5 L140 28 L0 28" stroke="#0F75BC" strokeWidth="3" fill="none" />
                        <path d="M800 9 L172 9 L142 32 L0 32" stroke="#0F75BC" strokeWidth="2" fill="none" />
                    </svg>
                </div>
            </div>
        </div>
    );
}
