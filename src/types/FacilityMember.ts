// src/types/FacilityMember.ts
export type FacilityMember = {
    id: string;
    name: string;
    user_type: "super_admin" | "facility_admin" | "admin" | "coach" | "student" | string;
    phone?: string | null;
    is_active?: boolean;
    facility_id?: string | null;
};
