export interface ScheduleEvent {
    id: string;
    title: string;
    start: string; // ISO string
    end: string; // ISO string
    status: 'confirmed' | 'completed' | 'cancelled';

    // 상세 정보
    user_id?: string;
    user_name?: string;
    user_phone?: string;
    user_gender?: string;
    coach_id?: string;
    coach_name?: string;
    coach_phone?: string;
    facility_name?: string;
    ticket_name?: string;
    ticket_price?: number;
    ticket_total_count?: number;
    price_per_lesson?: number;
    remaining_count?: number;
    memo?: string;
    admin_memo?: string;
    reservation_date?: string;
    cancelled_at?: string;
    cancel_reason?: string;
}

export interface FilterOptions {
    status: 'all' | 'confirmed' | 'completed' | 'cancelled';
    includeCancelled: boolean;
}

export interface CalendarDay {
    date: Date;
    isCurrentMonth: boolean;
    isToday: boolean;
    events: ScheduleEvent[];
}

export interface Stats {
    total: number;
    confirmed: number;
    completed: number;
    cancelled: number;
}

export interface CalendarGridProps {
    currentDate: Date;
    events: ScheduleEvent[];
    onEventClick: (event: ScheduleEvent) => void;
    loading: boolean;
}

export interface CalendarHeaderProps {
    currentDate: Date;
    onMonthChange: (direction: 'prev' | 'next') => void;
    onToday: () => void;
}

export interface EventDetailModalProps {
    event: ScheduleEvent;
    onClose: () => void;
    onStatusChange: (eventId: string, newStatus: string) => void;
}

export interface FilterSectionProps {
    filters: FilterOptions;
    onFilterChange: (filters: Partial<FilterOptions>) => void;
    onRefresh: () => void;
    loading: boolean;
}

export interface StatsSectionProps {
    stats: Stats;
}