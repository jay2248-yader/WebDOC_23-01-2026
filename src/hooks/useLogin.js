import { useState, useRef } from "react";
import { createInputHandler } from "../utils/validation";
import { loginUser } from "../services/authservice";
import { useAuthStore } from "../store/authstore";

export default function useLogin() {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    employeeId: "",
    password: "",
  });

  // สร้าง ref สำหรับ password input
  const passwordInputRef = useRef(null);

  // Zustand store
  const setAuth = useAuthStore((state) => state.setAuth);

  // ใช้ createInputHandler utility แทนการเขียน validation ซ้ำ
  const handleEmployeeIdChange = createInputHandler(setEmployeeId, {
    maxLength: 20,
    alphanumericOnly: true,
  });

  const handlePasswordChange = createInputHandler(setPassword, {
    maxLength: 20,
    alphanumericOnly: true,
  });

  // ฟังก์ชันจัดการเมื่อกด Enter ที่ช่อง Employee ID
  const handleEmployeeIdKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // ป้องกันการ submit form
      passwordInputRef.current?.focus(); // ย้าย focus ไปที่ช่อง password
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({ employeeId: "", password: "" });

    // Validate fields
    let hasError = false;
    const newFieldErrors = { employeeId: "", password: "" };

    if (!employeeId.trim()) {
      newFieldErrors.employeeId = "ກະລຸນາປ້ອນລະຫັດພະນັກງານ";
      hasError = true;
    }

    if (!password.trim()) {
      newFieldErrors.password = "ກະລຸນາປ້ອນລະຫັດຜ່ານ";
      hasError = true;
    }

    if (hasError) {
      setFieldErrors(newFieldErrors);
      return false;
    }

    try {
      setLoading(true);

      // เรียก API จริง
      const userData = await loginUser({
        usercode: employeeId,
        pwds: password,
      });

      // เก็บข้อมูล user + token ใน Zustand store
      setAuth(userData);

      console.log("LOGIN SUCCESS", userData);

      // Return success
      return true;
    } catch (err) {
      console.error("LOGIN ERROR", err);
      setError(err.message || "ລະຫັດພະນັກງານ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    employeeId,
    password,
    showPassword,
    loading,
    error,
    fieldErrors,
    passwordInputRef,
    handleEmployeeIdChange,
    handlePasswordChange,
    handleEmployeeIdKeyDown,
    setShowPassword,
    handleSubmit,
  };
}