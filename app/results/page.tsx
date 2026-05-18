"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { checkEligibility, getDaysRemaining, getFeeByCategory, type Exam, type UserProfile } from "@/lib/eligibility";
import { supabase } from "@/lib/supabase";
import examsData from "@/data/exams.json";
import AuthPromptModal from "@/components/AuthPromptModal";

const TOP_WEBSITES = [
  { name: "RPSC", fullName: "राजस्थान लोक सेवा आयोग", url: "https://rpsc.rajasthan.gov.in", emoji: "🏛️", color: "#0F2B5B" },
  { name: "RSMSSB", fullName: "राजस्थान कर्मचारी चयन बोर्ड", url: "https://rsmssb.rajasthan.gov.in", emoji: "📋", color: "#1847A6" },
  { name: "SSO Portal", fullName: "Single Sign-On Rajasthan", url: "https://sso.rajasthan.gov.in", emoji: "🔐", color: "#138808" },
  { name: "Rajasthan Police", fullName: "राजस्थान पुलिस", url: "https://police.rajasthan.gov.in", emoji: "👮", color: "#8B0000" },
  { name: "BSTC Portal", fullName: "BSTC / Pre D.El.Ed", url: "https://bstcrajasthan.in", emoji: "📚", color: "#6B21A8" },
  { name: "Recruitment", fullName: "Rajasthan Recruitment", url: "https://recruitment.rajasthan.gov.in", emoji: "💼", color: "#FF6B00" },
  { name: "Jan Suchna", fullName: "जन सूचना पोर्टल", url: "https://jansoochna.rajasthan.gov.in", emoji: "ℹ️", color: "#0369A1" },
];

