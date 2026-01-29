import { useState, useRef, useEffect } from "react";
import FormInput from "../common/FormInput";
import Button from "../common/Button";
import ConfirmProgressDialog from "../common/ConfirmProgressDialog";

export default function DocumentFormModal({
    isOpen,
    onClose,
    onSubmit,
    document = null,
}) {
    const [formData, setFormData] = useState({
        documentTitle: document?.documentTitle || "",
        category: document?.category || "",
        description: document?.description || "",
    });

    const [errors, setErrors] = useState({});
    const [isClosing, setIsClosing] = useState(false);
    const [submitDialog, setSubmitDialog] = useState({
        open: false,
        status: "confirm",
    });

    // Refs for input fields
    const titleRef = useRef(null);
    const categoryRef = useRef(null);
    const descriptionRef = useRef(null);

    // Reset formData and submitDialog when modal opens or document changes
    useEffect(() => {
        if (isOpen) {
            setFormData({
                documentTitle: document?.documentTitle || "",
                category: document?.category || "",
                description: document?.description || "",
            });
            setSubmitDialog({ open: false, status: "confirm" });
            setErrors({});
        }
    }, [isOpen, document]);

    if (!isOpen && !isClosing) return null;

    // Refs object for easy access
    const inputRefs = {
        documentTitle: titleRef,
        category: categoryRef,
        description: descriptionRef,
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
        if (!formData.documentTitle) newErrors.documentTitle = "ກະລຸນາປ້ອນຊື່ເອກະສານ"; // Please enter document title
        if (!formData.category) newErrors.category = "ກະລຸນາປ້ອນໝວດໝູ່"; // Please enter category

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
            alert(error.message || "ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນ"); // Error saving data
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
                    {document ? "ແກ້ໄຂເອກະສານ" : "ເພີ່ມເອກະສານ"} {/* Edit Document : Add Document */}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {document && (
                        <FormInput
                            label="ລະຫັດ" // ID
                            theme="light"
                            placeholder="ລະຫັດ"
                            value={document.docId}
                            onChange={() => { }}
                            disabled={true}
                        />
                    )}

                    <FormInput
                        label="ຊື່ເອກະສານ" // Document Title
                        theme="light"
                        placeholder="ກະລຸນາປ້ອນຊື່ເອກະສານ"
                        value={formData.documentTitle}
                        onChange={handleChange("documentTitle")}
                        onKeyDown={handleKeyDown("category")}
                        inputRef={titleRef}
                        error={errors.documentTitle}
                        hasError={!!errors.documentTitle}
                    />

                    <FormInput
                        label="ໝວດໝູ່" // Category
                        theme="light"
                        placeholder="ກະລຸນາປ້ອນໝວດໝູ່"
                        value={formData.category}
                        onChange={handleChange("category")}
                        onKeyDown={handleKeyDown("description")}
                        inputRef={categoryRef}
                        error={errors.category}
                        hasError={!!errors.category}
                    />

                    <FormInput
                        label="ລາຍລະອຽດ" // Description
                        theme="light"
                        placeholder="ກະລຸນາປ້ອນລາຍລະອຽດ"
                        value={formData.description}
                        onChange={handleChange("description")}
                        inputRef={descriptionRef}
                        error={errors.description}
                        hasError={!!errors.description}
                    // You might want a textarea here, but FormInput is usually text. 
                    // If FormInput supports type="textarea" or similar, use it. 
                    // For now assuming it's a standard input.
                    />

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            fullWidth={false}
                            variant="secondary"
                            size="md"
                            onClick={handleCancel}
                        >
                            ຍົກເລີກ{/* Cancel */}
                        </Button>
                        <Button
                            type="submit"
                            fullWidth={false}
                            variant="outline"
                            size="md"
                            className="bg-[#0F75BC] text-white hover:bg-blue-700"
                        >
                            ສຳເລັດ{/* Success/Confirm */}
                        </Button>
                    </div>
                </form>
            </div>

            <ConfirmProgressDialog
                isOpen={submitDialog.open}
                status={submitDialog.status}
                title={document ? "ຢືນຢັນການແກ້ໄຂ" : "ຢືນຢັນການເພີ່ມ"}
                message={
                    document
                        ? `ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການແກ້ໄຂຂໍ້ມູນເອກະສານ "${formData.documentTitle}"?`
                        : `ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການເພີ່ມເອກະສານ "${formData.documentTitle}"?`
                }
                confirmText={document ? "ແກ້ໄຂ" : "ເພີ່ມ"}
                cancelText="ຍົກເລີກ" // Cancel
                loadingMessage={document ? "ກຳລັງແກ້ໄຂຂໍ້ມູນ..." : "ກຳລັງເພີ່ມເອກະສານ..."}
                successMessage={document ? "ແກ້ໄຂຂໍ້ມູນສຳເລັດແລ້ວ" : "ເພີ່ມເອກະສານສຳເລັດແລ້ວ"}
                onConfirm={handleConfirmSubmit}
                onCancel={handleCancelSubmit}
                onClose={handleCloseSubmit}
            />
        </div>
    );
}
