'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const router = useRouter();
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  async function sendOTP() {
    setLoading(true);
    setError('');
    setStep('otp');
    setResendTimer(60);
    setLoading(false);
  }

  function handleOtpChange(index: number, value: string) {
    const val = value.replace(/\D/g, '');
    if (val.length > 1) {
      // Paste handling
      const chars = val.slice(0, 6).split('');
      const newOtp = [...otp];
      chars.forEach((c, i) => { if (index + i < 6) newOtp[index + i] = c; });
      setOtp(newOtp);
      const next = Math.min(index + chars.length, 5);
      otpRefs.current[next]?.focus();
    } else {
      const newOtp = [...otp];
      newOtp[index] = val;
      setOtp(newOtp);
      if (val && index < 5) otpRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  async function verifyOTP() {
    const code = otp.join('');
    if (code.length < 6) return;
    setLoading(true);
    setError('');

    // For MVP: accept any 6-digit code
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

  const otpComplete = otp.every(d => d !== '');

  return (
    <div className="min-h-screen flex items-stretch relative overflow-hidden" style={{ background: 'var(--bg-app)' }}>
      {/* Decorative glows */}
      <div className="absolute w-96 h-96 rounded-full blur-3xl -top-20 -left-20 pointer-events-none" style={{ background: 'hsl(24, 100%, 50%, 0.06)' }} />
      <div className="absolute w-96 h-96 rounded-full blur-3xl bottom-0 right-0 pointer-events-none" style={{ background: 'hsl(217, 91%, 60%, 0.08)' }} />

      {/* Tiranga stripe */}
      <div className="tiranga-stripe fixed top-0 left-0 right-0 z-50" />

      <div className="flex w-full max-w-6xl mx-auto relative z-10">
        {/* Left: Auth Form */}
        <div className="flex-1 flex items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-md animate-slide-up">
            {/* Card */}
            <div
              className="rounded-3xl overflow-hidden border"
              style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-elevated)', borderColor: 'var(--border-card)' }}
            >
              {/* Header gradient */}
              <div
                className="p-8 text-center relative"
                style={{ background: 'linear-gradient(135deg, var(--primary-navy), var(--primary-royal))' }}
              >
                <button
                  onClick={() => router.push('/')}
                  className="absolute left-4 top-4 text-white/80 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20 hover:bg-white/10 transition-all active:scale-95"
                  style={{ fontFamily: 'var(--font-noto)' }}
                >
                  ← होम
                </button>
                <div className="text-5xl mb-3">🏛️</div>
                <h1
                  className="text-white text-2xl font-extrabold tracking-tight"
                  style={{ fontFamily: 'var(--font-noto)' }}
                >
                  सरकारी साथी
                </h1>
                <p
                  className="text-white/75 text-xs mt-1.5"
                  style={{ fontFamily: 'var(--font-noto)' }}
                >
                  राजस्थान सरकारी भर्ती मार्गदर्शन पोर्टल
                </p>
              </div>

              <div className="p-8">
                {step === 'email' ? (
                  <>
                    <h2
                      className="text-lg font-extrabold mb-1"
                      style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-noto)' }}
                    >
                      Email से Login करें
                    </h2>
                    <p
                      className="text-xs mb-6"
                      style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-noto)' }}
                    >
                      कोई पासवर्ड नहीं! ईमेल पर 6 अंकों का सुरक्षित कोड भेजा जाएगा।
                    </p>

                    <div className="mb-4">
                      <label
                        className="block text-xs font-bold mb-1.5"
                        style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-noto)' }}
                      >
                        ईमेल एड्रेस
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="example@domain.com"
                        className="w-full h-12 rounded-xl px-4 text-sm focus-ring transition-all outline-none"
                        style={{
                          background: 'var(--bg-input)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border-card)',
                        }}
                        onKeyDown={e => e.key === 'Enter' && email && sendOTP()}
                      />
                    </div>

                    {error && (
                      <div
                        className="text-xs p-3 rounded-xl mb-4"
                        style={{ background: 'var(--danger-red-light)', color: 'var(--danger-red)', fontFamily: 'var(--font-noto)' }}
                      >
                        ⚠️ {error}
                      </div>
                    )}

                    <button
                      onClick={sendOTP}
                      disabled={!email || loading}
                      className="btn-saffron w-full h-12 font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] text-sm flex items-center justify-center gap-2"
                      style={{ fontFamily: 'var(--font-noto)' }}
                    >
                      {loading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          भेज रहे हैं...
                        </>
                      ) : (
                        <>OTP कोड भेजें <span className="ml-1">📧</span></>
                      )}
                    </button>

                    <p
                      className="text-center mt-4 leading-relaxed"
                      style={{ color: 'var(--text-muted)', fontSize: '11px', fontFamily: 'var(--font-noto)' }}
                    >
                      कोई पासवर्ड याद रखने की जरूरत नहीं। आपका डेटा पूर्णतः सुरक्षित है।
                    </p>
                  </>
                ) : (
                  <>
                    <h2
                      className="text-lg font-extrabold mb-1"
                      style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-noto)' }}
                    >
                      सुरक्षा कोड दर्ज करें
                    </h2>
                    <p
                      className="text-xs mb-6"
                      style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-noto)' }}
                    >
                      हमने <span style={{ color: 'var(--primary-royal)', fontWeight: 700 }}>{email}</span> पर 6-अंकीय कोड भेजा है।
                    </p>

                    <div className="flex gap-2 mb-4">
                      {otp.map((digit, i) => (
                        <input
                          key={i}
                          ref={el => { otpRefs.current[i] = el; }}
                          type="text"
                          maxLength={6}
                          inputMode="numeric"
                          className="otp-box"
                          value={digit}
                          onChange={e => handleOtpChange(i, e.target.value)}
                          onKeyDown={e => handleOtpKeyDown(i, e)}
                          style={{ fontFamily: 'var(--font-outfit)' }}
                        />
                      ))}
                    </div>

                    {/* Resend Timer */}
                    <div className="text-center mb-5">
                      {resendTimer > 0 ? (
                        <p
                          className="text-xs"
                          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-noto)' }}
                        >
                          कोड दोबारा भेजें{' '}
                          <span style={{ color: 'var(--accent-saffron)', fontWeight: 700 }}>
                            {resendTimer} सेकंड
                          </span>{' '}
                          में
                        </p>
                      ) : (
                        <button
                          onClick={sendOTP}
                          className="text-xs font-bold active:scale-95 transition-transform"
                          style={{ color: 'var(--primary-royal)', fontFamily: 'var(--font-noto)' }}
                        >
                          🔄 कोड दोबारा भेजें
                        </button>
                      )}
                    </div>

                    {error && (
                      <div
                        className="text-xs p-3 rounded-xl mb-4"
                        style={{ background: 'var(--danger-red-light)', color: 'var(--danger-red)', fontFamily: 'var(--font-noto)' }}
                      >
                        ⚠️ {error}
                      </div>
                    )}

                    <button
                      onClick={verifyOTP}
                      disabled={!otpComplete || loading}
                      className="w-full h-12 font-bold rounded-xl disabled:opacity-50 active:scale-[0.98] transition-all text-sm flex items-center justify-center gap-2"
                      style={{
                        background: 'linear-gradient(135deg, var(--primary-navy), var(--primary-royal))',
                        color: 'white',
                        fontFamily: 'var(--font-noto)',
                        boxShadow: 'var(--shadow-soft)',
                      }}
                    >
                      {loading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          पुष्टि हो रही है...
                        </>
                      ) : (
                        <>Login पुष्टि करें <span className="ml-1">✅</span></>
                      )}
                    </button>

                    <button
                      onClick={() => { setStep('email'); setOtp(['','','','','','']); setError(''); }}
                      className="w-full mt-4 text-xs font-bold transition-colors text-center"
                      style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-noto)' }}
                    >
                      ← वापस जाएं (Change Email)
                    </button>
                  </>
                )}
              </div>
            </div>

            <p
              className="text-center text-xs mt-5"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-noto)' }}
            >
              अभी लॉगिन नहीं करना?{' '}
              <button
                onClick={() => router.back()}
                className="font-bold hover:underline active:scale-95 transition-transform"
                style={{ color: 'var(--primary-royal)' }}
              >
                Guest के रूप में जारी रखें →
              </button>
            </p>
          </div>
        </div>

        {/* Right: Side panel (desktop only) */}
        <div
          className="hidden lg:flex flex-1 items-center justify-center p-12 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, var(--primary-navy), var(--primary-royal))',
          }}
        >
          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'radial-gradient(circle at 20% 30%, white 0%, transparent 50%), radial-gradient(circle at 80% 70%, white 0%, transparent 50%)'
          }} />

          <div className="relative z-10 max-w-md text-white">
            <div className="text-7xl mb-6">🔐</div>
            <h2
              className="text-3xl font-extrabold mb-4 leading-tight"
              style={{ fontFamily: 'var(--font-noto)' }}
            >
              AI से सीखें, <br />फॉर्म भरें आसानी से
            </h2>
            <p
              className="text-white/80 text-sm leading-relaxed mb-8"
              style={{ fontFamily: 'var(--font-noto)' }}
            >
              Login करने पर मिलेगा:
            </p>

            <div className="space-y-3">
              {[
                { emoji: '💬', text: 'Unlimited AI chat in Hindi' },
                { emoji: '📚', text: 'Syllabus + PYQ for all exams' },
                { emoji: '❤️', text: 'Save exams for later' },
                { emoji: '📊', text: 'Personal progress dashboard' },
                { emoji: '🔔', text: 'Deadline reminders' },
              ].map((f, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3"
                >
                  <span className="text-xl">{f.emoji}</span>
                  <span
                    className="text-sm font-semibold"
                    style={{ fontFamily: 'var(--font-noto)' }}
                  >
                    {f.text}
                  </span>
                </div>
              ))}
            </div>

            <div
              className="mt-8 pt-6 border-t border-white/20 text-center"
            >
              <p
                className="text-white/60 text-xs"
                style={{ fontFamily: 'var(--font-noto)' }}
              >
                🔒 आपका डेटा पूर्णतः सुरक्षित है
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
