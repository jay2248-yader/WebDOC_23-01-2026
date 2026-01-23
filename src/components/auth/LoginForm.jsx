import useLogin from "../../hooks/useLogin";
import { useNavigate } from "react-router-dom";
import FormInput from "../common/FormInput";
import Button from "../common/Button";
import ErrorMessage from "../common/ErrorMessage";

export default function LoginForm() {
  const navigate = useNavigate();
  const {
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
    handleSubmit: handleFormSubmit,
  } = useLogin();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const success = await handleFormSubmit(e);

    if (success) {
      // Navigate to dashboard (auth already handled in useLogin)
      navigate('/dashboard');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col justify-center gap-5 w-full"
    >
      {/* General Error Message */}
      <ErrorMessage message={error} />

      {/* Employee ID Input */}
      <FormInput
        label="ລະຫັດພະນັກງານ"
        type="text"
        placeholder="ກະລຸນາປ້ອນລະຫັດພະນັກງານ"
        value={employeeId}
        onChange={(e) => handleEmployeeIdChange(e.target.value)}
        onKeyDown={handleEmployeeIdKeyDown}
        error={fieldErrors.employeeId}
        hasError={!!fieldErrors.employeeId}
        maxLength={20}
        rounded="xl"
        size="lg"
      />

      {/* Password Input */}
      <FormInput
        label="ລະຫັດຜ່ານ"
        type="password"
        placeholder="ກະລຸນາປ້ອນລະຫັດຜ່ານ"
        value={password}
        onChange={(e) => handlePasswordChange(e.target.value)}
        error={fieldErrors.password}
        hasError={!!fieldErrors.password}
        maxLength={20}
        showPassword={showPassword}
        onTogglePassword={() => setShowPassword(!showPassword)}
        inputRef={passwordInputRef}
         rounded="xl"
         size="lg"
      />

      {/* Submit Button */}
      <Button
        type="submit"
        loading={loading}
        className="mt-4"
      >
        {loading ? "ກຳລັງເຂົ້າສູ່ລະບົບ..." : "ເຂົ້າສູ່ລະບົບ"}
      </Button>
    </form>
  );
}