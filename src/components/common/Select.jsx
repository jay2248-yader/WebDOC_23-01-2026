import { useState, useRef, useEffect } from "react";
import FieldError from "./FieldError";

export default function Select({
  label,
  value,
  onChange,
  options = [],
  placeholder = "ເລືອກ...",
  error,
  hasError = false,
  theme = "light",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState("bottom");
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  const isLight = theme === "light";

  // Get selected option label
  const selectedOption = options.find((opt) => opt.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  const labelClass = isLight ? "text-gray-700" : "text-white";
  const selectBase = isLight
    ? "bg-white text-gray-700 border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-300 hover:border-blue-400"
    : "bg-white/20 text-white border border-white/40 focus:ring-white/60 hover:bg-white/30 hover:border-white/70";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    const willOpen = !isOpen;

    // Calculate position before opening
    if (willOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const dropdownHeight = 240; // max-h-60 = 240px
      const spaceBelow = window.innerHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;

      // Show dropdown above if not enough space below
      if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
        setDropdownPosition("top");
      } else {
        setDropdownPosition("bottom");
      }
    }

    setIsOpen(willOpen);
    setIsFocused(willOpen);
  };

  const handleSelect = (optionValue) => {
    // Create synthetic event
    const syntheticEvent = {
      target: { value: optionValue },
    };
    onChange(syntheticEvent);
    setIsOpen(false);
    setIsFocused(false);
  };

  return (
    <div className="space-y-2" ref={dropdownRef}>
      {label ? (
        <label
          className={`block text-sm font-medium transition-colors duration-200 ${labelClass} ${
            isFocused ? "text-blue-600" : ""
          }`}
        >
          {label}
        </label>
      ) : null}

      <div className="relative">
        {/* Custom Select Button */}
        <button
          ref={buttonRef}
          type="button"
          onClick={handleToggle}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`w-full rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 transition-all duration-300 ease-out cursor-pointer text-left flex items-center justify-between
            ${
              hasError
                ? "border-2 border-red-500 focus:ring-red-200 animate-shake"
                : ""
            }
            ${selectBase}
            ${isFocused ? "scale-[1.02] shadow-lg" : ""}
            ${isHovered && !isFocused ? "scale-[1.01]" : ""}
            ${!selectedOption ? "text-gray-400" : ""}
          `}
        >
          <span>{displayText}</span>
          {/* Animated chevron icon */}
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
              isOpen
                ? dropdownPosition === "top"
                  ? "rotate-0 text-blue-500"
                  : "rotate-180 text-blue-500"
                : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Animated indicator line */}
        <div
          className={`absolute bottom-0 left-0 h-0.5 bg-linear-to-r from-blue-400 to-blue-600 transition-all duration-300 ease-out ${
            isFocused ? "w-full opacity-100" : "w-0 opacity-0"
          }`}
        />

        {/* Animated Dropdown */}
        {isOpen && (
          <div
            className={`absolute left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-2xl overflow-hidden ${
              dropdownPosition === "top"
                ? "bottom-full mb-2 animate-slideUpFade"
                : "top-full mt-2 animate-slideDownFade"
            }`}
            style={{ zIndex: 9999 }}
          >
            <div className="py-1 max-h-60 overflow-y-auto scrollbar-thin">
              {options.length > 0 ? (
                options.map((option, index) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`w-full text-left px-4 py-2 text-sm transition-all duration-200
    cursor-pointer
    hover:bg-blue-50 hover:text-blue-600 hover:pl-6
    disabled:cursor-not-allowed
    ${
      value === option.value
        ? "bg-blue-100 text-blue-700 font-medium"
        : "text-gray-700"
    }
    animate-fadeInUp
  `}
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <div className="flex items-center gap-2">
                      {value === option.value && (
                        <svg
                          className="w-4 h-4 text-blue-600 animate-scaleIn"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                      {option.label}
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-gray-400 text-center">
                  ບໍ່ມີຂໍ້ມູນ
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <FieldError error={error} />
    </div>
  );
}
