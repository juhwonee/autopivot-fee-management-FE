import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LoginPage from './pages/LoginPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import GroupSelectPage from './pages/GroupSelectPage';
import CreateGroupPage from './pages/CreateGroupPage';
import DashboardPage from './pages/DashboardPage';
import MembersPage from './pages/MembersPage';
import GroupSettingsPage from './pages/GroupSettingsPage';
import FeesPage from './pages/FeesPage';

// Protected Route 컴포넌트 - 로그인 필요
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('accessToken');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Dashboard Protected Route - 로그인 + 그룹 선택 필요
const DashboardProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('accessToken');
  const groupId = localStorage.getItem('currentGroupId');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  if (!groupId) {
    return <Navigate to="/select-group" replace />;
  }
  
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        {/* 공개 라우트 */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />

        {/* 보호된 라우트 - 로그인만 필요 */}
        <Route 
          path="/select-group" 
          element={
            <ProtectedRoute>
              <GroupSelectPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/create-group" 
          element={
            <ProtectedRoute>
              <CreateGroupPage />
            </ProtectedRoute>
          } 
        />

        {/* 보호된 라우트 - 로그인 + 그룹 선택 필요 */}
        <Route 
          path="/dashboard" 
          element={
            <DashboardProtectedRoute>
              <DashboardPage />
            </DashboardProtectedRoute>
          } 
        />
        
        <Route 
          path="/members" 
          element={
            <DashboardProtectedRoute>
              <MembersPage />
            </DashboardProtectedRoute>
          } 
        />

        <Route 
          path="/group-settings" 
          element={
            <DashboardProtectedRoute>
              <GroupSettingsPage />
            </DashboardProtectedRoute>
          } 
        />

        <Route 
          path="/fees" 
          element={
            <DashboardProtectedRoute>
              <FeesPage />
            </DashboardProtectedRoute>
          } 
        />

        {/* 404 페이지 */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;