import React from 'react';
import { useNavigate } from 'react-router-dom'; // 👈 [필수] 페이지 이동을 위한 훅

const DashboardPage = () => {
  const navigate = useNavigate(); // 👈 [필수] navigate 함수 생성

  return (
    <div style={{ padding: '20px' }}>
      <h1>대시보드</h1>
      <p>현재 그룹의 현황입니다.</p>
      
      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        {/* 멤버 목록 페이지로 이동하는 버튼 */}
        <button 
          onClick={() => navigate('/members')}
          style={{ padding: '10px 20px', cursor: 'pointer' }}
        >
          멤버 목록 관리
        </button>

        {/* (예시) 회비 관리 버튼 */}
        <button 
          onClick={() => navigate('/fees')}
          style={{ padding: '10px 20px', cursor: 'pointer' }}
        >
          회비 관리
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;