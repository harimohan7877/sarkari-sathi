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
    // Original authentication disabled for testing bypass
    // const { error } = await supabase.auth.signInWithOtp({ email });
    // if (error) {
    //   setError('ईमेल गलत है या कोई तकनीकी समस्या आ गई है। कृपया पुनः प्रयास करें।');
    // } else {
    //   setStep('otp');
    // }
    setStep('otp');
    setLoading(false);
  }

  async function verifyOTP() {
    setLoading(true);
    // Original verification disabled for testing bypass. Mock session is stored.
    // const { error } = await supabase.auth.verifyOtp({
    //   email,
    //   token: otp,
    //   type: 'email'
    // });
    // if (error) {
    //   setError('प्रवेश कोड गलत है। ईमेल में प्राप्त हुआ 6-अंकीय कोड दर्ज करें।');
    // } else { ... }

    const mockUser = {
      id: '00000000-0000-0000-0000-000000000000',
      email: email || 'test@sarkari.com',
      created_at: new Date().toISOString()
    };
    localStorage.setItem('mock_user_session', JSON.stringify(mockUser));

    const returnTo = typeof window !== 'undefined' 
      ? sessionStorage.getItem('returnTo') || '/' 
      : '/';
    router.push(returnTo);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#EEF2F8] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute w-96 h-96 rounded-full bg-orange-500/5 blur-3xl -top-20 -left-20 pointer-events-none" />
      <div className="absolute w-96 h-96 rounded-full bg-blue-500/5 blur-3xl top-1/2 right-0 pointer-events-none" />

      {/* Tiranga stripe at very top */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF6B00] via-white to-[#138808] z-50" />

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/10 overflow-hidden border border-[#C5D0E0]/60">
          {/* Card header */}
          <div className="bg-gradient-to-br from-[#0F2B5B] via-[#143770] to-[#1847A6] p-8 text-center border-b border-white/10 relative">
            {/* Simple Home Link */}
            <button 
              onClick={() => router.push('/')}
              className="absolute left-4 top-4 text-white/70 hover:text-white text-xs bg-white/10 hover:bg-white/20 p-2 rounded-full border border-white/10 transition-all active:scale-95"
            >
              ← होम
            </button>
            <div className="text-4xl mb-2.5">🏛️</div>
            <h1 className="text-white text-xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-noto)' }}>
              सरकारी साथी
            </h1>
            <p className="text-white/70 text-xs mt-1" style={{ fontFamily: 'var(--font-noto)' }}>
              राजस्थान सरकारी भर्ती मार्गदर्शन पोर्टल
            </p>
          </div>

          <div className="p-8">
            {step === 'email' ? (
              <>
                <h2 className="text-[#0F2B5B] font-extrabold text-base mb-1" style={{ fontFamily: 'var(--font-noto)' }}>
                  Email से Login करें
                </h2>
                <p className="text-gray-400 text-xs mb-6" style={{ fontFamily: 'var(--font-noto)' }}>
                  कोई पासवर्ड नहीं! ईमेल पर 6 अंकों का सुरक्षित कोड भेजा जाएगा।
                </p>

                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-500 mb-1.5" style={{ fontFamily: 'var(--font-noto)' }}>
                    ईमेल एड्रेस (Email Address)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="example@domain.com"
                    className="w-full h-12 border border-[#C5D0E0] rounded-xl px-4 text-sm bg-gray-50/50 text-[#0D1B2A] focus:bg-white focus:border-[#1847A6] focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                    onKeyDown={e => e.key === 'Enter' && email && sendOTP()}
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-xl mb-4" style={{ fontFamily: 'var(--font-noto)' }}>
                    ⚠️ {error}
                  </div>
                )}

                <button
                  onClick={sendOTP}
                  disabled={!email || loading}
                  className="w-full h-12 bg-gradient-to-r from-[#FF6B00] to-[#E55A00] text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-[#E55A00] hover:to-[#cc5000] active:scale-[0.98] transition-all shadow-md hover:shadow-lg hover:shadow-orange-500/10 cursor-pointer text-sm"
                  style={{ fontFamily: 'var(--font-noto)' }}
                >
                  {loading ? '⏳ भेज रहे हैं...' : 'OTP कोड भेजें 📧'}
                </button>

                <p className="text-center text-[10px] text-gray-400 mt-4 leading-relaxed" style={{ fontFamily: 'var(--font-noto)' }}>
                  कोई पासवर्ड याद रखने की जरूरत नहीं। आपका डेटा पूर्णतः सुरक्षित है।
                </p>
              </>
            ) : (
              <>
                <h2 className="text-[#0F2B5B] font-extrabold text-base mb-1" style={{ fontFamily: 'var(--font-noto)' }}>
                  सुरक्षा कोड (OTP) दर्ज करें
                </h2>
                <p className="text-gray-400 text-xs mb-6" style={{ fontFamily: 'var(--font-noto)' }}>
                  हमने <span className="font-bold text-[#1847A6]">{email}</span> पर 6-अंकीय कोड भेजा है।
                </p>

                <div className="flex gap-2.5 mb-5">
                  {[0,1,2,3,4,5].map(i => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      maxLength={1}
                      inputMode="numeric"
                      className="w-full h-14 border border-[#C5D0E0] rounded-xl text-center text-xl font-extrabold text-[#0D1B2A] bg-gray-50 focus:border-[#FF6B00] focus:bg-white focus:ring-4 focus:ring-orange-100 transition-all outline-none"
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
                  <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-xl mb-4" style={{ fontFamily: 'var(--font-noto)' }}>
                    ⚠️ {error}
                  </div>
                )}

                <button
                  onClick={verifyOTP}
                  disabled={otp.length < 6 || loading}
                  className="w-full h-12 bg-gradient-to-r from-[#0F2B5B] to-[#1847A6] text-white font-bold rounded-xl disabled:opacity-50 hover:from-[#0D2550] hover:to-[#1540A0] active:scale-[0.98] transition-all shadow-md text-sm cursor-pointer"
                  style={{ fontFamily: 'var(--font-noto)' }}
                >
                  {loading ? '⏳ पुष्टि की जा रही है...' : 'Login पुष्टि करें ✅'}
                </button>

                <button
                  onClick={() => { setStep('email'); setOtp(''); setError(''); }}
                  className="w-full mt-4 text-xs font-bold text-gray-500 hover:text-gray-700 transition-colors text-center"
                  style={{ fontFamily: 'var(--font-noto)' }}
                >
                  ← वापस जाएं (Change Email)
                </button>
              </>
            )}
          </div>
        </div>

        {/* Guest continue option */}
        <p className="text-center text-xs text-gray-500 mt-5" style={{ fontFamily: 'var(--font-noto)' }}>
          अभी लॉगिन नहीं करना?{' '}
          <button onClick={() => router.back()} className="text-[#1847A6] font-bold hover:underline active:scale-95 transition-transform">
            Guest के रूप में जारी रखें →
          </button>
        </p>
      </div>
    </div>
  );
}
