import React, { useEffect, useState } from "react";
import { Mail, User, Phone, Shield, LogOut } from "lucide-react";
import "../styles/MyPage.css";
import { authGet, authPut } from "../utils/authApi";
import { supabase } from "../utils/supabaseClient";

type Profile = {
    id: string;
    auth_user_id: string;
    email?: string;
    name?: string;
    phone?: string;
    gender?: "male" | "female" | "other" | "" | null;
    birthdate?: string | null;
    memo?: string | null;
    is_active?: boolean;
    consent_marketing?: boolean;
    message_opt_out_at?: string | null; // 서비스 알림 수신 거부 시각 (있으면 off)
};

type MeResponse = {
    user: {
        id: string;
        email: string;
        email_confirmed_at?: string | null;
    };
    profile: Profile | null;
};

export default function MyPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [ok, setOk] = useState<string | null>(null);
    const [me, setMe] = useState<MeResponse | null>(null);

    // 편집용 폼 상태
    const [form, setForm] = useState<Partial<Profile>>({
        name: "",
        phone: "",
        gender: "",
        birthdate: "",
        memo: "",
        consent_marketing: false,
        // 서비스 알림(정보성)은 opt-out 관점: null이면 ON, 값 있으면 OFF
        message_opt_out_at: null,
    });

    function onChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) {
        const { name, value, type, checked } = e.target as HTMLInputElement;
        if (name === "service_notice") {
            // 스위치형: true면 수신, false면 거부시간 기록(프론트에서는 null/ISO 문자열로 관리)
            setForm((p) => ({
                ...p,
                message_opt_out_at: checked ? null : (p.message_opt_out_at ?? new Date().toISOString()),
            }));
            return;
        }
        setForm((p) => ({
            ...p,
            [name]: type === "checkbox" ? checked : value,
        }));
    }

    async function loadMe() {
        setLoading(true);
        setErr(null);
        try {
            const res = await authGet<MeResponse>("/api/me");
            setMe(res);
            const prof = res.profile || ({} as Profile);
            setForm({
                name: prof.name ?? "",
                phone: prof.phone ?? "",
                gender: (prof.gender as any) ?? "",
                birthdate: prof.birthdate ?? "",
                memo: prof.memo ?? "",
                consent_marketing: !!prof.consent_marketing,
                message_opt_out_at: prof.message_opt_out_at ?? null,
            });
        } catch (e: any) {
            setErr(e?.message || "내 정보를 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    }

    async function onSave(e: React.FormEvent) {
        e.preventDefault();
        setErr(null);
        setOk(null);
        setSaving(true);
        try {
            // 서버는 allowed 필드만 업데이트 하도록 이미 구현되어 있음
            const payload: any = {
                name: form.name,
                phone: form.phone,
                gender: form.gender || null,
                birthdate: form.birthdate || null,
                memo: form.memo || null,
                consent_marketing: !!form.consent_marketing,
                message_opt_out_at: form.message_opt_out_at ?? null,
            };
            await authPut("/api/me", payload);
            setOk("저장되었습니다.");
            await loadMe(); // 갱신
        } catch (e: any) {
            setErr(e?.message || "저장에 실패했습니다.");
        } finally {
            setSaving(false);
        }
    }

    async function onLogout() {
        try {
            await supabase.auth.signOut({ scope: "global" });
            window.location.href = "/login";
        } catch {
            window.location.href = "/login";
        }
    }

    useEffect(() => {
        loadMe();
    }, []);

    const serviceNoticeOn = !form.message_opt_out_at; // null이면 ON

    return (
        <div className="mp__screen">
            <div className="mp__container">
                <div className="mp__header">
                    <h1 className="mp__title">마이페이지</h1>
                    <button className="mp__btn mp__btn-ghost" onClick={onLogout}>
                        <LogOut size={16} />
                        로그아웃
                    </button>
                </div>

                {loading ? (
                    <div className="mp__card mp__center">불러오는 중...</div>
                ) : err ? (
                    <div className="mp__alert mp__alert-error">{err}</div>
                ) : (
                    <>
                        {/* 계정 정보 */}
                        <div className="mp__card">
                            <h2 className="mp__section-title">
                                <Mail size={16} className="mp__icon" />
                                계정 정보
                            </h2>
                            <div className="mp__rows">
                                <div className="mp__row">
                                    <span className="mp__label">이메일</span>
                                    <span className="mp__value">{me?.user.email}</span>
                                </div>
                                <div className="mp__row">
                                    <span className="mp__label">이메일 인증</span>
                                    <span className={`mp__chip ${me?.user.email_confirmed_at ? "ok" : "warn"}`}>
                                        {me?.user.email_confirmed_at ? "완료" : "미완료"}
                                    </span>
                                </div>
                                <div className="mp__row">
                                    <span className="mp__label">계정 활성화</span>
                                    <span className={`mp__chip ${me?.profile?.is_active ? "ok" : "warn"}`}>
                                        {me?.profile?.is_active ? "활성" : "비활성"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* 프로필 수정 */}
                        <form className="mp__card" onSubmit={onSave}>
                            <h2 className="mp__section-title">
                                <User size={16} className="mp__icon" />
                                프로필 정보
                            </h2>

                            <div className="mp__grid">
                                <div className="mp__field">
                                    <label className="mp__label">이름</label>
                                    <input
                                        name="name"
                                        className="mp__input"
                                        value={form.name || ""}
                                        onChange={onChange}
                                        placeholder="홍길동"
                                    />
                                </div>

                                <div className="mp__field">
                                    <label className="mp__label">전화번호</label>
                                    <input
                                        name="phone"
                                        className="mp__input"
                                        value={form.phone || ""}
                                        onChange={onChange}
                                        placeholder="01012345678"
                                    />
                                </div>

                                <div className="mp__field">
                                    <label className="mp__label">성별</label>
                                    <select name="gender" className="mp__select" value={form.gender || ""} onChange={onChange}>
                                        <option value="">선택 안함</option>
                                        <option value="male">남성</option>
                                        <option value="female">여성</option>
                                        <option value="other">기타</option>
                                    </select>
                                </div>

                                <div className="mp__field">
                                    <label className="mp__label">생년월일</label>
                                    <input
                                        type="date"
                                        name="birthdate"
                                        className="mp__input"
                                        value={form.birthdate || ""}
                                        onChange={onChange}
                                    />
                                </div>
                            </div>

                            <div className="mp__field">
                                <label className="mp__label">메모</label>
                                <textarea
                                    name="memo"
                                    className="mp__textarea"
                                    rows={3}
                                    value={form.memo || ""}
                                    onChange={onChange}
                                    placeholder="요청사항 등 메모"
                                />
                            </div>

                            <div className="mp__divider" />

                            <h2 className="mp__section-title">
                                <Shield size={16} className="mp__icon" />
                                수신 설정
                            </h2>

                            <div className="mp__toggles">
                                <label className="mp__toggle">
                                    <input
                                        type="checkbox"
                                        name="service_notice"
                                        checked={serviceNoticeOn}
                                        onChange={onChange}
                                    />
                                    <span>서비스 알림 수신</span>
                                </label>

                                <label className="mp__toggle">
                                    <input
                                        type="checkbox"
                                        name="consent_marketing"
                                        checked={!!form.consent_marketing}
                                        onChange={onChange}
                                    />
                                    <span>마케팅 정보 수신</span>
                                </label>
                            </div>

                            {ok && <div className="mp__alert mp__alert-ok">{ok}</div>}
                            {err && <div className="mp__alert mp__alert-error">{err}</div>}

                            <div className="mp__actions">
                                <button className={`mp__btn mp__btn-primary ${saving ? "mp__btn-disabled" : ""}`} disabled={saving}>
                                    {saving ? "저장 중..." : "저장하기"}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
