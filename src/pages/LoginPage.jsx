import React, { useState } from 'react';
import SocialLoginButton from '../components/auth/SocialLoginButton';
import './LoginPage.css';

const LoginPage = () => { 
  const [loading, setLoading] = useState(false);

  const handleSocialLogin = async (provider) => {
    if (provider === 'kakao') {
      // 카카오 로그인: 백엔드의 kakao-login 엔드포인트로 리다이렉트
      setLoading(true);
      window.location.href = 'http://localhost:8081/api/auth/kakao-login';
    } else if (provider === 'naver') {
      // 네이버는 아직 미구현
      alert('네이버 로그인은 준비 중입니다.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="login-logo">💰</div>
          <h1 className="login-title">오토피봇</h1>
          <p className="login-subtitle">동호회 회비 관리, 이제 자동으로!</p>
        </div>

        <div className="login-buttons">
          <SocialLoginButton 
            provider="kakao" 
            onClick={handleSocialLogin}
            disabled={loading}
          />
          <SocialLoginButton 
            provider="naver" 
            onClick={handleSocialLogin}
            disabled={loading}
          />
        </div>

        <div className="login-footer">
          <p className="login-helper-text">
            처음이라도 걱정 마세요!<br />
            로그인 한 번이면 모든 준비 끝!
          </p>
        </div>

        {loading && (
          <div className="login-loading-overlay">
            <div className="login-loading-spinner"></div>
            <p className="login-loading-text">카카오 로그인 페이지로 이동 중...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;