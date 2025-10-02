// src/api/facilities.ts
import type { Facility, FacilityCreatePayload, FacilityUpdatePayload } from "../types/FacilityData";
import type { FacilityMember } from "../types/FacilityMember";
import { authGet, authPost, authPut, authDelete, authPatch } from "../utils/authApi";

/**
 * Facilities API (백엔드: @require_auth + @require_roles 보호)
 * 권한: facility_admin / super_admin (읽기/수정 범위는 백엔드 권한 체크)
 */
export class FacilitiesApi {
    /** 시설 목록 */
    static async list(): Promise<Facility[]> {
        return authGet<Facility[]>(`/api/facilities`);
    }

    /** 단일 시설 조회 */
    static async getById(facilityId: string): Promise<Facility> {
        return authGet<Facility>(`/api/facilities/${facilityId}`);
    }

    /** 시설 생성 (super_admin 전용) */
    static async create(payload: FacilityCreatePayload): Promise<Facility> {
        return authPost<Facility>(`/api/facilities`, payload);
    }

    /** 시설 수정 (super_admin: 아무 시설, facility_admin: 본인 시설만) */
    static async update(facilityId: string, payload: FacilityUpdatePayload): Promise<Facility> {
        return authPatch<Facility>(`/api/facilities/${facilityId}`, payload);
    }

    /** 시설 삭제 (super_admin 전용) */
    static async remove(facilityId: string): Promise<{ ok: boolean }> {
        return authDelete<{ ok: boolean }>(`/api/facilities/${facilityId}`);
    }

    /** 해당 시설 소속 멤버 목록 (관리자/코치/학생 포함) */
    static async listMembers(facilityId: string): Promise<FacilityMember[]> {
        return authGet<FacilityMember[]>(`/api/facilities/${facilityId}/members`);
    }

    /** 시설 관리자 지정/변경 (super_admin 또는 해당 시설의 facility_admin) */
    static async assignAdmin(
        facilityId: string,
        profileId: string
    ): Promise<AssignAdminResponse> {
        return authPost<AssignAdminResponse>(
            `/api/facilities/${facilityId}/assign-admin`,
            { profile_id: profileId }
        );
    }
}

/** assign-admin 응답 셰이프 (백엔드 select: id,name,user_type,facility_id) */
export type AssignAdminResponse = {
    id: string;
    name: string;
    user_type: string;
    facility_id: string | null;
};
