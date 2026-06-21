import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  if (!verifyAdminSession(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Total Registered Users
    const { count: usersCount, error: usersError } = await supabaseAdmin
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });

    if (usersError) throw usersError;

    // 2. Total Paid Users
    const { count: paidCount, error: paidError } = await supabaseAdmin
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_paid', true);

    if (paidError) throw paidError;

    // 3. Total Guest Sessions
    const { count: guestsCount, error: guestsError } = await supabaseAdmin
      .from('guest_sessions')
      .select('*', { count: 'exact', head: true });

    if (guestsError) throw guestsError;

    // 4. Total Chats
    const { count: chatsCount, error: chatsError } = await supabaseAdmin
      .from('chat_messages')
      .select('*', { count: 'exact', head: true });

    if (chatsError) throw chatsError;

    // 5. Total Payments
    const { data: paymentsData, error: paymentsError } = await supabaseAdmin
      .from('payments')
      .select('amount')
      .eq('status', 'success');

    if (paymentsError) throw paymentsError;

    const totalRevenue = (paymentsData || []).reduce((acc, p) => acc + (p.amount || 0), 0) / 100; // Razorpay is in paise

    return NextResponse.json({
      totalUsers: usersCount || 0,
      totalPaidUsers: paidCount || 0,
      totalGuests: guestsCount || 0,
      totalChats: chatsCount || 0,
      totalRevenue: totalRevenue || 0
    });
  } catch (error: unknown) {
    console.error('Stats query error:', error);
    // If tables are missing or not set up, return fallback counts
    return NextResponse.json({
      totalUsers: 0,
      totalPaidUsers: 0,
      totalGuests: 0,
      totalChats: 0,
      totalRevenue: 0,
      warning: 'Some tables may be missing in Supabase. Check schema SQL.'
    });
  }
}
