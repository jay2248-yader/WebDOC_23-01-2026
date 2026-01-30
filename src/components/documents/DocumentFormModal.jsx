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
        doccategoryid: document?.doccategoryid || "",
        req_user: document?.req_user || "",
        req_to: document?.req_to || "",
        req_reason: document?.req_reason || "",
        branchid: document?.branchid || "",
        departmentid: document?.departmentid || "",
        boardid: document?.boardid || "",
        totalmoney: document?.totalmoney || "",
    });

    const [errors, setErrors] = useState({});
    const [isClosing, setIsClosing] = useState(false);
    const [submitDialog, setSubmitDialog] = useState({
        open: false,
        status: "confirm",
    });

    // Refs for input fields
    const doccategoryidRef = useRef(null);
    const reqUserRef = useRef(null);
    const reqToRef = useRef(null);
    const reqReasonRef = useRef(null);
    const branchidRef = useRef(null);
    const departmentidRef = useRef(null);
    const boardidRef = useRef(null);
    const totalmoneyRef = useRef(null);

    // Reset formData and submitDialog when modal opens or document changes
    useEffect(() => {
        if (isOpen) {
            setFormData({
                doccategoryid: document?.doccategoryid || "",
                req_user: document?.req_user || "",
                req_to: document?.req_to || "",
                req_reason: document?.req_reason || "",
                branchid: document?.branchid || "",
                departmentid: document?.departmentid || "",
                boardid: document?.boardid || "",
                totalmoney: document?.totalmoney || "",
            });
            setSubmitDialog({ open: false, status: "confirm" });
            setErrors({});
        }
    }, [isOpen, document]);

    if (!isOpen && !isClosing) return null;

    // Refs object for easy access
    const inputRefs = {
        doccategoryid: doccategoryidRef,
        req_user: reqUserRef,
        req_to: reqToRef,
        req_reason: reqReasonRef,
        branchid: branchidRef,
        departmentid: departmentidRef,
        boardid: boardidRef,
        totalmoney: totalmoneyRef,
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

        // Filter numeric fields
        const numericFields = ["doccategoryid", "req_user", "branchid", "departmentid", "boardid", "totalmoney"];
        if (numericFields.includes(field)) {
            value = value.replace(/[^0-9]/g, "");
        }

        setFormData({ ...formData, [field]: value });

        if (errors[field]) {
            setErrors({ ...errors, [field]: "" });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Basic validation
        const newErrors = {};
        if (!formData.doccategoryid) newErrors.doccategoryid = "ກະລຸນາເລືອກປະເພດເອກະສານ";
        if (!formData.req_user) newErrors.req_user = "ກະລຸນາປ້ອນຜູ້ຮ້ອງຂໍ";
        if (!formData.req_to) newErrors.req_to = "ກະລຸນາປ້ອນຮຽນ";
        if (!formData.req_reason) newErrors.req_reason = "ກະລຸນາປ້ອນເຫດຜົນ";
        if (!formData.branchid) newErrors.branchid = "ກະລຸນາເລືອກສາຂາ";
        if (!formData.departmentid) newErrors.departmentid = "ກະລຸນາເລືອກພະແນກ";
        if (!formData.boardid) newErrors.boardid = "ກະລຸນາເລືອກກອງ";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Convert to numbers before submitting
        const submitData = {
            doccategoryid: parseInt(formData.doccategoryid),
            req_user: parseInt(formData.req_user),
            req_to: formData.req_to,
            req_reason: formData.req_reason,
            branchid: parseInt(formData.branchid),
            departmentid: parseInt(formData.departmentid),
            boardid: parseInt(formData.boardid),
            totalmoney: formData.totalmoney ? parseInt(formData.totalmoney) : 0,
        };

        // Show confirm dialog
        setSubmitDialog({ open: true, status: "confirm", data: submitData });
    };

    const handleConfirmSubmit = async () => {
        try {
            setSubmitDialog({ ...submitDialog, status: "loading" });
            await onSubmit(submitDialog.data);
            setSubmitDialog({ ...submitDialog, status: "success" });
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
                            label="ລະຫັດ (ID)"
                            theme="light"
                            placeholder="ລະຫັດ"
                            value={document.rqdid}
                            onChange={() => { }}
                            disabled={true}
                        />
                    )}

                    <FormInput
                        label="ປະເພດເອກະສານ (ID)"
                        theme="light"
                        placeholder="ກະລຸນາປ້ອນລະຫັດປະເພດເອກະສານ"
                        value={formData.doccategoryid}
                        onChange={handleChange("doccategoryid")}
                        onKeyDown={handleKeyDown("req_user")}
                        inputRef={doccategoryidRef}
                        error={errors.doccategoryid}
                        hasError={!!errors.doccategoryid}
                    />

                    <FormInput
                        label="ຜູ້ຮ້ອງຂໍ (User ID)"
                        theme="light"
                        placeholder="ກະລຸນາປ້ອນລະຫັດຜູ້ຮ້ອງຂໍ"
                        value={formData.req_user}
                        onChange={handleChange("req_user")}
                        onKeyDown={handleKeyDown("req_to")}
                        inputRef={reqUserRef}
                        error={errors.req_user}
                        hasError={!!errors.req_user}
                    />

                    <FormInput
                        label="ຮຽນ"
                        theme="light"
                        placeholder="ກະລຸນາປ້ອນຮຽນ (ເຊັ່ນ: Director 3)"
                        value={formData.req_to}
                        onChange={handleChange("req_to")}
                        onKeyDown={handleKeyDown("req_reason")}
                        inputRef={reqToRef}
                        error={errors.req_to}
                        hasError={!!errors.req_to}
                    />

                    <FormInput
                        label="ເຫດຜົນ"
                        theme="light"
                        placeholder="ກະລຸນາປ້ອນເຫດຜົນ"
                        value={formData.req_reason}
                        onChange={handleChange("req_reason")}
                        onKeyDown={handleKeyDown("branchid")}
                        inputRef={reqReasonRef}
                        error={errors.req_reason}
                        hasError={!!errors.req_reason}
                    />

                    <FormInput
                        label="ສາຂາ (ID)"
                        theme="light"
                        placeholder="ກະລຸນາປ້ອນລະຫັດສາຂາ"
                        value={formData.branchid}
                        onChange={handleChange("branchid")}
                        onKeyDown={handleKeyDown("departmentid")}
                        inputRef={branchidRef}
                        error={errors.branchid}
                        hasError={!!errors.branchid}
                    />

                    <FormInput
                        label="ພະແນກ (ID)"
                        theme="light"
                        placeholder="ກະລຸນາປ້ອນລະຫັດພະແນກ"
                        value={formData.departmentid}
                        onChange={handleChange("departmentid")}
                        onKeyDown={handleKeyDown("boardid")}
                        inputRef={departmentidRef}
                        error={errors.departmentid}
                        hasError={!!errors.departmentid}
                    />

                    <FormInput
                        label="ກອງ (ID)"
                        theme="light"
                        placeholder="ກະລຸນາປ້ອນລະຫັດກອງ"
                        value={formData.boardid}
                        onChange={handleChange("boardid")}
                        onKeyDown={handleKeyDown("totalmoney")}
                        inputRef={boardidRef}
                        error={errors.boardid}
                        hasError={!!errors.boardid}
                    />

                    <FormInput
                        label="ຈຳນວນເງິນ (ບໍ່ບັງຄັບ)"
                        theme="light"
                        placeholder="ກະລຸນາປ້ອນຈຳນວນເງິນ"
                        value={formData.totalmoney}
                        onChange={handleChange("totalmoney")}
                        inputRef={totalmoneyRef}
                        error={errors.totalmoney}
                        hasError={!!errors.totalmoney}
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
                        ? `ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການແກ້ໄຂຂໍ້ມູນເອກະສານ?`
                        : `ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການເພີ່ມເອກະສານຮ້ອງຂໍໃໝ່?`
                }
                confirmText={document ? "ແກ້ໄຂ" : "ເພີ່ມ"}
                cancelText="ຍົກເລີກ"
                loadingMessage={document ? "ກຳລັງແກ້ໄຂຂໍ້ມູນ..." : "ກຳລັງເພີ່ມເອກະສານ..."}
                successMessage={document ? "ແກ້ໄຂຂໍ້ມູນສຳເລັດແລ້ວ" : "ເພີ່ມເອກະສານສຳເລັດແລ້ວ"}
                onConfirm={handleConfirmSubmit}
                onCancel={handleCancelSubmit}
                onClose={handleCloseSubmit}
            />
        </div>
    );
}
