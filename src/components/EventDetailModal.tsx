import React from 'react';
import type { EventDetailModalProps } from '../types/Schedule';
import '../styles/CalenderEventModal.css';

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
    event,
    onClose,
    onStatusChange,
}) => {
    const formatDateTime = (isoString: string) => {
        return new Date(isoString).toLocaleString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
    };

    const formatDate = (isoString: string) => {
        return new Date(isoString).toLocaleDateString('ko-KR');
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'confirmed': return '예약';
            case 'completed': return '완료';
            case 'cancelled': return '취소';
            default: return status;
        }
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'confirmed': return 'status-confirmed';
            case 'completed': return 'status-completed';
            case 'cancelled': return 'status-cancelled';
            default: return 'status-default';
        }
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const formatCurrency = (amount: number | undefined) => {
        if (!amount) return '-';
        return new Intl.NumberFormat('ko-KR').format(amount) + '원';
    };


    return (
        <div className="calendar-modal-backdrop" onClick={handleBackdropClick}>
            <div className="calendar-modal-container">
                <div className="calendar-modal-header">
                    <h2>레슨 상세 정보</h2>
                    <button className="calendar-modal-close-button" onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                <div className="calendar-modal-content">
                    {/* 기본 정보 */}
                    <div className="calendar-modal-section">
                        <div className="calendar-section-header">
                            <h3>{event.title}</h3>
                            <span className={`calendar-status-badge ${getStatusClass(event.status)}`}>
                                {getStatusText(event.status)}
                            </span>
                        </div>

                        <div className="calendar-lesson-details">
                            <div className="calendar-detail-item">
                                <span className="calendar-detail-label">일시</span>
                                <span className="calendar-detail-value">
                                    {formatDateTime(event.start)}
                                </span>
                            </div>

                            {event.facility_name && (
                                <div className="calendar-detail-item">
                                    <span className="calendar-detail-label">시설</span>
                                    <span className="calendar-detail-value">{event.facility_name}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 회원 정보 */}
                    {event.user_name && (
                        <div className="calendar-modal-section">
                            <h4>회원 정보</h4>
                            <div className="calendar-user-info">
                                <div className="calendar-detail-item">
                                    <span className="calendar-detail-label">이름</span>
                                    <span className="calendar-detail-value">{event.user_name}</span>
                                </div>

                                {event.user_phone && (
                                    <div className="calendar-detail-item">
                                        <span className="calendar-detail-label">연락처</span>
                                        <span className="calendar-detail-value">
                                            <a href={`tel:${event.user_phone}`}>{event.user_phone}</a>
                                        </span>
                                    </div>
                                )}

                                {event.user_gender && (
                                    <div className="calendar-detail-item">
                                        <span className="calendar-detail-label">성별</span>
                                        <span className="calendar-detail-value">{event.user_gender}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 수강권 정보 */}
                    {event.ticket_name && (
                        <div className="calendar-modal-section">
                            <h4>수강권 정보</h4>
                            <div className="calendar-ticket-info">
                                <div className="calendar-detail-item">
                                    <span className="calendar-detail-label">수강권명</span>
                                    <span className="calendar-detail-value">{event.ticket_name}</span>
                                </div>

                                {event.ticket_price && (
                                    <div className="calendar-detail-item">
                                        <span className="calendar-detail-label">수강권 금액</span>
                                        <span className="calendar-detail-value ticket-price">
                                            {formatCurrency(event.ticket_price)}
                                        </span>
                                    </div>
                                )}

                                {event.price_per_lesson && (
                                    <div className="calendar-detail-item">
                                        <span className="calendar-detail-label">회당 금액</span>
                                        <span className="calendar-detail-value lesson-price">
                                            {formatCurrency(event.price_per_lesson)}
                                        </span>
                                    </div>
                                )}

                                {event.ticket_total_count && (
                                    <div className="calendar-detail-item">
                                        <span className="calendar-detail-label">총 횟수</span>
                                        <span className="calendar-detail-value">{event.ticket_total_count}회</span>
                                    </div>
                                )}

                                {event.remaining_count !== undefined && (
                                    <div className="calendar-detail-item">
                                        <span className="calendar-detail-label">잔여 횟수</span>
                                        <span className="calendar-detail-value">{event.remaining_count}회</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 메모 */}
                    {(event.memo || event.admin_memo) && (
                        <div className="calendar-modal-section">
                            <h4>메모</h4>
                            {event.memo && (
                                <div className="calendar-memo-item">
                                    <span className="calendar-memo-label">회원 요청사항</span>
                                    <p className="calendar-memo-content">{event.memo}</p>
                                </div>
                            )}
                            {event.admin_memo && (
                                <div className="calendar-memo-item">
                                    <span className="calendar-memo-label">관리자 메모</span>
                                    <p className="calendar-memo-content">{event.admin_memo}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 예약 정보 */}
                    <div className="calendar-modal-section">
                        <h4>예약 정보</h4>
                        <div className="calendar-reservation-info">
                            {event.reservation_date && (
                                <div className="calendar-detail-item">
                                    <span className="calendar-detail-label">예약일</span>
                                    <span className="calendar-detail-value">{formatDate(event.reservation_date)}</span>
                                </div>
                            )}

                            {event.cancelled_at && (
                                <div className="calendar-detail-item">
                                    <span className="calendar-detail-label">취소일</span>
                                    <span className="calendar-detail-value">{formatDate(event.cancelled_at)}</span>
                                </div>
                            )}

                            {event.cancel_reason && (
                                <div className="calendar-detail-item">
                                    <span className="calendar-detail-label">취소 사유</span>
                                    <span className="calendar-detail-value">{event.cancel_reason}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 액션 버튼 */}
                {event.status === 'confirmed' && (
                    <div className="calendar-modal-actions">
                        <button
                            className="calendar-action-button complete-button"
                            onClick={() => onStatusChange(event.id, 'completed')}
                        >
                            완료 처리
                        </button>
                        <button
                            className="calendar-action-button cancel-button"
                            onClick={() => onStatusChange(event.id, 'cancelled')}
                        >
                            취소 처리
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}