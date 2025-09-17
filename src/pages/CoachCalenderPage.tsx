// src/pages/CoachCalendarPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import '../styles/CoachCalenderPage.css';
import type { FilterOptions, ScheduleEvent } from '../types/Schedule';
import { EventDetailModal } from '../components/EventDetailModal';
import { FilterSection } from '../components/FilterSection';
import { StatsSection } from '../components/StatsSection';
import { CalendarHeader } from '../components/CalenderHeader';
import { CalendarGrid } from '../components/CalenderGrid';
import { fetchCoachSchedule, updateReservationStatus } from '../api/reservation';
import { formatLocalDate } from '../utils/format';

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

  // 월 범위 계산: 로컬 기준으로 1일 ~ 말일 반환
  const getMonthRange = (date: Date) => {
    const y = date.getFullYear();
    const m = date.getMonth(); // 0=1월
    const startDate = new Date(y, m, 1);        // 로컬타임 1일 00:00
    const endDate   = new Date(y, m + 1, 0);    // 로컬타임 말일 00:00
    return { start: formatLocalDate(startDate), end: formatLocalDate(endDate) };
  };

    const fetchSchedule = async () => {
        setLoading(true);
        try {
            const { start, end } = getMonthRange(currentDate);
            const data = await fetchCoachSchedule({
                coachId,
                startDate: start,
                endDate: end,
                includeCancelled: filters.includeCancelled,
            });
            setEvents(data);
        } catch (error) {
            console.error('Error fetching schedule:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = events;
        if (filters.status !== 'all') {
            filtered = filtered.filter(e => e.status === filters.status);
        }
        setFilteredEvents(filtered);
    };

    const handleEventClick = (event: ScheduleEvent) => {
        setSelectedEvent(event);
        setIsModalOpen(true);
    };

    const handleMonthChange = (direction: 'prev' | 'next') => {
        const next = new Date(currentDate);
        next.setMonth(next.getMonth() + (direction === 'prev' ? -1 : 1));
        setCurrentDate(next);
    };

    const goToToday = () => setCurrentDate(new Date());
    const handleFilterChange = (newFilters: Partial<FilterOptions>) =>
        setFilters(prev => ({ ...prev, ...newFilters }));

    const stats = useMemo(() => {
        const total = filteredEvents.length;
        const confirmed = filteredEvents.filter(e => e.status === 'confirmed').length;
        const completed = filteredEvents.filter(e => e.status === 'completed').length;
        const cancelled = filteredEvents.filter(e => e.status === 'cancelled').length;
        return { total, confirmed, completed, cancelled };
    }, [filteredEvents]);

    useEffect(() => {
        fetchSchedule();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentDate, filters.includeCancelled]);

    useEffect(() => {
        applyFilters();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [events, filters]);

    return (
        <div className="coach-calendar-container">
            {/* <div className="coach-calendar-header">
                <h1>일정 관리</h1>
            </div> */}

            {/* <FilterSection
                filters={filters}
                onFilterChange={handleFilterChange}
                onRefresh={fetchSchedule}
                loading={loading}
            /> */}

            <StatsSection stats={stats} />

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
                    onStatusChange={async (eventId, newStatus) => {
                        try {
                            // 정책상: completed/cancelled/confirmed만 허용 (백엔드가드 있음)
                            await updateReservationStatus(eventId, newStatus as any, coachId);
                            await fetchSchedule();
                        } catch (e: any) {
                            alert(e?.message || "상태 변경에 실패했습니다.");
                        }
                    }}
                />
            )}
        </div>
    );
};

export default CoachCalendar;