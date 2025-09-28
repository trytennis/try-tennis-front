import React, { useEffect, useMemo, useState } from "react";
import { Clock } from "lucide-react";
import { getMyWeeklyHours, saveMyWeeklyHours, type WeeklySlot } from "../api/coach";
import "../styles/CoachWeeklyHoursEditor.css";

type UiSlot = { start: string; end: string };

const DOW_LABELS = ["일", "월", "화", "수", "목", "금", "토"]; // 0=일 ~ 6=토

function normalizeWeekly(rows: any[]): Record<number, UiSlot[]> {
    const map: Record<number, UiSlot[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
    for (const r of rows ?? []) {
        // is_available이 false인 것은 제외
        if (r.is_available !== false) {
            map[r.dow] = map[r.dow] || [];
            map[r.dow].push({
                start: String(r.start_time).slice(0, 5),
                end: String(r.end_time).slice(0, 5),
            });
        }
    }
    Object.keys(map).forEach((k) => {
        const d = Number(k);
        map[d].sort((a, b) => a.start.localeCompare(b.start));
    });
    return map;
}

const CoachWeeklyHoursEditor: React.FC = () => {
    const [weekly, setWeekly] = useState<Record<number, UiSlot[]>>({
        0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [],
    });
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const res = await getMyWeeklyHours();
                setWeekly(normalizeWeekly(res.weekly_hours || []));
            } catch (e) {
                console.error(e);
                alert("주간 근무시간을 불러오지 못했습니다.");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const addSlot = (dow: number) => {
        const existingSlots = weekly[dow] || [];
        // 기본값을 기존 슬롯을 참고해서 설정
        const defaultStart = existingSlots.length > 0 ? "14:00" : "09:00";
        const defaultEnd = existingSlots.length > 0 ? "16:00" : "18:00";

        setWeekly((prev) => ({
            ...prev,
            [dow]: [...(prev[dow] || []), { start: defaultStart, end: defaultEnd }],
        }));
    };

    const removeSlot = (dow: number, idx: number) => {
        setWeekly((prev) => ({ ...prev, [dow]: prev[dow].filter((_, i) => i !== idx) }));
    };

    const updateSlot = (dow: number, idx: number, key: keyof UiSlot, value: string) => {
        setWeekly((prev) => ({
            ...prev,
            [dow]: prev[dow].map((s, i) => (i === idx ? { ...s, [key]: value } : s)),
        }));
    };

    const clearDay = (dow: number) => setWeekly((prev) => ({ ...prev, [dow]: [] }));

    const clearAll = () => {
        if (confirm("모든 근무시간을 삭제하시겠습니까?")) {
            setWeekly({ 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] });
        }
    };

    const payload = useMemo(() => {
        const obj: Record<string, WeeklySlot[]> = {};
        (Object.keys(weekly) as unknown as number[]).forEach((d) => {
            obj[String(d)] = (weekly[d] || []).map((s) => ({
                start: s.start,
                end: s.end,
                is_available: true, // 모든 슬롯은 사용 가능으로 설정
            }));
        });
        return { weekly: obj };
    }, [weekly]);

    const onSave = async () => {
        // 시간 형식 및 논리 검증
        const isTime = (t: string) => /^\d{2}:\d{2}$/.test(t);

        for (const d of Object.keys(weekly)) {
            const slots = weekly[Number(d)];
            for (let i = 0; i < slots.length; i++) {
                const s = slots[i];
                if (!isTime(s.start) || !isTime(s.end)) {
                    alert("시간 형식은 HH:MM 이어야 합니다.");
                    return;
                }
                if (s.start >= s.end) {
                    alert("시작 시간은 종료 시간보다 이르러야 합니다.");
                    return;
                }
            }

            // 같은 요일 내 겹치는 시간 확인
            for (let i = 0; i < slots.length; i++) {
                for (let j = i + 1; j < slots.length; j++) {
                    const s1 = slots[i];
                    const s2 = slots[j];
                    if ((s1.start < s2.end && s1.end > s2.start)) {
                        alert(`${DOW_LABELS[Number(d)]}요일에 겹치는 시간대가 있습니다.`);
                        return;
                    }
                }
            }
        }

        try {
            setSaving(true);
            await saveMyWeeklyHours(payload);
            alert("근무 시간이 저장되었습니다.");
        } catch (e) {
            console.error(e);
            alert("저장에 실패했습니다.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="mp__card cwh__card">
                <div className="cwh__header">
                    <h2 className="mp__section-title">
                        <Clock size={16} className="mp__icon" />
                        주간 근무시간 설정
                    </h2>
                </div>
                <div className="mp__center">불러오는 중...</div>
            </div>
        );
    }

    return (
        <div className="mp__card cwh__card">
            <div className="cwh__header">
                <h2 className="mp__section-title">
                    <Clock size={16} className="mp__icon" />
                    주간 근무시간 설정
                </h2>
                <div className="cwh__header-actions">
                    <button
                        type="button"
                        className="mp__btn cwh__btn-danger"
                        onClick={clearAll}
                        disabled={saving}
                    >
                        전체 초기화
                    </button>
                </div>
            </div>

            <div className="cwh__grid">
                {DOW_LABELS.map((label, dow) => (
                    <div className={`cwh__day ${saving ? 'loading' : ''}`} key={dow}>
                        <div className="cwh__day-head">
                            <strong>{label}요일</strong>
                            <div className="cwh__day-actions">
                                <button
                                    type="button"
                                    className="mp__btn mp__btn-ghost"
                                    onClick={() => addSlot(dow)}
                                    disabled={saving}
                                >
                                    + 추가
                                </button>
                                {(weekly[dow]?.length ?? 0) > 0 && (
                                    <button
                                        type="button"
                                        className="mp__btn cwh__btn-danger"
                                        onClick={() => clearDay(dow)}
                                        disabled={saving}
                                    >
                                        비우기
                                    </button>
                                )}
                            </div>
                        </div>

                        {(weekly[dow] || []).length === 0 ? (
                            <div className="cwh__empty">설정된 시간이 없습니다</div>
                        ) : (
                            (weekly[dow] || []).map((slot, idx) => (
                                <div className="cwh__row" key={idx}>
                                    <div className="cwh__time-inputs">
                                        <div className="cwh__field">
                                            <label className="cwh__label">시작 시간</label>
                                            <input
                                                type="time"
                                                className="cwh__time-input"
                                                value={slot.start}
                                                onChange={(e) => updateSlot(dow, idx, "start", e.target.value)}
                                                disabled={saving}
                                            />
                                        </div>
                                        <div className="cwh__field">
                                            <label className="cwh__label">종료 시간</label>
                                            <input
                                                type="time"
                                                className="cwh__time-input"
                                                value={slot.end}
                                                onChange={(e) => updateSlot(dow, idx, "end", e.target.value)}
                                                disabled={saving}
                                            />
                                        </div>
                                    </div>
                                    <div className="cwh__row-actions">
                                        <button
                                            type="button"
                                            className="mp__btn cwh__btn-danger"
                                            onClick={() => removeSlot(dow, idx)}
                                            disabled={saving}
                                        >
                                            삭제
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ))}
            </div>

            <div className="cwh__save-actions">
                <button
                    type="button"
                    className={`mp__btn mp__btn-primary ${saving ? "mp__btn-disabled" : ""}`}
                    onClick={onSave}
                    disabled={saving}
                >
                    {saving ? "저장 중..." : "변경사항 저장"}
                </button>
            </div>
        </div>
    );
};

export default CoachWeeklyHoursEditor;