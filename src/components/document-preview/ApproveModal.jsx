import useFormModal from "../../hooks/useFormModal";
import FormModalShell from "../common/FormModalShell";
import { approveRequestDocument } from "../../services/approvaldocumentservice";

export default function ApproveModal({ isOpen, onClose, onApproved, docData = {}, levelapprove = null }) {
  const {
    formData,
    errors,
    isClosing,
    submitDialog,
    shouldRender,
    handleChange,
    handleSubmit,
    handleConfirmSubmit,
    handleCancelSubmit,
    handleCloseSubmit,
    handleClose,
  } = useFormModal({
    isOpen,
    onClose,
    onSubmit: async (payload) => {
      await approveRequestDocument(payload);
      onApproved?.();
    },
    initialData: {
      reqlevelapprove: levelapprove ?? "",
      descriptions: "",
    },
    validate: (data) => {
      const e = {};
      if (!data.descriptions) e.descriptions = "ກະລຸນາປ້ອນຄຳອະທິບາຍ";
      return e;
    },
    transformData: (data) => {
      const lv = parseInt(data.reqlevelapprove);
      return {
        rqdid: docData.rqdid,
        reqno: docData.req_no,
        doccategoryid: docData.doccategoryid,
        reqlevelapprove: lv,
        descriptions: !isNaN(lv) ? `lv${lv} ${data.descriptions}` : data.descriptions,
      };
    },
  });

  return (
    <FormModalShell
      shouldRender={shouldRender}
      isClosing={isClosing}
      isEditing={false}
      entityName="ການອະນຸມັດ"
      displayName={docData.req_no || ""}
      submitDialog={submitDialog}
      onClose={handleClose}
      onConfirm={handleConfirmSubmit}
      onCancelSubmit={handleCancelSubmit}
      onCloseSubmit={handleCloseSubmit}
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center border-b border-blue-400 pb-2">
        ອະນຸມັດເອກະສານ
      </h3>

      {/* doccategoryid highlight */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-xs text-blue-500 font-medium uppercase tracking-wide">ປະເພດເອກະສານ (doccategoryid)</p>
          <p className="text-base font-bold text-blue-800 truncate">{docData.doccategoryid ?? "-"}</p>
        </div>
      </div>

      {/* Pre-filled info */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4 space-y-1 text-sm">
        <InfoRow label="ເລກທີ" value={docData.req_no} />
        <InfoRow label="rqdid" value={docData.rqdid} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* reqlevelapprove — auto-filled, read-only */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ລະດັບການອະນຸມັດ
          </label>
          <div className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-700">
            {formData.reqlevelapprove !== "" && formData.reqlevelapprove != null
              ? `Level ${formData.reqlevelapprove}`
              : "-"}
          </div>
        </div>

        {/* descriptions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ຄຳອະທິບາຍ <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.descriptions}
            onChange={handleChange("descriptions")}
            placeholder="ເຊັ່ນ: Approved by manager..."
            rows={3}
            className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 resize-none ${
              errors.descriptions ? "border-red-400" : "border-gray-300"
            }`}
          />
          {errors.descriptions && (
            <p className="text-red-500 text-xs mt-1">{errors.descriptions}</p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            ຍົກເລີກ
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            ອະນຸມັດ
          </button>
        </div>
      </form>
    </FormModalShell>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex gap-2">
      <span className="text-gray-500 w-16 shrink-0">{label}</span>
      <span className="text-gray-800">: {value ?? "-"}</span>
    </div>
  );
}
