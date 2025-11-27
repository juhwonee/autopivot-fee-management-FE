import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import './AuthCallbackPage.css';

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [statusMessage, setStatusMessage] = useState('로그인 정보를 확인하고 있어요');

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');
      const message = searchParams.get('message');

      // 에러 처리
      if (error) {
        toast.error(`로그인 실패: ${message || '다시 시도해주세요.'}`);
        navigate('/login');
        return;
      }

      // 토큰이 없으면 로그인 페이지로
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        // 1. JWT 토큰 저장
        localStorage.setItem('accessToken', token);
        
        // 2. 사용자의 그룹 정보 확인
        setStatusMessage('그룹 정보를 불러오고 있어요');
        
        const response = await fetch('https://seongchan-spring.store/api/groups/my', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('그룹 정보를 가져오는데 실패했습니다.');
        }

        const groups = await response.json();

        // 3. 그룹 수에 따라 페이지 분기
        if (groups.length === 0) {
          // 그룹 없음 → 그룹 만들기 페이지
          setStatusMessage('새로운 시작을 준비하는 중...');
          toast.success('환영합니다! 첫 그룹을 만들어보세요.');
          setTimeout(() => {
            navigate('/create-group', { replace: true });
          }, 800);
        } else if (groups.length === 1) {
          // 그룹 1개 → 바로 대시보드로
          localStorage.setItem('currentGroupId', groups[0].id);
          setStatusMessage('대시보드로 이동합니다!');
          toast.success('로그인 성공!');
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 800);
        } else {
          // 그룹 여러 개 → 그룹 선택 페이지
          setStatusMessage('어디로 입장할까요?');
          toast.success('로그인 성공! 그룹을 선택해주세요.');
          setTimeout(() => {
            navigate('/select-group', { replace: true });
          }, 800);
        }

      } catch (error) {
        console.error('로그인 처리 오류:', error);
        toast.error('로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
        localStorage.removeItem('accessToken');
        navigate('/login', { replace: true });
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="auth-callback-page">
      {/* 중앙 카드 영역 */}
      <div className="callback-card">
        
        {/* 스피너 애니메이션 */}
        <div className="spinner-wrapper">
          <div className="spinner-ring"></div>
          <div className="spinner-pulse"></div>
        </div>

        {/* 텍스트 영역 */}
        {/* key={statusMessage}를 주면 메시지가 바뀔 때마다 깜빡이는 애니메이션이 다시 실행됩니다 */}
        <h2 className="callback-title fade-text" key={statusMessage}>
          {statusMessage}
        </h2>
        <p className="callback-message">
          잠시만 기다려주세요.<br />
          곧 자동으로 이동합니다.
        </p>
      </div>
    </div>
  );
};

export default AuthCallbackPage;