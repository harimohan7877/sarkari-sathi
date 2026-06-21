import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { orderId, paymentId, signature } = await req.json();

    if (!orderId || !paymentId) {
      return NextResponse.json({ error: "Missing verification credentials" }, { status: 400 });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Perform signature check only if key is not a placeholder and exists
    if (keySecret && !orderId.startsWith("order_mock_") && signature) {
      try {
        const text = `${orderId}|${paymentId}`;
        const expectedSignature = crypto
          .createHmac("sha256", keySecret)
          .update(text)
          .digest("hex");

        if (expectedSignature !== signature) {
          return NextResponse.json({ success: false, error: "Invalid payment signature" }, { status: 400 });
        }
      } catch (cryptoErr) {
        console.error("Crypto verification failed:", cryptoErr);
        return NextResponse.json({ success: false, error: "Signature matching error" }, { status: 500 });
      }
    } else {
      console.log(`Verifying mock payment for transaction: ${orderId}`);
    }

    // Update payment_status to 'paid' in marketplace_orders for this transaction
    const { error: dbError } = await supabaseAdmin
      .from("marketplace_orders")
      .update({
        payment_status: "paid",
        razorpay_payment_id: paymentId,
      })
      .eq("razorpay_order_id", orderId);

    if (dbError) {
      console.error("Database update failed for order verification:", dbError);
      return NextResponse.json({ error: "Database verification update failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (err: unknown) {
    console.error("Error in verify-marketplace API:", err);
    return NextResponse.json({ error: "Internal verification error" }, { status: 500 });
  }
}
