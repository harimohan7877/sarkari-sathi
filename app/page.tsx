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

  const handleBrowseWithoutProfile = async () => {
    setLoading(true);
    const dummyProfile = {
      name: "अतिथि उपयोगकर्ता",
      city: "जयपुर",
      state: "राजस्थान",
      age: "25",
      education: "graduation",
      category: "general_ews",
      gender: "male",
      hasRSCIT: true,
      hasCET_graduate: true,
      hasCET_senior: true,
    };

    if (!user) {
      const sessionToken = crypto.randomUUID();
      try {
        await supabase.from('guest_sessions').insert({
          session_token: sessionToken,
          name: dummyProfile.name,
          city: dummyProfile.city,
          age: parseInt(dummyProfile.age),
          education: dummyProfile.education,
          category: dummyProfile.category,
          gender: dummyProfile.gender,
          has_cet_graduate: dummyProfile.hasCET_graduate,
          has_cet_senior_secondary: dummyProfile.hasCET_senior,
          has_rscit: dummyProfile.hasRSCIT
        });
        sessionStorage.setItem('guestToken', sessionToken);
      } catch (err) {
        console.error('Guest session creation failed:', err);
      }
    } else {
      try {
        await supabase.from('user_profiles').update({
          name: dummyProfile.name,
          city: dummyProfile.city,
          age: parseInt(dummyProfile.age),
          education: dummyProfile.education,
          category: dummyProfile.category,
          gender: dummyProfile.gender,
          has_cet_graduate: dummyProfile.hasCET_graduate,
          has_cet_senior_secondary: dummyProfile.hasCET_senior,
          has_rscit: dummyProfile.hasRSCIT,
          updated_at: new Date().toISOString()
        }).eq('id', user.id);
      } catch (err) {
        console.error('Profile update failed:', err);
      }
    }

    sessionStorage.setItem('userProfile', JSON.stringify(dummyProfile));
    localStorage.setItem('userProfile', JSON.stringify(dummyProfile));
    router.push("/results");
  };

  const updateField = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <main className="min-h-screen bg-[#EEF2F8] relative overflow-hidden">
      {/* Decorative background glows for premium feel */}
      <div className="absolute w-96 h-96 rounded-full bg-orange-500/5 blur-3xl -top-20 -left-20 pointer-events-none" />
      <div className="absolute w-96 h-96 rounded-full bg-blue-500/5 blur-3xl top-1/2 right-0 pointer-events-none" />

      {/* Tiranga stripe */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF6B00] via-white to-[#138808] z-[60]" />

      {/* Header */}
      <div className="bg-gradient-to-r from-[#0F2B5B] to-[#1847A6] h-20 px-6 flex items-center justify-between fixed top-1 w-full z-50 shadow-md border-b border-white/10 rounded-b-xl">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-8 bg-[#FF6B00] rounded-full" />
          <div>
            <h1 className="text-white text-xl font-extrabold tracking-tight" style={{ fontFamily: "var(--font-noto)" }}>
              🏛️ सरकारी साथी
            </h1>
            <p className="text-white/60 text-[10px]" style={{ fontFamily: "var(--font-noto)" }}>
              राजस्थान सरकारी भर्ती पोर्टल
            </p>
          </div>
        </div>
        {/* Login button */}
        {user ? (
          <Link href="/dashboard">
            <div className="w-9 h-9 bg-white/15 hover:bg-white/25 rounded-full flex items-center justify-center text-white text-sm font-bold border border-white/20 transition-all cursor-pointer">
              {user.email?.[0]?.toUpperCase() || '?'}
            </div>
          </Link>
        ) : (
          <Link
            href="/auth"
            className="text-white/95 text-xs font-semibold border border-white/20 bg-white/5 px-4 py-2 rounded-full hover:bg-white/15 transition-all shadow-sm"
            style={{ fontFamily: "var(--font-noto)" }}
          >
            Login
          </Link>
        )}
      </div>

      {/* Main Content */}
      <div className="pt-24 pb-12 px-4 max-w-md mx-auto relative z-10">
        {/* Scrolling News Ticker */}
        <div className="bg-orange-500/10 border border-[#FF6B00]/30 rounded-xl p-2.5 mb-4 flex items-center overflow-hidden shadow-sm animate-slide-up">
          <span className="bg-[#FF6B00] text-white text-[10px] font-extrabold px-2 py-1 rounded shrink-0 mr-3 flex items-center gap-1 select-none" style={{ fontFamily: "var(--font-noto)" }}>
            बड़ी खबरें 📢
          </span>
          <div className="relative w-full overflow-hidden h-5 flex items-center">
            <div className="animate-marquee whitespace-nowrap flex gap-8 text-[11px] text-[#0F2B5B] font-bold" style={{ fontFamily: "var(--font-noto)" }}>
              <span>🔥 CET 2024 परीक्षा तिथि घोषित - विस्तृत कार्यक्रम जल्द!</span>
              <span>📢 RSMSSB LDC 2024 आवेदन तिथि समाप्त, तैयारी शुरू करें!</span>
              <span>🆕 छात्रावास अधीक्षक ग्रेड-II भर्ती परीक्षा जुलाई में!</span>
              <span>🎯 सरकारी साथी AI से जानें अपनी योग्यता अनुसार बेस्ट जॉब्स!</span>
            </div>
          </div>
        </div>

        {/* Welcome Card */}
        <div className="bg-gradient-to-br from-[#0f2b5b] via-[#143770] to-[#1847a6] rounded-2xl p-6 mb-6 text-white shadow-xl shadow-blue-900/10 border border-white/5 animate-slide-up">
          <h2 className="text-lg font-bold flex items-center gap-2" style={{ fontFamily: "var(--font-noto)" }}>
            {formData.name ? `नमस्ते ${formData.name}! 🙏` : 'नमस्ते! 🙏'}
          </h2>
          <p className="text-white/70 text-xs mt-1.5 leading-relaxed" style={{ fontFamily: "var(--font-noto)" }}>
            अपनी शैक्षणिक योग्यता और आयु भरें, हमारा AI सिस्टम आपके लिए राजस्थान की सही सरकारी नौकरियों के अवसर खोजेगा।
          </p>
        </div>

        {/* Profile Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-[#C5D0E0]/60 overflow-hidden animate-slide-up" style={{ animationDelay: '100ms' }}>
          {/* Form Header */}
          <div className="p-6 pb-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-[#0F2B5B]" style={{ fontFamily: "var(--font-noto)" }}>
              अपनी जानकारी दर्ज करें
            </h2>
            <p className="text-gray-400 text-xs mt-0.5" style={{ fontFamily: "var(--font-noto)" }}>
              सभी जानकारियाँ पूर्ण और सही भरें
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Section A — Optional Personal Info */}
            <div className="border border-dashed border-[#C5D0E0] rounded-xl overflow-hidden bg-gray-50/50">
              <button
                type="button"
                onClick={() => setShowPersonal(!showPersonal)}
                className="w-full px-4 py-3 flex items-center justify-between text-xs font-semibold text-[#1847A6] hover:bg-blue-50/50 transition-colors outline-none"
                style={{ fontFamily: "var(--font-noto)" }}
              >
                <span>{showPersonal ? '−' : '+'} अपना नाम और शहर जोड़ें (वैकल्पिक)</span>
                <span className="text-[10px] text-gray-400">{showPersonal ? '▲' : '▼'}</span>
              </button>

              {showPersonal && (
                <div className="px-4 pb-4 space-y-3 border-t border-dashed border-[#C5D0E0] bg-white">
                  <div className="pt-3">
                    <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-noto)" }}>
                      नाम (Name)
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      placeholder="उदाहरण: Ramesh Kumar"
                      className="w-full h-11 border border-[#C5D0E0] rounded-xl px-4 text-sm bg-gray-50/50 text-[#0D1B2A] focus:bg-white focus:border-[#1847A6] focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                      style={{ fontFamily: "var(--font-noto)" }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-noto)" }}>
                      शहर / जिला (City / District)
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      placeholder="उदाहरण: सरदारशहर, चुरू"
                      className="w-full h-11 border border-[#C5D0E0] rounded-xl px-4 text-sm bg-gray-50/50 text-[#0D1B2A] focus:bg-white focus:border-[#1847A6] focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                      style={{ fontFamily: "var(--font-noto)" }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Section B — Required Info */}
            {/* State - Locked */}
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5" style={{ fontFamily: "var(--font-noto)" }}>
                राज्य (State) *
              </label>
              <div className="w-full h-12 border border-[#C5D0E0] bg-gray-50 rounded-xl px-4 flex items-center justify-between">
                <span className="text-[#0F2B5B] text-sm font-semibold" style={{ fontFamily: "var(--font-noto)" }}>
                  🇮🇳 राजस्थान Domicile
                </span>
                <span className="text-[#138808] text-xs font-bold bg-[#E8F5E9] px-2 py-0.5 rounded-full">✓ Locked</span>
              </div>
            </div>

            {/* Gender - Pill buttons */}
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5" style={{ fontFamily: "var(--font-noto)" }}>
                लिंग (Gender) *
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => updateField("gender", "male")}
                  className={`flex-1 h-12 rounded-xl text-sm font-bold transition-all ${
                    formData.gender === "male"
                      ? "bg-[#0F2B5B] text-white shadow-md shadow-blue-900/25 border border-transparent"
                      : "bg-[#F5F7FA] text-[#0D1B2A] border border-[#C5D0E0] hover:bg-gray-100"
                  }`}
                  style={{ fontFamily: "var(--font-noto)" }}
                >
                  👨 पुरुष (Male)
                </button>
                <button
                  type="button"
                  onClick={() => updateField("gender", "female")}
                  className={`flex-1 h-12 rounded-xl text-sm font-bold transition-all ${
                    formData.gender === "female"
                      ? "bg-[#0F2B5B] text-white shadow-md shadow-blue-900/25 border border-transparent"
                      : "bg-[#F5F7FA] text-[#0D1B2A] border border-[#C5D0E0] hover:bg-gray-100"
                  }`}
                  style={{ fontFamily: "var(--font-noto)" }}
                >
                  👩 महिला (Female)
                </button>
              </div>
            </div>

            {/* Age */}
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5" style={{ fontFamily: "var(--font-noto)" }}>
                आयु (Age) *
              </label>
              <input
                type="number"
                min="14"
                max="60"
                value={formData.age}
                onChange={(e) => updateField("age", e.target.value)}
                placeholder="उदाहरण: 22"
                className="w-full h-12 border border-[#C5D0E0] rounded-xl px-4 text-sm bg-gray-50/50 text-[#0D1B2A] focus:bg-white focus:border-[#1847A6] focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                style={{ fontFamily: "var(--font-noto)" }}
                required
              />
            </div>

            {/* Education */}
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5" style={{ fontFamily: "var(--font-noto)" }}>
                उच्चतम शिक्षा (Highest Education) *
              </label>
              <select
                value={formData.education}
                onChange={(e) => updateField("education", e.target.value)}
                className="w-full h-12 border border-[#C5D0E0] rounded-xl px-4 text-sm bg-gray-50/50 text-[#0D1B2A] focus:bg-white focus:border-[#1847A6] focus:ring-4 focus:ring-blue-100 transition-all outline-none cursor-pointer"
                style={{ fontFamily: "var(--font-noto)" }}
                required
              >
                <option value="" className="text-gray-500">-- चुनें --</option>
                <option value="8th" className="text-[#0D1B2A]">8वीं पास (8th Pass)</option>
                <option value="10th" className="text-[#0D1B2A]">10वीं पास (10th Pass)</option>
                <option value="12th" className="text-[#0D1B2A]">12वीं पास (12th Pass)</option>
                <option value="graduation" className="text-[#0D1B2A]">स्नातक (Graduation)</option>
                <option value="pg" className="text-[#0D1B2A]">परास्नातक (Post Graduation)</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5" style={{ fontFamily: "var(--font-noto)" }}>
                आरक्षण श्रेणी (Category) *
              </label>
              <select
                value={formData.category}
                onChange={(e) => updateField("category", e.target.value)}
                className="w-full h-12 border border-[#C5D0E0] rounded-xl px-4 text-sm bg-gray-50/50 text-[#0D1B2A] focus:bg-white focus:border-[#1847A6] focus:ring-4 focus:ring-blue-100 transition-all outline-none cursor-pointer"
                style={{ fontFamily: "var(--font-noto)" }}
                required
              >
                <option value="" className="text-gray-500">-- चुनें --</option>
                <option value="general_ews" className="text-[#0D1B2A]">सामान्य / EWS</option>
                <option value="obc_sbc" className="text-[#0D1B2A]">OBC / SBC</option>
                <option value="sc" className="text-[#0D1B2A]">अनुसूचित जाति (SC)</option>
                <option value="st" className="text-[#0D1B2A]">अनुसूचित जनजाति (ST)</option>
              </select>
            </div>

            {/* Section C — Optional Qualifications */}
            <div className="space-y-2.5 border-t border-gray-100 pt-4">
              <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-noto)" }}>
                विशेष योग्यता / सर्टिफिकेट्स (यदि उपलब्ध हो)
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer p-2 rounded-xl hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.hasRSCIT}
                    onChange={(e) => updateField("hasRSCIT", e.target.checked)}
                    className="w-5 h-5 accent-[#0F2B5B] rounded"
                  />
                  <span className="text-xs font-medium text-gray-700" style={{ fontFamily: "var(--font-noto)" }}>
                    💻 RS-CIT कंप्यूटर सर्टिफिकेट
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-2 rounded-xl hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.hasCET_graduate}
                    onChange={(e) => updateField("hasCET_graduate", e.target.checked)}
                    className="w-5 h-5 accent-[#0F2B5B] rounded"
                  />
                  <span className="text-xs font-medium text-gray-700" style={{ fontFamily: "var(--font-noto)" }}>
                    📋 CET Graduate Level उत्तीर्ण (2024+)
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-2 rounded-xl hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.hasCET_senior}
                    onChange={(e) => updateField("hasCET_senior", e.target.checked)}
                    className="w-5 h-5 accent-[#0F2B5B] rounded"
                  />
                  <span className="text-xs font-medium text-gray-700" style={{ fontFamily: "var(--font-noto)" }}>
                    📋 CET Senior Secondary उत्तीर्ण (2024+)
                  </span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-13 bg-gradient-to-r from-[#FF6B00] to-[#E55A00] hover:from-[#E55A00] hover:to-[#cc5000] text-white text-base font-bold rounded-xl mt-6 active:scale-95 transition-transform disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:shadow-orange-500/10 cursor-pointer"
              style={{ fontFamily: "var(--font-noto)" }}
            >
              {loading ? "खोज रहे हैं..." : "🔍 योग्य भर्तियाँ ढूंढें"}
            </button>

            {/* Browse Without Profile Button */}
            <button
              type="button"
              onClick={handleBrowseWithoutProfile}
              disabled={loading}
              className="w-full h-11 bg-white hover:bg-gray-50 text-[#0F2B5B] border border-[#C5D0E0] text-sm font-bold rounded-xl mt-3 active:scale-95 transition-transform disabled:opacity-60 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
              style={{ fontFamily: "var(--font-noto)" }}
            >
              👀 बिना जानकारी के देखें (अतिथि मोड)
            </button>
          </form>
        </div>

        {/* How It Works Section */}
        <div className="bg-white rounded-2xl p-6 shadow-md border border-[#C5D0E0]/60 mt-6 space-y-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <h3 className="text-sm font-extrabold text-[#0F2B5B] flex items-center gap-2 border-b border-gray-100 pb-2" style={{ fontFamily: "var(--font-noto)" }}>
            ⚙️ सरकारी साथी कैसे काम करता है?
          </h3>
          <div className="grid grid-cols-1 gap-3.5">
            {/* Step 1 */}
            <div className="flex gap-3.5 items-start">
              <div className="w-6 h-6 rounded-full bg-[#0F2B5B] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                1
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-800" style={{ fontFamily: "var(--font-noto)" }}>
                  अपनी योग्यता दर्ज करें
                </h4>
                <p className="text-[11px] text-gray-500 leading-relaxed" style={{ fontFamily: "var(--font-noto)" }}>
                  अपनी आयु, शिक्षा (10वीं, 12वीं, स्नातक) और अन्य विवरण भरें।
                </p>
              </div>
            </div>
            {/* Step 2 */}
            <div className="flex gap-3.5 items-start">
              <div className="w-6 h-6 rounded-full bg-[#FF6B00] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                2
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-800" style={{ fontFamily: "var(--font-noto)" }}>
                  AI खोजेगा बेस्ट भर्तियां
                </h4>
                <p className="text-[11px] text-gray-500 leading-relaxed" style={{ fontFamily: "var(--font-noto)" }}>
                  हमारा स्मार्ट AI सिस्टम तुरंत आपकी योग्यता अनुसार राजस्थान की एक्टिव सरकारी नौकरियों की सूची दिखाएगा।
                </p>
              </div>
            </div>
            {/* Step 3 */}
            <div className="flex gap-3.5 items-start">
              <div className="w-6 h-6 rounded-full bg-[#138808] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                3
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-800" style={{ fontFamily: "var(--font-noto)" }}>
                  Syllabus, PYQ और AI चैट
                </h4>
                <p className="text-[11px] text-gray-500 leading-relaxed" style={{ fontFamily: "var(--font-noto)" }}>
                  प्रत्येक परीक्षा का विस्तृत सिलेबस, पुराने प्रश्न पत्र देखें और AI गाइड से कभी भी सवाल पूछें।
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Signals */}
        <div className="flex gap-3 justify-center py-6 mt-2 flex-wrap">
          <span className="bg-[#E8F5E9] text-[#138808] text-xs px-4 py-2 rounded-full font-bold shadow-sm">
            🔒 सुरक्षित
          </span>
          <span className="bg-[#E8F5E9] text-[#138808] text-xs px-4 py-2 rounded-full font-bold shadow-sm">
            ✅ हर सोमवार verified
          </span>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-gray-400 text-[10px] px-6 mt-2 leading-relaxed" style={{ fontFamily: "var(--font-noto)" }}>
          यह पोर्टल अनौपचारिक है। अधिकारिक व सटीक जानकारी के लिए हमेशा संबंधित सरकारी विभाग की आधिकारिक वेबसाइट देखें।
        </p>
      </div>
    </main>
  );
}