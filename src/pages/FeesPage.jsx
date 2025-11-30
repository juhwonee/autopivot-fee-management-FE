import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './FeesPage.css';

// 🎨 SVG 아이콘 컴포넌트들
const Icons = {
  ArrowLeft: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5"/>
      <path d="M12 19l-7-7 7-7"/>
    </svg>
  ),
  
  Refresh: ({ className }) => (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
      <path d="M3 3v5h5"/>
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
      <path d="M16 16h5v5"/>
    </svg>
  ),
  
  Calendar: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  
  CheckCircle: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22,4 12,14.01 9,11.01"/>
    </svg>
  ),
  
  AlertCircle: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  
  XCircle: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="15" y1="9" x2="9" y2="15"/>
      <line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  ),
  
  MessageSquare: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  
  Send: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  ),
  
  UserCheck: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <polyline points="16 11 18 13 22 9"/>
    </svg>
  ),
  
  Coins: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6"/>
      <path d="M18.09 10.37A6 6 0 1 1 10.34 18"/>
      <path d="M7 6h1v4"/>
      <path d="m16.71 13.88.7.71-2.82 2.82"/>
    </svg>
  ),
  
  Target: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  
  Users: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  
  TrendingUp: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  
  X: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  
  Phone: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  ),

  Play: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  ),

  Info: () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="16" x2="12" y2="12"/>
      <line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  ),

  Bell: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  )
};

