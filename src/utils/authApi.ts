// utils/api.ts
import { supabase } from "./supabaseClient";

const API_URL = import.meta.env.VITE_API_URL;


async function getFreshSession() {
    // 현재 세션
    const { data: { session } } = await supabase.auth.getSession();
    const now = Math.floor(Date.now() / 1000);
    const exp = (session?.user as any)?.exp as number | undefined;

    // 만료까지 15초 이상 남았으면 사용
    if (session?.access_token && exp && exp - now > 15) return session;

    // 회전/만료 임박 → 갱신 시도
    const { data, error } = await supabase.auth.refreshSession();
    if (!error && data.session) return data.session;

    // 갱신 실패 시 기존 세션이라도 반환 (서버에서 401/403시 재시도 처리)
    return session || null;
}

async function buildHeaders(contentTypeJson = false): Promise<Record<string, string>> {
    const headers: Record<string, string> = {};
    if (contentTypeJson) headers["Content-Type"] = "application/json";
    const fresh = await getFreshSession();
    if (fresh?.access_token) headers["Authorization"] = `Bearer ${fresh.access_token}`;
    return headers;
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
    const url = `${API_URL}${path}`;
    const res = await fetch(url, init);

    if (res.status === 401) {
        await supabase.auth.signOut().catch(() => { });
        throw new Error("인증이 필요합니다. 다시 로그인해 주세요.");
    }
    if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `API 요청 실패: ${res.status}`);
    }
    return res.json();
}

/** POST */
export async function authPost<T = any>(path: string, body: object): Promise<T> {
    const headers = await buildHeaders(true);
    return request<T>(path, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        credentials: "include",
    });
}

/** PUT */
export async function authPut<T = any>(path: string, body: object): Promise<T> {
    const headers = await buildHeaders(true);
    return request<T>(path, {
        method: "PUT",
        headers,
        body: JSON.stringify(body),
        credentials: "include",
    });
}

/** GET */
export async function authGet<T = any>(path: string): Promise<T> {
    const headers = await buildHeaders(false);
    return request<T>(path, {
        method: "GET",
        headers,
        credentials: "include",
    });
}

/** PATCH */
export async function authPatch<T = any>(path: string, body: object): Promise<T> {
    const headers = await buildHeaders(true);
    return request<T>(path, {
        method: "PATCH",
        headers,
        body: JSON.stringify(body),
        credentials: "include",
    });
}
