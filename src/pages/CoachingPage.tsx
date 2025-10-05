import React, { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { CoachingRequest, CoachingRequestStatus } from "../types/CoachingRequest";
import type { CoachingComment } from "../types/CoachingComment";
import { useMyRole } from "../utils/useMyRole";
import { CoachingApi } from "../api/video_coaching";

import "../styles/CoachingPage.css";

import CoachingRequestList from "../components/CoachingRequestList";
import CoachRequestDetail from "../components/coaching/CoachRequestDetail";

type ViewMode = "list" | "detail";
const PAGE_SIZE = 50;

const CoachingPage: React.FC = () => {
    const { role, loading: roleLoading } = useMyRole();
    const [view, setView] = useState<ViewMode>("list");

    const [requests, setRequests] = useState<CoachingRequest[]>([]);
    const [selectedReq, setSelectedReq] = useState<CoachingRequest | null>(null);
    const [comments, setComments] = useState<CoachingComment[]>([]);

    const [q, setQ] = useState("");
    const [pending, setPending] = useState(false);
    const [page, setPage] = useState(1);

    const isCoachOrAbove =
        role === "coach" || role === "facility_admin" || role === "super_admin";

    async function loadRequests() {
        setPending(true);
        try {
            const rows = await CoachingApi.list({
                role: "coach",
                limit: PAGE_SIZE,
                offset: (page - 1) * PAGE_SIZE,
            });
            setRequests(rows);

            // 첫 요청 자동 선택 (없으면 빈 상세)
            if (rows.length > 0 && !selectedReq) {
                setSelectedReq(rows[0]);
                loadComments(rows[0].id).catch(console.error);
                setView("detail");
            }
        } finally {
            setPending(false);
        }
    }

    async function loadComments(reqId: string) {
        const rows = await CoachingApi.listComments(reqId);
        setComments(rows);
    }

    useEffect(() => {
        if (roleLoading) return;
        if (!isCoachOrAbove) return;
        loadRequests().catch(console.error);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roleLoading, isCoachOrAbove, page]);

    // 검색 필터링(프론트)
    const filtered = useMemo(() => {
        const norm = (s: string) => (s || "").toLowerCase();
        const keyword = norm(q);
        if (!keyword) return requests;
        return requests.filter((r) => {
            const title = norm(r.title ?? "");
            const message = norm(r.message ?? "");
            const requester = norm(r.requester?.name ?? "");
            return (
                title.includes(keyword) ||
                message.includes(keyword) ||
                requester.includes(keyword)
            );
        });
    }, [requests, q]);

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

            // 서버에서 “댓글 달리면 완료” 자동화해두었다면, 낙관 갱신:
            setSelectedReq((prev) =>
                prev ? { ...prev, status: "completed", last_comment_at: c.created_at } : prev
            );
            setRequests((prev) =>
                prev.map((r) =>
                    r.id === selectedReq.id ? { ...r, status: "completed", last_comment_at: c.created_at } : r
                )
            );
        } catch {
            alert("코멘트 추가 실패");
        }
    };

    const handleUpdateStatus = async (newStatus: Exclude<CoachingRequestStatus, "pending">) => {
        if (!selectedReq) return;
        try {
            const updated = await CoachingApi.updateStatus(selectedReq.id, { status: newStatus });
            setSelectedReq(updated);
            setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));

            // 조인 디테일 미포함 환경 대비
            if (!updated.video) {
                const full = await CoachingApi.getById(updated.id);
                setSelectedReq(full);
                setRequests((prev) => prev.map((r) => (r.id === full.id ? full : r)));
            }
        } catch {
            alert("상태 변경 실패");
        }
    };

    if (roleLoading) {
        return (
            <section className="coachcp">
                <div className="coachcp-grid">
                    <aside className="coachcp-card coachcp-card--sidebar">
                        <div className="coachcp-skeleton" style={{ height: 360 }} />
                    </aside>
                    <main className="coachcp-card coachcp-card--main">
                        <div className="coachcp-skeleton" style={{ height: 520 }} />
                    </main>
                </div>
            </section>
        );
    }

    if (!isCoachOrAbove) {
        return (
            <section className="coachcp">
                <div className="coachcp-card">
                    <div className="coachcp-denied">
                        <div className="coachcp-emoji">⛔️</div>
                        <p>코치 이상 권한이 필요합니다.</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="coachcp">
            <div className="coachcp-grid">
                {/* 왼쪽: 요청 목록 (화이트 카드) */}
                <aside className="coachcp-card coachcp-card--sidebar">
                    <div className="coachcp-sidebar-head">
                        <div className="coachcp-search">
                            <Search size={16} className="coachcp-search__icon" />
                            <input
                                type="text"
                                className="coachcp-search__input"
                                placeholder="제목, 메시지, 이름 검색…"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                            />
                        </div>
                        <div className="coachcp-result-count">{filtered.length}개 요청</div>
                    </div>

                    <div className="coachcp-sidebar-body">
                        {pending && requests.length === 0 ? (
                            <div className="coachcp-skeleton" style={{ height: 160 }} />
                        ) : (
                            <CoachingRequestList
                                requests={filtered}
                                onSelect={handleSelectRequest}
                                myRole={role}
                            />
                        )}
                    </div>

                    <div className="coachcp-sidebar-foot">
                        <button
                            className="coachcp-pager-btn"
                            disabled={page <= 1 || pending}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                        >
                            이전
                        </button>
                        <span className="coachcp-page-num">{page}</span>
                        <button
                            className="coachcp-pager-btn"
                            disabled={requests.length < PAGE_SIZE || pending}
                            onClick={() => setPage((p) => p + 1)}
                        >
                            다음
                        </button>
                    </div>
                </aside>

                {/* 오른쪽: 상세 (화이트 카드) */}
                <main className="coachcp-card coachcp-card--main">
                    {selectedReq ? (
                        <CoachRequestDetail
                            request={selectedReq}
                            comments={comments}
                            onBack={handleBackToList}
                            onAddComment={handleAddComment}
                            onUpdateStatus={handleUpdateStatus}
                            myRole={role}
                        />
                    ) : (
                        <div className="coachcp-empty-detail">
                            <div className="coachcp-emoji">💬</div>
                            <p>왼쪽에서 요청을 선택하세요</p>
                        </div>
                    )}
                </main>
            </div>
        </section>
    );
};

export default CoachingPage;
