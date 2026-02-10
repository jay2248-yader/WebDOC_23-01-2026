import { useState, useRef, useEffect } from "react";
import Button from "../common/Button";
import ConfirmProgressDialog from "../common/ConfirmProgressDialog";

export default function DocumentDetailFormModal({
    isOpen,
    onClose,
    onSubmit,
    document = null,
}) {
    const [formData, setFormData] = useState({
        rqdid: document?.rqdid || "",
        req_to: "",
        req_title: "",
        req_subtitle: "",
        req_moreinfo: "",
    });

    const [errors, setErrors] = useState({});
    const [isClosing, setIsClosing] = useState(false);
    const [submitDialog, setSubmitDialog] = useState({
        open: false,
        status: "confirm", 
    });

    const reqToRef = useRef(null);
    const reqTitleRef = useRef(null);
    const reqSubtitleRef = useRef(null);
    const reqMoreinfoRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setFormData({
                rqdid: document?.rqdid || "",
                req_to: "",
                req_title: "",
                req_subtitle: "",
                req_moreinfo: "",
            });
            setSubmitDialog({ open: false, status: "confirm" });
            setErrors({});
        }
    }, [isOpen, document]);

    if (!isOpen && !isClosing) return null;

    const inputRefs = {
        req_to: reqToRef,
        req_title: reqTitleRef,
        req_subtitle: reqSubtitleRef,
        req_moreinfo: reqMoreinfoRef,
    };

    const handleKeyDown = (nextFieldName) => (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            inputRefs[nextFieldName]?.current?.focus();
        }
    };

    const handleChange = (field) => (e) => {
        const value = e.target.value;
        setFormData({ ...formData, [field]: value });

        if (errors[field]) {
            setErrors({ ...errors, [field]: "" });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const newErrors = {};
        if (!formData.req_to) newErrors.req_to = "ກະລຸນາປ້ອນຮຽນ";
        if (!formData.req_title) newErrors.req_title = "ກະລຸນາປ້ອນຫົວຂໍ້";
        if (!formData.req_subtitle) newErrors.req_subtitle = "ກະລຸນາປ້ອນຫົວຂໍ້ຍ່ອຍ";
        if (!formData.req_moreinfo) newErrors.req_moreinfo = "ກະລຸນາປ້ອນລາຍລະອຽດເພີ່ມເຕີມ";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setSubmitDialog({ open: true, status: "confirm" });
    };

    const handleConfirmSubmit = async () => {
        try {
            setSubmitDialog({ open: true, status: "loading" });
            await onSubmit(formData);
            setSubmitDialog({ open: true, status: "success" });
        } catch (error) {
            console.error("Error submitting document detail:", error);
            alert(error.message || "ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນ");
            setSubmitDialog({ open: false, status: "confirm" });
        }
    };

    const handleCancelSubmit = () => {
        setSubmitDialog({ open: false, status: "confirm" });
    };

    const handleCloseSubmit = () => {
        setSubmitDialog({ open: false, status: "confirm" });
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

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm ${
                isClosing ? "animate-fadeOut" : "animate-fadeIn"
            }`}
            onClick={handleClose}
        >
            <div
                className={`bg-white rounded-lg shadow-xl p-8 max-w-xl w-full mx-4 max-h-[90vh] overflow-y-auto ${
                    isClosing ? "animate-slideDown" : "animate-slideUp"
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-6 text-center border-b-2 border-[#0F75BC] pb-3">
                    ເພີ່ມລາຍລະອຽດເອກະສານ
                </h3>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* ຮຽນ */}
                    <div className="flex items-start gap-4">
                        <label className="w-32 shrink-0 text-sm font-medium text-gray-700 pt-2.5">
                            ຮຽນ
                        </label>
                        <div className="flex-1">
                            <input
                                type="text"
                                ref={reqToRef}
                                value={formData.req_to}
                                onChange={handleChange("req_to")}
                                onKeyDown={handleKeyDown("req_title")}
                                placeholder="ກະລຸນາປ້ອນຮຽນ"
                                className={`w-full rounded-lg border ${errors.req_to ? 'border-red-500' : 'border-blue-300'} bg-white px-4 py-2.5 text-sm text-gray-700 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-400`}
                            />
                            {errors.req_to && (
                                <p className="mt-1 text-xs text-red-500">{errors.req_to}</p>
                            )}
                        </div>
                    </div>

                    {/* ຫົວຂໍ້ */}
                    <div className="flex items-start gap-4">
                        <label className="w-32 shrink-0 text-sm font-medium text-gray-700 pt-2.5">
                            ຫົວຂໍ້
                        </label>
                        <div className="flex-1">
                            <input
                                type="text"
                                ref={reqTitleRef}
                                value={formData.req_title}
                                onChange={handleChange("req_title")}
                                onKeyDown={handleKeyDown("req_subtitle")}
                                placeholder="ກະລຸນາປ້ອນຫົວຂໍ້"
                                className={`w-full rounded-lg border ${errors.req_title ? 'border-red-500' : 'border-blue-300'} bg-white px-4 py-2.5 text-sm text-gray-700 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-400`}
                            />
                            {errors.req_title && (
                                <p className="mt-1 text-xs text-red-500">{errors.req_title}</p>
                            )}
                        </div>
                    </div>

                    {/* ຫົວຂໍ້ຍ່ອຍ */}
                    <div className="flex items-start gap-4">
                        <label className="w-32 shrink-0 text-sm font-medium text-gray-700 pt-2.5">
                            ຫົວຂໍ້ຍ່ອຍ
                        </label>
                        <div className="flex-1">
                            <input
                                type="text"
                                ref={reqSubtitleRef}
                                value={formData.req_subtitle}
                                onChange={handleChange("req_subtitle")}
                                onKeyDown={handleKeyDown("req_moreinfo")}
                                placeholder="ກະລຸນາປ້ອນຫົວຂໍ້ຍ່ອຍ"
                                className={`w-full rounded-lg border ${errors.req_subtitle ? 'border-red-500' : 'border-blue-300'} bg-white px-4 py-2.5 text-sm text-gray-700 min-h-[70px] focus:outline-none focus:ring-2 focus:ring-blue-400`}
                            />
                            {errors.req_subtitle && (
                                <p className="mt-1 text-xs text-red-500">{errors.req_subtitle}</p>
                            )}
                        </div>
                    </div>

                    {/* ລາຍລະອຽດເພີ່ມເຕີມ */}
                    <div className="flex items-start gap-4">
                        <label className="w-32 shrink-0 text-sm font-medium text-gray-700 pt-2.5">
                            ລາຍລະອຽດ
                        </label>
                        <div className="flex-1">
                            <textarea
                                ref={reqMoreinfoRef}
                                value={formData.req_moreinfo}
                                onChange={handleChange("req_moreinfo")}
                                placeholder="ກະລຸນາປ້ອນລາຍລະອຽດເພີ່ມເຕີມ"
                                rows={4}
                                className={`w-full rounded-lg border ${errors.req_moreinfo ? 'border-red-500' : 'border-blue-300'} bg-white px-4 py-2.5 text-sm text-gray-700 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none`}
                            />
                            {errors.req_moreinfo && (
                                <p className="mt-1 text-xs text-red-500">{errors.req_moreinfo}</p>
                            )}
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-between pt-8">
                        <Button
                            type="button"
                            fullWidth={false}
                            variant="outline"
                            size="md"
                            onClick={handleClose}
                        >
                            ຍົກເລີກ
                        </Button>
                        <Button
                            type="submit"
                            fullWidth={false}
                            variant="outline"
                            size="md"
                            className="bg-red-500 text-white border-red-500 hover:bg-red-600"
                        >
                            ສຳເລັດ
                        </Button>
                    </div>
                </form>
            </div>

            <ConfirmProgressDialog
                isOpen={submitDialog.open}
                status={submitDialog.status}
                title="ຢືນຢັນການເພີ່ມລາຍລະອຽດ"
                message={`ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການເພີ່ມລາຍລະອຽດເອກະສານ?`}
                confirmText="ເພີ່ມ"
                cancelText="ຍົກເລີກ"
                loadingMessage="ກຳລັງເພີ່ມລາຍລະອຽດ..."
                successMessage="ເພີ່ມລາຍລະອຽດສຳເລັດແລ້ວ"
                onConfirm={handleConfirmSubmit}
                onCancel={handleCancelSubmit}
                onClose={handleCloseSubmit}
            />
        </div>
    );
}
