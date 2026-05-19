import { User } from "@supabase/supabase-js";

export interface Profile {
  id: string;
  name: string | null;
  city: string | null;
  age: number;
  education: string;
  category: string;
  gender: string;
  has_cet_graduate: boolean;
  has_cet_senior_secondary: boolean;
  has_rscit: boolean;
  is_paid: boolean;
  ai_messages_used: number;
  updated_at?: string;
}

export interface SavedExam {
  id: string;
  user_id: string;
  exam_id: string;
  saved_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  exam_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export type { User };
