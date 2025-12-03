import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import './DashboardPage.css';

// 🎨 SVG 아이콘 컴포넌트
const Icons = {
  Refresh: ({ className }) => (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 11-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/>
      <path d="M21 3v5h-5"/>
    </svg>
  ),
  Wallet: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12V7H5a2 2 0 010-4h14v4"/>
      <path d="M3 5v14a2 2 0 002 2h16v-5"/>
      <path d="M18 12a2 2 0 100 4 2 2 0 000-4z"/>
    </svg>
  ),
  Users: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87"/>
      <path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  ),
  Settings: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  ),
  Download: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
  Coins: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6"/>
      <path d="M18.09 10.37A6 6 0 1110.34 18"/>
      <path d="M7 6h1v4"/>
      <path d="M16.71 13.88l.7.71-2.82 2.82"/>
    </svg>
  ),
  UserGroup: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87"/>
      <path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  ),
  UserCheck: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="8.5" cy="7" r="4"/>
      <polyline points="17 11 19 13 23 9"/>
    </svg>
  ),
  TrendingUp: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  Calendar: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  Send: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  ),
  Mic: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
      <path d="M19 10v2a7 7 0 01-14 0v-2"/>
      <line x1="12" y1="19" x2="12" y2="23"/>
      <line x1="8" y1="23" x2="16" y2="23"/>
    </svg>
  ),
  Play: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  ),
  Square: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    </svg>
  ),
  X: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Check: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  // ✅ 새로 추가된 아이콘들
  ChevronLeft: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  ),
  Expand: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 3 21 3 21 9"/>
      <polyline points="9 21 3 21 3 15"/>
      <line x1="21" y1="3" x2="14" y2="10"/>
      <line x1="3" y1="21" x2="10" y2="14"/>
    </svg>
  ),
  Minimize: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 14 10 14 10 20"/>
      <polyline points="20 10 14 10 14 4"/>
      <line x1="14" y1="10" x2="21" y2="3"/>
      <line x1="3" y1="21" x2="10" y2="14"/>
    </svg>
  )
};

