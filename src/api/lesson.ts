// src/api/lesson.ts
import { get, post } from "../utils/api";
import type { Coach } from "../types/Coach";
import type { TimeSlot } from "../types/TimeSlot";
import type { UserTicket } from "../types/UserTicket";

export const fetchCoaches = async (): Promise<Coach[]> => {
    return await get<Coach[]>("/api/coaches");
};

export const fetchUserTickets = async (userId: string): Promise<UserTicket[]> => {
    return await get<UserTicket[]>(`/api/users/${userId}/tickets`);
};

export const fetchAvailableSlots = async (
    coachId: string,
    date: string,
    lessonMinutes = 20
): Promise<TimeSlot[]> => {
    const query = `/api/schedule/available-time?coach_id=${coachId}&date=${date}&lesson_minutes=${lessonMinutes}`;
    const res = await get<{ time_slots: TimeSlot[] }>(query);
    return res.time_slots;
};

export const createReservation = async (payload: {
    user_id: string;
    coach_id: string;
    user_ticket_id: string;
    date: string;        // 'YYYY-MM-DD'
    start_time: string;  // 'HH:MM' or 'HH:MM:SS'
    end_time: string;    // 'HH:MM' or 'HH:MM:SS'
}) => {
    return await post("/api/reservations", payload);
};
