import { authGet } from '../utils/authApi';

export type AuditLog = {
  id: string; action: string; entity_type: string; entity_id: string;
  actor_id?: string; facility_id?: string; details: Record<string, unknown>; created_at: string;
};

export const fetchAuditLogs = (limit = 100) => authGet<AuditLog[]>(`/api/audit-logs?limit=${limit}`);
