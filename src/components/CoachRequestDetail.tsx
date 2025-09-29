// src/components/coaching/CoachingRequestDetail.tsx
import React, { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { formatDateTime } from "../utils/format";
import type { AnalysisHistory, AnalysisData } from "../types/AnalysisData";
import type { CoachingRequest, CoachingRequestStatus } from "../types/CoachingRequest";
import type { CoachingComment } from "../types/CoachingConmment";

const statusText: Record<CoachingRequestStatus, string> = {
    pending: "대기중",
    accepted: "수락됨",
    in_review: "검토중",
    completed: "완료",
    rejected: "거부됨",
    cancelled: "취소됨",
};

type Props = {
    request: CoachingRequest;
    video: AnalysisHistory | null;
    comments: CoachingComment[];
    onBack: () => void;
    onAddComment: (text: string) => void;
    onUpdateStatus: (status: Exclude<CoachingRequestStatus, "pending">) => void;
    myRole: string | null; // 'student' | 'coach' | 'facility_admin' | 'super_admin' | 'admin' | 'unknown' | null
};

const CoachingRequestDetail: React.FC<Props> = ({
    request, video, comments, onBack, onAddComment, onUpdateStatus, myRole
}) => {
    const [text, setText] = useState("");

    if (!video) {
        return (
            <div className="vc-empty">
                영상 정보를 찾을 수 없습니다.
                <button className="vc-btn ghost" onClick={onBack}>목록으로</button>
            </div>
        );
    }

    const data: AnalysisData = {
        average_angle: video.average_angle ?? 0,
        average_speed: video.average_speed ?? 0,
        max_speed: video.max_speed ?? 0,
        frame_count: video.frame_count ?? 0,
        chart_url: video.chart_url ?? "",
        gif_url: video.gif_url ?? "",
        video_url: video.video_url,
    };

    const isStudent = myRole === "student";
    const isCoachOrAbove = myRole === "coach" || myRole === "facility_admin" || myRole === "super_admin" || myRole === "admin";

    return (
        <div className="vc-detail">
            <div className="vc-detail-head">
                <button className="vc-icon-btn" onClick={onBack}><ChevronLeft size={18} /></button>
                <div className="vc-detail-title">
                    <h2>{request.title || "코칭 요청"}</h2>
                    <div className="vc-sub">
                        <span>코치: {request.coach?.name ?? "-"}</span>
                        <span className={`vc-badge s-${request.status}`}>{statusText[request.status]}</span>
                        <span>{formatDateTime(request.created_at)}</span>
                    </div>
                </div>
            </div>

            {request.message && (
                <div className="vc-card">
                    <h4>요청 메시지</h4>
                    <p className="vc-pre">{request.message}</p>
                </div>
            )}

            <div className="vc-card">
                <div className="vc-row between">
                    <h4>코멘트</h4>

                    {/* 역할별 상태 버튼 렌더링 */}
                    <div className="vc-btn-group">
                        {isCoachOrAbove && (
                            <>
                                <button className="vc-btn ghost" onClick={() => onUpdateStatus("accepted")}>수락</button>
                                <button className="vc-btn ghost" onClick={() => onUpdateStatus("in_review")}>리뷰중</button>
                                <button className="vc-btn ghost" onClick={() => onUpdateStatus("completed")}>완료</button>
                                <button className="vc-btn ghost" onClick={() => onUpdateStatus("rejected")}>거절</button>
                            </>
                        )}
                        {isStudent && (
                            <button className="vc-btn danger" onClick={() => onUpdateStatus("cancelled")}>요청자 취소</button>
                        )}
                    </div>
                </div>

                <div className="vc-comments">
                    {comments.length === 0 ? (
                        <div className="vc-dim">아직 코멘트가 없습니다.</div>
                    ) : (
                        comments.map((c) => (
                            <div key={c.id} className="vc-comment">
                                <div className="vc-comment-head">
                                    <span className="author">{c.author?.name ?? "작성자"}</span>
                                    <span className="time">{formatDateTime(c.created_at)}</span>
                                </div>
                                <div className="vc-pre">{c.body}</div>
                            </div>
                        ))
                    )}
                </div>

                <div className="vc-comment-form">
                    <textarea
                        className="vc-textarea"
                        rows={3}
                        placeholder="코멘트를 입력하세요... (Ctrl/⌘+Enter 제출)"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => {
                            if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && text.trim()) {
                                onAddComment(text.trim());
                                setText("");
                            }
                        }}
                    />
                    <button className="vc-btn primary" disabled={!text.trim()} onClick={() => { onAddComment(text.trim()); setText(""); }}>
                        전송
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CoachingRequestDetail;