// 🤖 인라인 채팅 패널 컴포넌트
const InlineChatPanel = ({ groupId, onExpandClick }) => {
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

  const quickQuestions = [
    { text: '미납자 현황', icon: '📋' },
    { text: '이번 달 회비', icon: '💰' },
    { text: '사용법 안내', icon: '💡' },
    { text: '납부 통계', icon: '📊' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

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

  const handleSendMessage = async (text) => {
    if (!text.trim() || isLoading || !groupId) return;

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
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="glass-panel chat-panel">
      <div className="panel-title">
        <span>🤖 AI 도우미</span>
        {/* ✅ 확대 버튼 추가 */}
        <button 
          className="chat-expand-btn"
          onClick={onExpandClick}
          title="채팅창 확대"
        >
          <Icons.Expand />
        </button>
      </div>

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
            {q.icon} {q.text}
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

// 🤖 확대된 채팅 모달 컴포넌트
const ChatModal = ({ groupId, onClose }) => {
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

  const quickQuestions = [
    { text: '미납자 현황', icon: '📋' },
    { text: '이번 달 회비', icon: '💰' },
    { text: '사용법 안내', icon: '💡' },
    { text: '납부 통계', icon: '📊' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 100);

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

  const handleSendMessage = async (text) => {
    if (!text.trim() || isLoading || !groupId) return;

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
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  };

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="chat-modal-overlay" onClick={onClose}>
      <div className="chat-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="chat-modal-header">
          <div className="chat-modal-title">
            <span>🤖</span>
            <h3>AI 도우미 두레</h3>
          </div>
          <button className="chat-modal-close" onClick={onClose}>
            <Icons.X />
          </button>
        </div>

        <div className="chat-modal-messages">
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

        <div className="chat-modal-quick-questions">
          {quickQuestions.map((q, i) => (
            <button
              key={i}
              className="quick-question-btn"
              onClick={() => handleSendMessage(q.text)}
              disabled={isLoading}
            >
              {q.icon} {q.text}
            </button>
          ))}
        </div>

        <div className="chat-modal-input-container">
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
  const [currentGroupId, setCurrentGroupId] = useState(null);

  // 수금 기간 관련 상태
  const [activeCycle, setActiveCycle] = useState(null);
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [isEndModalOpen, setIsEndModalOpen] = useState(false);
  const [cycleForm, setCycleForm] = useState({ period: '', dueDate: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ 채팅 모달 상태 추가
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  // ✅ 1단계: 토큰 및 groupId 초기화 (최초 1회)
  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    // 토큰 없으면 로그인으로
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    // 사용자 이름 파싱 (UTF-8 안전한 디코딩)
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);
      console.log('JWT payload:', payload);
      setUserName(payload.name || '회원');
    } catch (error) {
      console.error('토큰 파싱 실패:', error);
      setUserName('회원');
    }

    // groupId 결정: URL 파라미터 > localStorage
    const groupIdFromUrl = searchParams.get('groupId');
    const groupIdFromStorage = localStorage.getItem('currentGroupId');
    let finalGroupId = null;

    if (groupIdFromUrl && groupIdFromUrl !== 'undefined' && groupIdFromUrl !== 'null') {
      finalGroupId = groupIdFromUrl;
      localStorage.setItem('currentGroupId', groupIdFromUrl);
    } else if (groupIdFromStorage && groupIdFromStorage !== 'undefined' && groupIdFromStorage !== 'null') {
      finalGroupId = groupIdFromStorage;
    }

    // groupId가 없으면 그룹 선택 페이지로
    if (!finalGroupId) {
      console.log('No valid groupId found, redirecting to select-group');
      navigate('/select-group', { replace: true });
      return;
    }

    console.log('Using groupId:', finalGroupId);
    setCurrentGroupId(finalGroupId);
  }, [navigate, searchParams]);

  // ✅ 2단계: groupId가 설정된 후 데이터 로드
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

  const fetchDashboardData = useCallback(async (groupId, showLoading = true) => {
    if (!groupId) return;

    try {
      if (showLoading) setIsLoading(true);
      else setIsRefreshing(true);

      const response = await fetch(
        `https://seongchan-spring.store/api/groups/${groupId}/dashboard`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('accessToken');
          navigate('/login', { replace: true });
          return;
        }
        if (response.status === 403 || response.status === 404) {
          localStorage.removeItem('currentGroupId');
          navigate('/select-group', { replace: true });
          return;
        }
        throw new Error('데이터 로딩 실패');
      }

      const data = await response.json();
      console.log('Dashboard data:', data);
      setDashboardData(data);
      setLastUpdated(new Date(data.lastUpdated));

      await fetchActiveCycle(groupId);
    } catch (error) {
      console.error('데이터 로딩 오류:', error);
      toast.error('데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [navigate, fetchActiveCycle]);

  useEffect(() => {
    if (currentGroupId) {
      fetchDashboardData(currentGroupId, true);
    }
  }, [currentGroupId, fetchDashboardData]);

  // 자동 새로고침 (60초)
  useEffect(() => {
    if (!currentGroupId) return;

    const interval = setInterval(() => {
      fetchDashboardData(currentGroupId, false);
    }, 60000);

    return () => clearInterval(interval);
  }, [currentGroupId, fetchDashboardData]);

  // 수동 새로고침
  const handleManualRefresh = async () => {
    if (!currentGroupId) {
      toast.error('그룹을 먼저 선택해주세요.');
      navigate('/select-group');
      return;
    }

    const loadingToast = toast.loading('데이터 갱신 중...');
    try {
      setIsRefreshing(true);
      await fetch(
        `https://seongchan-spring.store/api/groups/${currentGroupId}/dashboard/refresh`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );
      await fetchDashboardData(currentGroupId, false);
      toast.success('새로고침 완료!', { id: loadingToast });
    } catch (error) {
      console.error('새로고침 오류:', error);
      toast.error('데이터 갱신 중 오류가 발생했습니다.', { id: loadingToast });
    } finally {
      setIsRefreshing(false);
    }
  };

  // ✅ APK 다운로드 핸들러
  const handleAppDownload = () => {
    const link = document.createElement('a');
    link.href = '/downloads/AutoFeeBot.apk';
    link.download = 'AutoFeeBot.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('앱 다운로드가 시작됩니다!');
  };

  // ✅ 그룹 선택 페이지로 돌아가기
  const handleBackToGroupSelect = () => {
    navigate('/select-group');
  };

  // 수금 시작 모달 열기
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

  // 수금 시작 처리
  const handleStartCycle = async () => {
    if (!cycleForm.period || !cycleForm.dueDate) {
      toast.error('모든 항목을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `https://seongchan-spring.store/api/groups/${currentGroupId}/payment-cycles/start`,
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
      await fetchDashboardData(currentGroupId, false);
    } catch (error) {
      console.error('수금 시작 오류:', error);
      toast.error(error.message || '수금 시작에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 수금 종료 처리
  const handleEndCycle = async () => {
    if (!activeCycle?.cycleId) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `https://seongchan-spring.store/api/groups/${currentGroupId}/payment-cycles/${activeCycle.cycleId}/close`,
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
      await fetchDashboardData(currentGroupId, false);
    } catch (error) {
      console.error('수금 종료 오류:', error);
      toast.error('수금 종료에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 기간 포맷
  const formatPeriod = (period) => {
    if (!period) return '';
    const [year, month] = period.split('-');
    return `${year}년 ${parseInt(month)}월`;
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
    { id: 'fees', icon: <Icons.Wallet />, title: '회비 관리', desc: '납부 현황 확인', path: '/fees' },
    { id: 'members', icon: <Icons.Users />, title: '멤버 목록', desc: '우리 팀원 보기', path: '/members' },
    { id: 'groupSettings', icon: <Icons.Settings />, title: '그룹 설정', desc: '그룹 정보 수정', path: '/group-settings' },
    { id: 'appDownload', icon: <Icons.Download />, title: '앱 다운로드', desc: 'Android 앱 설치', isDownload: true }
  ];

  // 계산된 데이터
  const targetAmount = dashboardData.totalMembers * (dashboardData.fee || 0);
  const unpaidAmount = dashboardData.unpaidAmount || 0;

  return (
    <div className="dashboard-page">
      <div className="dashboard-content">

        {/* 1. 헤더 */}
        <div className="dashboard-header">
          {/* ✅ 그룹 선택 페이지로 돌아가기 버튼 추가 */}
          <button 
            className="back-to-groups-btn"
            onClick={handleBackToGroupSelect}
            title="그룹 선택으로 돌아가기"
          >
            <Icons.ChevronLeft />
            <span>그룹 목록</span>
          </button>

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
                {lastUpdated.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} 기준
              </span>
            )}
          </div>
        </div>

        {/* 2. 히어로 카드 */}
        <div className="hero-card">
          <div className="hero-header">
            <span className="hero-title">이번 달 회비 납부율</span>
            {activeCycle?.hasActiveCycle ? (
              <span className="cycle-badge cycle-badge--active">🟢 수금 진행 중</span>
            ) : (
              <span className="cycle-badge cycle-badge--inactive">⚪ 수금 대기</span>
            )}
          </div>

          <div className="hero-content">
            <div className="payment-rate-big">
              {activeCycle?.hasActiveCycle ? `${activeCycle.paymentRate || 0}%` : '--'}
            </div>

            <div className="progress-container">
              <div
                className="progress-bar"
                style={{ width: activeCycle?.hasActiveCycle ? `${activeCycle.paymentRate || 0}%` : '0%' }}
              />
            </div>

            {activeCycle?.hasActiveCycle ? (
              <>
                <div className="cycle-info">
                  <span className="cycle-period">📅 {formatPeriod(activeCycle.period)}</span>
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
                  수금 종료하기
                </button>
              </>
            ) : (
              <div className="no-cycle-container">
                <p className="no-cycle-message">
                  아직 이번 달 수금을 시작하지 않았어요.<br />
                  수금을 시작하면 입금 알림이 자동으로 매칭됩니다.
                </p>
                <button
                  className="cycle-action-btn cycle-action-btn--start"
                  onClick={openStartModal}
                >
                  <Icons.Play />
                  회비 수금 시작하기
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
              className={`action-card ${action.isDownload ? 'action-card--download' : ''}`}
              onClick={() => {
                if (action.isDownload) {
                  handleAppDownload();
                } else {
                  navigate(action.path);
                }
              }}
            >
              <div className="action-icon">{action.icon}</div>
              <div className="action-text">
                <span className="action-title">{action.title}</span>
                <span className="action-desc">{action.desc}</span>
              </div>
            </div>
          ))}
        </div>

        {/* 4. 하단 그리드 */}
        <div className="dashboard-bottom-grid">
          {/* 상세 현황 */}
          <div className="glass-panel">
            <h3 className="panel-title">📊 상세 현황</h3>
            <div className="status-list">
              <div className="status-item">
                <div className="status-icon status-icon--coins">
                  <Icons.Coins />
                </div>
                <div className="status-info">
                  <span className="status-label">총 목표 금액</span>
                  <span className="status-value">
                    {(activeCycle?.targetAmount || targetAmount)?.toLocaleString() || 0}원
                  </span>
                </div>
              </div>

              <div className="status-item">
                <div className="status-icon status-icon--users">
                  <Icons.UserGroup />
                </div>
                <div className="status-info">
                  <span className="status-label">전체 멤버</span>
                  <span className="status-value">
                    {activeCycle?.totalMembers || dashboardData.totalMembers}명
                  </span>
                </div>
              </div>

              <div className="status-item">
                <div className="status-icon status-icon--check">
                  <Icons.UserCheck />
                </div>
                <div className="status-info">
                  <span className="status-label">납부 완료</span>
                  <span className="status-value status-value--success">
                    {activeCycle?.paidMembers || dashboardData.paidMembers || 0}명
                  </span>
                </div>
              </div>

              <div className="status-item">
                <div className="status-icon status-icon--trending">
                  <Icons.TrendingUp />
                </div>
                <div className="status-info">
                  <span className="status-label">미수금 잔액</span>
                  <span className="status-value status-value--warning">
                    {activeCycle?.hasActiveCycle
                      ? ((activeCycle.targetAmount || 0) - (activeCycle.totalCollected || 0)).toLocaleString()
                      : unpaidAmount.toLocaleString()
                    }원
                  </span>
                </div>
              </div>

              <div className="status-item">
                <div className="status-icon status-icon--calendar">
                  <Icons.Calendar />
                </div>
                <div className="status-info">
                  <span className="status-label">1인당 회비</span>
                  <span className="status-value">
                    {(activeCycle?.monthlyFee || dashboardData.fee || 0).toLocaleString()}원
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 인라인 채팅 패널 - 확대 버튼 연결 */}
          <InlineChatPanel 
            groupId={currentGroupId} 
            onExpandClick={() => setIsChatModalOpen(true)}
          />
        </div>

        {/* ✅ 채팅 모달 */}
        {isChatModalOpen && (
          <ChatModal 
            groupId={currentGroupId} 
            onClose={() => setIsChatModalOpen(false)} 
          />
        )}

        {/* 수금 시작 모달 */}
        {isStartModalOpen && (
          <div className="modal-overlay" onClick={() => setIsStartModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>▶️ 회비 수금 시작</h3>
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
                    <span className="summary-label">대상 멤버</span>
                    <span className="summary-value">{dashboardData.totalMembers}명</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">1인당 회비</span>
                    <span className="summary-value">{(dashboardData.fee || 0).toLocaleString()}원</span>
                  </div>
                  <div className="summary-item summary-item--highlight">
                    <span className="summary-label">목표 금액</span>
                    <span className="summary-value">
                      {(dashboardData.totalMembers * (dashboardData.fee || 0)).toLocaleString()}원
                    </span>
                  </div>
                </div>

                <div className="info-box">
                  <p>💡 수금을 시작하면 모든 멤버에게 납부 대기 상태가 생성되고, 입금 알림이 자동으로 매칭됩니다.</p>
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

        {/* 수금 종료 모달 */}
        {isEndModalOpen && (
          <div className="modal-overlay" onClick={() => setIsEndModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
                    <p>⚠️ 수금 종료 시 미납 회원은 연체(OVERDUE) 상태로 변경됩니다.</p>
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
    </div>
  );
};

export default DashboardPage;