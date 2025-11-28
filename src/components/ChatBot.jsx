import React, { useState, useRef, useEffect } from 'react';
import './ChatBot.css';

const ChatBot = ({ isOpen, onClose, groupId }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: '안녕하세요! 오토피봇 AI 총총이입니다. 🤖\n무엇을 도와드릴까요?',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);  // ✅ 입력창 ref 추가!

  // 추천 질문 데이터
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

  // ✅ 챗봇 열릴 때 입력창에 포커스
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 100);
    }
  }, [isOpen]);

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

    // ✅ 메시지 전송 후 바로 포커스 유지
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
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
      
      // ✅ 응답 받은 후에도 포커스 유지
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
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

  // ✅ 추천 질문 클릭 후에도 포커스 유지
  const handleQuickQuestion = (text) => {
    handleSendMessage(text);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  };

  if (!isOpen) return null;

  return (
    <div className="chatbot-overlay" onClick={onClose}>
      <div className="chatbot-container" onClick={(e) => e.stopPropagation()}>
        
        {/* 헤더 */}
        <div className="chatbot-header">
          <div className="chatbot-header-info">
            <div className="chatbot-avatar">🤖</div>
            <div>
              <h3>총총이</h3>
              <div className="chatbot-status">Online</div>
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
                <div className="message-avatar-small">🤖</div>
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
              <div className="message-avatar-small">🤖</div>
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

        {/* 추천 질문 영역 */}
        {!isLoading && (
          <div className="suggestions-container">
            <div className="suggestions-scroll-area">
              {quickQuestions.map((q, idx) => (
                <button 
                  key={idx} 
                  className="suggestion-chip"
                  onClick={() => handleQuickQuestion(q.text)}
                >
                  <span>{q.icon}</span>
                  {q.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 입력 영역 */}
        <div className="chatbot-input-area">
          <input
            ref={inputRef}  // ✅ ref 연결!
            type="text"
            className="chatbot-input"
            placeholder="궁금한 내용을 입력하세요..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            autoFocus  // ✅ 자동 포커스
          />
          <button 
            className="chatbot-send-btn"
            onClick={() => handleSendMessage(inputText)}
            disabled={isLoading || !inputText.trim()}
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;