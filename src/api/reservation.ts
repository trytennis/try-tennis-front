import { get, patch } from "../utils/api";
import type { Coach } from "../types/Coach";
import type { TimeSlot } from "../types/TimeSlot";
import type { UserTicket } from "../types/UserTicket";
import type { Reservation } from "../types/Reservation";
import type { ScheduleEvent } from "../types/Schedule";

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
  lessonMinutes = 20
): Promise<TimeSlot[]> => {
  const query = `/api/schedule/available-time?coach_id=${coachId}&date=${date}&lesson_minutes=${lessonMinutes}`;
  const res = await get<{ time_slots: TimeSlot[] }>(query);
  return res.time_slots;
};

// 예약 목록 조회 (코치 기준)
export const fetchReservationsByCoach = async (
  coachId: string,
  status?: string,
  date?: string
): Promise<Reservation[]> => {
  let url = `/api/reservations/coach/${coachId}`;
  const params = new URLSearchParams();

  if (status && status !== 'all') {
    params.append('status', status);
  }
  if (date) {
    params.append('date', date);
  }

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const res = await get(url);
  return res.reservations || res; // API 응답 구조에 따라
};

// 예약 상태 변경
export type ReservationStatusUpdatable = "cancelled" | "completed" | "confirmed";

export const updateReservationStatus = async (
  reservationId: string,
  status: ReservationStatusUpdatable,
  changedBy: string,
  reason?: string
): Promise<void> => {
  await patch(`/api/reservations/${reservationId}/status`, {
    status,
    changed_by: changedBy,
    reason,
  });
};

export const cancelReservation = async (
  reservationId: string,
  changedBy: string,
  reason = "코치 측 취소"
) => updateReservationStatus(reservationId, "cancelled", changedBy, reason);


// 코치 캘린더 조회 (confirmed/completed 기본, include_cancelled 옵션)
export const fetchCoachSchedule = async (params: {
  coachId: string;
  startDate: string;       // 'YYYY-MM-DD'
  endDate: string;         // 'YYYY-MM-DD'
  includeCancelled?: boolean; // 기본 false
}): Promise<ScheduleEvent[]> => {
  const { coachId, startDate, endDate, includeCancelled = false } = params;

  const qs = new URLSearchParams({
    coach_id: coachId,
    start_date: startDate,
    end_date: endDate,
    include_cancelled: String(includeCancelled),
  });

  // 서버에서 이미 캘린더 이벤트 형태로 내려오게 구현함
  return await get<ScheduleEvent[]>(`/api/schedule/coach?${qs.toString()}`);
};
