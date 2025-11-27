import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/common/Modal';
import './GroupSettingsPage.css';

const GroupSettingsPage = () => {
  const navigate = useNavigate();
  
  // 그룹 기본 정보
  const [groupName, setGroupName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [description, setDescription] = useState('');
  const [fee, setFee] = useState('');
  const [groupCategory, setGroupCategory] = useState('');
  
  // 원본 데이터 (변경 감지용)
  const [originalData, setOriginalData] = useState(null);
  
  // 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // 모달 상태
  const [modalInfo, setModalInfo] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'alert',
    onConfirm: null
  });

  const groupCategories = [
    { value: 'CLUB', label: '동아리' },
    { value: 'STUDY', label: '스터디' },
    { value: 'SOCIAL_GATHERING', label: '친목회' },
    { value: 'PROJECT', label: '프로젝트' },
    { value: 'OTHER', label: '기타' }
  ];

  // 모달 함수들
  const closeModal = () => {
    setModalInfo(prev => ({ ...prev, isOpen: false }));
  };

  const showModal = (title, message, onConfirm = null, type = 'alert') => {
    setModalInfo({
      isOpen: true,
      title,
      message,
      type,
      onConfirm
    });
  };

  // 그룹 정보 불러오기
  const fetchGroupInfo = useCallback(async () => {
    const groupId = localStorage.getItem('currentGroupId');
    
    if (!groupId || groupId === 'undefined' || groupId === 'null') {
      showModal('오류', '그룹을 먼저 선택해주세요.', () => {
        navigate('/select-group');
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await fetch(
        `https://seongchan-spring.store/api/groups/${groupId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('그룹 정보를 불러오는데 실패했습니다.');
      }

      const data = await response.json();
      
      // 폼에 데이터 설정
      setGroupName(data.groupName || '');
      setAccountName(data.accountName || '');
      setDescription(data.description || '');
      setFee(data.fee?.toString() || '');
      setGroupCategory(data.groupCategory || '');
      
      // 원본 데이터 저장
      setOriginalData({
        groupName: data.groupName || '',
        accountName: data.accountName || '',
        description: data.description || '',
        fee: data.fee?.toString() || '',
        groupCategory: data.groupCategory || ''
      });
      
    } catch (error) {
      console.error('그룹 정보 로딩 오류:', error);
      showModal('오류', error.message);
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
    fetchGroupInfo();
  }, [fetchGroupInfo, navigate]);

  // 변경사항 확인
  const hasChanges = () => {
    if (!originalData) return false;
    return (
      groupName !== originalData.groupName ||
      accountName !== originalData.accountName ||
      description !== originalData.description ||
      fee !== originalData.fee ||
      groupCategory !== originalData.groupCategory
    );
  };

  // 유효성 검사
  const validateForm = () => {
    if (!groupName.trim()) {
      showModal('입력 오류', '그룹명을 입력해주세요.');
      return false;
    }
    if (!accountName.trim()) {
      showModal('입력 오류', '통장 이름을 입력해주세요.');
      return false;
    }
    if (!fee || parseInt(fee) <= 0) {
      showModal('입력 오류', '월 회비 금액을 입력해주세요.');
      return false;
    }
    if (!groupCategory) {
      showModal('입력 오류', '그룹 카테고리를 선택해주세요.');
      return false;
    }
    return true;
  };

  // 그룹 정보 수정
  const handleSave = async () => {
    if (!validateForm()) return;
    
    if (!hasChanges()) {
      showModal('알림', '변경된 내용이 없습니다.');
      return;
    }

    const groupId = localStorage.getItem('currentGroupId');

    try {
      setIsSaving(true);
      
      const updateData = {
        groupName: groupName.trim(),
        accountName: accountName.trim(),
        description: description.trim(),
        fee: parseInt(fee),
        groupCategory
      };

      const response = await fetch(
        `https://seongchan-spring.store/api/groups/${groupId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          body: JSON.stringify(updateData)
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '그룹 정보 수정에 실패했습니다.');
      }

      // 원본 데이터 업데이트
      setOriginalData({
        groupName: groupName.trim(),
        accountName: accountName.trim(),
        description: description.trim(),
        fee: fee,
        groupCategory
      });

      showModal('성공', '그룹 정보가 수정되었습니다.', () => {
        navigate('/dashboard');
      });
      
    } catch (error) {
      console.error('그룹 수정 오류:', error);
      showModal('오류', error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // 그룹 삭제
  const handleDelete = () => {
    showModal(
      '그룹 삭제',
      '정말로 이 그룹을 삭제하시겠습니까?\n\n삭제된 그룹은 복구할 수 없으며, 모든 멤버와 회비 내역이 함께 삭제됩니다.',
      async () => {
        const groupId = localStorage.getItem('currentGroupId');
        
        try {
          setIsDeleting(true);
          
          const response = await fetch(
            `https://seongchan-spring.store/api/groups/${groupId}`,
            {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
              }
            }
          );

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || '그룹 삭제에 실패했습니다.');
          }

          // 로컬 스토리지에서 그룹 ID 제거
          localStorage.removeItem('currentGroupId');
          
          showModal('삭제 완료', '그룹이 삭제되었습니다.', () => {
            navigate('/select-group');
          });
          
        } catch (error) {
          console.error('그룹 삭제 오류:', error);
          showModal('오류', error.message);
        } finally {
          setIsDeleting(false);
        }
      },
      'confirm'
    );
  };

  // 뒤로가기 (변경사항 확인)
  const handleBack = () => {
    if (hasChanges()) {
      showModal(
        '변경사항 있음',
        '저장하지 않은 변경사항이 있습니다.\n정말 나가시겠습니까?',
        () => navigate('/dashboard'),
        'confirm'
      );
    } else {
      navigate('/dashboard');
    }
  };

  // 로딩 화면
  if (isLoading) {
    return (
      <div className="group-settings-page">
        <div className="group-settings-glass-panel">
          <div className="settings-loading-container">
            <div className="settings-spinner"></div>
            <p className="settings-loading-text">그룹 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group-settings-page">
      <div className="group-settings-glass-panel">
        
        {/* 헤더 */}
        <div className="group-settings-header">
          <div className="group-settings-header-row">
            <button
              onClick={handleBack}
              className="group-settings-back-btn"
              aria-label="뒤로가기"
            >
              ←
            </button>
            <div>
              <h1 className="group-settings-title">그룹 설정</h1>
              <p className="group-settings-subtitle">
                그룹 정보를 수정하거나 삭제할 수 있습니다.
              </p>
            </div>
            {hasChanges() && (
              <span className="settings-changes-badge">변경됨</span>
            )}
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          
          {/* 섹션 1: 기본 정보 */}
          <div className="settings-form-section">
            <h3 className="settings-section-title">기본 정보</h3>
            
            <div className="settings-form-group">
              <label className="settings-form-label required">그룹명</label>
              <input
                type="text"
                className="settings-form-input"
                placeholder="예: 2024 독서 모임"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                maxLength={50}
              />
            </div>

            <div className="settings-form-group">
              <label className="settings-form-label required">통장 이름</label>
              <input
                type="text"
                className="settings-form-input"
                placeholder="입금 확인 시 표시될 이름"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                maxLength={100}
              />
              <span className="settings-form-hint">
                입금 확인 시 표시될 통장 이름입니다.
              </span>
            </div>

            <div className="settings-form-group">
              <label className="settings-form-label">설명 (선택)</label>
              <textarea
                className="settings-form-textarea"
                placeholder="어떤 모임인지 간단하게 소개해주세요."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={200}
                rows={3}
              />
            </div>

            <div className="settings-form-group">
              <label className="settings-form-label required">카테고리</label>
              <div className="settings-category-grid">
                {groupCategories.map((cat) => (
                  <div
                    key={cat.value}
                    className={`settings-category-option ${groupCategory === cat.value ? 'selected' : ''}`}
                    onClick={() => setGroupCategory(cat.value)}
                  >
                    {cat.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 섹션 2: 회비 정보 */}
          <div className="settings-form-section">
            <h3 className="settings-section-title">회비 설정</h3>
            
            <div className="settings-form-group">
              <label className="settings-form-label required">월 회비</label>
              <div className="settings-input-with-unit">
                <input
                  type="number"
                  className="settings-form-input"
                  placeholder="0"
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  min="1"
                  step="any"
                />
                <span className="settings-input-unit">원</span>
              </div>
            </div>
          </div>

          {/* 섹션 3: 위험 구역 */}
          <div className="settings-danger-section">
            <h3 className="settings-danger-title">⚠️ 위험 구역</h3>
            <p className="settings-danger-description">
              그룹을 삭제하면 모든 멤버 정보와 회비 내역이 영구적으로 삭제됩니다.
              이 작업은 되돌릴 수 없습니다.
            </p>
            <button
              type="button"
              className="settings-delete-btn"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? '삭제 중...' : '🗑️ 그룹 삭제하기'}
            </button>
          </div>

          {/* 저장 버튼 */}
          <div className="settings-form-actions">
            <button
              type="button"
              className="settings-btn settings-btn-secondary"
              onClick={handleBack}
              disabled={isSaving}
            >
              취소
            </button>
            <button
              type="submit"
              className="settings-btn settings-btn-primary"
              disabled={isSaving || !hasChanges()}
            >
              {isSaving ? '저장 중...' : '변경사항 저장'}
            </button>
          </div>
        </form>
      </div>

      {/* 모달 컴포넌트 */}
      <Modal 
        isOpen={modalInfo.isOpen}
        onClose={closeModal}
        onConfirm={modalInfo.onConfirm}
        title={modalInfo.title}
        message={modalInfo.message}
        type={modalInfo.type}
      />
    </div>
  );
};

export default GroupSettingsPage;