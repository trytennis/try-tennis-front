import { supabase } from './supabaseClient';

// 회원가입 (메타데이터 포함: 트리거가 profiles 생성)
export async function signUp(email: string, password: string, name: string, phone?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        phone,
        agree_terms: true,
        agree_privacy: true,
        consent_marketing: false,
        terms_version: "2025-09-10",
        privacy_version: "2025-09-10",
      },
      // 이메일 인증 ON: redirect URL 등록 필요
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (error) throw error;
  // 이메일 인증 ON이면 여기서 바로 세션 없음 → 사용자에게 “메일 확인” 안내
  return data;
}

// 로그인
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error; // 이메일 미인증이면 여기서 에러 발생
  return data;
}

// 로그아웃
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// 이메일 재전송
export async function resendEmail(email: string) {
  // supabase-js v2
  const { error } = await supabase.auth.resend({ type: "signup", email });
  if (error) throw error;
}

// 비밀번호 재설정
export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset`,
  });
  if (error) throw error;
}
