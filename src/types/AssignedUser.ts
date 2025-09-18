export type AssignedUser = {
    user_id: string;
    name: string;
    user_type: string;
    remaining_count: number;
    assigned_at: string;
    expires_at: string | null;
};