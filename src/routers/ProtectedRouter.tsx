// routers/ProtectedRoute.tsx
import { useEffect, useState, type JSX } from "react";
import { supabase } from "../utils/supabaseClient";
import { Navigate } from "react-router-dom";
import { authGet as apiGet } from "../utils/authApi"; 

type Props = {
    children: JSX.Element;
    redirectTo?: string;     // 로그인/콜백 등 리다이렉트 목적지
    requireActive?: boolean; // profiles.is_active 체크할지
};

export default function ProtectedRoute({ children, redirectTo = "/auth/callback", requireActive = true }: Props) {
    const [ready, setReady] = useState(false);
    const [allowed, setAllowed] = useState(false);

    useEffect(() => {
        (async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setAllowed(false);
                setReady(true);
                return;
            }

            if (!requireActive) {
                setAllowed(true);
                setReady(true);
                return;
            }

            try {
                // 백엔드에서 토큰 검증 + 프로필 조회 (/api/me)
                const me = await apiGet<{ user: any; profile: any }>("/api/me");
                // 이메일 인증 완료 트리거가 돌면 is_active=true
                setAllowed(!!me?.profile?.is_active);
            } catch {
                setAllowed(false);
            } finally {
                setReady(true);
            }
        })();
    }, [requireActive]);

    if (!ready) return <div />;

    return allowed ? children : <Navigate to={redirectTo} replace />;
}
