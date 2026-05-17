"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getEligibleExams, getDaysRemaining, getFeeByCategory, type Exam, type UserProfile } from "@/lib/eligibility";

export default function ExamsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [eligibleExams, setEligibleExams] = useState<Exam[]>([]);

  useEffect(() => {
    const storedProfile = localStorage.getItem("userProfile");
    if (!storedProfile) {
      router.push("/");
      return;
    }
    const parsedProfile = JSON.parse(storedProfile);
    setProfile(parsedProfile);
    const exams = getEligibleExams(parsedProfile);
    setEligibleExams(exams);
  }, [router]);

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EEF2F8]">
        <p className="text-gray-500">लोड हो रहा है...</p>
      </div>
    );
  }

  const getEducationDisplay = (edu: string) => {
    const map: Record<string, string> = {
      "8th": "8वीं पास",
      "10th": "10वीं पास",
      "12th": "12वीं पास",
      "graduation": "स्नातक",
      "pg": "परास्नातक"
    };
    return map[edu] || edu;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'जल्द घोषित होगा';
    const date = new Date(dateStr);
    return date.toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <main className="min-h-screen bg-[#EEF2F8] pb-8">
      {/* Header */}
      <div className="bg-[#0F2B5B] h-16 px-4 flex items-center fixed top-0 w-full z-50 shadow-lg">
        <button
          onClick={() => router.push("/")}
          className="text-white hover:text-white/80 font-semibold"
          style={{ fontFamily: "var(--font-noto)" }}
        >
          ← वापस
        </button>
        <div className="flex-1 text-center">
          <h1 className="text-white text-lg font-bold" style={{ fontFamily: "var(--font-noto)" }}>
            आपके लिए भर्तियाँ
          </h1>
        </div>
        <div className="w-12" />
      </div>

      <div className="pt-20 px-4 max-w-2xl mx-auto">
        {/* User Profile Summary */}
        <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-[#C5D0E0]">
          <p className="text-gray-600 text-sm" style={{ fontFamily: "var(--font-noto)" }}>
            आपकी प्रोफाइल: <span className="font-semibold text-[#0F2B5B]">{profile.age} साल</span>,
            <span className="font-semibold text-[#0F2B5F]"> {getEducationDisplay(profile.education)}</span>
          </p>
          <p className="text-gray-500 text-xs mt-1" style={{ fontFamily: "var(--font-noto)" }}>
            {eligibleExams.length} योग्य भर्तियाँ मिलीं
          </p>
        </div>

        {/* Exams List */}
        {eligibleExams.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-lg border border-[#C5D0E0]">
            <p className="text-5xl mb-4">😔</p>
            <h3 className="text-xl font-bold text-[#0F2B5B] mb-2" style={{ fontFamily: "var(--font-noto)" }}>
              कोई योग्य भर्ती नहीं मिली
            </h3>
            <p className="text-gray-500 text-sm mb-6" style={{ fontFamily: "var(--font-noto)" }}>
              आपकी शैक्षणिक योग्यता या आयु के अनुसार कोई भर्ती खुली नहीं है।<br/>
              नई भर्तियों के लिए नियमित जांचते रहें।
            </p>
            <button
              onClick={() => router.push("/")}
              className="text-[#FF6B00] font-bold text-lg"
              style={{ fontFamily: "var(--font-noto)" }}
            >
              ← नई जानकारी दर्ज करें
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {eligibleExams.map((exam) => {
              const daysLeft = getDaysRemaining(exam.last_date);
              const fee = getFeeByCategory(exam, profile.category);
              const isUrgent = daysLeft > 0 && daysLeft <= 7;

              return (
                <div
                  key={exam.id}
                  className="bg-white rounded-2xl p-5 shadow-md border-l-4 border-[#FF6B00]"
                >
                  {/* Top Bar */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-[#0D1B2A]" style={{ fontFamily: "var(--font-noto)" }}>
                        {exam.name_hindi}
                      </h3>
                      <p className="text-sm text-gray-500">{exam.board}</p>
                    </div>
                    <span className="bg-[#E8F5E9] text-[#138808] text-sm px-3 py-1 rounded-full font-semibold" style={{ fontFamily: "var(--font-noto)" }}>
                      ✅ आवेदन खुला
                    </span>
                  </div>

                  {/* Deadline Row */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[#0D1B2A] font-medium" style={{ fontFamily: "var(--font-noto)" }}>
                      📅 अंतिम तिथि: {formatDate(exam.last_date)}
                    </span>
                    {isUrgent && (
                      <span className="bg-red-50 text-red-600 text-sm px-3 py-1 rounded-full border border-red-200 font-semibold" style={{ fontFamily: "var(--font-noto)" }}>
                        🔴 केवल {daysLeft} दिन बाकी!
                      </span>
                    )}
                  </div>

                  {/* Details Row */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-[#EEF2F8] text-[#0F2B5B] text-sm px-3 py-1.5 rounded-full font-medium" style={{ fontFamily: "var(--font-noto)" }}>
                      💰 शुल्क: ₹{fee}
                    </span>
                    <span className="bg-[#EEF2F8] text-[#0F2B5B] text-sm px-3 py-1.5 rounded-full font-medium" style={{ fontFamily: "var(--font-noto)" }}>
                      📚 योग्यता: {exam.eligibility.education_hindi}
                    </span>
                    <span className="bg-[#EEF2F8] text-[#0F2B5B] text-sm px-3 py-1.5 rounded-full font-medium" style={{ fontFamily: "var(--font-noto)" }}>
                      👤 आयु: {exam.eligibility.min_age}-{exam.eligibility.max_age} साल
                    </span>
                  </div>

                  {/* Disclaimer Box */}
                  <div className="bg-[#FFF3E8] border-l-4 border-[#FF6B00] rounded-r-lg p-3 mb-4">
                    <p className="text-orange-800 text-xs italic" style={{ fontFamily: "var(--font-noto)" }}>
                      ⚠️ यह जानकारी {exam.last_verified} को verify की गई थी।
                      Apply करने से पहले official website पर ज़रूर check करें।
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => router.push(`/guide/${exam.id}`)}
                      className="flex-1 bg-[#FF6B00] hover:bg-[#E56200] text-white font-bold py-3 px-4 rounded-xl active:scale-95 transition-transform shadow-md"
                      style={{ fontFamily: "var(--font-noto)" }}
                    >
                      📝 आवेदन कैसे करें →
                    </button>
                    <a
                      href={exam.official_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white border-2 border-[#0F2B5B] text-[#0F2B5B] font-bold py-3 px-4 rounded-xl text-center hover:bg-[#EEF2F8]"
                      style={{ fontFamily: "var(--font-noto)" }}
                    >
                      🌐
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Back Button */}
        <button
          onClick={() => router.push("/")}
          className="w-full h-12 border-2 border-[#C5D0E0] text-[#0F2B5B] font-bold rounded-xl mt-6 hover:bg-white"
          style={{ fontFamily: "var(--font-noto)" }}
        >
          नई जानकारी दर्ज करें
        </button>

        {/* Footer */}
        <p className="text-center text-gray-400 text-xs px-4 mt-6" style={{ fontFamily: "var(--font-noto)" }}>
          Last Updated: {new Date().toLocaleDateString('hi-IN')}
        </p>
      </div>
    </main>
  );
}