import type { TimeSlot } from "../types/TimeSlot";
import type { UserTicket } from "../types/UserTicket";
import type { Reservation } from "../types/Reservation";
import type { ScheduleEvent } from "../types/Schedule";
import { authGet, authPatch } from "../utils/authApi";

// 코치별 예약 가능 시간대 조회
export const fetchAvailableSlots = async (
  coachId: string,
  date: string,
  lessonMinutes = 20
): Promise<TimeSlot[]> => {
  const query = `/api/schedule/available-time?coach_id=${coachId}&date=${date}&lesson_minutes=${lessonMinutes}`;
  const res = await authGet<{ time_slots: TimeSlot[] }>(query);
  return res.time_slots;
};

// 예약 목록 조회 (코치 기준)
export const fetchReservationsByCoach = async (
  status?: string,
  date?: string
): Promise<Reservation[]> => {
  let url = `/api/reservations/coach`;
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

  const res = await authGet(url);
  return res.reservations || res; // API 응답 구조에 따라
};

// 예약 상태 변경
export type ReservationStatusUpdatable = "cancelled" | "completed" | "confirmed";

export const updateReservationStatus = async (
  reservationId: string,
  status: ReservationStatusUpdatable,
  reason?: string
): Promise<void> => {
  await authPatch(`/api/reservations/${reservationId}/status`, {
    status,
    reason,
  });
};

export const cancelReservation = async (
  reservationId: string,
  reason = "코치 측 취소"
) => updateReservationStatus(reservationId, "cancelled", reason);


// 코치 캘린더 조회 (confirmed/completed 기본, include_cancelled 옵션)
export const fetchCoachSchedule = async (params: {
  startDate: string;       // 'YYYY-MM-DD'
  endDate: string;         // 'YYYY-MM-DD'
  includeCancelled?: boolean; // 기본 false
}): Promise<ScheduleEvent[]> => {
  const { startDate, endDate, includeCancelled = false } = params;

  const qs = new URLSearchParams({
    start_date: startDate,
    end_date: endDate,
    include_cancelled: String(includeCancelled),
  });

  // 서버에서 이미 캘린더 이벤트 형태로 내려오게 구현함
  return await authGet<ScheduleEvent[]>(`/api/schedule/coach?${qs.toString()}`);
};
