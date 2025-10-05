// src/components/coaching/CoachingRequestDetail.tsx
import React, { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { formatDateTime } from "../utils/format";
import type { AnalysisHistory, AnalysisData } from "../types/AnalysisData";
import type { CoachingRequest, CoachingRequestStatus } from "../types/CoachingRequest";
import type { CoachingComment } from "../types/CoachingComment";

const statusText: Record<CoachingRequestStatus, string> = {
    pending: "대기중",
    completed: "완료",
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


    // 1) 코치 관점: server join된 request.video를 폴백으로 사용
    const joinedVideo = request.video; // AnalyzedVideoLite | undefined
    const mergedVideo = video ?? (joinedVideo
        ? {
            average_angle: joinedVideo.average_angle ?? 0,
            average_speed: joinedVideo.average_speed ?? 0,
            max_speed: joinedVideo.max_speed ?? 0,
            frame_count: joinedVideo.frame_count ?? 0,
            chart_url: joinedVideo.chart_url ?? "",
            gif_url: joinedVideo.gif_url ?? "",
            video_url: joinedVideo.video_url,
        }
        : null
    );

    if (!mergedVideo) {
        return (
            <div className="vc-empty">
                영상 정보를 찾을 수 없습니다.
                <button className="vc-btn ghost" onClick={onBack}>목록으로</button>
            </div>
        );
    }
    
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
            </div>
        </div>
    );
};

export default CoachingRequestDetail;
