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

  // ✅ 그룹 선택 핸들러
  const handleSelectGroup = useCallback((group) => {
    console.log('✅ 선택한 그룹 ID:', group.groupId);
    localStorage.setItem('currentGroupId', String(group.groupId));
    localStorage.setItem('currentGroup', JSON.stringify(group));
    navigate('/dashboard');
  }, [navigate]);

  // ✅ JWT 토큰에서 사용자 이름 추출
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      alert('로그인이 필요합니다.');
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
      console.error('❌ 토큰 파싱 실패:', error);
      setUserName('회원');
    }
  }, [navigate]);

  // ✅ 사용자의 그룹 목록 가져오기
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setIsLoading(true);
        
        const response = await fetch('https://seongchan-spring.store/api/groups/my', {
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
        
        // 그룹이 없으면 그룹 생성 페이지로 이동
        if (data.length === 0) {
          alert('아직 가입된 그룹이 없습니다. 그룹을 만들어주세요!');
          navigate('/create-group');
          return;
        }
        
      } catch (error) {
        console.error('❌ 그룹 목록 로딩 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroups();
  }, [navigate]);

  // ✅ 새 그룹 만들기
  const handleCreateNewGroup = () => {
    navigate('/create-group');
  };

  // ✅ 로그아웃
  const handleLogout = () => {
    if (window.confirm('정말 로그아웃 하시겠습니까?')) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('currentGroupId');
      navigate('/login');
    }
  };

  // 카테고리별 아이콘
  const getCategoryIcon = (category) => {
    const icons = {
      'CLUB': '🏀',
      'STUDY': '📚',
      'SOCIAL_GATHERING': '🍺',
      'PROJECT': '💻',
      'OTHER': '✨'
    };
    return icons[category] || '📌';
  };

  // 카테고리별 배경 그라디언트 (파스텔 톤으로 부드럽게)
  const getCategoryColor = (category) => {
    const colors = {
      'CLUB': 'linear-gradient(135deg, #bfdbfe 0%, #60a5fa 100%)', // 블루
      'STUDY': 'linear-gradient(135deg, #e9d5ff 0%, #c084fc 100%)', // 퍼플
      'SOCIAL_GATHERING': 'linear-gradient(135deg, #bbf7d0 0%, #4ade80 100%)', // 그린
      'PROJECT': 'linear-gradient(135deg, #fecaca 0%, #f87171 100%)', // 레드
      'OTHER': 'linear-gradient(135deg, #fed7aa 0%, #fb923c 100%)'  // 오렌지
    };
    return colors[category] || 'linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%)';
  };

  // 카테고리 한글 이름
  const getCategoryLabel = (category) => {
    const labels = {
      'CLUB': '동아리',
      'STUDY': '스터디',
      'SOCIAL_GATHERING': '친목회',
      'PROJECT': '프로젝트',
      'OTHER': '기타'
    };
    return labels[category] || '기타';
  };

  // 로딩 중
  if (isLoading) {
    return (
      <div className="group-select-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p style={{ color: '#64748b', fontWeight: 600 }}>그룹 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="group-select-page">
      <div className="group-select-container">
        
        {/* 헤더 영역 */}
        <div className="group-select-header">
          <h1 className="group-select-title">
            반가워요, {userName}님!
          </h1>
          <p className="group-select-subtitle">
            {groups.length > 0 
              ? '오늘은 어떤 모임 활동을 시작할까요?' 
              : '아직 모임이 없네요. 첫 그룹을 만들어보세요!'}
          </p>
        </div>

        {/* 그룹 카드 그리드 */}
        <div className="groups-grid">
          {/* 기존 그룹 리스트 */}
          {groups.map((group) => (
            <Card
              key={group.groupId}
              className="group-card"
              hover={true}            
              onClick={() => handleSelectGroup(group)}
            >
              {/* 카드 상단: 카테고리 색상 배경 */}
              <div 
                className="group-card__header"
                style={{ background: getCategoryColor(group.groupCategory) }}
              >
                <div className="group-card__icon">
                  {getCategoryIcon(group.groupCategory)}
                </div>
                <div className="group-card__badge">
                  {getCategoryLabel(group.groupCategory)}
                </div>
              </div>

              {/* 카드 하단: 정보 */}
              <div className="group-card__body">
                <h3 className="group-card__name">{group.groupName}</h3>
                <p className="group-card__description">
                  {group.description || '설명이 없는 그룹입니다.'}
                </p>

                {/* 통계 요약 (아이콘으로 심플하게) */}
                <div className="stat-item">
                  <span style={{ fontSize: '18px' }}>💰</span>
                  <span style={{ color: '#64748b', fontSize: '14px' }}>월 회비</span>
                  <span className="stat-value" style={{ marginLeft: 'auto' }}>
                    {group.fee?.toLocaleString() || 0}원
                  </span>
                </div>
              </div>
            </Card>
          ))}

          {/* 새 그룹 만들기 카드 (항상 마지막에 표시) */}
          <Card
            className="group-card group-card--create"
            hover={true}
            onClick={handleCreateNewGroup}
          >
            <div className="create-group-content">
              <div className="create-group-icon">➕</div>
              <h3 className="create-group-title">새 그룹 만들기</h3>
              <p style={{ fontSize: '14px', lineHeight: '1.5', opacity: 0.8 }}>
                새로운 모임을 시작하고<br />
                회비 관리를 자동화하세요!
              </p>
            </div>
          </Card>
        </div>

        {/* 하단 로그아웃 버튼 */}
        <div className="group-select-footer">
          <Button
            variant="secondary"
            size="medium"
            onClick={handleLogout}
            style={{ 
              background: 'rgba(255,255,255,0.5)', 
              border: '1px solid white',
              borderRadius: '20px',
              padding: '10px 24px'
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