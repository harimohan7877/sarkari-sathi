import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import Razorpay from "razorpay";

export async function POST(req: NextRequest) {
  try {
    const { customerName, customerEmail, products, totalAmount } = await req.json();

    if (!customerName || !customerEmail || !products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: "Missing required checkout information" }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json({ error: "Razorpay not configured on server" }, { status: 500 });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: `receipt_mp_${Date.now()}`,
      notes: {
        customerName,
        customerEmail,
        productCount: String(products.length),
      },
    });

    if (!order || !order.id) {
      return NextResponse.json({ error: "Failed to create Razorpay order" }, { status: 500 });
    }

    const razorpayOrderId = order.id;

    // Insert pending order entries into Supabase marketplace_orders
    // Insert one row per product so they can be individually tracked and delivered
    const orderInserts = products.map((prod: { id: string; salePrice: number }) => ({
      customer_name: customerName,
      customer_email: customerEmail,
      product_id: prod.id,
      amount: prod.salePrice,
      payment_status: "pending",
      razorpay_order_id: razorpayOrderId,
      delivery_status: "pending",
    }));

    const { error: dbError } = await supabaseAdmin
      .from("marketplace_orders")
      .insert(orderInserts);

    if (dbError) {
      console.error("Failed to insert orders in Supabase:", dbError);
      return NextResponse.json({ error: "Database checkout failure" }, { status: 500 });
    }

    return NextResponse.json({
      orderId: razorpayOrderId,
      amount: totalAmount,
      currency: "INR",
    });

  } catch (err: unknown) {
    console.error("Error creating marketplace order:", err);
    return NextResponse.json({ error: "Internal order creation error" }, { status: 500 });
  }
}
