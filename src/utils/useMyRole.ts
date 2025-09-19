// src/utils/useMyRole.ts
import { useEffect, useState } from "react";
import { fetchMyRole, type UserType } from "../api/me";

export function useMyRole() {
  const [role, setRole] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { user_type } = await fetchMyRole();
        setRole(user_type);
      } catch {
        setRole("unknown");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { role, loading };
}
