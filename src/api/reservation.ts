import { get } from "../utils/api";
import type { Coach } from "../types/Coach";
import type { TimeSlot } from "../types/TimeSlot";
import type { UserTicket } from "../types/UserTicket";

// 코치 목록 가져오기
export const fetchCoaches = async (): Promise<Coach[]> => {
    return await get<Coach[]>("/api/coaches");
};

// 유저 수강권 가져오기
export const fetchUserTickets = async (userId: string): Promise<UserTicket[]> => {
    return await get<UserTicket[]>(`/api/users/${userId}/tickets`);
};

// 코치별 예약 가능 시간대 조회
export const fetchAvailableSlots = async (
    coachId: string,
    date: string,
    lessonMinutes = 30
): Promise<TimeSlot[]> => {
    const query = `/api/schedule/available-time?coach_id=${coachId}&date=${date}&lesson_minutes=${lessonMinutes}`;
    const res = await get<{ time_slots: TimeSlot[] }>(query);
    return res.time_slots;
};
