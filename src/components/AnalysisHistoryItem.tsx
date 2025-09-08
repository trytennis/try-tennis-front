import React from "react";
import { Play, BarChart3, Calendar } from "lucide-react";
import type { AnalysisHistory } from "../types/AnalysisData";
import { formatDateTime } from "../utils/format";
import "../styles/AnalysisHistoryItem.css";

interface Props {
    video: AnalysisHistory;
    isSelected: boolean;
    onClick: () => void;
}

const AnalysisHistoryItem: React.FC<Props> = ({ video, isSelected, onClick }) => {
    return (
        <div
            className={`vh-item ${isSelected ? "vh-item--active" : ""}`}
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    onClick();
                }
            }}
        >
            <div className="vh-thumb">
                {video.gif_url ? (
                    <img src={video.gif_url} alt="썸네일" />
                ) : (
                    <Play className="vh-thumb-icon" />
                )}
            </div>

            <div className="vh-main">
                <h4 className="vh-title">영상 #{video.id.slice(-6)}</h4>
                <div className="vh-meta">
                    <div className="vh-meta-chip">
                        <Calendar className="vh-meta-icon" />
                        <span>{formatDateTime(video.created_at)}</span>
                    </div>
                    <div className="vh-meta-chip">
                        <BarChart3 className="vh-meta-icon" />
                        <span>{video.average_speed ?? 0} km/h</span>
                    </div>
                </div>
            </div>

            <div className={`vh-status ${isSelected ? "vh-status--active" : ""}`} />
        </div>
    );
};

export default AnalysisHistoryItem;