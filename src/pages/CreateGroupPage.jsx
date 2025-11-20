import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import './CreateGroupPage.css';

const CreateGroupPage = () => {
  const navigate = useNavigate();
  
  // 그룹 기본 정보 (백엔드 DTO와 동일하게)
  const [groupName, setGroupName] = useState('');
  const [accountName, setAccountName] = useState('');  // ✅ 추가!
  const [description, setDescription] = useState('');
  const [fee, setFee] = useState('');
  const [groupCategory, setGroupCategory] = useState('');
  
  // 엑셀 파일 관련
  const [hasExcelFile, setHasExcelFile] = useState(null);
  const [excelFile, setExcelFile] = useState(null);
  const [fileName, setFileName] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const groupCategories = [
    { value: 'CLUB', label: '동아리' },
    { value: 'STUDY', label: '스터디' },
    { value: 'SOCIAL_GATHERING', label: '친목회' },
    { value: 'PROJECT', label: '프로젝트' },
    { value: 'OTHER', label: '기타' }
  ];

  // ✅ accountName 자동 생성 함수 추가
  const generateAccountName = (name) => {
    if (!name.trim()) return '';
    return `${name.trim()} 모임 통장`;
  };

  // ✅ 그룹명 변경 시 통장 이름도 자동 생성
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
        alert('엑셀 파일(.xlsx, .xls) 또는 CSV 파일만 업로드 가능합니다.');
        return;
      }
      setExcelFile(file);
      setFileName(file.name);
    }
  };

  // 1단계 검증 (✅ accountName 추가)
  const validateStep1 = () => {
    if (!groupName.trim()) {
      alert('그룹명을 입력해주세요.');
      return false;
    }
    if (!accountName.trim()) {
      alert('통장 이름을 입력해주세요.');
      return false;
    }
    if (!fee || fee <= 0) {
      alert('월 회비 금액을 입력해주세요.');
      return false;
    }
    if (!groupCategory) {
      alert('그룹 카테고리를 선택해주세요.');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (hasExcelFile === null) {
      alert('엑셀 파일 보유 여부를 선택해주세요.');
      return;
    }
    
    if (hasExcelFile && !excelFile) {
      alert('엑셀 파일을 업로드해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      
      const formData = new FormData();
      
      // ✅ accountName 추가
      const groupData = {
        groupName: groupName.trim(),
        accountName: accountName.trim(),  // ✅ 추가!
        description: description.trim(),
        fee: parseInt(fee),
        groupCategory
      };
      
      formData.append('groupData', new Blob([JSON.stringify(groupData)], {
        type: 'application/json'
      }));
      
      if (hasExcelFile && excelFile) {
        formData.append('memberFile', excelFile);
      }

      const response = await fetch('https://seongchan-spring.store/api/groups', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '그룹 생성에 실패했습니다.');
      }

      const result = await response.json();
      
      alert('그룹이 성공적으로 생성되었습니다!');
      
      // ✅ groupId 필드명 확인 (백엔드에서 id로 올 수도 있음)
      if (result.groupId || result.id) {
        localStorage.setItem('currentGroupId', result.groupId || result.id);
      }
      
      navigate('/dashboard');
      
    } catch (error) {
      console.error('그룹 생성 오류:', error);
      alert(error.message || '그룹 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-group-page">
      <div className="create-group-container">
        <div className="create-group-header">
          <h1 className="create-group-title">
            {currentStep === 1 ? '새로운 그룹 만들기' : '멤버 정보 추가'}
          </h1>
          <p className="create-group-subtitle">
            {currentStep === 1 
              ? '회비를 관리할 그룹의 기본 정보를 입력해주세요'
              : '멤버를 추가하는 방법을 선택해주세요'
            }
          </p>
        </div>

        <div className="progress-steps">
          <div className={`progress-step ${currentStep >= 1 ? 'active' : ''}`}>
            <div className="progress-step-number">1</div>
            <div className="progress-step-label">기본 정보</div>
          </div>
          <div className="progress-step-line"></div>
          <div className={`progress-step ${currentStep >= 2 ? 'active' : ''}`}>
            <div className="progress-step-number">2</div>
            <div className="progress-step-label">멤버 추가</div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {currentStep === 1 && (
            <div className="form-step">
              <Card className="form-card" padding="large">
                <div className="form-section">
                  <h3 className="form-section-title">📝 그룹 기본 정보</h3>
                  
                  {/* 그룹명 */}
                  <div className="form-group">
                    <label className="form-label required">그룹명</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="예: ICON, 테니스 동호회"
                      value={groupName}
                      onChange={handleGroupNameChange}  // ✅ 수정
                      maxLength={50}
                    />
                    <span className="form-hint">최대 50자</span>
                  </div>

                  {/* ✅ 통장 이름 추가 */}
                  <div className="form-group">
                    <label className="form-label required">통장 이름</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="예: ICON 모임 통장"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      maxLength={100}
                    />
                    <span className="form-hint">
                      💡 입금 알림에 표시되는 통장 이름을 입력하세요 (자동 입력됨)
                    </span>
                  </div>

                  {/* 그룹 설명 */}
                  <div className="form-group">
                    <label className="form-label">그룹 설명 (선택)</label>
                    <textarea
                      className="form-textarea"
                      placeholder="그룹에 대한 간단한 설명을 입력해주세요"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      maxLength={200}
                      rows={4}
                    />
                    <span className="form-hint">최대 200자</span>
                  </div>

                  {/* 카테고리 */}
                  <div className="form-group">
                    <label className="form-label required">그룹 카테고리</label>
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
                  <h3 className="form-section-title">💰 회비 정보</h3>
                  
                  <div className="form-group">
                    <label className="form-label required">월 회비 금액</label>
                    <div className="input-with-unit">
                      <input
                        type="number"
                        className="form-input"
                        placeholder="10000"
                        value={fee}
                        onChange={(e) => setFee(e.target.value)}
                        min="0"
                        step="1000"
                      />
                      <span className="input-unit">원</span>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="form-actions">
                <Button
                  type="button"
                  variant="primary"
                  size="large"
                  onClick={handleNextStep}
                  fullWidth
                >
                  다음 단계로 →
                </Button>
              </div>
            </div>
          )}

          {/* Step 2는 동일 */}
          {currentStep === 2 && (
            <div className="form-step">
              <Card className="form-card" padding="large">
                <div className="form-section">
                  <h3 className="form-section-title">📁 그룹 멤버 엑셀 파일이 있나요?</h3>
                  <p className="form-description">
                    엑셀 파일(.xlsx, .xls, .csv)이 있으면 한 번에 멤버를 추가할 수 있어요!
                    <br />
                    없어도 괜찮아요. 나중에 하나씩 추가할 수 있습니다.
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
                      <div className="choice-icon">📄</div>
                      <h4 className="choice-title">네, 있어요!</h4>
                      <p className="choice-description">엑셀 파일로 멤버 추가하기</p>
                    </div>

                    <div
                      className={`choice-card ${hasExcelFile === false ? 'selected' : ''}`}
                      onClick={() => {
                        setHasExcelFile(false);
                        setExcelFile(null);
                        setFileName('');
                      }}
                    >
                      <div className="choice-icon">✋</div>
                      <h4 className="choice-title">아니요, 없어요</h4>
                      <p className="choice-description">나중에 멤버 추가할게요</p>
                    </div>
                  </div>

                  {hasExcelFile === true && (
                    <div className="file-upload-section">
                      <div className="file-upload-info">
                        <div className="info-icon">💡</div>
                        <div className="info-content">
                          <p className="info-title">엑셀 파일 양식 안내</p>
                          <p className="info-text">
                            • 첫 번째 행: 이름, 전화번호, 이메일 (헤더)
                            <br />
                            • 두 번째 행부터: 멤버 정보 입력
                            <br />
                            • 예시: 홍길동 | 010-1234-5678 | hong@example.com
                          </p>
                        </div>
                      </div>

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
                              <div className="file-uploaded-icon">✅</div>
                              <p className="file-name">{fileName}</p>
                              <p className="file-hint">다른 파일을 선택하려면 클릭하세요</p>
                            </>
                          ) : (
                            <>
                              <div className="file-upload-icon">📤</div>
                              <p className="file-upload-text">파일을 선택하거나 여기에 드래그하세요</p>
                              <p className="file-hint">지원 형식: .xlsx, .xls, .csv</p>
                            </>
                          )}
                        </label>
                      </div>
                    </div>
                  )}

                  {hasExcelFile === false && (
                    <div className="no-file-info">
                      <div className="info-icon">✨</div>
                      <p className="info-title">걱정 마세요!</p>
                      <p className="info-text">
                        그룹 생성 후 대시보드에서 언제든지 멤버를 추가할 수 있습니다.
                        <br />
                        '멤버 관리' 메뉴에서 하나씩 추가하거나 나중에 엑셀로 일괄 업로드도 가능해요!
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              <div className="form-actions">
                <Button
                  type="button"
                  variant="secondary"
                  size="large"
                  onClick={() => setCurrentStep(1)}
                  style={{ flex: 1 }}
                >
                  ← 이전
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="large"
                  disabled={isLoading}
                  style={{ flex: 2 }}
                >
                  {isLoading ? '생성 중...' : '그룹 만들기 🎉'}
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreateGroupPage;