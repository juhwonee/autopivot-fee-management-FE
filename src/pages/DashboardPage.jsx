import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import './DashboardPage.css';

const DashboardPage = () => {
  const navigate = useNavigate();
  
  const [userName, setUserName] = useState('회원');
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
      console.error('토큰 파싱 실패:', error);
      setUserName('회원');
    }
  }, [navigate]);

  const fetchDashboardData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      
      const groupId = localStorage.getItem('currentGroupId');
      
      if (!groupId) {
        navigate('/select-group');
        return;
      }
      
      const response = await fetch(
        `https://seongchan-spring.store/api/groups/${groupId}/dashboard`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('대시보드 데이터를 가져오는데 실패했습니다.');
      }

      const data = await response.json();
      console.log('대시보드 데이터:', data);  // ✅ 디버깅용
      
      setDashboardData(data);
      setLastUpdated(new Date(data.lastUpdated));
      
    } catch (error) {
      console.error('데이터 로딩 오류:', error);
      alert('대시보드 데이터를 불러오는데 실패했습니다.');
      navigate('/select-group');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (localStorage.getItem('accessToken')) {
      fetchDashboardData(true);
    }
  }, [fetchDashboardData]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData(false);
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const handleManualRefresh = async () => {
    const groupId = localStorage.getItem('currentGroupId');
    
    try {
      setIsRefreshing(true);
      
      // ✅ 백엔드 캐시 갱신 요청
      await fetch(
        `https://seongchan-spring.store/api/groups/${groupId}/dashboard/refresh`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );
      
      await fetchDashboardData(false);
      
    } catch (error) {
      console.error('새로고침 오류:', error);
      alert('새로고침에 실패했습니다.');
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading || !dashboardData) {
    return (
      <MainLayout>
        <div className="loading-spinner">데이터를 불러오는 중입니다...</div>
      </MainLayout>
    );
  }

  const summaryData = {
    paidCount: dashboardData.paidMembers,
    unpaidCount: dashboardData.unpaidMembers,
    totalAmount: dashboardData.totalAmount
  };
  
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
    navigate(path);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return '방금 전';
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`;
    
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <MainLayout showSummary={true} summaryData={summaryData}>
      <div className="dashboard">
        <div className="dashboard__header">
          <div>
            <h2 className="dashboard__greeting">
              안녕하세요, {userName}님! 👋
            </h2>
            <p className="dashboard__group-name">
              📌 {dashboardData.groupName}
            </p>
          </div>
          
          <div className="dashboard__refresh">
            <Button
              variant="outline"
              size="small"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? '⏳ 갱신중...' : '🔄 새로고침'}
            </Button>
            {lastUpdated && (
              <span className="dashboard__last-updated">
                마지막 업데이트: {lastUpdated.toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            )}
          </div>
        </div>

        <Card className="dashboard__summary-card" padding="large">
          <div className="summary-card__header">
            <h3 className="summary-card__title">💰 이번 달 회비 현황</h3>
            <div className="summary-card__payment-rate">
              납부율: <strong>{dashboardData.paymentRate}%</strong>
            </div>
          </div>
          
          <div className="summary-card__stats">
            <div className="summary-card__stat summary-card__stat--success">
              <div className="summary-card__stat-icon">✅</div>
              <div className="summary-card__stat-content">
                <div className="summary-card__stat-label">납부 완료</div>
                <div className="summary-card__stat-value">
                  {dashboardData.paidMembers}명
                </div>
                <div className="summary-card__stat-amount">
                  {dashboardData.paidAmount?.toLocaleString() || 0}원
                </div>
              </div>
            </div>

            <div className="summary-card__stat summary-card__stat--warning">
              <div className="summary-card__stat-icon">⏳</div>
              <div className="summary-card__stat-content">
                <div className="summary-card__stat-label">미납</div>
                <div className="summary-card__stat-value">
                  {dashboardData.unpaidMembers}명
                </div>
                <div className="summary-card__stat-amount">
                  {dashboardData.unpaidAmount?.toLocaleString() || 0}원
                </div>
              </div>
            </div>

            <div className="summary-card__stat summary-card__stat--primary">
              <div className="summary-card__stat-icon">💵</div>
              <div className="summary-card__stat-content">
                <div className="summary-card__stat-label">총 회비</div>
                <div className="summary-card__stat-value">
                  {dashboardData.totalMembers}명
                </div>
                <div className="summary-card__stat-amount">
                  {dashboardData.totalAmount?.toLocaleString() || 0}원
                </div>
              </div>
            </div>
          </div>
        </Card>

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

        <div className="dashboard__section">
          <h3 className="dashboard__section-title">💳 최근 입금 내역</h3>
          
          {dashboardData.recentPayments && dashboardData.recentPayments.length > 0 ? (
            <div className="dashboard__activities">
              {dashboardData.recentPayments.map((payment) => (
                <Card 
                  key={payment.paymentId} 
                  className="activity-card"
                  padding="medium"
                >
                  <div className="activity-card__icon">
                    {payment.status === 'PAID' ? '✅' : '⏳'}
                  </div>
                  <div className="activity-card__content">
                    <p className="activity-card__message">
                      <strong>{payment.memberName}</strong>님이 
                      <strong> {payment.amount?.toLocaleString() || 0}원</strong>을 납부했습니다.
                    </p>
                    <span className="activity-card__time">
                      {formatTime(payment.paidAt)}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="empty-state" padding="large">
              <p className="empty-state__message">
                아직 입금 내역이 없습니다.
              </p>
            </Card>
          )}
        </div>

        <Card className="dashboard__progress-card" padding="large">
          <h3 className="progress-card__title">📊 납부 진행률</h3>
          <div className="progress-card__bar-container">
            <div 
              className="progress-card__bar"
              style={{ width: `${dashboardData.paymentRate}%` }}
            >
              <span className="progress-card__bar-label">
                {dashboardData.paymentRate}%
              </span>
            </div>
          </div>
          <div className="progress-card__info">
            <span>{dashboardData.paidMembers}명 납부</span>
            <span>{dashboardData.unpaidMembers}명 남음</span>
          </div>
        </Card>

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