import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import ToastContainer from "../common/ToastContainer";
import SessionTimeoutDialog from "../common/SessionTimeoutDialog";
import useInactivityTimeout from "../../hooks/useInactivityTimeout";
import { MENU_ITEMS } from "../../constants/navigation";

export default function MainLayout({ title }) {
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { isWarning, countdown, handleContinue, handleLogout } = useInactivityTimeout();

  const getPageTitle = (path) => {
    const findLabel = (items) => {
      for (const item of items) {
        if (item.path === path) return item.label;
        if (item.children) {
          const childLabel = findLabel(item.children);
          if (childLabel) return childLabel;
        }
      }
      return null;
    };
    let label = findLabel(MENU_ITEMS);
    if (label) return label;
    if (path.startsWith("/users")) return "ຈັດການຜູ້ໃຊ້";
    if (path.startsWith("/dashboard")) return "ໜ້າຫຼັກ";
    return "ໜ້າຫຼັກ";
  };

  const getBreadcrumb = (path) => {
    for (const item of MENU_ITEMS) {
      if (item.path === path) return null; // top-level, no breadcrumb needed
      if (item.children) {
        const child = item.children.find(
          (c) => c.path === path || path.startsWith(c.path + "/")
        );
        if (child) return { parent: item.label, current: child.label };
      }
    }
    return null;
  };

  const resolvedTitle = title || getPageTitle(location.pathname);
  const breadcrumb = getBreadcrumb(location.pathname);

  return (
    <div className="flex h-screen overflow-hidden print:block print:h-auto print:overflow-visible">
      {/* Sidebar */}
      <div className="print:hidden">
        <Sidebar
          isMobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden print:block print:overflow-visible min-w-0">
        {/* Header */}
        <div className="print:hidden">
          <Header
            title={resolvedTitle}
            breadcrumb={breadcrumb}
            onMenuToggle={() => setMobileSidebarOpen((v) => !v)}
          />
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-8 print:p-0 print:bg-white print:overflow-visible">
          <Outlet />
        </main>
      </div>

      {/* Toast notifications */}
      <ToastContainer />

      {/* Session timeout warning */}
      <SessionTimeoutDialog
        isOpen={isWarning}
        countdown={countdown}
        onContinue={handleContinue}
        onLogout={handleLogout}
      />
    </div>
  );
}
