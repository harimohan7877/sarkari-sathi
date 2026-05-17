"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    state: "राजस्थान",
    age: "",
    education: "",
    category: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.age || !formData.education || !formData.category) {
      alert("कृपया सभी जानकारी भरें!");
      return;
    }
    setLoading(true);
    localStorage.setItem("userProfile", JSON.stringify(formData));
    setTimeout(() => {
      router.push("/exams");
    }, 500);
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <main className="min-h-screen bg-[#EEF2F8]">
      {/* Header - Navy with Saffron accent */}
      <div className="bg-[#0F2B5B] h-24 px-4 flex items-end pb-3 fixed top-0 w-full z-50 shadow-lg">
        <div className="flex items-center gap-3">
          {/* Saffron Bar */}
          <div className="w-1 h-10 bg-[#FF6B00] rounded-full" />
          <div>
            <h1 className="text-white text-2xl font-bold" style={{ fontFamily: "var(--font-noto)" }}>
              सरकारी साथी
            </h1>
            <p className="text-white/70 text-xs" style={{ fontFamily: "var(--font-noto)" }}>
              राजस्थान सरकारी भर्ती पोर्टल
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-28 pb-8 px-4">
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-[#0F2B5B] to-[#1847A6] rounded-2xl p-6 mx-auto max-w-md mb-6 text-white">
          <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-noto)" }}>
            नमस्ते! 🙏
          </h2>
          <p className="text-white/80 text-sm" style={{ fontFamily: "var(--font-noto)" }}>
            अपनी जानकारी भरें और पाएं सरकारी नौकरी के सही अवसर
          </p>
        </div>

        {/* Profile Form Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-[#C5D0E0] mx-auto max-w-md p-6">
          <h2 className="text-xl font-bold text-[#0F2B5B] mb-1" style={{ fontFamily: "var(--font-noto)" }}>
            अपनी जानकारी भरें
          </h2>
          <p className="text-gray-500 text-sm mb-6" style={{ fontFamily: "var(--font-noto)" }}>
            हम आपके लिए सही भर्तियाँ ढूंढेंगे
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* राज्य (State) - Auto selected */}
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

            {/* उम्र (Age) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: "var(--font-noto)" }}>
                आयु (Age) *
              </label>
              <input
                type="number"
                min="18"
                max="60"
                value={formData.age}
                onChange={(e) => updateField("age", e.target.value)}
                placeholder="अपनी आयु लिखें"
                className="w-full h-13 border-2 border-[#C5D0E0] rounded-xl px-4 text-base bg-[#F5F7FA] focus:bg-white focus:border-[#1847A6] focus:ring-3 focus:ring-blue-100 transition-all outline-none"
                style={{ fontFamily: "var(--font-noto)" }}
                required
              />
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
            </div>

            {/* Submit Button - Saffron */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-[#FF6B00] hover:bg-[#E56200] text-white text-lg font-bold rounded-xl mt-6 active:scale-95 transition-transform disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
              style={{ fontFamily: "var(--font-noto)" }}
            >
              {loading ? "ढूंढ रहे हैं..." : "🔍 योग्य भर्तियाँ ढूंढें"}
            </button>
          </form>
        </div>

        {/* Trust Signals */}
        <div className="flex gap-3 justify-center py-6 mt-4">
          <span className="bg-[#E8F5E9] text-[#138808] text-xs px-4 py-2 rounded-full font-medium">
            🔒 सुरक्षित
          </span>
          <span className="bg-[#E8F5E9] text-[#138808] text-xs px-4 py-2 rounded-full font-medium">
            ✅ Verified Data
          </span>
          <span className="bg-[#FFF3E8] text-[#FF6B00] text-xs px-4 py-2 rounded-full font-medium">
            🆓 निःशुल्क
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