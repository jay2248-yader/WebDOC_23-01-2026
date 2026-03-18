import mapRoundIcon from "../../assets/icon/map-round-svgrepo-com.svg";
import facebookIcon from "../../assets/icon/facebook-brands-solid-full.svg";
import footerCallIcon from "../../assets/icon/Footercall.svg";
import museumIcon from "../../assets/icon/MuseumExhibition.svg";

export default function PageFooter({ scale = 1 }) {
    return (
        <div className="doc-footer w-full"
            style={{ position: "absolute", bottom: 0, left: 0, right: 0, transformOrigin: "bottom center", transform: `scaleY(${scale})` }}>
            <div className="h-[120px] w-full relative">
                <div className="absolute bottom-0 left-0 w-full h-full z-0 pointer-events-none">
                    <svg width="100%" height="100%" viewBox="0 0 800 120"
                        preserveAspectRatio="none" className="overflow-visible">
                        <path d="M0 45 L500 45 C580 45 620 45 640 25 C660 5 660 0 680 0 L800 0"
                            stroke="#0F75BC" strokeWidth="8" fill="none" />
                        <path d="M0 60 L500 60 C580 60 620 60 645 40 C665 23 665 15 680 15 L800 15 L800 120 L0 120 Z"
                            fill="#0F75BC" />
                    </svg>
                </div>
                <div className="relative z-10 flex justify-between px-16 pt-2 pb-6 text-[#0F75BC]">
                    <div className="flex -ml-2 items-center gap-2">
                        <img src={museumIcon} alt="Website" width="58" height="58" />
                        <span className="text-sm font-semibold -ml-3">http://csccomplex-center.com</span>
                    </div>
                    <div className="flex items-center gap-2 mr-35">
                        <img src={facebookIcon} alt="Facebook" width="30" height="30" />
                        <span className="text-sm font-semibold">csc complex center Co.,Ltd</span>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 z-10 flex justify-between px-16 text-white pb-2 items-end">
                    <div className="flex items-end gap-3">
                        <div className="rounded-full">
                            <img src={mapRoundIcon} alt="Location" width="35" height="35"
                                className="brightness-0 invert translate-y-1" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[18px] leading-tight">ຊີເອັສຊີ ນະຄອນຫຼວງວຽງຈັນ ຈຳກັດຜູ້ດຽວ</span>
                            <span className="text-[16px] opacity-80 leading-tight">
                                ຕັ້ງຢູ່ ຖະໜົນ 450 ປີ, ບ້ານ ໂຊກໃຫຍ່, ເມືອງ ໄຊເສດຖາ, ນະຄອນຫຼວງວຽງຈັນ
                            </span>
                        </div>
                    </div>
                    <div className="flex items-end gap-2 -mr-5">
                        <img src={footerCallIcon} alt="Phone" width="30" height="30" />
                        <span className="text-sm font-bold">021 463 555-57</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
