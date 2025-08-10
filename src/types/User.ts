import type { TicketSummary } from "./TicketSummary";

export interface User {
    id: string;
    name: string;
    user_type: 'super_admin' | 'facility_admin' | 'coach' | 'student';
    gender: 'male' | 'female' | 'other' | null;
    phone?: string | null;
    facility_id?: string | null;
    is_active: boolean;
    created_at: string;
    memo?: string | null;
    birthdate: string | null;
    ticket?: TicketSummary | null;
  }
  