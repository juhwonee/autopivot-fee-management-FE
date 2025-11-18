import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import './GroupSelectPage.css';

const GroupSelectPage = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('회원');

  // 1. 그룹 선택 핸들러 (useCallback 적용)
  // - navigate만 의존하여, 컴포넌트 리렌더링 시 함수가 재생성되지 않도록 합니다.
  const handleSelectGroup = useCallback((groupId) => {
    // 선택한 그룹 ID를 localStorage에 저장
    localStorage.setItem('currentGroupId', groupId);
    // 대시보드로 이동
    navigate('/dashboard');
  }, [navigate]);

  // 2. JWT에서 사용자 이름 추출
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
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
    }
  }, [navigate]);

  // 3. 사용자의 그룹 목록 가져오기 (handleSelectGroup 의존성 추가)
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setIsLoading(true);
        
        // ⭐ Spring API 엔드포인트
        const response = await fetch('https://seongchan-spring.store/api/user/groups', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });

        if (!response.ok) {
          throw new Error('그룹 목록을 가져오는데 실패했습니다.');
        }

        const data = await response.json();
        setGroups(data);
        
        // 그룹이 없으면 그룹 만들기 페이지로
        if (data.length === 0) {
          navigate('/create-group');
        }
        // 그룹이 1개만 있으면 바로 대시보드로
        else if (data.length === 1) {
          handleSelectGroup(data[0].id);
        }
        
      } catch (error) {
        console.error('그룹 목록 로딩 오류:', error);
        alert('그룹 목록을 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroups();
  }, [navigate, handleSelectGroup]); // 👈 'handleSelectGroup'을 의존성 배열에 포함

  // 새 그룹 만들기
  const handleCreateNewGroup = () => {
    navigate('/create-group');
  };

  // 카테고리별 아이콘
  const getCategoryIcon = (category) => {
    const icons = {
      'club': '🎯',
      'study': '📚',
      'social': '🎉',
      'project': '💼',
      'etc': '📌'
    };
    return icons[category] || '📌';
  };

  // 카테고리별 배경 색상
  const getCategoryColor = (category) => {
    const colors = {
      'club': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'study': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'social': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'project': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'etc': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    };
    return colors[category] || colors['etc'];
  };

  if (isLoading) {
    return (
      <div className="group-select-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">그룹 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="group-select-page">
      <div className="group-select-container">
        {/* 헤더 */}
        <div className="group-select-header">
          <h1 className="group-select-title">
            환영합니다, {userName}님! 👋
          </h1>
          <p className="group-select-subtitle">
            어떤 그룹으로 들어가시겠어요?
          </p>
        </div>

        {/* 그룹 목록 */}
        <div className="groups-grid">
          {groups.map((group) => (
            <Card
              key={group.id}
              className="group-card"
              hover={true}
              onClick={() => handleSelectGroup(group.id)}
            >
              <div 
                className="group-card__header"
                style={{ background: getCategoryColor(group.category) }}
              >
                <div className="group-card__icon">
                  {getCategoryIcon(group.category)}
                </div>
                <div className="group-card__badge">
                  {group.role === 'ADMIN' ? '👑 관리자' : '👤 멤버'}
                </div>
              </div>

              <div className="group-card__body">
                <h3 className="group-card__name">{group.groupName}</h3>
                {group.groupDescription && (
                  <p className="group-card__description">
                    {group.groupDescription}
                  </p>
                )}

                <div className="group-card__stats">
                  <div className="stat-item">
                    <span className="stat-icon">👥</span>
                    <span className="stat-label">멤버</span>
                    <span className="stat-value">{group.memberCount}명</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">💰</span>
                    <span className="stat-label">월 회비</span>
                    <span className="stat-value">
                      {group.monthlyFee.toLocaleString()}원
                    </span>
                  </div>
                </div>

                <div className="group-card__footer">
                  <span className="last-active">
                    최근 활동: {group.lastActiveDate || '오늘'}
                  </span>
                </div>
              </div>
            </Card>
          ))}

          {/* 새 그룹 만들기 카드 */}
          <Card
            className="group-card group-card--create"
            hover={true}
            onClick={handleCreateNewGroup}
          >
            <div className="create-group-content">
              <div className="create-group-icon">➕</div>
              <h3 className="create-group-title">새 그룹 만들기</h3>
              <p className="create-group-description">
                새로운 회비 관리 그룹을<br />시작해보세요!
              </p>
            </div>
          </Card>
        </div>

        {/* 로그아웃 버튼 */}
        <div className="group-select-footer">
          <Button
            variant="secondary"
            size="medium"
            onClick={() => {
              localStorage.removeItem('accessToken');
              localStorage.removeItem('currentGroupId');
              navigate('/login');
            }}
          >
            로그아웃
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GroupSelectPage;