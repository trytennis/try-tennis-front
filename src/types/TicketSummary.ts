// 유저 수강권 요약 정보
export interface TicketSummary {
    tickets: {
        name: string;
    };
    remaining_count: number;
    expires_at: string;
}