// utils/auth.ts
import { supabase } from './supabaseClient';

export type SignUpForm = {
  email: string;
  password: string;
  name: string;
  phone?: string;
  user_type?: 'student' | 'coach' | 'facility_admin';
  gender?: string;
  birthdate?: string;
  facility_id?: string;
  memo?: string;
  // 동의/버전
  agree_terms: boolean;
  agree_privacy: boolean;
  consent_service_notice?: boolean;
  consent_marketing?: boolean;
  terms_version: string;
  privacy_version: string;
};

export async function signUp(form: SignUpForm) {
  const email = form.email.trim().toLowerCase();

  const { data, error } = await supabase.auth.signUp({
    email,
    password: form.password,
    options: {
      data: {
        name: form.name,
        phone: form.phone || null,
        user_type: form.user_type ?? 'student',   // 서버/트리거에서 기본값/검증 병행
        gender: form.gender || null,
        birthdate: form.birthdate || null,
        facility_id: form.facility_id || null,
        memo: form.memo || null,

        // 동의/버전
        agree_terms: !!form.agree_terms,
        agree_privacy: !!form.agree_privacy,
        consent_service_notice: !!form.consent_service_notice,
        consent_marketing: !!form.consent_marketing,
        terms_version: form.terms_version,
        privacy_version: form.privacy_version,
      },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) throw error;
  return data; // 이메일 인증 ON이면 session은 보통 null → UI에서 “메일 확인” 안내
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function resendEmail(email: string) {
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: email.trim().toLowerCase(),
  });
  if (error) throw error;
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(
    email.trim().toLowerCase(),
    { redirectTo: `${window.location.origin}/auth/reset` }
  );
  if (error) throw error;
}
