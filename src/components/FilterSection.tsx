import React from 'react';
import type { FilterSectionProps } from '../types/Schedule';

export const FilterSection: React.FC<FilterSectionProps> = ({
    filters,
    onFilterChange,
    onRefresh,
    loading,
}) => {
    return (
        <div className="calendar-filter-section">
            <div className="calendar-filter-header">
                <h2>필터</h2>
                <button
                    className="calendar-refresh-button"
                    onClick={onRefresh}
                    disabled={loading}
                    title="새로고침"
                >
                    새로고침
                </button>
            </div>

            <div className="calendar-filter-grid">
                <div className="calendar-filter-item">
                    <label htmlFor="status-filter">상태</label>
                    <select
                        id="status-filter"
                        value={filters.status}
                        onChange={(e) => onFilterChange({
                            status: e.target.value as any
                        })}
                    >
                        <option value="all">전체</option>
                        <option value="confirmed">확정</option>
                        <option value="completed">완료</option>
                        <option value="cancelled">취소</option>
                    </select>
                </div>

                <div className="calendar-filter-item">
                    <label className="calendar-checkbox-label">
                        <input
                            type="checkbox"
                            checked={filters.includeCancelled}
                            onChange={(e) => onFilterChange({
                                includeCancelled: e.target.checked
                            })}
                        />
                        <span className="calendar-checkbox-text">취소된 일정 포함</span>
                    </label>
                </div>
            </div>
        </div>
    );
};