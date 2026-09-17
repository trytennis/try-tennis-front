// ReservationItem.tsx
import React from "react";
import type { Reservation } from "../types/Reservation";

interface Props {
    reservation: Reservation;
    onCancel?: (id: string) => void;
    onEdit?: (reservation: Reservation) => void;
    showActions?: boolean;
}

const ReservationItem = ({ reservation, onCancel, onEdit, showActions = true }: Props) => {
    const handleCancel = () => onCancel?.(reservation.id);

    const getStatusClass = () => {
        switch (reservation.status) {
            case "confirmed":
                return "status-badge status-confirmed";   // 예약됨
            case "completed":
                return "status-badge status-completed";
            case "cancelled":
                return "status-badge status-cancelled";
            default:
                return "status-badge";
        }
    };

    const getStatusText = () => {
        switch (reservation.status) {
            case "confirmed": return "예약됨";
            case "completed": return "완료";
            case "cancelled": return "취소";
            default: return reservation.status;
        }
    };

    const formatRequestTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="reservation-item">
            <div className="reservation-info">
                <div className="basic-info">
                    <h3>{reservation.user_name}</h3>
                    <span className={getStatusClass()}>{getStatusText()}</span>
                    <span className="request-time">{formatRequestTime(reservation.reservation_date)} 요청</span>
                </div>

                <div className="reservation-details">
                    <div className="detail-item">
                        <span className="detail-label">날짜/시간</span>
                        <span className="detail-value">
                            {reservation.date} {reservation.start_time} - {reservation.end_time}
                        </span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">수강권</span>
                        <span className="detail-value">
                            {reservation.ticket_name || '수강권 정보 없음'}
                        </span>
                    </div>
                    {reservation.remaining_count !== undefined && (
                        <div className="detail-item">
                            <span className="detail-label">잔여 횟수</span>
                            <span className="detail-value">
                                {reservation.remaining_count}회 / {reservation.ticket_total_count}회
                            </span>
                        </div>
                    )}
                </div>

                <div className="contact-info">
                    <span>📞 {reservation.user_phone || '연락처 없음'}</span>
                    {reservation.facility_name && <span>🏢 {reservation.facility_name}</span>}
                </div>

                {reservation.memo && (
                    <div className="note-section">
                        <span className="note-label">요청사항</span>
                        <p className="note-content">{reservation.memo}</p>
                    </div>
                )}
                {reservation.admin_memo && (
                    <div className="note-section">
                        <span className="note-label">관리자 메모</span>
                        <p className="note-content">{reservation.admin_memo}</p>
                    </div>
                )}

                {reservation.ticket_price && (
                    <div className="ticket-info">
                        <span className="ticket-price">수강료: {reservation.ticket_price?.toLocaleString()}원</span>
                        {reservation.price_per_lesson && (
                            <span className="lesson-price">(회당 {reservation.price_per_lesson?.toLocaleString()}원)</span>
                        )}
                    </div>
                )}
            </div>

            {/* 취소만 노출: 확정 상태일 때만 버튼 표시(완료/취소 건은 숨김) */}
            {showActions && reservation.status === "confirmed" && (
                <div className="action-buttons">
                    {onEdit && <button className="edit-btn" onClick={() => onEdit(reservation)}>시간 수정</button>}
                    <button className="reject-btn" onClick={handleCancel}>취소</button>
                </div>
            )}
        </div>
    );
};

export default ReservationItem;
