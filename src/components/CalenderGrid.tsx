import React from 'react';
import type { CalendarGridProps, CalendarDay, ScheduleEvent } from '../types/Schedule';

export const CalendarGrid: React.FC<CalendarGridProps> = ({
    currentDate,
    events,
    onEventClick,
    loading,
}) => {
    // 캘린더 날짜 배열 생성
    const generateCalendarDays = (): CalendarDay[] => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const today = new Date();

        // 이번 달 첫째 날과 마지막 날
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        // 첫째 주의 일요일부터 시작
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        // 마지막 주의 토요일까지
        const endDate = new Date(lastDay);
        endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

        const days: CalendarDay[] = [];
        const current = new Date(startDate);

        while (current <= endDate) {
            const dayEvents = events.filter(event => {
                const eventDate = new Date(event.start);
                return (
                    eventDate.getFullYear() === current.getFullYear() &&
                    eventDate.getMonth() === current.getMonth() &&
                    eventDate.getDate() === current.getDate()
                );
            });

            days.push({
                date: new Date(current),
                isCurrentMonth: current.getMonth() === month,
                isToday:
                    current.getFullYear() === today.getFullYear() &&
                    current.getMonth() === today.getMonth() &&
                    current.getDate() === today.getDate(),
                events: dayEvents,
            });

            current.setDate(current.getDate() + 1);
        }

        return days;
    };

    const formatTime = (isoString: string) => {
        return new Date(isoString).toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
    };

    const getEventStatusClass = (status: string) => {
        switch (status) {
            case 'confirmed': return 'event-confirmed';
            case 'completed': return 'event-completed';
            case 'cancelled': return 'event-cancelled';
            default: return 'event-default';
        }
    };

    const calendarDays = generateCalendarDays();
    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

    if (loading) {
        return (
            <div className="calendar-loading">
                <div className="loading-spinner"></div>
                <p>일정을 불러오는 중...</p>
            </div>
        );
    }

    return (
        <div className="calendar-grid-container">
            {/* 요일 헤더 */}
            <div className="calendar-weekdays">
                {weekDays.map((day, index) => (
                    <div
                        key={day}
                        className={`weekday ${index === 0 ? 'sunday' : ''} ${index === 6 ? 'saturday' : ''}`}
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* 캘린더 그리드 */}
            <div className="calendar-grid">
                {calendarDays.map((day, index) => (
                    <div
                        key={index}
                        className={`calendar-day ${day.isCurrentMonth ? 'current-month' : 'other-month'
                            } ${day.isToday ? 'today' : ''}`}
                    >
                        <div className="day-number">
                            {day.date.getDate()}
                        </div>

                        <div className="day-events">
                            {day.events.slice(0, 3).map((event) => (
                                <button
                                    key={event.id}
                                    className={`calendar-event ${getEventStatusClass(event.status)}`}
                                    onClick={() => onEventClick(event)}
                                    title={`${event.title} (${formatTime(event.start)} - ${formatTime(event.end)})`}
                                >
                                    <div className="event-time">
                                        {formatTime(event.start)}
                                    </div>
                                    <div className="event-title">
                                        {event.title}
                                    </div>
                                </button>
                            ))}

                            {day.events.length > 3 && (
                                <div className="more-events">
                                    +{day.events.length - 3}개 더
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};