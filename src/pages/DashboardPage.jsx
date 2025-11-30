import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import './DashboardPage.css';

// ✨ groupId 유효성 검증
const isValidGroupId = (groupId) => {
  return groupId && groupId !== 'undefined' && groupId !== 'null';
};

// 🎨 SVG 아이콘 컴포넌트
const Icons = {
  Refresh: ({ className }) => (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10"/>
      <polyline points="1 20 1 14 7 14"/>
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
    </svg>
  ),
  
  Wallet: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/>
      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>
    </svg>
  ),
  
  Users: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  
  Settings: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  
  Coins: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6"/>
      <path d="M18.09 10.37A6 6 0 1 1 10.34 18"/>
      <path d="M7 6h1v4"/>
      <path d="m16.71 13.88.7.71-2.82 2.82"/>
    </svg>
  ),
  
  UserGroup: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 21a8 8 0 0 0-16 0"/>
      <circle cx="10" cy="8" r="5"/>
      <path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3"/>
    </svg>
  ),

  TrendingUp: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
      <polyline points="16 7 22 7 22 13"/>
    </svg>
  ),

  Calendar: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
      <line x1="16" x2="16" y1="2" y2="6"/>
      <line x1="8" x2="8" y1="2" y2="6"/>
      <line x1="3" x2="21" y1="10" y2="10"/>
    </svg>
  ),

  Send: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
    </svg>
  ),

  Mic: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" x2="12" y1="19" y2="22"/>
    </svg>
  ),

  // ✅ 새로 추가: 플레이 (수금 시작)
  Play: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  ),

  // ✅ 새로 추가: 정지 (수금 종료)
  Square: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    </svg>
  ),

  // ✅ 새로 추가: X (닫기)
  X: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),

  // ✅ 새로 추가: 체크
  Check: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
};

