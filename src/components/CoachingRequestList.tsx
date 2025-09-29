import React from "react";
import { formatDateTime } from "../utils/format";
import type { CoachingRequest, CoachingRequestStatus } from "../types/CoachingRequest";

const statusText: Record<CoachingRequestStatus, string> = {
    pending: "대기중",
    accepted: "수락됨",
    in_review: "검토중",
    completed: "완료",
    rejected: "거부됨",
    cancelled: "취소됨",
};

type Props = {
    requests: CoachingRequest[];
    onSelect: (request: CoachingRequest) => void;
};

const CoachingRequestList: React.FC<Props> = ({ requests, onSelect }) => {
    if (requests.length === 0) {
        return (
            <div className="empty-card">
                <div className="emoji">💬</div>
                <p className="dim">아직 코칭 요청이 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="req-list">
            {requests.map((r) => (
                <button key={r.id} className="req-card" onClick={() => onSelect(r)}>
                    <div className="req-card-top">
                        <h4>{r.title || "제목 없음"}</h4>
                        <span className={`vc-badge s-${r.status}`}>{statusText[r.status]}</span>
                    </div>
                    <div className="req-card-sub">
                        <span>코치: {r.coach?.name ?? "-"}</span>
                        <span>{formatDateTime(r.created_at)}</span>
                    </div>
                    {r.message && <p className="req-card-msg">{r.message}</p>}
                </button>
            ))}
        </div>
    );
};

export default CoachingRequestList;
