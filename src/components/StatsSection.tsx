import React from 'react';
import type { StatsSectionProps } from '../types/Schedule';

export const StatsSection: React.FC<StatsSectionProps> = ({ stats }) => {
    return (
        <div className="calendar-stats-section">
            <h2>월별 일정</h2>
            <div className="calendar-stats-grid">
                <div className="calendar-stat-item calendar-stat-total">
                    <span className="calendar-stat-label">전체</span>
                    <span className="calendar-stat-value">{stats.total}</span>
                </div>

                <div className="calendar-stat-item calendar-stat-confirmed">
                    <span className="calendar-stat-label">예약</span>
                    <span className="calendar-stat-value">{stats.confirmed}</span>
                </div>

                <div className="calendar-stat-item calendar-stat-completed">
                    <span className="calendar-stat-label">완료</span>
                    <span className="calendar-stat-value">{stats.completed}</span>
                </div>

                <div className="calendar-stat-item calendar-stat-cancelled">
                    <span className="calendar-stat-label">취소</span>
                    <span className="calendar-stat-value">{stats.cancelled}</span>
                </div>
            </div>
        </div>
    );
};