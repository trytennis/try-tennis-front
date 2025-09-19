import React, { useEffect, useState } from "react";
import type { TimeSlot } from "../types/TimeSlot";
import type { Coach } from "../types/Coach";
import type { UserTicket } from "../types/UserTicket";
import TimeSlotGrid from "../components/TimeSlotGrid";
import CoachCard from "../components/CoachCard";
import {
    fetchAvailableSlots,
    fetchCoaches,
    fetchUserTickets,
    createReservation,
} from "../api/lesson";
import "../styles/PersonalLessonPage.css";
import ReservationTicketCard from "../components/ReservationTicketCard";

// 로컬(브라우저) 기준 오늘 날짜 'YYYY-MM-DD'
const todayLocal = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
};

const PersonalLessonPage = () => {
    const [date, setDate] = useState(todayLocal()); // 오늘 날짜로 초기화
    const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
    const [selectedTicket, setSelectedTicket] = useState<UserTicket | null>(null);
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
    const [coaches, setCoaches] = useState<Coach[]>([]);
    const [tickets, setTickets] = useState<UserTicket[]>([]);
    const [reserving, setReserving] = useState(false);

    useEffect(() => {
        const loadSlots = async () => {
            if (!selectedCoach) {
                setAvailableSlots([]);
                return;
            }
            const slots = await fetchAvailableSlots(selectedCoach.id, date);
            setAvailableSlots(slots);
        };
        loadSlots();
    }, [selectedCoach, date]);

    useEffect(() => {
        const loadCoaches = async () => {
            const coachList = await fetchCoaches();
            setCoaches(coachList);
        };
        const loadTickets = async () => {
            const ticketList = await fetchUserTickets();
            setTickets(ticketList);
        };
        loadCoaches();
        loadTickets();
    }, []);

    const handleReserve = async () => {
        if (!selectedCoach || !selectedSlot || !selectedTicket) return;

        const payload = {
            coach_id: selectedCoach.id,
            user_ticket_id: selectedTicket.id,
            date,
            start_time: selectedSlot.start,
            end_time: selectedSlot.end,
        };

        try {
            setReserving(true);
            await createReservation(payload);
            alert("예약이 완료되었습니다!");
            setSelectedSlot(null);
            // 방금 예약한 코치/날짜의 슬롯을 다시 불러와 비활성화 반영
            setAvailableSlots(await fetchAvailableSlots(selectedCoach.id, date));
        } catch (err: any) {
            const msg = err?.response?.data?.error || "예약에 실패했습니다. 다시 시도해주세요.";
            alert(msg);
        } finally {
            setReserving(false);
        }
    };

    return (
        <div className="personal-lesson-main">
            <div className="lesson-header">
                <h1>개인 레슨 예약</h1>
                <p>코치와 1:1로 진행되는 레슨을 예약하세요</p>
            </div>

            <div className="ticket-status">
                <h2>보유 수강권</h2>
                <div className="ticket-grid">
                    {tickets.map((ticket) => (
                        <ReservationTicketCard
                            key={ticket.id}
                            ticket={ticket}
                            isSelected={selectedTicket?.id === ticket.id}
                            onClick={() => setSelectedTicket(ticket)}
                        />
                    ))}
                </div>
            </div>

            <div className="date-selector">
                <h2>날짜 선택</h2>
                <div className="date-input-container">
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>
            </div>

            <div className="coach-selection">
                <h2>코치 선택</h2>
                <div className="coach-grid">
                    {coaches.map((coach) => (
                        <CoachCard
                            key={coach.id}
                            coach={coach}
                            isSelected={selectedCoach?.id === coach.id}
                            onClick={() => setSelectedCoach(coach)}
                        />
                    ))}
                </div>
            </div>

            <div className="time-selection">
                <h2>시간 선택</h2>
                <TimeSlotGrid
                    slots={availableSlots}
                    selectedSlot={selectedSlot}
                    onSelect={setSelectedSlot}
                />
            </div>

            <div className="selected-slot-info">
                {selectedSlot && selectedCoach && selectedTicket && (
                    <>
                        <p>
                            <strong>{selectedCoach.name}</strong> 코치와 {selectedSlot.start} ~ {selectedSlot.end} 예약<br />
                            {selectedTicket.tickets.name}
                        </p>
                        <button
                            onClick={handleReserve}
                            className="reserve-button"
                            disabled={reserving}
                        >
                            {reserving ? "예약 중..." : "예약하기"}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default PersonalLessonPage;
