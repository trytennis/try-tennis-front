// src/types/Facility.ts
export type Facility = {
    id: string;
    name: string;
    address?: string | null;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
};

// 백엔드 create: name 필수, address 선택
export type FacilityCreatePayload = {
    name: string;
    address?: string | null;
};

// 백엔드 update 허용 필드: name/address
export type FacilityUpdatePayload = {
    name?: string;
    address?: string | null;
};
