import { useState, useRef, useEffect } from "react";
import FormInput from "../common/FormInput";
import Button from "../common/Button";
import ConfirmProgressDialog from "../common/ConfirmProgressDialog";

export default function AllAppFormModal({
    isOpen,
    onClose,
    onSubmit,
    allApp = null,
}) {
    const [formData, setFormData] = useState({
        appname: allApp?.appname || "",
        applink: allApp?.applink || "",
        moreinfo: allApp?.moreinfo || "",
    });

    const [errors, setErrors] = useState({});
    const [isClosing, setIsClosing] = useState(false);
    const [submitDialog, setSubmitDialog] = useState({
        open: false,
        status: "confirm",
    });

    // Refs for input fields
    const appnameRef = useRef(null);
    const applinkRef = useRef(null);
    const moreinfoRef = useRef(null);

    // Reset formData and submitDialog when modal opens or allApp changes
    useEffect(() => {
        if (isOpen) {
            setFormData({
                appname: allApp?.appname || "",
                applink: allApp?.applink || "",
                moreinfo: allApp?.moreinfo || "",
            });
            setSubmitDialog({ open: false, status: "confirm" });
            setErrors({});
        }
    }, [isOpen, allApp]);

    if (!isOpen && !isClosing) return null;

    // Refs object for easy access
    const inputRefs = {
        appname: appnameRef,
        applink: applinkRef,
        moreinfo: moreinfoRef,
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
        if (!formData.appname) newErrors.appname = "ກະລຸນາປ້ອນຊື່ AllApp";
        if (!formData.applink) newErrors.applink = "ກະລຸນາປ້ອນລິ້ງ";

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
                    {allApp ? "ແກ້ໄຂ AllApp" : "ເພີ່ມ AllApp"}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {allApp && (
                        <FormInput
                            label="ລະຫັດ"
                            theme="light"
                            placeholder="ລະຫັດ"
                            value={allApp.aaid}
                            onChange={() => { }}
                            disabled={true}
                        />
                    )}

                    <FormInput
                        label="ຊື່ AllApp"
                        theme="light"
                        placeholder="ກະລຸນາປ້ອນຊື່ AllApp"
                        value={formData.appname}
                        onChange={handleChange("appname")}
                        onKeyDown={handleKeyDown("applink")}
                        inputRef={appnameRef}
                        error={errors.appname}
                        hasError={!!errors.appname}
                    />

                    <FormInput
                        label="ລິ້ງ"
                        theme="light"
                        placeholder="ກະລຸນາປ້ອນລິ້ງ (ເຊັ່ນ: http://...)"
                        value={formData.applink}
                        onChange={handleChange("applink")}
                        onKeyDown={handleKeyDown("moreinfo")}
                        inputRef={applinkRef}
                        error={errors.applink}
                        hasError={!!errors.applink}
                    />

                    <FormInput
                        label="ລາຍລະອຽດເພີ່ມເຕີມ (ທາງເລືອກ)"
                        theme="light"
                        placeholder="ກະລຸນາປ້ອນລາຍລະອຽດ"
                        value={formData.moreinfo}
                        onChange={handleChange("moreinfo")}
                        inputRef={moreinfoRef}
                        error={errors.moreinfo}
                        hasError={!!errors.moreinfo}
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
                title={allApp ? "ຢືນຢັນການແກ້ໄຂ" : "ຢືນຢັນການເພີ່ມ"}
                message={
                    allApp
                        ? `ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການແກ້ໄຂຂໍ້ມູນ AllApp "${formData.appname}"?`
                        : `ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການເພີ່ມ AllApp "${formData.appname}"?`
                }
                confirmText={allApp ? "ແກ້ໄຂ" : "ເພີ່ມ"}
                cancelText="ຍົກເລີກ"
                loadingMessage={allApp ? "ກຳລັງແກ້ໄຂຂໍ້ມູນ..." : "ກຳລັງເພີ່ມ AllApp..."}
                successMessage={allApp ? "ແກ້ໄຂຂໍ້ມູນສຳເລັດແລ້ວ" : "ເພີ່ມ AllApp ສຳເລັດແລ້ວ"}
                onConfirm={handleConfirmSubmit}
                onCancel={handleCancelSubmit}
                onClose={handleCloseSubmit}
            />
        </div>
    );
}
