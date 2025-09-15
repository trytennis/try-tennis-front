// pages/AuthCallbackPage.tsx
import { supabase } from '../utils/supabaseClient';
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthCallbackPage() {
  const nav = useNavigate();
  useEffect(() => {
    (async () => {
      // 세션 있으면 로그인 완료
      const { data: { session } } = await supabase.auth.getSession();
      // 선택: 프로필 활성화 검사 위해 /api/me 호출 가능
      nav(session ? "/" : "/login", { replace: true });
    })();
  }, [nav]);
  return <div>이메일 인증 확인 중...</div>;
}
