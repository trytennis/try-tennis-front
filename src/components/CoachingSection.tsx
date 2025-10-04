// src/components/coaching/CoachingSection.tsx
import React, { useEffect, useMemo, useState } from "react";
import { MessageSquare } from "lucide-react";
import type { AnalysisHistory } from "../types/AnalysisData";
import CoachSelectionModal from "./CoachSelectionModal";
import CoachingRequestList from "./CoachingRequestList";
import type { CoachLite } from "../types/Coach";
import type { CoachingRequest, CoachingRequestStatus } from "../types/CoachingRequest";
import { useMyRole } from "../utils/useMyRole";
import "../styles/CoachingSection.css";
import CoachingRequestDetail from "./CoachRequestDetail";
import type { CoachingComment } from "../types/CoachingConmment";
import { CoachingApi, fetchMyFacilityCoaches } from "../api/video_coaching";

type Props = {
    analyzedVideoId: string;
    selectedVideo: AnalysisHistory | null;
    defaultView?: "list" | "detail";
};

const CoachingSection: React.FC<Props> = ({ analyzedVideoId, selectedVideo, defaultView = "list" }) => {
    const { role, loading: roleLoading } = useMyRole();
    const [view, setView] = useState<"list" | "detail">(defaultView);

    const [coaches, setCoaches] = useState<CoachLite[]>([]);
    const [modalOpen, setModalOpen] = useState(false);

    const [requests, setRequests] = useState<CoachingRequest[]>([]);
    const [selectedReq, setSelectedReq] = useState<CoachingRequest | null>(null);
    const [comments, setComments] = useState<CoachingComment[]>([]);

    const isStudent = role === "student";
    const isCoachOrAbove = role === "coach" || role === "facility_admin" || role === "super_admin";

    // 역할별 목록 로드
    const loadRequests = async () => {
        const roleParam = isCoachOrAbove ? "coach" : "student";
        const rows = await CoachingApi.list({ role: roleParam, limit: 100, offset: 0 });
        const filtered = rows.filter((r) => r.analyzed_video_id === analyzedVideoId);
        setRequests(filtered);
    };

    const loadComments = async (reqId: string) => {
        const rows = await CoachingApi.listComments(reqId);
        setComments(rows);
    };

    // 영상/역할 바뀌면 목록 초기화
    useEffect(() => {
        if (!analyzedVideoId || roleLoading || !role) return;
        loadRequests().catch(console.error);
        setSelectedReq(null);
        setView("list");
        setComments([]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [analyzedVideoId, roleLoading, role]);

    // 코치 선택 모달 (학생만 사용)
    const openCreateModal = async () => {
        if (!isStudent) return;
        try {
            const list = await fetchMyFacilityCoaches({ is_active: true, limit: 200 });
            setCoaches(list);
            setModalOpen(true);
        } catch (e) {
            console.error(e);
            alert("코치 목록을 불러오지 못했습니다.");
        }
    };

    // 요청 생성 (학생)
    const handleCreate = async (coachId: string, title: string, message: string) => {
        try {
            const res = await CoachingApi.create({
                coach_id: coachId,
                analyzed_video_id: analyzedVideoId,
                title: title || undefined,
                message: message || undefined,
            });
            setModalOpen(false);
            await loadRequests();
            setSelectedReq(res);
            await loadComments(res.id);
            setView("detail");
        } catch (e: any) {
            console.error(e);
            alert(e?.message || "코칭 요청 실패");
        }
    };

    const handleSelectRequest = async (req: CoachingRequest) => {
        setSelectedReq(req);
        setView("detail");
        await loadComments(req.id);
    };

    const handleBackToList = () => {
        setSelectedReq(null);
        setView("list");
    };

    const handleAddComment = async (text: string) => {
        if (!selectedReq) return;
        try {
            const c = await CoachingApi.addComment(selectedReq.id, text);
            setComments((prev) => [...prev, c]);
        } catch {
            alert("코멘트 추가 실패");
        }
    };

    const handleUpdateStatus = async (status: Exclude<CoachingRequestStatus, "pending">) => {
        if (!selectedReq) return;
        try {
            const updated = await CoachingApi.updateStatus(selectedReq.id, { status });
            setSelectedReq(updated);
            setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
        } catch {
            alert("상태 변경 실패(권한/규칙 확인)");
        }
    };

    const countForThisVideo = useMemo(
        () => requests.filter((r) => r.analyzed_video_id === analyzedVideoId).length,
        [requests, analyzedVideoId]
    );

    if (roleLoading) {
        return (
            <section className="coaching-section">
                <div className="coaching-head">
                    <h3>🧑‍🏫 코칭</h3>
                    <div className="coaching-actions">
                        <div className="skeleton" style={{ width: '96px', height: '32px' }} />
                    </div>
                </div>
                <div className="skeleton" style={{ width: '100%', height: '112px' }} />
                <div className="skeleton" style={{ width: '100%', height: '112px', marginTop: '8px' }} />
            </section>
        );
    }

    return (
        <section className="coaching-section">
            <header className="coaching-head">
                <h3>🧑‍🏫 코칭</h3>
                <div className="coaching-actions">
                    {isStudent && (
                        <button className="coaching-req-btn" onClick={openCreateModal}>
                            <MessageSquare size={16} /> 코칭 요청
                        </button>
                    )}
                    <span className="coaching-count">요청 {countForThisVideo}개</span>
                </div>
            </header>

            {view === "list" ? (
                <CoachingRequestList requests={requests} onSelect={handleSelectRequest} />
            ) : (
                selectedReq && (
                    <CoachingRequestDetail
                        request={selectedReq}
                        video={selectedVideo}
                        comments={comments}
                        onBack={handleBackToList}
                        onAddComment={handleAddComment}
                        onUpdateStatus={handleUpdateStatus}
                        myRole={role}
                    />
                )
            )}

            <CoachSelectionModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                coaches={coaches}
                selectedVideo={selectedVideo ?? null}
                onSubmit={handleCreate}
            />
        </section>
    );
};

export default CoachingSection;