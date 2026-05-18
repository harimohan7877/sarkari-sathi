"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [savedExams, setSavedExams] = useState<any[]>([]);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth'); return; }
      setUser(user);

      const { data: prof } = await supabase.from('user_profiles').select('*').eq('id', user.id).single();
      setProfile(prof);

      const { data: saved } = await supabase.from('saved_exams').select('*').eq('user_id', user.id).order('saved_at', { ascending: false });
      setSavedExams(saved || []);

      const { data: chats } = await supabase.from('chat_messages').select('*').eq('user_id', user.id).eq('role', 'user').order('created_at', { ascending: false }).limit(5);
      setChatHistory(chats || []);

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
        <p className="text-gray-500" style={{ fontFamily: "var(--font-noto)" }}>लोड हो रहा है...</p>
      </div>
    );
  }

  const isPaid = profile?.is_paid;
  const msgUsed = profile?.ai_messages_used || 0;

  return (
    <main className="min-h-screen bg-[#EEF2F8] pb-8">
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF6B00] via-white to-[#138808] z-[60]" />

      <div className="bg-[#0F2B5B] h-14 px-4 flex items-center fixed top-1 w-full z-50 shadow-lg">
        <button onClick={() => router.push("/results")} className="text-white font-semibold" style={{ fontFamily: "var(--font-noto)" }}>← वापस</button>
        <div className="flex-1 text-center">
          <h1 className="text-white text-lg font-bold" style={{ fontFamily: "var(--font-noto)" }}>Dashboard</h1>
        </div>
        <button onClick={handleLogout} className="text-white/80 text-sm" style={{ fontFamily: "var(--font-noto)" }}>Logout</button>
      </div>

      <div className="pt-20 px-4 max-w-2xl mx-auto">
        {/* Greeting */}
        <div className="bg-gradient-to-r from-[#0F2B5B] to-[#1847A6] rounded-2xl p-5 mb-5 text-white">
          <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-noto)" }}>
            नमस्ते {profile?.name || user?.email?.split('@')[0]}! 👋
          </h2>
          <p className="text-white/80 text-sm mt-1" style={{ fontFamily: "var(--font-noto)" }}>
            {user?.email}
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <p className="text-2xl font-black text-[#0F2B5B]">{msgUsed}</p>
            <p className="text-[10px] text-gray-400" style={{ fontFamily: "var(--font-noto)" }}>AI सवाल</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <p className="text-2xl font-black text-[#0F2B5B]">{savedExams.length}</p>
            <p className="text-[10px] text-gray-400" style={{ fontFamily: "var(--font-noto)" }}>Saved Exams</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <p className="text-lg font-black text-[#0F2B5B]">{isPaid ? '💎' : '🆓'}</p>
            <p className="text-[10px] text-gray-400" style={{ fontFamily: "var(--font-noto)" }}>{isPaid ? 'Paid' : 'Free'}</p>
          </div>
        </div>

        {/* Saved Exams */}
        <div className="mb-5">
          <h3 className="text-sm font-bold text-[#0F2B5B] mb-2 px-1" style={{ fontFamily: "var(--font-noto)" }}>
            ❤️ Saved Exams
          </h3>
          {savedExams.length === 0 ? (
            <div className="bg-white rounded-xl p-4 text-center text-gray-400 text-sm" style={{ fontFamily: "var(--font-noto)" }}>
              कोई exam save नहीं किया। Results page पर जाकर save करें।
            </div>
          ) : (
            <div className="space-y-2">
              {savedExams.map(se => (
                <Link key={se.id} href={`/exam/${se.exam_id}`} className="block bg-white rounded-xl p-3 hover:shadow-md transition-all">
                  <p className="font-bold text-sm text-[#0F2B5B]">{se.exam_id}</p>
                  <p className="text-xs text-gray-400">Saved: {new Date(se.saved_at).toLocaleDateString('hi-IN')}</p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Chat History */}
        <div className="mb-5">
          <h3 className="text-sm font-bold text-[#0F2B5B] mb-2 px-1" style={{ fontFamily: "var(--font-noto)" }}>
            💬 Recent Conversations
          </h3>
          {chatHistory.length === 0 ? (
            <div className="bg-white rounded-xl p-4 text-center text-gray-400 text-sm" style={{ fontFamily: "var(--font-noto)" }}>
              कोई chat history नहीं। किसी exam के बारे में AI से chat करें।
            </div>
          ) : (
            <div className="space-y-2">
              {chatHistory.map(ch => (
                <Link key={ch.id} href={`/exam/${ch.exam_id}`} className="block bg-white rounded-xl p-3 hover:shadow-md transition-all">
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-400">{ch.exam_id}</p>
                    <p className="text-[10px] text-gray-300">{new Date(ch.created_at).toLocaleDateString('hi-IN')}</p>
                  </div>
                  <p className="text-sm text-[#0D1B2A] mt-1 truncate" style={{ fontFamily: "var(--font-noto)" }}>
                    {ch.content.substring(0, 60)}...
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Upgrade CTA */}
        {!isPaid && (
          <div className="bg-gradient-to-r from-[#FF6B00] to-[#E55A00] rounded-2xl p-5 text-white text-center">
            <p className="text-lg font-bold mb-1" style={{ fontFamily: "var(--font-noto)" }}>
              ₹30 में Unlimited Access पाएं 💎
            </p>
            <p className="text-white/80 text-sm mb-3" style={{ fontFamily: "var(--font-noto)" }}>
              Unlimited AI + Complete Study Material + PYQ
            </p>
            <Link href="/payment" className="inline-block bg-white text-[#FF6B00] font-bold px-6 py-2.5 rounded-xl hover:bg-gray-100" style={{ fontFamily: "var(--font-noto)" }}>
              Upgrade करें →
            </Link>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Link href="/results" className="bg-white rounded-xl p-4 text-center hover:shadow-md transition-all">
            <p className="text-2xl mb-1">🔍</p>
            <p className="text-sm font-bold text-[#0F2B5B]" style={{ fontFamily: "var(--font-noto)" }}>भर्तियाँ खोजें</p>
          </Link>
          <Link href="/" className="bg-white rounded-xl p-4 text-center hover:shadow-md transition-all">
            <p className="text-2xl mb-1">📝</p>
            <p className="text-sm font-bold text-[#0F2B5B]" style={{ fontFamily: "var(--font-noto)" }}>Profile बदलें</p>
          </Link>
        </div>
      </div>
    </main>
  );
}
