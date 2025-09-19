// src/api/lesson.ts
import type { Coach } from "../types/Coach";
import type { TimeSlot } from "../types/TimeSlot";
import type { UserTicket } from "../types/UserTicket";
import { authGet, authPost } from "../utils/authApi";

/**
 * Lessons API (백엔드: @require_auth + @require_roles 로 보호됨)
 */

export const fetchCoaches = async (): Promise<Coach[]> => {
    return await authGet<Coach[]>("/api/coaches");
};

// 본인 수강권 조회
export const fetchUserTickets = async (): Promise<UserTicket[]> => {
    return await authGet<UserTicket[]>(`/api/me/tickets`);
};

// 코치 예약 가능 시간 조회
export const fetchAvailableSlots = async (
    coachId: string,
    date: string,
    lessonMinutes = 20
): Promise<TimeSlot[]> => {
    const query = `/api/schedule/available-time?coach_id=${coachId}&date=${date}&lesson_minutes=${lessonMinutes}`;
    const res = await authGet<{ time_slots: TimeSlot[] }>(query);
    return res.time_slots;
};

// 예약 생성
export const createReservation = async (payload: {
    coach_id: string;
    user_ticket_id: string;
    date: string;        // 'YYYY-MM-DD'
    start_time: string;  // 'HH:MM' or 'HH:MM:SS'
    end_time: string;    // 'HH:MM' or 'HH:MM:SS'
}) => {
    return await authPost("/api/reservations", payload);
};
