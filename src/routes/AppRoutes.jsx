import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authstore';
import LoginPage from '../pages/LoginPage';
import Dashboard from '../pages/Dashboard';
import MainLayout from '../components/layout/MainLayout';
import ErrorBoundary from '../components/common/ErrorBoundary';

const UserPage                 = lazy(() => import('../pages/UserPage'));
const BranchPage               = lazy(() => import('../pages/BranchPage'));
const BoardPage                = lazy(() => import('../pages/BoardPage'));
const DepartmentPage           = lazy(() => import('../pages/DepartmentPage'));
const PositionPage             = lazy(() => import('../pages/PositionPage'));
const DocumentCategoryPage     = lazy(() => import('../pages/DocumentCategoryPage'));
const DocumentCategoryDetailPage = lazy(() => import('../pages/DocumentCategoryDetailPage'));
const DocumentsPage            = lazy(() => import('../pages/DocumentsPage'));
const GroupappPage             = lazy(() => import('../pages/GroupappPage'));
const AllAppPage               = lazy(() => import('../pages/AllAppPage'));
const DocumentGroupPage        = lazy(() => import('../pages/DocumentGroupPage'));
const DocumentGroupDetailsPage = lazy(() => import('../pages/DocumentGroupDetailsPage'));
const DocumentPreviewPage      = lazy(() => import('../pages/DocumentPreviewPage'));

const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
  </div>
);

// Wraps each page with ErrorBoundary + Suspense
// → if one page crashes, sidebar/header remain intact and a retry UI appears
const PageWrapper = ({ children }) => (
  <ErrorBoundary>
    <Suspense fallback={<PageLoader />}>
      {children}
    </Suspense>
  </ErrorBoundary>
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
        <Route path="dashboard"              element={<PageWrapper><Dashboard /></PageWrapper>} />
        <Route path="branch"                 element={<PageWrapper><BranchPage /></PageWrapper>} />
        <Route path="board"                  element={<PageWrapper><BoardPage /></PageWrapper>} />
        <Route path="department"             element={<PageWrapper><DepartmentPage /></PageWrapper>} />
        <Route path="position"               element={<PageWrapper><PositionPage /></PageWrapper>} />
        <Route path="document-category"      element={<PageWrapper><DocumentCategoryPage /></PageWrapper>} />
        <Route path="document-category/detail" element={<PageWrapper><DocumentCategoryDetailPage /></PageWrapper>} />
        <Route path="documents"              element={<PageWrapper><DocumentsPage /></PageWrapper>} />
        <Route path="users"                  element={<PageWrapper><UserPage /></PageWrapper>} />
        <Route path="groupapp"               element={<PageWrapper><GroupappPage /></PageWrapper>} />
        <Route path="allapp"                 element={<PageWrapper><AllAppPage /></PageWrapper>} />
        <Route path="document-group"         element={<PageWrapper><DocumentGroupPage /></PageWrapper>} />
        <Route path="document-group-details" element={<PageWrapper><DocumentGroupDetailsPage /></PageWrapper>} />
        <Route path="document-preview"       element={<PageWrapper><DocumentPreviewPage /></PageWrapper>} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
