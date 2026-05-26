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
      <div className="min-h-screen flex items-center justify-center bg-[#EEF2F8]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-t-orange-500 border-r-transparent border-b-blue-900 border-l-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium" style={{ fontFamily: "var(--font-noto)" }}>लोड हो रहा है...</p>
        </div>
      </div>
    );
  }

  const isPaid = profile?.is_paid;
  const msgUsed = profile?.ai_messages_used || 0;

  return (
    <main className="min-h-screen bg-[#EEF2F8] pb-12 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute w-96 h-96 rounded-full bg-orange-500/5 blur-3xl -top-20 -left-20 pointer-events-none" />
      <div className="absolute w-96 h-96 rounded-full bg-blue-500/5 blur-3xl top-1/2 right-0 pointer-events-none" />

      {/* Tiranga stripe */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF6B00] via-white to-[#138808] z-[60]" />

      {/* Header */}
      <div className="bg-gradient-to-r from-[#0F2B5B] to-[#1847A6] h-16 px-4 flex items-center justify-between fixed top-1 w-full z-50 shadow-md border-b border-white/10 rounded-b-xl">
        <button 
          onClick={() => router.push("/results")} 
          className="text-white/90 hover:text-white flex items-center gap-1 text-sm font-semibold bg-white/10 px-3 py-1.5 rounded-full border border-white/10 transition-all hover:bg-white/20 active:scale-95" 
          style={{ fontFamily: "var(--font-noto)" }}
        >
          ← वापस
        </button>
        <div className="text-center">
          <h1 className="text-white text-base md:text-lg font-bold" style={{ fontFamily: "var(--font-noto)" }}>Dashboard</h1>
        </div>
        <button 
          onClick={handleLogout} 
          className="text-white/80 hover:text-white text-xs font-semibold bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-full border border-white/10 transition-all active:scale-95" 
          style={{ fontFamily: "var(--font-noto)" }}
        >
          Logout
        </button>
      </div>

      <div className="pt-20 px-4 max-w-xl mx-auto relative z-10 space-y-6">
        {/* Profile Card */}
        <div className="bg-gradient-to-br from-[#0f2b5b] via-[#143770] to-[#1847a6] rounded-2xl p-6 text-white shadow-xl shadow-blue-900/10 border border-white/5 animate-slide-up">
          <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-noto)" }}>
            नमस्ते {profile?.name || user?.email?.split('@')[0]}! 🙏
          </h2>
          <p className="text-white/70 text-xs mt-1 font-medium" style={{ fontFamily: "var(--font-noto)" }}>
            {user?.email}
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="bg-white rounded-2xl p-4 text-center shadow-md border border-[#C5D0E0]/60 relative overflow-hidden">
            <div className="absolute left-0 right-0 top-0 h-1 bg-[#1847A6]" />
            <p className="text-2xl font-black text-[#0F2B5B]">{msgUsed}</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1" style={{ fontFamily: "var(--font-noto)" }}>AI सवाल</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-md border border-[#C5D0E0]/60 relative overflow-hidden">
            <div className="absolute left-0 right-0 top-0 h-1 bg-[#FF6B00]" />
            <p className="text-2xl font-black text-[#0F2B5B]">{savedExams.length}</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1" style={{ fontFamily: "var(--font-noto)" }}>Saved Exams</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-md border border-[#C5D0E0]/60 relative overflow-hidden">
            <div className="absolute left-0 right-0 top-0 h-1 bg-green-500" />
            <p className="text-2xl font-black text-[#0F2B5B]">{isPaid ? '💎' : '🆓'}</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1" style={{ fontFamily: "var(--font-noto)" }}>{isPaid ? 'Premium' : 'Free'}</p>
          </div>
        </div>

        {/* Saved Exams */}
        <div className="space-y-2 animate-slide-up" style={{ animationDelay: '150ms' }}>
          <h3 className="text-xs font-bold text-[#0F2B5B] uppercase tracking-wider px-1" style={{ fontFamily: "var(--font-noto)" }}>
            ❤️ Saved Exams
          </h3>
          {savedExams.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center text-gray-400 text-xs border border-[#C5D0E0]/60 shadow-sm leading-relaxed" style={{ fontFamily: "var(--font-noto)" }}>
              कोई exam save नहीं किया। Results page पर जाकर save करें।
            </div>
          ) : (
            <div className="space-y-2">
              {savedExams.map(se => (
                <Link key={se.id} href={`/exam/${se.exam_id}`} className="block bg-white rounded-2xl p-4 border border-[#C5D0E0]/60 hover:border-blue-200 hover:shadow-md transition-all active:scale-99">
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-sm text-[#0F2B5B]">{se.exam_id.replace(/-/g, ' ').toUpperCase()}</p>
                    <span className="text-[#FF6B00] text-sm">→</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 font-medium">Saved: {new Date(se.saved_at).toLocaleDateString('hi-IN')}</p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Chat History */}
        <div className="space-y-2 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <h3 className="text-xs font-bold text-[#0F2B5B] uppercase tracking-wider px-1" style={{ fontFamily: "var(--font-noto)" }}>
            💬 Recent Conversations
          </h3>
          {chatHistory.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center text-gray-400 text-xs border border-[#C5D0E0]/60 shadow-sm leading-relaxed" style={{ fontFamily: "var(--font-noto)" }}>
              कोई chat history नहीं। किसी exam के बारे में AI से chat करें।
            </div>
          ) : (
            <div className="space-y-2">
              {chatHistory.map(ch => (
                <Link key={ch.id} href={`/exam/${ch.exam_id}`} className="block bg-white rounded-2xl p-4 border border-[#C5D0E0]/60 hover:border-blue-200 hover:shadow-md transition-all active:scale-99">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{ch.exam_id.replace(/-/g, ' ')}</p>
                    <p className="text-[9px] text-gray-300 font-semibold">{new Date(ch.created_at).toLocaleDateString('hi-IN')}</p>
                  </div>
                  <p className="text-xs text-gray-700 mt-1.5 truncate font-semibold" style={{ fontFamily: "var(--font-noto)" }}>
                    {ch.content}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Upgrade CTA */}
        {!isPaid && (
          <div className="bg-gradient-to-br from-[#FF6B00] via-[#E55A00] to-[#cc5000] rounded-2xl p-6 text-white text-center shadow-xl shadow-orange-500/10 border border-white/5 animate-slide-up" style={{ animationDelay: '250ms' }}>
            <p className="text-lg font-bold mb-1" style={{ fontFamily: "var(--font-noto)" }}>
              ₹30 में Unlimited Access पाएं 💎
            </p>
            <p className="text-white/80 text-xs mb-4" style={{ fontFamily: "var(--font-noto)" }}>
              Unlimited AI + Complete Study Material + PYQ
            </p>
            <Link href="/payment" className="inline-block bg-white text-[#FF6B00] font-extrabold px-6 py-3 rounded-xl hover:bg-gray-100 active:scale-95 transition-all shadow-md text-xs uppercase tracking-wider" style={{ fontFamily: "var(--font-noto)" }}>
              Upgrade करें →
            </Link>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 pt-2 animate-slide-up animate-delay-300">
          <Link href="/results" className="bg-white rounded-2xl p-4 text-center border border-[#C5D0E0]/60 hover:border-blue-250 hover:shadow-md transition-all active:scale-95">
            <p className="text-2xl mb-1">🔍</p>
            <p className="text-xs font-bold text-[#0F2B5B]" style={{ fontFamily: "var(--font-noto)" }}>भर्तियाँ खोजें</p>
          </Link>
          <Link href="/" className="bg-white rounded-2xl p-4 text-center border border-[#C5D0E0]/60 hover:border-blue-250 hover:shadow-md transition-all active:scale-95">
            <p className="text-2xl mb-1">📝</p>
            <p className="text-xs font-bold text-[#0F2B5B]" style={{ fontFamily: "var(--font-noto)" }}>Profile बदलें</p>
          </Link>
        </div>
      </div>
    </main>
  );
}
