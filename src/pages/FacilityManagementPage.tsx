import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { FacilityMember } from '../types/FacilityMember';
import '../styles/FacilityPage.css'; 
import { FacilitiesApi } from '../api/facility';
import type { Facility, FacilityCreatePayload, FacilityUpdatePayload } from '../types/FacilityData';

const getFacilityDeleteErrorMessage = (err: unknown) => {
    const fallback = '시설 삭제에 실패했습니다.';
    const raw = err instanceof Error ? err.message : '';

    if (!raw) return fallback;

    try {
        const parsed = JSON.parse(raw);
        if (parsed?.profile_count || parsed?.ticket_count) {
            return `소속 인원 ${parsed.profile_count ?? 0}명, 수강권 ${parsed.ticket_count ?? 0}개가 남아 있어 시설을 삭제할 수 없습니다. 먼저 소속 변경 또는 삭제를 처리해주세요.`;
        }
        if (parsed?.error) return parsed.error;
    } catch {
        // Plain-text error messages are shown below.
    }

    return raw || fallback;
};

const FacilityManagementPage: React.FC = () => {
    const navigate = useNavigate();
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
    const [members, setMembers] = useState<FacilityMember[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');

    // 모달 상태
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showMembersModal, setShowMembersModal] = useState(false);
    const [showAssignAdminModal, setShowAssignAdminModal] = useState(false);

    // 폼 상태
    const [createForm, setCreateForm] = useState<FacilityCreatePayload>({ name: '', address: '' });
    const [editForm, setEditForm] = useState<FacilityUpdatePayload>({ name: '', address: '' });
    const [selectedMember, setSelectedMember] = useState<string>('');
    const [memberSearch, setMemberSearch] = useState('');
    const [memberRoleFilter, setMemberRoleFilter] = useState<'all' | 'coach' | 'student'>('all');

    // 초기 데이터 로드
    useEffect(() => {
        loadFacilities();
    }, []);

    const loadFacilities = async () => {
        try {
            setLoading(true);
            const data = await FacilitiesApi.list();
            setFacilities(data);
            setError('');
        } catch (err) {
            setError('시설 목록을 불러오는데 실패했습니다.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadMembers = async (facilityId: string) => {
        try {
            setLoading(true);
            const data = await FacilitiesApi.listMembers(facilityId);
            setMembers(data);
            setError('');
        } catch (err) {
            setError('멤버 목록을 불러오는데 실패했습니다.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateFacility = async () => {
        if (!createForm.name.trim()) {
            setError('시설명을 입력해주세요.');
            return;
        }

        try {
            setLoading(true);
            await FacilitiesApi.create(createForm);
            setSuccessMessage('시설이 성공적으로 생성되었습니다.');
            setShowCreateModal(false);
            setCreateForm({ name: '', address: '' });
            loadFacilities();
        } catch (err) {
            setError('시설 생성에 실패했습니다.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateFacility = async () => {
        if (!selectedFacility) return;

        try {
            setLoading(true);
            await FacilitiesApi.update(selectedFacility.id, editForm);
            setSuccessMessage('시설이 성공적으로 수정되었습니다.');
            setShowEditModal(false);
            setSelectedFacility(null);
            loadFacilities();
        } catch (err) {
            setError('시설 수정에 실패했습니다.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteFacility = async (facility: Facility) => {
        if (!confirm(`'${facility.name}' 시설을 삭제하시겠습니까?`)) return;

        try {
            setLoading(true);
            await FacilitiesApi.remove(facility.id);
            setSuccessMessage('시설이 성공적으로 삭제되었습니다.');
            loadFacilities();
        } catch (err) {
            setError(getFacilityDeleteErrorMessage(err));
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAssignAdmin = async () => {
        if (!selectedFacility || !selectedMember) {
            setError('멤버를 선택해주세요.');
            return;
        }

        try {
            setLoading(true);
            await FacilitiesApi.assignAdmin(selectedFacility.id, selectedMember);
            setSuccessMessage('관리자가 성공적으로 지정되었습니다.');
            setShowAssignAdminModal(false);
            setSelectedMember('');
            loadMembers(selectedFacility.id);
        } catch (err) {
            setError('관리자 지정에 실패했습니다.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const openMembersModal = (facility: Facility) => {
        setSelectedFacility(facility);
        setShowMembersModal(true);
        loadMembers(facility.id);
    };

    const openEditModal = (facility: Facility) => {
        setSelectedFacility(facility);
        setEditForm({ name: facility.name, address: facility.address });
        setShowEditModal(true);
    };

    const openAssignAdminModal = (facility: Facility) => {
        setSelectedFacility(facility);
        setShowAssignAdminModal(true);
        loadMembers(facility.id);
    };

    const clearMessages = () => {
        setError('');
        setSuccessMessage('');
    };

    return (
        <div className="facility-management-container">
            {/* 헤더 */}
            <div className="facility-management-header">
                <h1>시설 관리</h1>
                <p>시설 정보를 관리하고 멤버를 확인할 수 있습니다.</p>
            </div>

            {/* 알림 메시지 */}
            {error && (
                <div className="facility-alert-error">
                    {error}
                    <button onClick={clearMessages} className="facility-alert-close">×</button>
                </div>
            )}

            {successMessage && (
                <div className="facility-alert-success">
                    {successMessage}
                    <button onClick={clearMessages} className="facility-alert-close">×</button>
                </div>
            )}

            {/* 액션 버튼 */}
            <div className="facility-action-section">
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="facility-btn-primary"
                >
                    + 새 시설 추가
                </button>
                {/* <button
                    onClick={loadFacilities}
                    className="facility-btn-secondary"
                    disabled={loading}
                >
                    {loading ? (
                        <span className="facility-loading">
                            <div className="facility-spinner"></div>
                            로딩 중...
                        </span>
                    ) : '새로고침'}
                </button> */}
            </div>

            {/* 시설 목록 */}
            <div className="facility-cards-grid">
                {facilities.map((facility) => (
                    <div key={facility.id} className="facility-card">
                        <div className="facility-card-header">
                            <h3 className="facility-card-title">
                                {facility.name}
                            </h3>
                            <p className="facility-card-address">
                                {facility.address || '주소 미등록'}
                            </p>
                            {/* <span className={`facility-status-badge ${facility.is_active ? 'facility-status-active' : 'facility-status-inactive'}`}>
                                {facility.is_active ? '활성' : '비활성'}
                            </span> */}
                        </div>

                        <div className="facility-card-actions">
                            <button
                                onClick={() => openMembersModal(facility)}
                                className="facility-btn-small facility-btn-info"
                            >
                                멤버 보기
                            </button>
                            <button
                                onClick={() => openEditModal(facility)}
                                className="facility-btn-small facility-btn-accent"
                            >
                                수정
                            </button>
                            <button
                                onClick={() => openAssignAdminModal(facility)}
                                className="facility-btn-small facility-btn-warning"
                            >
                                관리자 지정
                            </button>
                            <button
                                onClick={() => handleDeleteFacility(facility)}
                                className="facility-btn-small facility-btn-danger"
                            >
                                삭제
                            </button>
                        </div>

                        {facility.created_at && (
                            <div className="facility-card-footer">
                                생성일: {new Date(facility.created_at).toLocaleDateString()}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {facilities.length === 0 && !loading && (
                <div className="facility-empty-state">
                    <p>등록된 시설이 없습니다.</p>
                </div>
            )}

            {/* 시설 생성 모달 */}
            {showCreateModal && (
                <div className="facility-modal-overlay">
                    <div className="facility-modal-content">
                        <div className="facility-modal-header">
                            <h2 className="facility-modal-title">새 시설 추가</h2>
                        </div>
                        <div>
                            <div className="facility-form-group">
                                <label className="facility-form-label">
                                    시설명 *
                                </label>
                                <input
                                    type="text"
                                    className="facility-form-input"
                                    value={createForm.name}
                                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="facility-form-group">
                                <label className="facility-form-label">
                                    주소
                                </label>
                                <input
                                    type="text"
                                    className="facility-form-input"
                                    value={createForm.address || ''}
                                    onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })}
                                />
                            </div>
                            <div className="facility-modal-actions">
                                <button
                                    type="button"
                                    onClick={handleCreateFacility}
                                    className="facility-btn-primary facility-btn-full"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span className="facility-loading">
                                            <div className="facility-spinner"></div>
                                            생성 중...
                                        </span>
                                    ) : '생성'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="facility-btn-cancel facility-btn-full"
                                >
                                    취소
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 시설 수정 모달 */}
            {showEditModal && selectedFacility && (
                <div className="facility-modal-overlay">
                    <div className="facility-modal-content">
                        <div className="facility-modal-header">
                            <h2 className="facility-modal-title">시설 수정</h2>
                        </div>
                        <div>
                            <div className="facility-form-group">
                                <label className="facility-form-label">
                                    시설명
                                </label>
                                <input
                                    type="text"
                                    className="facility-form-input"
                                    value={editForm.name || ''}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                />
                            </div>
                            <div className="facility-form-group">
                                <label className="facility-form-label">
                                    주소
                                </label>
                                <input
                                    type="text"
                                    className="facility-form-input"
                                    value={editForm.address || ''}
                                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                                />
                            </div>
                            <div className="facility-modal-actions">
                                <button
                                    type="button"
                                    onClick={handleUpdateFacility}
                                    className="facility-btn-primary facility-btn-full"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span className="facility-loading">
                                            <div className="facility-spinner"></div>
                                            수정 중...
                                        </span>
                                    ) : '수정'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="facility-btn-cancel facility-btn-full"
                                >
                                    취소
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 멤버 목록 모달 */}
            {showMembersModal && selectedFacility && (
                <div className="facility-modal-overlay">
                    <div className="facility-modal-content facility-member-modal" style={{ maxWidth: '700px' }}>
                        <div className="facility-modal-header">
                            <h2 className="facility-modal-title">
                                {selectedFacility.name} - 멤버 목록
                            </h2>
                            <button type="button" onClick={() => setShowMembersModal(false)} className="facility-btn-cancel">닫기</button>
                        </div>

                        <div className="facility-member-filters">
                            <input value={memberSearch} onChange={(e) => setMemberSearch(e.target.value)} placeholder="이름·연락처 검색" />
                            {(['all', 'coach', 'student'] as const).map((role) => (
                                <button key={role} type="button" className={memberRoleFilter === role ? 'active' : ''} onClick={() => setMemberRoleFilter(role)}>
                                    {role === 'all' ? '전체' : role === 'coach' ? '코치' : '회원'}
                                </button>
                            ))}
                        </div>
                        {members.filter((member) => {
                            const q = memberSearch.trim().toLowerCase();
                            return (memberRoleFilter === 'all' || member.user_type === memberRoleFilter)
                                && (!q || member.name.toLowerCase().includes(q) || (member.phone || '').includes(q));
                        }).length > 0 ? (
                            <div className="facility-members-list">
                                {members.filter((member) => {
                                    const q = memberSearch.trim().toLowerCase();
                                    return (memberRoleFilter === 'all' || member.user_type === memberRoleFilter)
                                        && (!q || member.name.toLowerCase().includes(q) || (member.phone || '').includes(q));
                                }).map((member) => (
                                    <div key={member.id} className="facility-member-item" role="button" tabIndex={0} onClick={() => { setShowMembersModal(false); navigate(`/users/${member.id}`); }} onKeyDown={(e) => { if (e.key === 'Enter') { setShowMembersModal(false); navigate(`/users/${member.id}`); } }}>
                                        <div className="facility-member-info">
                                            <div className="facility-member-name">{member.name}</div>
                                            <div className="facility-member-details">
                                                {member.user_type} | {member.phone || '연락처 없음'}
                                            </div>
                                        </div>
                                        <span className={`facility-member-status ${member.is_active ? 'facility-status-active' : 'facility-status-inactive'}`}>
                                            {member.is_active ? '활성' : '비활성'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="facility-members-empty">
                                등록된 멤버가 없습니다.
                            </div>
                        )}

                    </div>
                </div>
            )}

            {/* 관리자 지정 모달 */}
            {showAssignAdminModal && selectedFacility && (
                <div className="facility-modal-overlay">
                    <div className="facility-modal-content">
                        <div className="facility-modal-header">
                            <h2 className="facility-modal-title">
                                {selectedFacility.name} - 관리자 지정
                            </h2>
                        </div>
                        <div>
                            <div className="facility-form-group">
                                <label className="facility-form-label">
                                    멤버 선택
                                </label>
                                <select
                                    className="facility-form-select"
                                    value={selectedMember}
                                    onChange={(e) => setSelectedMember(e.target.value)}
                                    required
                                >
                                    <option value="">멤버를 선택하세요</option>
                                    {members.map((member) => (
                                        <option key={member.id} value={member.id}>
                                            {member.name} ({member.user_type})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="facility-modal-actions">
                                <button
                                    type="button"
                                    onClick={handleAssignAdmin}
                                    className="facility-btn-primary facility-btn-full"
                                    disabled={loading || !selectedMember}
                                >
                                    {loading ? (
                                        <span className="facility-loading">
                                            <div className="facility-spinner"></div>
                                            지정 중...
                                        </span>
                                    ) : '관리자 지정'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAssignAdminModal(false)}
                                    className="facility-btn-cancel facility-btn-full"
                                >
                                    취소
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacilityManagementPage;
