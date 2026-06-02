"use client";

import { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { getExamById, type Exam, type UserProfile } from "@/lib/eligibility";
import { supabase } from "@/lib/supabase";
import MessageCounter from "@/components/MessageCounter";
import ScrollArrowCTA from "@/components/ScrollArrowCTA";
import AuthPromptModal from "@/components/AuthPromptModal";
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
      { name: "सामान्य विज्ञान व प्रौद्योगिकी", weightage: "15%", topics: ["दैनिक जीवन में विज्ञान", "कंप्यूटर व आईटी", "रक्षा व अंतरिक्ष", "पर्यावरण जैव विविधता"] },
      { name: "तार्किक क्षमता व रीजनिंग", weightage: "10%", topics: ["कथन और निष्कर्ष", "कोडिंग-डिकोडिंग", "प्रतिशत", "औसत व ब्याज"] },
      { name: "सामयिक मामले (Current Affairs)", weightage: "10%", topics: ["राजस्थान समसामयिकी", "राष्ट्रीय घटनाएं", "खेलकूद", "पुरस्कार"] },
    ],
  },
  'rsmssb-ldc-2026': {
    subjects: [
      { name: "सामान्य ज्ञान (Paper 1)", weightage: "25%", topics: ["राजस्थान की भूगोल व इतिहास", "भारत का भूगोल", "प्रमुख औद्योगिक क्षेत्र", "संसदीय व्यवस्था"] },
      { name: "दैनिक विज्ञान (Paper 1)", weightage: "25%", topics: ["भौतिक एवं रासायनिक परिवर्तन", "धातु व अधातु", "प्रकाश का परावर्तन", "आनुवंशिकी", "पारिस्थितिकी"] },
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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authReason, setAuthReason] = useState<'message_limit' | 'study_material' | 'save_exam'>('message_limit');
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  // Custom User API Keys state
  const [showCustomKeyModal, setShowCustomKeyModal] = useState(false);
  const [customKeys, setCustomKeys] = useState<{
    activeProvider: string;
    gemini: string;
    openrouter: string;
    nvidia: string;
    groq: string;
    openai: string;
    [key: string]: string;
  }>({
    activeProvider: 'gemini',
    gemini: '',
    openrouter: '',
    nvidia: '',
    groq: '',
    openai: '',
  });

  // Load custom keys on mount
  useEffect(() => {
    try {
      const keysStr = localStorage.getItem("custom_user_keys");
      if (keysStr) {
        setCustomKeys(prev => ({ ...prev, ...JSON.parse(keysStr) }));
      }
    } catch {}
  }, []);

  const hasCustomKey = !!(customKeys.activeProvider && customKeys[customKeys.activeProvider]?.trim());

  useEffect(() => {
    const loadInitialData = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser as User);
      
      const stored = localStorage.getItem("userProfile") || sessionStorage.getItem("userProfile");
      if (stored) setProfile(JSON.parse(stored));
      
      const guestToken = sessionStorage.getItem('guestToken');
      
      // Fetch real tier info
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

      // Check if exam is saved
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

  const saveCustomKeys = (newConfig: typeof customKeys) => {
    localStorage.setItem("custom_user_keys", JSON.stringify(newConfig));
    setCustomKeys(newConfig);
    setShowCustomKeyModal(false);
  };

  async function sendMessage(text?: string) {
    const msg = text || input.trim();
    if (!msg || loading) return;

    // Load active key info
    let customApiProvider = undefined;
    let customApiKey = undefined;
    try {
      const keysStr = localStorage.getItem("custom_user_keys");
      if (keysStr) {
        const config = JSON.parse(keysStr);
        if (config.activeProvider && config[config.activeProvider]?.trim()) {
          customApiProvider = config.activeProvider;
          customApiKey = config[config.activeProvider].trim();
        }
      }
    } catch {}

    const isCustomActive = !!(customApiProvider && customApiKey);

    if (!isCustomActive && msgUsed >= msgLimit) {
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
          customApiProvider,
          customApiKey
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

  if (!exam) return <div className="min-h-screen flex items-center justify-center bg-[#EEF2F8]"><p className="text-gray-500">लोड हो रहा है...</p></div>;

  const syllabus = SYLLABUS_DATA[id];
  const pyqs = PYQ_DATA[id] || [];
  const isPaidUser = userTier === 'paid';
  const tabs = [
    { id: 'overview', label: 'Overview', emoji: '📋' },
    { id: 'syllabus', label: 'Syllabus', emoji: '📚', locked: !isPaidUser },
    { id: 'pyq', label: 'PYQ', emoji: '📝', locked: !isPaidUser },
    { id: 'documents', label: 'Documents', emoji: '📄' },
    { id: 'links', label: 'Links', emoji: '🔗' },
  ];

  return (
    <main className="min-h-screen bg-[#EEF2F8] pb-12 relative overflow-hidden flex flex-col">
      {/* Decorative glows */}
      <div className="absolute w-96 h-96 rounded-full bg-orange-500/5 blur-3xl -top-20 -left-20 pointer-events-none" />
      <div className="absolute w-96 h-96 rounded-full bg-blue-500/5 blur-3xl top-1/2 right-0 pointer-events-none" />

      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF6B00] via-white to-[#138808] z-[60]" />

      {/* Header */}
      <div className="bg-gradient-to-r from-[#0F2B5B] to-[#1847A6] h-16 px-4 flex items-center justify-between fixed top-1 w-full z-50 shadow-md border-b border-white/10 rounded-b-xl">
        <button 
          onClick={() => router.push("/results")} 
          className="text-white/90 hover:text-white flex items-center gap-1 text-sm font-semibold bg-white/10 px-3 py-1.5 rounded-full border border-white/10 transition-all hover:bg-white/20 active:scale-95" 
          style={{ fontFamily: "var(--font-noto)" }}
        >
          ← वापस
        </button>
        <div className="text-center flex-1 max-w-[50%] mx-auto">
          <h1 className="text-white text-sm md:text-base font-bold truncate" style={{ fontFamily: "var(--font-noto)" }}>{exam.short_name || exam.name}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleSave}
            disabled={saveLoading}
            className={`text-lg p-1.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all ${isSaved ? 'text-red-500' : 'text-white/50 hover:text-white'}`}
          >
            {isSaved ? '❤️' : '🤍'}
          </button>
          <a 
            href={exam.official_url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-white/85 hover:text-white text-xs bg-white/10 hover:bg-white/20 p-2 rounded-full border border-white/10 transition-all active:scale-95 flex items-center justify-center font-bold"
          >
            🌐
          </a>
        </div>
      </div>

      <div className="pt-20 pb-4 flex flex-col flex-1 max-w-xl mx-auto w-full px-4 relative z-10 space-y-5">
        {/* Chat Section */}
        <div className="bg-white rounded-2xl border border-[#C5D0E0]/60 shadow-lg flex flex-col overflow-hidden w-full" style={{ height: '55vh' }}>
          {/* Bot header */}
          <div className="bg-gradient-to-r from-gray-50 to-[#EEF2F8] px-4 py-3 flex items-center justify-between border-b border-[#C5D0E0]/60">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#0F2B5B] rounded-full flex items-center justify-center text-white text-sm shadow-sm">🏛️</div>
              <div>
                <p className="text-sm font-bold text-[#0F2B5B] leading-none" style={{ fontFamily: "var(--font-noto)" }}>सरकारी साथी</p>
                <p className="text-[10px] text-green-600 mt-1 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block animate-pulse"></span>
                  Online
                </p>
              </div>
            </div>
            {/* Custom API Key Configuration */}
            <button
              onClick={() => setShowCustomKeyModal(true)}
              className="text-xs font-bold text-[#1847A6] hover:text-[#0F2B5B] bg-[#EEF2F8] hover:bg-blue-100/50 px-2.5 py-1.5 rounded-lg border border-blue-200/50 transition-all flex items-center gap-1 active:scale-95 cursor-pointer shadow-sm"
              style={{ fontFamily: 'var(--font-noto)' }}
            >
              🔑 API Settings
            </button>
          </div>

          {/* Messages */}
          <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#E5EBF5]/60">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={m.role === 'user' ? 'chat-bubble-user shadow-md' : 'chat-bubble-ai shadow-sm'}>
                  <p className="text-xs md:text-sm whitespace-pre-wrap leading-relaxed" style={{ fontFamily: "var(--font-noto)" }}>{m.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="chat-bubble-ai flex gap-1.5 py-3.5 shadow-sm">
                  <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
                </div>
              </div>
            )}
          </div>

          {/* Quick replies */}
          {messages.length <= 2 && (
            <div className="px-3 py-2 flex gap-2 overflow-x-auto scroll-hidden bg-white border-t border-[#C5D0E0]/50">
              {QUICK_REPLIES.map((q, i) => (
                <button 
                  key={i} 
                  onClick={() => sendMessage(q)} 
                  className="quick-reply-chip flex-shrink-0 text-xs py-2 hover:shadow-sm active:scale-95" 
                  style={{ fontFamily: "var(--font-noto)" }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Message Counter */}
          <MessageCounter used={msgUsed} limit={msgLimit} tier={userTier} isCustomKeyActive={hasCustomKey} />

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-[#C5D0E0]/50 flex gap-2 items-center">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder={hasCustomKey ? "अपनी API Key से असीमित चैट करें..." : "अपना सवाल पूछें..."}
              disabled={!hasCustomKey && msgUsed >= msgLimit}
              className="flex-1 h-12 border border-[#C5D0E0] rounded-xl px-4 text-sm bg-gray-50 focus:border-[#1847A6] focus:bg-white transition-all outline-none disabled:opacity-50 text-[#0D1B2A] placeholder-gray-400"
              style={{ fontFamily: "var(--font-noto)" }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading || (!hasCustomKey && msgUsed >= msgLimit)}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-95 shadow-md ${input.trim() ? 'bg-gradient-to-r from-[#FF6B00] to-[#E55A00] text-white shadow-orange-500/10' : 'bg-gray-100 text-gray-400 border border-gray-200'}`}
            >
              ➤
            </button>
          </div>
        </div>

        {/* Scroll Arrow CTA */}
        {messages.length >= 2 && <ScrollArrowCTA />}

        {/* Exam Info Section */}
        <div id="exam-info" className="bg-white rounded-2xl border border-[#C5D0E0]/60 shadow-lg overflow-hidden w-full">
          {/* Tabs */}
          <div className="flex overflow-x-auto scroll-hidden bg-gray-50 border-b border-[#C5D0E0]/60">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.locked) { setAuthReason('study_material'); setShowAuthModal(true); return; }
                  setActiveTab(tab.id);
                }}
                className={`flex-1 min-w-[76px] text-center py-3 text-[10px] md:text-xs font-bold border-b-2 transition-all flex flex-col items-center gap-1 ${
                  activeTab === tab.id 
                    ? 'border-[#FF6B00] text-[#0F2B5B] bg-white' 
                    : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-100/50'
                } ${tab.locked ? 'opacity-70' : ''}`}
                style={{ fontFamily: "var(--font-noto)" }}
              >
                <span className="text-sm md:text-base">{tab.emoji}</span>
                <span className="flex items-center gap-0.5">
                  {tab.label} {tab.locked && <span className="text-[10px]">🔒</span>}
                </span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-5 min-h-[260px] bg-white">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-extrabold text-[#0F2B5B] mb-3 text-base" style={{ fontFamily: "var(--font-noto)" }}>{exam.name}</h3>
                  <div className="grid grid-cols-2 gap-3 text-xs md:text-sm">
                    <div className="bg-[#EEF2F8]/70 border border-blue-100/30 rounded-xl p-3"><p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">बोर्ड</p><p className="font-extrabold text-[#0F2B5B]">{exam.board}</p></div>
                    <div className="bg-[#EEF2F8]/70 border border-blue-100/30 rounded-xl p-3"><p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Status</p><p className="font-extrabold text-[#0F2B5B]">{exam.status}</p></div>
                    <div className="bg-[#EEF2F8]/70 border border-blue-100/30 rounded-xl p-3"><p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">शिक्षा</p><p className="font-extrabold text-[#0F2B5B]">{exam.eligibility.education}</p></div>
                    <div className="bg-[#EEF2F8]/70 border border-blue-100/30 rounded-xl p-3"><p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">आयु</p><p className="font-extrabold text-[#0F2B5B]">{exam.eligibility.min_age}-{exam.eligibility.max_age} वर्ष</p></div>
                  </div>
                </div>
                {exam.selection_process && (
                  <div className="pt-2">
                    <h4 className="font-bold text-xs md:text-sm text-[#0F2B5B] mb-3" style={{ fontFamily: "var(--font-noto)" }}>चयन प्रक्रिया (Selection Process)</h4>
                    <div className="space-y-2">
                      {exam.selection_process.map((s, i) => (
                        <div key={i} className="flex items-center gap-3 text-xs md:text-sm bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                          <span className="w-6 h-6 bg-gradient-to-r from-[#FF6B00] to-[#E55A00] text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">{i+1}</span>
                          <span className="text-gray-700 font-semibold" style={{ fontFamily: "var(--font-noto)" }}>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'syllabus' && syllabus && (
              <div className="space-y-3">
                <h3 className="font-extrabold text-sm text-[#0F2B5B] mb-2" style={{ fontFamily: "var(--font-noto)" }}>📚 विस्तृत पाठ्यक्रम</h3>
                {syllabus.subjects.map((s: SyllabusSubject, i: number) => (
                  <div key={i} className="bg-[#EEF2F8]/70 border border-[#C5D0E0]/30 rounded-xl p-3.5">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-extrabold text-xs md:text-sm text-[#0F2B5B]" style={{ fontFamily: "var(--font-noto)" }}>{s.name}</p>
                      <span className="bg-gradient-to-r from-[#FF6B00] to-[#E55A00] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">{s.weightage}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {s.topics.map((t: string, ti: number) => (
                        <span key={ti} className="bg-white text-[10px] md:text-xs text-gray-600 px-2.5 py-1 rounded-lg border border-gray-100 font-medium" style={{ fontFamily: "var(--font-noto)" }}>{t}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'syllabus' && !syllabus && (
              <p className="text-gray-400 text-center py-8 text-xs font-semibold" style={{ fontFamily: "var(--font-noto)" }}>Syllabus जल्द उपलब्ध होगा</p>
            )}

            {activeTab === 'pyq' && (
              <div className="space-y-3">
                <h3 className="font-extrabold text-sm text-[#0F2B5B] mb-2" style={{ fontFamily: "var(--font-noto)" }}>📝 Previous Year Papers</h3>
                {pyqs.length > 0 ? pyqs.map((p: PYQItem, i: number) => (
                  <a key={i} href={p.url} target="_blank" rel="noopener noreferrer" className="block bg-[#EEF2F8]/70 border border-[#C5D0E0]/30 rounded-xl p-3.5 hover:shadow-md transition-all active:scale-99">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-xs md:text-sm text-[#0F2B5B]" style={{ fontFamily: "var(--font-noto)" }}>{p.name}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5 font-medium">{p.source} • {p.year}</p>
                      </div>
                      <span className="text-[#FF6B00] text-sm font-extrabold">→</span>
                    </div>
                  </a>
                )) : <p className="text-gray-400 text-center py-8 text-xs font-semibold" style={{ fontFamily: "var(--font-noto)" }}>PYQ जल्द उपलब्ध होंगे</p>}
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-2">
                <h3 className="font-extrabold text-sm text-[#0F2B5B] mb-3" style={{ fontFamily: "var(--font-noto)" }}>📄 जरूरी दस्तावेज़</h3>
                {["SSO ID (अनिवार्य)", "जन आधार / आधार कार्ड", "10वीं सर्टिफिकेट (आयु प्रमाण)", "श्रेणी प्रमाणपत्र (SC/ST/OBC/EWS)", "मूल निवास प्रमाणपत्र (राजस्थान)", "पासपोर्ट फोटो (सफेद बैकग्राउंड)", "हस्ताक्षर स्कैन", "बैंक खाता विवरण"].map((d, i) => (
                  <div key={i} className="flex items-center gap-3 bg-[#EEF2F8]/50 border border-blue-50/50 rounded-xl p-3 text-xs md:text-sm font-semibold">
                    <span className="text-[#138808] text-sm">✓</span>
                    <span className="text-gray-700" style={{ fontFamily: "var(--font-noto)" }}>{d}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'links' && (
              <div className="space-y-2.5">
                <h3 className="font-extrabold text-sm text-[#0F2B5B] mb-3" style={{ fontFamily: "var(--font-noto)" }}>🔗 महत्वपूर्ण लिंक</h3>
                {[
                  { label: "आधिकारिक वेबसाइट", url: exam.official_url, icon: "🏛️" },
                  { label: "ऑनलाइन आवेदन (SSO Portal)", url: exam.apply_url || "https://sso.rajasthan.gov.in", icon: "📝" },
                  { label: "SSO हेल्पडेस्क: 0141-5153222", url: "tel:01415153222", icon: "📞" },
                ].map((l, i) => (
                  <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-[#EEF2F8]/70 border border-[#C5D0E0]/30 rounded-xl p-3.5 hover:shadow-md transition-all active:scale-99">
                    <span className="text-base">{l.icon}</span>
                    <span className="text-xs md:text-sm font-bold text-[#0F2B5B]" style={{ fontFamily: "var(--font-noto)" }}>{l.label}</span>
                    <span className="ml-auto text-[#FF6B00] text-sm">→</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-[#FFF3E8] border-l-2 border-[#FF6B00] p-3.5 rounded-r-xl">
          <p className="text-orange-800 text-[10px] md:text-xs leading-relaxed italic" style={{ fontFamily: "var(--font-noto)" }}>
            ⚠️ {exam.disclaimer}
          </p>
        </div>
      </div>

      {showAuthModal && <AuthPromptModal onClose={() => setShowAuthModal(false)} reason={authReason} />}

      {/* Custom API Key Settings Modal */}
      {showCustomKeyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCustomKeyModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden p-6 animate-slide-up space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-extrabold text-base text-[#0F2B5B] flex items-center gap-1.5" style={{ fontFamily: 'var(--font-noto)' }}>
                <span>🔑</span> अपनी AI API Key दर्ज करें
              </h3>
              <button onClick={() => setShowCustomKeyModal(false)} className="text-gray-400 hover:text-gray-650 font-black text-xl cursor-pointer">×</button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: 'var(--font-noto)' }}>
                  प्रदाता चुनें (Select Provider)
                </label>
                <select
                  value={customKeys.activeProvider}
                  onChange={e => setCustomKeys({ ...customKeys, activeProvider: e.target.value })}
                  className="w-full h-11 border border-[#C5D0E0] rounded-xl px-4 text-sm bg-gray-50 text-[#0D1B2A] focus:bg-white focus:border-[#1847A6] transition-all outline-none cursor-pointer"
                >
                  <option value="gemini">Google Gemini (Recommended - Free)</option>
                  <option value="openai">OpenAI (ChatGPT)</option>
                  <option value="openrouter">OpenRouter</option>
                  <option value="groq">Groq</option>
                  <option value="nvidia">Nvidia NIM</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: 'var(--font-noto)' }}>
                  {customKeys.activeProvider.toUpperCase()} API Key दर्ज करें
                </label>
                <input
                  type="password"
                  value={customKeys[customKeys.activeProvider] || ''}
                  onChange={e => setCustomKeys({ ...customKeys, [customKeys.activeProvider]: e.target.value })}
                  placeholder="यहाँ अपनी API Key पेस्ट करें..."
                  className="w-full h-11 border border-[#C5D0E0] rounded-xl px-4 text-sm bg-gray-50 text-[#0D1B2A] focus:bg-white focus:border-[#1847A6] transition-all outline-none"
                />
              </div>

              {/* Guide links & instructions */}
              <div className="bg-[#EEF2F8] p-4 rounded-xl border border-blue-100/50 text-xs text-[#0F2B5B] space-y-2">
                <p className="font-bold flex items-center gap-1">
                  <span>ℹ️</span> {customKeys.activeProvider.toUpperCase()} की चाबी कैसे बनाएं:
                </p>
                {customKeys.activeProvider === 'gemini' && (
                  <ol className="list-decimal list-inside space-y-1 text-gray-650 leading-relaxed" style={{ fontFamily: 'var(--font-noto)' }}>
                    <li><a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer" className="text-[#1847A6] font-bold underline">Google AI Studio ↗</a> पर जाएं।</li>
                    <li>अपने गूगल अकाउंट से लॉगिन करके <b>"Create API Key"</b> पर क्लिक करें।</li>
                    <li>चाबी को कॉपी करें और ऊपर पेस्ट कर के सेव करें। (यह बिल्कुल मुफ्त है)।</li>
                  </ol>
                )}
                {customKeys.activeProvider === 'openai' && (
                  <ol className="list-decimal list-inside space-y-1 text-gray-650 leading-relaxed" style={{ fontFamily: 'var(--font-noto)' }}>
                    <li><a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-[#1847A6] font-bold underline">OpenAI Platform ↗</a> पर जाएं।</li>
                    <li>लॉगिन करके <b>"Create new secret key"</b> पर क्लिक करें।</li>
                    <li>उसे कॉपी कर के ऊपर पेस्ट करें।</li>
                  </ol>
                )}
                {customKeys.activeProvider === 'openrouter' && (
                  <ol className="list-decimal list-inside space-y-1 text-gray-650 leading-relaxed" style={{ fontFamily: 'var(--font-noto)' }}>
                    <li><a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-[#1847A6] font-bold underline">OpenRouter Keys ↗</a> पर जाएं।</li>
                    <li>लॉगिन करके <b>"Create Key"</b> पर क्लिक करें।</li>
                    <li>उसे कॉपी कर के ऊपर पेस्ट करें।</li>
                  </ol>
                )}
                {customKeys.activeProvider === 'groq' && (
                  <ol className="list-decimal list-inside space-y-1 text-gray-650 leading-relaxed" style={{ fontFamily: 'var(--font-noto)' }}>
                    <li><a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-[#1847A6] font-bold underline">Groq Console ↗</a> पर जाएं।</li>
                    <li>लॉगिन करके <b>"Create API Key"</b> पर क्लिक करें।</li>
                    <li>उसे कॉपी कर के ऊपर पेस्ट करें।</li>
                  </ol>
                )}
                {customKeys.activeProvider === 'nvidia' && (
                  <ol className="list-decimal list-inside space-y-1 text-gray-650 leading-relaxed" style={{ fontFamily: 'var(--font-noto)' }}>
                    <li><a href="https://build.nvidia.com" target="_blank" rel="noopener noreferrer" className="text-[#1847A6] font-bold underline">Nvidia NIM ↗</a> पर जाएं।</li>
                    <li>लॉगिन करके <b>"Get API Key"</b> पर क्लिक करें।</li>
                    <li>उसे कॉपी कर के ऊपर पेस्ट करें।</li>
                  </ol>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => saveCustomKeys(customKeys)}
                className="flex-1 h-12 bg-gradient-to-r from-[#FF6B00] to-[#E55A00] text-white font-bold rounded-xl active:scale-[0.98] transition-all text-sm cursor-pointer shadow-md"
                style={{ fontFamily: 'var(--font-noto)' }}
              >
                सेव करें (Save Key)
              </button>
              <button
                onClick={() => {
                  const resetConfig = { ...customKeys, [customKeys.activeProvider]: '' };
                  saveCustomKeys(resetConfig);
                }}
                className="h-12 bg-gray-100 text-red-600 hover:bg-gray-200 px-4 font-bold rounded-xl active:scale-[0.98] transition-all text-sm cursor-pointer"
                style={{ fontFamily: 'var(--font-noto)' }}
              >
                हटाएं (Remove)
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
