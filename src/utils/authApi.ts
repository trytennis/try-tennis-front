// utils/authApi.ts
import { supabase } from "./supabaseClient";

const API_URL = import.meta.env.VITE_API_URL;

async function getFreshSession() {
    const { data: { session } } = await supabase.auth.getSession();
    const now = Math.floor(Date.now() / 1000);
    const exp = session?.expires_at;

    // 만료까지 60초 이상 남았으면 그대로 사용
    if (session?.access_token && exp && exp - now > 60) return session;

    // 임박/만료 시에만 갱신
    const { data, error } = await supabase.auth.refreshSession();
    if (!error && data.session) return data.session;

    return session || null;
}

async function buildHeaders(contentTypeJson = false): Promise<Record<string, string>> {
    const headers: Record<string, string> = {};
    if (contentTypeJson) headers["Content-Type"] = "application/json";
    const fresh = await getFreshSession();
    if (fresh?.access_token) headers["Authorization"] = `Bearer ${fresh.access_token}`;
    return headers;
}

/**
 * 공통 request 핸들러
 * - 401 자동 로그아웃
 * - 204 처리
 * - JSON / TEXT 자동 감지
 */
async function request<T>(path: string, init: RequestInit): Promise<T> {
    const url = `${API_URL}${path}`;
    const res = await fetch(url, init);

    if (res.status === 401) {
        await supabase.auth.signOut().catch(() => { });
        throw new Error("인증이 필요합니다. 다시 로그인해 주세요.");
    }

    if (res.status === 204) {
        // No Content
        return null as T;
    }

    if (!res.ok) {
        const errorText = await res.text().catch(() => "");
        throw new Error(errorText || `API 요청 실패: ${res.status}`);
    }

    const text = await res.text().catch(() => "");
    if (!text || text.trim() === "") {
        return null as T;
    }

    try {
        return JSON.parse(text);
    } catch {
        // JSON 파싱 실패 시 그냥 문자열 그대로 반환 (DELETE 응답 등)
        return text as unknown as T;
    }
}

export async function authPost<T = any>(path: string, body: object): Promise<T> {
    const headers = await buildHeaders(true);
    return request<T>(path, { method: "POST", headers, body: JSON.stringify(body), credentials: "include" });
}

export async function authPut<T = any>(path: string, body: object): Promise<T> {
    const headers = await buildHeaders(true);
    return request<T>(path, { method: "PUT", headers, body: JSON.stringify(body), credentials: "include" });
}

export async function authPatch<T = any>(path: string, body: object): Promise<T> {
    const headers = await buildHeaders(true);
    return request<T>(path, { method: "PATCH", headers, body: JSON.stringify(body), credentials: "include" });
}

export async function authGet<T = any>(path: string): Promise<T> {
    const headers = await buildHeaders(false);
    return request<T>(path, { method: "GET", headers, credentials: "include" });
}

export async function authDelete<T = any>(path: string): Promise<T> {
    const headers = await buildHeaders(false);
    return request<T>(path, { method: "DELETE", headers, credentials: "include" });
}
