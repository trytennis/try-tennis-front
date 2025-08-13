import React, { useEffect, useState } from "react";
import type { TimeSlot } from "../types/TimeSlot";
import type { Coach } from "../types/Coach";
import type { Ticket } from "../types/Ticket";
import TimeSlotGrid from "../components/TimeSlotGrid";
import { fetchAvailableSlots, fetchCoaches, fetchUserTickets } from "../api/reservation";
import "../styles/PersonalLessonPage.css";
import CoachCard from "../components/CoachCard";
import ReservationTicketCard from "../components/ReservationTicketCard";
import type { UserTicket } from "../types/UserTicket";

const PersonalLessonPage = () => {
    const [date, setDate] = useState("2025-08-21");
    const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
    const [selectedTicket, setSelectedTicket] = useState<UserTicket | null>(null);
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
    const [coaches, setCoaches] = useState<Coach[]>([]);
    const [tickets, setTickets] = useState<UserTicket[]>([]);

    useEffect(() => {
        const loadSlots = async () => {
            if (selectedCoach) {
                const slots = await fetchAvailableSlots(selectedCoach.id, date);
                setAvailableSlots(slots);
            }
        };
        loadSlots();
    }, [selectedCoach, date]);

    useEffect(() => {
        const loadCoaches = async () => {
            const coachList = await fetchCoaches();
            setCoaches(coachList);
        };
        loadCoaches();

        const loadTickets = async () => {
            const userId = "00000000-0000-0000-0000-000000000003"; // TODO: 로그인 연동 시 교체
            const ticketList = await fetchUserTickets(userId);
            setTickets(ticketList);
        };
        loadTickets();
    }, []);

    const handleReserve = () => {
        if (!selectedCoach || !selectedSlot || !selectedTicket) return;
        console.log("예약 요청:", {
            coach_id: selectedCoach.id,
            ticket_id: selectedTicket.ticket_id,
            date,
            start_time: selectedSlot.start,
            end_time: selectedSlot.end
        });
        // TODO: 예약 생성 API 호출
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
                            key={ticket.ticket_id}
                            ticket={ticket}
                            isSelected={selectedTicket?.ticket_id === ticket.ticket_id}
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
                {selectedSlot && selectedCoach && (
                    <>
                        <p>
                            <strong>{selectedCoach.name}</strong> 코치와 {selectedSlot.start} ~ {selectedSlot.end} 예약
                        </p>
                        <button onClick={handleReserve} className="reserve-button">예약하기</button>
                    </>
                )}
            </div>
        </div>
    );
};

export default PersonalLessonPage;
