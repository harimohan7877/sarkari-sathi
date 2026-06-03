"use client";

import { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { getExamById, type Exam, type UserProfile } from "@/lib/eligibility";
import { supabase } from "@/lib/supabase";
import { User } from "@/lib/types";

interface ChatMsg { role: "user" | "assistant"; content: string; }

interface SyllabusSubject {
  name: string;
  weightage: string;
  topics: string[];
}

interface SyllabusData {
  subjects: SyllabusSubject[];
}

interface PYQItem {
  year: string;
  name: string;
  url: string;
  source: string;
  type: string;
}

const QUICK_REPLIES = [
  "इसका Syllabus क्या है?",
  "Documents क्या चाहिए?",
  "SSO ID कैसे बनाएं?",
  "Fee कैसे pay करें?",
  "Age limit कितनी है?",
];

const SYLLABUS_DATA: Record<string, SyllabusData> = {
  'rsmssb-patwari-2026': {
    subjects: [
      { name: "राजस्थान का इतिहास, कला, संस्कृति", weightage: "25%", topics: ["राजपूत काल", "मुगल काल", "स्वतंत्रता आंदोलन", "कला-संस्कृति", "लोक देवता"] },
      { name: "राजस्थान का भूगोल", weightage: "20%", topics: ["जलवायु", "नदियाँ", "जिले", "खनिज", "पर्यटन"] },
      { name: "सामान्य हिंदी", weightage: "15%", topics: ["व्याकरण", "संधि-समास", "वाक्य शुद्धि", "मुहावरे"] },
      { name: "सामान्य अंग्रेजी", weightage: "10%", topics: ["Grammar", "Vocabulary", "Comprehension"] },
      { name: "गणित", weightage: "15%", topics: ["अंकगणित", "प्रतिशत", "अनुपात", "साधारण ब्याज"] },
      { name: "कम्प्यूटर ज्ञान", weightage: "10%", topics: ["MS Office", "Internet", "Hardware/Software"] },
      { name: "राजस्व कानून", weightage: "5%", topics: ["Tenancy Act", "Land Records", "Revenue Manual"] },
    ],
  },
  'rpsc-ras-2026': {
    subjects: [
      { name: "राजस्थान का इतिहास, कला, संस्कृति", weightage: "20%", topics: ["प्रागैतिहासिक स्थल", "प्रमुख राजवंश", "स्वतंत्रता संग्राम", "मेले और त्योहार", "लोक संगीत व नृत्य"] },
      { name: "भारत और विश्व का भूगोल", weightage: "15%", topics: ["भौतिक विशेषताएं", "कृषि व उद्योग", "वन्यजीव", "प्रमुख खनिज"] },
      { name: "भारतीय संविधान व राजव्यवस्था", weightage: "15%", topics: ["संविधान सभा", "मौलिक अधिकार", "राष्ट्रपति व राज्यपाल", "पंचायती राज"] },
      { name: "भारतीय व राजस्थान अर्थव्यवस्था", weightage: "15%", topics: ["बजट संकल्पना", "राष्ट्रीय आय", "सरकारी योजनाएं", "कृषि एवं औद्योगिक क्षेत्र"] },
      { name: "सामान्य विज्ञान व प्रौद्योगिकी", weightage: "15%", topics: ["दैनिक जीवन में विज्ञान", "कंप्यूटर व आउट", "रक्षा व अंतरिक्ष", "पर्यावरण जैव विविधता"] },
      { name: "तार्किक क्षमता व रीजनिंग", weightage: "10%", topics: ["कथन और निष्कर्ष", "कोडिंग-डिकोडिंग", "प्रतिशत", "औसत व ब्याज"] },
      { name: "तार्किक क्षमता व सामयिक मामले", weightage: "10%", topics: ["राजस्थान समसामयिकी", "राष्ट्रीय घटनाएं", "खेलकूद", "पुरस्कार"] },
    ],
  },
  'rsmssb-ldc-2026': {
    subjects: [
      { name: "सामान्य ज्ञान (Paper 1)", weightage: "25%", topics: ["राजस्थान की भूगोल व इतिहास", "भारत का भूगोल", "प्रमुख औद्योगिक क्षेत्र", "संसदीय व्यवस्था"] },
      { name: "दैनिक विज्ञान (Paper 1)", weightage: "25%", topics: ["भौतिक एवं रासायनिक परिवर्तन", "धातु व अधातु", "प्रकाश का परावर्तन", "आनुवांशिकी", "पारिस्थितिकी"] },
      { name: "गणित (Paper 1)", weightage: "20%", topics: ["वैदिक गणित", "अनुपात-समानुपात", "गुणनखंड", "त्रिकोणमिति", "क्षेत्रमिति"] },
      { name: "सामान्य हिंदी (Paper 2)", weightage: "15%", topics: ["संधि और समास", "उपसर्ग-प्रत्यय", "विलोम-पर्यायवाची", "वाक्य शुद्धि", "कार्यालयी पत्र"] },
      { name: "General English (Paper 2)", weightage: "15%", topics: ["Tenses", "Voice & Narration", "Use of Prepositions", "Translation (Eng-Hindi)", "Synonyms & Antonyms"] },
      { name: "Typewriting/Efficiency Test (Phase 2)", weightage: "Qualifying", topics: ["Hindi Typing (10 mins, 25 Marks)", "English Typing (10 mins, 25 Marks)", "Formatting Efficiency Test"] },
    ],
  },
  'rajasthan-police-constable-2026': {
    subjects: [
      { name: "रीजनिंग, तर्क व कंप्यूटर ज्ञान", weightage: "40%", topics: ["कोडिंग-डिकोडिंग", "रक्त संबंध", "कैलेंडर/घड़ी", "कंप्यूटर बेसिक", "MS Office 365", "इंटरनेट"] },
      { name: "सामान्य ज्ञान, विज्ञान व सामयिक मामले", weightage: "25%", topics: ["सामान्य विज्ञान सिद्धांत", "भारतीय इतिहास व भूगोल", "भारतीय संविधान", "करंट अफेयर्स"] },
      { name: "महिला व बच्चों के विरुद्ध अपराध", weightage: "10%", topics: ["कानूनी प्रावधान", "POCSO एक्ट", "घरेलू हिंसा अधिनियम", "महिला हेल्पलाइन 1090"] },
      { name: "राजस्थान का सामान्य ज्ञान (GK)", weightage: "25%", topics: ["राजस्थान इतिहास", "कला-संस्कृति", "राजस्थान भूगोल", "राजव्यवस्था व योजनाएं"] },
    ],
  },
  'bstc-2026': {
    subjects: [
      { name: "मानसिक योग्यता (Mental Ability)", weightage: "25%", topics: ["सादृश्यता (Analogy)", "तार्किक चिंतन", "अंकगणित योग्यता", "रिश्ते व संबंध"] },
      { name: "राजस्थान की सामान्य जानकारी", weightage: "25%", topics: ["ऐतिहासिक पक्ष", "भौगोलिक स्थिति", "लोक जीवन व संस्कृति", "साहित्यिक पक्ष"] },
      { name: "शिक्षण अभिक्षमता (Teaching Aptitude)", weightage: "25%", topics: ["नेतृत्व गुण", "सृजनात्मकता", "संचार कौशल", "व्यावसायिक दृष्टिकोण"] },
      { name: "भाषा योग्यता (English)", weightage: "10%", topics: ["Comprehension", "Spotting Errors", "Narration", "Synonyms/Antonyms"] },
      { name: "भाषा योग्यता (Hindi / Sanskrit)", weightage: "15%", topics: ["वर्ण विचार", "स्वर-व्यंजन", "संधि व समास", "पर्यायवाची शब्द", "शुद्ध वर्तनी"] },
    ],
  },
  'rsmssb-computer-instructor-2026': {
    subjects: [
      { name: "सामान्य योग्यता व जीके (Paper 1)", weightage: "50%", topics: ["राजस्थान का इतिहास व संस्कृति", "राजस्थान का भूगोल", "लॉजिकल रीजनिंग", "डीआई व गणित", "करंट अफेयर्स"] },
      { name: "शिक्षाशास्त्र (Pedagogy - Paper 2)", weightage: "10%", topics: ["बाल शिक्षाशास्त्र", "अधिगम सिद्धांत", "शैक्षणिक तकनीकी"] },
      { name: "कंप्यूटर फंडामेंटल्स व प्रोग्रामिंग (Paper 2)", weightage: "30%", topics: ["C, C++, Java, Python", "OOPs Concepts", "Data Structures", "Algorithms", "Operating Systems", "DBMS & SQL"] },
      { name: "वेब डेवलपमेंट व नेटवर्क सिक्योरिटी (Paper 2)", weightage: "10%", topics: ["HTML, CSS, JS", "System Analysis & Design", "Cyber Security", "Network Layers"] },
    ],
  },
};

const PYQ_DATA: Record<string, PYQItem[]> = {
  'rsmssb-patwari-2026': [
    { year: "2021", name: "Patwari Exam Paper 2021", url: "https://rsmssb.rajasthan.gov.in", source: "RSMSSB Official", type: "PDF" },
    { year: "Mock", name: "Online Mock Test (Free)", url: "https://toppersexam.com/state-level-exams/rajasthan-patwari-question-paper", source: "ToppersExam", type: "Online" },
  ],
  'rpsc-ras-2026': [
    { year: "2023", name: "RAS Pre Exam Paper 2023", url: "https://rpsc.rajasthan.gov.in/previousquestionpapers.aspx", source: "RPSC Official", type: "Official" },
    { year: "2021", name: "RAS Pre Exam Paper 2021", url: "https://rpsc.rajasthan.gov.in/previousquestionpapers.aspx", source: "RPSC Official", type: "Official" },
  ],
  'rsmssb-ldc-2026': [
    { year: "2018", name: "LDC Exam Paper 2018 (Paper 1)", url: "https://rsmssb.rajasthan.gov.in", source: "RSMSSB Official", type: "Official" },
    { year: "2018", name: "LDC Exam Paper 2018 (Paper 2)", url: "https://rsmssb.rajasthan.gov.in", source: "RSMSSB Official", type: "Official" },
  ],
  'rajasthan-police-constable-2026': [
    { year: "2022", name: "Constable Exam Paper 2022 (Shift 1)", url: "https://police.rajasthan.gov.in", source: "Police Portal Official", type: "Official" },
    { year: "2020", name: "Constable Exam Paper 2020", url: "https://police.rajasthan.gov.in", source: "Police Portal Official", type: "Official" },
  ],
  'bstc-2026': [
    { year: "2023", name: "BSTC Entrance Paper 2023", url: "https://bstcrajasthan.in", source: "DEE BSTC Portal", type: "Official" },
    { year: "2022", name: "BSTC Entrance Paper 2022", url: "https://bstcrajasthan.in", source: "DEE BSTC Portal", type: "Official" },
  ],
  'rsmssb-computer-instructor-2026': [
    { year: "2022", name: "Basic Computer Instructor Paper 2022", url: "https://rsmssb.rajasthan.gov.in", source: "RSMSSB Official", type: "Official" },
    { year: "2022", name: "Senior Computer Instructor Paper 2022", url: "https://rsmssb.rajasthan.gov.in", source: "RSMSSB Official", type: "Official" },
  ],
};

export default function ExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [exam, setExam] = useState<Exam | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [msgUsed, setMsgUsed] = useState(0);
  const [msgLimit, setMsgLimit] = useState(5);
  const [userTier, setUserTier] = useState<'guest' | 'registered' | 'paid'>('guest');
  const [activeTab, setActiveTab] = useState("overview");
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authReason, setAuthReason] = useState<'message_limit' | 'study_material' | 'save_exam'>('message_limit');
  const [showStudySheet, setShowStudySheet] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser as User);

      const stored = localStorage.getItem("userProfile") || sessionStorage.getItem("userProfile");
      if (stored) setProfile(JSON.parse(stored));

      const guestToken = sessionStorage.getItem('guestToken');

      try {
        const query = new URLSearchParams();
        if (authUser?.id) query.set('userId', authUser.id);
        if (guestToken) query.set('guestToken', guestToken);

        const tierRes = await fetch(`/api/user/tier?${query.toString()}`);
        const tierData = await tierRes.json();
        setUserTier(tierData.tier);
        setMsgUsed(tierData.messagesUsed);
        setMsgLimit(tierData.limit);
      } catch (err) {
        console.error("Failed to fetch tier:", err);
      }

      if (authUser?.id) {
        const { data } = await supabase
          .from('saved_exams')
          .select('id')
          .eq('user_id', authUser.id)
          .eq('exam_id', id)
          .single();
        if (data) setIsSaved(true);
      }

      const e = getExamById(id);
      if (e) {
        setExam(e);
        setMessages([{ role: "assistant", content: `नमस्ते! 🙏 मैं आपको **${e.short_name || e.name}** के बारे में पूरी जानकारी दे सकता हूँ।\n\nनीचे कोई भी सवाल पूछें या quick buttons use करें! ⬇️` }]);
      }
    };

    loadInitialData();
  }, [id]);

  useEffect(() => { chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" }); }, [messages]);

  async function toggleSave() {
    if (!user) {
      setAuthReason('save_exam');
      setShowAuthModal(true);
      return;
    }
    setSaveLoading(true);
    try {
      if (isSaved) {
        await supabase.from('saved_exams').delete().eq('user_id', user.id).eq('exam_id', id);
        setIsSaved(false);
      } else {
        await supabase.from('saved_exams').insert({ user_id: user.id, exam_id: id });
        setIsSaved(true);
      }
    } catch (err) {
      console.error("Save failed:", err);
    }
    setSaveLoading(false);
  }

  async function sendMessage(text?: string) {
    const msg = text || input.trim();
    if (!msg || loading) return;

    if (msgUsed >= msgLimit) {
      setAuthReason('message_limit');
      setShowAuthModal(true);
      return;
    }
    setInput("");
    const newMsgs: ChatMsg[] = [...messages, { role: "user", content: msg }];
    setMessages(newMsgs);
    setLoading(true);
    try {
      const guestToken = sessionStorage.getItem('guestToken');
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMsgs.filter(m => m.role !== 'assistant' || newMsgs.indexOf(m) > 0),
          examId: id,
          userProfile: profile,
          userId: user?.id,
          guestToken,
        }),
      });
      const data = await res.json();

      if (data.error === 'LIMIT_REACHED') {
        setAuthReason('message_limit');
        setShowAuthModal(true);
        setLoading(false);
        return;
      }

      if (data.error) throw new Error(data.error);
      setMessages([...newMsgs, { role: "assistant", content: data.response }]);
      setMsgUsed(data.messagesUsed || (msgUsed + 1));
      if (data.tier) setUserTier(data.tier);
    } catch {
      setMessages([...newMsgs, { role: "assistant", content: "⚠️ कुछ problem हो गई। कृपया दोबारा कोशिश करें।" }]);
    }
    setLoading(false);
  }

  if (!exam) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-app)' }}>
      <p style={{ color: 'var(--text-muted)' }}>लोड हो रहा है...</p>
    </div>
  );

  const syllabus = SYLLABUS_DATA[id];
  const pyqs = PYQ_DATA[id] || [];
  const isPaidUser = userTier === 'paid';
  const tabs = [
    { id: 'overview', label: 'Overview', emoji: '📋' },
    { id: 'syllabus', label: 'Syllabus', emoji: '📚', locked: !isPaidUser },
    { id: 'pyq', label: 'PYQ', emoji: '📝', locked: !isPaidUser },
    { id: 'documents', label: 'Documents', emoji: '📄' },
    { id: 'links', label: 'Links', emoji: '🔗' },
    { id: 'strategy', label: 'Strategy', emoji: '🎯' },
  ];

  return (
    <main className="min-h-screen relative overflow-hidden" style={{ background: 'var(--bg-app)' }}>
      {/* Decorative glows */}
      <div className="absolute w-96 h-96 rounded-full blur-3xl -top-20 -left-20 pointer-events-none"
        style={{ background: 'hsl(24, 100%, 50%, 0.05)' }} />
      <div className="absolute w-96 h-96 rounded-full blur-3xl top-1/2 right-0 pointer-events-none"
        style={{ background: 'hsl(217, 91%, 60%, 0.06)' }} />

      {/* Tiranga stripe */}
      <div className="tiranga-stripe fixed top-0 left-0 right-0 z-50" />

      {/* Header */}
      <div
        className="fixed top-1 w-full z-40 h-16 px-4 flex items-center justify-between rounded-b-xl"
        style={{
          background: 'linear-gradient(135deg, var(--primary-navy), var(--primary-royal))',
          boxShadow: 'var(--shadow-premium)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <button
          onClick={() => router.push("/results")}
          className="text-white/90 hover:text-white flex items-center gap-1 text-sm font-semibold px-3 py-1.5 rounded-full border border-white/20 hover:bg-white/15 transition-all active:scale-95"
          style={{ fontFamily: 'var(--font-noto)' }}
        >
          ← वापस
        </button>
        <h1
          className="text-white text-sm md:text-base font-bold truncate max-w-[50%]"
          style={{ fontFamily: 'var(--font-noto)' }}
        >
          {exam.short_name || exam.name}
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSave}
            disabled={saveLoading}
            className={`text-lg p-1.5 rounded-full hover:bg-white/15 transition-all active:scale-95 ${isSaved ? 'text-red-400' : 'text-white/60 hover:text-white'}`}
            aria-label="Toggle save"
          >
            {isSaved ? '❤️' : '🤍'}
          </button>
          <a
            href={exam.official_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/80 hover:text-white text-xs px-2.5 py-1.5 rounded-full border border-white/20 hover:bg-white/15 transition-all active:scale-95 font-bold"
          >
            🌐
          </a>
        </div>
      </div>

      {/* Mobile: floating Study button to open bottom sheet */}
      <button
        onClick={() => setShowStudySheet(true)}
        className="lg:hidden fixed bottom-24 right-4 z-30 px-5 py-3 rounded-full font-bold text-sm shadow-elevated active:scale-95 flex items-center gap-2"
        style={{
          background: 'var(--accent-saffron)',
          color: 'white',
          fontFamily: 'var(--font-noto)',
        }}
      >
        📚 Study Material
      </button>

      {/* DESKTOP: dual-pane | MOBILE: chat only + bottom sheet */}
      <div className="pt-20 pb-4 max-w-7xl mx-auto w-full px-4 relative z-10">
        <div className="lg:grid lg:grid-cols-5 lg:gap-5 lg:h-[calc(100vh-6rem)]">
          {/* Chat pane (60% desktop) */}
          <div
            className="lg:col-span-3 flex flex-col rounded-2xl overflow-hidden mb-4 lg:mb-0"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              boxShadow: 'var(--shadow-premium)',
              height: '70vh',
            }}
          >
            {/* Bot header with message counter */}
            <div
              className="px-4 py-3 flex items-center justify-between border-b"
              style={{
                background: 'linear-gradient(135deg, var(--bg-app), var(--bg-input))',
                borderColor: 'var(--border-card)',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm"
                  style={{
                    background: 'linear-gradient(135deg, var(--primary-navy), var(--primary-royal))',
                    boxShadow: 'var(--shadow-soft)',
                  }}
                >
                  🏛️
                </div>
                <div>
                  <p className="text-sm font-bold leading-none" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-noto)' }}>
                    सरकारी साथी
                  </p>
                  <p className="text-[10px] mt-1 font-semibold flex items-center gap-1" style={{ color: 'var(--success-green)' }}>
                    <span className="w-1.5 h-1.5 rounded-full inline-block animate-pulse" style={{ background: 'var(--success-green)' }} />
                    Online
                  </p>
                </div>
              </div>
              {/* Message counter */}
              <div
                className="px-3 py-1.5 rounded-full text-xs font-bold"
                style={{
                  background: msgUsed >= msgLimit ? 'var(--danger-red-light)' : 'var(--accent-saffron-light)',
                  color: msgUsed >= msgLimit ? 'var(--danger-red)' : 'var(--accent-saffron-hover)',
                  fontFamily: 'var(--font-outfit)',
                }}
              >
                {msgUsed}/{msgLimit} AI
              </div>
            </div>

            {/* Messages */}
            <div
              ref={chatRef}
              className="flex-1 overflow-y-auto p-4 space-y-3"
              style={{ background: 'hsl(217, 33%, 94%)' }}
            >
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={m.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                    <p className="text-xs md:text-sm whitespace-pre-wrap leading-relaxed" style={{ fontFamily: 'var(--font-noto)' }}>
                      {m.content}
                    </p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="chat-bubble-ai flex gap-1.5 py-3.5">
                    <div className="w-2 h-2 rounded-full typing-dot" />
                    <div className="w-2 h-2 rounded-full typing-dot" />
                    <div className="w-2 h-2 rounded-full typing-dot" />
                  </div>
                </div>
              )}
            </div>

            {/* Quick replies */}
            {messages.length <= 2 && (
              <div
                className="px-3 py-2 flex gap-2 overflow-x-auto scroll-hidden border-t"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border-card)' }}
              >
                {QUICK_REPLIES.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    className="quick-reply-chip flex-shrink-0 text-xs py-2"
                    style={{ fontFamily: 'var(--font-noto)' }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div
              className="p-3 flex gap-2 items-center border-t"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-card)' }}
            >
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder={msgUsed >= msgLimit ? "Limit पूरी हो गई — Login करें" : "अपना सवाल पूछें..."}
                disabled={msgUsed >= msgLimit}
                className="flex-1 h-12 rounded-xl px-4 text-sm focus-ring transition-all outline-none"
                style={{
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-card)',
                  fontFamily: 'var(--font-noto)',
                }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading || msgUsed >= msgLimit}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-95 ${
                  input.trim()
                    ? 'btn-saffron'
                    : 'border'
                }`}
                style={!input.trim() ? { background: 'var(--bg-input)', color: 'var(--text-muted)', borderColor: 'var(--border-card)' } : {}}
              >
                ➤
              </button>
            </div>
          </div>

          {/* Study pane (40% desktop) */}
          <div
            className="hidden lg:flex lg:col-span-2 flex-col rounded-2xl overflow-hidden"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              boxShadow: 'var(--shadow-premium)',
            }}
          >
            {/* Tabs */}
            <div
              className="flex overflow-x-auto scroll-hidden border-b"
              style={{ background: 'var(--bg-app)', borderColor: 'var(--border-card)' }}
            >
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.locked) { setAuthReason('study_material'); setShowAuthModal(true); return; }
                    setActiveTab(tab.id);
                  }}
                  className={`flex-1 min-w-[60px] text-center py-3 text-[10px] font-bold border-b-2 transition-all flex flex-col items-center gap-1 ${
                    activeTab === tab.id ? '' : 'hover:bg-white/50'
                  }`}
                  style={{
                    borderBottomColor: activeTab === tab.id ? 'var(--accent-saffron)' : 'transparent',
                    color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontFamily: 'var(--font-noto)',
                  }}
                >
                  <span className="text-base">{tab.emoji}</span>
                  <span className="flex items-center gap-0.5">
                    {tab.label} {tab.locked && <span className="text-[10px]">🔒</span>}
                  </span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'overview' && (
                <div className="space-y-3">
                  <h3 className="font-extrabold text-sm" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-noto)' }}>
                    {exam.name}
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { label: 'बोर्ड', value: exam.board },
                      { label: 'Status', value: exam.status },
                      { label: 'शिक्षा', value: exam.eligibility.education },
                      { label: 'आयु', value: `${exam.eligibility.min_age}-${exam.eligibility.max_age} वर्ष` },
                    ].map((s, i) => (
                      <div
                        key={i}
                        className="rounded-xl p-2.5"
                        style={{ background: 'var(--bg-input)', border: '1px solid var(--border-card)' }}
                      >
                        <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                          {s.label}
                        </p>
                        <p className="font-extrabold mt-0.5" style={{ color: 'var(--text-primary)' }}>
                          {s.value}
                        </p>
                      </div>
                    ))}
                  </div>
                  {exam.selection_process && (
                    <div className="pt-2">
                      <h4 className="font-bold text-xs mb-2" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-noto)' }}>
                        चयन प्रक्रिया
                      </h4>
                      <div className="space-y-1.5">
                        {exam.selection_process.map((s, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 text-xs p-2 rounded-lg"
                            style={{ background: 'var(--bg-input)' }}
                          >
                            <span
                              className="w-5 h-5 text-white rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                              style={{ background: 'var(--accent-saffron)' }}
                            >
                              {i + 1}
                            </span>
                            <span className="font-semibold" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-noto)' }}>
                              {s}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'syllabus' && syllabus && (
                <div className="space-y-2.5">
                  <h3 className="font-extrabold text-sm" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-noto)' }}>
                    📚 पाठ्यक्रम
                  </h3>
                  {syllabus.subjects.map((s: SyllabusSubject, i: number) => (
                    <div
                      key={i}
                      className="rounded-xl p-3"
                      style={{ background: 'var(--bg-input)', border: '1px solid var(--border-card)' }}
                    >
                      <div className="flex justify-between items-center mb-1.5">
                        <p className="font-extrabold text-xs" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-noto)' }}>
                          {s.name}
                        </p>
                        <span
                          className="text-white text-[9px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: 'var(--accent-saffron)' }}
                        >
                          {s.weightage}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {s.topics.map((t: string, ti: number) => (
                          <span
                            key={ti}
                            className="text-[10px] px-2 py-0.5 rounded font-medium"
                            style={{
                              background: 'var(--bg-card)',
                              color: 'var(--text-secondary)',
                              border: '1px solid var(--border-card)',
                              fontFamily: 'var(--font-noto)',
                            }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'syllabus' && !syllabus && (
                <p className="text-center py-8 text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-noto)' }}>
                  Syllabus जल्द उपलब्ध होगा
                </p>
              )}

              {activeTab === 'pyq' && (
                <div className="space-y-2.5">
                  <h3 className="font-extrabold text-sm" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-noto)' }}>
                    📝 PYQ
                  </h3>
                  {pyqs.length > 0 ? pyqs.map((p: PYQItem, i: number) => (
                    <a
                      key={i}
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-xl p-3 transition-all active:scale-[0.99] hover:shadow-md"
                      style={{ background: 'var(--bg-input)', border: '1px solid var(--border-card)' }}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-xs" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-noto)' }}>
                            {p.name}
                          </p>
                          <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            {p.source} • {p.year}
                          </p>
                        </div>
                        <span style={{ color: 'var(--accent-saffron)' }}>→</span>
                      </div>
                    </a>
                  )) : (
                    <p className="text-center py-8 text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-noto)' }}>
                      PYQ जल्द उपलब्ध होंगे
                    </p>
                  )}
                </div>
              )}

              {activeTab === 'documents' && (
                <div className="space-y-2">
                  <h3 className="font-extrabold text-sm" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-noto)' }}>
                    📄 दस्तावेज़
                  </h3>
                  {["SSO ID (अनिवार्य)", "जन आधार / आधार कार्ड", "10वीं सर्टिफिकेट (आयु प्रमाण)", "श्रेणी प्रमाणपत्र", "मूल निवास प्रमाणपत्र", "पासपोर्ट फोटो (सफेद बैकग्राउंड)", "हस्ताक्षर स्कैन", "बैंक खाता विवरण"].map((d, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-2.5 rounded-lg text-xs font-semibold"
                      style={{ background: 'var(--bg-input)' }}
                    >
                      <span style={{ color: 'var(--success-green)' }}>✓</span>
                      <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-noto)' }}>{d}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'links' && (
                <div className="space-y-2.5">
                  <h3 className="font-extrabold text-sm" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-noto)' }}>
                    🔗 लिंक
                  </h3>
                  {[
                    { label: "आधिकारिक वेबसाइट", url: exam.official_url, icon: "🏛️" },
                    { label: "SSO Portal (Apply)", url: exam.apply_url || "https://sso.rajasthan.gov.in", icon: "📝" },
                    { label: "SSO हेल्पडेस्क: 0141-5153222", url: "tel:01415153222", icon: "📞" },
                  ].map((l, i) => (
                    <a
                      key={i}
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-xl p-3 transition-all active:scale-[0.99] hover:shadow-md"
                      style={{ background: 'var(--bg-input)', border: '1px solid var(--border-card)' }}
                    >
                      <span className="text-base">{l.icon}</span>
                      <span className="text-xs font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-noto)' }}>
                        {l.label}
                      </span>
                      <span className="ml-auto" style={{ color: 'var(--accent-saffron)' }}>→</span>
                    </a>
                  ))}
                </div>
              )}

              {activeTab === 'strategy' && (
                <div className="space-y-2.5">
                  <h3 className="font-extrabold text-sm" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-noto)' }}>
                    🎯 तैयारी रणनीति
                  </h3>
                  {[
                    { step: "1", title: "Syllabus समझें", desc: "Exam pattern + weightage देखें" },
                    { step: "2", title: "Daily 2-3 घंटे पढ़ाई", desc: "Consistency जरूरी" },
                    { step: "3", title: "PYQ Solve करें", desc: "पिछले 5 साल के papers" },
                    { step: "4", title: "Mock Test दें", desc: "हफ्ते में 2-3 tests" },
                    { step: "5", title: "Revision जरूरी", desc: "हफ्ते में 1 बार सब revise" },
                  ].map((s, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 p-2.5 rounded-lg"
                      style={{ background: 'var(--bg-input)' }}
                    >
                      <span
                        className="w-6 h-6 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: 'var(--primary-royal)' }}
                      >
                        {s.step}
                      </span>
                      <div>
                        <p className="text-xs font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-noto)' }}>
                          {s.title}
                        </p>
                        <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-noto)' }}>
                          {s.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="disclaimer-box mt-4">
          <p className="leading-relaxed italic" style={{ fontFamily: 'var(--font-noto)' }}>
            ⚠️ {exam.disclaimer}
          </p>
        </div>
      </div>

      {/* MOBILE: Bottom Sheet for Study Material */}
      {showStudySheet && (
        <div className="lg:hidden fixed inset-0 z-[60]">
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setShowStudySheet(false)}
          />
          <div
            className="absolute bottom-0 left-0 right-0 max-h-[85vh] flex flex-col rounded-t-3xl overflow-hidden animate-slide-up-sheet"
            style={{
              background: 'var(--bg-card)',
              boxShadow: 'var(--shadow-elevated)',
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 rounded-full" style={{ background: 'var(--border-card)' }} />
            </div>

            <div
              className="px-5 py-3 flex items-center justify-between border-b"
              style={{ borderColor: 'var(--border-card)' }}
            >
              <h3 className="font-extrabold text-base" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-noto)' }}>
                📚 Study Material
              </h3>
              <button
                onClick={() => setShowStudySheet(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold"
                style={{ background: 'var(--bg-input)', color: 'var(--text-muted)' }}
              >
                ×
              </button>
            </div>

            {/* Tabs - horizontal scroll on mobile */}
            <div
              className="flex overflow-x-auto scroll-hidden border-b"
              style={{ background: 'var(--bg-app)', borderColor: 'var(--border-card)' }}
            >
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.locked) { setAuthReason('study_material'); setShowAuthModal(true); return; }
                    setActiveTab(tab.id);
                  }}
                  className={`flex-shrink-0 px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5`}
                  style={{
                    borderBottomColor: activeTab === tab.id ? 'var(--accent-saffron)' : 'transparent',
                    color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontFamily: 'var(--font-noto)',
                  }}
                >
                  <span>{tab.emoji}</span>
                  <span>{tab.label}</span>
                  {tab.locked && <span className="text-[10px]">🔒</span>}
                </button>
              ))}
            </div>

            {/* Reuse the same tab content as desktop */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'overview' && (
                <div className="space-y-3">
                  <h3 className="font-extrabold text-sm" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-noto)' }}>
                    {exam.name}
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { label: 'बोर्ड', value: exam.board },
                      { label: 'Status', value: exam.status },
                      { label: 'शिक्षा', value: exam.eligibility.education },
                      { label: 'आयु', value: `${exam.eligibility.min_age}-${exam.eligibility.max_age} वर्ष` },
                    ].map((s, i) => (
                      <div
                        key={i}
                        className="rounded-xl p-2.5"
                        style={{ background: 'var(--bg-input)', border: '1px solid var(--border-card)' }}
                      >
                        <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                          {s.label}
                        </p>
                        <p className="font-extrabold mt-0.5" style={{ color: 'var(--text-primary)' }}>
                          {s.value}
                        </p>
                      </div>
                    ))}
                  </div>
                  {exam.selection_process && (
                    <div className="pt-2">
                      <h4 className="font-bold text-xs mb-2" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-noto)' }}>
                        चयन प्रक्रिया
                      </h4>
                      <div className="space-y-1.5">
                        {exam.selection_process.map((s, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 text-xs p-2 rounded-lg"
                            style={{ background: 'var(--bg-input)' }}
                          >
                            <span
                              className="w-5 h-5 text-white rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                              style={{ background: 'var(--accent-saffron)' }}
                            >
                              {i + 1}
                            </span>
                            <span className="font-semibold" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-noto)' }}>
                              {s}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'syllabus' && syllabus && (
                <div className="space-y-2.5">
                  <h3 className="font-extrabold text-sm" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-noto)' }}>
                    📚 पाठ्यक्रम
                  </h3>
                  {syllabus.subjects.map((s: SyllabusSubject, i: number) => (
                    <div
                      key={i}
                      className="rounded-xl p-3"
                      style={{ background: 'var(--bg-input)', border: '1px solid var(--border-card)' }}
                    >
                      <div className="flex justify-between items-center mb-1.5">
                        <p className="font-extrabold text-xs" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-noto)' }}>
                          {s.name}
                        </p>
                        <span
                          className="text-white text-[9px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: 'var(--accent-saffron)' }}
                        >
                          {s.weightage}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {s.topics.map((t: string, ti: number) => (
                          <span
                            key={ti}
                            className="text-[10px] px-2 py-0.5 rounded font-medium"
                            style={{
                              background: 'var(--bg-card)',
                              color: 'var(--text-secondary)',
                              border: '1px solid var(--border-card)',
                              fontFamily: 'var(--font-noto)',
                            }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'pyq' && (
                <div className="space-y-2.5">
                  <h3 className="font-extrabold text-sm" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-noto)' }}>
                    📝 PYQ
                  </h3>
                  {pyqs.length > 0 ? pyqs.map((p: PYQItem, i: number) => (
                    <a
                      key={i}
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-xl p-3 active:scale-[0.99]"
                      style={{ background: 'var(--bg-input)', border: '1px solid var(--border-card)' }}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-xs" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-noto)' }}>
                            {p.name}
                          </p>
                          <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            {p.source} • {p.year}
                          </p>
                        </div>
                        <span style={{ color: 'var(--accent-saffron)' }}>→</span>
                      </div>
                    </a>
                  )) : (
                    <p className="text-center py-8 text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-noto)' }}>
                      PYQ जल्द उपलब्ध होंगे
                    </p>
                  )}
                </div>
              )}

              {activeTab === 'documents' && (
                <div className="space-y-2">
                  <h3 className="font-extrabold text-sm" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-noto)' }}>
                    📄 दस्तावेज़
                  </h3>
                  {["SSO ID (अनिवार्य)", "जन आधार / आधार कार्ड", "10वीं सर्टिफिकेट (आयु प्रमाण)", "श्रेणी प्रमाणपत्र", "मूल निवास प्रमाणपत्र", "पासपोर्ट फोटो (सफेद बैकग्राउंड)", "हस्ताक्षर स्कैन", "बैंक खाता विवरण"].map((d, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-2.5 rounded-lg text-xs font-semibold"
                      style={{ background: 'var(--bg-input)' }}
                    >
                      <span style={{ color: 'var(--success-green)' }}>✓</span>
                      <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-noto)' }}>{d}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'links' && (
                <div className="space-y-2.5">
                  <h3 className="font-extrabold text-sm" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-noto)' }}>
                    🔗 लिंक
                  </h3>
                  {[
                    { label: "आधिकारिक वेबसाइट", url: exam.official_url, icon: "🏛️" },
                    { label: "SSO Portal (Apply)", url: exam.apply_url || "https://sso.rajasthan.gov.in", icon: "📝" },
                    { label: "SSO हेल्पडेस्क: 0141-5153222", url: "tel:01415153222", icon: "📞" },
                  ].map((l, i) => (
                    <a
                      key={i}
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-xl p-3 active:scale-[0.99]"
                      style={{ background: 'var(--bg-input)', border: '1px solid var(--border-card)' }}
                    >
                      <span className="text-base">{l.icon}</span>
                      <span className="text-xs font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-noto)' }}>
                        {l.label}
                      </span>
                      <span className="ml-auto" style={{ color: 'var(--accent-saffron)' }}>→</span>
                    </a>
                  ))}
                </div>
              )}

              {activeTab === 'strategy' && (
                <div className="space-y-2.5">
                  <h3 className="font-extrabold text-sm" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-noto)' }}>
                    🎯 रणनीति
                  </h3>
                  {[
                    { step: "1", title: "Syllabus समझें", desc: "Pattern + weightage देखें" },
                    { step: "2", title: "Daily 2-3 घंटे पढ़ाई", desc: "Consistency जरूरी" },
                    { step: "3", title: "PYQ Solve करें", desc: "पिछले 5 साल के papers" },
                    { step: "4", title: "Mock Test दें", desc: "हफ्ते में 2-3 tests" },
                    { step: "5", title: "Revision जरूरी", desc: "हफ्ते में 1 बार revise" },
                  ].map((s, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 p-2.5 rounded-lg"
                      style={{ background: 'var(--bg-input)' }}
                    >
                      <span
                        className="w-6 h-6 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: 'var(--primary-royal)' }}
                      >
                        {s.step}
                      </span>
                      <div>
                        <p className="text-xs font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-noto)' }}>
                          {s.title}
                        </p>
                        <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-noto)' }}>
                          {s.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Auth prompt modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setShowAuthModal(false)}
          />
          <div
            className="relative rounded-2xl p-6 max-w-sm w-full animate-slide-up"
            style={{
              background: 'var(--bg-card)',
              boxShadow: 'var(--shadow-elevated)',
            }}
          >
            <div className="text-center">
              <div className="text-5xl mb-3">
                {authReason === 'message_limit' ? '💬' : authReason === 'save_exam' ? '❤️' : '🔒'}
              </div>
              <h3
                className="text-base font-extrabold mb-2"
                style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-noto)' }}
              >
                {authReason === 'message_limit' && 'Limit पूरी हो गई'}
                {authReason === 'save_exam' && 'Save करने के लिए Login करें'}
                {authReason === 'study_material' && 'Premium Content'}
              </h3>
              <p
                className="text-xs mb-5"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-noto)' }}
              >
                {authReason === 'message_limit' && 'आज के 5 मुफ्त सवाल हो गए। Login करके unlimited access पाएं।'}
                {authReason === 'save_exam' && 'Exams save करने के लिए login जरूरी है।'}
                {authReason === 'study_material' && 'Syllabus, PYQ unlock करने के लिए login करें।'}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="flex-1 h-11 rounded-xl font-bold text-sm"
                  style={{
                    background: 'var(--bg-input)',
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-noto)',
                  }}
                >
                  बाद में
                </button>
                <button
                  onClick={() => router.push('/auth')}
                  className="flex-1 h-11 rounded-xl font-bold text-sm text-white btn-saffron"
                  style={{ fontFamily: 'var(--font-noto)' }}
                >
                  Login →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
