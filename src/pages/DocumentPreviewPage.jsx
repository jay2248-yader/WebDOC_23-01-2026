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
        <div className="px-16 py-10 min-h-[297mm] flex flex-col justify-between relative">

          {/* ===== HEADER ===== */}
          <div>
            {/* Text - offset right for logo area */}
            <div className="pl-36 text-center">
              <p className="text-xl font-bold text-gray-800 tracking-wide">
                ສາທາລະນະລັດ ປະຊາທິປະໄຕ ປະຊາຊົນລາວ
              </p>
              <p className="text-sm text-gray-600 mt-1 tracking-wide">
                ສັນຕິພາບ ເອກະລາດ ປະຊາທິປະໄຕ ເອກະພາບ ວັດທະນະຖາວອນ
              </p>
            </div>

            {/* Decorative border lines with L-shape step + Logo */}
            <div className="relative mt-4" style={{ height: "85px" }}>
              {/* Horizontal thick line (top) */}
              <div
                className="absolute top-0 right-0 bg-gray-800"
                style={{ left: "130px", height: "3px" }}
              />
              {/* Horizontal thin line (below thick) */}
              <div
                className="absolute right-0 bg-gray-500"
                style={{ top: "7px", left: "118px", height: "1.5px" }}
              />

              {/* Vertical thick line (step down) */}
              <div
                className="absolute bg-gray-800"
                style={{ left: "130px", top: "0px", width: "3px", height: "55px" }}
              />
              {/* Vertical thin line (step down) */}
              <div
                className="absolute bg-gray-500"
                style={{ left: "118px", top: "7px", width: "1.5px", height: "52px" }}
              />

              {/* Bottom horizontal thick line (left portion) */}
              <div
                className="absolute left-0 bg-gray-800"
                style={{ top: "55px", width: "133px", height: "3px" }}
              />
              {/* Bottom horizontal thin line (left portion) */}
              <div
                className="absolute left-0 bg-gray-500"
                style={{ top: "59px", width: "119.5px", height: "1.5px" }}
              />

              {/* CSC Logo inside the step */}
              <img
                src={cscLogo}
                alt="CSC Logo"
                className="absolute object-contain"
                style={{ left: "10px", top: "6px", width: "100px", height: "48px" }}
              />
            </div>

            {/* Department + Doc number + Date */}
            <div className="flex items-start justify-between mt-4 text-sm text-[#0F75BC]">
              <p className="font-semibold">ຝ່າຍໃດໜຶ່ງ</p>
              <div className="text-right">
                <p>ເລກທີ:............/{document.req_no || "ອກ"}</p>
                <p>ບະຖວນຫຼວງວຽງຈັນ, ວັນທີ:{document.createdate || "......./......./......."}</p>
              </div>
            </div>

            {/* ===== TITLE ===== */}
            <h1 className="text-center text-xl font-bold text-[#0F75BC] mt-6 mb-6 underline underline-offset-4">
              ໃບສະເໜີ
            </h1>

            {/* ===== BODY ===== */}
            <div className="text-sm text-gray-800 space-y-3 leading-relaxed">
              {/* ຮຽນ */}
              <p>
                <span className="font-bold text-[#0F75BC]">ຮຽນ : </span>
                {document.req_to || "ທ່ານ ຮອງວານອົງການ"}
              </p>

              {/* ເລື່ອງ */}
              <p>
                <span className="font-bold text-[#0F75BC]">ເລື່ອງ : </span>
                {document.req_reason || "ຂໍສະເໜີໃຫ້ອະນຸມັດ"}
              </p>

              {/* ອີງຕາມ */}
              <div>
                <p className="font-bold text-[#0F75BC] mb-1">ອີງຕາມ :</p>
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
              <p className="font-bold text-[#0F75BC] mt-6">ສະນັ້ນເຫດ:</p>
              <p className="indent-8">
                ດັ່ງນັ້ນ, ຂ້ານະເຈົ້າຈຶ່ງຂໍສະເໜີມາຍັງທ່ານ ເພື່ອພິຈາລະນາອະນຸມັດຕາມທີ່ໄດ້ລາຍຄວາມຂ້າງເທິງນີ້ດ້ວຍ.
              </p>

              {/* Signature */}
              <div className="text-right mt-12">
                <p className="text-sm">ຮຽນມາດ້ວຍຄວາມນັບຖື,</p>
                <div className="mt-16">
                  <p className="font-bold text-[#0F75BC]">ຜູ້ສະເໜີ</p>
                </div>
              </div>
            </div>
          </div>

          {/* ===== FOOTER ===== */}
          <div className="border-t border-[#0F75BC] pt-3 mt-10 flex items-center justify-between text-xs text-[#0F75BC]">
            <div className="flex items-center gap-2">
              <img src={cscLogo} alt="CSC Logo" className="w-8 h-8 object-contain" />
              <div>
                <p className="font-semibold">http://cscccomplex-center.com</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <p>csc complex center Co.,Ltd</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
