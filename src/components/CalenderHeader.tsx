import React from 'react';
import type { CalendarHeaderProps } from '../types/Schedule';

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
    currentDate,
    onMonthChange,
    onToday,
}) => {
    const formatMonth = (date: Date) => {
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
        });
    };

    return (
        <div className="calendar-nav-header">
            <div className="calendar-navigation">
                <button
                    className="calendar-nav-button"
                    onClick={() => onMonthChange('prev')}
                    aria-label="이전 달"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                <h2 className="calendar-month-title">{formatMonth(currentDate)}</h2>

                <button
                    className="calendar-nav-button"
                    onClick={() => onMonthChange('next')}
                    aria-label="다음 달"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>

            <button className="calendar-today-button" onClick={onToday}>
                오늘
            </button>
        </div>
    );
};