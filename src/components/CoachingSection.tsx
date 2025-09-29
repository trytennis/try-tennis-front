import React, { useEffect, useMemo, useState } from "react";
import { MessageSquare } from "lucide-react";
import type { AnalysisHistory } from "../types/AnalysisData";
import CoachSelectionModal from "./CoachSelectionModal";
import CoachingRequestList from "./CoachingRequestList";
import type { CoachLite } from "../types/Coach";
import type { CoachingRequest, CoachingRequestStatus } from "../types/CoachingRequest";
import { CoachingApi, fetchMyFacilityCoaches, type CoachingComment } from "../api/video_coaching";
import CoachingRequestDetail from "./CoachRequestDetail";
import "../styles/CoachingSection.css";

type Props = {
    /** 현재 상세 패널의 분석 영상 ID */
    analyzedVideoId: string;
    /** 선택된 영상(미리보기/모달 표시용) — 없어도 동작하지만 있으면 UX 향상 */
    selectedVideo: AnalysisHistory | null;
    /** 기본 뷰: list | detail (선택) */
    defaultView?: "list" | "detail";
};

const CoachingSection: React.FC<Props> = ({ analyzedVideoId, selectedVideo, defaultView = "list" }) => {
    const [view, setView] = useState<"list" | "detail">(defaultView);
    const [coaches, setCoaches] = useState<CoachLite[]>([]);
    const [modalOpen, setModalOpen] = useState(false);

    const [requests, setRequests] = useState<CoachingRequest[]>([]);
    const [selectedReq, setSelectedReq] = useState<CoachingRequest | null>(null);
    const [comments, setComments] = useState<CoachingComment[]>([]);

    // 내 요청 목록(학생 시나리오 기본) — 서버가 권한 체크하므로 role은 힌트용
    const loadRequests = async () => {
        const rows = await CoachingApi.list({ role: "student", limit: 100, offset: 0 });
        // 서버가 video_id 필터 미지원 시 클라에서 후처리
        const filtered = rows.filter((r) => r.analyzed_video_id === analyzedVideoId);
        setRequests(filtered);
    };

    const loadComments = async (reqId: string) => {
        const rows = await CoachingApi.listComments(reqId);
        setComments(rows);
    };

    // 영상이 바뀌면 목록 갱신
    useEffect(() => {
        if (!analyzedVideoId) return;
        loadRequests().catch(console.error);
        setSelectedReq(null);
        setView("list");
        setComments([]);
    }, [analyzedVideoId]);

    // 코치 목록 불러오고 모달 오픈
    const openCreateModal = async () => {
        try {
            const list = await fetchMyFacilityCoaches({ is_active: true, limit: 200 });
            setCoaches(list);
            setModalOpen(true);
        } catch (e) {
            console.error(e);
            alert("코치 목록을 불러오지 못했습니다.");
        }
    };

    // 요청 생성
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

    // 현재 영상에 대한 내 요청 수
    const countForThisVideo = useMemo(
        () => requests.filter((r) => r.analyzed_video_id === analyzedVideoId).length,
        [requests, analyzedVideoId]
    );

    return (
        <section className="coaching-section">
            <header className="coaching-head">
                <h3>🧑‍🏫 코칭</h3>
                <div className="coaching-actions">
                    <button className="coaching-req-btn" onClick={openCreateModal}>
                        <MessageSquare size={16} /> 코칭 요청
                    </button>
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
