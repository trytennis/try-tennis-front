import React, { useState } from "react";
import { ChevronLeft, Clock, Eye, User } from "lucide-react";
import type { CoachingRequest, CoachingRequestStatus } from "../../types/CoachingRequest";
import type { CoachingComment } from "../../types/CoachingComment";
import { formatDateTime } from "../../utils/format";

type Props = {
    request: CoachingRequest;
    comments: CoachingComment[];
    onBack: () => void;
    onAddComment: (text: string) => void;
    onUpdateStatus: (status: Exclude<CoachingRequestStatus, "pending">) => void;
    myRole: string | null;
};

const statusText: Record<CoachingRequestStatus, string> = {
    pending: "대기중",
    completed: "완료",
    cancelled: "취소됨",
};

const CoachRequestDetail: React.FC<Props> = ({
    request,
    comments,
    onBack,
    onAddComment,
    onUpdateStatus,
    myRole,
}) => {
    const [text, setText] = useState("");
    const isCoachOrAbove =
        myRole === "coach" || myRole === "facility_admin" || myRole === "super_admin" || myRole === "admin";

    const v = request.video;

    return (
        <div className="coachcp-detail">
            <div className="coachcp-detail-head">
                <button className="coachcp-icon-btn" onClick={onBack}>
                    <ChevronLeft size={18} />
                </button>
                <div className="coachcp-detail-title">
                    <h2>{request.title || "코칭 요청"}</h2>
                    <div className="coachcp-sub">
                        <span className="coachcp-sub-item">
                            <User size={14} />
                            {request.requester?.name ?? "-"}
                        </span>
                        <span className={`coachcp-badge s-${request.status}`}>
                            {statusText[request.status] ?? request.status}
                        </span>
                        <span className="coachcp-sub-item">
                            <Clock size={14} />
                            {formatDateTime(request.created_at)}
                        </span>
                    </div>
                </div>
            </div>

            {request.message && (
                <div className="coachcp-section-card">
                    <h4>요청 메시지</h4>
                    <p className="coachcp-pre">{request.message}</p>
                </div>
            )}

            {/* 영상 분석 */}
            <div className="coachcp-section-card">
                <h4>영상 분석 결과</h4>
                {v ? (
                    <>
                        <div className="coachcp-media-grid">
                            {v.gif_url && (
                                <div className="coachcp-media-box">
                                    <img src={v.gif_url} alt="분석 GIF" />
                                    <div className="coachcp-cap">분석 영상</div>
                                </div>
                            )}
                            {v.chart_url && (
                                <div className="coachcp-media-box">
                                    <img src={v.chart_url} alt="차트" />
                                    <div className="coachcp-cap">분석 차트</div>
                                </div>
                            )}
                        </div>

                        <div className="coachcp-stat-grid">
                            <div className="coachcp-stat blue">
                                <div className="coachcp-stat-label">평균 각도</div>
                                <div className="coachcp-stat-value">{v.average_angle ?? 0}°</div>
                            </div>
                            <div className="coachcp-stat green">
                                <div className="coachcp-stat-label">평균 속도</div>
                                <div className="coachcp-stat-value">{v.average_speed ?? 0} km/h</div>
                            </div>
                            <div className="coachcp-stat purple">
                                <div className="coachcp-stat-label">최고 속도</div>
                                <div className="coachcp-stat-value">{v.max_speed ?? 0} km/h</div>
                            </div>
                            <div className="coachcp-stat amber">
                                <div className="coachcp-stat-label">프레임 수</div>
                                <div className="coachcp-stat-value">{v.frame_count ?? 0}</div>
                            </div>
                        </div>

                        {v.video_url && (
                            <a className="coachcp-btn primary wide" href={v.video_url} target="_blank" rel="noreferrer">
                                <Eye size={16} />
                                원본 영상 보기
                            </a>
                        )}
                    </>
                ) : (
                    <div className="coachcp-dim">분석 데이터가 없습니다.</div>
                )}
            </div>

            {/* 코멘트 */}
            <div className="coachcp-section-card">
                <h4>코멘트</h4>

                <div className="coachcp-comments">
                    {comments.length === 0 ? (
                        <div className="coachcp-dim">아직 코멘트가 없습니다.</div>
                    ) : (
                        comments.map((c) => (
                            <div key={c.id} className="coachcp-comment">
                                <div className="coachcp-comment-head">
                                    <span className="coachcp-author">{c.author?.name ?? "작성자"}</span>
                                    <span className="coachcp-time">{formatDateTime(c.created_at)}</span>
                                </div>
                                <div className="coachcp-pre">{c.body}</div>
                            </div>
                        ))
                    )}
                </div>

                {isCoachOrAbove && (
                    <div className="coachcp-comment-form">
                        <textarea
                            className="coachcp-textarea"
                            rows={3}
                            placeholder="피드백을 입력하세요…"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={(e) => {
                                if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && text.trim()) {
                                    onAddComment(text.trim());
                                    setText("");
                                }
                            }}
                        />
                        <div className="coachcp-right">
                            <button
                                className="coachcp-btn primary"
                                disabled={!text.trim()}
                                onClick={() => {
                                    if (!text.trim()) return;
                                    onAddComment(text.trim());
                                    setText("");
                                }}
                            >
                                피드백 전송
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CoachRequestDetail;
