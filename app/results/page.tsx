"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { checkEligibility, getDaysRemaining, getFeeByCategory, type UserProfile, type Exam, type EligibilityResult } from "@/lib/eligibility";
import { supabase } from "@/lib/supabase";
import examsData from "@/data/exams.json";
import AuthPromptModal from "@/components/AuthPromptModal";
import { User } from "@/lib/types";

const TOP_WEBSITES = [
  { name: "RPSC", fullName: "राजस्थान लोक सेवा आयोग", url: "https://rpsc.rajasthan.gov.in", emoji: "🏛️", color: "hsl(222, 47%, 12%)" },
  { name: "RSMSSB", fullName: "राजस्थान कर्मचारी चयन बोर्ड", url: "https://rsmssb.rajasthan.gov.in", emoji: "📋", color: "hsl(217, 91%, 60%)" },
  { name: "SSO Portal", fullName: "Single Sign-On Rajasthan", url: "https://sso.rajasthan.gov.in", emoji: "🔐", color: "hsl(142, 70%, 29%)" },
  { name: "Rajasthan Police", fullName: "राजस्थान पुलिस", url: "https://police.rajasthan.gov.in", emoji: "👮", color: "hsl(0, 70%, 35%)" },
  { name: "BSTC Portal", fullName: "BSTC / Pre D.El.Ed", url: "https://bstcrajasthan.in", emoji: "📚", color: "hsl(280, 60%, 40%)" },
  { name: "Recruitment", fullName: "Rajasthan Recruitment", url: "https://recruitment.rajasthan.gov.in", emoji: "💼", color: "hsl(24, 100%, 50%)" },
  { name: "Jan Suchna", fullName: "जन सूचना पोर्टल", url: "https://jansoochna.rajasthan.gov.in", emoji: "ℹ️", color: "hsl(200, 90%, 35%)" },
];

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[hsl(210,40%,98%)]">
        <p className="text-[hsl(215,16%,55%)] font-noto">लोड हो रहा है...</p>
      </div>
    }>
      <ResultsPageInner />
    </Suspense>
  );
}

function ResultsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [liveProfile, setLiveProfile] = useState<UserProfile | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUser(data.user);
      const stored = localStorage.getItem("userProfile") || sessionStorage.getItem("userProfile");
      if (!stored) {
        router.push("/");
        return;
      }
      const parsed = JSON.parse(stored) as UserProfile;
      setProfile(parsed);
      setLiveProfile(parsed);
    }
    init();
  }, [router]);

  const results = useMemo(() => {
    if (!liveProfile) return [] as EligibilityResult[];
    return checkEligibility(liveProfile, examsData.exams as unknown as Exam[]);
  }, [liveProfile]);

  const filteredResults = useMemo(() => {
    if (!searchQuery) return results;
    const q = searchQuery.toLowerCase();
    return results.filter((r) =>
      (r.name_hindi || r.name || '').toLowerCase().includes(q) ||
      (r.board || '').toLowerCase().includes(q) ||
      (r.short_name || '').toLowerCase().includes(q)
    );
  }, [results, searchQuery]);

  if (!profile || !liveProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(210,40%,98%)]">
        <p className="text-[hsl(215,16%,55%)] font-noto">लोड हो रहा है...</p>
      </div>
    );
  }

  const isGuest = !user;
  const eligibleExams = filteredResults.filter((r) => r.eligible);
  const ineligibleExams = filteredResults.filter((r) => !r.eligible);

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'जल्द घोषित होगा';
    const date = new Date(dateStr);
    return date.toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'open': return { text: '✅ आवेदन खुला', className: 'bg-[hsl(142,70%,95%)] text-[hsl(142,70%,29%)]', borderColor: 'hsl(142, 70%, 45%)' };
      case 'upcoming': return { text: '📅 जल्द आ रहा है', className: 'bg-[hsl(24,100%,97%)] text-[hsl(24,80%,35%)]', borderColor: 'hsl(24, 100%, 50%)' };
      case 'expected': return { text: '🔜 अपेक्षित', className: 'bg-[hsl(217,91%,97%)] text-[hsl(217,91%,45%)]', borderColor: 'hsl(217, 91%, 60%)' };
      default: return { text: '⏳ TBD', className: 'bg-[hsl(210,40%,96%)] text-[hsl(215,16%,35%)]', borderColor: 'hsl(215, 14%, 65%)' };
    }
  };

  const updateLiveProfile = (key: keyof UserProfile, value: any) => {
    setLiveProfile((p) => (p ? { ...p, [key]: value } : p));
  };

  return (
    <main className="min-h-screen bg-[hsl(210,40%,98%)] pb-8 font-noto">
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[hsl(24,100%,50%)] via-white to-[hsl(142,70%,29%)] z-[60]" />

      <header className="bg-[hsl(222,47%,12%)] h-16 px-4 lg:px-10 flex items-center fixed top-1 left-0 right-0 z-50 shadow-lg">
        <div className="flex items-center gap-3 flex-1 max-w-7xl mx-auto w-full">
          <button onClick={() => router.push("/")} className="text-white/90 hover:text-white font-semibold text-sm font-noto flex items-center gap-1">← वापस</button>
          <h1 className="flex-1 text-center text-white text-lg font-bold font-noto">आपके लिए भर्तियाँ</h1>
          {user ? (
            <Link href="/dashboard">
              <div className="w-9 h-9 bg-white/15 rounded-full flex items-center justify-center text-white text-sm font-bold">{user.email?.[0]?.toUpperCase() || '?'}</div>
            </Link>
          ) : (
            <Link href="/auth" className="text-white/90 text-sm border border-white/30 px-3 py-1.5 rounded-full hover:bg-white/10 font-noto">Login</Link>
          )}
        </div>
      </header>

      <div className="pt-20 px-4 lg:px-10 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-[hsl(222,47%,12%)] to-[hsl(217,91%,60%)] rounded-3xl p-5 lg:p-7 mb-6 text-white shadow-elevated relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[hsl(24,100%,50%)]/20 blur-2xl" />
          <div className="relative">
            <h2 className="text-xl lg:text-2xl font-bold font-noto">
              {profile.name ? `नमस्ते ${profile.name}! 🙏` : 'नमस्ते! 🙏'}
            </h2>
            <p className="text-white/85 text-sm mt-1 font-noto">
              आप <span className="text-[hsl(24,100%,65%)] font-bold font-outfit">{eligibleExams.length}</span> भर्तियों के लिए योग्य हैं
              {searchQuery && <span className="ml-1">— "{searchQuery}" के लिए</span>}
            </p>
          </div>
        </div>

        <div className="split-grid">
          <aside className="hidden lg:block lg:sticky lg:top-20 lg:self-start space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-premium border border-[hsl(214,32%,91%)]">
              <h3 className="text-base font-bold text-[hsl(222,47%,12%)] mb-1 font-noto">⚡ त्वरित बदलाव</h3>
              <p className="text-xs text-[hsl(215,16%,55%)] mb-4 font-noto">बदलते ही results update होंगे</p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[hsl(222,47%,12%)] mb-1.5 font-noto">आयु</label>
                  <input
                    type="number"
                    min="14"
                    max="60"
                    value={liveProfile.age}
                    onChange={(e) => updateLiveProfile('age', e.target.value)}
                    className="w-full h-10 border-2 border-[hsl(214,32%,91%)] rounded-lg px-3 text-sm bg-[hsl(210,40%,96%)] focus:bg-white focus:border-[hsl(217,91%,60%)] outline-none font-outfit"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[hsl(222,47%,12%)] mb-1.5 font-noto">शिक्षा</label>
                  <select
                    value={liveProfile.education}
                    onChange={(e) => updateLiveProfile('education', e.target.value)}
                    className="w-full h-10 border-2 border-[hsl(214,32%,91%)] rounded-lg px-3 text-sm bg-[hsl(210,40%,96%)] focus:bg-white focus:border-[hsl(217,91%,60%)] outline-none font-noto"
                  >
                    <option value="8th">8वीं</option>
                    <option value="10th">10वीं</option>
                    <option value="12th">12वीं</option>
                    <option value="graduation">स्नातक</option>
                    <option value="pg">PG</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[hsl(222,47%,12%)] mb-1.5 font-noto">श्रेणी</label>
                  <select
                    value={liveProfile.category}
                    onChange={(e) => updateLiveProfile('category', e.target.value)}
                    className="w-full h-10 border-2 border-[hsl(214,32%,91%)] rounded-lg px-3 text-sm bg-[hsl(210,40%,96%)] focus:bg-white focus:border-[hsl(217,91%,60%)] outline-none font-noto"
                  >
                    <option value="general_ews">General / EWS</option>
                    <option value="obc_sbc">OBC / SBC</option>
                    <option value="sc">SC</option>
                    <option value="st">ST</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[hsl(222,47%,12%)] mb-1.5 font-noto">लिंग</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { v: 'male', l: '👨' },
                      { v: 'female', l: '👩' },
                    ].map((g) => (
                      <button
                        key={g.v}
                        onClick={() => updateLiveProfile('gender', g.v)}
                        className={`h-10 rounded-lg text-sm font-bold font-noto ${liveProfile.gender === g.v ? 'bg-[hsl(217,91%,60%)] text-white' : 'bg-[hsl(210,40%,96%)] text-[hsl(222,47%,12%)]'}`}
                      >
                        {g.l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => router.push('/')}
                className="w-full h-10 mt-4 border-2 border-[hsl(214,32%,91%)] text-[hsl(222,47%,12%)] font-bold rounded-lg text-sm hover:bg-[hsl(210,40%,98%)] font-noto"
              >
                नई जानकारी भरें
              </button>
            </div>
          </aside>

          <div>
            <div className="mb-5">
              <h3 className="text-sm font-bold text-[hsl(222,47%,12%)] mb-2 px-1 font-noto">🌐 आधिकारिक वेबसाइटें</h3>
              <div className="flex gap-3 overflow-x-auto pb-2 scroll-hidden">
                {TOP_WEBSITES.map((site) => (
                  <a
                    key={site.name}
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 bg-white rounded-xl border border-[hsl(214,32%,91%)] p-3 w-28 text-center hover:shadow-elevated hover:border-[hsl(217,91%,60%)]/40 transition-all"
                  >
                    <div className="text-2xl mb-1">{site.emoji}</div>
                    <p className="text-xs font-bold text-[hsl(222,47%,12%)] truncate">{site.name}</p>
                    <p className="text-[10px] text-[hsl(215,16%,55%)] truncate font-noto">{site.fullName}</p>
                  </a>
                ))}
              </div>
            </div>

            {eligibleExams.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center shadow-premium border border-[hsl(214,32%,91%)]">
                <p className="text-5xl mb-4">😔</p>
                <h3 className="text-xl font-bold text-[hsl(222,47%,12%)] mb-2 font-noto">कोई योग्य भर्ती नहीं मिली</h3>
                <p className="text-[hsl(215,16%,55%)] text-sm mb-6 font-noto">आपकी शैक्षणिक योग्यता या आयु के अनुसार कोई भर्ती खुली नहीं है।</p>
                <button onClick={() => router.push("/")} className="text-[hsl(24,100%,45%)] font-bold text-lg font-noto">← नई जानकारी दर्ज करें</button>
              </div>
            ) : (
              <div className="space-y-4 mb-6">
                <h3 className="text-sm font-bold text-[hsl(222,47%,12%)] px-1 font-noto">✅ योग्य भर्तियाँ ({eligibleExams.length})</h3>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {eligibleExams.map((exam, idx) => {
                    const daysLeft = getDaysRemaining(exam.last_date);
                    const fee = getFeeByCategory(exam, liveProfile.category);
                    const isUrgent = daysLeft > 0 && daysLeft <= 7;
                    const status = getStatusInfo(exam.status);
                    const isLocked = isGuest && idx > 0;
                    const totalDays = 30;
                    const progressPct = daysLeft > 0 ? Math.min(100, Math.max(0, (daysLeft / totalDays) * 100)) : 0;

                    return (
                      <div key={exam.id} className="relative">
                        {isLocked && (
                          <div className="absolute inset-0 z-10 bg-white/75 backdrop-blur-[3px] rounded-2xl flex flex-col items-center justify-center">
                            <p className="text-2xl mb-2">🔒</p>
                            <p className="text-sm font-bold text-[hsl(222,47%,12%)] mb-3 font-noto">Login करें — बाकी भर्तियाँ देखें</p>
                            <button onClick={() => setShowAuthModal(true)} className="bg-[hsl(24,100%,50%)] text-white text-sm font-bold px-5 py-2 rounded-xl font-noto">Login / Sign Up →</button>
                          </div>
                        )}

                        <div
                          className="bg-white rounded-2xl p-5 shadow-premium border border-[hsl(214,32%,91%)] relative overflow-hidden hover:shadow-elevated transition-all"
                          style={{ borderLeftWidth: '6px', borderLeftColor: status.borderColor }}
                        >
                          <div className="flex justify-between items-start mb-3 gap-3">
                            <div className="min-w-0">
                              <p className="text-[10px] text-[hsl(215,16%,55%)] font-bold uppercase tracking-wider mb-1 font-outfit">{exam.board}</p>
                              <h3 className="text-base lg:text-lg font-bold text-[hsl(222,47%,12%)] font-noto leading-tight">
                                {exam.name_hindi || exam.short_name || exam.name}
                              </h3>
                            </div>
                            <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold flex-shrink-0 font-noto ${status.className}`}>{status.text}</span>
                          </div>

                          {exam.last_date && (
                            <div className="mb-3">
                              <div className="flex justify-between items-center text-[10px] font-bold mb-1 font-noto">
                                <span className={isUrgent ? 'text-[hsl(0,84%,50%)]' : 'text-[hsl(215,16%,55%)]'}>
                                  {isUrgent ? `🔴 ${daysLeft} दिन शेष!` : `आवेदन बंद होने में ${daysLeft} दिन`}
                                </span>
                                <span className="text-[hsl(215,16%,55%)] font-outfit">{formatDate(exam.last_date)}</span>
                              </div>
                              <div className="h-1.5 rounded-full bg-[hsl(210,40%,96%)] overflow-hidden">
                                <div
                                  className="h-full transition-all rounded-full"
                                  style={{ width: `${progressPct}%`, background: isUrgent ? 'hsl(0, 84%, 50%)' : 'hsl(24, 100%, 50%)' }}
                                />
                              </div>
                            </div>
                          )}

                          {exam.reasons_eligible.length > 0 && (
                            <div className="space-y-1 mb-2">
                              {exam.reasons_eligible.slice(0, 2).map((r, ri) => (
                                <span key={ri} className="inline-block bg-[hsl(142,70%,95%)] text-[hsl(142,70%,29%)] text-[10px] px-2 py-1 rounded-md mr-1 mb-1 font-medium font-noto">{r}</span>
                              ))}
                            </div>
                          )}
                          {exam.warnings.length > 0 && (
                            <div className="space-y-1 mb-3">
                              {exam.warnings.slice(0, 1).map((w, wi) => (
                                <span key={wi} className="inline-block bg-[hsl(48,100%,96%)] text-[hsl(28,80%,35%)] text-[10px] px-2 py-1 rounded-md font-medium font-noto">{w}</span>
                              ))}
                            </div>
                          )}

                          <div className="flex flex-wrap gap-1.5 mb-4">
                            <span className="bg-[hsl(210,40%,96%)] text-[hsl(222,47%,12%)] text-[10px] px-2.5 py-1.5 rounded-full font-bold font-noto">💰 ₹{fee}</span>
                            <span className="bg-[hsl(210,40%,96%)] text-[hsl(222,47%,12%)] text-[10px] px-2.5 py-1.5 rounded-full font-bold font-noto">👤 {exam.eligibility.min_age}-{exam.effective_max_age || exam.eligibility.max_age} साल</span>
                          </div>

                          <p className="text-[10px] text-[hsl(215,16%,55%)] mb-3 italic font-noto">
                            ⚠️ {exam.last_verified} को verify • Apply से पहले official site देखें
                          </p>

                          <button
                            onClick={() => router.push(`/exam/${exam.id}`)}
                            className="w-full h-11 bg-gradient-to-r from-[hsl(24,100%,50%)] to-[hsl(24,100%,43%)] text-white font-bold rounded-xl active:scale-[0.99] transition-transform shadow-soft text-sm font-noto"
                          >
                            💬 चैट करें और तैयारी शुरू करें →
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {ineligibleExams.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-[hsl(215,16%,55%)] px-1 mb-2 font-noto">❌ अयोग्य भर्तियाँ ({ineligibleExams.length})</h3>
                <div className="bg-white/60 rounded-xl p-3 space-y-2">
                  {ineligibleExams.map((exam) => (
                    <div key={exam.id} className="flex justify-between items-center text-xs">
                      <span className="text-[hsl(215,16%,35%)] font-noto">{exam.short_name || exam.name}</span>
                      <span className="text-[hsl(0,84%,45%)] font-noto">{exam.reasons_ineligible[0]?.substring(0, 40)}...</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="lg:hidden mb-6 bg-white rounded-2xl p-4 shadow-premium border border-[hsl(214,32%,91%)]">
              <h3 className="text-sm font-bold text-[hsl(222,47%,12%)] mb-3 font-noto">⚡ जानकारी बदलें</h3>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  value={liveProfile.age}
                  onChange={(e) => updateLiveProfile('age', e.target.value)}
                  className="h-10 border-2 border-[hsl(214,32%,91%)] rounded-lg px-2 text-sm bg-[hsl(210,40%,96%)] focus:bg-white focus:border-[hsl(217,91%,60%)] outline-none text-center font-outfit"
                />
                <select
                  value={liveProfile.education}
                  onChange={(e) => updateLiveProfile('education', e.target.value)}
                  className="h-10 border-2 border-[hsl(214,32%,91%)] rounded-lg px-2 text-xs bg-[hsl(210,40%,96%)] focus:bg-white focus:border-[hsl(217,91%,60%)] outline-none font-noto"
                >
                  <option value="8th">8वीं</option>
                  <option value="10th">10वीं</option>
                  <option value="12th">12वीं</option>
                  <option value="graduation">स्नातक</option>
                  <option value="pg">PG</option>
                </select>
                <select
                  value={liveProfile.category}
                  onChange={(e) => updateLiveProfile('category', e.target.value)}
                  className="h-10 border-2 border-[hsl(214,32%,91%)] rounded-lg px-2 text-xs bg-[hsl(210,40%,96%)] focus:bg-white focus:border-[hsl(217,91%,60%)] outline-none font-noto"
                >
                  <option value="general_ews">Gen/EWS</option>
                  <option value="obc_sbc">OBC</option>
                  <option value="sc">SC</option>
                  <option value="st">ST</option>
                </select>
              </div>
            </div>

            <p className="text-center text-[hsl(215,16%,55%)] text-xs px-4 mt-6 font-noto">
              Last Updated: {new Date().toLocaleDateString('hi-IN')}
            </p>
          </div>
        </div>
      </div>

      {showAuthModal && <AuthPromptModal onClose={() => setShowAuthModal(false)} reason="message_limit" />}
    </main>
  );
}
