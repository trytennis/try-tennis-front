// src/api/tickets.ts

import { authGet, authPost, authPut, authDelete } from "../utils/authApi";
import type { Ticket } from "../types/Ticket";
import type { AssignedUser } from "../types/AssignedUser";

/**
 * Tickets API (백엔드: @require_auth + @require_roles 로 보호됨)
 * 권한 필요 : coach/facility_admin/super_admin
 */
export class TicketsApi {
    /** 수강권 목록 */
    static async list(params?: { limit?: number; offset?: number }): Promise<Ticket[]> {
        const limit = params?.limit ?? 100;
        const offset = params?.offset ?? 0;
        const qs = new URLSearchParams({ limit: String(limit), offset: String(offset) }).toString();
        return authGet<Ticket[]>(`/api/tickets?${qs}`);
    }

    /** 단일 수강권 조회 */
    static async getById(ticketId: string): Promise<Ticket> {
        return authGet<Ticket>(`/api/tickets/${ticketId}`);
    }

    /** 수강권 생성 */
    static async create(payload: Partial<Ticket>): Promise<Ticket> {
        return authPost<Ticket>(`/api/tickets`, payload);
    }

    /** 수강권 수정 */
    static async update(ticketId: string, payload: Partial<Ticket>): Promise<Ticket> {
        return authPut<Ticket>(`/api/tickets/${ticketId}`, payload);
    }

    /** 수강권 삭제 */
    static async remove(ticketId: string): Promise<{ message: string }> {
        return authDelete<{ message: string }>(`/api/tickets/${ticketId}`);
    }

    /** 특정 수강권의 사용자 목록 */
    static async listUsers(ticketId: string): Promise<AssignedUser[]> {
        return authGet<AssignedUser[]>(`/api/tickets/${ticketId}/users`);
    }

}
