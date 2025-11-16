import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import './DashboardPage.css';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('회원');
  
  // ✅ 대괄호 추가!
  const [dashboardData] = useState({
    summary: {
      paidCount: 8,
      unpaidCount: 2,
      totalAmount: 300000,
      unpaidMembers: ['박민수', '최수진']
    },
    recentActivities: [
      {
        id: 1,
        type: 'payment',
        message: '이영희님 회비 납부 완료',
        time: '2024.11.05 오후 3시',
        icon: '✅'
      },
      {
        id: 2,
        type: 'member',
        message: '새 멤버 김영수님 등록됨',
        time: '2024.11.04 오전 10시',
        icon: '👤'
      },
      {
        id: 3,
        type: 'notice',
        message: '11월 회비 납부 안내 공지',
        time: '2024.11.01 오전 9시',
        icon: '📢'
      }
    ]
  });

  // 로그인 체크 및 사용자 이름 추출
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    // JWT 토큰에서 이름 추출
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
      console.log('로그인 정보 (복원):', payload);
    } catch (error) {
      console.error('토큰 파싱/인코딩 실패::', error);
      setUserName('회원');
    }
  }, [navigate]);

  const quickActions = [
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
    alert(`${path} 페이지로 이동합니다. (구현 예정)`);
  };

  return (
    <MainLayout showSummary={true} summaryData={dashboardData.summary}>
      <div className="dashboard">
        {/* 환영 메시지 */}
        <div className="dashboard__header">
          <h2 className="dashboard__greeting">
            안녕하세요, {userName}님! 👋
          </h2>
        </div>

        {/* 이번 달 요약 */}
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

        {/* 빠른 실행 메뉴 */}
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

        {/* 최근 활동 내역 */}
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