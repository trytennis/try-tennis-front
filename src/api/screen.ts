import { authDelete, authGet, authPatch, authPost } from "../utils/authApi";

const API_URL = import.meta.env.VITE_API_URL;

export type ScreenRoomStatus = "active" | "broken" | "maintenance" | "inactive";

export type ScreenRoom = {
  id: string;
  facility_id: string;
  name: string;
  room_no: number;
  status: ScreenRoomStatus;
  booking_unit_minutes: number;
  open_time: string;
  close_time: string;
  tablet_enabled: boolean;
  note?: string | null;
  facilities?: { name?: string | null } | null;
};

export type ScreenReservation = {
  id: string;
  facility_id: string;
  screen_room_id: string;
  user_id?: string | null;
  guest_name?: string | null;
  guest_phone?: string | null;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  memo?: string | null;
  screen_rooms?: { name?: string | null; room_no?: number | null; facility_id?: string | null } | null;
};

export type ScreenSlot = {
  start_time: string;
  end_time: string;
  available: boolean;
};

export type ScreenAvailabilityRoom = {
  room: ScreenRoom;
  slots: ScreenSlot[];
};

export type ScreenAvailability = {
  date: string;
  rooms: ScreenAvailabilityRoom[];
};

async function publicRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, init);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `API 요청 실패: ${res.status}`);
  }
  return res.json();
}

export function fetchScreenRooms(facilityId?: string) {
  const qs = facilityId ? `?facility_id=${encodeURIComponent(facilityId)}` : "";
  return authGet<ScreenRoom[]>(`/api/screens/rooms${qs}`);
}

export function createScreenRoom(payload: Partial<ScreenRoom>) {
  return authPost<ScreenRoom>("/api/screens/rooms", payload);
}

export function updateScreenRoom(roomId: string, payload: Partial<ScreenRoom>) {
  return authPatch<ScreenRoom>(`/api/screens/rooms/${roomId}`, payload);
}

export function fetchScreenReservations(facilityId?: string, date?: string) {
  const qs = new URLSearchParams();
  if (facilityId) qs.set("facility_id", facilityId);
  if (date) qs.set("date", date);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return authGet<ScreenReservation[]>(`/api/screens/reservations${suffix}`);
}

export function cancelScreenReservation(reservationId: string) {
  return authDelete<ScreenReservation>(`/api/screens/reservations/${reservationId}`);
}

export function fetchPublicScreenRooms(facilityId: string) {
  return publicRequest<ScreenRoom[]>(`/api/screens/public/${facilityId}/rooms`);
}

export function fetchPublicScreenAvailability(facilityId: string, date: string) {
  return publicRequest<ScreenAvailability>(`/api/screens/public/${facilityId}/availability?date=${encodeURIComponent(date)}`);
}

export function createPublicScreenReservation(
  facilityId: string,
  payload: {
    screen_room_id: string;
    date: string;
    start_time: string;
    end_time: string;
    guest_name: string;
    guest_phone: string;
    memo?: string;
  }
) {
  return publicRequest<ScreenReservation>(`/api/screens/public/${facilityId}/reservations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
