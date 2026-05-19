"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../lib/supabase";
import { User } from "@/lib/types";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [showPersonal, setShowPersonal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    state: "राजस्थान",
    age: "",
    education: "",
    category: "",
    gender: "",
    hasRSCIT: false,
    hasCET_graduate: false,
    hasCET_senior: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.age || !formData.education || !formData.category || !formData.gender) {
      alert("कृपया सभी जानकारी भरें!");
      return;
    }
    setLoading(true);

    // Create guest session in Supabase (if not logged in)
    if (!user) {
      const sessionToken = crypto.randomUUID();
      try {
        await supabase.from('guest_sessions').insert({
          session_token: sessionToken,
          name: formData.name || null,
          city: formData.city || null,
          age: parseInt(formData.age),
          education: formData.education,
          category: formData.category,
          gender: formData.gender,
          has_cet_graduate: formData.hasCET_graduate,
          has_cet_senior_secondary: formData.hasCET_senior,
          has_rscit: formData.hasRSCIT
        });
        sessionStorage.setItem('guestToken', sessionToken);
      } catch (err) {
        // Fallback — continue without DB
        console.error('Guest session creation failed:', err);
      }
    } else {
      // Update user profile
      try {
        await supabase.from('user_profiles').update({
          name: formData.name || null,
          city: formData.city || null,
          age: parseInt(formData.age),
          education: formData.education,
          category: formData.category,
          gender: formData.gender,
          has_cet_graduate: formData.hasCET_graduate,
          has_cet_senior_secondary: formData.hasCET_senior,
          has_rscit: formData.hasRSCIT,
          updated_at: new Date().toISOString()
        }).eq('id', user.id);
      } catch (err) {
        console.error('Profile update failed:', err);
      }
    }

    // Save locally too
    sessionStorage.setItem('userProfile', JSON.stringify(formData));
    localStorage.setItem('userProfile', JSON.stringify(formData));

    router.push("/results");
  };

  const updateField = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <main className="min-h-screen bg-[#EEF2F8]">
      {/* Tiranga stripe */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF6B00] via-white to-[#138808] z-[60]" />

      {/* Header */}
      <div className="bg-[#0F2B5B] h-24 px-4 flex items-end pb-3 fixed top-1 w-full z-50 shadow-lg">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-1 h-10 bg-[#FF6B00] rounded-full" />
          <div>
            <h1 className="text-white text-2xl font-bold" style={{ fontFamily: "var(--font-noto)" }}>
              🏛️ सरकारी साथी
            </h1>
            <p className="text-white/70 text-xs" style={{ fontFamily: "var(--font-noto)" }}>
              राजस्थान सरकारी भर्ती पोर्टल
            </p>
          </div>
        </div>
        {/* Login button */}
        {user ? (
          <Link href="/dashboard">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-white text-sm font-bold hover:bg-white/30 transition-colors">
              {user.email?.[0]?.toUpperCase() || '?'}
            </div>
          </Link>
        ) : (
          <Link
            href="/auth"
            className="text-white/90 text-sm border border-white/40 px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors"
            style={{ fontFamily: "var(--font-noto)" }}
          >
            Login
          </Link>
        )}
      </div>

      {/* Main Content */}
      <div className="pt-28 pb-8 px-4">
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-[#0F2B5B] to-[#1847A6] rounded-2xl p-6 mx-auto max-w-md mb-6 text-white">
          <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-noto)" }}>
            {formData.name ? `नमस्ते ${formData.name}! 🙏` : 'नमस्ते! 🙏'}
          </h2>
          <p className="text-white/80 text-sm" style={{ fontFamily: "var(--font-noto)" }}>
            अपनी जानकारी भरें और पाएं सरकारी नौकरी के सही अवसर
          </p>
        </div>

        {/* Profile Form Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-[#C5D0E0] mx-auto max-w-md overflow-hidden">
          {/* Form Header */}
          <div className="p-6 pb-0">
            <h2 className="text-xl font-bold text-[#0F2B5B] mb-1" style={{ fontFamily: "var(--font-noto)" }}>
              अपनी जानकारी भरें
            </h2>
            <p className="text-gray-500 text-sm mb-4" style={{ fontFamily: "var(--font-noto)" }}>
              हम आपके लिए सही भर्तियाँ ढूंढेंगे
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 pt-0 space-y-4">
            {/* Section A — Optional Personal Info (collapsed by default) */}
            <div className="border border-dashed border-[#C5D0E0] rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowPersonal(!showPersonal)}
                className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium text-[#1847A6] hover:bg-blue-50/50 transition-colors"
                style={{ fontFamily: "var(--font-noto)" }}
              >
                <span>{showPersonal ? '−' : '+'} अपना नाम और शहर जोड़ें (optional)</span>
                <span className="text-xs text-gray-400">{showPersonal ? '▲' : '▼'}</span>
              </button>

              {showPersonal && (
                <div className="px-4 pb-4 space-y-3 border-t border-dashed border-[#C5D0E0]">
                  <div className="pt-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-1" style={{ fontFamily: "var(--font-noto)" }}>
                      नाम (Name)
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      placeholder="उदाहरण: Ramesh Kumar"
                      className="w-full h-12 border-2 border-[#C5D0E0] rounded-xl px-4 text-base bg-[#F5F7FA] focus:bg-white focus:border-[#1847A6] focus:ring-3 focus:ring-blue-100 transition-all outline-none"
                      style={{ fontFamily: "var(--font-noto)" }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1" style={{ fontFamily: "var(--font-noto)" }}>
                      शहर / जिला
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      placeholder="उदाहरण: सरदारशहर, चुरू"
                      className="w-full h-12 border-2 border-[#C5D0E0] rounded-xl px-4 text-base bg-[#F5F7FA] focus:bg-white focus:border-[#1847A6] focus:ring-3 focus:ring-blue-100 transition-all outline-none"
                      style={{ fontFamily: "var(--font-noto)" }}
                    />
                  </div>
                  <div className="bg-blue-50 rounded-lg p-2.5">
                    <p className="text-xs text-[#1847A6]" style={{ fontFamily: "var(--font-noto)" }}>
                      💡 यह जानकारी सिर्फ आपको personalized अनुभव देने के लिए है — किसी के साथ share नहीं होती।
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Section B — Required Info */}
            {/* राज्य (State) - Locked */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: "var(--font-noto)" }}>
                राज्य (State) *
              </label>
              <div className="w-full h-13 border-2 border-[#C5D0E0] bg-[#F5F7FA] rounded-xl px-4 flex items-center">
                <span className="text-[#0F2B5B] font-semibold" style={{ fontFamily: "var(--font-noto)" }}>
                  🇮🇳 राजस्थान ✓
                </span>
              </div>
            </div>

            {/* लिंग (Gender) - Pill buttons */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: "var(--font-noto)" }}>
                लिंग (Gender) *
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => updateField("gender", "male")}
                  className={`flex-1 h-13 rounded-xl font-semibold transition-all ${
                    formData.gender === "male"
                      ? "bg-[#0F2B5B] text-white shadow-md"
                      : "bg-[#F5F7FA] text-gray-700 border-2 border-[#C5D0E0]"
                  }`}
                  style={{ fontFamily: "var(--font-noto)" }}
                >
                  👨 पुरुष
                </button>
                <button
                  type="button"
                  onClick={() => updateField("gender", "female")}
                  className={`flex-1 h-13 rounded-xl font-semibold transition-all ${
                    formData.gender === "female"
                      ? "bg-[#0F2B5B] text-white shadow-md"
                      : "bg-[#F5F7FA] text-gray-700 border-2 border-[#C5D0E0]"
                  }`}
                  style={{ fontFamily: "var(--font-noto)" }}
                >
                  👩 महिला
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: "var(--font-noto)" }}>
                Age relaxation के लिए जरूरी है
              </p>
            </div>

            {/* उम्र (Age) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: "var(--font-noto)" }}>
                आयु (Age) *
              </label>
              <input
                type="number"
                min="14"
                max="60"
                value={formData.age}
                onChange={(e) => updateField("age", e.target.value)}
                placeholder="उदाहरण: 22"
                className="w-full h-13 border-2 border-[#C5D0E0] rounded-xl px-4 text-base bg-[#F5F7FA] focus:bg-white focus:border-[#1847A6] focus:ring-3 focus:ring-blue-100 transition-all outline-none"
                style={{ fontFamily: "var(--font-noto)" }}
                required
              />
              <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: "var(--font-noto)" }}>
                आपकी उम्र से हम आपकी योग्यता calculate करते हैं
              </p>
            </div>

            {/* शिक्षा (Education) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: "var(--font-noto)" }}>
                शिक्षा (Education) *
              </label>
              <select
                value={formData.education}
                onChange={(e) => updateField("education", e.target.value)}
                className="w-full h-13 border-2 border-[#C5D0E0] rounded-xl px-4 text-base bg-[#F5F7FA] focus:bg-white focus:border-[#1847A6] focus:ring-3 focus:ring-blue-100 transition-all outline-none"
                style={{ fontFamily: "var(--font-noto)" }}
                required
              >
                <option value="" style={{ backgroundColor: "white" }}>-- चुनें --</option>
                <option value="8th" style={{ backgroundColor: "white" }}>8वीं पास (8th Pass)</option>
                <option value="10th" style={{ backgroundColor: "white" }}>10वीं पास (10th Pass)</option>
                <option value="12th" style={{ backgroundColor: "white" }}>12वीं पास (12th Pass)</option>
                <option value="graduation" style={{ backgroundColor: "white" }}>स्नातक (Graduation)</option>
                <option value="pg" style={{ backgroundColor: "white" }}>परास्नातक (Post Graduation)</option>
              </select>
            </div>

            {/* श्रेणी (Category) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: "var(--font-noto)" }}>
                श्रेणी (Category) *
              </label>
              <select
                value={formData.category}
                onChange={(e) => updateField("category", e.target.value)}
                className="w-full h-13 border-2 border-[#C5D0E0] rounded-xl px-4 text-base bg-[#F5F7FA] focus:bg-white focus:border-[#1847A6] focus:ring-3 focus:ring-blue-100 transition-all outline-none"
                style={{ fontFamily: "var(--font-noto)" }}
                required
              >
                <option value="" style={{ backgroundColor: "white" }}>-- चुनें --</option>
                <option value="general_ews" style={{ backgroundColor: "white" }}>सामान्य / EWS</option>
                <option value="obc_sbc" style={{ backgroundColor: "white" }}>OBC / SBC</option>
                <option value="sc" style={{ backgroundColor: "white" }}>अनुसूचित जाति (SC)</option>
                <option value="st" style={{ backgroundColor: "white" }}>अनुसूचित जनजाति (ST)</option>
              </select>
              <div className="bg-[#FFF3E8] border border-[#FF6B00] rounded-lg p-2 mt-2">
                <p className="text-xs text-[#FF6B00]" style={{ fontFamily: "var(--font-noto)" }}>
                  💡 OBC/SC/ST candidates को age relaxation मिलती है — Rajasthan domicile होना जरूरी है
                </p>
              </div>
            </div>

            {/* Section C — Optional Qualifications */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: "var(--font-noto)" }}>
                आपके पास क्या है? (जो हो वो tick करें)
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.hasRSCIT}
                    onChange={(e) => updateField("hasRSCIT", e.target.checked)}
                    className="w-5 h-5 accent-[#0F2B5B]"
                  />
                  <span style={{ fontFamily: "var(--font-noto)" }}>💻 RS-CIT या Computer Certificate</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.hasCET_graduate}
                    onChange={(e) => updateField("hasCET_graduate", e.target.checked)}
                    className="w-5 h-5 accent-[#0F2B5B]"
                  />
                  <span style={{ fontFamily: "var(--font-noto)" }}>📋 CET Graduate Level (2024+)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.hasCET_senior}
                    onChange={(e) => updateField("hasCET_senior", e.target.checked)}
                    className="w-5 h-5 accent-[#0F2B5B]"
                  />
                  <span style={{ fontFamily: "var(--font-noto)" }}>📋 CET Senior Secondary Level (2024+)</span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-gradient-to-r from-[#FF6B00] to-[#E55A00] hover:from-[#E56200] hover:to-[#CC5500] text-white text-lg font-bold rounded-xl mt-6 active:scale-95 transition-transform disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
              style={{ fontFamily: "var(--font-noto)" }}
            >
              {loading ? "ढूंढ रहे हैं..." : "🔍 योग्य भर्तियाँ ढूंढें"}
            </button>

            <p className="text-center text-[#FF6B00] font-medium" style={{ fontFamily: "var(--font-noto)" }}>
              🆓 पहले 5 सवाल बिल्कुल मुफ्त | No signup needed
            </p>
          </form>
        </div>

        {/* Trust Signals */}
        <div className="flex gap-3 justify-center py-6 mt-4 flex-wrap">
          <span className="bg-[#E8F5E9] text-[#138808] text-xs px-4 py-2 rounded-full font-medium">
            🔒 सुरक्षित
          </span>
          <span className="bg-[#E8F5E9] text-[#138808] text-xs px-4 py-2 rounded-full font-medium">
            ✅ हर सोमवार verified
          </span>
          <span className="bg-[#FFF3E8] text-[#FF6B00] text-xs px-4 py-2 rounded-full font-medium">
            🆓 5 सवाल free
          </span>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-gray-400 text-xs px-4 mt-4" style={{ fontFamily: "var(--font-noto)" }}>
          यह पोर्टल अनौपचारिक है। आधिकारिक जानकारी के लिए संबंधित विभाग की वेबसाइट देखें।
        </p>
      </div>
    </main>
  );
}