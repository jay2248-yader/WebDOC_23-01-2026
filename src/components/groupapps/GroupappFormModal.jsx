import { useState, useRef, useEffect } from "react";
import FormInput from "../common/FormInput";
import Button from "../common/Button";
import ConfirmProgressDialog from "../common/ConfirmProgressDialog";

export default function GroupappFormModal({
    isOpen,
    onClose,
    onSubmit,
    groupapp = null,
}) {
    const [formData, setFormData] = useState({
        groupname: groupapp?.groupname || "",
        groupinfo: groupapp?.groupinfo || "",
    });

    const [errors, setErrors] = useState({});
    const [isClosing, setIsClosing] = useState(false);
    const [submitDialog, setSubmitDialog] = useState({
        open: false,
        status: "confirm",
    });

    // Refs for input fields
    const groupnameRef = useRef(null);
    const groupinfoRef = useRef(null);

    // Reset formData and submitDialog when modal opens or groupapp changes
    useEffect(() => {
        if (isOpen) {
            setFormData({
                groupname: groupapp?.groupname || "",
                groupinfo: groupapp?.groupinfo || "",
            });
            setSubmitDialog({ open: false, status: "confirm" });
            setErrors({});
        }
    }, [isOpen, groupapp]);

    if (!isOpen && !isClosing) return null;

    // Refs object for easy access
    const inputRefs = {
        groupname: groupnameRef,
        groupinfo: groupinfoRef,
    };

    // Handle Enter key to move to next input
    const handleKeyDown = (nextFieldName) => (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            inputRefs[nextFieldName]?.current?.focus();
        }
    };

    const handleChange = (field) => (e) => {
        let value = e.target.value;

        setFormData({ ...formData, [field]: value });

        if (errors[field]) {
            setErrors({ ...errors, [field]: "" });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Basic validation
        const newErrors = {};
        if (!formData.groupname) newErrors.groupname = "ກະລຸນາປ້ອນຊື່ Groupapp";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Show confirm dialog
        setSubmitDialog({ open: true, status: "confirm" });
    };

    const handleConfirmSubmit = async () => {
        try {
            setSubmitDialog({ open: true, status: "loading" });
            await onSubmit(formData);
            setSubmitDialog({ open: true, status: "success" });
        } catch (error) {
            console.error("Error submitting form:", error);
            setSubmitDialog({ open: false, status: "confirm" });
            // Show error to user
            alert(error.message || "ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນ");
        }
    };

    const handleCancelSubmit = () => {
        setSubmitDialog({ open: false, status: "confirm" });
    };

    const handleCloseSubmit = () => {
        setSubmitDialog({ open: false, status: "confirm" });

        // Close form modal
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setErrors({});
            setIsClosing(false);
        }, 300);
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setErrors({});
            setIsClosing(false);
        }, 300);
    };

    const handleCancel = () => {
        handleClose();
    };

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm ${isClosing ? "animate-fadeOut" : "animate-fadeIn"
                }`}
            onClick={handleClose}
        >
            <div
                className={`bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto ${isClosing ? "animate-slideDown" : "animate-slideUp"
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center border-b border-blue-400 pb-2">
                    {groupapp ? "ແກ້ໄຂ Groupapp" : "ເພີ່ມ Groupapp"}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {groupapp && (
                        <FormInput
                            label="ລະຫັດ"
                            theme="light"
                            placeholder="ລະຫັດ"
                            value={groupapp.gid}
                            onChange={() => { }}
                            disabled={true}
                        />
                    )}

                    <FormInput
                        label="ຊື່ Groupapp"
                        theme="light"
                        placeholder="ກະລຸນາປ້ອນຊື່ Groupapp"
                        value={formData.groupname}
                        onChange={handleChange("groupname")}
                        onKeyDown={handleKeyDown("groupinfo")}
                        inputRef={groupnameRef}
                        error={errors.groupname}
                        hasError={!!errors.groupname}
                    />

                    <FormInput
                        label="ລາຍລະອຽດເພີ່ມເຕີມ (ທາງເລືອກ)"
                        theme="light"
                        placeholder="ກະລຸນາປ້ອນລາຍລະອຽດ"
                        value={formData.groupinfo}
                        onChange={handleChange("groupinfo")}
                        inputRef={groupinfoRef}
                        error={errors.groupinfo}
                        hasError={!!errors.groupinfo}
                    />

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            fullWidth={false}
                            variant="secondary"
                            size="md"
                            onClick={handleCancel}
                        >
                            ຍົກເລີກ
                        </Button>
                        <Button
                            type="submit"
                            fullWidth={false}
                            variant="outline"
                            size="md"
                            className="bg-[#0F75BC] text-white hover:bg-blue-700"
                        >
                            ສຳເລັດ
                        </Button>
                    </div>
                </form>
            </div>

            <ConfirmProgressDialog
                isOpen={submitDialog.open}
                status={submitDialog.status}
                title={groupapp ? "ຢືນຢັນການແກ້ໄຂ" : "ຢືນຢັນການເພີ່ມ"}
                message={
                    groupapp
                        ? `ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການແກ້ໄຂຂໍ້ມູນ Groupapp "${formData.groupname}"?`
                        : `ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການເພີ່ມ Groupapp "${formData.groupname}"?`
                }
                confirmText={groupapp ? "ແກ້ໄຂ" : "ເພີ່ມ"}
                cancelText="ຍົກເລີກ"
                loadingMessage={groupapp ? "ກຳລັງແກ້ໄຂຂໍ້ມູນ..." : "ກຳລັງເພີ່ມ Groupapp..."}
                successMessage={groupapp ? "ແກ້ໄຂຂໍ້ມູນສຳເລັດແລ້ວ" : "ເພີ່ມ Groupapp ສຳເລັດແລ້ວ"}
                onConfirm={handleConfirmSubmit}
                onCancel={handleCancelSubmit}
                onClose={handleCloseSubmit}
            />
        </div>
    );
}
