import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingMember, setDeletingMember] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [groupName, setGroupName] = useState('');
  
  const [members, setMembers] = useState([]);

  const [newMember, setNewMember] = useState({
    name: '',
    phone: '',
    email: ''
  });

  const [editingMember, setEditingMember] = useState({
    id: null,
    name: '',
    phone: '',
    email: ''
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
        toast.error('로그인이 만료되었습니다.');
        navigate('/login', { replace: true });
      }
    } catch (error) {
      console.error('멤버 목록 조회 실패:', error);
      toast.error('멤버 목록을 불러오는데 실패했습니다.');
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
  }, [navigate, fetchMembers]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      toast.success(`${selectedFile.name} 파일이 선택되었습니다.`);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('파일을 먼저 선택해주세요!');
      return;
    }

    const groupId = localStorage.getItem('currentGroupId');
    const token = localStorage.getItem('accessToken');

    setUploading(true);
    const loadingToast = toast.loading('파일 업로드 중...');

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
        toast.success(`${data.count || '멤버'}명이 업로드되었습니다!`, {
          id: loadingToast,
        });
        setFile(null);
        
        const fileInput = document.getElementById('file-input');
        if (fileInput) fileInput.value = '';
      } else {
        const error = await response.json();
        toast.error('업로드 실패: ' + (error.message || '서버 오류'), {
          id: loadingToast,
        });
      }
    } catch (error) {
      console.error('업로드 에러:', error);
      toast.error('서버 연결 실패!', {
        id: loadingToast,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleAddMember = async () => {
    if (!newMember.name) {
      toast.error('이름은 필수입니다!');
      return;
    }

    const groupId = localStorage.getItem('currentGroupId');
    const token = localStorage.getItem('accessToken');

    const loadingToast = toast.loading('멤버 추가 중...');

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
            email: newMember.email,
            phone: newMember.phone,
          })
        }
      );

      if (response.ok) {
        await fetchMembers();
        setShowAddModal(false);
        setNewMember({ name: '', phone: '', email: '' });
        toast.success('멤버가 추가되었습니다!', {
          id: loadingToast,
        });
      } else {
        const error = await response.json();
        toast.error('추가 실패: ' + (error.message || '서버 오류'), {
          id: loadingToast,
        });
      }
    } catch (error) {
      console.error('멤버 추가 실패:', error);
      toast.error('서버 연결 실패!', {
        id: loadingToast,
      });
    }
  };

  // 수정 모달 열기
  const handleOpenEditModal = (member) => {
    setEditingMember({
      id: member.id,
      name: member.name || '',
      phone: member.phone || '',
      email: member.email || ''
    });
    setShowEditModal(true);
  };

  // 멤버 수정
  const handleEditMember = async () => {
    if (!editingMember.name) {
      toast.error('이름은 필수입니다!');
      return;
    }

    const groupId = localStorage.getItem('currentGroupId');
    const token = localStorage.getItem('accessToken');

    const loadingToast = toast.loading('수정 중...');

    try {
      const response = await fetch(
        `https://seongchan-spring.store/api/groups/${groupId}/members/${editingMember.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: editingMember.name,
            phone: editingMember.phone,
            email: editingMember.email
          })
        }
      );

      if (response.ok) {
        await fetchMembers();
        setShowEditModal(false);
        setEditingMember({ id: null, name: '', phone: '', email: '' });
        toast.success('멤버 정보가 수정되었습니다!', {
          id: loadingToast,
        });
      } else {
        const error = await response.json();
        toast.error('수정 실패: ' + (error.message || '서버 오류'), {
          id: loadingToast,
        });
      }
    } catch (error) {
      console.error('멤버 수정 실패:', error);
      toast.error('서버 연결 실패!', {
        id: loadingToast,
      });
    }
  };

  // 삭제 모달 열기
  const handleOpenDeleteModal = (member) => {
    setDeletingMember(member);
    setShowDeleteModal(true);
  };

  // 멤버 삭제
  const handleDeleteMember = async () => {
    if (!deletingMember) return;

    const groupId = localStorage.getItem('currentGroupId');
    const token = localStorage.getItem('accessToken');

    const loadingToast = toast.loading('삭제 중...');

    try {
      const response = await fetch(
        `https://seongchan-spring.store/api/groups/${groupId}/members/${deletingMember.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        await fetchMembers();
        toast.success('멤버가 삭제되었습니다!', {
          id: loadingToast,
        });
      } else {
        const error = await response.json();
        toast.error('삭제 실패: ' + (error.message || '서버 오류'), {
          id: loadingToast,
        });
      }
    } catch (error) {
      console.error('멤버 삭제 실패:', error);
      toast.error('서버 연결 실패!', {
        id: loadingToast,
      });
    } finally {
      setShowDeleteModal(false);
      setDeletingMember(null);
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
                      <th>이메일</th>
                      <th>전화번호</th>
                      <th>관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member, index) => (
                      <tr key={member.id || index}>
                        <td className="member-index">{index + 1}</td>
                        <td className="member-name">{member.name}</td>
                        <td className="member-email">{member.email || '-'}</td>
                        <td className="member-phone">{member.phone || '-'}</td>
                        <td>
                          <div className="member-actions">
                            <button 
                              className="action-btn edit-btn"
                              onClick={() => handleOpenEditModal(member)}
                              title="수정"
                            >
                              ✏️
                            </button>
                            <button 
                              className="action-btn delete-btn"
                              onClick={() => handleOpenDeleteModal(member)}
                              title="삭제"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="upload-sidebar">
            <div className="upload-card">
              <h4 className="upload-card__title">엑셀 업로드</h4>
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
                {uploading ? '업로드 중...' : '업로드'}
              </button>
            </div>

            <div className="add-card">
              <h4 className="add-card__title">수동 추가</h4>
              <p className="add-card__desc">멤버를 직접 입력하여 추가합니다</p>
              <button className="add-btn" onClick={() => setShowAddModal(true)}>새 멤버 추가</button>
            </div>
          </div>
        </div>
      </div>

      {/* 멤버 추가 모달 */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">새 멤버 추가</h3>
            <div className="form-group">
              <label>이름 *</label>
              <input 
                type="text" 
                placeholder="예: 홍길동" 
                value={newMember.name} 
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })} 
              />
            </div>
            <div className="form-group">
              <label>이메일</label>
              <input 
                type="email" 
                placeholder="예: user@example.com" 
                value={newMember.email} 
                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })} 
              />
            </div>
            <div className="form-group">
              <label>전화번호</label>
              <input 
                type="tel" 
                placeholder="예: 010-1234-5678" 
                value={newMember.phone} 
                onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })} 
              />
            </div>
            <div className="modal-buttons">
              <button className="btn-cancel" onClick={() => setShowAddModal(false)}>취소</button>
              <button className="btn-submit" onClick={handleAddMember}>추가하기</button>
            </div>
          </div>
        </div>
      )}

      {/* 멤버 수정 모달 */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">멤버 정보 수정</h3>
            <div className="form-group">
              <label>이름 *</label>
              <input 
                type="text" 
                placeholder="예: 홍길동" 
                value={editingMember.name} 
                onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })} 
              />
            </div>
            <div className="form-group">
              <label>이메일</label>
              <input 
                type="email" 
                placeholder="예: user@example.com" 
                value={editingMember.email} 
                onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })} 
              />
            </div>
            <div className="form-group">
              <label>전화번호</label>
              <input 
                type="tel" 
                placeholder="예: 010-1234-5678" 
                value={editingMember.phone} 
                onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })} 
              />
            </div>
            <div className="modal-buttons">
              <button className="btn-cancel" onClick={() => setShowEditModal(false)}>취소</button>
              <button className="btn-submit" onClick={handleEditMember}>수정하기</button>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal__icon">⚠️</div>
            <h3 className="modal-title">멤버 삭제</h3>
            <p className="delete-modal__message">
              정말 <strong>"{deletingMember?.name}"</strong> 멤버를 삭제하시겠습니까?
            </p>
            <p className="delete-modal__warning">이 작업은 되돌릴 수 없습니다.</p>
            <div className="modal-buttons">
              <button className="btn-cancel" onClick={() => setShowDeleteModal(false)}>취소</button>
              <button className="btn-delete" onClick={handleDeleteMember}>삭제하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MembersPage;