const COURSES_BY_EXAM: Record<string, any[]> = {
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
  const [results, setResults] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    // Check auth
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user);
    });

    // Load profile
    const stored = localStorage.getItem("userProfile") || sessionStorage.getItem("userProfile");
    if (!stored) {
      router.push("/");
      return;
    }
    const parsed = JSON.parse(stored);
    setProfile(parsed);
    const eligibilityResults = checkEligibility(parsed, examsData.exams as any[]);
    setResults(eligibilityResults);
  }, [router]);

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EEF2F8]">
        <p className="text-gray-500" style={{ fontFamily: "var(--font-noto)" }}>लोड हो रहा है...</p>
      </div>
    );
  }

  const isGuest = !user;
  const eligibleExams = results.filter(r => r.eligible);
  const ineligibleExams = results.filter(r => !r.eligible);

  // Collect all courses for eligible exams
  const allCourses: any[] = [];
  eligibleExams.forEach(exam => {
    const courses = COURSES_BY_EXAM[exam.id] || [];
    courses.forEach(c => {
      if (!allCourses.find(ac => ac.url === c.url)) {
        allCourses.push({ ...c, examId: exam.id, examName: exam.short_name });
      }
    });
  });

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'जल्द घोषित होगा';
    const date = new Date(dateStr);
    return date.toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open': return { text: '✅ आवेदन खुला', className: 'bg-[#E8F5E9] text-[#138808]' };
      case 'upcoming': return { text: '📅 जल्द आ रहा है', className: 'bg-[#FFF3E8] text-[#FF6B00]' };
      case 'expected': return { text: '🔜 अपेक्षित', className: 'bg-blue-50 text-blue-600' };
      default: return { text: '⏳ TBD', className: 'bg-gray-100 text-gray-600' };
    }
  };

  const badgeColorMap: Record<string, string> = {
    green: 'bg-green-100 text-green-700 border-green-200',
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    purple: 'bg-purple-100 text-purple-700 border-purple-200',
    navy: 'bg-[#EEF2F8] text-[#0F2B5B] border-[#C5D0E0]',
  };

  return (
    <main className="min-h-screen bg-[#EEF2F8] pb-8">
      {/* Tiranga */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF6B00] via-white to-[#138808] z-[60]" />

      {/* Header */}
      <div className="bg-[#0F2B5B] h-14 px-4 flex items-center fixed top-1 w-full z-50 shadow-lg">
        <button onClick={() => router.push("/")} className="text-white hover:text-white/80 font-semibold" style={{ fontFamily: "var(--font-noto)" }}>
          ← वापस
        </button>
        <div className="flex-1 text-center">
          <h1 className="text-white text-lg font-bold" style={{ fontFamily: "var(--font-noto)" }}>
            आपके लिए भर्तियाँ
          </h1>
        </div>
        {user ? (
          <Link href="/dashboard">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {user.email?.[0]?.toUpperCase() || '?'}
            </div>
          </Link>
        ) : (
          <Link href="/auth" className="text-white/90 text-sm border border-white/40 px-2.5 py-1 rounded-full hover:bg-white/10" style={{ fontFamily: "var(--font-noto)" }}>
            Login
          </Link>
        )}
      </div>

      <div className="pt-20 px-4 max-w-2xl mx-auto">
        {/* Greeting Banner */}
        <div className="bg-gradient-to-r from-[#0F2B5B] to-[#1847A6] rounded-2xl p-5 mb-5 text-white">
          <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-noto)" }}>
            {profile.name ? `नमस्ते ${profile.name}! 🙏` : 'नमस्ते! 🙏'}
          </h2>
          <p className="text-white/80 text-sm mt-1" style={{ fontFamily: "var(--font-noto)" }}>
            आप <span className="text-[#FF6B00] font-bold">{eligibleExams.length} भर्तियों</span> के लिए योग्य हैं
          </p>
        </div>

        {/* Top Official Websites Strip */}
        <div className="mb-5">
          <h3 className="text-sm font-bold text-[#0F2B5B] mb-2 px-1" style={{ fontFamily: "var(--font-noto)" }}>
            🌐 आधिकारिक वेबसाइटें
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2 scroll-hidden">
            {TOP_WEBSITES.map((site) => (
              <a
                key={site.name}
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 bg-white rounded-xl border border-[#C5D0E0]/50 p-3 w-28 text-center hover:shadow-md hover:border-[#1847A6]/30 transition-all"
              >
                <div className="text-2xl mb-1">{site.emoji}</div>
                <p className="text-xs font-bold text-[#0F2B5B] truncate">{site.name}</p>
                <p className="text-[10px] text-gray-400 truncate" style={{ fontFamily: "var(--font-noto)" }}>{site.fullName}</p>
              </a>
            ))}
          </div>
        </div>

        {/* Eligible Exams List */}
        {eligibleExams.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-lg border border-[#C5D0E0]">
            <p className="text-5xl mb-4">😔</p>
            <h3 className="text-xl font-bold text-[#0F2B5B] mb-2" style={{ fontFamily: "var(--font-noto)" }}>
              कोई योग्य भर्ती नहीं मिली
            </h3>
            <p className="text-gray-500 text-sm mb-6" style={{ fontFamily: "var(--font-noto)" }}>
              आपकी शैक्षणिक योग्यता या आयु के अनुसार कोई भर्ती खुली नहीं है।
            </p>
            <button onClick={() => router.push("/")} className="text-[#FF6B00] font-bold text-lg" style={{ fontFamily: "var(--font-noto)" }}>
              ← नई जानकारी दर्ज करें
            </button>
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            <h3 className="text-sm font-bold text-[#0F2B5B] px-1" style={{ fontFamily: "var(--font-noto)" }}>
              ✅ योग्य भर्तियाँ ({eligibleExams.length})
            </h3>
            {eligibleExams.map((exam, idx) => {
              const daysLeft = getDaysRemaining(exam.last_date);
              const fee = getFeeByCategory(exam, profile.category);
              const isUrgent = daysLeft > 0 && daysLeft <= 7;
              const status = getStatusBadge(exam.status);
              const isLocked = isGuest && idx > 0;

              return (
                <div key={exam.id} className="relative">
                  {isLocked && (
                    <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-[3px] rounded-2xl flex flex-col items-center justify-center">
                      <p className="text-lg mb-2">🔒</p>
                      <p className="text-sm font-bold text-[#0F2B5B] mb-3" style={{ fontFamily: "var(--font-noto)" }}>
                        Login करें — बाकी भर्तियाँ देखें
                      </p>
                      <button
                        onClick={() => setShowAuthModal(true)}
                        className="bg-[#FF6B00] text-white text-sm font-bold px-5 py-2 rounded-xl"
                        style={{ fontFamily: "var(--font-noto)" }}
                      >
                        Login / Sign Up →
                      </button>
                    </div>
                  )}
                  <div className="bg-white rounded-2xl p-5 shadow-md border-l-4 border-[#FF6B00]">
                    {/* Top Bar */}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-xs text-gray-400 font-medium mb-1">{exam.board}</p>
                        <h3 className="text-lg font-bold text-[#0D1B2A]" style={{ fontFamily: "var(--font-noto)" }}>
                          {exam.name_hindi || exam.short_name}
                        </h3>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold ${status.className}`} style={{ fontFamily: "var(--font-noto)" }}>
                        {status.text}
                      </span>
                    </div>

                    {/* Eligible Reasons */}
                    <div className="space-y-1 mb-3">
                      {exam.reasons_eligible.slice(0, 3).map((r: string, ri: number) => (
                        <p key={ri} className="text-xs text-green-700" style={{ fontFamily: "var(--font-noto)" }}>{r}</p>
                      ))}
                    </div>

                    {/* Warnings */}
                    {exam.warnings.length > 0 && (
                      <div className="space-y-1 mb-3">
                        {exam.warnings.map((w: string, wi: number) => (
                          <p key={wi} className="text-xs text-orange-600" style={{ fontFamily: "var(--font-noto)" }}>{w}</p>
                        ))}
                      </div>
                    )}

                    {/* Details Row */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="bg-[#EEF2F8] text-[#0F2B5B] text-xs px-3 py-1.5 rounded-full font-medium" style={{ fontFamily: "var(--font-noto)" }}>
                        📅 {formatDate(exam.last_date)}
                      </span>
                      {isUrgent && (
                        <span className="bg-red-50 text-red-600 text-xs px-3 py-1.5 rounded-full border border-red-200 font-semibold" style={{ fontFamily: "var(--font-noto)" }}>
                          🔴 {daysLeft} दिन बाकी!
                        </span>
                      )}
                      <span className="bg-[#EEF2F8] text-[#0F2B5B] text-xs px-3 py-1.5 rounded-full font-medium">
                        💰 ₹{fee}
                      </span>
                      <span className="bg-[#EEF2F8] text-[#0F2B5B] text-xs px-3 py-1.5 rounded-full font-medium">
                        👤 {exam.eligibility.min_age}-{exam.effective_max_age || exam.eligibility.max_age} साल
                      </span>
                    </div>

                    {/* Disclaimer */}
                    <div className="bg-[#FFF3E8] border-l-4 border-[#FF6B00] rounded-r-lg p-2.5 mb-4">
                      <p className="text-orange-800 text-[10px] italic" style={{ fontFamily: "var(--font-noto)" }}>
                        ⚠️ जानकारी {exam.last_verified} को verify की गई। Apply से पहले official website check करें।
                      </p>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => router.push(`/exam/${exam.id}`)}
                      className="w-full bg-gradient-to-r from-[#FF6B00] to-[#E55A00] text-white font-bold py-3 rounded-xl active:scale-[0.98] transition-transform shadow-md"
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

        {/* Ineligible exams summary */}
        {ineligibleExams.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-400 px-1 mb-2" style={{ fontFamily: "var(--font-noto)" }}>
              ❌ अयोग्य भर्तियाँ ({ineligibleExams.length})
            </h3>
            <div className="bg-white/60 rounded-xl p-3 space-y-2">
              {ineligibleExams.map(exam => (
                <div key={exam.id} className="flex justify-between items-center text-sm">
                  <span className="text-gray-500" style={{ fontFamily: "var(--font-noto)" }}>{exam.short_name || exam.name}</span>
                  <span className="text-xs text-red-400" style={{ fontFamily: "var(--font-noto)" }}>
                    {exam.reasons_ineligible[0]?.substring(0, 40)}...
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Free Courses Section */}
        {allCourses.length > 0 && (
          <div className="mb-6 relative">
            <h3 className="text-sm font-bold text-[#0F2B5B] px-1 mb-1" style={{ fontFamily: "var(--font-noto)" }}>
              📺 इन भर्तियों की FREE तैयारी
            </h3>
            <p className="text-xs text-gray-400 px-1 mb-3" style={{ fontFamily: "var(--font-noto)" }}>
              YouTube पर सब मुफ्त है — paid coaching की जरूरत नहीं
            </p>

            {isGuest && (
              <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-[3px] rounded-2xl flex flex-col items-center justify-center mt-8">
                <p className="text-lg mb-2">🔒</p>
                <p className="text-sm font-bold text-[#0F2B5B] mb-3 text-center px-4" style={{ fontFamily: "var(--font-noto)" }}>
                  Login करें और सभी FREE Courses देखें
                </p>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-[#FF6B00] text-white text-sm font-bold px-5 py-2 rounded-xl"
                  style={{ fontFamily: "var(--font-noto)" }}
                >
                  Login करें →
                </button>
              </div>
            )}

            <div className="space-y-2">
              {allCourses.slice(0, isGuest ? 2 : allCourses.length).map((course, ci) => {
                const bgMap: Record<string, string> = {
                  youtube: 'bg-red-50/80',
                  website: 'bg-blue-50/80',
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
                    className={`block ${bgMap[course.type] || 'bg-gray-50'} rounded-xl p-3 hover:shadow-md transition-all border border-transparent hover:border-gray-200`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl flex-shrink-0 mt-0.5">{iconMap[course.type] || '📦'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-bold text-[#0D1B2A] truncate" style={{ fontFamily: "var(--font-noto)" }}>
                            {course.name}
                          </p>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium flex-shrink-0 ${badgeColorMap[course.badgeColor] || 'bg-gray-100 text-gray-600'}`}>
                            {course.badge}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500" style={{ fontFamily: "var(--font-noto)" }}>
                          {course.description}
                        </p>
                        {course.subscribers && (
                          <p className="text-[10px] text-gray-400 mt-0.5">{course.subscribers} subscribers</p>
                        )}
                      </div>
                      <span className="text-gray-300 text-sm flex-shrink-0">→</span>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Back Button */}
        <button
          onClick={() => router.push("/")}
          className="w-full h-12 border-2 border-[#C5D0E0] text-[#0F2B5B] font-bold rounded-xl mt-4 hover:bg-white"
          style={{ fontFamily: "var(--font-noto)" }}
        >
          नई जानकारी दर्ज करें
        </button>

        {/* Footer */}
        <p className="text-center text-gray-400 text-xs px-4 mt-6" style={{ fontFamily: "var(--font-noto)" }}>
          Last Updated: {new Date().toLocaleDateString('hi-IN')}
        </p>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthPromptModal onClose={() => setShowAuthModal(false)} reason="message_limit" />
      )}
    </main>
  );
}
