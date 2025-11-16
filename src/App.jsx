import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import GroupSelectPage from './pages/GroupSelectPage';
import CreateGroupPage from './pages/CreateGroupPage';
import DashboardPage from './pages/DashboardPage';
// ... 기타 페이지들 (FeesPage, MembersPage, NoticesPage 등)

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
      <Routes>
        {/* 공개 라우트 */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />  {/* ⭐ 기존 경로 유지 */}

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

        {/* 기타 대시보드 관련 페이지들도 DashboardProtectedRoute 사용 */}
        {/* 
        <Route 
          path="/fees" 
          element={
            <DashboardProtectedRoute>
              <FeesPage />
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
          path="/notices" 
          element={
            <DashboardProtectedRoute>
              <NoticesPage />
            </DashboardProtectedRoute>
          } 
        />
        */}

        {/* 404 페이지 */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;