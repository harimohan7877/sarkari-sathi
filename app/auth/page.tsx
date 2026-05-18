'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function sendOTP() {
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setError('Email galat hai ya kuch problem aa gayi। Dobara try karo।');
    } else {
      setStep('otp');
    }
    setLoading(false);
  }

  async function verifyOTP() {
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email'
    });
    if (error) {
      setError('Code galat hai। Email mein aaya 6-digit code daalo।');
    } else {
      const returnTo = typeof window !== 'undefined' 
        ? sessionStorage.getItem('returnTo') || '/' 
        : '/';
      router.push(returnTo);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#EEF2F8] flex items-center justify-center p-4">
      {/* Tiranga stripe at very top */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF6B00] via-white to-[#138808] z-50" />

      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Card header */}
          <div className="bg-gradient-to-r from-[#0F2B5B] to-[#1847A6] p-6 text-center">
            <div className="text-4xl mb-2">🏛️</div>
            <h1 className="text-white text-xl font-bold" style={{ fontFamily: 'var(--font-noto)' }}>
              सरकारी साथी
            </h1>
            <p className="text-white/75 text-sm mt-1" style={{ fontFamily: 'var(--font-noto)' }}>
              Login करें और पूरी जानकारी पाएं
            </p>
          </div>

          {/* Benefits bar */}
          <div className="bg-green-50 border-b border-green-100 px-6 py-3">
            <p className="text-green-700 text-sm text-center font-medium" style={{ fontFamily: 'var(--font-noto)' }}>
              ✅ Login के बाद: 10 AI सवाल FREE + पूरा Study Material
            </p>
          </div>

          <div className="p-6">
            {step === 'email' ? (
              <>
                <h2 className="text-[#0F2B5B] font-bold text-lg mb-1" style={{ fontFamily: 'var(--font-noto)' }}>
                  Email से Login करें
                </h2>
                <p className="text-gray-500 text-sm mb-6" style={{ fontFamily: 'var(--font-noto)' }}>
                  No password! Email पर 6-digit code आएगा।
                </p>

                <label className="block text-sm font-semibold text-[#0F2B5B] mb-2" style={{ fontFamily: 'var(--font-noto)' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="aapka@email.com"
                  className="w-full h-12 border-2 border-[#C5D0E0] rounded-xl px-4 text-base text-gray-900 bg-gray-50 focus:border-[#1847A6] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1847A6]/10 mb-4"
                  onKeyDown={e => e.key === 'Enter' && email && sendOTP()}
                />

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg mb-4" style={{ fontFamily: 'var(--font-noto)' }}>
                    {error}
                  </div>
                )}

                <button
                  onClick={sendOTP}
                  disabled={!email || loading}
                  className="w-full h-12 bg-gradient-to-r from-[#FF6B00] to-[#E55A00] text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-[#E56200] hover:to-[#CC5500] active:scale-[0.98] transition-all"
                  style={{ fontFamily: 'var(--font-noto)' }}
                >
                  {loading ? '⏳ भेज रहे हैं...' : 'Code भेजो 📧'}
                </button>

                <p className="text-center text-xs text-gray-400 mt-4" style={{ fontFamily: 'var(--font-noto)' }}>
                  कोई password नहीं। कोई personal data नहीं। सिर्फ email।
                </p>
              </>
            ) : (
              <>
                <h2 className="text-[#0F2B5B] font-bold text-lg mb-1" style={{ fontFamily: 'var(--font-noto)' }}>
                  Code Enter करें
                </h2>
                <p className="text-gray-500 text-sm mb-6" style={{ fontFamily: 'var(--font-noto)' }}>
                  {email} पर 6-digit code भेजा गया है
                </p>

                <div className="flex gap-2 mb-4">
                  {[0,1,2,3,4,5].map(i => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      maxLength={1}
                      inputMode="numeric"
                      className="w-full h-14 border-2 border-[#C5D0E0] rounded-xl text-center text-xl font-bold text-[#0F2B5B] focus:border-[#FF6B00] focus:outline-none"
                      value={otp[i] || ''}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '');
                        const newOtp = otp.split('');
                        newOtp[i] = val;
                        const joined = newOtp.join('');
                        setOtp(joined);
                        if (val && i < 5) {
                          document.getElementById(`otp-${i+1}`)?.focus();
                        }
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Backspace' && !otp[i] && i > 0) {
                          document.getElementById(`otp-${i-1}`)?.focus();
                        }
                      }}
                    />
                  ))}
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg mb-4" style={{ fontFamily: 'var(--font-noto)' }}>
                    {error}
                  </div>
                )}

                <button
                  onClick={verifyOTP}
                  disabled={otp.length < 6 || loading}
                  className="w-full h-12 bg-gradient-to-r from-[#0F2B5B] to-[#1847A6] text-white font-bold rounded-xl disabled:opacity-50 hover:from-[#0D2550] hover:to-[#1540A0] active:scale-[0.98] transition-all"
                  style={{ fontFamily: 'var(--font-noto)' }}
                >
                  {loading ? '⏳ Verify हो रहा है...' : 'Login करें ✅'}
                </button>

                <button
                  onClick={() => { setStep('email'); setOtp(''); setError(''); }}
                  className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700"
                  style={{ fontFamily: 'var(--font-noto)' }}
                >
                  ← वापस जाएं
                </button>
              </>
            )}
          </div>
        </div>

        {/* Guest continue option */}
        <p className="text-center text-sm text-gray-500 mt-4" style={{ fontFamily: 'var(--font-noto)' }}>
          अभी नहीं?{' '}
          <button onClick={() => router.back()} className="text-[#1847A6] font-medium hover:underline">
            5 सवाल Guest के रूप में पूछें →
          </button>
        </p>
      </div>
    </div>
  );
}
