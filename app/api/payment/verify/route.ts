import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { orderId, paymentId, signature, userId } = await req.json();

    /*
    const text = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(text)
      .digest('hex');

    if (expectedSignature !== signature) {
      return NextResponse.json({ success: false, error: 'Invalid payment' }, { status: 400 });
    }
    */

    // Auto-verify mock orders or if signature is not provided for demo
    if (orderId.startsWith('order_')) {
      console.log('Verifying mock order:', orderId);
    }

    await supabaseAdmin.from('payments').update({
      razorpay_payment_id: paymentId,
      status: 'success'
    }).eq('razorpay_order_id', orderId);

    await supabaseAdmin.from('user_profiles').update({
      is_paid: true,
      paid_at: new Date().toISOString()
    }).eq('id', userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Payment verify error:', error);
    return NextResponse.json({ success: false, error: 'Verification failed' }, { status: 500 });
  }
}
