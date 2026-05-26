"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { checkEligibility, getDaysRemaining, getFeeByCategory, type UserProfile, type Exam, type EligibilityResult } from "@/lib/eligibility";
import { supabase } from "@/lib/supabase";
import examsData from "@/data/exams.json";
import AuthPromptModal from "@/components/AuthPromptModal";
import { User } from "@/lib/types";

interface Course {
  type: 'youtube' | 'website';
  name: string;
  description: string;
  url: string;
  badge: string;
  badgeColor: string;
  subscribers?: string;
  examId?: string;
  examName?: string;
}

const TOP_WEBSITES = [
  { name: "RPSC", fullName: "राजस्थान लोक सेवा आयोग", url: "https://rpsc.rajasthan.gov.in", emoji: "🏛️", color: "#0F2B5B" },
  { name: "RSMSSB", fullName: "राजस्थान कर्मचारी चयन बोर्ड", url: "https://rsmssb.rajasthan.gov.in", emoji: "📋", color: "#1847A6" },
  { name: "SSO Portal", fullName: "Single Sign-On Rajasthan", url: "https://sso.rajasthan.gov.in", emoji: "🔐", color: "#138808" },
  { name: "Rajasthan Police", fullName: "राजस्थान पुलिस", url: "https://police.rajasthan.gov.in", emoji: "👮", color: "#8B0000" },
  { name: "BSTC Portal", fullName: "BSTC / Pre D.El.Ed", url: "https://bstcrajasthan.in", emoji: "📚", color: "#6B21A8" },
  { name: "Recruitment", fullName: "Rajasthan Recruitment", url: "https://recruitment.rajasthan.gov.in", emoji: "💼", color: "#FF6B00" },
  { name: "Jan Suchna", fullName: "जन सूचना पोर्टल", url: "https://jansoochna.rajasthan.gov.in", emoji: "ℹ️", color: "#0369A1" },
];

const COURSES_BY_EXAM: Record<string, Course[]> = {
  'rsmssb-patwari-2026': [
    { type: 'youtube', name: 'KGS Rajasthan Exams — पटवारी Complete', description: 'Daily live classes, mock tests', url: 'https://www.youtube.com/@KGSRajasthanExams', badge: '🆓 FREE', badgeColor: 'green', subscribers: '5 lakh+' },
    { type: 'youtube', name: 'Utkarsh Classes — Revenue Law & Raj GK', description: 'Subhash Charan Sir — Rajasthan ka best', url: 'https://www.youtube.com/@UtkarshClasses', badge: '🆓 FREE', badgeColor: 'green', subscribers: '50 lakh+' },
    { type: 'website', name: 'Adda247 — Patwari PYQ Papers', description: 'Free PDF download', url: 'https://www.adda247.com/exams/rajasthan/rajasthan-patwari-previous-year-paper/', badge: '📄 FREE PDF', badgeColor: 'blue' },
    { type: 'website', name: 'ToppersExam — Free Mock Test', description: 'Online mock test practice', url: 'https://toppersexam.com/state-level-exams/rajasthan-patwari-question-paper', badge: '🧪 Mock Test', badgeColor: 'purple' },
  ],
  'rpsc-ras-2026': [
    { type: 'youtube', name: 'Study IQ — Current Affairs & GS', description: 'Daily current affairs — 13M subscribers', url: 'https://www.youtube.com/@StudyIQ', badge: '🆓 FREE', badgeColor: 'green', subscribers: '1.3 crore+' },
    { type: 'youtube', name: 'Utkarsh Classes — Rajasthan GK', description: 'RAS ke liye best Rajasthan History', url: 'https://www.youtube.com/@UtkarshClasses', badge: '🆓 FREE', badgeColor: 'green', subscribers: '50 lakh+' },
    { type: 'website', name: 'RPSC Official — Previous Papers', description: 'RPSC official website par free papers', url: 'https://rpsc.rajasthan.gov.in/previousquestionpapers.aspx', badge: '🏛️ Official', badgeColor: 'navy' },
  ],
  'rsmssb-ldc-2026': [
    { type: 'youtube', name: 'KGS Rajasthan Exams — LDC Complete', description: 'LDC full syllabus, typing tips', url: 'https://www.youtube.com/@KGSRajasthanExams', badge: '🆓 FREE', badgeColor: 'green' },
    { type: 'website', name: 'Adda247 — LDC Syllabus & Papers', description: 'Official syllabus PDF + PYQ', url: 'https://www.adda247.com/exams/rajasthan/rajasthan-ldc-syllabus/', badge: '📄 Syllabus', badgeColor: 'blue' },
  ],
  'rajasthan-police-constable-2026': [
    { type: 'youtube', name: 'KGS Rajasthan Exams — Police Exam', description: 'Written test + physical test tips', url: 'https://www.youtube.com/@KGSRajasthanExams', badge: '🆓 FREE', badgeColor: 'green' },
    { type: 'youtube', name: 'Exampur — Reasoning & Maths', description: 'Vivek Sir ke shortcuts', url: 'https://www.youtube.com/@Exampur', badge: '🆓 FREE', badgeColor: 'green', subscribers: '90 lakh+' },
  ],
  'bstc-2026': [
    { type: 'youtube', name: 'Raithan Classes — BSTC Special', description: 'BSTC complete, Teaching Aptitude', url: 'https://www.youtube.com/channel/UCIkHMs9yy7mmPsMSBCUoG8A', badge: '🆓 FREE', badgeColor: 'green' },
  ],
};

