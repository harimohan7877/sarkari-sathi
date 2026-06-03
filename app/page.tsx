"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../lib/supabase";
import { User } from "@/lib/types";
import examsData from "@/data/exams.json";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
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
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user);
    });
  }, []);

  const updateField = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const canGoNext = (): boolean => {
    if (step === 1) return !!formData.gender && !!formData.age;
    if (step === 2) return !!formData.education && !!formData.category;
    return true;
  };

  const handleSubmit = async () => {
    if (!formData.age || !formData.education || !formData.category || !formData.gender) {
      alert("कृपया सभी जानकारी भरें!");
      return;
    }
    setLoading(true);

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
          has_rscit: formData.hasRSCIT,
        });
        sessionStorage.setItem('guestToken', sessionToken);
      } catch (err) {
        console.error('Guest session creation failed:', err);
      }
    } else {
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
          updated_at: new Date().toISOString(),
        }).eq('id', user.id);
      } catch (err) {
        console.error('Profile update failed:', err);
      }
    }

    sessionStorage.setItem('userProfile', JSON.stringify(formData));
    localStorage.setItem('userProfile', JSON.stringify(formData));

    router.push("/results");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/results?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      document.getElementById('wizard')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const liveExamCount = examsData.exams.filter((e: any) => e.status === 'open' || e.status === 'upcoming').length;
  const boards = Array.from(new Set(examsData.exams.map((e: any) => e.board))).slice(0, 3);

  return (
    <main className="min-h-screen bg-[hsl(210,40%,98%)] font-noto">
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[hsl(24,100%,50%)] via-white to-[hsl(142,70%,29%)] z-[60]" />

      <header className="bg-[hsl(222,47%,12%)] h-16 px-4 lg:px-10 flex items-center fixed top-1 left-0 right-0 z-50 shadow-lg">
        <div className="flex items-center gap-3 flex-1 max-w-7xl mx-auto w-full">
          <div className="w-1 h-9 bg-[hsl(24,100%,50%)] rounded-full" />
          <div>
            <h1 className="text-white text-lg lg:text-xl font-bold font-outfit" style={{ letterSpacing: '-0.01em' }}>
              🏛️ सरकारी साथी
            </h1>
            <p className="text-white/60 text-[10px] lg:text-xs font-noto">
              राजस्थान सरकारी भर्ती पोर्टल
            </p>
          </div>
          <div className="ml-auto">
            {user ? (
              <Link href="/dashboard">
                <div className="w-9 h-9 bg-white/15 rounded-full flex items-center justify-center text-white text-sm font-bold hover:bg-white/25 transition-colors">
                  {user.email?.[0]?.toUpperCase() || '?'}
                </div>
              </Link>
            ) : (
              <Link
                href="/auth"
                className="text-white/90 text-sm border border-white/30 px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors font-noto"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="pt-24 pb-10 px-4 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[hsl(222,47%,12%)] via-[hsl(217,91%,30%)] to-[hsl(217,91%,60%)] p-8 lg:p-14 text-white shadow-elevated">
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-[hsl(24,100%,50%)]/20 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-[hsl(142,70%,29%)]/20 blur-3xl" />

            <div className="relative grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium mb-4 border border-white/20">
                  <span className="w-2 h-2 rounded-full bg-[hsl(142,70%,50%)] animate-soft-pulse" />
                  Live • हर सोमवार verified
                </span>
                <h2 className="text-3xl lg:text-5xl font-extrabold leading-tight font-outfit mb-3" style={{ letterSpacing: '-0.02em' }}>
                  राजस्थान सरकारी भर्ती पोर्टल
                </h2>
                <p className="text-lg lg:text-xl text-white/85 font-noto mb-1">
                  आपका भविष्य, आपका साथी 🇮🇳
                </p>
                <p className="text-sm lg:text-base text-white/70 font-noto mb-6 max-w-md">
                  अपनी योग्यता दर्ज करें और 100% सत्यापित सरकारी भर्तियों की सूची पाएं — बिल्कुल मुफ्त।
                </p>

                <form onSubmit={handleSearchSubmit} className={`flex flex-col sm:flex-row gap-2 backdrop-blur-md p-2 rounded-2xl border transition-all max-w-xl ${searchFocused ? 'bg-white/20 border-white/40 shadow-2xl' : 'bg-white/10 border-white/20'}`}>
                  <div className="flex-1 flex items-center gap-3 px-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[hsl(24,100%,55%)] to-[hsl(24,100%,40%)] flex items-center justify-center shadow-lg flex-shrink-0 ring-2 ring-white/20">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() => setSearchFocused(false)}
                      placeholder="परीक्षा या बोर्ड खोजें..."
                      className="flex-1 bg-transparent outline-none text-white placeholder:text-white/50 text-sm lg:text-base py-2 font-noto"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white/80 text-xs flex-shrink-0 transition-colors"
                        aria-label="Clear"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-[hsl(24,100%,55%)] to-[hsl(24,100%,40%)] hover:from-[hsl(24,100%,50%)] hover:to-[hsl(24,100%,35%)] text-white font-bold px-6 py-3 rounded-xl transition-all active:scale-95 font-noto shadow-lg flex items-center justify-center gap-2"
                  >
                    खोजें
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </button>
                </form>
              </div>

              <div className="grid grid-cols-3 gap-3 lg:gap-4">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 lg:p-5 text-center">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-[hsl(142,70%,50%)]/20 flex items-center justify-center">
                    <span className="w-3 h-3 rounded-full bg-[hsl(142,70%,50%)] animate-soft-pulse" />
                  </div>
                  <p className="text-2xl lg:text-3xl font-extrabold font-outfit">{liveExamCount}+</p>
                  <p className="text-[10px] lg:text-xs text-white/80 font-noto leading-tight mt-1">लाइव भर्तियां</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 lg:p-5 text-center">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-[hsl(24,100%,50%)]/20 flex items-center justify-center text-lg">✅</div>
                  <p className="text-sm lg:text-base font-extrabold font-outfit leading-tight">
                    {boards.join(', ')}
                  </p>
                  <p className="text-[10px] lg:text-xs text-white/80 font-noto leading-tight mt-1">सत्यापित बोर्ड्स</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 lg:p-5 text-center">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-white/20 flex items-center justify-center text-lg">📚</div>
                  <p className="text-2xl lg:text-3xl font-extrabold font-outfit">50+</p>
                  <p className="text-[10px] lg:text-xs text-white/80 font-noto leading-tight mt-1">मुफ्त वीडियो</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Pills */}
      <section className="px-4 lg:px-10 pb-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-bold text-[hsl(215,16%,35%)] mb-3 font-noto px-1">⚡ तेज़ ब्राउज़:</p>
          <div className="flex gap-2 overflow-x-auto pb-1 scroll-hidden">
            {[
              { label: '🎓 स्नातक पास', edu: 'graduation' },
              { label: '💼 12वीं पास', edu: '12th' },
              { label: '💻 कम्प्यूटर जॉब्स', edu: 'rscit' },
              { label: '📋 CET आवश्यक', edu: 'cet' },
              { label: '👮 पुलिस भर्ती', edu: 'police' },
              { label: '📚 BSTC', edu: 'bstc' },
            ].map((pill) => (
              <button
                key={pill.label}
                onClick={() => {
                  setFormData((p) => ({ ...p, education: pill.edu }));
                  document.getElementById('wizard')?.scrollIntoView({ behavior: 'smooth' });
                  setStep(2);
                }}
                className="flex-shrink-0 bg-white border border-[hsl(214,32%,91%)] hover:border-[hsl(217,91%,60%)] hover:bg-[hsl(217,91%,98%)] px-4 py-2.5 rounded-full text-sm font-medium text-[hsl(222,47%,12%)] transition-all shadow-soft font-noto"
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* WIZARD */}
      <section id="wizard" className="px-4 lg:px-10 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-[1fr_360px] gap-8">
            <div className="bg-white rounded-3xl shadow-elevated border border-[hsl(214,32%,91%)] overflow-hidden">
              <div className="bg-[hsl(210,40%,98%)] px-6 py-5 border-b border-[hsl(214,32%,91%)]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg lg:text-xl font-bold text-[hsl(222,47%,12%)] font-outfit">अपनी जानकारी भरें</h3>
                  <span className="text-xs font-bold text-[hsl(217,91%,60%)] font-outfit">चरण {step} / 3</span>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3].map((s) => (
                    <div
                      key={s}
                      className={`flex-1 h-1.5 rounded-full transition-all ${s <= step ? 'bg-[hsl(217,91%,60%)]' : 'bg-[hsl(214,32%,91%)]'}`}
                    />
                  ))}
                </div>
              </div>

              <div className="p-6 lg:p-8 min-h-[400px]">
                {step === 1 && (
                  <div className="space-y-5 wizard-step">
                    <div>
                      <h4 className="text-base font-bold text-[hsl(222,47%,12%)] mb-1 font-noto">👤 व्यक्तिगत विवरण</h4>
                      <p className="text-sm text-[hsl(215,16%,55%)] font-noto">पहले अपनी basic जानकारी दें</p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-[hsl(222,47%,12%)] mb-1.5 font-noto">नाम (Name)</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => updateField('name', e.target.value)}
                          placeholder="उदाहरण: Ramesh Kumar"
                          className="w-full h-12 border-2 border-[hsl(214,32%,91%)] rounded-xl px-4 text-base bg-[hsl(210,40%,96%)] focus:bg-white focus:border-[hsl(217,91%,60%)] focus:ring-2 focus:ring-[hsl(217,91%,60%)]/20 transition-all outline-none font-noto"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[hsl(222,47%,12%)] mb-1.5 font-noto">शहर / जिला</label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => updateField('city', e.target.value)}
                          placeholder="उदाहरण: सरदारशहर, चुरू"
                          className="w-full h-12 border-2 border-[hsl(214,32%,91%)] rounded-xl px-4 text-base bg-[hsl(210,40%,96%)] focus:bg-white focus:border-[hsl(217,91%,60%)] focus:ring-2 focus:ring-[hsl(217,91%,60%)]/20 transition-all outline-none font-noto"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[hsl(222,47%,12%)] mb-2 font-noto">राज्य (State)</label>
                      <div className="w-full h-12 border-2 border-[hsl(214,32%,91%)] bg-[hsl(210,40%,96%)] rounded-xl px-4 flex items-center font-noto">
                        <span className="text-[hsl(222,47%,12%)] font-semibold">🇮🇳 राजस्थान ✓</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[hsl(222,47%,12%)] mb-2 font-noto">लिंग (Gender) *</label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { val: 'male', label: '👨 पुरुष' },
                          { val: 'female', label: '👩 महिला' },
                        ].map((g) => (
                          <button
                            key={g.val}
                            type="button"
                            onClick={() => updateField('gender', g.val)}
                            className={`h-12 rounded-xl font-semibold transition-all font-noto ${
                              formData.gender === g.val
                                ? 'bg-gradient-to-r from-[hsl(222,47%,12%)] to-[hsl(217,91%,60%)] text-white shadow-elevated'
                                : 'bg-[hsl(210,40%,96%)] text-[hsl(222,47%,12%)] border-2 border-[hsl(214,32%,91%)]'
                            }`}
                          >
                            {g.label}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-[hsl(215,16%,55%)] mt-1.5 font-noto">Age relaxation के लिए जरूरी है</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[hsl(222,47%,12%)] mb-2 font-noto">आयु (Age) *</label>
                      <input
                        type="number"
                        min="14"
                        max="60"
                        value={formData.age}
                        onChange={(e) => updateField('age', e.target.value)}
                        placeholder="उदाहरण: 22"
                        className="w-full h-12 border-2 border-[hsl(214,32%,91%)] rounded-xl px-4 text-base bg-[hsl(210,40%,96%)] focus:bg-white focus:border-[hsl(217,91%,60%)] focus:ring-2 focus:ring-[hsl(217,91%,60%)]/20 transition-all outline-none font-outfit"
                      />
                      <p className="text-xs text-[hsl(215,16%,55%)] mt-1.5 font-noto">आपकी उम्र से हम आपकी योग्यता calculate करते हैं</p>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-5 wizard-step">
                    <div>
                      <h4 className="text-base font-bold text-[hsl(222,47%,12%)] mb-1 font-noto">🎓 शैक्षणिक योग्यता</h4>
                      <p className="text-sm text-[hsl(215,16%,55%)] font-noto">अपनी सबसे ऊंची पढ़ाई और श्रेणी चुनें</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[hsl(222,47%,12%)] mb-2 font-noto">शिक्षा (Education) *</label>
                      <select
                        value={formData.education}
                        onChange={(e) => updateField('education', e.target.value)}
                        className="w-full h-12 border-2 border-[hsl(214,32%,91%)] rounded-xl px-4 text-base bg-[hsl(210,40%,96%)] focus:bg-white focus:border-[hsl(217,91%,60%)] focus:ring-2 focus:ring-[hsl(217,91%,60%)]/20 transition-all outline-none font-noto"
                      >
                        <option value="">-- चुनें --</option>
                        <option value="8th">8वीं पास (8th Pass)</option>
                        <option value="10th">10वीं पास (10th Pass)</option>
                        <option value="12th">12वीं पास (12th Pass)</option>
                        <option value="graduation">स्नातक (Graduation)</option>
                        <option value="pg">परास्नातक (Post Graduation)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[hsl(222,47%,12%)] mb-2 font-noto">श्रेणी (Category) *</label>
                      <select
                        value={formData.category}
                        onChange={(e) => updateField('category', e.target.value)}
                        className="w-full h-12 border-2 border-[hsl(214,32%,91%)] rounded-xl px-4 text-base bg-[hsl(210,40%,96%)] focus:bg-white focus:border-[hsl(217,91%,60%)] focus:ring-2 focus:ring-[hsl(217,91%,60%)]/20 transition-all outline-none font-noto"
                      >
                        <option value="">-- चुनें --</option>
                        <option value="general_ews">सामान्य / EWS</option>
                        <option value="obc_sbc">OBC / SBC</option>
                        <option value="sc">अनुसूचित जाति (SC)</option>
                        <option value="st">अनुसूचित जनजाति (ST)</option>
                      </select>
                      <div className="mt-3 bg-[hsl(24,100%,97%)] border border-[hsl(24,100%,80%)] rounded-lg p-3">
                        <p className="text-xs text-[hsl(24,80%,30%)] font-noto">
                          💡 OBC/SC/ST candidates को age relaxation मिलती है — Rajasthan domicile होना जरूरी है
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-5 wizard-step">
                    <div>
                      <h4 className="text-base font-bold text-[hsl(222,47%,12%)] mb-1 font-noto">📋 अतिरिक्त प्रमाणपत्र</h4>
                      <p className="text-sm text-[hsl(215,16%,55%)] font-noto">जो भी हो, वो tick करें (optional)</p>
                    </div>

                    {[
                      { key: 'hasRSCIT', emoji: '💻', title: 'RS-CIT या Computer Certificate', desc: 'Rajasthan का basic computer course' },
                      { key: 'hasCET_graduate', emoji: '📋', title: 'CET Graduate Level (2024+)', desc: 'RSMSSB के लिए अनिवार्य है' },
                      { key: 'hasCET_senior', emoji: '📋', title: 'CET Senior Secondary Level (2024+)', desc: '12वीं pass candidates के लिए' },
                    ].map((c) => {
                      const selected = (formData as any)[c.key];
                      return (
                        <button
                          key={c.key}
                          type="button"
                          onClick={() => updateField(c.key, !selected)}
                          className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                            selected
                              ? 'border-[hsl(217,91%,60%)] bg-[hsl(217,91%,97%)]'
                              : 'border-[hsl(214,32%,91%)] bg-white hover:border-[hsl(217,91%,60%)]/50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              selected ? 'bg-[hsl(217,91%,60%)] border-[hsl(217,91%,60%)]' : 'border-[hsl(214,32%,80%)]'
                            }`}>
                              {selected && <span className="text-white text-xs">✓</span>}
                            </div>
                            <div className="flex-1">
                              <p className="text-base font-semibold text-[hsl(222,47%,12%)] font-noto">{c.emoji} {c.title}</p>
                              <p className="text-xs text-[hsl(215,16%,55%)] mt-0.5 font-noto">{c.desc}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="px-6 lg:px-8 py-5 bg-[hsl(210,40%,98%)] border-t border-[hsl(214,32%,91%)] flex items-center gap-3">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="h-12 px-5 border-2 border-[hsl(214,32%,91%)] text-[hsl(222,47%,12%)] font-bold rounded-xl hover:bg-white transition-colors font-noto"
                  >
                    🔙 पीछे
                  </button>
                ) : (
                  <div className="w-20" />
                )}

                {step < 3 ? (
                  <button
                    type="button"
                    disabled={!canGoNext()}
                    onClick={() => canGoNext() && setStep(step + 1)}
                    className="flex-1 h-12 bg-gradient-to-r from-[hsl(217,91%,60%)] to-[hsl(222,47%,12%)] text-white font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-elevated active:scale-[0.99] transition-all font-noto"
                  >
                    आगे बढ़ें ➡️
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleSubmit}
                    className="flex-1 h-12 bg-gradient-to-r from-[hsl(24,100%,50%)] to-[hsl(24,100%,43%)] text-white font-bold rounded-xl hover:shadow-elevated active:scale-[0.99] transition-all disabled:opacity-60 font-noto"
                  >
                    {loading ? 'ढूंढ रहे हैं...' : '🔍 योग्य भर्तियाँ खोजें'}
                  </button>
                )}
              </div>
            </div>

            <aside className="hidden lg:block space-y-4">
              <div className="bg-white rounded-2xl p-5 shadow-premium border border-[hsl(214,32%,91%)]">
                <h4 className="font-bold text-[hsl(222,47%,12%)] mb-3 font-noto">🔒 आपका data सुरक्षित है</h4>
                <ul className="space-y-2 text-sm text-[hsl(215,16%,35%)] font-noto">
                  <li>✅ Email optional — बिना login भी खोजें</li>
                  <li>✅ कोई payment नहीं — पूरी तरह मुफ्त</li>
                  <li>✅ हर सोमवार manually verified</li>
                  <li>✅ AI guide — सरकारी वेबसाइट पर redirect</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-[hsl(222,47%,12%)] to-[hsl(217,91%,60%)] rounded-2xl p-5 text-white shadow-elevated">
                <p className="text-sm font-bold mb-2 font-noto">💡 क्या आप e-Mitra जाते हैं?</p>
                <p className="text-xs text-white/85 leading-relaxed font-noto">
                  ₹50-200 देने के बजाय यहाँ मुफ्त में AI guide पाएं — step by step, अपनी भाषा में।
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="px-4 lg:px-10 pb-10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex gap-2 justify-center flex-wrap mb-4">
            <span className="bg-[hsl(142,70%,95%)] text-[hsl(142,70%,29%)] text-xs px-4 py-2 rounded-full font-medium font-noto">🔒 सुरक्षित</span>
            <span className="bg-[hsl(142,70%,95%)] text-[hsl(142,70%,29%)] text-xs px-4 py-2 rounded-full font-medium font-noto">✅ हर सोमवार verified</span>
            <span className="bg-[hsl(24,100%,97%)] text-[hsl(24,80%,35%)] text-xs px-4 py-2 rounded-full font-medium font-noto">🆓 पूरी तरह मुफ्त</span>
          </div>
          <p className="text-[hsl(215,16%,55%)] text-xs px-4 font-noto max-w-2xl mx-auto">
            यह पोर्टल अनौपचारिक है। आधिकारिक जानकारी के लिए संबंधित विभाग की वेबसाइट देखें।
          </p>
        </div>
      </section>
    </main>
  );
}
