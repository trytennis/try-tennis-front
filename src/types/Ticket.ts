// 수강권

export interface Ticket {
    id: string;
    name: string;
    lesson_count: number;
    valid_days: number;
    price: number;
    price_per_lesson: number;
    facility_id: string;
    facility_name?: string | null; // 슈퍼어드민 목록에서만 붙는 필드
    created_at: string;
    updated_at: string;
}
