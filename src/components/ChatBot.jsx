import React, { useState, useRef, useEffect } from 'react';
import './ChatBot.css';

const ChatBot = ({ isOpen, onClose, groupId }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: '안녕하세요! 오토피봇 AI 어시스턴트 총총이입니다. 🤖\n궁금하신 것을 물어보세요!',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // 빠른 질문 버튼
  const quickQuestions = [
    { text: '미납자 알려줘', icon: '📋' },
    { text: '회비 현황 보여줘', icon: '📊' },
    { text: '도움말', icon: '💡' }
  ];

  // 메시지 스크롤 자동 이동
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

      if (!response.ok) throw new Error('챗봇 응답 실패');

      const data = await response.json();

      const botMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: data.response,
        type: data.type,
        data: data.data,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('챗봇 오류:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: '죄송합니다. 일시적인 오류가 발생했습니다. 다시 시도해주세요.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // 엔터키로 전송
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputText);
    }
  };

  // 시간 포맷
  const formatTime = (date) => {
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!isOpen) return null;

  return (
    <div className="chatbot-overlay" onClick={onClose}>
      <div className="chatbot-container" onClick={(e) => e.stopPropagation()}>
        
        {/* 헤더 */}
        <div className="chatbot-header">
          <div className="chatbot-header-info">
            <span className="chatbot-avatar">🤖</span>
            <div>
              <h3>총총이</h3>
              <span className="chatbot-status">온라인</span>
            </div>
          </div>
          <button className="chatbot-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* 메시지 영역 */}
        <div className="chatbot-messages">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`message ${message.sender === 'user' ? 'message-user' : 'message-bot'}`}
            >
              {message.sender === 'bot' && (
                <span className="message-avatar">🤖</span>
              )}
              <div className="message-content">
                <div className="message-bubble">
                  {message.text}
                </div>
                <span className="message-time">
                  {formatTime(message.timestamp)}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="message message-bot">
              <span className="message-avatar">🤖</span>
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

        {/* 빠른 질문 버튼 */}
        {messages.length <= 1 && !isLoading && (
          <div className="quick-questions">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                className="quick-question-btn"
                onClick={() => handleSendMessage(question.text)}
              >
                <span>{question.icon}</span>
                {question.text}
              </button>
            ))}
          </div>
        )}

        {/* 입력 영역 */}
        <div className="chatbot-input-area">
          <input
            type="text"
            className="chatbot-input"
            placeholder="메시지를 입력하세요..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <button 
            className="chatbot-send-btn"
            onClick={() => handleSendMessage(inputText)}
            disabled={isLoading || !inputText.trim()}
          >
            <span>📤</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;