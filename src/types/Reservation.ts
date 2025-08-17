export interface Reservation {
    id: string;
    coach_id: string;
    user_id?: string;
    date: string;
    start_time: string;
    end_time: string;
    status: 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed';
    attendance_status?: 'attended' | 'absent' | 'no_show';
    memo?: string;
    admin_memo?: string;
    reservation_date: string;
    user_name: string;
    user_phone?: string;
    user_gender?: string;
    coach_name: string;
    coach_phone?: string;
    remaining_count?: number;
    ticket_name?: string;
    ticket_price?: number;
    ticket_total_count?: number;
    price_per_lesson?: number;
    facility_name?: string;
}