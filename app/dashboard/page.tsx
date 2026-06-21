"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { User, Profile, SavedExam, ChatMessage } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [savedExams, setSavedExams] = useState<SavedExam[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth'); return; }
      setUser(user);

      const { data: prof } = await supabase.from('user_profiles').select('*').eq('id', user.id).single();
      setProfile(prof as Profile);

      const { data: saved } = await supabase.from('saved_exams').select('*').eq('user_id', user.id).order('saved_at', { ascending: false });
      setSavedExams((saved || []) as SavedExam[]);

      const { data: chats } = await supabase.from('chat_messages').select('*').eq('user_id', user.id).eq('role', 'user').order('created_at', { ascending: false }).limit(5);
      setChatHistory((chats || []) as ChatMessage[]);

      setLoading(false);
    }
    loadData();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    localStorage.clear();
    sessionStorage.clear();
    router.push('/');
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-app)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: 'var(--accent-saffron)', borderTopColor: 'transparent' }} />
          <p className="font-medium" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-noto)' }}>लोड हो रहा है...</p>
        </div>
      </div>
    );
  }

  const isPaid = profile?.is_paid;
  const msgUsed = profile?.ai_messages_used || 0;
  const msgLimit = isPaid ? '∞' : 5;
  const msgLimitNum = isPaid ? 100 : 5; // for percentage calc
  const percentage = isPaid ? 100 : Math.min((msgUsed / msgLimitNum) * 100, 100);
  const circumference = 2 * Math.PI * 56;
  const offset = circumference - (percentage / 100) * circumference;

  // Saved exam status color helper
  const statusColor = (status: string) => {
    if (status === 'open') return 'var(--success-green)';
    if (status === 'upcoming') return 'var(--accent-saffron)';
    if (status === 'closed') return 'var(--danger-red)';
    return 'var(--text-muted)';
  };

  return (
    <main className="min-h-screen pb-12 relative overflow-hidden" style={{ background: 'var(--bg-app)' }}>
      {/* Decorative background glows */}
      <div className="absolute w-96 h-96 rounded-full blur-3xl -top-20 -left-20 pointer-events-none"
        style={{ background: 'hsl(24, 100%, 50%, 0.06)' }} />
      <div className="absolute w-96 h-96 rounded-full blur-3xl top-1/2 right-0 pointer-events-none"
        style={{ background: 'hsl(217, 91%, 60%, 0.08)' }} />

      {/* Tiranga stripe */}
      <div className="tiranga-stripe fixed top-0 left-0 right-0 z-50" />

      {/* Header */}
      <div
        className="fixed top-1 w-full z-40 h-16 px-4 flex items-center justify-between border-b rounded-b-xl"
        style={{
          background: 'linear-gradient(135deg, var(--primary-navy), var(--primary-royal))',
          borderColor: 'rgba(255,255,255,0.1)',
          boxShadow: 'var(--shadow-premium)',
        }}
      >
        <button
          onClick={() => router.push("/results")}
          className="text-white/90 hover:text-white flex items-center gap-1 text-sm font-semibold px-3 py-1.5 rounded-full border border-white/20 hover:bg-white/15 transition-all active:scale-95"
          style={{ fontFamily: 'var(--font-noto)' }}
        >
          ← वापस
        </button>
        <h1 className="text-white text-base md:text-lg font-bold" style={{ fontFamily: 'var(--font-noto)' }}>
          Dashboard
        </h1>
        <button
          onClick={handleLogout}
          className="text-white/80 hover:text-white text-xs font-semibold px-3.5 py-1.5 rounded-full border border-white/20 hover:bg-white/15 transition-all active:scale-95"
          style={{ fontFamily: 'var(--font-noto)' }}
        >
          Logout
        </button>
      </div>

      <div className="pt-20 px-4 max-w-xl mx-auto relative z-10 space-y-6">
        {/* Greeting */}
        <div
          className="rounded-2xl p-6 text-white animate-slide-up relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, var(--primary-navy) 0%, var(--primary-royal) 100%)',
            boxShadow: 'var(--shadow-elevated)',
          }}
        >
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-10" style={{ background: 'var(--accent-saffron)' }} />
          <h2 className="text-lg font-bold" style={{ fontFamily: 'var(--font-noto)' }}>
            नमस्ते {profile?.name || user?.email?.split('@')[0]}! 🙏
          </h2>
          <p className="text-white/70 text-xs mt-1 font-medium" style={{ fontFamily: 'var(--font-noto)' }}>
            {user?.email}
          </p>
        </div>

        {/* Circular Progress + Stats */}
        <div
          className="rounded-2xl p-6 animate-slide-up flex items-center gap-6"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
            boxShadow: 'var(--shadow-premium)',
            animationDelay: '100ms',
          }}
        >
          <div className="relative w-32 h-32 flex-shrink-0">
            <svg width="128" height="128" viewBox="0 0 128 128" className="circular-progress">
              <circle cx="64" cy="64" r="56" fill="none" stroke="var(--border-card)" strokeWidth="10" />
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke={isPaid ? 'var(--accent-saffron)' : 'var(--primary-royal)'}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-outfit)' }}>
                {msgUsed}
              </p>
              <p className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                / {msgLimit}
              </p>
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-noto)' }}>
              AI Messages
            </p>
            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-noto)' }}>
              {isPaid ? 'Unlimited access 💎' : `${msgLimitNum - msgUsed} सवाल बाकी हैं`}
            </p>
            {!isPaid && msgUsed >= 3 && (
              <Link
                href="/payment"
                className="inline-block text-xs font-bold px-3 py-1.5 rounded-lg active:scale-95 transition-all"
                style={{
                  background: 'var(--accent-saffron-light)',
                  color: 'var(--accent-saffron-hover)',
                  fontFamily: 'var(--font-noto)',
                }}
              >
                Upgrade →
              </Link>
            )}
          </div>
        </div>

        {/* Saved Exams Timeline */}
        <div className="space-y-3 animate-slide-up" style={{ animationDelay: '150ms' }}>
          <div className="flex items-center justify-between px-1">
            <h3
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-noto)' }}
            >
              ❤️ Saved Exams ({savedExams.length})
            </h3>
          </div>

          {savedExams.length === 0 ? (
            <div
              className="rounded-2xl p-8 text-center"
              style={{
                background: 'var(--bg-card)',
                border: '1px dashed var(--border-card)',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-noto)',
                fontSize: '12px',
              }}
            >
              <p className="text-2xl mb-2">📌</p>
              अभी कोई exam save नहीं किया।
              <br />
              Results page पर जाकर save करें।
            </div>
          ) : (
            <div
              className="rounded-2xl p-5 relative"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-card)',
                boxShadow: 'var(--shadow-soft)',
              }}
            >
              {/* Vertical timeline line */}
              <div
                className="absolute left-9 top-8 bottom-8 w-0.5"
                style={{ background: 'var(--border-card)' }}
              />

              <div className="space-y-5">
                {savedExams.map((se) => (
                  <Link
                    key={se.id}
                    href={`/exam/${se.exam_id}`}
                    className="flex items-start gap-4 group active:scale-[0.99] transition-all"
                  >
                    <div
                      className="w-5 h-5 rounded-full flex-shrink-0 mt-0.5 relative z-10"
                      style={{
                        background: statusColor('open'),
                        boxShadow: `0 0 0 4px var(--bg-card), 0 0 0 5px ${statusColor('open')}`,
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-bold text-sm group-hover:underline"
                        style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-noto)' }}
                      >
                        {se.exam_id.replace(/-/g, ' ').toUpperCase()}
                      </p>
                      <p
                        className="text-[10px] mt-0.5"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        Saved: {new Date(se.saved_at).toLocaleDateString('hi-IN')}
                      </p>
                    </div>
                    <span style={{ color: 'var(--accent-saffron)' }}>→</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recent Conversations */}
        {chatHistory.length > 0 && (
          <div className="space-y-3 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <h3
              className="text-xs font-bold uppercase tracking-wider px-1"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-noto)' }}
            >
              💬 Recent Conversations
            </h3>
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-card)',
                boxShadow: 'var(--shadow-soft)',
              }}
            >
              {chatHistory.map((ch, idx) => (
                <Link
                  key={ch.id}
                  href={`/exam/${ch.exam_id}`}
                  className="block p-4 transition-all active:scale-[0.99]"
                  style={{
                    borderTop: idx > 0 ? '1px solid var(--border-card)' : 'none',
                  }}
                >
                  <div className="flex justify-between items-center">
                    <p
                      className="text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {ch.exam_id.replace(/-/g, ' ')}
                    </p>
                    <p className="text-[10px]" style={{ color: 'var(--text-placeholder)' }}>
                      {new Date(ch.created_at).toLocaleDateString('hi-IN')}
                    </p>
                  </div>
                  <p
                    className="text-xs mt-1.5 truncate font-semibold"
                    style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-noto)' }}
                  >
                    {ch.content}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Premium Membership Banner */}
        {!isPaid ? (
          <div
            className="rounded-2xl p-6 text-center text-white relative overflow-hidden animate-slide-up"
            style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF6B00 100%)',
              boxShadow: '0 20px 40px -10px hsla(24, 100%, 50%, 0.3)',
              animationDelay: '250ms',
            }}
          >
            {/* Metallic shine */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background: 'linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.6) 50%, transparent 70%)',
                animation: 'marquee 4s linear infinite',
              }}
            />
            <div className="relative z-10">
              <div className="text-4xl mb-2">💎</div>
              <p
                className="text-lg font-extrabold mb-1"
                style={{ fontFamily: 'var(--font-noto)' }}
              >
                Premium Membership
              </p>
              <p
                className="text-white/90 text-xs mb-4"
                style={{ fontFamily: 'var(--font-noto)' }}
              >
                ₹30 में Unlimited AI + Study Material
              </p>
              <Link
                href="/payment"
                className="inline-block bg-white font-extrabold px-6 py-3 rounded-xl hover:bg-gray-50 active:scale-95 transition-all text-xs uppercase tracking-wider"
                style={{
                  color: 'var(--accent-saffron-hover)',
                  fontFamily: 'var(--font-noto)',
                  boxShadow: 'var(--shadow-elevated)',
                }}
              >
                Upgrade करें →
              </Link>
            </div>
          </div>
        ) : (
          <div
            className="rounded-2xl p-6 text-center text-white animate-slide-up"
            style={{
              background: 'linear-gradient(135deg, var(--success-green) 0%, hsl(142, 70%, 22%) 100%)',
              boxShadow: '0 20px 40px -10px hsla(142, 70%, 29%, 0.3)',
            }}
          >
            <div className="text-4xl mb-2">💎</div>
            <p className="text-lg font-extrabold mb-1" style={{ fontFamily: 'var(--font-noto)' }}>
              Premium Active
            </p>
            <p className="text-white/90 text-xs" style={{ fontFamily: 'var(--font-noto)' }}>
              Unlimited access • सभी exams unlocked
            </p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 pt-2 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <Link
            href="/results"
            className="rounded-2xl p-4 text-center transition-all active:scale-95 hover:shadow-md"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
            }}
          >
            <p className="text-2xl mb-1">🔍</p>
            <p
              className="text-xs font-bold"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-noto)' }}
            >
              भर्तियाँ खोजें
            </p>
          </Link>
          <Link
            href="/"
            className="rounded-2xl p-4 text-center transition-all active:scale-95 hover:shadow-md"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
            }}
          >
            <p className="text-2xl mb-1">📝</p>
            <p
              className="text-xs font-bold"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-noto)' }}
            >
              Profile बदलें
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
