import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  if (!verifyAdminSession(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('q') || '';

  try {
    let query = supabaseAdmin
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (search) {
      // In PostgreSQL/Supabase we can use ilike for case insensitive searching
      query = query.or(`name.ilike.%${search}%,city.ilike.%${search}%,category.ilike.%${search}%`);
    }

    const { data: users, error } = await query;
    if (error) throw error;

    return NextResponse.json(users || []);
  } catch (error: any) {
    console.error('Users query error:', error);
    return NextResponse.json([], { status: 200 }); // Return empty array on missing table/error
  }
}

export async function POST(req: NextRequest) {
  if (!verifyAdminSession(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { userId, action, isPaid, resetMessages } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const updateObj: Record<string, any> = {};

    if (action === 'toggle_paid') {
      updateObj.is_paid = isPaid;
      if (isPaid) updateObj.paid_at = new Date().toISOString();
      else updateObj.paid_at = null;
    }

    if (action === 'reset_messages' || resetMessages) {
      updateObj.ai_messages_used = 0;
    }

    const { error } = await supabaseAdmin
      .from('user_profiles')
      .update(updateObj)
      .eq('id', userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('User update error:', error);
    return NextResponse.json({ error: 'Failed to update user: ' + error.message }, { status: 500 });
  }
}