const FeesPage = () => {
  const navigate = useNavigate();
  
  const [feesData, setFeesData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [availablePeriods, setAvailablePeriods] = useState([]);
  const [activeCycle, setActiveCycle] = useState(null);
  const [currentGroupId, setCurrentGroupId] = useState(null);
  
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [smsMessage, setSmsMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  const [isBulkSmsModalOpen, setIsBulkSmsModalOpen] = useState(false);
  const [bulkSmsMessage, setBulkSmsMessage] = useState('');
  
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmMember, setConfirmMember] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);

  // groupId 초기화
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    const groupId = localStorage.getItem('currentGroupId');
    if (!groupId || groupId === 'undefined' || groupId === 'null') {
      navigate('/select-group', { replace: true });
      return;
    }

    setCurrentGroupId(groupId);
  }, [navigate]);

  // 기간 목록 초기화
  useEffect(() => {
    const periods = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      periods.push({
        value: `${year}-${month}`,
        label: `${year}년 ${date.getMonth() + 1}월`
      });
    }
    setAvailablePeriods(periods);
    setSelectedPeriod(periods[0].value);
  }, []);

  const fetchActiveCycle = useCallback(async (groupId) => {
    if (!groupId) return;
    
    try {
      const response = await fetch(
        `https://seongchan-spring.store/api/groups/${groupId}/payment-cycles/active`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          setActiveCycle({ hasActiveCycle: false });
          return;
        }
        throw new Error('수금 기간 조회 실패');
      }

      const data = await response.json();
      setActiveCycle(data);
    } catch (error) {
      console.error('수금 기간 조회 오류:', error);
      setActiveCycle({ hasActiveCycle: false });
    }
  }, []);

  const fetchFeesData = useCallback(async (groupId, showLoading = true) => {
    if (!groupId || !selectedPeriod) return;
    
    try {
      if (showLoading) setIsLoading(true);
      else setIsRefreshing(true);
      
      const response = await fetch(
        `https://seongchan-spring.store/api/groups/${groupId}/fees?period=${selectedPeriod}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );

      if (!response.ok) throw new Error('데이터 로딩 실패');

      const data = await response.json();
      setFeesData(data);
      await fetchActiveCycle(groupId);
      
    } catch (error) {
      console.error('회비 데이터 로딩 오류:', error);
      toast.error('회비 데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedPeriod, fetchActiveCycle]);

  useEffect(() => {
    if (currentGroupId && selectedPeriod) {
      fetchFeesData(currentGroupId, true);
    }
  }, [currentGroupId, selectedPeriod, fetchFeesData]);

  const handleRefresh = () => {
    if (currentGroupId) {
      fetchFeesData(currentGroupId, false);
      toast.success('새로고침 완료!');
    }
  };

  const openSmsModal = (member) => {
    setSelectedMember(member);
    const unpaidAmount = (feesData?.monthlyFee || 0) - (member.paidAmount || 0);
    const defaultMsg = `${member.name}님, ${selectedPeriod.replace('-', '년 ')}월 회비 ${unpaidAmount.toLocaleString()}원 납부 부탁드립니다.`;
    setSmsMessage(defaultMsg);
    setIsSmsModalOpen(true);
  };

  const handleSendSms = async () => {
    if (!selectedMember || !smsMessage.trim()) {
      toast.error('메시지를 입력해주세요.');
      return;
    }
    
    setIsSending(true);
    
    try {
      const response = await fetch('https://seongchan-spring.store/api/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          memberId: selectedMember.memberId,
          phone: selectedMember.phone,
          message: smsMessage
        })
      });

      if (!response.ok) throw new Error('SMS 발송 실패');

      toast.success(`${selectedMember.name}님에게 메시지를 보냈습니다.`);
      setIsSmsModalOpen(false);
      setSmsMessage('');
      setSelectedMember(null);
      
    } catch (error) {
      console.error('SMS 발송 오류:', error);
      toast.error('메시지 발송에 실패했습니다.');
    } finally {
      setIsSending(false);
    }
  };

  const openBulkSmsModal = () => {
    const unpaidMembersList = feesData?.members?.filter(m => m.status !== 'PAID') || [];
    if (unpaidMembersList.length === 0) {
      toast.error('미납 회원이 없습니다.');
      return;
    }
    const defaultMsg = `${selectedPeriod.replace('-', '년 ')}월 회비 납부 부탁드립니다.`;
    setBulkSmsMessage(defaultMsg);
    setIsBulkSmsModalOpen(true);
  };

  const handleBulkSendSms = async () => {
    if (!bulkSmsMessage.trim()) {
      toast.error('메시지를 입력해주세요.');
      return;
    }
    
    const unpaidMembersList = feesData?.members?.filter(m => m.status !== 'PAID') || [];
    
    setIsSending(true);
    
    try {
      const response = await fetch('https://seongchan-spring.store/api/sms/send-bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          memberIds: unpaidMembersList.map(m => m.memberId),
          message: bulkSmsMessage
        })
      });

      if (!response.ok) throw new Error('일괄 SMS 발송 실패');

      toast.success(`${unpaidMembersList.length}명에게 메시지를 보냈습니다.`);
      setIsBulkSmsModalOpen(false);
      setBulkSmsMessage('');
      
    } catch (error) {
      console.error('일괄 SMS 발송 오류:', error);
      toast.error('일괄 메시지 발송에 실패했습니다.');
    } finally {
      setIsSending(false);
    }
  };

  const openConfirmModal = (member) => {
    if (!member.paymentId) {
      toast.error('이 기간의 수금이 시작되지 않았습니다.');
      return;
    }
    setConfirmMember(member);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmPayment = async () => {
    if (!confirmMember) return;
    
    setIsConfirming(true);
    
    try {
      const response = await fetch(
        `https://seongchan-spring.store/api/payments/${confirmMember.paymentId}/confirm`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );

      if (!response.ok) throw new Error('납부 확인 실패');

      toast.success(`${confirmMember.name}님의 납부를 확인했습니다.`);
      setIsConfirmModalOpen(false);
      setConfirmMember(null);
      if (currentGroupId) {
        fetchFeesData(currentGroupId, false);
      }
      
    } catch (error) {
      console.error('납부 확인 오류:', error);
      toast.error('납부 확인에 실패했습니다.');
    } finally {
      setIsConfirming(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PAID': return <Icons.CheckCircle />;
      case 'OVERDUE': return <Icons.XCircle />;
      default: return <Icons.AlertCircle />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PAID': return '납부 완료';
      case 'OVERDUE': return '연체';
      default: return '미납';
    }
  };

  if (isLoading) {
    return (
      <div className="fees-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>회비 데이터를 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  const hasNoCycleData = !feesData?.members || feesData.members.length === 0;
  const isCurrentPeriod = selectedPeriod === availablePeriods[0]?.value;
  const hasNoActiveCycle = !activeCycle?.hasActiveCycle;
  const unpaidMembers = feesData?.members?.filter(m => m.status !== 'PAID') || [];
  const paidMembers = feesData?.members?.filter(m => m.status === 'PAID') || [];

  return (
    <div className="fees-page">
      <div className="fees-content">
        
        {/* 헤더 */}
        <div className="fees-header">
          <div className="header-left">
            <button className="back-btn" onClick={() => navigate('/dashboard')}>
              <Icons.ArrowLeft />
            </button>
            <div className="header-title">
              <h2>회비 관리</h2>
              <p>{feesData?.groupName}</p>
            </div>
          </div>
          
          <div className="header-actions">
            <div className="period-selector">
              <Icons.Calendar />
              <select 
                value={selectedPeriod} 
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                {availablePeriods.map(period => (
                  <option key={period.value} value={period.value}>
                    {period.label}
                  </option>
                ))}
              </select>
            </div>
            
            <button 
              className="refresh-btn" 
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <Icons.Refresh className={isRefreshing ? 'spinning' : ''} />
            </button>
          </div>
        </div>

        {/* 수금 없음 안내 */}
        {hasNoCycleData && isCurrentPeriod && hasNoActiveCycle ? (
          <div className="no-cycle-notice">
            <div className="notice-content">
              <Icons.Info />
              <h3>아직 수금이 시작되지 않았어요</h3>
              <p>
                대시보드에서 "회비 수금 시작" 버튼을 눌러<br/>
                이번 달 회비 수금을 시작해주세요.
              </p>
              <button 
                className="go-dashboard-btn"
                onClick={() => navigate('/dashboard')}
              >
                <Icons.Play />
                대시보드로 이동
              </button>
            </div>
          </div>
        ) : hasNoCycleData ? (
          <div className="no-cycle-notice">
            <div className="notice-content">
              <Icons.Info />
              <h3>해당 기간의 수금 기록이 없어요</h3>
              <p>
                {selectedPeriod.replace('-', '년 ')}월에는<br/>
                수금이 진행되지 않았습니다.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* 히어로 카드 */}
            <div className="stats-hero">
              <div className="stats-hero-main">
                {activeCycle?.hasActiveCycle && activeCycle.period === selectedPeriod && (
                  <span className="cycle-badge-small">🟢 수금 진행 중</span>
                )}
                
                <div className="hero-label">
                  {selectedPeriod.replace('-', '년 ')}월 납부율
                </div>
                <div className="hero-rate">{feesData?.paymentRate || 0}%</div>
                <div className="hero-progress">
                  <div 
                    className="hero-progress-bar" 
                    style={{ width: `${feesData?.paymentRate || 0}%` }}
                  />
                </div>
                <div className="hero-detail">
                  <span className="paid-count">{feesData?.paidMembers || 0}명 납부</span>
                  <span className="divider">/</span>
                  <span className="total-count">총 {feesData?.totalMembers || 0}명</span>
                </div>
              </div>
            </div>

            {/* ✅ 미납자 알림 버튼 - 히어로 카드 밖으로 분리 */}
            {unpaidMembers.length > 0 && (
              <div className="bulk-action-container">
                <button className="bulk-sms-btn" onClick={openBulkSmsModal}>
                  <Icons.Bell />
                  <span>미납자 전체 알림 보내기</span>
                  <span className="bulk-count">{unpaidMembers.length}명</span>
                </button>
              </div>
            )}

            {/* 통계 카드 */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon stat-icon--collected">
                  <Icons.Coins />
                </div>
                <div className="stat-info">
                  <span className="stat-label">모인 금액</span>
                  <strong className="stat-value">
                    {feesData?.totalCollected?.toLocaleString() || 0}원
                  </strong>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon stat-icon--target">
                  <Icons.Target />
                </div>
                <div className="stat-info">
                  <span className="stat-label">목표 금액</span>
                  <strong className="stat-value">
                    {feesData?.targetAmount?.toLocaleString() || 0}원
                  </strong>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon stat-icon--fee">
                  <Icons.TrendingUp />
                </div>
                <div className="stat-info">
                  <span className="stat-label">월 회비</span>
                  <strong className="stat-value">
                    {feesData?.monthlyFee?.toLocaleString() || 0}원
                  </strong>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon stat-icon--members">
                  <Icons.Users />
                </div>
                <div className="stat-info">
                  <span className="stat-label">미납 인원</span>
                  <strong className="stat-value stat-value--warning">
                    {feesData?.unpaidMembers || 0}명
                  </strong>
                </div>
              </div>
            </div>

            {/* 멤버 목록 */}
            <div className="members-grid">
              {/* 미납 회원 */}
              <div className="members-section members-section--unpaid">
                <div className="section-header">
                  <h3>미납 회원</h3>
                  <span className="section-count">{unpaidMembers.length}명</span>
                </div>
                
                {unpaidMembers.length > 0 ? (
                  <div className="members-list">
                    {unpaidMembers.map(member => (
                      <div key={member.memberId} className="member-card member-card--unpaid">
                        <div className="member-main">
                          <div className="member-status">
                            {getStatusIcon(member.status)}
                          </div>
                          <div className="member-info">
                            <span className="member-name">{member.name}</span>
                            <span className="member-phone">
                              <Icons.Phone />
                              {member.phone || '번호 없음'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="member-payment">
                          <div className="payment-amount">
                            <span className="paid-amount">
                              {member.paidAmount?.toLocaleString() || 0}원
                            </span>
                            <span className="amount-divider">/</span>
                            <span className="total-amount">
                              {feesData?.monthlyFee?.toLocaleString()}원
                            </span>
                          </div>
                          <span className={`status-badge status-badge--${member.status.toLowerCase()}`}>
                            {getStatusText(member.status)}
                          </span>
                        </div>
                        
                        <div className="member-actions">
                          <button 
                            className="action-btn action-btn--sms"
                            onClick={() => openSmsModal(member)}
                            title="메시지 보내기"
                          >
                            <Icons.MessageSquare />
                          </button>
                          <button 
                            className="action-btn action-btn--confirm"
                            onClick={() => openConfirmModal(member)}
                            title="납부 확인"
                          >
                            <Icons.UserCheck />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <Icons.CheckCircle />
                    <p>모든 회원이 납부를 완료했어요!</p>
                  </div>
                )}
              </div>

              {/* 납부 완료 */}
              <div className="members-section members-section--paid">
                <div className="section-header">
                  <h3>납부 완료</h3>
                  <span className="section-count">{paidMembers.length}명</span>
                </div>
                
                {paidMembers.length > 0 ? (
                  <div className="members-list">
                    {paidMembers.map(member => (
                      <div key={member.memberId} className="member-card member-card--paid">
                        <div className="member-main">
                          <div className="member-status">
                            {getStatusIcon(member.status)}
                          </div>
                          <div className="member-info">
                            <span className="member-name">{member.name}</span>
                            <span className="member-date">
                              {member.paidAt ? new Date(member.paidAt).toLocaleDateString('ko-KR', {
                                month: 'numeric',
                                day: 'numeric'
                              }) + ' 납부' : ''}
                            </span>
                          </div>
                        </div>
                        
                        <div className="member-payment">
                          <span className="paid-full">
                            {member.paidAmount?.toLocaleString()}원
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>아직 납부한 회원이 없어요.</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* 개인 SMS 모달 */}
      {isSmsModalOpen && selectedMember && (
        <div className="modal-overlay" onClick={() => setIsSmsModalOpen(false)}>
          <div className="modal-content sms-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>메시지 보내기</h3>
              <button className="modal-close" onClick={() => setIsSmsModalOpen(false)}>
                <Icons.X />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="recipient-info">
                <span className="recipient-name">{selectedMember.name}</span>
                <span className="recipient-phone">{selectedMember.phone}</span>
              </div>
              
              <div className="unpaid-info">
                <span className="label">미납 금액</span>
                <span className="amount">
                  {((feesData?.monthlyFee || 0) - (selectedMember.paidAmount || 0)).toLocaleString()}원
                </span>
              </div>
              
              <div className="message-input-wrapper">
                <label>메시지 내용</label>
                <textarea
                  value={smsMessage}
                  onChange={(e) => setSmsMessage(e.target.value)}
                  placeholder="메시지를 입력하세요..."
                  rows={4}
                  maxLength={90}
                />
                <span className="char-count">{smsMessage.length}/90</span>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setIsSmsModalOpen(false)}>
                취소
              </button>
              <button 
                className="btn-send" 
                onClick={handleSendSms}
                disabled={isSending || !smsMessage.trim()}
              >
                {isSending ? '보내는 중...' : '메시지 보내기'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 일괄 SMS 모달 */}
      {isBulkSmsModalOpen && (
        <div className="modal-overlay" onClick={() => setIsBulkSmsModalOpen(false)}>
          <div className="modal-content sms-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>미납자 전체 알림</h3>
              <button className="modal-close" onClick={() => setIsBulkSmsModalOpen(false)}>
                <Icons.X />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="bulk-info">
                <Icons.Users />
                <span>미납 회원 {unpaidMembers.length}명에게 메시지를 보냅니다.</span>
              </div>
              
              <div className="recipient-list">
                {unpaidMembers.slice(0, 5).map(m => (
                  <span key={m.memberId} className="recipient-chip">{m.name}</span>
                ))}
                {unpaidMembers.length > 5 && (
                  <span className="recipient-chip recipient-chip--more">
                    +{unpaidMembers.length - 5}명
                  </span>
                )}
              </div>
              
              <div className="message-input-wrapper">
                <label>메시지 내용</label>
                <textarea
                  value={bulkSmsMessage}
                  onChange={(e) => setBulkSmsMessage(e.target.value)}
                  placeholder="메시지를 입력하세요..."
                  rows={4}
                  maxLength={90}
                />
                <span className="char-count">{bulkSmsMessage.length}/90</span>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setIsBulkSmsModalOpen(false)}>
                취소
              </button>
              <button 
                className="btn-send" 
                onClick={handleBulkSendSms}
                disabled={isSending || !bulkSmsMessage.trim()}
              >
                {isSending ? '보내는 중...' : `${unpaidMembers.length}명에게 보내기`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 납부 확인 모달 */}
      {isConfirmModalOpen && confirmMember && (
        <div className="modal-overlay" onClick={() => setIsConfirmModalOpen(false)}>
          <div className="modal-content confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="confirm-icon">
              <Icons.UserCheck />
            </div>
            <h3>납부 확인</h3>
            <p className="confirm-message">
              <strong>{confirmMember.name}</strong>님의 회비 납부를 확인하시겠습니까?
            </p>
            <p className="confirm-amount">
              확인 금액: {feesData?.monthlyFee?.toLocaleString()}원
            </p>
            
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setIsConfirmModalOpen(false)}>
                취소
              </button>
              <button 
                className="btn-confirm" 
                onClick={handleConfirmPayment}
                disabled={isConfirming}
              >
                {isConfirming ? '처리 중...' : '납부 확인'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeesPage;