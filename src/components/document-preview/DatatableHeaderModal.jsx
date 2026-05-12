import useFormModal from "../../hooks/useFormModal";
import FormModalShell from "../common/FormModalShell";
import { addDatatableHeader } from "../../services/documentservice";

export default function DatatableHeaderModal({ isOpen, onClose, onSaved, docData = {}, createby = "" }) {
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
      await addDatatableHeader(payload);
      onSaved?.();
    },
    initialData: {
      fors: "",
      details: "",
      note: "",
    },
    validate: (data) => {
      const e = {};
      if (!data.fors.trim()) e.fors = "ກະລຸນາປ້ອນ ອີງຕາມ";
      if (!data.details.trim()) e.details = "ກະລຸນາປ້ອນ ເນຶ້ອໃນ";
      return e;
    },
    transformData: (data) => ({
      rqdid: docData.rqdid,
      fors: data.fors.trim(),
      details: data.details.trim(),
      note: data.note.trim(),
      createby: String(createby),
    }),
  });

  return (
    <FormModalShell
      shouldRender={shouldRender}
      isClosing={isClosing}
      isEditing={false}
      entityName="ຫົວຕາຕະລາງ"
      displayName={docData.req_no || ""}
      submitDialog={submitDialog}
      onClose={handleClose}
      onConfirm={handleConfirmSubmit}
      onCancelSubmit={handleCancelSubmit}
      onCloseSubmit={handleCloseSubmit}
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center border-b border-blue-400 pb-2">
        ເພີ່ມຂໍ້ມູນຫົວຕາຕະລາງ
      </h3>

      <div className="bg-gray-50 rounded-lg p-3 mb-4 space-y-1 text-sm">
        <InfoRow label="ເລກທີ" value={docData.req_no} />
        <InfoRow label="rqdid" value={docData.rqdid} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* fors — ອີງຕາມ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ອີງຕາມ <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.fors}
            onChange={handleChange("fors")}
            placeholder="ປ້ອນ ອີງຕາມ..."
            rows={2}
            className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 resize-none ${
              errors.fors ? "border-red-400" : "border-gray-300"
            }`}
          />
          {errors.fors && <p className="text-red-500 text-xs mt-1">{errors.fors}</p>}
        </div>

        {/* details — ເນຶ້ອໃນ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ເນຶ້ອໃນ <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.details}
            onChange={handleChange("details")}
            placeholder="ປ້ອນ ເນຶ້ອໃນ..."
            rows={3}
            className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 resize-none ${
              errors.details ? "border-red-400" : "border-gray-300"
            }`}
          />
          {errors.details && <p className="text-red-500 text-xs mt-1">{errors.details}</p>}
        </div>

        {/* note — ໝາຍເຫດ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ໝາຍເຫດ
          </label>
          <textarea
            value={formData.note}
            onChange={handleChange("note")}
            placeholder="ປ້ອນ ໝາຍເຫດ... (ບໍ່ບັງຄັບ)"
            rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          />
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
            className="px-4 py-2 text-sm bg-[#0F75BC] text-white rounded-lg hover:bg-blue-700"
          >
            ບັນທຶກ
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
