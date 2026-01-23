export default function Button({
  children,
  loading = false,
  disabled = false,
  onClick,
  type = "button",
  variant = "primary",
  size = "lg",
  fullWidth = true,
  className = "",
  ...rest
}) {
  const isDisabled = loading || disabled;

  const baseClasses = "rounded-xl font-bold transition-all duration-200 ease-in-out";

  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3 text-base",
    lg: "px-6 py-4 text-lg",
  };

  const variantClasses = {
    primary: isDisabled
      ? "bg-white/40 text-white cursor-not-allowed"
      : "bg-white text-blue-700 hover:bg-blue-50 hover:scale-105 hover:shadow-lg cursor-pointer",
    secondary: isDisabled
      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
      : "bg-gray-100 text-gray-800 hover:bg-gray-200 hover:scale-105 hover:shadow-lg cursor-pointer",
    outline: isDisabled
      ? "border border-gray-300 text-gray-400 cursor-not-allowed"
      : "border border-blue-600 text-blue-700 hover:bg-blue-50 hover:scale-105 hover:shadow-lg cursor-pointer",
    ghost: isDisabled
      ? "text-gray-400 cursor-not-allowed"
      : "text-blue-700 hover:bg-blue-50 hover:scale-105 hover:shadow-lg cursor-pointer",
  };

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={`${fullWidth ? "w-full" : ""} ${baseClasses} ${
        sizeClasses[size] || sizeClasses.lg
      } ${variantClasses[variant] || variantClasses.primary} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
