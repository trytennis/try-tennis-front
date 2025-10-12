// AICoachingSection.tsx
import React, { useState, useEffect, useCallback } from "react";
import { Sparkles } from "lucide-react";
import { AiCoachingApi } from "../api/video_coaching";
import "../styles/AICoachingSection.css";
import type { AIVideoComment } from "../types/AIComment";

interface AICoachingSectionProps {
    videoId: string;
}

const AICoachingSection: React.FC<AICoachingSectionProps> = ({ videoId }) => {
    const [comment, setComment] = useState<AIVideoComment | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // 초기 로딩: 코멘트 존재 여부만 확인
    const load = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await AiCoachingApi.get(videoId);
            setComment(res); // null이면 null로 설정
        } catch (e: any) {
            // 204는 정상 케이스이므로 에러로 처리하지 않음
            console.error("AI 코멘트 조회 실패:", e);
            setError(e?.message ?? "AI 코멘트를 불러오지 못했어요.");
        } finally {
            setIsLoading(false);
        }
    }, [videoId]);

    useEffect(() => {
        void load();
    }, [load]);

    // 사용자가 버튼 클릭 시에만 생성 요청
    const handleGenerate = async () => {
        setIsGenerating(true);
        setError(null);
        try {
            const created = await AiCoachingApi.createOrReplace(videoId);
            setComment(created);
        } catch (e: any) {
            setError(e?.message ?? "AI 코멘트 생성에 실패했어요.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <section className="aicoach">
            <div className="aicoach__header">
                <h4 className="aicoach__title">
                    <Sparkles size={18} className="aicoach__icon" />
                    AI 코칭
                </h4>
            </div>

            {/* 초기 로딩 */}
            {isLoading && (
                <div className="aicoach__loading">
                    <div className="aicoach__spinner" />
                    <p className="aicoach__loading-text">AI 코멘트를 불러오는 중...</p>
                </div>
            )}

            {/* 생성 중 */}
            {isGenerating && (
                <div className="aicoach__loading">
                    <div className="aicoach__spinner" />
                    <p className="aicoach__loading-text">AI가 분석 중입니다...</p>
                </div>
            )}

            {/* 에러 상태 (조회 중 에러 발생) */}
            {error && !isLoading && !isGenerating && !comment && (
                <div className="aicoach__error">
                    <p className="aicoach__error-text">⚠️ {error}</p>
                    <button className="aicoach__btn" onClick={load}>
                        다시 불러오기
                    </button>
                </div>
            )}

            {/* 생성 중 에러 */}
            {error && !isLoading && !isGenerating && comment && (
                <div className="aicoach__error">
                    <p className="aicoach__error-text">⚠️ {error}</p>
                </div>
            )}

            {/* 코멘트 없음 - 생성 버튼 표시 */}
            {!comment && !isLoading && !isGenerating && !error && (
                <div className="aicoach__empty">
                    <p className="aicoach__empty-text">아직 생성된 AI 코멘트가 없어요.</p>
                    <button className="aicoach__generate-btn" onClick={handleGenerate}>
                        <Sparkles size={16} style={{ marginRight: 6 }} />
                        AI 코멘트 요청하기
                    </button>
                </div>
            )}

            {/* 코멘트 표시 */}
            {comment && !isLoading && !isGenerating && (
                <div className="aicoach__feedback">
                    <div className="aicoach__item">
                        <p className="aicoach__text">{comment.structured.line1}</p>
                    </div>

                    <div className="aicoach__item">
                        <p className="aicoach__text">{comment.structured.line2}</p>
                    </div>

                    <div className="aicoach__disclaimer">
                        💡 AI 분석은 참고용이며, 전문 코치의 조언을 대체하지 않습니다.
                    </div>
                </div>
            )}
        </section>
    );
};

export default AICoachingSection;