"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

declare global { interface Window { Razorpay: any; } }

export default function PaymentPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user);
      else router.push('/auth');
    });

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    document.head.appendChild(script);
  }, [router]);

  async function handlePayment() {
    if (!user) return;
    setLoading(true);

    try {
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      const { orderId, amount } = await res.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount,
        currency: 'INR',
        name: 'सरकारी साथी',
        description: 'Premium Access — Unlimited AI + Study Material',
        order_id: orderId,
        handler: async (response: any) => {
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              userId: user.id,
            }),
          });
          const result = await verifyRes.json();
          if (result.success) {
            setSuccess(true);
            setTimeout(() => router.push('/results'), 2000);
          }
        },
        prefill: { email: user.email },
        theme: { color: '#0F2B5B' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Payment error:', err);
      alert('Payment में कुछ problem हो गई। दोबारा try करें।');
    }
    setLoading(false);
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#EEF2F8] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-sm">
          <p className="text-6xl mb-4">🎉</p>
          <h2 className="text-2xl font-bold text-[#0F2B5B] mb-2" style={{ fontFamily: "var(--font-noto)" }}>Payment Successful!</h2>
          <p className="text-gray-500" style={{ fontFamily: "var(--font-noto)" }}>अब आपको Unlimited AI सवाल + Complete Study Material मिलेगा</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EEF2F8] flex items-center justify-center p-4">
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF6B00] via-white to-[#138808] z-50" />
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-[#0F2B5B] to-[#1847A6] p-6 text-center">
            <div className="text-4xl mb-2">💎</div>
            <h1 className="text-white text-xl font-bold" style={{ fontFamily: "var(--font-noto)" }}>Premium Access</h1>
          </div>

          <div className="p-6 text-center">
            <div className="mb-6">
              <p className="text-5xl font-black text-[#0F2B5B]">₹30</p>
              <p className="text-gray-400 text-sm" style={{ fontFamily: "var(--font-noto)" }}>एक बार का भुगतान — कोई subscription नहीं</p>
            </div>

            <div className="text-left space-y-2 mb-6">
              {["✅ Unlimited AI सवाल", "✅ Complete Study Material", "✅ Previous Year Papers", "✅ Syllabus PDF", "✅ Exam Info Save", "✅ Chat History"].map((f, i) => (
                <p key={i} className="text-sm font-medium text-[#0D1B2A]" style={{ fontFamily: "var(--font-noto)" }}>{f}</p>
              ))}
            </div>

            <button
              onClick={handlePayment}
              disabled={loading || !user}
              className="w-full h-14 bg-gradient-to-r from-[#FF6B00] to-[#E55A00] text-white text-lg font-bold rounded-xl disabled:opacity-50 active:scale-[0.98] transition-all shadow-lg"
              style={{ fontFamily: "var(--font-noto)" }}
            >
              {loading ? '⏳ Processing...' : '₹30 Pay करें →'}
            </button>

            <p className="text-xs text-gray-400 mt-3" style={{ fontFamily: "var(--font-noto)" }}>
              🔒 Razorpay से secure payment
            </p>
          </div>
        </div>

        <button onClick={() => router.back()} className="w-full text-center text-sm text-gray-400 mt-4 hover:text-gray-600" style={{ fontFamily: "var(--font-noto)" }}>
          ← वापस जाएं
        </button>
      </div>
    </div>
  );
}
