// TicketDetailModal.tsx
import React, { useEffect, useState } from 'react';
import {
    X,
    Users,
    Calendar,
    Clock,
    DollarSign,
    ChevronLeft,
    Edit2,
    Trash2,
    Save,
    XCircle,
    Building2
} from 'lucide-react';
import '../styles/TicketDetailModal.css';
import type { Ticket } from '../types/Ticket';
import type { AssignedUser } from '../types/AssignedUser';
import { TicketsApi } from '../api/ticket';

interface TicketDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    ticketId: string | null;
    onUpdate?: () => void; // 수정 후 부모 컴포넌트 새로고침용
}

const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
    isOpen,
    onClose,
    ticketId,
    onUpdate
}) => {
    const [mode, setMode] = useState<'view' | 'edit'>('view');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [loading, setLoading] = useState(true);

    const [originalTicket, setOriginalTicket] = useState<Ticket | null>(null);
    const [editedTicket, setEditedTicket] = useState<Ticket | null>(null);
    const [users, setUsers] = useState<AssignedUser[]>([]);

    useEffect(() => {
        if (isOpen && ticketId) {
            setLoading(true);
            setMode('view');
            (async () => {
                try {
                    const [ticketData, userList] = await Promise.all([
                        TicketsApi.getById(ticketId),
                        TicketsApi.listUsers(ticketId)
                    ]);
                    setOriginalTicket(ticketData);
                    setEditedTicket(ticketData);
                    setUsers(userList);
                } catch (err) {
                    console.error('수강권 상세 정보 조회 실패:', err);
                } finally {
                    setLoading(false);
                }
            })();
        }
    }, [isOpen, ticketId]);

    const handleEdit = () => {
        setMode('edit');
        setEditedTicket(originalTicket);
    };

    const handleCancel = () => {
        setMode('view');
        setEditedTicket(originalTicket);
    };

    const handleSave = async () => {
        if (!ticketId || !editedTicket) return;

        try {
            await TicketsApi.update(ticketId, {
                name: editedTicket.name,
                usage_type: editedTicket.usage_type || "lesson",
                lesson_count: Number(editedTicket.lesson_count),
                valid_days: Number(editedTicket.valid_days),
                price: Number(editedTicket.price)
            });
            setOriginalTicket(editedTicket);
            setMode('view');
            alert('수강권이 수정되었습니다.');
            onUpdate?.(); // 부모 컴포넌트 새로고침
        } catch (error) {
            console.error('수강권 수정 실패:', error);
            alert('수강권 수정에 실패했습니다.');
        }
    };

    const handleDelete = () => {
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!ticketId) return;

        try {
            await TicketsApi.remove(ticketId);
            alert('수강권이 삭제되었습니다.');
            setShowDeleteConfirm(false);
            onClose();
            onUpdate?.(); // 부모 컴포넌트 새로고침
        } catch (error) {
            console.error('수강권 삭제 실패:', error);
            alert('수강권 삭제에 실패했습니다.');
        }
    };

    const handleInputChange = (field: keyof Ticket, value: string | number) => {
        if (!editedTicket) return;

        let newValue: string | number = value;

        // 숫자 필드만 parse
        if (["lesson_count", "valid_days", "price", "price_per_lesson"].includes(field)) {
            newValue = typeof value === "string" ? Number(value) || 0 : value;
        }

        const updated = { ...editedTicket, [field]: newValue };

        // 회당 가격 자동 계산
        if (field === "price" || field === "lesson_count") {
            updated.price_per_lesson =
                updated.lesson_count > 0
                    ? Math.round(updated.price / updated.lesson_count)
                    : 0;
        }

        setEditedTicket(updated);
    };


    const fmtDate = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString('ko-KR') : '-');

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    const ticket = mode === 'edit' ? editedTicket : originalTicket;

    return (
        <>
            <div className="tdm-backdrop" onClick={handleBackdropClick}>
                <div className="tdm-container" onClick={(e) => e.stopPropagation()}>
                    {/* Header */}
                    <div className="tdm-header">
                        <div className="tdm-header-left">
                            <button onClick={onClose} className="tdm-back-btn">
                                <ChevronLeft className="tdm-icon" />
                            </button>
                            <h2 className="tdm-title">수강권 상세정보</h2>
                        </div>
                        <button onClick={onClose} className="tdm-close-btn">
                            <X className="tdm-icon" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="tdm-content">
                        {loading ? (
                            <div className="tdm-loading">
                                <div className="tdm-spinner"></div>
                            </div>
                        ) : !ticket ? (
                            <div className="tdm-empty">수강권 정보를 찾을 수 없습니다.</div>
                        ) : (
                            <>
                                {/* Ticket Info Card */}
                                <div className="tdm-info-card">
                                    {/* Card Header with Actions */}
                                    <div className="tdm-card-header">
                                        <div className="tdm-title-wrap">
                                            {!!ticket.facility_name && (
                                                <div className="tdm-facility-badge">
                                                    <Building2 className="tdm-facility-icon" />
                                                    {ticket.facility_name}
                                                </div>
                                            )}

                                            {mode === 'edit' ? (
                                                <input
                                                    type="text"
                                                    value={ticket.name}
                                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                                    className="tdm-name-input"
                                                />
                                            ) : (
                                                <h3 className="tdm-ticket-name">{ticket.name}</h3>
                                            )}
                                        </div>

                                        <div className="tdm-action-buttons">
                                            {mode === 'view' ? (
                                                <>
                                                    <button onClick={handleEdit} className="tdm-edit-btn">
                                                        <Edit2 className="tdm-btn-icon" />
                                                        수정
                                                    </button>
                                                    <button onClick={handleDelete} className="tdm-delete-btn">
                                                        <Trash2 className="tdm-btn-icon" />
                                                        삭제
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={handleSave} className="tdm-save-btn">
                                                        <Save className="tdm-btn-icon" />
                                                        저장
                                                    </button>
                                                    <button onClick={handleCancel} className="tdm-cancel-btn">
                                                        <XCircle className="tdm-btn-icon" />
                                                        취소
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <label>수강권 종류 {mode === 'edit' ? <select value={ticket.usage_type || "lesson"} onChange={(e) => handleInputChange('usage_type', e.target.value)}><option value="lesson">레슨</option><option value="screen">스크린룸</option></select> : <span>{ticket.usage_type === "screen" ? "스크린룸" : "레슨"}</span>}</label>
                                    <div className="tdm-stats-grid">
                                        {/* 횟수 */}
                                        <div className={`tdm-stat-card ${mode === 'edit' ? 'editable' : ''}`}>
                                            <div className="tdm-stat-label">
                                                <Calendar className="tdm-stat-icon" />
                                                <span>횟수</span>
                                            </div>
                                            {mode === 'edit' ? (
                                                <input
                                                    type="number"
                                                    value={ticket.lesson_count}
                                                    onChange={(e) => handleInputChange('lesson_count', e.target.value)}
                                                    className="tdm-stat-input"
                                                />
                                            ) : (
                                                <p className="tdm-stat-value">{ticket.lesson_count}회</p>
                                            )}
                                        </div>

                                        {/* 유효기간 */}
                                        <div className={`tdm-stat-card ${mode === 'edit' ? 'editable' : ''}`}>
                                            <div className="tdm-stat-label">
                                                <Clock className="tdm-stat-icon" />
                                                <span>유효기간</span>
                                            </div>
                                            {mode === 'edit' ? (
                                                <input
                                                    type="number"
                                                    value={ticket.valid_days}
                                                    onChange={(e) => handleInputChange('valid_days', e.target.value)}
                                                    className="tdm-stat-input"
                                                />
                                            ) : (
                                                <p className="tdm-stat-value">{ticket.valid_days}일</p>
                                            )}
                                        </div>

                                        {/* 가격 */}
                                        <div className={`tdm-stat-card ${mode === 'edit' ? 'editable' : ''}`}>
                                            <div className="tdm-stat-label">
                                                <DollarSign className="tdm-stat-icon" />
                                                <span>가격</span>
                                            </div>
                                            {mode === 'edit' ? (
                                                <input
                                                    type="number"
                                                    value={ticket.price}
                                                    onChange={(e) => handleInputChange('price', e.target.value)}
                                                    className="tdm-stat-input-price"
                                                />
                                            ) : (
                                                <p className="tdm-stat-value-price">{ticket.price.toLocaleString()}원</p>
                                            )}
                                        </div>

                                        {/* 회당 가격 */}
                                        <div className={`tdm-stat-card ${mode === 'edit' ? 'readonly' : ''}`}>
                                            <div className="tdm-stat-label">
                                                <DollarSign className="tdm-stat-icon" />
                                                <span>회당 가격</span>
                                            </div>
                                            <p className="tdm-stat-value-price">
                                                {ticket.price_per_lesson.toLocaleString()}원
                                            </p>
                                        </div>
                                    </div>

                                    {mode === 'edit' && (
                                        <div className="tdm-edit-notice">
                                            💡 회당 가격은 자동으로 계산됩니다. (가격 ÷ 횟수)
                                        </div>
                                    )}
                                </div>

                                {/* Users Section */}
                                <div className="tdm-users-section">
                                    <div className="tdm-users-header">
                                        <div className="tdm-users-header-left">
                                            <Users className="tdm-users-icon" />
                                            <h3 className="tdm-users-title">발급된 수강권</h3>
                                        </div>
                                        <span className="tdm-users-count">{users.length}명</span>
                                    </div>

                                    {users.length === 0 ? (
                                        <div className="tdm-users-empty">아직 이 수강권을 배정받은 유저가 없습니다.</div>
                                    ) : (
                                        <div className="tdm-table-wrapper">
                                            <table className="tdm-table">
                                                <thead>
                                                    <tr>
                                                        <th>이름</th>
                                                        <th>남은 횟수</th>
                                                        <th>배정일</th>
                                                        <th>만료일</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {users.map((user) => (
                                                        <tr key={user.user_id}>
                                                            <td className="tdm-user-name">{user.name}</td>
                                                            <td>
                                                                <span className="tdm-remaining-badge">{user.remaining_count}회</span>
                                                            </td>
                                                            <td className="tdm-user-date">{fmtDate(user.assigned_at)}</td>
                                                            <td className="tdm-user-date">{fmtDate(user.expires_at)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="tdm-delete-backdrop" onClick={() => setShowDeleteConfirm(false)}>
                    <div className="tdm-delete-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="tdm-delete-icon-wrapper">
                            <Trash2 className="tdm-delete-icon" />
                        </div>

                        <h3 className="tdm-delete-title">수강권을 삭제하시겠습니까?</h3>

                        <p className="tdm-delete-description">
                            <strong>"{originalTicket?.name}"</strong>을(를) 삭제합니다.
                        </p>

                        <div className="tdm-delete-warning">
                            <p>
                                ⚠️ <strong>현재 {users.length}명</strong>의 회원이 이 수강권을 사용 중입니다.
                                <br />
                            </p>
                        </div>

                        <div className="tdm-delete-actions">
                            <button onClick={() => setShowDeleteConfirm(false)} className="tdm-delete-cancel">
                                취소
                            </button>
                            <button onClick={confirmDelete} className="tdm-delete-confirm">
                                삭제하기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default TicketDetailModal;
