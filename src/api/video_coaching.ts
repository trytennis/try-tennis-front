// src/api/video_coaching.ts
import type { AIVideoComment } from "../types/AIComment";
import type { CoachLite } from "../types/Coach";
import type { CoachingComment } from "../types/CoachingComment";
import type { CoachingRequest, CoachingRequestStatus } from "../types/CoachingRequest";
import { authGet, authPost, authPatch } from "../utils/authApi";

/** 요청 단건 상세 (목록과 동일 구조 사용) */
export type CoachingRequestDetail = CoachingRequest;

/** 요청 생성 페이로드 */
export type CreateCoachingRequestPayload = {
    coach_id: string;
    analyzed_video_id: string;
    title?: string;
    message?: string;
};

/** 상태 변경 페이로드 */
export type UpdateCoachingStatusPayload = {
    status: Exclude<CoachingRequestStatus, "pending">; // 변경은 pending 제외
    reason?: string;
};

export class CoachingApi {
    /** 코칭 요청 생성 (요청자=로그인 사용자) */
    static async create(payload: CreateCoachingRequestPayload): Promise<CoachingRequestDetail> {
        return authPost<CoachingRequestDetail>(`/api/coaching/requests`, payload);
    }

    /** 코칭 요청 목록
     * role: 'student' | 'coach' | undefined (UI 필터용, 권한은 서버에서 최종 검증)
     * status: 서버 필터링 (optional)
     */
    static async list(params?: {
        role?: "student" | "coach";
        status?: CoachingRequestStatus;
        limit?: number;
        offset?: number;
    }): Promise<CoachingRequest[]> {
        const { role, status, limit = 50, offset = 0 } = params ?? {};
        const qs = new URLSearchParams();
        if (role) qs.set("role", role);
        if (status) qs.set("status", status);
        qs.set("limit", String(limit));
        qs.set("offset", String(offset));
        const q = qs.toString() ? `?${qs.toString()}` : "";
        return authGet<CoachingRequest[]>(`/api/coaching/requests${q}`);
    }

    /** 코칭 요청 단건 조회 */
    static async getById(requestId: string): Promise<CoachingRequestDetail> {
        return authGet<CoachingRequestDetail>(`/api/coaching/requests/${requestId}`);
    }

    /** 상태 변경
     * - 요청자: 'cancelled'
     * - 코치/슈퍼관리자: 'accepted' | 'in_review' | 'completed' | 'rejected'
     */
    static async updateStatus(
        requestId: string,
        payload: UpdateCoachingStatusPayload
    ): Promise<CoachingRequestDetail> {
        return authPatch<CoachingRequestDetail>(`/api/coaching/requests/${requestId}/status`, payload);
    }

    /** 코멘트 추가(모두 공개) */
    static async addComment(
        requestId: string,
        body: string
    ): Promise<CoachingComment> {
        return authPost<CoachingComment>(`/api/coaching/requests/${requestId}/comments`, { body });
    }

    /** 코멘트 목록 */
    static async listComments(requestId: string): Promise<CoachingComment[]> {
        return authGet<CoachingComment[]>(`/api/coaching/requests/${requestId}/comments`);
    }
}


/**
 * 내 시설의 코치 목록
 * 서버가 JWT→profile→facility를 해석하므로 클라에서 facilityId 전달 불필요
 * 쿼리: q(검색), is_active, limit, offset
 */
export async function fetchMyFacilityCoaches(params?: {
    q?: string;
    is_active?: boolean;
    limit?: number;
    offset?: number;
}): Promise<CoachLite[]> {
    const qs = new URLSearchParams();
    if (params?.q) qs.set("q", params.q);
    if (params?.is_active !== undefined) qs.set("is_active", String(params.is_active));
    qs.set("limit", String(params?.limit ?? 100));
    qs.set("offset", String(params?.offset ?? 0));
    const query = qs.toString() ? `?${qs.toString()}` : "";
    return authGet<CoachLite[]>(`/api/my-facility/staff${query}`);
}

// =====================
// AI Coaching 
// =====================

export class AiCoachingApi {
    /** 
     * AI 코멘트 조회
     * @returns AIVideoComment | null (없으면 null)
     */
    static async get(videoId: string): Promise<AIVideoComment | null> {
        try {
            const res = await authGet<AIVideoComment>(
                `/api/coaching/${videoId}/ai/comment`
            );
            return res;
        } catch (e: any) {
            // 204 No Content = 아직 AI 코멘트 없음
            if (e?.status === 204 || e?.response?.status === 204) {
                return null;
            }
            throw e;
        }
    }

    /** 
     * AI 코멘트 생성 또는 교체
     * @param videoId - 분석 영상 ID
     * @param opts.model - OpenAI 모델명 (기본: gpt-4o-mini)
     * @param opts.replace - true면 기존 교체, false면 신규 생성
     * @returns 생성/수정된 AI 코멘트
     */
    static async createOrReplace(
        videoId: string,
        opts?: { model?: string; replace?: boolean }
    ): Promise<AIVideoComment> {
        const payload: Record<string, any> = {};
        if (opts?.model) payload.model = opts.model;
        if (opts?.replace !== undefined) payload.replace = opts.replace;

        return authPost<AIVideoComment>(
            `/api/coaching/${videoId}/ai/comment`,
            payload
        );
    }

    /**
     * AI 코멘트 새로고침 (기존 있으면 교체, 없으면 생성)
     * @param videoId - 분석 영상 ID
     * @param model - OpenAI 모델명
     */
    static async refresh(
        videoId: string,
        model: string = 'gpt-4o-mini'
    ): Promise<AIVideoComment> {
        try {
            // 먼저 기존 코멘트 확인
            const existing = await this.get(videoId);

            // 있으면 교체, 없으면 생성
            return await this.createOrReplace(videoId, {
                model,
                replace: existing !== null
            });
        } catch (e: any) {
            // 409 Conflict (이미 존재) → replace로 재시도
            if (e?.status === 409 || e?.response?.status === 409) {
                return await this.createOrReplace(videoId, {
                    model,
                    replace: true
                });
            }
            throw e;
        }
    }
}