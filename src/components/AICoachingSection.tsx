// AICoachingSection.tsx
import React, { useState, useEffect, useCallback } from "react";
import { Sparkles, Copy, Check } from "lucide-react";
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
    const [copiedKey, setCopiedKey] = useState<"line1" | "line2" | null>(null);

    const load = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await AiCoachingApi.get(videoId);
            setComment(res);
        } catch (e: any) {
            setError(e?.message ?? "AI 코멘트를 불러오지 못했어요.");
        } finally {
            setIsLoading(false);
        }
    }, [videoId]);

    useEffect(() => {
        void load();
    }, [load]);

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

    const handleCopy = (text: string, key: "line1" | "line2") => {
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 1500);
    };

    return (
        <section className="aicoach">
            <div className="aicoach__header">
                <h3 className="aicoach__title">
                    <Sparkles size={18} className="aicoach__icon" />
                    AI 코칭
                </h3>
            </div>

            {isLoading && (
                <div className="aicoach__loading">
                    <div className="aicoach__spinner" />
                    <p className="aicoach__loading-text">AI 코멘트를 불러오는 중...</p>
                </div>
            )}

            {isGenerating && (
                <div className="aicoach__loading">
                    <div className="aicoach__spinner" />
                    <p className="aicoach__loading-text">AI가 분석 중입니다...</p>
                </div>
            )}

            {error && !isLoading && !isGenerating && (
                <div className="aicoach__error">
                    <p className="aicoach__error-text">⚠️ {error}</p>
                    <button className="aicoach__btn" onClick={handleGenerate}>
                        다시 시도
                    </button>
                </div>
            )}

            {!comment && !isLoading && !isGenerating && !error && (
                <div className="aicoach__empty">
                    <p className="aicoach__empty-text">아직 생성된 AI 코멘트가 없어요.</p>
                    <button className="aicoach__generate-btn" onClick={handleGenerate}>
                        <Sparkles size={16} style={{ marginRight: 6 }} />
                        AI 코멘트 요청하기
                    </button>
                </div>
            )}

            {comment && !isLoading && !isGenerating && (
                <div className="aicoach__feedback">
                    <div className="aicoach__item">
                        <div className="aicoach__item-header">
                            {/* <span className="aicoach__label">⚡ 속도</span> */}
                        </div>
                        <p className="aicoach__text">{comment.structured.line1}</p>
                    </div>

                    <div className="aicoach__item">
                        <div className="aicoach__item-header">
                            {/* <span className="aicoach__label">📐 각도</span> */}
                        </div>
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