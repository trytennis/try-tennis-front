import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Monitor, RefreshCw } from "lucide-react";
import { useParams } from "react-router-dom";
import {
  createPublicScreenReservation,
  fetchPublicScreenAvailability,
  fetchPublicScreenRooms,
  type ScreenAvailability,
  type ScreenRoom,
  type ScreenSlot,
} from "../api/screen";
import "../styles/TabletScreenBookingPage.css";

const today = () => new Date().toISOString().slice(0, 10);

export default function TabletScreenBookingPage() {
  const { facilityId = "" } = useParams();
  const [date, setDate] = useState(today());
  const [rooms, setRooms] = useState<ScreenRoom[]>([]);
  const [availability, setAvailability] = useState<ScreenAvailability | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<ScreenSlot | null>(null);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [notice, setNotice] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const selectedRoom = rooms.find((room) => room.id === selectedRoomId);
  const facilityName = selectedRoom?.facilities?.name || rooms[0]?.facilities?.name || "스크린테니스";
  const roomSlots = useMemo(() => {
    const row = availability?.rooms.find((item) => item.room.id === selectedRoomId);
    return row?.slots || [];
  }, [availability, selectedRoomId]);

  async function load() {
    if (!facilityId) return;
    setBusy(true);
    try {
      const [nextRooms, nextAvailability] = await Promise.all([
        fetchPublicScreenRooms(facilityId),
        fetchPublicScreenAvailability(facilityId, date),
      ]);
      setRooms(nextRooms);
      setAvailability(nextAvailability);
      setSelectedRoomId((prev) => prev || nextRooms.find((room) => room.status === "active")?.id || nextRooms[0]?.id || "");
      setNotice("");
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "예약 정보를 불러오지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    setSelectedSlot(null);
    load().catch(console.error);
  }, [date, facilityId]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!facilityId || !selectedRoomId || !selectedSlot || !guestName.trim() || !guestPhone.trim()) return;
    setBusy(true);
    try {
      await createPublicScreenReservation(facilityId, {
        screen_room_id: selectedRoomId,
        date,
        start_time: selectedSlot.start_time,
        end_time: selectedSlot.end_time,
        guest_name: guestName.trim(),
        guest_phone: guestPhone.trim(),
      });
      setDone(true);
      setNotice("");
      await load();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "예약에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <main className="tablet-screen tablet-screen--done">
        <CheckCircle2 size={72} />
        <h1>예약이 완료되었습니다</h1>
        <p>{date} {selectedSlot?.start_time} - {selectedSlot?.end_time}</p>
        <strong>{selectedRoom?.name}</strong>
        <button type="button" onClick={() => {
          setDone(false);
          setSelectedSlot(null);
          setGuestName("");
          setGuestPhone("");
        }}>
          새 예약
        </button>
      </main>
    );
  }

  return (
    <main className="tablet-screen">
      <header>
        <div>
          <span>{facilityName}</span>
          <h1>스크린룸 예약</h1>
        </div>
        <button type="button" onClick={() => load()} disabled={busy}>
          <RefreshCw size={22} />
        </button>
      </header>

      {notice && <div className="tablet-screen__notice">{notice}</div>}

      <section className="tablet-screen__date">
        <label>
          이용 날짜
          <input type="date" value={date} min={today()} onChange={(event) => setDate(event.target.value)} />
        </label>
      </section>

      <section className="tablet-screen__rooms">
        <h2>스크린룸 선택</h2>
        <div>
          {rooms.map((room) => (
            <button
              key={room.id}
              type="button"
              className={selectedRoomId === room.id ? "active" : ""}
              disabled={room.status !== "active"}
              onClick={() => {
                setSelectedRoomId(room.id);
                setSelectedSlot(null);
              }}
            >
              <Monitor size={28} />
              <strong>{room.name}</strong>
              <span>{room.status === "active" ? `${room.booking_unit_minutes}분 단위` : room.status}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="tablet-screen__slots">
        <h2>시간 선택</h2>
        <div>
          {roomSlots.map((slot) => (
            <button
              key={`${slot.start_time}-${slot.end_time}`}
              type="button"
              disabled={!slot.available}
              className={selectedSlot?.start_time === slot.start_time ? "active" : ""}
              onClick={() => setSelectedSlot(slot)}
            >
              <strong>{slot.start_time}</strong>
              <span>{slot.available ? "예약가능" : "예약완료"}</span>
            </button>
          ))}
          {roomSlots.length === 0 && <p>선택 가능한 시간이 없습니다.</p>}
        </div>
      </section>

      <form className="tablet-screen__form" onSubmit={submit}>
        <h2>예약자 정보</h2>
        <input placeholder="이름" value={guestName} onChange={(event) => setGuestName(event.target.value)} />
        <input placeholder="휴대폰 번호" value={guestPhone} onChange={(event) => setGuestPhone(event.target.value)} inputMode="tel" />
        <button type="submit" disabled={busy || !selectedSlot || !guestName.trim() || !guestPhone.trim()}>
          {busy ? "예약 중" : "예약 완료"}
        </button>
      </form>
    </main>
  );
}
