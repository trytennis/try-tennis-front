// utils/api.ts
import { supabase } from "./supabaseClient";

const API_URL = import.meta.env.VITE_API_URL;

async function buildHeaders(contentTypeJson = false): Promise<Record<string, string>> {
    const headers: Record<string, string> = {};
    if (contentTypeJson) headers["Content-Type"] = "application/json";

    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
    }
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
