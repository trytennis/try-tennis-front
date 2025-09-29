export type Coach = {
    id: string;
    name: string;
    phone?: string;
    title?: string;
    avatarUrl?: string;
  };
  

export type CoachLite = {
  id: string;
  name: string | null;
  phone?: string | null;
  user_type: "coach";
  facility_id?: string | null;
  is_active?: boolean;
};