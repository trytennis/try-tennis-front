import React, { useEffect, useState } from 'react';
import { X, Users, Calendar, Clock, DollarSign, ChevronLeft } from 'lucide-react';
import '../styles/TicketDetailModal.css';
import type { Ticket } from '../types/Ticket';
import type { AssignedUser } from '../types/AssignedUser';
import { TicketsApi } from '../api/ticket';

interface TicketDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    ticketId: string | null;
}

const TicketDetailModal: React.FC<TicketDetailModalProps> = ({ isOpen, onClose, ticketId }) => {
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [users, setUsers] = useState<AssignedUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && ticketId) {
            setLoading(true);
            (async () => {
                try {
                    const [ticketData, userList] = await Promise.all([
                        TicketsApi.getById(ticketId),
                        TicketsApi.listUsers(ticketId),
                    ]);
                    setTicket(ticketData);
                    setUsers(userList);
                } catch (err) {
                    console.error('수강권 상세 정보 조회 실패:', err);
                } finally {
                    setLoading(false);
                }
            })();
        }
    }, [isOpen, ticketId]);

    if (!isOpen) return null;

    const fmtDate = (iso?: string | null) =>
        iso ? new Date(iso).toLocaleDateString('ko-KR') : '-';

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
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
                                <h3 className="tdm-ticket-name">{ticket.name}</h3>

                                <div className="tdm-stats-grid">
                                    <div className="tdm-stat-card">
                                        <div className="tdm-stat-label">
                                            <Calendar className="tdm-stat-icon" />
                                            <span>횟수</span>
                                        </div>
                                        <p className="tdm-stat-value">{ticket.lesson_count}회</p>
                                    </div>

                                    <div className="tdm-stat-card">
                                        <div className="tdm-stat-label">
                                            <Clock className="tdm-stat-icon" />
                                            <span>유효기간</span>
                                        </div>
                                        <p className="tdm-stat-value">{ticket.valid_days}일</p>
                                    </div>

                                    <div className="tdm-stat-card">
                                        <div className="tdm-stat-label">
                                            <DollarSign className="tdm-stat-icon" />
                                            <span>가격</span>
                                        </div>
                                        <p className="tdm-stat-value-price">{ticket.price.toLocaleString()}원</p>
                                    </div>

                                    <div className="tdm-stat-card">
                                        <div className="tdm-stat-label">
                                            <DollarSign className="tdm-stat-icon" />
                                            <span>회당 가격</span>
                                        </div>
                                        <p className="tdm-stat-value-price">{ticket.price_per_lesson.toLocaleString()}원</p>
                                    </div>
                                </div>
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
                                    <div className="tdm-users-empty">
                                        아직 이 수강권을 배정받은 유저가 없습니다.
                                    </div>
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
                                                            <span className="tdm-remaining-badge">
                                                                {user.remaining_count}회
                                                            </span>
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
    );
};

export default TicketDetailModal;