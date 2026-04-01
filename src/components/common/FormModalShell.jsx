import { memo } from "react";
import ConfirmProgressDialog from "./ConfirmProgressDialog";

/**
 * FormModalShell
 *
 * กรอบ Modal มาตรฐานที่ทุก FormModal ในระบบใช้ร่วมกัน ประกอบด้วย:
 *   1. Overlay (backdrop blur) — คลิกนอก modal เพื่อปิด
 *   2. Card container — มี animation slideUp/slideDown
 *   3. ConfirmProgressDialog — dialog ยืนยัน/loading/success ก่อน submit
 *
 * Props:
 *   shouldRender   — render modal ไว้ใน DOM (true ขณะ open หรือ closing animation)
 *   isClosing      — true = เล่น animation ปิด (slideDown + fadeOut)
 *   isEditing      — true = mode แก้ไข, false = mode สร้าง (กำหนดข้อความ dialog)
 *   entityName     — ชื่อ entity ภาษาลาว เช่น "ຜູ້ໃຊ້", "ສາຂາ"
 *   displayName    — ชื่อ item ที่แสดงใน confirm dialog เช่น username
 *   submitDialog   — { open, status } จาก useFormModal
 *   maxWidth       — ความกว้าง card (default: "max-w-md")
 *   children       — เนื้อหา form ด้านใน
 *
 * ถ้าต้องการเปลี่ยนขนาด modal → ส่ง maxWidth prop เช่น maxWidth="max-w-lg"
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
