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

      if (matchesItemPath) {
        return true;
      }

      return item.children?.some(
        (child) =>
          pathname === child.path || pathname.startsWith(`${child.path}/`)
      );
    });

    return activeItem ? activeItem.id : null;
  };

  // ใช้ location.pathname โดยตรง
  const activeMenuId = getActiveMenuIdFromPath(location.pathname);

  const isMenuActive = (item) => activeMenuId === item.id;

  const isPathActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  // เช็คว่า menu ควรเปิดหรือไม่ (user toggle หรือ active child)
  const isMenuOpen = (item) => {
    if (openMenus[item.id] !== undefined) {
      return openMenus[item.id];
    }
    // Auto-open ถ้ามี active child
    return item.id === activeMenuId && item.children;
  };

  return (
    <div className="w-64 h-screen bg-[#0F75BC] text-white flex flex-col">
      {/* Logo Section */}
      <div className="p-6 flex items-center justify-center bg-[#0F75BC]">
        <img src={logo} alt="CSC Logo" className="w-20 h-20 object-contain" />
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-4">
        {MENU_ITEMS.map((item) => (
          <div
            key={item.id}
            className="border-b border-white/80 rounded-r-xl mb-2"
          >
            {/* Main Menu Item */}
            <div
              className={`px-6 py-3 flex items-center justify-between cursor-pointer transition-all
    ${
      isMenuActive(item)
        ? "bg-white text-[#0F75BC] border border-white/80 rounded-r-xl"
        : "text-white hover:bg-blue-700"
    }
  `}
              onClick={() => {
                if (item.children) {
                  toggleMenu(item.id);
                }
              }}
            >
              <Link
                to={item.path}
                className="flex items-center gap-3 flex-1"
                onClick={(e) => item.children && e.preventDefault()}
              >
 
                {typeof item.icon === "string" &&
                (item.icon.includes("/") || item.icon.includes(".")) ? (
                  <img
                    src={item.icon}
                    alt={item.label}
                    className="w-5 h-5 object-contain transition-all duration-200"
                    style={{
                      filter: isMenuActive(item)
                        ? "invert(32%) sepia(96%) saturate(1832%) hue-rotate(186deg) brightness(92%) contrast(87%)" // Blue #0F75BC
                        : "brightness(0) invert(100%)", // Force White
                    }}
                  />
                ) : (
                  <span className="text-xl">{item.icon}</span>
                )}
                <span className="text-sm">{item.label}</span>
              </Link>

              {item.children && (
                <span className="text-xs">
                  {isMenuOpen(item) ? "▼" : "▶"}
                </span>
              )}
            </div>

            {/* Submenu */}
            {item.children && isMenuOpen(item) && (
              <div className="bg-blue-700 rounded-b-xl">
                {" "}
      
                {item.children.map((child) => (
                  <Link
                    key={child.id}
                    to={child.path}
                    className={`block px-12 py-2 text-sm hover:bg-blue-600 transition-colors
              ${isPathActive(child.path) ? "bg-blue-600 font-semibold" : ""}
            `}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}
