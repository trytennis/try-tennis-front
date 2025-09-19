// src/api/me.ts

import { authGet } from "../utils/authApi";

export type UserType = "super_admin" | "facility_admin" | "coach" | "student" | "unknown";

export async function fetchMyRole(): Promise<{ profile_id: string; user_type: UserType }> {
  return authGet("/api/me/role");
}
