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

// UserInfoCard에서 보여주고 수정하는 필드만 form의 대상이 되도록 User 타입을 필요한 부분만 Pick해서 제한
export type EditableUserFields = Pick<User, 'name' | 'gender' | 'phone' | 'birthdate'>;