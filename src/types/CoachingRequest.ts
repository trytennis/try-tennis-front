export type CoachingRequest = {
    id: string;
    requester_id: string;
    coach_id: string;
    analyzed_video_id: string;
    title: string | null;
    message: string | null;
    status: CoachingRequestStatus;
    created_at: string;
    updated_at: string;
    last_comment_at: string | null;
    // 조인 필드(서버 select 별칭)
    requester?: { id: string; name: string | null };
    coach?: { id: string; name: string | null };
    video?: { id: string; video_url: string | null; created_at: string };
};


/** 요청 상태 타입 (백엔드 CHECK와 일치) */
export type CoachingRequestStatus =
    | "pending"
    | "accepted"
    | "in_review"
    | "completed"
    | "rejected"
    | "cancelled";