import { useState, useRef, useEffect, useCallback, useTransition, useReducer } from "react";
import { toast } from "../store/toastStore";

function formReducer(state, action) {
  switch (action.type) {
    case "reset":
      return { formData: action.payload, errors: {}, dialogOpen: false, succeeded: false };
    case "set_form_data":
      return {
        ...state,
        formData: typeof action.updater === "function" ? action.updater(state.formData) : action.updater,
      };
    case "set_errors":
      return {
        ...state,
        errors: typeof action.updater === "function" ? action.updater(state.errors) : action.updater,
      };
    case "set_field":
      return {
        ...state,
        formData: { ...state.formData, [action.field]: action.value },
        errors: state.errors[action.field] ? { ...state.errors, [action.field]: "" } : state.errors,
      };
    case "open_dialog":
      return { ...state, dialogOpen: true, succeeded: false };
    case "close_dialog":
      return { ...state, dialogOpen: false, succeeded: false };
    case "submit_success":
      return { ...state, succeeded: true };
    case "submit_error":
      return { ...state, dialogOpen: false, succeeded: false };
    default:
      return state;
  }
}

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
  const [{ formData, errors, dialogOpen, succeeded }, dispatch] = useReducer(formReducer, {
    formData: typeof initialData === "function" ? initialData() : initialData,
    errors: {},
    dialogOpen: false,
    succeeded: false,
  });
  const [isClosing, setIsClosing] = useState(false);

  // useTransition: tracks async submission — replaces manual status:"loading" state
  const [isPending, startTransition] = useTransition();

  // Derive submitDialog from atomic states + isPending (no manual state machine)
  const submitDialog = {
    open: dialogOpen,
    status: isPending ? "loading" : succeeded ? "success" : "confirm",
  };

  // Clean up close animation timer on unmount
  const closeTimerRef = useRef(null);
  useEffect(() => () => clearTimeout(closeTimerRef.current), []);

  // Reset when modal transitions from closed → open
  const prevOpenRef = useRef(false);
  useEffect(() => {
    if (isOpen && !prevOpenRef.current) {
      dispatch({
        type: "reset",
        payload: typeof initialData === "function" ? initialData() : initialData,
      });
    }
    prevOpenRef.current = isOpen;
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const setFormData = useCallback((updater) => dispatch({ type: "set_form_data", updater }), []);
  const setErrors = useCallback((updater) => dispatch({ type: "set_errors", updater }), []);

  const handleChange = useCallback(
    (field, filter) => (e) => {
      let value = e?.target ? e.target.value : e;
      if (filter) value = filter(value);
      dispatch({ type: "set_field", field, value });
    },
    []
  );

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const newErrors = validate ? validate(formData) : {};
      if (Object.keys(newErrors).length > 0) {
        dispatch({ type: "set_errors", updater: newErrors });
        return;
      }
      dispatch({ type: "open_dialog" });
    },
    [formData, validate]
  );

  // startTransition wraps the async work → isPending auto-tracks loading state
  const handleConfirmSubmit = useCallback(() => {
    startTransition(async () => {
      try {
        const payload = transformData ? transformData(formData) : formData;
        await onSubmit(payload);
        dispatch({ type: "submit_success" });
      } catch (error) {
        console.error("Error submitting form:", error);
        dispatch({ type: "submit_error" });
        toast.error(error.message || "ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນ");
      }
    });
  }, [formData, onSubmit, transformData]);

  const handleCancelSubmit = useCallback(() => {
    dispatch({ type: "close_dialog" });
  }, []);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    closeTimerRef.current = setTimeout(() => {
      onClose();
      dispatch({ type: "set_errors", updater: {} });
      setIsClosing(false);
    }, 300);
  }, [onClose]);

  const handleCloseSubmit = useCallback(() => {
    dispatch({ type: "close_dialog" });
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
