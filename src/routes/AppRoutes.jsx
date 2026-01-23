import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authstore';
import LoginPage from '../pages/LoginPage';
import Dashboard from '../pages/Dashboard';
import UserPage from '../pages/UserPage';
import BranchPage from '../pages/BranchPage';
import BoardPage from '../pages/BoardPage';
import DepartmentPage from '../pages/DepartmentPage';
import PositionPage from '../pages/PositionPage';
import DocumentCategoryPage from '../pages/DocumentCategoryPage';
import MainLayout from '../components/layout/MainLayout';

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

      {/* Protected Routes - ต้อง Login ก่อน */}
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
        <Route path="branch" element={<BranchPage />} />
        <Route path="board" element={<BoardPage />} />
        <Route path="department" element={<DepartmentPage />} />
        <Route path="position" element={<PositionPage />} />
        <Route path="document-category" element={<DocumentCategoryPage />} />
        <Route path="users" element={<UserPage />} />
        {/* Add more routes here in the future */}
      </Route>

      {/* 404 - Redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
