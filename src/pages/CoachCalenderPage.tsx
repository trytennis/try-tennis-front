import React, { useState, useEffect } from 'react';
import '../styles/CoachCalenderPage.css';
import type { FilterOptions, ScheduleEvent } from '../types/Schedule';
import { EventDetailModal } from '../components/EventDetailModal';
import { FilterSection } from '../components/FilterSection';
import { StatsSection } from '../components/StatsSection';
import { CalendarHeader } from '../components/CalenderHeader';
import { CalendarGrid } from '../components/CalenderGrid';

const CoachCalendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<ScheduleEvent[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<ScheduleEvent[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState<FilterOptions>({
        status: 'all',
        includeCancelled: false,
    });

    const coachId = "00000000-0000-0000-0000-000000000002"; // TODO: 로그인 연동 시 교체

    // 현재 월의 시작일과 종료일 계산
    const getMonthRange = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);

        return {
            start: startDate.toISOString().split('T')[0],
            end: endDate.toISOString().split('T')[0],
        };
    };

    // API에서 일정 데이터 가져오기
    const fetchSchedule = async () => {
        setLoading(true);
        try {
            const { start, end } = getMonthRange(currentDate);
            const params = new URLSearchParams({
                coach_id: coachId,
                start_date: start,
                end_date: end,
                include_cancelled: filters.includeCancelled.toString(),
            });

            const response = await fetch(`/api/schedule/coach?${params}`);
            if (!response.ok) throw new Error('Failed to fetch schedule');

            const data = await response.json();
            setEvents(data);
        } catch (error) {
            console.error('Error fetching schedule:', error);
        } finally {
            setLoading(false);
        }
    };

    // 필터 적용
    const applyFilters = () => {
        let filtered = events;

        if (filters.status !== 'all') {
            filtered = filtered.filter(event => event.status === filters.status);
        }

        setFilteredEvents(filtered);
    };

    // 이벤트 클릭 핸들러
    const handleEventClick = (event: ScheduleEvent) => {
        setSelectedEvent(event);
        setIsModalOpen(true);
    };

    // 월 변경 핸들러
    const handleMonthChange = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate);
        if (direction === 'prev') {
            newDate.setMonth(newDate.getMonth() - 1);
        } else {
            newDate.setMonth(newDate.getMonth() + 1);
        }
        setCurrentDate(newDate);
    };

    // 오늘로 이동
    const goToToday = () => {
        setCurrentDate(new Date());
    };

    // 필터 변경 핸들러
    const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    // 통계 계산
    const getStats = () => {
        const total = filteredEvents.length;
        const confirmed = filteredEvents.filter(e => e.status === 'confirmed').length;
        const completed = filteredEvents.filter(e => e.status === 'completed').length;
        const cancelled = filteredEvents.filter(e => e.status === 'cancelled').length;

        return { total, confirmed, completed, cancelled };
    };

    // 초기 로드 및 월 변경시 데이터 재조회
    useEffect(() => {
        fetchSchedule();
    }, [currentDate, filters.includeCancelled]);

    // 필터 변경시 적용
    useEffect(() => {
        applyFilters();
    }, [events, filters]);


    return (
        <div className="coach-calendar-container">
            <div className="coach-calendar-header">
                <h1>일정 관리</h1>
            </div>

            <FilterSection
                filters={filters}
                onFilterChange={handleFilterChange}
                onRefresh={fetchSchedule}
                loading={loading}
            />

            <StatsSection stats={getStats()} />

            <div className="calendar-main-section">
                <CalendarHeader
                    currentDate={currentDate}
                    onMonthChange={handleMonthChange}
                    onToday={goToToday}
                />

                <CalendarGrid
                    currentDate={currentDate}
                    events={filteredEvents}
                    onEventClick={handleEventClick}
                    loading={loading}
                />
            </div>

            {isModalOpen && selectedEvent && (
                <EventDetailModal
                    event={selectedEvent}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedEvent(null);
                    }}
                    onStatusChange={(eventId, newStatus) => {
                        // 상태 변경 로직 구현 필요
                        console.log('Status change:', eventId, newStatus);
                        fetchSchedule(); // 변경 후 데이터 재조회
                    }}
                />
            )}
        </div>
    );
};

export default CoachCalendar;