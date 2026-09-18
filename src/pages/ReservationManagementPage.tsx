import React, { useEffect, useState, useMemo } from "react";
import type { Reservation } from "../types/Reservation";
import ReservationItem from "../components/ReservationItem";
import "../styles/ReservationManagement.css";
import { fetchReservationsByCoach, updateReservationStatus } from "../api/reservation";
import { authGet, authPut } from "../utils/authApi";
import { useMyRole } from "../utils/useMyRole";

const ReservationManagePage = () => {
    const { role } = useMyRole();
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [editTarget, setEditTarget] = useState<Reservation | null>(null);
    const [editSearch, setEditSearch] = useState('');
    const [editMembers, setEditMembers] = useState<any[]>([]);
    const [editMemberId, setEditMemberId] = useState('');
    const [editTickets, setEditTickets] = useState<any[]>([]);
    const [editTicketId, setEditTicketId] = useState('');
    const [editDate, setEditDate] = useState('');
    const [editStart, setEditStart] = useState('');
    const [editEnd, setEditEnd] = useState('');
    const [statusFilter, setStatusFilter] =
        useState<"all" | "confirmed" | "completed" | "cancelled">("all");
    const handleEdit = async (reservation: Reservation) => {
        if (role === 'facility_admin') {
            setEditTarget(reservation); setEditDate(reservation.date); setEditStart(reservation.start_time); setEditEnd(reservation.end_time);
            setEditMembers(await authGet<any[]>('/api/users')); return;
        }
        const date = window.prompt('날짜 (YYYY-MM-DD)', reservation.date);
        if (!date) return;
        const start_time = window.prompt('시작 시간 (HH:MM)', reservation.start_time);
        if (!start_time) return;
        const end_time = window.prompt('종료 시간 (HH:MM)', reservation.end_time);
        if (!end_time) return;
        try { await authPut(`/api/reservations/${reservation.id}`, { date, start_time, end_time }); await loadReservations(); } catch (e: any) { alert(e?.message || '수정 실패'); }
        return;
        /* legacy prompt flow retained below for reference */
        /*
        let reassignment: { user_id: string; user_ticket_id: string } | undefined;
        if (role === "facility_admin") {
            const members = await authGet<Array<{ id: string; name: string }>>('/api/users');
            const search = window.prompt('회원 이름 또는 전화번호 검색', '') || '';
            const filteredMembers = members.filter((m: any) => !search || m.name.includes(search) || (m.phone || '').includes(search));
            const memberChoices = filteredMembers.map((m, i) => `${i + 1}. ${m.name}`).join('\n');
            const memberPick = window.prompt(`회원 변경 (번호, 현재: ${reservation.user_name})\n${memberChoices}`, "");
            if (memberPick) {
                const member = filteredMembers[Number(memberPick) - 1];
                if (member) {
                    const tickets = await authGet<Array<{ id: string; remaining_count: number; tickets?: { name: string } }>>(`/api/users/${member.id}/tickets`);
                    const ticketChoices = tickets.map((t, i) => `${i + 1}. ${t.tickets?.name || '수강권'} (${t.remaining_count}회)`).join('\n');
                    const ticketPick = window.prompt(`수강권 선택\n${ticketChoices}`, "");
                    const ticket = tickets[Number(ticketPick) - 1];
                    if (ticket) reassignment = { user_id: member.id, user_ticket_id: ticket.id };
                }
            }
        }
        const date = window.prompt('날짜 (YYYY-MM-DD)', reservation.date);
        if (!date) return;
        const start_time = window.prompt('시작 시간 (HH:MM)', reservation.start_time);
        if (!start_time) return;
        const end_time = window.prompt('종료 시간 (HH:MM)', reservation.end_time);
        if (!end_time) return;
        let coach_id = reservation.coach_id;
        if (role === "facility_admin") {
            const coaches = await authGet<Array<{ id: string; name: string }>>('/api/coaches');
            const choices = coaches.map((c, i) => `${i + 1}. ${c.name}`).join('\n');
            const selected = window.prompt(`코치 변경 (번호, 현재: ${reservation.coach_name})\n${choices}`, "");
            if (selected) {
                const index = Number(selected) - 1;
                if (Number.isInteger(index) && coaches[index]) coach_id = coaches[index].id;
            }
        }
        try { await authPut(`/api/reservations/${reservation.id}`, { date, start_time, end_time, ...(role === "facility_admin" ? { coach_id, ...reassignment } : {}) }); await loadReservations(); }
        catch (e: any) { alert(e?.message || '예약 시간 수정에 실패했습니다.'); }
        */
    };
    const [dateFilter, setDateFilter] = useState("");
    const [loading, setLoading] = useState(false);

    const loadReservations = async () => {
        try {
            setLoading(true);
            const data = await fetchReservationsByCoach(statusFilter, dateFilter);

            // 화면에는 confirmed/completed/cancelled만 노출 (legacy pending/rejected 숨김)
            const visible = data.filter((r) =>
                ["confirmed", "completed", "cancelled"].includes(r.status)
            );
            setReservations(visible);
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
            await updateReservationStatus(id, "cancelled", "코치 측 취소");
            alert("예약이 취소되었습니다.");
            await loadReservations();
        } catch (err) {
            console.error("예약 취소 실패", err);
            alert("예약 취소에 실패했습니다.");
        }
    };

    // 통계: 전체 / 예약(confirmed) / 완료 / 취소
    const stats = useMemo(() => {
        const total = reservations.length;
        const confirmed = reservations.filter((r) => r.status === "confirmed").length;
        const completed = reservations.filter((r) => r.status === "completed").length;
        const cancelled = reservations.filter((r) => r.status === "cancelled").length;
        return { total, confirmed, completed, cancelled };
    }, [reservations]);

    useEffect(() => {
        loadReservations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter, dateFilter]);

    useEffect(() => { if (editMemberId) authGet<any[]>(`/api/users/${editMemberId}/tickets`).then(setEditTickets); }, [editMemberId]);

    const saveEdit = async () => {
        if (!editTarget) return;
        try { await authPut(`/api/reservations/${editTarget.id}`, { date: editDate, start_time: editStart, end_time: editEnd, user_id: editMemberId, user_ticket_id: editTicketId }); setEditTarget(null); await loadReservations(); } catch (e: any) { alert(e?.message || '예약 수정에 실패했습니다.'); }
    };

    return (
        <div className="reservation-management-main">
            <div className="reservation-management-header">
                <h1>내 예약 관리</h1>
                <p>
                    <span className="coach-name"></span> 코치님의 개인 레슨 예약을 관리하세요
                </p>
            </div>
            {editTarget && <div className="facility-modal-overlay"><div className="facility-modal-content"><h2>예약 수정</h2><input placeholder="회원 검색" value={editSearch} onChange={e=>setEditSearch(e.target.value)} /><select value={editMemberId} onChange={e=>setEditMemberId(e.target.value)}><option value="">회원 선택</option>{editMembers.filter(m=>!editSearch || m.name.includes(editSearch) || (m.phone||'').includes(editSearch)).map(m=><option key={m.id} value={m.id}>{m.name} ({m.phone||'-'})</option>)}</select><select value={editTicketId} onChange={e=>setEditTicketId(e.target.value)}><option value="">수강권 선택</option>{editTickets.map(t=><option key={t.id} value={t.id}>{t.tickets?.name} · 잔여 {t.remaining_count}회</option>)}</select><input type="date" value={editDate} onChange={e=>setEditDate(e.target.value)} /><input type="time" value={editStart} onChange={e=>setEditStart(e.target.value)} /><input type="time" value={editEnd} onChange={e=>setEditEnd(e.target.value)} /><button onClick={saveEdit}>저장</button><button onClick={()=>setEditTarget(null)}>취소</button></div></div>}

            {/* 통계 섹션 */}
            <div className="stats-section">
                <h2>예약 현황</h2>
                <div className="stats-grid">
                    <div className="stat-item">
                        <span className="stat-label">전체</span>
                        <span className="stat-value">{stats.total}</span>
                    </div>
                    <div className="stat-item confirmed">
                        <span className="stat-label">예약</span>
                        <span className="stat-value">{stats.confirmed}</span>
                    </div>
                    <div className="stat-item completed">
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
                            <option value="confirmed">예약</option>
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
                            onCancel={handleCancel}    // 취소만
                            showActions={role === "super_admin" || role === "facility_admin" || role === "coach"}
                            onEdit={role === "coach" || role === "facility_admin" ? handleEdit : undefined}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default ReservationManagePage;
