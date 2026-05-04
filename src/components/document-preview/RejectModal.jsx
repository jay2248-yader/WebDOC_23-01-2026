import useFormModal from "../../hooks/useFormModal";
import FormModalShell from "../common/FormModalShell";
import { rejectRequestDocument } from "../../services/approvaldocumentservice";

export default function RejectModal({ isOpen, onClose, onRejected, docData = {}, levelapprove = null }) {
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
      await rejectRequestDocument(payload);
      onRejected?.();
    },
    initialData: {
      descriptions: "",
    },
    validate: (data) => {
      const e = {};
      if (!data.descriptions) e.descriptions = "ກະລຸນາປ້ອນເຫດຜົນການປະຕິເສດ";
      return e;
    },
    transformData: (data) => {
      const lv = parseInt(levelapprove);
      return {
        rqdid: docData.rqdid,
        reqno: docData.req_no,
        descriptions: !isNaN(lv) ? `lv${lv} ${data.descriptions}` : data.descriptions,
      };
    },
  });

  return (
    <FormModalShell
      shouldRender={shouldRender}
      isClosing={isClosing}
      isEditing={false}
      entityName="ການປະຕິເສດ"
      displayName={docData.req_no || ""}
      submitDialog={submitDialog}
      onClose={handleClose}
      onConfirm={handleConfirmSubmit}
      onCancelSubmit={handleCancelSubmit}
      onCloseSubmit={handleCloseSubmit}
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center border-b border-red-400 pb-2">
        ປະຕິເສດເອກະສານ
      </h3>

      {/* Pre-filled info */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4 space-y-1 text-sm">
        <InfoRow label="ເລກທີ" value={docData.req_no} />
        <InfoRow label="rqdid" value={docData.rqdid} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ເຫດຜົນການປະຕິເສດ <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.descriptions}
            onChange={handleChange("descriptions")}
            placeholder="ເຊັ່ນ: Reject by manager..."
            rows={3}
            className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-400 resize-none ${
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
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            ປະຕິເສດ
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
