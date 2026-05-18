// eslint-disable-next-line @typescript-eslint/no-require-imports
const Razorpay = require('razorpay');
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

    const order = await razorpay.orders.create({
      amount: 3000,
      currency: 'INR',
      notes: { userId, purpose: 'Sarkari Saathi Premium' }
    });

    await supabaseAdmin.from('payments').insert({
      user_id: userId,
      razorpay_order_id: order.id,
      amount: 3000,
      status: 'pending'
    });

    return NextResponse.json({ orderId: order.id, amount: 3000 });
  } catch (error) {
    console.error('Payment create error:', error);
    return NextResponse.json({ error: 'Payment creation failed' }, { status: 500 });
  }
}
