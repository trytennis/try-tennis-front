/** 코멘트 */
export type CoachingComment = {
    id: string;
    request_id: string;
    author: { id: string; name: string | null };
    body: string;
    created_at: string;
};