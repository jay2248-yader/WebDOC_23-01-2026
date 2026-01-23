import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { MENU_ITEMS } from '../../constants/navigation';

/**
 * MainLayout - Main application layout with Sidebar and Header
 * @param {Object} props
 * @param {string} props.title - Page title for header
 */
export default function MainLayout({ title }) {
  const location = useLocation();

  /* Helper to find label recursively from MENU_ITEMS */
  const getPageTitle = (path) => {
    // 1. Exact match search
    const findLabel = (items) => {
      for (const item of items) {
        // If current item matches path
        if (item.path === path) return item.label;
        
        // If has children, search deeper
        if (item.children) {
          const childLabel = findLabel(item.children);
          if (childLabel) return childLabel;
        }
      }
      return null;
    };

    // 2. Try to find precise label
    let label = findLabel(MENU_ITEMS);
    if (label) return label;

    // 3. Fallback logic for nested routes not explicitly in menu
    if (path.startsWith('/users')) return 'ຈັດການ User';
    if (path.startsWith('/dashboard')) return 'ໜ້າຫຼັກ';
    
    // Default
    return 'ໜ້າຫຼັກ';
  };

  const resolvedTitle = title || getPageTitle(location.pathname);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header title={resolvedTitle} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
