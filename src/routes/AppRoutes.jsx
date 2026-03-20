import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authstore';
import LoginPage from '../pages/LoginPage';
import Dashboard from '../pages/Dashboard';
import MainLayout from '../components/layout/MainLayout';

const UserPage               = lazy(() => import('../pages/UserPage'));
const BranchPage             = lazy(() => import('../pages/BranchPage'));
const BoardPage              = lazy(() => import('../pages/BoardPage'));
const DepartmentPage         = lazy(() => import('../pages/DepartmentPage'));
const PositionPage           = lazy(() => import('../pages/PositionPage'));
const DocumentCategoryPage   = lazy(() => import('../pages/DocumentCategoryPage'));
const DocumentsPage          = lazy(() => import('../pages/DocumentsPage'));
const GroupappPage           = lazy(() => import('../pages/GroupappPage'));
const AllAppPage             = lazy(() => import('../pages/AllAppPage'));
const DocumentGroupPage      = lazy(() => import('../pages/DocumentGroupPage'));
const DocumentGroupDetailsPage = lazy(() => import('../pages/DocumentGroupDetailsPage'));
const DocumentPreviewPage    = lazy(() => import('../pages/DocumentPreviewPage'));

const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
  </div>
);

const AppRoutes = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthed());

  return (
    <Routes>
      {/* Login Route */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginPage />
          )
        }
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <MainLayout />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="branch"                 element={<Suspense fallback={<PageLoader />}><BranchPage /></Suspense>} />
        <Route path="board"                  element={<Suspense fallback={<PageLoader />}><BoardPage /></Suspense>} />
        <Route path="department"             element={<Suspense fallback={<PageLoader />}><DepartmentPage /></Suspense>} />
        <Route path="position"               element={<Suspense fallback={<PageLoader />}><PositionPage /></Suspense>} />
        <Route path="document-category"      element={<Suspense fallback={<PageLoader />}><DocumentCategoryPage /></Suspense>} />
        <Route path="documents"              element={<Suspense fallback={<PageLoader />}><DocumentsPage /></Suspense>} />
        <Route path="users"                  element={<Suspense fallback={<PageLoader />}><UserPage /></Suspense>} />
        <Route path="groupapp"               element={<Suspense fallback={<PageLoader />}><GroupappPage /></Suspense>} />
        <Route path="allapp"                 element={<Suspense fallback={<PageLoader />}><AllAppPage /></Suspense>} />
        <Route path="document-group"         element={<Suspense fallback={<PageLoader />}><DocumentGroupPage /></Suspense>} />
        <Route path="document-group-details" element={<Suspense fallback={<PageLoader />}><DocumentGroupDetailsPage /></Suspense>} />
        <Route path="document-preview"       element={<Suspense fallback={<PageLoader />}><DocumentPreviewPage /></Suspense>} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
