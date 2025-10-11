export type AITwoLine = { line1: string; line2: string };

export type AIVideoComment = {
  id: string;
  model: string;
  structured: AITwoLine;
  created_at: string;
  updated_at?: string;
  requested_by: string;
};