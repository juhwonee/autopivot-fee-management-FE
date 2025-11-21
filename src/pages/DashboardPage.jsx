import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Modal from '../components/common/Modal'; 
import './DashboardPage.css';

// ✨ groupId 유효성 검증 유틸리티 함수
const isValidGroupId = (groupId) => {
  return groupId && groupId !== 'undefined' && groupId !== 'null';
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [userName, setUserName] = useState('회원');
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 모달 상태 관리
  const [modalInfo, setModalInfo] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'alert',
    onConfirm: null
  });

  // 모달 닫기 함수
  const closeModal = () => {
    setModalInfo(prev => ({ ...prev, isOpen: false }));
  };

  // 모달 띄우는 헬퍼 함수
  const showModal = (title, message, onConfirm = null, type = 'alert') => {
    setModalInfo({
      isOpen: true,
      title,
      message,
      type,
      onConfirm
    });
  };

  // ✅ 최우선: URL에서 token 처리 및 인증/그룹 체크
  useEffect(() => {
    // 1. URL 파라미터에서 token 확인 (OAuth 콜백)
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      console.log('URL에서 token 발견, localStorage에 저장');
      localStorage.setItem('accessToken', tokenFromUrl);
      // URL에서 token 파라미터 제거 (보안)
      window.history.replaceState({}, '', '/dashboard');
    }

    // 2. 토큰 체크
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.log('토큰 없음, 로그인 페이지로 이동');
      navigate('/login', { replace: true });
      return;
    }

    // 3. groupId 체크 - 없으면 즉시 리다이렉트
    const currentGroupId = localStorage.getItem('currentGroupId');
    if (!isValidGroupId(currentGroupId)) {
      console.log('groupId 없음 또는 유효하지 않음, select-group으로 이동');
      navigate('/select-group', { replace: true });
      return;
    }

    // 4. 토큰에서 사용자 정보 파싱
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const decodedAscii = atob(base64);
      const utf8String = decodeURIComponent(
        Array.prototype.map.call(
          decodedAscii, 
          (c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join('')
      );
      const payload = JSON.parse(utf8String);
      setUserName(payload.name || '회원');
    } catch (error) {
      console.error('토큰 파싱 실패:', error);
      setUserName('회원');
    }
  }, [navigate, searchParams]);

  // 대시보드 데이터 가져오기
  const fetchDashboardData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      else setIsRefreshing(true);
      
      const groupId = localStorage.getItem('currentGroupId');
      
      // ✅ 개선된 groupId 검증
      if (!isValidGroupId(groupId)) {
        console.warn('유효하지 않은 groupId:', groupId);
        navigate('/select-group', { replace: true });
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

      if (!response.ok) throw new Error('데이터 로딩 실패');

      const data = await response.json();
      setDashboardData(data);
      setLastUpdated(new Date(data.lastUpdated));
      
    } catch (error) {
      console.error('데이터 로딩 오류:', error);
      showModal('오류 발생', '데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [navigate]);

  // 초기 데이터 로드
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const groupId = localStorage.getItem('currentGroupId');
    
    if (token && isValidGroupId(groupId)) {
      fetchDashboardData(true);
    }
  }, [fetchDashboardData]);

  // ✅ 자동 새로고침 (60초마다) - 개선된 검증
  useEffect(() => {
    const interval = setInterval(() => {
      const groupId = localStorage.getItem('currentGroupId');
      
      // ✅ 핵심 수정: 'undefined', 'null' 문자열도 체크
      if (isValidGroupId(groupId)) {
        fetchDashboardData(false);
      } else {
        console.warn('자동 새로고침 건너뜀: 유효하지 않은 groupId');
      }
    }, 60000);
    
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // ✅ 수동 새로고침 - 개선된 검증
  const handleManualRefresh = async () => {
    const groupId = localStorage.getItem('currentGroupId');
    
    if (!isValidGroupId(groupId)) {
      showModal('그룹 선택', '그룹을 먼저 선택해주세요.', () => {
        navigate('/select-group');
      });
      return;
    }
    
    try {
      setIsRefreshing(true);
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
      showModal('새로고침 실패', '데이터 갱신 중 오류가 발생했습니다.');
    } finally {
      setIsRefreshing(false);
    }
  };

  // 시간 포맷 함수
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return '방금 전';
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    return date.toLocaleDateString('ko-KR', { 
      month: 'numeric', 
      day: 'numeric' 
    });
  };

  // 로딩 화면
  if (isLoading || !dashboardData) {
    return (
      <div className="dashboard-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>데이터를 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  // 빠른 실행 메뉴
  const quickActions = [
    { 
      id: 'fees', 
      icon: '💰', 
      title: '회비 관리', 
      desc: '납부 현황 확인', 
      path: '/fees' 
    },
    { 
      id: 'members', 
      icon: '👥', 
      title: '멤버 목록', 
      desc: '우리 팀원 보기', 
      path: '/members' 
    },
    { 
      id: 'fixGroup', 
      icon: '📢', 
      title: '그룹 정보', 
      desc: '내 그룹 확인하기', 
      path: '/notices' 
    }
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-content">
        
        {/* 1. 헤더 영역 */}
        <div className="dashboard-header">
          <div className="header-greeting">
            <h2>반가워요, {userName}님! 👋</h2>
            <p>
              <span className="group-badge">GROUP</span>
              {dashboardData.groupName}
            </p>
          </div>
          
          <div className="refresh-container">
            <button 
              className="refresh-btn" 
              onClick={handleManualRefresh} 
              disabled={isRefreshing}
            >
              <span className={`refresh-icon ${isRefreshing ? 'spinning' : ''}`}>
                🔄
              </span>
              새로고침
            </button>
            {lastUpdated && (
              <span className="last-updated">
                {lastUpdated.toLocaleTimeString('ko-KR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })} 기준
              </span>
            )}
          </div>
        </div>

        {/* 2. 히어로 카드 (납부율 & 총액) */}
        <div className="hero-card">
          <div className="hero-header">
            <span className="hero-title">이번 달 회비 납부율</span>
          </div>
          
          <div className="hero-content">
            <div className="payment-rate-big">
              {dashboardData.paymentRate}%
            </div>
            <div className="progress-container">
              <div 
                className="progress-bar" 
                style={{ width: `${dashboardData.paymentRate}%` }}
              ></div>
            </div>
            
            <div className="hero-stats-row">
              <div className="stat-pill">
                <label>납부 완료</label>
                <span>{dashboardData.paidMembers}명</span>
              </div>
              <div className="stat-pill">
                <label>미납</label>
                <span>{dashboardData.unpaidMembers}명</span>
              </div>
              <div className="stat-pill" style={{ background: 'rgba(255,255,255,0.3)' }}>
                <label>총 모인 금액</label>
                <span>{dashboardData.totalAmount?.toLocaleString()}원</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. 빠른 실행 */}
        <div className="quick-actions-grid">
          {quickActions.map((action) => (
            <div 
              key={action.id} 
              className="action-card"
              onClick={() => navigate(action.path)}
            >
              <span className="action-icon">{action.icon}</span>
              <span className="action-title">{action.title}</span>
              <span className="action-desc">{action.desc}</span>
            </div>
          ))}
        </div>

        {/* 4. 하단 정보 그리드 */}
        <div className="dashboard-bottom-grid">
          
          {/* 상세 현황 패널 */}
          <div className="glass-panel">
            <h3 className="panel-title">상세 현황</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="activity-item">
                <div className="activity-icon">💵</div>
                <div className="activity-info">
                  <p className="activity-msg">총 목표 금액</p>
                  <strong>
                    {(dashboardData.totalMembers * (dashboardData.fee || 0))
                      ?.toLocaleString() || 0}원
                  </strong>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon">👥</div>
                <div className="activity-info">
                  <p className="activity-msg">전체 멤버</p>
                  <strong>{dashboardData.totalMembers}명</strong>
                </div>
              </div>
            </div>
            
            {/* AI 비서 버튼 */}
            <button 
              className="refresh-btn" 
              style={{ 
                width: '100%', 
                justifyContent: 'center', 
                marginTop: '20px', 
                background: '#f1f5f9', 
                border: 'none' 
              }}
              onClick={() => showModal(
                '준비 중', 
                '총총이는 열심히 개발 중이에요! 🤖'
              )}
            >
              🤖 AI 비서 총총이에게 물어보기
            </button>
          </div>

          {/* 최근 입금 내역 패널 */}
          <div className="glass-panel">
            <h3 className="panel-title">최근 입금 내역</h3>
            
            {dashboardData.recentPayments && dashboardData.recentPayments.length > 0 ? (
              <div className="activity-list">
                {dashboardData.recentPayments.map((payment) => (
                  <div key={payment.paymentId} className="activity-item">
                    <div className="activity-icon">
                      {payment.status === 'PAID' ? '✅' : '⏳'}
                    </div>
                    <div className="activity-info">
                      <p className="activity-msg">
                        <strong>{payment.memberName}</strong>님이 입금했습니다.
                      </p>
                      <span className="activity-time">
                        {formatTime(payment.paidAt)}
                      </span>
                    </div>
                    <div style={{ fontWeight: '700', color: '#3b82f6' }}>
                      {payment.amount?.toLocaleString()}원
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>아직 입금 내역이 없어요.</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* 모달 컴포넌트 */}
      <Modal 
        isOpen={modalInfo.isOpen}
        onClose={closeModal}
        onConfirm={modalInfo.onConfirm}
        title={modalInfo.title}
        message={modalInfo.message}
        type={modalInfo.type}
      />
    </div>
  );
};

export default DashboardPage;