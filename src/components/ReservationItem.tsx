
import React from "react";
import type { Reservation } from "../types/Reservation";

interface Props {
    reservation: Reservation;
    onApprove?: (id: string) => void;
    onReject?: (id: string) => void;
    showActions?: boolean;
}

const ReservationItem = ({ reservation, onApprove, onReject, showActions = true }: Props) => {
    const handleApprove = () => onApprove?.(reservation.id);
    const handleReject = () => onReject?.(reservation.id);

    const getStatusClass = () => {
        switch (reservation.status) {
            case "pending":
                return "status-badge status-pending";
            case "confirmed":
                return "status-badge status-approved";
            case "rejected":
                return "status-badge status-rejected";
            default:
                return "status-badge";
        }
    };

    const getStatusText = () => {
        switch (reservation.status) {
            case "pending": return "대기중";
            case "confirmed": return "승인";
            case "rejected": return "거절";
            case "cancelled": return "취소";
            case "completed": return "완료";
            default: return reservation.status;
        }
    };

    // 요청 시간 포맷팅
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
                    <span className={getStatusClass()}>
                        {getStatusText()}
                    </span>
                    <span className="request-time">
                        {formatRequestTime(reservation.reservation_date)} 요청
                    </span>
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
                    {reservation.facility_name && (
                        <span>🏢 {reservation.facility_name}</span>
                    )}
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

                {/* 수강권 정보 표시 */}
                {reservation.ticket_price && (
                    <div className="ticket-info">
                        <span className="ticket-price">수강료: {reservation.ticket_price?.toLocaleString()}원</span>
                        {reservation.price_per_lesson && (
                            <span className="lesson-price">
                                (회당 {reservation.price_per_lesson?.toLocaleString()}원)
                            </span>
                        )}
                    </div>
                )}
            </div>

            {showActions && reservation.status === "pending" && (
                <div className="action-buttons">
                    <button className="approve-btn" onClick={handleApprove}>✓ 승인</button>
                    <button className="reject-btn" onClick={handleReject}>✕ 거절</button>
                </div>
            )}
        </div>
    );
};

export default ReservationItem;