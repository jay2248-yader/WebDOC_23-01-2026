import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "../store/toastStore";

/**
 * useFormModal — shared logic for every FormModal in the app.
 *
 * @param {Object}   opts
 * @param {boolean}  opts.isOpen        – modal visibility
 * @param {Object}   opts.initialData   – default formData when modal opens
 * @param {Function} opts.onSubmit      – async (formData) => void
 * @param {Function} opts.onClose       – called after closing animation
 * @param {Function} opts.validate      – (formData) => errorsObject
 * @param {Function} [opts.transformData] – (formData) => payload  (optional)
 */
export default function useFormModal({
  isOpen,
  initialData,
  onSubmit,
  onClose,
  validate,
  transformData,
}) {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [isClosing, setIsClosing] = useState(false);
  const [submitDialog, setSubmitDialog] = useState({
    open: false,
    status: "confirm",
  });

  // Clean up close animation timer on unmount
  const closeTimerRef = useRef(null);
  useEffect(() => () => clearTimeout(closeTimerRef.current), []);

  // Reset when modal transitions from closed → open
  const prevOpenRef = useRef(false);
  useEffect(() => {
    if (isOpen && !prevOpenRef.current) {
      setFormData(
        typeof initialData === "function" ? initialData() : initialData
      );
      setErrors({});
      setSubmitDialog({ open: false, status: "confirm" });
    }
    prevOpenRef.current = isOpen;
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = useCallback(
    (field, filter) => (e) => {
      let value = e?.target ? e.target.value : e;
      if (filter) value = filter(value);
      setFormData((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => (prev[field] ? { ...prev, [field]: "" } : prev));
    },
    []
  );

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const newErrors = validate ? validate(formData) : {};
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      setSubmitDialog({ open: true, status: "confirm" });
    },
    [formData, validate]
  );

  const handleConfirmSubmit = useCallback(async () => {
    try {
      setSubmitDialog({ open: true, status: "loading" });
      const payload = transformData ? transformData(formData) : formData;
      await onSubmit(payload);
      setSubmitDialog({ open: true, status: "success" });
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitDialog({ open: false, status: "confirm" });
      toast.error(error.message || "ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນ");
    }
  }, [formData, onSubmit, transformData]);

  const handleCancelSubmit = useCallback(() => {
    setSubmitDialog({ open: false, status: "confirm" });
  }, []);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    closeTimerRef.current = setTimeout(() => {
      onClose();
      setErrors({});
      setIsClosing(false);
    }, 300);
  }, [onClose]);

  const handleCloseSubmit = useCallback(() => {
    setSubmitDialog({ open: false, status: "confirm" });
    handleClose();
  }, [handleClose]);

  const shouldRender = isOpen || isClosing;

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    isClosing,
    submitDialog,
    shouldRender,
    handleChange,
    handleSubmit,
    handleConfirmSubmit,
    handleCancelSubmit,
    handleCloseSubmit,
    handleClose,
  };
}
