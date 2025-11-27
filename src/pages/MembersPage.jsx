import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './MembersPage.css';

// groupId 유효성 검증
const isValidGroupId = (groupId) => {
  return groupId && groupId !== 'undefined' && groupId !== 'null';
};

function MembersPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [groupName, setGroupName] = useState('');
  
  const [members, setMembers] = useState([]);

  const [newMember, setNewMember] = useState({
    name: '',
    phone: '',
    email: '',
    amount: 0,
    studentId: ''
  });

  const fetchMembers = useCallback(async () => {
    const groupId = localStorage.getItem('currentGroupId');
    const token = localStorage.getItem('accessToken');

    try {
      setIsLoading(true);
      const response = await fetch(
        `https://seongchan-spring.store/api/groups/${groupId}/members`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMembers(data);
      } else if (response.status === 401) {
        alert('로그인이 만료되었습니다.');
        navigate('/login', { replace: true });
      }
    } catch (error) {
      console.error('멤버 목록 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const groupId = localStorage.getItem('currentGroupId');
    const currentGroup = localStorage.getItem('currentGroup');

    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    if (!isValidGroupId(groupId)) {
      navigate('/select-group', { replace: true });
      return;
    }

    if (currentGroup) {
      try {
        const group = JSON.parse(currentGroup);
        setGroupName(group.groupName || '');
      } catch (e) {
        console.error('그룹 정보 파싱 실패:', e);
      }
    }

    fetchMembers();
  }, [navigate, fetchMembers]); // fetchMembers를 의존성 배열에 포함

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('파일을 먼저 선택해주세요!');
      return;
    }

    const groupId = localStorage.getItem('currentGroupId');
    const token = localStorage.getItem('accessToken');

    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(
        `https://seongchan-spring.store/api/groups/${groupId}/members/upload`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        await fetchMembers();
        alert(`${data.count || '멤버'}명이 업로드되었습니다!`);
        setFile(null);
        
        const fileInput = document.getElementById('file-input');
        if (fileInput) fileInput.value = '';
      } else {
        const error = await response.json();
        alert('업로드 실패: ' + (error.message || '서버 오류'));
      }
    } catch (error) {
      console.error('업로드 에러:', error);
      alert('서버 연결 실패!');
    } finally {
      setUploading(false);
    }
  };

  const handleAddMember = async () => {
    if (!newMember.name) {
      alert('이름은 필수입니다!');
      return;
    }

    const groupId = localStorage.getItem('currentGroupId');
    const token = localStorage.getItem('accessToken');

    try {
      const response = await fetch(
        `https://seongchan-spring.store/api/groups/${groupId}/members`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: newMember.name,
            phone: newMember.phone,
            email: newMember.email,
            amount: parseInt(newMember.amount) || 0,
            studentId: newMember.studentId
          })
        }
      );

      if (response.ok) {
        await fetchMembers();
        setShowAddModal(false);
        setNewMember({ name: '', phone: '', email: '', amount: 0, studentId: '' });
        alert('멤버가 추가되었습니다!');
      } else {
        const error = await response.json();
        alert('추가 실패: ' + (error.message || '서버 오류'));
      }
    } catch (error) {
      console.error('멤버 추가 실패:', error);
      alert('서버 연결 실패!');
    }
  };

  if (isLoading) {
    return (
      <div className="member-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>멤버 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="member-page">
      <div className="member-page__container">
        <div className="member-page__header">
          <button className="back-button" onClick={() => navigate('/dashboard')}>
            ← 대시보드
          </button>
          <div className="header-center">
            <h1 className="member-page__title">멤버 관리</h1>
            {groupName && (
              <p className="member-page__group">
                <span className="group-badge">GROUP</span>
                {groupName}
              </p>
            )}
          </div>
          <div className="header-spacer"></div>
        </div>

        <div className="member-page__content">
          <div className="member-list-main">
            <div className="section-header">
              <h3 className="section-title">멤버 목록</h3>
              <span className="member-count">{members.length}명</span>
            </div>

            {members.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">👥</div>
                <p>아직 등록된 멤버가 없습니다.</p>
                <p className="empty-hint">오른쪽에서 멤버를 추가해보세요!</p>
              </div>
            ) : (
              <div className="member-table-wrapper">
                <table className="member-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>이름</th>
                      <th>학번</th>
                      <th>전화번호</th>
                      <th>납부 금액</th>
                      <th>상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member, index) => (
                      <tr key={member.id || index} className={member.amount > 0 ? 'paid' : 'unpaid'}>
                        <td className="member-index">{index + 1}</td>
                        <td className="member-name">{member.name}</td>
                        <td className="member-student-id">{member.studentId || '-'}</td>
                        <td className="member-phone">{member.phone || '-'}</td>
                        <td className="member-amount">{(member.amount || 0).toLocaleString()}원</td>
                        <td>
                          <span className={`status-badge ${member.amount > 0 ? 'status-paid' : 'status-unpaid'}`}>
                            {member.amount > 0 ? '✅ 납부' : '⏳ 미납'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="stats-section">
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <div className="stat-label">전체 멤버</div>
                  <div className="stat-value">{members.length}명</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-content">
                  <div className="stat-label">납부 완료</div>
                  <div className="stat-value">{members.filter(m => m.amount > 0).length}명</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⏳</div>
                <div className="stat-content">
                  <div className="stat-label">미납</div>
                  <div className="stat-value">{members.filter(m => !m.amount || m.amount === 0).length}명</div>
                </div>
              </div>
              <div className="stat-card highlight">
                <div className="stat-icon">💰</div>
                <div className="stat-content">
                  <div className="stat-label">총 납부액</div>
                  <div className="stat-value">{members.reduce((sum, m) => sum + (m.amount || 0), 0).toLocaleString()}원</div>
                </div>
              </div>
            </div>
          </div>

          <div className="upload-sidebar">
            <div className="upload-card">
              <h4 className="upload-card__title">📁 엑셀 업로드</h4>
              <p className="upload-card__desc">멤버 명단 엑셀 파일을 업로드하세요</p>
              <div className="upload-area">
                <input type="file" id="file-input" className="file-input" accept=".xlsx,.xls" onChange={handleFileChange} />
                <label htmlFor="file-input" className="file-label">
                  <div className="file-icon">📄</div>
                  <div className="file-text">{file ? file.name : '클릭하여 파일 선택'}</div>
                  <div className="file-hint">.xlsx, .xls 파일</div>
                </label>
              </div>
              <button className="upload-btn" onClick={handleUpload} disabled={!file || uploading}>
                {uploading ? '업로드 중...' : '📤 업로드'}
              </button>
            </div>

            <div className="add-card">
              <h4 className="add-card__title">➕ 수동 추가</h4>
              <p className="add-card__desc">멤버를 직접 입력하여 추가합니다</p>
              <button className="add-btn" onClick={() => setShowAddModal(true)}>➕ 새 멤버 추가</button>
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">➕ 새 멤버 추가</h3>
            <div className="form-group">
              <label>이름 *</label>
              <input type="text" placeholder="예: 홍길동" value={newMember.name} onChange={(e) => setNewMember({ ...newMember, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>학번</label>
              <input type="text" placeholder="예: 20241234" value={newMember.studentId} onChange={(e) => setNewMember({ ...newMember, studentId: e.target.value })} />
            </div>
            <div className="form-group">
              <label>전화번호</label>
              <input type="tel" placeholder="예: 010-1234-5678" value={newMember.phone} onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })} />
            </div>
            <div className="form-group">
              <label>이메일</label>
              <input type="email" placeholder="예: user@example.com" value={newMember.email} onChange={(e) => setNewMember({ ...newMember, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label>납부 금액</label>
              <input type="number" placeholder="0" value={newMember.amount} onChange={(e) => setNewMember({ ...newMember, amount: e.target.value })} />
            </div>
            <div className="modal-buttons">
              <button className="btn-cancel" onClick={() => setShowAddModal(false)}>취소</button>
              <button className="btn-submit" onClick={handleAddMember}>추가하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MembersPage;
