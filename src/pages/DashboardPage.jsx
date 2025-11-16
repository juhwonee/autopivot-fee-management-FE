import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import './DashboardPage.css';

// API 통신 및 데이터 타입을 위한 인터페이스/타입 정의 (주석 처리)
/*
interface DashboardSummary {
  paidCount: number;
  unpaidCount: number;
  totalAmount: number;
  unpaidMembers: string[];
}

interface Activity {
  id: number;
  type: 'payment' | 'member' | 'notice';
  message: string;
  time: string;
  icon: string;
}

interface DashboardData {
  summary: DashboardSummary;
  recentActivities: Activity[];
}
*/

const DashboardPage = () => {
  const navigate = useNavigate();
  
  // 1. 상태(State) 초기화: 초기값을 null 또는 빈 객체로 설정하여 데이터 로딩 상태를 관리합니다.
  const [userName, setUserName] = useState('회원');
  const [dashboardData, setDashboardData] = useState(null); // 초기 더미 데이터 제거
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태 추가

  // --- JWT 파싱 및 사용자 이름 설정 (이전과 동일) ---
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const decodedAscii = atob(base64);
      const utf8String = decodeURIComponent(
        Array.prototype.map.call(decodedAscii, (c) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join('')
      );
      const payload = JSON.parse(utf8String);
      
      setUserName(payload.name || '회원');
    } catch (error) {
      console.error('토큰 파싱/인코딩 실패:', error);
      setUserName('회원');
    }
  }, [navigate]);
  // ---------------------------------------------------

  // 2. API 통신 로직 추가: 대시보드 데이터를 백엔드에서 가져옵니다.
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // ⭐ Spring API 엔드포인트로 변경 예정: 예시 URL입니다.
        const response = await fetch('/api/dashboard', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });

        if (!response.ok) {
          throw new Error('대시보드 데이터를 가져오는데 실패했습니다.');
        }

        const data = await response.json();
        setDashboardData(data); // 가져온 실제 데이터로 상태 업데이트
      } catch (error) {
        console.error('데이터 로딩 오류:', error);
        // 오류 발생 시 사용자에게 알림 또는 오류 상태 설정 가능
      } finally {
        setIsLoading(false);
      }
    };

    // 토큰이 있을 때만 데이터 로드 실행
    if (localStorage.getItem('accessToken')) {
      fetchDashboardData();
    }
  }, []); // 빈 배열: 컴포넌트 마운트 시 한 번만 실행

  // 3. 로딩 상태 처리
  if (isLoading || !dashboardData) {
    return (
      <MainLayout>
        <div className="loading-spinner">데이터를 불러오는 중입니다...</div>
      </MainLayout>
    );
  }
  
  // --- 빠른 실행 메뉴 및 핸들러는 그대로 유지 ---
  const quickActions = [
    // ... 기존 quickActions 데이터
    {
      id: 'fees',
      icon: '💰',
      title: '회비 확인하기',
      description: '누가 냈는지 바로 확인!',
      path: '/fees',
      color: '#007bff'
    },
    {
      id: 'members',
      icon: '👥',
      title: '우리 팀 멤버 보기',
      description: '멤버 정보 한눈에!',
      path: '/members',
      color: '#28a745'
    },
    {
      id: 'notices',
      icon: '📢',
      title: '공지사항 확인',
      description: '최신 소식 놓치지 마세요!',
      path: '/notices',
      color: '#ffc107'
    }
  ];

  const handleQuickAction = (path) => {
    navigate(path); // 실제로 이동하도록 수정하거나, alert 유지 가능
    // alert(`${path} 페이지로 이동합니다. (구현 예정)`);
  };

  return (
    // MainLayout에 전달하는 summaryData도 API에서 가져온 dashboardData.summary를 사용합니다.
    <MainLayout showSummary={true} summaryData={dashboardData.summary}>
      <div className="dashboard">
        {/* 환영 메시지 */}
        <div className="dashboard__header">
          <h2 className="dashboard__greeting">
            안녕하세요, {userName}님! 👋
          </h2>
        </div>

        {/* 이번 달 요약: API 데이터 사용 */}
        <Card className="dashboard__summary-card" padding="large">
          <div className="summary-card__header">
            <h3 className="summary-card__title">💰 이번 달 회비 현황</h3>
          </div>
          
          <div className="summary-card__stats">
            <div className="summary-card__stat summary-card__stat--success">
              <div className="summary-card__stat-icon">✅</div>
              <div className="summary-card__stat-content">
                <div className="summary-card__stat-label">납부 완료</div>
                <div className="summary-card__stat-value">
                  {dashboardData.summary.paidCount}명
                </div>
              </div>
            </div>

            <div className="summary-card__stat summary-card__stat--warning">
              <div className="summary-card__stat-icon">⏳</div>
              <div className="summary-card__stat-content">
                <div className="summary-card__stat-label">미납</div>
                <div className="summary-card__stat-value">
                  {dashboardData.summary.unpaidCount}명
                </div>
              </div>
            </div>

            <div className="summary-card__stat summary-card__stat--primary">
              <div className="summary-card__stat-icon">💵</div>
              <div className="summary-card__stat-content">
                <div className="summary-card__stat-label">총 회비</div>
                <div className="summary-card__stat-value">
                  {dashboardData.summary.totalAmount.toLocaleString()}원
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 빠른 실행 메뉴 (데이터 변동 없음) */}
        <div className="dashboard__section">
          <h3 className="dashboard__section-title">🎯 빠른 실행 메뉴</h3>
          
          <div className="dashboard__quick-actions">
            {quickActions.map((action) => (
              <Card
                key={action.id}
                className="quick-action-card"
                hover={true}
                onClick={() => handleQuickAction(action.path)}
              >
                <div 
                  className="quick-action-card__icon"
                  style={{ color: action.color }}
                >
                  {action.icon}
                </div>
                <h4 className="quick-action-card__title">{action.title}</h4>
                <p className="quick-action-card__description">
                  {action.description}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* 최근 활동 내역: API 데이터 사용 */}
        <div className="dashboard__section">
          <h3 className="dashboard__section-title">📋 최근 활동 내역</h3>
          
          <div className="dashboard__activities">
            {dashboardData.recentActivities.map((activity) => (
              <Card 
                key={activity.id} 
                className="activity-card"
                padding="medium"
              >
                <div className="activity-card__icon">{activity.icon}</div>
                <div className="activity-card__content">
                  <p className="activity-card__message">{activity.message}</p>
                  <span className="activity-card__time">{activity.time}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA 버튼 */}
        <div className="dashboard__cta">
          <Button 
            variant="primary" 
            size="large"
            icon="💬"
            onClick={() => alert('챗봇 기능 구현 예정!')}
          >
            챗봇에게 물어보기
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default DashboardPage;