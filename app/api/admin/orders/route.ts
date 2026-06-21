import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  if (!verifyAdminSession(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: orders, error } = await supabaseAdmin
      .from('marketplace_orders')
      .select('*, product:marketplace_products(title, exam_name)')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn("Error loading marketplace orders (table might not exist yet):", error.message);
      return NextResponse.json([]);
    }

    return NextResponse.json(orders || []);
  } catch (error: unknown) {
    console.error('Admin orders query error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!verifyAdminSession(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { orderId, action, value } = await req.json();

    if (!orderId || !action) {
      return NextResponse.json({ error: 'Order ID and Action required' }, { status: 400 });
    }

    if (action === 'update_delivery') {
      const { error } = await supabaseAdmin
        .from('marketplace_orders')
        .update({ delivery_status: value })
        .eq('id', orderId);

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === 'update_payment') {
      const { error } = await supabaseAdmin
        .from('marketplace_orders')
        .update({ payment_status: value })
        .eq('id', orderId);

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    console.error('Admin orders update error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
