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
  const handleSelectGroup = useCallback((groupId) => {
    console.log('✅ 선택한 그룹 ID:', groupId);
    localStorage.setItem('currentGroupId', String(groupId));
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
      console.log('✅ 사용자 이름:', payload.name);
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
        console.log('✅ 가져온 그룹 목록:', data);
        
        setGroups(data);
        
        // 그룹이 없으면 그룹 생성 페이지로 이동
        if (data.length === 0) {
          alert('아직 가입된 그룹이 없습니다. 그룹을 만들어주세요!');
          navigate('/create-group');
          return;
        }
        
      } catch (error) {
        console.error('❌ 그룹 목록 로딩 오류:', error);
        alert('그룹 목록을 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroups();
  }, [navigate]);

  // ✅ 새 그룹 만들기
  const handleCreateNewGroup = () => {
    console.log('➕ 새 그룹 만들기 버튼 클릭');
    navigate('/create-group');
  };

  // ✅ 로그아웃
  const handleLogout = () => {
    console.log('👋 로그아웃 버튼 클릭');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('currentGroupId');
    navigate('/login');
  };

  // 카테고리별 아이콘
  const getCategoryIcon = (category) => {
    const icons = {
      'CLUB': '🎯',
      'STUDY': '📚',
      'SOCIAL_GATHERING': '🎉',
      'PROJECT': '💼',
      'OTHER': '📌'
    };
    return icons[category] || '📌';
  };

  // 카테고리별 배경 그라디언트
  const getCategoryColor = (category) => {
    const colors = {
      'CLUB': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'STUDY': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'SOCIAL_GATHERING': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'PROJECT': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'OTHER': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    };
    return colors[category] || colors['OTHER'];
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
            {groups.length > 0 
              ? '어떤 그룹으로 들어가시겠어요?' 
              : '새로운 그룹을 만들어보세요!'}
          </p>
        </div>

        {/* 그룹 카드 그리드 */}
        <div className="groups-grid">
          {groups.map((group) => (
            <Card
              key={group.groupId}
              className="group-card"
              hover={true}
              onClick={() => handleSelectGroup(group.groupId)}
            >
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

              <div className="group-card__body">
                <h3 className="group-card__name">{group.groupName}</h3>
                {group.description && (
                  <p className="group-card__description">
                    {group.description}
                  </p>
                )}

                <div className="group-card__stats">
                  <div className="stat-item">
                    <span className="stat-icon">💰</span>
                    <span className="stat-label">월 회비</span>
                    <span className="stat-value">
                      {group.fee?.toLocaleString() || 0}원
                    </span>
                  </div>
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
            onClick={handleLogout}
          >
            로그아웃
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GroupSelectPage;