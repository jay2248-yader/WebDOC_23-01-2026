import { useAuthStore } from "../../store/authstore";
import { useNavigate } from "react-router-dom";
import { useState, useCallback } from "react";
import ChangePasswordModal from "../common/ChangePasswordModal";

export default function Header({ title = "ໜ້າຫຼັກ", breadcrumb = null, onMenuToggle }) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showChangePwd, setShowChangePwd] = useState(false);

  const toggleDropdown = useCallback(() => setShowDropdown((v) => !v), []);
  const closeDropdown = useCallback(() => setShowDropdown(false), []);

  const handleOpenChangePwd = useCallback(() => {
    setShowDropdown(false);
    setShowChangePwd(true);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    navigate("/login");
  }, [logout, navigate]);

  return (
    <>
    <header className="bg-white border-b border-gray-100 px-4 md:px-6 h-20 flex items-center justify-between shadow-sm">
      {/* Left */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Hamburger (mobile only) */}
        <button
          className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors shrink-0"
          onClick={onMenuToggle}
          aria-label="ເປີດເມນູ"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="w-1.5 h-7 rounded-full bg-[#0F75BC] shrink-0 hidden md:block" />

        <div className="min-w-0">
          {breadcrumb ? (
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 leading-none mb-0.5 truncate">
                {breadcrumb.parent}
              </span>
              <h1 className="text-lg font-bold text-gray-800 tracking-wide truncate leading-tight">
                {breadcrumb.current}
              </h1>
            </div>
          ) : (
            <h1 className="text-xl font-bold text-gray-800 tracking-wide truncate">{title}</h1>
          )}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-px h-12 bg-gray-200 mx-1 hidden sm:block" />

        <div className="relative">
          <button
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-50 transition-all duration-150"
            onClick={toggleDropdown}
          >
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 shrink-0">
              <svg className="w-6 h-6 md:w-7 md:h-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
              </svg>
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm text-gray-400 leading-tight">{user?.usercode || "user"}</p>
              <p className="text-base font-semibold text-green-600 leading-tight">{user?.username || "Admin"}</p>
            </div>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform duration-150 ${showDropdown ? "rotate-180" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={closeDropdown} />
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-lg border border-gray-100 z-20 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-xs text-gray-400">ເຂົ້າສູ່ລະບົບໃນນາມ</p>
                  <p className="text-sm font-semibold text-gray-800 truncate">{user?.username || "Admin"}</p>
                </div>
                <div className="py-1">
                  <button
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={handleOpenChangePwd}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                    </svg>
                    ປ່ຽນລະຫັດຜ່ານ
                  </button>
                  <button
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    onClick={handleLogout}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    ອອກຈາກລະບົບ
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>

    <ChangePasswordModal isOpen={showChangePwd} onClose={() => setShowChangePwd(false)} />
    </>
  );
}
