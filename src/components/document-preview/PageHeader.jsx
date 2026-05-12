import cscLogo from "../../assets/Logo/CSC_LOGO_HD.webp";
import geminiSvg from "../../assets/icon/PageHeader.svg";

export default function PageHeader({ scale = 1 }) {
    return (
        <div style={{ transformOrigin: "top center", transform: `scaleY(${scale})`, paddingLeft: 8, paddingRight: 8, paddingTop: 5 }}>
            <div className="relative w-full" style={{ marginBottom: 8 }}>
                {/* Logo */}
                <div className="absolute z-10 mt-1"
                    style={{ left: 28, top: -10, width: 92, height: 92 }}>
                    <img src={cscLogo} alt="CSC Logo" width="92" height="92"
                        decoding="async"
                        loading="lazy"
                        className="w-full h-full object-contain object-center"
                        style={{ imageRendering: "auto" }} />
                </div>

                {/* Text */}
                <div className="w-full text-center relative z-0"
                    style={{ paddingTop: 8, paddingBottom: 32 }}>
                    <p style={{ fontSize: 14, fontWeight: "bold", color: "#0F75BC", lineHeight: 1.2, paddingBottom: 4 }}>
                        ສາທາລະນະລັດ ປະຊາທິປະໄຕ ປະຊາຊົນລາວ
                    </p>
                    <p style={{ fontSize: 14, fontWeight: "bold", color: "#0F75BC", marginTop: 4, lineHeight: 1.2, paddingBottom: 6 }}>
                        ສັນຕິພາບ ເອກະລາດ ປະຊາທິປະໄຕ ເອກະພາບ ວັດທະນະຖາວອນ
                    </p>
                </div>

                {/* Decorative lines */}
                <div className="doc-header-deco absolute left-0 w-full" style={{ bottom: -8, height: 40 }}>
                    <img src={geminiSvg} alt="" style={{ width: "100%", height: "100%", overflow: "visible" }} />
                </div>
            </div>
        </div>
    );
}
