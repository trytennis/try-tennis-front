// src/components/coaching/CoachingRequestList.tsx
import React from "react";
import { User, MessageSquare, Clock } from "lucide-react";
import { formatDateTime } from "../utils/format";
import type { CoachingRequest, CoachingRequestStatus } from "../types/CoachingRequest";

const statusText: Record<CoachingRequestStatus, string> = {
    pending: "대기중",
    completed: "완료",
    cancelled: "취소됨",
};

type Props = {
    requests: CoachingRequest[];
    onSelect: (request: CoachingRequest) => void;
    myRole?: string | null;
};

const CoachingRequestList: React.FC<Props> = ({ requests, onSelect, myRole }) => {
    if (requests.length === 0) {
        return (
            <div className="empty-card">
                <div className="emoji">💬</div>
                <p className="dim">아직 코칭 요청이 없습니다</p>
                <p>코칭이 필요할 때 요청해보세요</p>
            </div>
        );
    }

    return (
        <div className="req-list">
            {requests.map((r) => {
                const showName =
                    myRole === "coach" || myRole === "facility_admin" || myRole === "super_admin"
                        ? r.requester?.name // 코치에게는 요청자 이름
                        : r.coach?.name;     // 학생에게는 코치 이름
                return (
                    <button key={r.id} className="req-card" onClick={() => onSelect(r)}>
                        <div className="req-card-top">
                            <h4>{r.title || "제목 없음"}</h4>
                            <span className={`vc-badge s-${r.status}`}>{statusText[r.status]}</span>
                        </div>
                        {r.message && <p className="req-card-msg">{r.message}</p>}
                        <div className="req-card-sub">
                            <div><User size={12} />{showName ?? "-"}</div>
                            <span><Clock size={12} />{formatDateTime(r.created_at)}</span>
                        </div>
                    </button>
                );
            })}
        </div>
    );

};

export default CoachingRequestList;
