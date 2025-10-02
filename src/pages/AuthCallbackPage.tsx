// pages/AuthCallbackPage.tsx
import { supabase } from '../utils/supabaseClient';
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authGet } from "../utils/authApi";

export default function AuthCallbackPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [msg, setMsg] = useState("이메일 인증 확인 중...");
    const [err, setErr] = useState<string | null>(null);
    const doneRef = useRef(false);

    useEffect(() => {
        if (doneRef.current) return;
        doneRef.current = true;

        const run = async () => {
            try {
                setMsg("인증 상태 확인 중...");

                const fullUrl = window.location.href;
                const qs = new URLSearchParams(location.search);

                // 해시 파라미터도 병합
                if (location.hash) {
                    const hashQs = new URLSearchParams(location.hash.slice(1));
                    hashQs.forEach((v, k) => qs.set(k, v));
                }

                const hasAccess = qs.get("access_token");
                const hasRefresh = qs.get("refresh_token");
                const hasCode = qs.get("code");

                // 1) 이메일 인증/매직링크: #access_token, #refresh_token
                if (hasAccess && hasRefresh) {
                    setMsg("세션 설정 중...");
                    const { error } = await supabase.auth.setSession({
                        access_token: hasAccess,
                        refresh_token: hasRefresh,
                    });
                    if (error) throw error;
                }
                // 2) OAuth PKCE: ?code=...
                else if (hasCode) {
                    setMsg("토큰 교환 중...");
                    const { error } = await supabase.auth.exchangeCodeForSession(fullUrl); // 전체 URL
                    if (error) throw error;
                }

                // 3) 세션 확인
                const { data: { session }, error: sErr } = await supabase.auth.getSession();
                if (sErr) throw sErr;

                // URL 정리(새로고침 루프 방지)
                window.history.replaceState({}, "", "/auth/callback");

                if (!session) {
                    setMsg("세션이 없어 로그인 페이지로 이동합니다.");
                    return navigate("/login", { replace: true });
                }

                // 4) 프로필 활성 여부 확인
                setMsg("프로필 확인 중...");
                const me = await authGet<{ user: any; profile: any }>("/api/me").catch(() => null);
                const isActive = !!me?.profile?.is_active;

                if (!isActive) {
                    setMsg("이메일 인증 완료. 관리자 승인 대기 중입니다.");
                    return navigate("/login", {
                        replace: true,
                        state: { notice: "이메일 인증 완료. 관리자 승인 후 이용 가능해요." }
                    });
                }

                // 5) 최종 이동
                const next = qs.get("next") || "/";
                setMsg("확인 완료. 이동합니다...");
                navigate(next, { replace: true });
            } catch (e: any) {
                console.error("[AuthCallback] error", e);
                setErr("인증 처리 중 오류가 발생했습니다.");
                setTimeout(() => navigate("/login", { replace: true }), 1500);
            }
        };

        run();
    }, [location.hash, location.search, navigate]);

    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
            {err ? (
                <>
                    <p style={{ color: "red", marginBottom: 12 }}>{err}</p>
                    <p>로그인 페이지로 이동합니다…</p>
                </>
            ) : (
                <>
                    <div>{msg}</div>
                    <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>창을 닫지 말고 잠시만 기다려 주세요.</div>
                </>
            )}
        </div>
    );
}
