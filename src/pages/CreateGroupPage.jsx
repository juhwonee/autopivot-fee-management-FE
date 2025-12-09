import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Button from '../components/common/Button';
import excelFormatImage from '../assets/images/excel.png'; 
import './CreateGroupPage.css';

const CreateGroupPage = () => {
  const navigate = useNavigate();

  // 그룹 기본 정보
  const [groupName, setGroupName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [description, setDescription] = useState('');
  const [fee, setFee] = useState('');
  const [groupCategory, setGroupCategory] = useState('');

  // 엑셀 파일 관련
  const [hasExcelFile, setHasExcelFile] = useState(null);
  const [excelFile, setExcelFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [createdGroupId, setCreatedGroupId] = useState(null);

  // 모달 상태들
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [showFormatModal, setShowFormatModal] = useState(false);

  const groupCategories = [
    { value: 'CLUB', label: '동아리' },
    { value: 'STUDY', label: '스터디' },
    { value: 'SOCIAL_GATHERING', label: '친목회' },
    { value: 'PROJECT', label: '프로젝트' },
    { value: 'OTHER', label: '기타' }
  ];

  const generateAccountName = (name) => {
    if (!name.trim()) return '';
    return `${name.trim()} 모임통장`;
  };

  const handleGroupNameChange = (e) => {
    const name = e.target.value;
    setGroupName(name);
    setAccountName(generateAccountName(name));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileExtension = file.name.split('.').pop().toLowerCase();
      if (!['xlsx', 'xls', 'csv'].includes(fileExtension)) {
        toast.error('엑셀 파일(.xlsx, .xls) 또는 CSV 파일만 업로드 가능합니다.');
        return;
      }
      setExcelFile(file);
      setFileName(file.name);
      toast.success(`${file.name} 파일이 선택되었습니다.`);
    }
  };

  const validateStep1 = () => {
    if (!groupName.trim()) {
      toast.error('그룹명을 입력해주세요.');
      return false;
    }
    if (!accountName.trim()) {
      toast.error('통장 이름을 입력해주세요.');
      return false;
    }
    if (!fee || fee <= 0) {
      toast.error('월 회비 금액을 입력해주세요.');
      return false;
    }
    if (!groupCategory) {
      toast.error('그룹 카테고리를 선택해주세요.');
      return false;
    }
    return true;
  };

  const handleCreateGroup = async () => {
    if (!validateStep1()) {
      return;
    }

    const loadingToast = toast.loading('그룹 생성 중...');
    try {
      setIsLoading(true);

      const groupData = {
        groupName: groupName.trim(),
        accountName: accountName.trim(),
        description: description.trim(),
        fee: parseInt(fee),
        groupCategory
      };

      const response = await fetch('https://seongchan-spring.store/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(groupData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '그룹 생성에 실패했습니다.');
      }

      const result = await response.json();
      const groupId = result.groupId || result.id;

      if (!groupId) {
        throw new Error('그룹 ID를 받지 못했습니다.');
      }

      setCreatedGroupId(groupId);
      localStorage.setItem('currentGroupId', groupId);

      toast.success('그룹이 생성되었습니다!', { id: loadingToast });
      setCurrentStep(2);
    } catch (error) {
      console.error('그룹 생성 오류:', error);
      toast.error(error.message || '그룹 생성 중 오류가 발생했습니다.', { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMembers = async () => {
    if (!hasExcelFile || !excelFile) {
      toast.success('그룹이 성공적으로 생성되었습니다!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
      return;
    }

    const loadingToast = toast.loading('멤버 추가 중...');
    try {
      setIsLoading(true);

      const formData = new FormData();
      formData.append('file', excelFile);

      const response = await fetch(
        `https://seongchan-spring.store/api/groups/${createdGroupId}/members/upload`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          body: formData
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '멤버 추가에 실패했습니다.');
      }

      const result = await response.json();
      toast.success(`${result.count || result.length || '여러'} 명의 멤버가 추가되었습니다!`, { id: loadingToast });

      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } catch (error) {
      console.error('멤버 추가 오류:', error);
      toast.error(`멤버 추가 중 오류 발생: ${error.message}`, { id: loadingToast });
      toast('그룹 페이지에서 나중에 멤버를 추가할 수 있습니다.', {
        icon: 'ℹ️',
        duration: 4000
      });

      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hasExcelFile || !excelFile) {
      toast.error('엑셀 파일을 업로드해주세요.');
      return;
    }

    await handleAddMembers();
  };

  return (
    <div className="create-group-page">
      <div className="create-group-glass-panel">
        <form onSubmit={handleSubmit}>
          {/* 헤더 */}
          <div className="create-group-header">
            <h1 className="create-group-title">
              {currentStep === 1 ? '그룹 만들기' : '멤버 초대하기'}
            </h1>
            <p className="create-group-subtitle">
              {currentStep === 1
                ? '모임 관리를 위한 기본 정보를 알려주세요.'
                : '함께할 멤버들을 어떻게 추가할까요?'
              }
            </p>
          </div>

          {/* 진행 단계 (Progress Bar) */}
          <div className="progress-steps">
            <div className={`progress-step ${currentStep >= 1 ? 'active' : ''}`}>
              <div className="progress-step-number">1</div>
              <span className="progress-step-label">기본 정보</span>
            </div>
            <div className="progress-step-line"></div>
            <div className={`progress-step ${currentStep >= 2 ? 'active' : ''}`}>
              <div className="progress-step-number">2</div>
              <span className="progress-step-label">멤버 추가</span>
            </div>
          </div>

          {/* Step 1: 그룹 기본 정보 */}
          {currentStep === 1 && (
            <div className="form-step">
              {/* ✨ 안내 배너 추가 */}
              <div className="info-banner">
                <span className="info-banner-icon">✏️</span>
                <p className="info-banner-text">
                  걱정 마세요! 모든 정보는 그룹 생성 후에도 <strong>언제든 수정</strong>할 수 있어요.
                </p>
              </div>

              <div className="form-section">
                <h3 className="form-section-title">기본 정보</h3>

                <div className="form-group">
                  <label className="form-label required">그룹명</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="예: 우리 스터디, 대학 동아리"
                    value={groupName}
                    onChange={handleGroupNameChange}
                    maxLength={50}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label required">통장 이름</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="자동 생성됩니다"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    maxLength={100}
                  />
                  <span className="form-hint">입금 확인 시 표시될 통장 이름입니다.</span>
                </div>

                <div className="form-group">
                  <label className="form-label">설명 (선택)</label>
                  <textarea
                    className="form-textarea"
                    placeholder="그룹에 대한 간단한 설명을 입력해주세요."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={200}
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label required">카테고리</label>
                  <div className="category-grid">
                    {groupCategories.map((cat) => (
                      <div
                        key={cat.value}
                        className={`category-option ${groupCategory === cat.value ? 'selected' : ''}`}
                        onClick={() => setGroupCategory(cat.value)}
                      >
                        {cat.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="form-section-title">회비 설정</h3>
                <div className="form-group">
                  <label className="form-label required">월 회비</label>
                  <div className="input-with-unit">
                    <input
                      type="number"
                      className="form-input"
                      placeholder="0"
                      value={fee}
                      onChange={(e) => setFee(e.target.value)}
                      min="1"
                      step="any"
                    />
                    <span className="input-unit">원</span>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <Button
                  type="button"
                  variant="primary"
                  size="large"
                  onClick={handleCreateGroup}
                  disabled={isLoading}
                  fullWidth
                  style={{ borderRadius: '16px', height: '54px', fontSize: '16px' }}
                >
                  {isLoading ? '그룹 생성 중...' : '다음으로 계속하기'}
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: 멤버 추가 */}
          {currentStep === 2 && (
            <div className="form-step">
              <div className="form-section">
                <h3 className="form-section-title">멤버 일괄 추가</h3>
                <p className="form-hint" style={{ marginBottom: '20px', fontSize: '14px' }}>
                  엑셀 파일로 멤버를 한 번에 등록할 수 있습니다.<br />
                  없으시면 건너뛰고 나중에 추가해도 됩니다.
                </p>

                <div className="excel-choice">
                  <div
                    className={`choice-card ${hasExcelFile === true ? 'selected' : ''}`}
                    onClick={() => {
                      setHasExcelFile(true);
                      setExcelFile(null);
                      setFileName('');
                    }}
                  >
                    <span className="choice-icon">📁</span>
                    <span className="choice-title">파일이 있어요</span>
                    <span className="choice-description">엑셀/CSV 업로드</span>
                  </div>

                  <div
                    className={`choice-card ${hasExcelFile === false ? 'selected' : ''}`}
                    onClick={() => {
                      setHasExcelFile(false);
                      setExcelFile(null);
                      setFileName('');
                    }}
                  >
                    <span className="choice-icon">✋</span>
                    <span className="choice-title">없어요</span>
                    <span className="choice-description">나중에 추가할게요</span>
                  </div>
                </div>

                {hasExcelFile === true && (
                  <div className="file-upload-section">
                    {/* 📋 양식 안내 버튼 */}
                    <button
                      type="button"
                      className="format-guide-button"
                      onClick={() => setShowFormatModal(true)}
                    >
                      <span className="format-guide-icon">📋</span>
                      <span className="format-guide-text">엑셀 양식 안내 보기</span>
                      <span className="format-guide-arrow">→</span>
                    </button>

                    <div className="file-upload-area">
                      <input
                        type="file"
                        id="excel-file"
                        className="file-input"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileChange}
                      />
                      <label htmlFor="excel-file" className="file-upload-label">
                        {fileName ? (
                          <>
                            <span className="choice-icon">📄</span>
                            <p className="file-name">{fileName}</p>
                            <p className="file-hint">파일을 변경하려면 클릭하세요</p>
                          </>
                        ) : (
                          <>
                            <span className="choice-icon">📤</span>
                            <p className="file-upload-text">여기를 클릭해 파일을 업로드하세요</p>
                            <p className="file-hint">지원 형식: .xlsx, .xls, .csv</p>
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* ✅ 수정된 버튼 영역 */}
              <div className="form-actions">
                <Button
                  type="button"
                  variant="secondary"
                  size="large"
                  onClick={() => setShowSkipModal(true)}
                  style={{ flex: hasExcelFile ? 1 : 'none', width: hasExcelFile ? 'auto' : '100%', borderRadius: '16px', height: '54px' }}
                  disabled={isLoading}
                >
                  건너뛰기
                </Button>

                {hasExcelFile && (
                  <Button
                    type="submit"
                    variant="primary"
                    size="large"
                    disabled={isLoading || !excelFile}
                    style={{ flex: 2, borderRadius: '16px', height: '54px' }}
                  >
                    {isLoading ? '멤버 추가 중...' : '멤버 추가 완료'}
                  </Button>
                )}
              </div>
            </div>
          )}
        </form>
      </div>

      {/* 건너뛰기 확인 모달 */}
      {showSkipModal && (
        <div className="modal-overlay" onClick={() => setShowSkipModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">멤버 추가 건너뛰기</h3>
            <p style={{ color: '#64748b', marginBottom: '24px', lineHeight: '1.6' }}>
              멤버 추가를 건너뛰고 대시보드로 이동하시겠습니까?<br />
              나중에 멤버 관리에서 추가할 수 있습니다.
            </p>
            <div className="modal-buttons">
              <button className="btn-cancel" onClick={() => setShowSkipModal(false)}>취소</button>
              <button
                className="btn-submit"
                onClick={() => {
                  setShowSkipModal(false);
                  toast.success('그룹이 생성되었습니다!');
                  navigate('/dashboard');
                }}
              >
                건너뛰기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📋 엑셀 양식 안내 모달 */}
      {showFormatModal && (
        <div className="modal-overlay" onClick={() => setShowFormatModal(false)}>
          <div className="format-modal-content" onClick={(e) => e.stopPropagation()}>
            {/* 모달 헤더 */}
            <div className="format-modal-header">
              <div className="format-modal-icon">📋</div>
              <h3 className="format-modal-title">엑셀 양식 안내</h3>
              <button
                className="format-modal-close"
                onClick={() => setShowFormatModal(false)}
                aria-label="닫기"
              >
                ✕
              </button>
            </div>

            {/* 이미지 영역 */}
            <div className="format-modal-image-wrapper">
              <img
                src={excelFormatImage}
                alt="엑셀 양식 예시"
                className="format-modal-image"
              />
            </div>

            {/* 설명 영역 */}
            <div className="format-modal-description">
              <h4 className="format-desc-title">필수 컬럼 안내</h4>
              <ul className="format-desc-list">
                <li>
                  <span className="format-desc-label">이름</span>
                  <span className="format-desc-value">멤버의 실명을 입력해주세요</span>
                </li>
                <li>
                  <span className="format-desc-label">전화번호</span>
                  <span className="format-desc-value">010-0000-0000 형식 권장</span>
                </li>
                <li>
                  <span className="format-desc-label">이메일</span>
                  <span className="format-desc-value">알림 발송용 이메일 주소</span>
                </li>
              </ul>

              <div className="format-tips">
                <span className="format-tips-icon">💡</span>
                <p className="format-tips-text">
                  첫 번째 행은 헤더(이름, 전화번호, 이메일)로 사용됩니다.<br />
                  두 번째 행부터 실제 멤버 정보를 입력해주세요.
                </p>
              </div>
            </div>

            {/* 모달 푸터 */}
            <div className="format-modal-footer">
              <button
                className="btn-submit"
                onClick={() => setShowFormatModal(false)}
                style={{ width: '100%' }}
              >
                확인했어요
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateGroupPage;