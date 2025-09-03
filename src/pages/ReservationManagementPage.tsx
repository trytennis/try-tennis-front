// ReservationManagementPage.tsx
import React, { useEffect, useState, useMemo } from "react";
import type { Reservation } from "../types/Reservation";
import ReservationItem from "../components/ReservationItem";
import "../styles/ReservationManagement.css";
import { fetchReservationsByCoach, updateReservationStatus } from "../api/reservation";

const ReservationManagePage = () => {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "cancelled">("all");
    const [dateFilter, setDateFilter] = useState("");
    const [loading, setLoading] = useState(false);
    const [coachName, setCoachName] = useState("코치님");

    const coachId = "00000000-0000-0000-0000-000000000002"; // TODO: 로그인 연동 시 교체

    const loadReservations = async () => {
        try {
            setLoading(true);
            const data = await fetchReservationsByCoach(coachId, statusFilter, dateFilter);
            // 요구사항: pending/rejected는 화면에서 제외
            const visible = data.filter(r => ["confirmed", "completed", "cancelled"].includes(r.status));
            setReservations(visible);

            if (visible.length > 0 && visible[0].coach_name) {
                setCoachName(visible[0].coach_name);
            }
        } catch (err) {
            console.error("예약 목록 조회 실패", err);
            alert("예약 목록을 불러오는데 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id: string) => {
        if (!confirm("정말로 이 예약을 취소하시겠습니까?")) return;
        try {
            await updateReservationStatus(id, "cancelled", coachId, "코치 측 취소");
            alert("예약이 취소되었습니다.");
            await loadReservations();
        } catch (err) {
            console.error("예약 취소 실패", err);
            alert("예약 취소에 실패했습니다.");
        }
    };

    // 통계 (전체/완료/취소만)
    const stats = useMemo(() => {
        const total = reservations.length;
        const completed = reservations.filter(r => r.status === "completed").length;
        const cancelled = reservations.filter(r => r.status === "cancelled").length;
        return { total, completed, cancelled };
    }, [reservations]);

    useEffect(() => {
        loadReservations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter, dateFilter]);

    return (
        <div className="reservation-management-main">
            <div className="reservation-management-header">
                <h1>내 예약 관리</h1>
                <p><span className="coach-name">{coachName}</span> 코치님의 개인 레슨 예약을 관리하세요</p>
            </div>

            {/* 통계 섹션 */}
            <div className="stats-section">
                <h2>예약 현황</h2>
                <div className="stats-grid">
                    <div className="stat-item">
                        <span className="stat-label">전체</span>
                        <span className="stat-value">{stats.total}</span>
                    </div>
                    <div className="stat-item confirmed">
                        <span className="stat-label">완료</span>
                        <span className="stat-value">{stats.completed}</span>
                    </div>
                    <div className="stat-item cancelled">
                        <span className="stat-label">취소</span>
                        <span className="stat-value">{stats.cancelled}</span>
                    </div>
                </div>
            </div>

            <div className="filter-section">
                <h2>필터</h2>
                <div className="filter-grid">
                    <div className="filter-item">
                        <label htmlFor="status-filter">상태</label>
                        <select
                            id="status-filter"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            disabled={loading}
                        >
                            <option value="all">전체</option>
                            <option value="completed">완료</option>
                            <option value="cancelled">취소</option>
                        </select>
                    </div>
                    <div className="filter-item">
                        <label htmlFor="date-filter">날짜</label>
                        <input
                            type="date"
                            id="date-filter"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                </div>
            </div>

            <div className="reservation-list">
                <div className="list-header">
                    <h2>
                        예약 목록 ({reservations.length}건)
                        {loading && <span> - 로딩중...</span>}
                    </h2>
                </div>

                {loading ? (
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>예약 목록을 불러오는 중...</p>
                    </div>
                ) : reservations.length === 0 ? (
                    <div className="empty-state">
                        <p>해당하는 예약이 없습니다.</p>
                    </div>
                ) : (
                    reservations.map((reservation) => (
                        <ReservationItem
                            key={reservation.id}
                            reservation={reservation}
                            // 승인/거절 제거, 취소만 전달
                            onCancel={handleCancel}
                            showActions={true}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default ReservationManagePage;
