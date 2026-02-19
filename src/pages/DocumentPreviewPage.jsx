import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import cscLogo from "../assets/Logo/CSC_LOGO.svg";
import mapRoundIcon from "../assets/icon/map-round-svgrepo-com.svg";
import facebookIcon from "../assets/icon/facebook-brands-solid-full.svg";
import footerCallIcon from "../assets/icon/Footercall.svg";
import museumIcon from "../assets/icon/MuseumExhibition.svg";
import TitleTableModal from "../components/documents/TitleTableModal";

export default function DocumentPreviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const document = location.state?.document || {};
  const [showTitleTableModal, setShowTitleTableModal] = useState(false);
  const [titleTableSections, setTitleTableSections] = useState([]);

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    navigate("/documents");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Action buttons - hidden when printing */}
      <div className="print:hidden flex items-center justify-between px-6 py-4 bg-white shadow-sm mb-4">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          ກັບຄືນ
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-[#0F75BC] text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
            />
          </svg>
          ພິມເອກະສານ
        </button>
      </div>

      {/* Document page */}
      <div
        className="max-w-[210mm] mx-auto bg-white shadow-lg print:shadow-none print:mx-0 print:max-w-none"
        style={{ fontFamily: "'TimesDoc', 'Phetsarath', sans-serif" }}
      >
        <div className="pt-10 min-h-[297mm] flex flex-col justify-between relative">
          {/* ===== HEADER ===== */}
          <div className="w-full">
            <div className="px-5">
              <div className="relative w-full mb-2">
                {/* Logo */}
                <div className="absolute left-5 -top-5 z-10">
                  <img
                    src={cscLogo}
                    alt="CSC Logo"
                    className="w-[100px] h-[100px] object-contain object-center"
                  />
                </div>

                {/* Title Text */}
                <div className="w-full text-center pt-2 pb-8 relative z-0">
                  <p className="text-base font-bold text-[#0F75BC]  leading-tight">
                    ສາທາລະນະລັດ ປະຊາທິປະໄຕ ປະຊາຊົນລາວ
                  </p>
                  <p className="text-base font-bold text-[#0F75BC] mt-1  ">
                    ສັນຕິພາບ ເອກະລາດ ປະຊາທິປະໄຕ ເອກະພາບ ວັດທະນະຖາວອນ
                  </p>
                </div>

                {/* SVG Lines */}
                <div className="absolute -bottom-2 left-0 w-full h-[40px]">
                  <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 800 40"
                    preserveAspectRatio="none"
                    className="overflow-visible"
                  >
                    {/* Thick Line */}
                    <path
                      d="M800 5 L170 5 L140 28 L0 28"
                      stroke="#0F75BC"
                      strokeWidth="3"
                      fill="none"
                    />
                    {/* Thin Line */}
                    <path
                      d="M800 9 L172 9 L142 32 L0 32"
                      stroke="#0F75BC"
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Department + Doc number + Date + Body */}
            <div className="px-30">
              <div className="flex items-start justify-between mt-4 text-sm text-black">
                <p className=" ml-16 -mt-7">ຝ່າຍໃດໜຶ່ງ</p>
                <div className="text-right -mt-7">
                  <p>ເລກທີ:............/{document.req_no || "ອກ"}</p>
                  <p>
                    ບະຖວນຫຼວງວຽງຈັນ, ວັນທີ:
                    {document.createdate || "......./......./......."}
                  </p>
                </div>
              </div>

              {/* ===== TITLE ===== */}
              <h1 className="text-center text-xl font-bold text-black mt-6 mb-2">
                ໃບສະເໜີ
              </h1>

              {/* ===== BODY ===== */}
              <div className="text-sm text-gray-800 space-y-0.5 leading-relaxed">
                {/* ຮຽນ */}
                <div className="flex">
                  <span className="font-bold text-black whitespace-nowrap">
                    ຮຽນ :&nbsp;
                  </span>
                  {document.req_to ||
                    "ທ່ານ ຮອງອຳນວການຊີ້ນຳຝ່າຍບັນຊີ ການເງີນ ຂອງບໍລິສັດ ຊີເອັດຊີ ສຳນັກງານໃຫຍ່ທີ່ນັບຖື ກດດເືຫຶສັ່ເຶສັາຫຶເ່ຫຶືກ່ເຶືຫວ່ກຶເ;"}
                </div>

                {/* ເລື່ອງ */}
                <div className="flex">
                  <span className="font-bold text-black whitespace-nowrap">
                    ເລື່ອງ :&nbsp;
                  </span>
                  <span>
                    {document.req_reason ||
                      "ຂໍສະເໜີພິຈາລະນາອະນຸມັດໃນເລື່ອງ ຈັດຊື້ກາຈັດຊື້ ສະປີ່ ຈຳນວນ 3 ອັນ ແລະ ກາຈ້ອນທີຈຳນວນ 3 ອັນ ຂໍສະເໜີພິຈາລະນາອະນຸມັດໃນເລື່ອງ ຈັດຊື້ກາຈັດຊື້ ສະປີ່ ຈຳນວນ 3 ອັນ ແລະ ກາຈ້ອນທີຈຳນວນ 3 ອັນ;"}
                  </span>
                </div>

                {/* ອີງຕາມ */}
                <div>
                  <ul className="list-none space-y-1">
                    {(
                      document.references || [
                        "ການໃຊ້ງານໃບອ້ຽງອາຊຸກລືວີ",
                        "ໃບສະເໜີຈ່າຍສົບເສີດ",
                        "ໃບສະເໜີສົບເສີດ",
                      ]
                    ).map((item, index) => (
                      <li
                        key={index}
                        className="relative before:content-['-'] before:absolute before:left-[-16px]"
                      >
                        ອີງຕາມ : {item} ;
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Body paragraph */}
                <p className="indent-8 ">
                  ຂ້ານະເຈົ້າ ທ້າວ ຊະນິວົງ ເງີນວົນ ໃນນາມ ຕົວແທນຝ່າຍໃດໜຶ່ງ
                  ຂອງບໍລິສັດເປັນຜູ້ກ ທ່ານ ຮອງອໍານວຍການຝ່າຍບໍລິຫານ ຝ່າຍບໍລິສັດ -
                  ການວີນ ເພື່ອຂໍສະເໜີໃຫ້ອະນຸມັດປ້ຽນກໍ່ ເພື່ອຈັດສົ່ງກາກາກຫ້ຈ
                  ສະນ່ວ ໃຫ້ກໍ່ສຳຊຸ່ງແຫ່ງໃດໜຶ່ງທະພະ ແນວທາງເຂດປະນວນວິດດ ແລະ
                  ຕົວອທິພາບແດນກອງຈະລະຊາຕິທີ່ສະດາຍກຸນ ຈຳນວນ 3 ຊົມ ແລະ
                  ການຈ້ອງບັນທີ ຈຳນວນ 1 ຊົມ
                </p>

                {/* Title + Table sections */}
                <div
                  className=" space-y-6 cursor-pointer hover:bg-gray-50 rounded-lg p-2 -ml-2 transition-colors print:cursor-default print:hover:bg-transparent print:p-0 print:ml-0"
                  onClick={() => setShowTitleTableModal(true)}
                >
                  {titleTableSections.length > 0 ? (
                    titleTableSections.map((section, si) => (
                      <div key={si}>
                        {section.title && (
                          <p className="text-sm font-bold mb-1">
                            <span className="mr-2">➤</span>
                            {section.title}
                          </p>
                        )}
                        <table className="w-full border-collapse border border-black text-sm">
                          <tbody>
                            {(section.cells || []).map((row, ri) => (
                              <tr key={ri}>
                                {row.map((cell, ci) => {
                                  if (!cell) return null;
                                  return (
                                    <td
                                      key={ci}
                                      colSpan={cell.colspan || 1}
                                      rowSpan={cell.rowspan || 1}
                                      className="border border-black px-2 py-1 text-center whitespace-pre-wrap"
                                      style={{
                                        backgroundColor: cell.bg || undefined,
                                        color: cell.color || undefined,
                                      }}
                                    >
                                      {cell.value ?? cell}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                            {section.summaryRow && (
                              <tr className="font-bold">
                                <td
                                  colSpan={section.summaryRow.labelColspan}
                                  className="border border-black px-2 py-1 text-center"
                                >
                                  {section.summaryRow.label}
                                </td>
                                {section.summaryRow.values.map((val, vi) => (
                                  <td key={vi} className="border border-black px-2 py-1 text-center">
                                    {val}
                                  </td>
                                ))}
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-400 border-2 border-dashed border-gray-300 rounded-lg py-6 text-sm print:hidden">
                      ກົດເພື່ອເພີ່ມ Title + Table
                    </div>
                  )}
                </div>

                {/* ສະນັ້ນ */}
                <div className="flex items-baseline mt-6">
                  <span className="text-black whitespace-nowrap ml-10">
                    ໝາຍເຫດ:
                  </span>
                  <span className="flex-1 border-b border-dotted border-black ml-1"></span>
                </div>
                <p className="indent-20 ">
                  ດັ່ງນັ້ນ, ຂ້ານະເຈົ້າຈຶ່ງຂໍສະເໜີມາຍັງທ່ານ
                  ເພື່ອພິຈາລະນາອະນຸມັດຕາມທີ່ເຫັນສົມຄວນດ້ວຍ.
                </p>

                {/* Signature */}
                <div className="text-right ">
                  <p className="text-sm">ຮຽນມາດ້ວຍຄວາມນັບຖື,</p>
                  <div className="mt-2">
                    <p className="font-bold text-black">ຜູ້ສະເໜີ</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ===== FOOTER ===== */}
          <div className="w-full relative mt-10">
            <div className="h-[120px] w-full relative">
              {/* SVG Background */}
              <div className="absolute bottom-0 left-0 w-full h-full z-0 pointer-events-none">
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 800 120"
                  preserveAspectRatio="none"
                  className="overflow-visible"
                >
                  {/* Top Thick Blue Line */}
                  <path
                    d="
    M0 45
    L500 45
    C580 45 620 45 640 25
    C660 5 660 0 680 0
    L800 0
  "
                    stroke="#0F75BC"
                    strokeWidth="8"
                    fill="none"
                  />
                  {/* Bottom Main Blue Shape */}
                  <path
                    d="
  M0 60
  L500 60
  C580 60 620 60 645 40
  C665 23 665 15 680 15
  L800 15
  L800 120
  L0 120
  Z
"
                    fill="#0F75BC"
                  />
                </svg>
              </div>

              {/* Logo / Contact Info Row 1 (White Area) */}
              <div className="relative z-10 flex justify-between px-16 pt-2 pb-6 text-[#0F75BC]">
                {/* Website */}
                <div className="flex -ml-2 items-center gap-2">
                  <img src={museumIcon} alt="Website" width="58" height="58" />
                  <span className="text-sm font-semibold -ml-3">
                    http://csccomplex-center.com
                  </span>
                </div>

                {/* Facebook */}
                <div className="flex items-center gap-2 mr-35">
                  <img
                    src={facebookIcon}
                    alt="Facebook"
                    width="30"
                    height="30"
                  />
                  <span className="text-sm font-semibold">
                    csc complex center Co.,Ltd
                  </span>
                </div>
              </div>

              {/* Address / Contact Info Row 2 (Blue Area) */}
              <div className="absolute bottom-0 left-0 right-0 z-10 flex justify-between px-16 text-white pb-2 items-end">
                {/* Address */}
                <div className="flex  items-end gap-3 ">
                  <div className="rounded-full  ">
                    <img
                      src={mapRoundIcon}
                      alt="Location"
                      width="35"
                      height="35"
                      className="brightness-0 invert translate-y-1"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[18px]  leading-tight">
                      ຊີເອັສຊີ ນະຄອນຫຼວງວຽງຈັນ ຈຳກັດຜູ້ດຽວ
                    </span>
                    <span className="text-[16px] opacity-80 leading-tight">
                      ຕັ້ງຢູ່ ຖະໜົນ 450 ປີ, ບ້ານ ໂຊກໃຫຍ່, ເມືອງ ໄຊເສດຖາ,
                      ນະຄອນຫຼວງວຽງຈັນ
                    </span>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-end gap-2 -mr-5">
                  <img
                    src={footerCallIcon}
                    alt="Phone"
                    width="30"
                    height="30"
                  />
                  <span className="text-sm font-bold">021 463 555-57</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TitleTableModal
        isOpen={showTitleTableModal}
        onClose={() => setShowTitleTableModal(false)}
        onSave={(sections) => setTitleTableSections(sections)}
        initialSections={titleTableSections}
      />
    </div>
  );
}
