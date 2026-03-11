import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { MENU_ITEMS } from "../../constants/navigation";
import logo from "../../assets/Logo/CSC_LOGO.svg";

export default function Sidebar() {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (menuId) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  };

  const getActiveMenuIdFromPath = (pathname) => {
    const activeItem = MENU_ITEMS.find((item) => {
      const matchesItemPath =
        pathname === item.path || pathname.startsWith(`${item.path}/`);
      if (matchesItemPath) return true;
      return item.children?.some(
        (child) =>
          pathname === child.path || pathname.startsWith(`${child.path}/`)
      );
    });
    return activeItem ? activeItem.id : null;
  };

  const activeMenuId = getActiveMenuIdFromPath(location.pathname);
  const isMenuActive = (item) => activeMenuId === item.id;

  const isPathActive = (path) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  const isMenuOpen = (item) => {
    if (openMenus[item.id] !== undefined) return openMenus[item.id];
    return item.id === activeMenuId && item.children;
  };

  return (
    <div
      className="w-64 h-screen flex flex-col"
      style={{ background: "#0F75BC" }}
    >
      {/* Logo Section */}
      <div className="flex flex-col items-center pt-7 pb-5 px-4">
        <div
        >
          <img src={logo} alt="CSC Logo" className="w-30 h-30 object-contain" />
        </div>

      </div>

      {/* Divider */}
      <div className="mx-5 mb-4 h-px" style={{ background: "rgba(255,255,255,0.15)" }} />

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-1 scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-transparent">
        {MENU_ITEMS.map((item) => {
          const active = isMenuActive(item);
          const open = isMenuOpen(item);

          return (
            <div key={item.id}>
              {/* Main Menu Item */}
              <div
                className={`
                  group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer
                  transition-all duration-200 select-none
                  ${active
                    ? "bg-white text-[#0F75BC] shadow-md"
                    : "text-blue-100 hover:bg-white/10 hover:text-white"
                  }
                `}
                onClick={() => {
                  if (item.children) toggleMenu(item.id);
                }}
              >
                <Link
                  to={item.path}
                  className="flex items-center gap-3 flex-1 min-w-0 overflow-hidden"
                  onClick={(e) => item.children && e.preventDefault()}
                >
                  {/* Icon */}
                  <span
                    className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-base
                      transition-all duration-200
                      ${active ? "bg-blue-100" : "bg-white/10 group-hover:bg-white/20"}
                    `}
                  >
                    {typeof item.icon === "string" &&
                    (item.icon.includes("/") || item.icon.includes(".")) ? (
                      <img
                        src={item.icon}
                        alt={item.label}
                        className="w-4 h-4 object-contain shrink-0"
                        style={{
                          filter: active
                            ? "invert(32%) sepia(96%) saturate(1832%) hue-rotate(186deg) brightness(92%) contrast(87%)"
                            : "brightness(0) invert(100%)",
                        }}
                      />
                    ) : (
                      <span className="leading-none">{item.icon}</span>
                    )}
                  </span>

                  {/* Label */}
                  <span className={`text-sm font-medium truncate ${active ? "text-[#0F75BC]" : ""}`}>
                    {item.label}
                  </span>
                </Link>

                {/* Chevron */}
                {item.children && (
                  <svg
                    className={`w-4 h-4 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""} ${active ? "text-[#0F75BC]" : "text-blue-200"}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </div>

              {/* Submenu */}
              {item.children && open && (
                <div className="mt-1 ml-4 pl-3 space-y-0.5 border-l-2 border-white/20">
                  {item.children.map((child) => {
                    const childActive = isPathActive(child.path);
                    return (
                      <Link
                        key={child.id}
                        to={child.path}
                        className={`
                          flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-150
                          ${childActive
                            ? "bg-white/20 text-white font-semibold"
                            : "text-blue-200 hover:bg-white/10 hover:text-white"
                          }
                        `}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${childActive ? "bg-white" : "bg-blue-300/60"}`}
                        />
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom Divider + Version */}
      <div className="px-4 pb-5">
        <div className="h-px mb-4" style={{ background: "rgba(255,255,255,0.15)" }} />
        <div className="flex items-center gap-2 px-2">
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-white">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">Admin</p>
            <p className="text-blue-300 text-xs opacity-75 truncate">v1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
