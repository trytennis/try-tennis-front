// 수강권

export interface Ticket {
    id: string;
    name: string;
    lesson_count: number;
    valid_days: number;
    price: number;
    price_per_lesson: number;
    facility_id: string;
    created_at: string;
    updated_at: string;
}
