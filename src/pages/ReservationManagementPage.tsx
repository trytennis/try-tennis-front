
import React, { useEffect, useState } from "react";
import type { Reservation } from "../types/Reservation";
import ReservationItem from "../components/ReservationItem";
import "../styles/ReservationManagement.css";
import { fetchReservationsByCoach, updateReservationStatus } from "../api/reservation";

const ReservationManagePage = () => {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [statusFilter, setStatusFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState("");
    const [loading, setLoading] = useState(false);
    const [coachName, setCoachName] = useState("코치님");

    const coachId = "00000000-0000-0000-0000-000000000002"; // TODO: 로그인 연동 시 교체

    const loadReservations = async () => {
        try {
            setLoading(true);
            const data = await fetchReservationsByCoach(
                coachId,
                statusFilter,
                dateFilter
            );
            setReservations(data);

            // 첫 번째 예약에서 코치 이름 추출
            if (data.length > 0 && data[0].coach_name) {
                setCoachName(data[0].coach_name);
            }
        } catch (err) {
            console.error("예약 목록 조회 실패", err);
            alert("예약 목록을 불러오는데 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        try {
            await updateReservationStatus(id, "confirmed", coachId);
            alert("예약이 승인되었습니다.");
            await loadReservations();
        } catch (err) {
            console.error("예약 승인 실패", err);
            alert("예약 승인에 실패했습니다.");
        }
    };

    const handleReject = async (id: string) => {
        if (!confirm("정말로 거절하시겠습니까?")) return;

        try {
            await updateReservationStatus(id, "rejected", coachId);
            alert("예약이 거절되었습니다.");
            await loadReservations();
        } catch (err) {
            console.error("예약 거절 실패", err);
            alert("예약 거절에 실패했습니다.");
        }
    };

    // 통계 계산
    const stats = {
        total: reservations.length,
        pending: reservations.filter(r => r.status === 'pending').length,
        confirmed: reservations.filter(r => r.status === 'confirmed').length,
        rejected: reservations.filter(r => r.status === 'rejected').length,
        cancelled: reservations.filter(r => r.status === 'cancelled').length,
        completed: reservations.filter(r => r.status === 'completed').length,
    };

    useEffect(() => {
        loadReservations();
    }, [statusFilter, dateFilter]);

    return (
        <div className="reservation-management-main">
            <div className="reservation-management-header">
                <h1>내 예약 관리</h1>
                <p><span className="coach-name">{coachName}</span> 코치님의 개인 레슨 예약을 관리하세요</p>
            </div>

            {/* 통계 섹션 추가 */}
            <div className="stats-section">
                <h2>예약 현황</h2>
                <div className="stats-grid">
                    <div className="stat-item">
                        <span className="stat-label">전체</span>
                        <span className="stat-value">{stats.total}</span>
                    </div>
                    <div className="stat-item pending">
                        <span className="stat-label">대기중</span>
                        <span className="stat-value">{stats.pending}</span>
                    </div>
                    <div className="stat-item confirmed">
                        <span className="stat-label">승인</span>
                        <span className="stat-value">{stats.confirmed}</span>
                    </div>
                    <div className="stat-item rejected">
                        <span className="stat-label">거절</span>
                        <span className="stat-value">{stats.rejected}</span>
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
                            onChange={(e) => setStatusFilter(e.target.value)}
                            disabled={loading}
                        >
                            <option value="all">전체</option>
                            <option value="pending">대기중</option>
                            <option value="confirmed">승인</option>
                            <option value="rejected">거절</option>
                            <option value="cancelled">취소</option>
                            <option value="completed">완료</option>
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
                            onApprove={handleApprove}
                            onReject={handleReject}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default ReservationManagePage;