// 🤖 인라인 채팅 패널 컴포넌트
const InlineChatPanel = ({ groupId }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: '안녕하세요! AI 도우미 두레입니다. 🤖\n무엇을 도와드릴까요?',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  // 추천 질문
  const quickQuestions = [
    { text: '미납자 현황', icon: '📋' },
    { text: '이번 달 회비', icon: '💰' },
    { text: '사용법 안내', icon: '💡' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // 🎤 음성 인식 초기화
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'ko-KR';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        toast.error('음성 인식에 실패했습니다.');
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  // 🎤 음성 인식 토글
  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast.error('이 브라우저는 음성 인식을 지원하지 않습니다.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      toast('🎤 듣고 있어요...', { duration: 2000 });
    }
  };

  // 메시지 전송
  const handleSendMessage = async (text) => {
    if (!text.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 0);

    try {
      const response = await fetch(
        `https://seongchan-spring.store/api/groups/${groupId}/chatbot/message`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          body: JSON.stringify({
            message: text.trim(),
            sessionId: `session-${Date.now()}`
          })
        }
      );

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();

      const botMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Chatbot Error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: '죄송합니다. 잠시 후 다시 시도해주세요. 😥',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 1);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputText);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="glass-panel chat-panel">
      <h3 className="panel-title">🤖 AI 도우미</h3>
      
      <div className="chat-messages">
        {messages.map(msg => (
          <div key={msg.id} className={`chat-message ${msg.sender}`}>
            <div className="message-bubble">
              <p>{msg.text}</p>
              <span className="message-time">{formatTime(msg.timestamp)}</span>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="chat-message bot">
            <div className="message-bubble typing">
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="quick-questions">
        {quickQuestions.map((q, i) => (
          <button 
            key={i}
            className="quick-question-btn"
            onClick={() => handleSendMessage(q.text)}
            disabled={isLoading}
          >
            <span>{q.icon}</span> {q.text}
          </button>
        ))}
      </div>

      <div className="chat-input-container">
        <input
          ref={inputRef}
          type="text"
          placeholder="메시지를 입력하세요..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
        />
        <button 
          className={`voice-btn ${isListening ? 'listening' : ''}`}
          onClick={toggleVoiceInput}
          disabled={isLoading}
        >
          <Icons.Mic />
        </button>
        <button 
          className="send-btn"
          onClick={() => handleSendMessage(inputText)}
          disabled={isLoading || !inputText.trim()}
        >
          <Icons.Send />
        </button>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [userName, setUserName] = useState('');

  // ✅ 새로 추가: 수금 기간 관련 상태
  const [activeCycle, setActiveCycle] = useState(null);
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [isEndModalOpen, setIsEndModalOpen] = useState(false);
  const [cycleForm, setCycleForm] = useState({
    period: '',
    dueDate: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 사용자 이름 가져오기
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }

    // URL에서 groupId 처리
    const groupIdFromUrl = searchParams.get('groupId');
    if (groupIdFromUrl) {
      localStorage.setItem('currentGroupId', groupIdFromUrl);
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserName(payload.name || '회원');
    } catch (error) {
      console.error('토큰 파싱 실패:', error);
      setUserName('회원');
    }
  }, [navigate, searchParams]);

  // ✅ 새로 추가: 수금 기간 조회
  const fetchActiveCycle = useCallback(async () => {
    try {
      const groupId = localStorage.getItem('currentGroupId');
      if (!isValidGroupId(groupId)) return;

      const response = await fetch(
        `https://seongchan-spring.store/api/groups/${groupId}/payment-cycles/active`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );

      if (!response.ok) throw new Error('수금 기간 조회 실패');

      const data = await response.json();
      setActiveCycle(data);
    } catch (error) {
      console.error('수금 기간 조회 오류:', error);
    }
  }, []);

  // 대시보드 데이터 가져오기
  const fetchDashboardData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      else setIsRefreshing(true);
      
      const groupId = localStorage.getItem('currentGroupId');
      
      if (!isValidGroupId(groupId)) {
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
      
      // 수금 기간도 함께 조회
      await fetchActiveCycle();
      
    } catch (error) {
      console.error('데이터 로딩 오류:', error);
      toast.error('데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [navigate, fetchActiveCycle]);

  // 초기 데이터 로드
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const groupId = localStorage.getItem('currentGroupId');
    
    if (token && isValidGroupId(groupId)) {
      fetchDashboardData(true);
    }
  }, [fetchDashboardData]);

  // 자동 새로고침 (60초)
  useEffect(() => {
    const interval = setInterval(() => {
      const groupId = localStorage.getItem('currentGroupId');
      if (isValidGroupId(groupId)) {
        fetchDashboardData(false);
      }
    }, 60000);
    
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // 수동 새로고침
  const handleManualRefresh = async () => {
    const groupId = localStorage.getItem('currentGroupId');
    
    if (!isValidGroupId(groupId)) {
      toast.error('그룹을 먼저 선택해주세요.');
      navigate('/select-group');
      return;
    }
    
    const loadingToast = toast.loading('데이터 갱신 중...');
    
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
      toast.success('새로고침 완료!', { id: loadingToast });
    } catch (error) {
      console.error('새로고침 오류:', error);
      toast.error('데이터 갱신 중 오류가 발생했습니다.', { id: loadingToast });
    } finally {
      setIsRefreshing(false);
    }
  };

  // ✅ 새로 추가: 수금 시작 모달 열기
  const openStartModal = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
    
    setCycleForm({
      period: `${year}-${month}`,
      dueDate: `${year}-${month}-${lastDay}T23:59`
    });
    setIsStartModalOpen(true);
  };

  // ✅ 새로 추가: 수금 시작 처리
  const handleStartCycle = async () => {
    if (!cycleForm.period || !cycleForm.dueDate) {
      toast.error('모든 항목을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const groupId = localStorage.getItem('currentGroupId');
      
      const response = await fetch(
        `https://seongchan-spring.store/api/groups/${groupId}/payment-cycles/start`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          body: JSON.stringify({
            period: cycleForm.period,
            dueDate: cycleForm.dueDate + ':00'
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '수금 시작 실패');
      }

      toast.success('회비 수금이 시작되었습니다!');
      setIsStartModalOpen(false);
      await fetchDashboardData(false);
      
    } catch (error) {
      console.error('수금 시작 오류:', error);
      toast.error(error.message || '수금 시작에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ 새로 추가: 수금 종료 처리
  const handleEndCycle = async () => {
    if (!activeCycle?.cycleId) return;

    setIsSubmitting(true);

    try {
      const groupId = localStorage.getItem('currentGroupId');
      
      const response = await fetch(
        `https://seongchan-spring.store/api/groups/${groupId}/payment-cycles/${activeCycle.cycleId}/close`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );

      if (!response.ok) throw new Error('수금 종료 실패');

      toast.success('회비 수금이 종료되었습니다.');
      setIsEndModalOpen(false);
      await fetchDashboardData(false);
      
    } catch (error) {
      console.error('수금 종료 오류:', error);
      toast.error('수금 종료에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
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
      icon: <Icons.Wallet />, 
      title: '회비 관리', 
      desc: '납부 현황 확인', 
      path: '/fees' 
    },
    { 
      id: 'members', 
      icon: <Icons.Users />, 
      title: '멤버 목록', 
      desc: '우리 팀원 보기', 
      path: '/members' 
    },
    { 
      id: 'groupSettings',
      icon: <Icons.Settings />,
      title: '그룹 설정',
      desc: '그룹 정보 수정',
      path: '/group-settings'
    }
  ];

  // 계산된 데이터
  const targetAmount = dashboardData.totalMembers * (dashboardData.fee || 0);
  const remainingAmount = targetAmount - (dashboardData.totalAmount || 0);

  // 기간 포맷 (2025-01 → 2025년 1월)
  const formatPeriod = (period) => {
    if (!period) return '';
    const [year, month] = period.split('-');
    return `${year}년 ${parseInt(month)}월`;
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-content">
        
        {/* 1. 헤더 */}
        <div className="dashboard-header">
          <div className="header-greeting">
            <h2>반가워요, {userName}님!</h2>
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
              <Icons.Refresh className={isRefreshing ? 'spinning' : ''} />
              <span>새로고침</span>
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

        {/* 2. 히어로 카드 - 수금 상태 표시 추가 */}
        <div className="hero-card">
          <div className="hero-header">
            <span className="hero-title">이번 달 회비 납부율</span>
            
            {/* ✅ 수금 상태 배지 */}
            {activeCycle?.hasActiveCycle ? (
              <span className="cycle-badge cycle-badge--active">
                🟢 수금 진행 중
              </span>
            ) : (
              <span className="cycle-badge cycle-badge--inactive">
                ⚪ 수금 대기
              </span>
            )}
          </div>
          
          <div className="hero-content">
            <div className="payment-rate-big">
              {activeCycle?.hasActiveCycle ? `${activeCycle.paymentRate || 0}%` : '--'}
            </div>
            <div className="progress-container">
              <div 
                className="progress-bar" 
                style={{ width: `${activeCycle?.paymentRate || 0}%` }}
              ></div>
            </div>
            
            {/* ✅ 수금 기간 정보 또는 시작 버튼 */}
            {activeCycle?.hasActiveCycle ? (
              <>
                <div className="cycle-info">
                  <span className="cycle-period">
                    📅 {formatPeriod(activeCycle.period)}
                  </span>
                  <span className="cycle-due">
                    마감: {new Date(activeCycle.dueDate).toLocaleDateString('ko-KR')}
                  </span>
                </div>
                
                <div className="hero-stats-row">
                  <div className="stat-pill">
                    <label>납부 완료</label>
                    <span>{activeCycle.paidMembers || 0}명</span>
                  </div>
                  <div className="stat-pill">
                    <label>미납</label>
                    <span>{activeCycle.unpaidMembers || 0}명</span>
                  </div>
                  <div className="stat-pill stat-pill--highlight">
                    <label>총 모인 금액</label>
                    <span>{(activeCycle.totalCollected || 0).toLocaleString()}원</span>
                  </div>
                </div>

                <button 
                  className="cycle-action-btn cycle-action-btn--end"
                  onClick={() => setIsEndModalOpen(true)}
                >
                  <Icons.Square />
                  <span>수금 종료하기</span>
                </button>
              </>
            ) : (
              <div className="no-cycle-container">
                <p className="no-cycle-message">
                  아직 이번 달 수금을 시작하지 않았어요.<br/>
                  수금을 시작하면 입금 알림이 자동으로 매칭됩니다.
                </p>
                <button 
                  className="cycle-action-btn cycle-action-btn--start"
                  onClick={openStartModal}
                >
                  <Icons.Play />
                  <span>회비 수금 시작하기</span>
                </button>
              </div>
            )}
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
              <div className="action-text">
                <span className="action-title">{action.title}</span>
                <span className="action-desc">{action.desc}</span>
              </div>
            </div>
          ))}
        </div>

        {/* 4. 하단 그리드 - 상세현황 + 인라인 채팅 */}
        <div className="dashboard-bottom-grid">
          
          {/* 상세 현황 - 보강됨 */}
          <div className="glass-panel">
            <h3 className="panel-title">📊 상세 현황</h3>
            <div className="status-list">
              <div className="status-item">
                <div className="status-icon status-icon--coins">
                  <Icons.Coins />
                </div>
                <div className="status-info">
                  <span className="status-label">총 목표 금액</span>
                  <strong className="status-value">
                    {(activeCycle?.targetAmount || targetAmount)?.toLocaleString() || 0}원
                  </strong>
                </div>
              </div>
              <div className="status-item">
                <div className="status-icon status-icon--users">
                  <Icons.UserGroup />
                </div>
                <div className="status-info">
                  <span className="status-label">전체 멤버</span>
                  <strong className="status-value">
                    {activeCycle?.totalMembers || dashboardData.totalMembers}명
                  </strong>
                </div>
              </div>
              <div className="status-item">
                <div className="status-icon status-icon--trending">
                  <Icons.TrendingUp />
                </div>
                <div className="status-info">
                  <span className="status-label">미수금 잔액</span>
                  <strong className="status-value status-value--warning">
                    {activeCycle?.hasActiveCycle 
                      ? ((activeCycle.targetAmount || 0) - (activeCycle.totalCollected || 0)).toLocaleString()
                      : remainingAmount > 0 ? remainingAmount.toLocaleString() : 0
                    }원
                  </strong>
                </div>
              </div>
              <div className="status-item">
                <div className="status-icon status-icon--calendar">
                  <Icons.Calendar />
                </div>
                <div className="status-info">
                  <span className="status-label">1인당 회비</span>
                  <strong className="status-value">
                    {(activeCycle?.monthlyFee || dashboardData.fee || 0).toLocaleString()}원
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* 🤖 인라인 채팅 패널 */}
          <InlineChatPanel groupId={localStorage.getItem('currentGroupId')} />

        </div>
      </div>

      {/* ✅ 수금 시작 모달 */}
      {isStartModalOpen && (
        <div className="modal-overlay" onClick={() => setIsStartModalOpen(false)}>
          <div className="modal-content cycle-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🚀 회비 수금 시작</h3>
              <button className="modal-close" onClick={() => setIsStartModalOpen(false)}>
                <Icons.X />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>수금 기간</label>
                <input
                  type="month"
                  value={cycleForm.period}
                  onChange={(e) => setCycleForm({...cycleForm, period: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>납부 마감일</label>
                <input
                  type="datetime-local"
                  value={cycleForm.dueDate}
                  onChange={(e) => setCycleForm({...cycleForm, dueDate: e.target.value})}
                />
              </div>
              
              <div className="cycle-summary">
                <div className="summary-item">
                  <span className="summary-label">📋 대상 멤버</span>
                  <span className="summary-value">{dashboardData.totalMembers}명</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">💰 1인당 회비</span>
                  <span className="summary-value">{(dashboardData.fee || 0).toLocaleString()}원</span>
                </div>
                <div className="summary-item summary-item--highlight">
                  <span className="summary-label">🎯 목표 금액</span>
                  <span className="summary-value">
                    {(dashboardData.totalMembers * (dashboardData.fee || 0)).toLocaleString()}원
                  </span>
                </div>
              </div>
              
              <div className="info-box">
                <p>💡 수금을 시작하면 모든 멤버에게 납부 대기 상태가 생성되고,<br/>
                입금 알림이 자동으로 매칭됩니다.</p>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-cancel" 
                onClick={() => setIsStartModalOpen(false)}
              >
                취소
              </button>
              <button 
                className="btn-confirm" 
                onClick={handleStartCycle}
                disabled={isSubmitting}
              >
                {isSubmitting ? '처리 중...' : '수금 시작하기'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ 수금 종료 모달 */}
      {isEndModalOpen && (
        <div className="modal-overlay" onClick={() => setIsEndModalOpen(false)}>
          <div className="modal-content cycle-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>⏹️ 회비 수금 종료</h3>
              <button className="modal-close" onClick={() => setIsEndModalOpen(false)}>
                <Icons.X />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="end-cycle-info">
                <p className="period-text">
                  <strong>{formatPeriod(activeCycle?.period)}</strong> 수금을 종료합니다.
                </p>
                
                <div className="end-summary">
                  <div className="summary-row">
                    <span>납부 완료</span>
                    <span className="text-success">{activeCycle?.paidMembers || 0}명</span>
                  </div>
                  <div className="summary-row">
                    <span>미납 (연체 처리)</span>
                    <span className="text-danger">{activeCycle?.unpaidMembers || 0}명</span>
                  </div>
                  <div className="summary-row">
                    <span>총 수금액</span>
                    <span>{(activeCycle?.totalCollected || 0).toLocaleString()}원</span>
                  </div>
                </div>
                
                <div className="warning-box">
                  <p>⚠️ 수금 종료 시 미납 회원은 <strong>연체(OVERDUE)</strong> 상태로 변경됩니다.</p>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-cancel" 
                onClick={() => setIsEndModalOpen(false)}
              >
                취소
              </button>
              <button 
                className="btn-danger" 
                onClick={handleEndCycle}
                disabled={isSubmitting}
              >
                {isSubmitting ? '처리 중...' : '수금 종료하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;