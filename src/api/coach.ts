import { authGet, authPut } from "../utils/authApi";

export type WeeklySlot = { start: string; end: string; is_available?: boolean };
export type WeeklyHoursRow = {
    id: string;
    dow: number;
    start_time: string;
    end_time: string;
    is_available: boolean;
    note?: string | null;
    created_at: string;
};

export type WeeklyHoursResponse = {
    coach_id?: string;              // 관리자 API에는 포함됨, me API는 없음
    weekly_hours: WeeklyHoursRow[];
};

export type SaveWeeklyPayload = {
    weekly: Record<string, WeeklySlot[]>;
    note?: string | null;
};

// ===========================================
// 코치 본인 전용 API (/api/me/weekly-hours)
// ===========================================
export async function getMyWeeklyHours(dow?: number) {
    const qs = new URLSearchParams();
    if (dow !== undefined) qs.set("dow", String(dow));
    return authGet<WeeklyHoursResponse>(`/api/me/weekly-hours?${qs}`);
}

export async function saveMyWeeklyHours(payload: SaveWeeklyPayload) {
    return authPut<WeeklyHoursResponse>(`/api/me/weekly-hours`, payload);
}

// =================================================
// 관리자/시설관리자 전용 API (/api/coaches/:id)
// =================================================
export async function getCoachWeeklyHours(coachId: string, dow?: number) {
    const qs = new URLSearchParams();
    if (dow !== undefined) qs.set("dow", String(dow));
    return authGet<WeeklyHoursResponse>(`/api/coaches/${coachId}/weekly-hours?${qs}`);
}

export async function saveCoachWeeklyHours(coachId: string, payload: SaveWeeklyPayload) {
    return authPut<WeeklyHoursResponse>(`/api/coaches/${coachId}/weekly-hours`, payload);
}
