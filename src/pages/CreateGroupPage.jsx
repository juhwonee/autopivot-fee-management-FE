import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import './CreateGroupPage.css';

const CreateGroupPage = () => {
  const navigate = useNavigate();
  
  // 그룹 기본 정보
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [monthlyFee, setMonthlyFee] = useState('');
  const [paymentDay, setPaymentDay] = useState('1');
  const [category, setCategory] = useState('');
  
  // 엑셀 파일 관련
  const [hasExcelFile, setHasExcelFile] = useState(null); // null, true, false
  const [excelFile, setExcelFile] = useState(null);
  const [fileName, setFileName] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: 기본정보, 2: 멤버정보

  // 카테고리 옵션
  const categories = [
    { value: 'club', label: '🎯 동아리' },
    { value: 'study', label: '📚 스터디' },
    { value: 'social', label: '🎉 친목회' },
    { value: 'project', label: '💼 프로젝트' },
    { value: 'etc', label: '📌 기타' }
  ];

  // 엑셀 파일 선택 핸들러
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 파일 확장자 체크
      const fileExtension = file.name.split('.').pop().toLowerCase();
      if (!['xlsx', 'xls', 'csv'].includes(fileExtension)) {
        alert('엑셀 파일(.xlsx, .xls) 또는 CSV 파일만 업로드 가능합니다.');
        return;
      }
      
      setExcelFile(file);
      setFileName(file.name);
    }
  };

  // 1단계 검증
  const validateStep1 = () => {
    if (!groupName.trim()) {
      alert('그룹명을 입력해주세요.');
      return false;
    }
    if (!monthlyFee || monthlyFee <= 0) {
      alert('월 회비 금액을 입력해주세요.');
      return false;
    }
    if (!category) {
      alert('그룹 카테고리를 선택해주세요.');
      return false;
    }
    return true;
  };

  // 다음 단계로
  const handleNextStep = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  // 그룹 생성 제출
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
      
      // 그룹 기본 정보
      const groupData = {
        groupName: groupName.trim(),
        groupDescription: groupDescription.trim(),
        monthlyFee: parseInt(monthlyFee),
        paymentDay: parseInt(paymentDay),
        category
      };
      
      formData.append('groupData', new Blob([JSON.stringify(groupData)], {
        type: 'application/json'
      }));
      
      // 엑셀 파일이 있으면 추가
      if (hasExcelFile && excelFile) {
        formData.append('memberFile', excelFile);
      }

      // ⭐ Spring API 엔드포인트
      const response = await fetch('https://seongchan-spring.store/api/groups', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('그룹 생성에 실패했습니다.');
      }

      const result = await response.json();
      
      alert('그룹이 성공적으로 생성되었습니다! 🎉');
      
      // 생성된 그룹 ID를 localStorage에 저장 (선택사항)
      localStorage.setItem('currentGroupId', result.groupId);
      
      // 대시보드로 이동
      navigate('/dashboard');
      
    } catch (error) {
      console.error('그룹 생성 오류:', error);
      alert('그룹 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-group-page">
      <div className="create-group-container">
        {/* 헤더 */}
        <div className="create-group-header">
          <h1 className="create-group-title">
            {currentStep === 1 ? '🎯 새로운 그룹 만들기' : '👥 멤버 정보 추가'}
          </h1>
          <p className="create-group-subtitle">
            {currentStep === 1 
              ? '회비를 관리할 그룹의 기본 정보를 입력해주세요'
              : '멤버를 추가하는 방법을 선택해주세요'
            }
          </p>
        </div>

        {/* 진행 단계 표시 */}
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
          {/* Step 1: 기본 정보 입력 */}
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
                      placeholder="예: 테니스 동호회, CS 스터디"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      maxLength={50}
                    />
                    <span className="form-hint">최대 50자</span>
                  </div>

                  {/* 그룹 설명 */}
                  <div className="form-group">
                    <label className="form-label">그룹 설명 (선택)</label>
                    <textarea
                      className="form-textarea"
                      placeholder="그룹에 대한 간단한 설명을 입력해주세요"
                      value={groupDescription}
                      onChange={(e) => setGroupDescription(e.target.value)}
                      maxLength={200}
                      rows={4}
                    />
                    <span className="form-hint">최대 200자</span>
                  </div>

                  {/* 카테고리 */}
                  <div className="form-group">
                    <label className="form-label required">그룹 카테고리</label>
                    <div className="category-grid">
                      {categories.map((cat) => (
                        <div
                          key={cat.value}
                          className={`category-option ${category === cat.value ? 'selected' : ''}`}
                          onClick={() => setCategory(cat.value)}
                        >
                          {cat.label}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3 className="form-section-title">💰 회비 정보</h3>
                  
                  {/* 월 회비 */}
                  <div className="form-group">
                    <label className="form-label required">월 회비 금액</label>
                    <div className="input-with-unit">
                      <input
                        type="number"
                        className="form-input"
                        placeholder="10000"
                        value={monthlyFee}
                        onChange={(e) => setMonthlyFee(e.target.value)}
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

          {/* Step 2: 멤버 정보 추가 */}
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

                  {/* 파일 유무 선택 */}
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

                  {/* 엑셀 파일 업로드 영역 */}
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

                  {/* 파일 없음 선택 시 안내 */}
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

              {/* 버튼 영역 */}
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