import { memo } from "react";
import ConfirmProgressDialog from "./ConfirmProgressDialog";

/**
 * FormModalShell — shared overlay + animated container + ConfirmProgressDialog
 * for every FormModal in the app.
 */
function FormModalShell({
  shouldRender,
  isClosing,
  isEditing,
  entityName,
  displayName,
  submitDialog,
  onClose,
  onConfirm,
  onCancelSubmit,
  onCloseSubmit,
  maxWidth = "max-w-md",
  children,
}) {
  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm ${
        isClosing ? "animate-fadeOut" : "animate-fadeIn"
      }`}
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-lg shadow-xl p-6 ${maxWidth} w-full mx-4 max-h-[90vh] overflow-y-auto ${
          isClosing ? "animate-slideDown" : "animate-slideUp"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>

      <ConfirmProgressDialog
        isOpen={submitDialog.open}
        status={submitDialog.status}
        title={isEditing ? "ຢືນຢັນການແກ້ໄຂ" : "ຢືນຢັນການເພີ່ມ"}
        message={
          isEditing
            ? `ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການແກ້ໄຂຂໍ້ມູນ${entityName} "${displayName}"?`
            : `ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການເພີ່ມ${entityName} "${displayName}"?`
        }
        confirmText={isEditing ? "ແກ້ໄຂ" : "ເພີ່ມ"}
        cancelText="ຍົກເລີກ"
        loadingMessage={
          isEditing ? "ກຳລັງແກ້ໄຂຂໍ້ມູນ..." : `ກຳລັງເພີ່ມ${entityName}...`
        }
        successMessage={
          isEditing
            ? "ແກ້ໄຂຂໍ້ມູນສຳເລັດແລ້ວ"
            : `ເພີ່ມ${entityName}ສຳເລັດແລ້ວ`
        }
        onConfirm={onConfirm}
        onCancel={onCancelSubmit}
        onClose={onCloseSubmit}
      />
    </div>
  );
}

export default memo(FormModalShell);