export default function ResultsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [results, setResults] = useState<EligibilityResult[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showIneligible, setShowIneligible] = useState(false);

  useEffect(() => {
    async function init() {
      // Check auth
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUser(data.user);

      // Load profile
      const stored = localStorage.getItem("userProfile") || sessionStorage.getItem("userProfile");
      if (!stored) {
        router.push("/");
        return;
      }
      const parsed = JSON.parse(stored) as UserProfile;
      setProfile(parsed);
      const eligibilityResults = checkEligibility(parsed, examsData.exams as unknown as Exam[]);
      setResults(eligibilityResults);
    }
    init();
  }, [router]);

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EEF2F8]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-t-orange-500 border-r-transparent border-b-blue-900 border-l-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium" style={{ fontFamily: "var(--font-noto)" }}>लोड हो रहा है...</p>
        </div>
      </div>
    );
  }

  const isGuest = !user;
  const eligibleExams = results.filter(r => r.eligible);
  const ineligibleExams = results.filter(r => !r.eligible);

  // Collect all courses for eligible exams
  const allCourses: Course[] = [];
  eligibleExams.forEach(exam => {
    const courses = COURSES_BY_EXAM[exam.id] || [];
    courses.forEach(c => {
      if (!allCourses.find(ac => ac.url === c.url)) {
        allCourses.push({ ...c, examId: exam.id, examName: exam.short_name });
      }
    });
  });

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'जल्द घोषित होगा';
    const date = new Date(dateStr);
    return date.toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open': return { text: '✅ आवेदन खुला', className: 'bg-[#E8F5E9] text-[#138808] border border-green-200' };
      case 'upcoming': return { text: '📅 जल्द आ रहा है', className: 'bg-[#FFF3E8] text-[#FF6B00] border border-orange-200' };
      case 'expected': return { text: '🔜 अपेक्षित', className: 'bg-blue-50 text-blue-600 border border-blue-200' };
      default: return { text: '⏳ TBD', className: 'bg-gray-100 text-gray-600 border border-gray-200' };
    }
  };

  const badgeColorMap: Record<string, string> = {
    green: 'bg-green-50 text-green-700 border-green-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    navy: 'bg-[#EEF2F8] text-[#0F2B5B] border-[#C5D0E0]',
  };

  return (
    <main className="min-h-screen bg-[#EEF2F8] pb-12 relative overflow-hidden">
      {/* Decorative glows */}
      <div className="absolute w-96 h-96 rounded-full bg-orange-500/5 blur-3xl -top-20 -left-20 pointer-events-none" />
      <div className="absolute w-96 h-96 rounded-full bg-blue-500/5 blur-3xl top-1/2 right-0 pointer-events-none" />

      {/* Tiranga */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF6B00] via-white to-[#138808] z-[60]" />

      {/* Header */}
      <div className="bg-gradient-to-r from-[#0F2B5B] to-[#1847A6] h-16 px-4 flex items-center justify-between fixed top-1 w-full z-50 shadow-md border-b border-white/10 rounded-b-xl">
        <button 
          onClick={() => router.push("/")} 
          className="text-white/90 hover:text-white flex items-center gap-1 text-sm font-semibold bg-white/10 px-3 py-1.5 rounded-full border border-white/10 transition-all hover:bg-white/20 active:scale-95" 
          style={{ fontFamily: "var(--font-noto)" }}
        >
          ← वापस
        </button>
        <div className="text-center">
          <h1 className="text-white text-base md:text-lg font-bold" style={{ fontFamily: "var(--font-noto)" }}>
            आपके लिए भर्तियाँ
          </h1>
        </div>
        {user ? (
          <Link href="/dashboard" className="active:scale-95 transition-transform">
            <div className="w-8.5 h-8.5 bg-white/15 hover:bg-white/25 rounded-full flex items-center justify-center text-white text-sm font-bold border border-white/20">
              {user.email?.[0]?.toUpperCase() || '?'}
            </div>
          </Link>
        ) : (
          <Link href="/auth" className="text-white/90 text-xs border border-white/20 bg-white/5 px-3 py-1.5 rounded-full hover:bg-white/15 transition-all shadow-sm font-semibold" style={{ fontFamily: "var(--font-noto)" }}>
            Login
          </Link>
        )}
      </div>

      <div className="pt-20 px-4 max-w-xl mx-auto relative z-10 space-y-6">
        {/* Greeting Banner */}
        <div className="bg-gradient-to-br from-[#0f2b5b] via-[#143770] to-[#1847a6] rounded-2xl p-6 text-white shadow-xl shadow-blue-900/10 border border-white/5 animate-slide-up">
          <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-noto)" }}>
            {profile.name ? `नमस्ते ${profile.name}! 🙏` : 'नमस्ते! 🙏'}
          </h2>
          <p className="text-white/75 text-xs mt-1 leading-relaxed" style={{ fontFamily: "var(--font-noto)" }}>
            आप <span className="text-[#FF6B00] font-extrabold text-sm">{eligibleExams.length} भर्तियों</span> के लिए योग्य हैं। नीचे दी गई सूची देखें।
          </p>
        </div>

        {/* Top Official Websites Strip */}
        <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <h3 className="text-xs font-bold text-[#0F2B5B] uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5" style={{ fontFamily: "var(--font-noto)" }}>
            <span>🌐</span> आधिकारिक वेबसाइटें
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2.5 scrollbar-thin scrollbar-thumb-blue-200">
            {TOP_WEBSITES.map((site) => (
              <a
                key={site.name}
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 bg-white rounded-xl border border-[#C5D0E0]/50 p-2.5 w-24 text-center hover:shadow-lg hover:border-blue-300 transition-all active:scale-95"
              >
                <div className="text-xl mb-1">{site.emoji}</div>
                <p className="text-xs font-bold text-[#0F2B5B] truncate">{site.name}</p>
                <p className="text-[9px] text-gray-400 truncate" style={{ fontFamily: "var(--font-noto)" }}>{site.fullName}</p>
              </a>
            ))}
          </div>
        </div>

        {/* Eligible Exams List */}
        {eligibleExams.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-xl border border-[#C5D0E0]/60 animate-slide-up" style={{ animationDelay: '150ms' }}>
            <p className="text-5xl mb-4">😔</p>
            <h3 className="text-lg font-bold text-[#0F2B5B] mb-2" style={{ fontFamily: "var(--font-noto)" }}>
              कोई योग्य भर्ती नहीं मिली
            </h3>
            <p className="text-gray-500 text-xs mb-6 max-w-sm mx-auto leading-relaxed" style={{ fontFamily: "var(--font-noto)" }}>
              आपकी शैक्षणिक योग्यता या आयु के अनुसार वर्तमान में कोई भर्ती खुली नहीं है।
            </p>
            <button 
              onClick={() => router.push("/")} 
              className="bg-gradient-to-r from-[#FF6B00] to-[#E55A00] text-white text-sm font-bold px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95" 
              style={{ fontFamily: "var(--font-noto)" }}
            >
              नई जानकारी दर्ज करें
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-slide-up" style={{ animationDelay: '150ms' }}>
            <h3 className="text-xs font-bold text-[#0F2B5B] uppercase tracking-wider px-1 flex items-center gap-1.5" style={{ fontFamily: "var(--font-noto)" }}>
              <span className="text-green-600">✓</span> योग्य भर्तियाँ ({eligibleExams.length})
            </h3>
            {eligibleExams.map((exam, idx) => {
              const daysLeft = getDaysRemaining(exam.last_date);
              const fee = getFeeByCategory(exam, profile.category);
              const isUrgent = daysLeft > 0 && daysLeft <= 7;
              const status = getStatusBadge(exam.status);
              const isLocked = isGuest && idx > 0;

              return (
                <div key={exam.id} className="relative group">
                  {isLocked && (
                    <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-[3px] rounded-2xl flex flex-col items-center justify-center p-4 border border-[#C5D0E0]/60 shadow-md">
                      <p className="text-2xl mb-1.5">🔒</p>
                      <p className="text-xs font-bold text-[#0F2B5B] mb-3 text-center" style={{ fontFamily: "var(--font-noto)" }}>
                        Login करें — बाकी सभी भर्तियाँ देखें
                      </p>
                      <button
                        onClick={() => setShowAuthModal(true)}
                        className="bg-gradient-to-r from-[#FF6B00] to-[#E55A00] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md active:scale-95 transition-transform"
                        style={{ fontFamily: "var(--font-noto)" }}
                      >
                        Login / Sign Up →
                      </button>
                    </div>
                  )}
                  <div className="bg-white rounded-2xl p-5 md:p-6 shadow-md hover:shadow-lg border border-[#C5D0E0]/60 relative overflow-hidden transition-all group-hover:border-blue-200">
                    {/* Accent Color Band */}
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#FF6B00] to-[#E55A00]" />

                    {/* Top Bar */}
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">{exam.board}</p>
                        <h3 className="text-base font-extrabold text-[#0D1B2A] mt-0.5" style={{ fontFamily: "var(--font-noto)" }}>
                          {exam.name_hindi || exam.short_name}
                        </h3>
                      </div>
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold whitespace-nowrap ${status.className}`} style={{ fontFamily: "var(--font-noto)" }}>
                        {status.text}
                      </span>
                    </div>

                    {/* Eligible Reasons */}
                    <div className="space-y-1 mb-3.5 bg-green-50/50 p-2.5 rounded-xl border border-green-100/50">
                      {exam.reasons_eligible.slice(0, 3).map((r: string, ri: number) => (
                        <p key={ri} className="text-xs text-green-700 flex items-start gap-1" style={{ fontFamily: "var(--font-noto)" }}>
                          <span className="text-green-600 mt-0.5">•</span>
                          <span>{r}</span>
                        </p>
                      ))}
                    </div>

                    {/* Warnings */}
                    {exam.warnings.length > 0 && (
                      <div className="space-y-1 mb-3.5 bg-orange-50/50 p-2.5 rounded-xl border border-orange-100/50">
                        {exam.warnings.map((w: string, wi: number) => (
                          <p key={wi} className="text-xs text-orange-700 flex items-start gap-1" style={{ fontFamily: "var(--font-noto)" }}>
                            <span className="text-orange-600 mt-0.5">⚠️</span>
                            <span>{w}</span>
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Details Row */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="bg-[#EEF2F8] text-[#0F2B5B] text-xs px-2.5 py-1.5 rounded-lg font-medium border border-[#C5D0E0]/30" style={{ fontFamily: "var(--font-noto)" }}>
                        📅 {formatDate(exam.last_date)}
                      </span>
                      {isUrgent && (
                        <span className="bg-red-50 text-red-600 text-xs px-2.5 py-1.5 rounded-lg border border-red-200 font-semibold" style={{ fontFamily: "var(--font-noto)" }}>
                          🚨 {daysLeft} दिन बाकी!
                        </span>
                      )}
                      <span className="bg-[#EEF2F8] text-[#0F2B5B] text-xs px-2.5 py-1.5 rounded-lg font-medium border border-[#C5D0E0]/30">
                        💰 ₹{fee}
                      </span>
                      <span className="bg-[#EEF2F8] text-[#0F2B5B] text-xs px-2.5 py-1.5 rounded-lg font-medium border border-[#C5D0E0]/30">
                        👤 {exam.eligibility.min_age}-{exam.effective_max_age || exam.eligibility.max_age} साल
                      </span>
                    </div>

                    {/* Disclaimer */}
                    <div className="bg-[#FFF3E8] border-l-2 border-[#FF6B00] rounded-r-lg p-2.5 mb-4">
                      <p className="text-orange-800 text-[10px] leading-relaxed italic" style={{ fontFamily: "var(--font-noto)" }}>
                        ⚠️ यह जानकारी {exam.last_verified} को जाँची गई थी। आवेदन करने से पूर्व आधिकारिक विज्ञप्ति की पुष्टि अवश्य करें।
                      </p>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => router.push(`/exam/${exam.id}`)}
                      className="w-full bg-gradient-to-r from-[#FF6B00] to-[#E55A00] hover:from-[#E55A00] hover:to-[#cc5000] text-white font-bold py-3 rounded-xl active:scale-[0.98] transition-all shadow-md hover:shadow-lg hover:shadow-orange-500/10"
                      style={{ fontFamily: "var(--font-noto)" }}
                    >
                      💬 इस भर्ती के बारे में Chat करें →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Free Courses Section */}
        {allCourses.length > 0 && (
          <div className="mb-6 relative animate-slide-up" style={{ animationDelay: '200ms' }}>
            <h3 className="text-xs font-bold text-[#0F2B5B] uppercase tracking-wider px-1 flex items-center gap-1.5 mb-1" style={{ fontFamily: "var(--font-noto)" }}>
              <span>📺</span> FREE परीक्षा तैयारी
            </h3>
            <p className="text-xs text-gray-400 px-1 mb-3" style={{ fontFamily: "var(--font-noto)" }}>
              YouTube पर उपलब्ध सर्वोत्तम मुफ्त क्लासेज — paid coaching की आवश्यकता नहीं
            </p>

            <div className="relative">
              {isGuest && (
                <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-[3px] rounded-2xl flex flex-col items-center justify-center p-4 border border-[#C5D0E0]/60 shadow-md">
                  <p className="text-2xl mb-1.5">🔒</p>
                  <p className="text-xs font-bold text-[#0F2B5B] mb-3 text-center" style={{ fontFamily: "var(--font-noto)" }}>
                    Login करें और सभी FREE कोर्सेज देखें
                  </p>
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="bg-gradient-to-r from-[#FF6B00] to-[#E55A00] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md active:scale-95"
                    style={{ fontFamily: "var(--font-noto)" }}
                  >
                    Login करें →
                  </button>
                </div>
              )}

              <div className="space-y-2">
                {allCourses.slice(0, isGuest ? 2 : allCourses.length).map((course, ci) => {
                  const bgMap: Record<string, string> = {
                    youtube: 'bg-red-50/80 hover:bg-red-50 border-red-100',
                    website: 'bg-blue-50/80 hover:bg-blue-50 border-blue-100',
                  };
                  const iconMap: Record<string, string> = {
                    youtube: '📺',
                    website: '🌐',
                  };

                  return (
                    <a
                      key={ci}
                      href={course.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`block ${bgMap[course.type] || 'bg-gray-50 border-gray-100'} border rounded-xl p-3 hover:shadow-md transition-all active:scale-99`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xl flex-shrink-0 mt-0.5">{iconMap[course.type] || '📦'}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-xs md:text-sm font-bold text-[#0D1B2A] truncate" style={{ fontFamily: "var(--font-noto)" }}>
                              {course.name}
                            </p>
                            <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold flex-shrink-0 ${badgeColorMap[course.badgeColor] || 'bg-gray-100 text-gray-600'}`}>
                              {course.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 truncate" style={{ fontFamily: "var(--font-noto)" }}>
                            {course.description}
                          </p>
                          {course.subscribers && (
                            <p className="text-[9px] text-gray-400 mt-0.5">{course.subscribers} subscribers</p>
                          )}
                        </div>
                        <span className="text-gray-300 text-sm flex-shrink-0 self-center">→</span>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Ineligible exams summary (Accordion) */}
        {ineligibleExams.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#C5D0E0]/60 overflow-hidden shadow-sm animate-slide-up" style={{ animationDelay: '250ms' }}>
            <button
              onClick={() => setShowIneligible(!showIneligible)}
              className="w-full px-5 py-4 flex items-center justify-between text-xs font-bold text-gray-500 hover:bg-gray-50 transition-colors outline-none"
              style={{ fontFamily: "var(--font-noto)" }}
            >
              <span className="flex items-center gap-1.5">
                <span>❌</span> अयोग्य भर्तियाँ ({ineligibleExams.length})
              </span>
              <span>{showIneligible ? '▲' : '▼'}</span>
            </button>

            {showIneligible && (
              <div className="px-5 pb-5 pt-1 space-y-2.5 border-t border-gray-100 bg-gray-50/50">
                {ineligibleExams.map(exam => (
                  <div key={exam.id} className="flex justify-between items-start gap-4 text-xs">
                    <span className="font-bold text-gray-600 min-w-[120px]" style={{ fontFamily: "var(--font-noto)" }}>{exam.short_name || exam.name}</span>
                    <span className="text-red-500 text-right leading-relaxed" style={{ fontFamily: "var(--font-noto)" }}>
                      {exam.reasons_ineligible[0] || 'आयु / योग्यता सीमा अनुकूल नहीं है'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bottom Actions */}
        <div className="pt-2 animate-slide-up animate-delay-300">
          <button
            onClick={() => router.push("/")}
            className="w-full h-12 bg-white border border-[#C5D0E0] text-[#0F2B5B] font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm active:scale-95"
            style={{ fontFamily: "var(--font-noto)" }}
          >
            नई जानकारी दर्ज करें
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-400 text-[10px] px-4 pt-4" style={{ fontFamily: "var(--font-noto)" }}>
          अंतिम बार अद्यतन किया गया: {new Date().toLocaleDateString('hi-IN')}
        </p>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthPromptModal onClose={() => setShowAuthModal(false)} reason="message_limit" />
      )}
    </main>
  );
}