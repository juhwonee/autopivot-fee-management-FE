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
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
      <path d="M21 3v5h-5"/>
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
      <path d="M8 16H3v5"/>
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
      minute: '2-digit',
      hour12: true
    });
  };

  const handleQuickQuestion = (text) => {
    handleSendMessage(text);
  };

  return (
    <div className="inline-chat-panel">
      {/* 헤더 - 컴팩트 */}
      <div className="chat-panel-header">
        <div className="chat-panel-title">
          <div className="chat-bot-avatar">🤖</div>
          <div>
            <h4>AI 도우미 두레</h4>
            <span className="chat-status">● Online</span>
          </div>
        </div>
      </div>

      {/* 메시지 영역 - 확장 */}
      <div className="chat-messages-area">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`chat-message ${message.sender === 'user' ? 'chat-message--user' : 'chat-message--bot'}`}
          >
            {message.sender === 'bot' && (
              <div className="message-avatar bot-avatar">🤖</div>
            )}
            <div className="message-content">
              <div className="message-bubble">
                {message.text.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < message.text.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </div>
              <span className="message-time">{formatTime(message.timestamp)}</span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="chat-message chat-message--bot">
            <div className="message-avatar bot-avatar">🤖</div>
            <div className="message-content">
              <div className="message-bubble typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 추천 질문 */}
      {!isLoading && messages.length <= 3 && (
        <div className="quick-questions">
          {quickQuestions.map((q, idx) => (
            <button 
              key={idx} 
              className="quick-question-btn"
              onClick={() => handleQuickQuestion(q.text)}
            >
              <span>{q.icon}</span>
              {q.text}
            </button>
          ))}
        </div>
      )}

      {/* 입력 영역 - 컴팩트 */}
      <div className="chat-input-area">
        <button 
          className={`chat-voice-btn ${isListening ? 'listening' : ''}`}
          onClick={toggleVoiceInput}
          title="음성 입력"
        >
          <Icons.Mic />
        </button>
        <input
          ref={inputRef}
          type="text"
          placeholder="궁금한 내용을 입력하세요..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
        />
        <button 
          className="chat-send-btn"
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
  
  const [userName, setUserName] = useState('회원');
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ✅ URL에서 token 처리 및 인증/그룹 체크
  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      localStorage.setItem('accessToken', tokenFromUrl);
      window.history.replaceState({}, '', '/dashboard');
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    const currentGroupId = localStorage.getItem('currentGroupId');
    if (!isValidGroupId(currentGroupId)) {
      navigate('/select-group', { replace: true });
      return;
    }

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
      
    } catch (error) {
      console.error('데이터 로딩 오류:', error);
      toast.error('데이터를 불러오는데 실패했습니다.');
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

        {/* 2. 히어로 카드 */}
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
              <div className="stat-pill stat-pill--highlight">
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
                    {targetAmount?.toLocaleString() || 0}원
                  </strong>
                </div>
              </div>
              <div className="status-item">
                <div className="status-icon status-icon--users">
                  <Icons.UserGroup />
                </div>
                <div className="status-info">
                  <span className="status-label">전체 멤버</span>
                  <strong className="status-value">{dashboardData.totalMembers}명</strong>
                </div>
              </div>
              <div className="status-item">
                <div className="status-icon status-icon--trending">
                  <Icons.TrendingUp />
                </div>
                <div className="status-info">
                  <span className="status-label">미수금 잔액</span>
                  <strong className="status-value status-value--warning">
                    {remainingAmount > 0 ? remainingAmount.toLocaleString() : 0}원
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
                    {(dashboardData.fee || 0).toLocaleString()}원
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* 🤖 인라인 채팅 패널 */}
          <InlineChatPanel groupId={localStorage.getItem('currentGroupId')} />

        </div>
      </div>
    </div>
  );
};

export default DashboardPage;