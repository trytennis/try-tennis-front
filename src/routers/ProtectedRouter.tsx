// routers/ProtectedRoute.tsx
import { useEffect, useRef, useState, type JSX } from "react";
import { supabase } from "../utils/supabaseClient";
import { Navigate, useLocation } from "react-router-dom";
import { authGet } from "../utils/authApi";
import { clearProfileCache, getCachedProfile, setCachedProfile } from "../utils/authState";

type Props = {
    children: JSX.Element;
    redirectTo?: string;      // 로그인/콜백 등 리다이렉트 목적지
    requireActive?: boolean;  // profiles.is_active 체크할지
};

export default function ProtectedRoute({
    children,
    redirectTo = "/auth/callback",
    requireActive = true,
}: Props) {
    const [ready, setReady] = useState(false);
    const [allowed, setAllowed] = useState(false);
    const inFlight = useRef(false);
    const unsub = useRef<(() => void) | null>(null);
    const location = useLocation();


    async function check() {
        if (inFlight.current) return;
        inFlight.current = true;

        try {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                setAllowed(false);
                clearProfileCache(); // 세션 없으면 프로필 캐시도 클리어
                return;
            }

            if (!requireActive) {
                setAllowed(true);
                return;
            }

            // 캐시된 프로필이 있고 세션이 유효하면 재사용
            const cachedProfile = getCachedProfile();
            if (cachedProfile && session.access_token) {
                setAllowed(!!cachedProfile.is_active);
                return;
            }

            // 캐시가 없거나 만료된 경우만 API 호출
            const me = await authGet<{ user: any; profile: any }>("/api/me");
            setCachedProfile(me?.profile);
            setAllowed(!!me?.profile?.is_active);
        } catch {
            setAllowed(false);
            clearProfileCache();
        } finally {
            setReady(true);
            inFlight.current = false;
        }
    }

    useEffect(() => {
        // 최초 1회 검사
        check();

        // auth 상태 변화(로그인/로그아웃/토큰 회전)에만 재검사
        const { data: sub } = supabase.auth.onAuthStateChange(() => {
            setReady(false);
            setAllowed(false);
            check();
        });
        unsub.current = () => sub.subscription.unsubscribe();

        return () => {
            unsub.current?.();
            inFlight.current = false;
        };
        // requireActive가 바뀌면 정책이 달라지니 재검사
    }, [requireActive]);

    // redirect 루프 방지: 이미 redirectTo 경로라면 Navigate 하지 않음
    if (!ready) return <div />;
    if (!allowed) {
        if (location.pathname === redirectTo) {
            // 콜백 페이지 스스로가 보호되어 있을 때 루프 방지용
            return <div />;
        }
        return <Navigate to={redirectTo} replace />;
    }

    return children;
}
