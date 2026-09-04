import React, { useEffect, useMemo, useState } from "react";
import { Copy, Monitor, RefreshCw } from "lucide-react";
import { FacilitiesApi } from "../api/facility";
import type { Facility } from "../types/FacilityData";
import {
  cancelScreenReservation,
  createScreenRoom,
  fetchScreenReservations,
  fetchScreenRooms,
  updateScreenRoom,
  type ScreenReservation,
  type ScreenRoom,
  type ScreenRoomStatus,
} from "../api/screen";
import "../styles/ScreenManagementPage.css";

const statusLabels: Record<ScreenRoomStatus, string> = {
  active: "운영중",
  broken: "고장",
  maintenance: "점검",
  inactive: "비활성",
};

const today = () => new Date().toISOString().slice(0, 10);

export default function ScreenManagementPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [facilityId, setFacilityId] = useState("");
  const [rooms, setRooms] = useState<ScreenRoom[]>([]);
  const [reservations, setReservations] = useState<ScreenReservation[]>([]);
  const [date, setDate] = useState(today());
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: "",
    room_no: "1",
    booking_unit_minutes: "60",
    open_time: "09:00",
    close_time: "22:00",
  });

  const selectedFacility = facilities.find((facility) => facility.id === facilityId);
  const tabletUrl = facilityId ? `${window.location.origin}/tablet/screen-booking/${facilityId}` : "";

  async function loadFacilities() {
    const data = await FacilitiesApi.list();
    setFacilities(data);
    if (!facilityId && data[0]) setFacilityId(data[0].id);
  }

  async function loadScreenData(targetFacilityId = facilityId) {
    if (!targetFacilityId) return;
    setBusy(true);
    try {
      const [nextRooms, nextReservations] = await Promise.all([
        fetchScreenRooms(targetFacilityId),
        fetchScreenReservations(targetFacilityId, date),
      ]);
      setRooms(nextRooms);
      setReservations(nextReservations);
      setNotice("");
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "스크린룸 정보를 불러오지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    loadFacilities().catch((err) => setNotice(err instanceof Error ? err.message : "시설 목록을 불러오지 못했습니다."));
  }, []);

  useEffect(() => {
    loadScreenData().catch(console.error);
  }, [facilityId, date]);

  async function submitRoom(event: React.FormEvent) {
    event.preventDefault();
    if (!facilityId) return;
    setBusy(true);
    try {
      await createScreenRoom({
        facility_id: facilityId,
        name: form.name || `스크린 ${form.room_no}`,
        room_no: Number(form.room_no),
        booking_unit_minutes: Number(form.booking_unit_minutes),
        open_time: form.open_time,
        close_time: form.close_time,
        status: "active",
        tablet_enabled: true,
      });
      setForm((prev) => ({ ...prev, name: "", room_no: String(Number(prev.room_no) + 1) }));
      setNotice("스크린룸이 추가되었습니다.");
      await loadScreenData();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "스크린룸 추가에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function changeStatus(room: ScreenRoom, status: ScreenRoomStatus) {
    await updateScreenRoom(room.id, { status });
    await loadScreenData();
  }

  async function toggleTablet(room: ScreenRoom) {
    await updateScreenRoom(room.id, { tablet_enabled: !room.tablet_enabled });
    await loadScreenData();
  }

  async function cancelReservation(reservation: ScreenReservation) {
    if (!confirm(`${reservation.guest_name || "예약"} 건을 취소할까요?`)) return;
    await cancelScreenReservation(reservation.id);
    await loadScreenData();
  }

  const summary = useMemo(() => {
    const active = rooms.filter((room) => room.status === "active").length;
    return { active, total: rooms.length, reserved: reservations.filter((item) => item.status !== "cancelled").length };
  }, [rooms, reservations]);

  return (
    <div className="screen-admin">
      <header className="screen-admin__header">
        <div>
          <p>시설 운영</p>
          <h1>스크린룸 관리</h1>
        </div>
        <button type="button" onClick={() => loadScreenData()} disabled={busy}>
          <RefreshCw size={18} />
          새로고침
        </button>
      </header>

      {notice && <div className="screen-admin__notice">{notice}</div>}

      <section className="screen-admin__toolbar">
        <label>
          시설
          <select value={facilityId} onChange={(event) => setFacilityId(event.target.value)}>
            {facilities.map((facility) => (
              <option key={facility.id} value={facility.id}>{facility.name}</option>
            ))}
          </select>
        </label>
        <label>
          예약일
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </label>
        <div>
          <span>운영 {summary.active}/{summary.total}</span>
          <span>예약 {summary.reserved}</span>
        </div>
      </section>

      <section className="screen-admin__tablet">
        <Monitor size={22} />
        <div>
          <strong>{selectedFacility?.name || "시설"} 태블릿 예약 링크</strong>
          <span>{tabletUrl || "시설을 선택하세요"}</span>
        </div>
        <button type="button" disabled={!tabletUrl} onClick={() => navigator.clipboard.writeText(tabletUrl)}>
          <Copy size={17} />
          복사
        </button>
      </section>

      <form className="screen-admin__form" onSubmit={submitRoom}>
        <input placeholder="스크린룸명" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
        <input type="number" min="1" placeholder="번호" value={form.room_no} onChange={(event) => setForm((prev) => ({ ...prev, room_no: event.target.value }))} />
        <input type="number" min="10" step="10" placeholder="예약 단위" value={form.booking_unit_minutes} onChange={(event) => setForm((prev) => ({ ...prev, booking_unit_minutes: event.target.value }))} />
        <input type="time" value={form.open_time} onChange={(event) => setForm((prev) => ({ ...prev, open_time: event.target.value }))} />
        <input type="time" value={form.close_time} onChange={(event) => setForm((prev) => ({ ...prev, close_time: event.target.value }))} />
        <button type="submit" disabled={busy || !facilityId}>스크린룸 추가</button>
      </form>

      <section className="screen-admin__grid">
        <div className="screen-admin__panel">
          <h2>스크린룸</h2>
          <div className="screen-admin__rooms">
            {rooms.map((room) => (
              <article key={room.id}>
                <div>
                  <strong>{room.name}</strong>
                  <span>{room.room_no}번 · {room.booking_unit_minutes}분 · {room.open_time?.slice(0, 5)}-{room.close_time?.slice(0, 5)}</span>
                </div>
                <select value={room.status} onChange={(event) => changeStatus(room, event.target.value as ScreenRoomStatus)}>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <button type="button" onClick={() => toggleTablet(room)}>
                  현장 {room.tablet_enabled ? "허용" : "차단"}
                </button>
              </article>
            ))}
            {rooms.length === 0 && <p>등록된 스크린룸이 없습니다.</p>}
          </div>
        </div>

        <div className="screen-admin__panel">
          <h2>예약 현황</h2>
          <div className="screen-admin__reservations">
            {reservations.map((reservation) => (
              <article key={reservation.id}>
                <div>
                  <strong>{reservation.screen_rooms?.name || "스크린룸"}</strong>
                  <span>{reservation.start_time?.slice(0, 5)}-{reservation.end_time?.slice(0, 5)} · {reservation.guest_name || "비회원"} · {reservation.guest_phone}</span>
                </div>
                <em>{reservation.status}</em>
                {reservation.status !== "cancelled" && (
                  <button type="button" onClick={() => cancelReservation(reservation)}>취소</button>
                )}
              </article>
            ))}
            {reservations.length === 0 && <p>예약 내역이 없습니다.</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
