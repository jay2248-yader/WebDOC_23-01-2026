import { useLocation, useNavigate } from "react-router-dom";
import cscLogo from "../assets/Logo/CSC_LOGO.svg";

export default function DocumentPreviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const document = location.state?.document || {};

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
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          ກັບຄືນ
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-[#0F75BC] text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          ພິມເອກະສານ
        </button>
      </div>

      {/* Document page */}
      <div className="max-w-[210mm] mx-auto bg-white shadow-lg print:shadow-none print:mx-0 print:max-w-none">
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
                   <p className="text-base font-bold text-[#0F75BC] tracking-wide leading-tight">
                    ສາທາລະນະລັດ ປະຊາທິປະໄຕ ປະຊາຊົນລາວ
                  </p>
                   <p className="text-base font-bold text-[#0F75BC] mt-1 tracking-wide ">
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
                      d="M800 11 L172 11 L142 34 L0 34"
                      stroke="#0F75BC"
                      strokeWidth="1.5"
                      fill="none"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Department + Doc number + Date + Body */}
            <div className="px-16">
              <div className="flex items-start justify-between mt-4 text-sm text-black">
                <p className=" ml-30 -mt-7">ຝ່າຍໃດໜຶ່ງ</p>
                <div className="text-right -mt-7">
                  <p>ເລກທີ:............/{document.req_no || "ອກ"}</p>
                  <p>ບະຖວນຫຼວງວຽງຈັນ, ວັນທີ:{document.createdate || "......./......./......."}</p>
                </div>
              </div>

              {/* ===== TITLE ===== */}
              <h1 className="text-center text-xl font-bold text-black mt-6 mb-6 underline underline-offset-4">
                ໃບສະເໜີ
              </h1>

              {/* ===== BODY ===== */}
              <div className="text-sm text-gray-800 space-y-3 leading-relaxed">
                {/* ຮຽນ */}
                <p>
                  <span className="font-bold text-black">ຮຽນ : </span>
                  {document.req_to || "ທ່ານ ຮອງວານອົງການ"}
                </p>

                {/* ເລື່ອງ */}
                <p>
                  <span className="font-bold text-black">ເລື່ອງ : </span>
                  {document.req_reason || "ຂໍສະເໜີໃຫ້ອະນຸມັດ"}
                </p>

                {/* ອີງຕາມ */}
                <div>
                  <p className="font-bold text-black mb-1">ອີງຕາມ :</p>
                  <ul className="list-disc ml-8 space-y-1">
                    <li>ອີງຕາມ : ການໃຊ້ງານໃບອ້ຽງອາຊຸກລືວີ ;</li>
                    <li>ອີງຕາມ : ໃບສະເໜີຈ່າຍສົບເສີດ ;</li>
                    <li>ອີງຕາມ : ໃບສະເໜີສົບເສີດ ;</li>
                  </ul>
                </div>

                {/* Body paragraph */}
                <p className="indent-8 mt-4">
                  ຂ້ານະເຈົ້າ ທ້າວ ຊະນິວົງ ເງີນວົນ ໃນນາມ ຕົວແທນຝ່າຍໃດໜຶ່ງ ຂອງບໍລິສັດເປັນຜູ້ກ ທ່ານ ຮອງອໍານວຍການຝ່າຍບໍລິຫານ
                  ຝ່າຍບໍລິສັດ - ການວີນ ເພື່ອຂໍສະເໜີໃຫ້ອະນຸມັດປ້ຽນກໍ່ ເພື່ອຈັດສົ່ງກາກາກຫ້ຈ ສະນ່ວ ໃຫ້ກໍ່ສຳຊຸ່ງແຫ່ງໃດໜຶ່ງທະພະ
                  ແນວທາງເຂດປະນວນວິດດ ແລະ ຕົວອທິພາບແດນກອງຈະລະຊາຕິທີ່ສະດາຍກຸນ ຈຳນວນ 3 ຊົມ ແລະ ການຈ້ອງບັນທີ ຈຳນວນ
                  1 ຊົມ
                </p>

                {/* Title + Table sections */}
                <div className="mt-6 space-y-4">
                  {/* Section 1 */}
                  <div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm">Title</span>
                      <span className="text-sm">➤</span>
                      <span className="text-sm text-gray-500">.................................................................</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm">Table</span>
                      <div className="flex-1 border-2 border-[#0F75BC] rounded h-10"></div>
                    </div>
                  </div>

                  {/* Section 2 */}
                  <div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm">Title</span>
                      <span className="text-sm">➤</span>
                      <span className="text-sm text-gray-500">.................................................................</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm">Table</span>
                      <div className="flex-1 border-2 border-[#0F75BC] rounded h-10"></div>
                    </div>
                  </div>
                </div>

                {/* ສະນັ້ນ */}
                <p className="font-bold text-black mt-6 ml-10">ສະນັ້ນເຫດ:</p>
                <p className="indent-8 text-center">
                  ດັ່ງນັ້ນ, ຂ້ານະເຈົ້າຈຶ່ງຂໍສະເໜີມາຍັງທ່ານ ເພື່ອພິຈາລະນາອະນຸມັດຕາມທີ່ໄດ້ລາຍຄວາມຂ້າງເທິງນີ້ດ້ວຍ.
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  <span className="text-sm font-semibold">http://csccomplex-center.com</span>
                </div>

                {/* Facebook */}
                <div className="flex items-center gap-2 mr-35">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="#0F75BC"
                    stroke="none"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span className="text-sm font-semibold">csc complex center Co.,Ltd</span>
                </div>
              </div>

              {/* Address / Contact Info Row 2 (Blue Area) */}
              <div className="relative z-10 flex justify-between px-16 text-white pt-5.5 items-center">
                {/* Address */}
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-white rounded-full p-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="#0F75BC"
                      stroke="#0F75BC"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold leading-tight">ຊີເອັສຊີ ນະຄອນຫຼວງວຽງຈັນ ຈຳກັດຜູ້ດຽວ</span>
                    <span className="text-[10px] opacity-90 leading-tight mt-0.5">
                      ຕັ້ງຢູ່ ຖະໜົນ 450 ປີ, ບ້ານ ໂຊກໃຫຍ່, ເມືອງ ໄຊເສດຖາ, ນະຄອນຫຼວງວຽງຈັນ
                    </span>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-2">
                  <div className="bg-white rounded-full p-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="#0F75BC"
                      stroke="#0F75BC"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </div>
                  <span className="text-sm font-bold">021 463 555-57</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
}
