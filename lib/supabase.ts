import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

// Client-side (browser) — uses anon key
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side (API routes) — uses service role key
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Message limits
export const MESSAGE_LIMITS = {
  guest: 5,        // Bina login — 5 messages
  registered: 10,  // Login ke baad free — 10 total
  paid: 999        // ₹30 ke baad — unlimited
};

export type UserTier = 'guest' | 'registered' | 'paid';

export interface TierInfo {
  tier: UserTier;
  messagesUsed: number;
  limit: number;
}

export async function getUserTier(userId?: string, guestToken?: string): Promise<TierInfo> {
  if (userId) {
    const { data } = await supabaseAdmin
      .from('user_profiles')
      .select('is_paid, ai_messages_used')
      .eq('id', userId)
      .single();

    if (data?.is_paid) return { tier: 'paid', messagesUsed: data.ai_messages_used, limit: 999 };
    return { tier: 'registered', messagesUsed: data?.ai_messages_used || 0, limit: 10 };
  }

  if (guestToken) {
    const { data } = await supabaseAdmin
      .from('guest_sessions')
      .select('ai_messages_used')
      .eq('session_token', guestToken)
      .single();
    return { tier: 'guest', messagesUsed: data?.ai_messages_used || 0, limit: 5 };
  }

  return { tier: 'guest', messagesUsed: 0, limit: 5 };
}

export async function incrementMessageCount(userId?: string, guestToken?: string, currentCount: number = 0) {
  if (userId) {
    await supabaseAdmin.from('user_profiles')
      .update({ ai_messages_used: currentCount + 1 })
      .eq('id', userId);
  } else if (guestToken) {
    await supabaseAdmin.from('guest_sessions')
      .update({ ai_messages_used: currentCount + 1 })
      .eq('session_token', guestToken);
  }
}

export async function saveChatMessages(userId: string, examId: string, userMessage: string, aiResponse: string) {
  await supabaseAdmin.from('chat_messages').insert([
    { user_id: userId, exam_id: examId, role: 'user', content: userMessage },
    { user_id: userId, exam_id: examId, role: 'assistant', content: aiResponse }
  ]);
}
