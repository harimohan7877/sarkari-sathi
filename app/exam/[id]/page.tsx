"use client";

import { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { getExamById, type Exam, type UserProfile } from "@/lib/eligibility";
import { supabase } from "@/lib/supabase";
import MessageCounter from "@/components/MessageCounter";
import ScrollArrowCTA from "@/components/ScrollArrowCTA";
import AuthPromptModal from "@/components/AuthPromptModal";

interface ChatMsg { role: "user" | "assistant"; content: string; }

const QUICK_REPLIES = [
  "इसका Syllabus क्या है?",
  "Documents क्या चाहिए?",
  "SSO ID कैसे बनाएं?",
  "Fee कैसे pay करें?",
  "Age limit कितनी है?",
];

const SYLLABUS_DATA: Record<string, any> = {
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
};

const PYQ_DATA: Record<string, any[]> = {
  'rsmssb-patwari-2026': [
    { year: "2021", name: "Patwari Exam Paper 2021", url: "https://www.adda247.com/exams/rajasthan/rajasthan-patwari-previous-year-paper/", source: "Adda247", type: "PDF" },
    { year: "Mock", name: "Online Mock Test (Free)", url: "https://toppersexam.com/state-level-exams/rajasthan-patwari-question-paper", source: "ToppersExam", type: "Online" },
    { year: "Official", name: "RSMSSB Official Papers", url: "https://rsmssb.rajasthan.gov.in", source: "RSMSSB", type: "Official" },
  ],
  'rpsc-ras-2026': [
    { year: "2016-2023", name: "RAS Previous Year Papers", url: "https://rpsc.rajasthan.gov.in/previousquestionpapers.aspx", source: "RPSC Official", type: "Official" },
  ],
};

export default function ExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [exam, setExam] = useState<Exam | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [msgUsed, setMsgUsed] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authReason, setAuthReason] = useState<'message_limit' | 'study_material' | 'save_exam'>('message_limit');
  const chatRef = useRef<HTMLDivElement>(null);

  const tier: 'guest' | 'registered' | 'paid' = user ? 'registered' : 'guest';
  const limit = tier === 'guest' ? 5 : tier === 'registered' ? 10 : 999;
  const isGuest = !user;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { if (data?.user) setUser(data.user); });
    const stored = localStorage.getItem("userProfile") || sessionStorage.getItem("userProfile");
    if (stored) setProfile(JSON.parse(stored));
    const e = getExamById(id);
    if (e) {
      setExam(e);
      setMessages([{ role: "assistant", content: `नमस्ते! 🙏 मैं आपको **${e.short_name || e.name}** के बारे में पूरी जानकारी दे सकता हूँ।\n\nनीचे कोई भी सवाल पूछें या quick buttons use करें! ⬇️` }]);
    }
  }, [id]);

  useEffect(() => { chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" }); }, [messages]);

  async function sendMessage(text?: string) {
    const msg = text || input.trim();
    if (!msg || loading) return;
    if (msgUsed >= limit) {
      setAuthReason('message_limit');
      setShowAuthModal(true);
      return;
    }
    setInput("");
    const newMsgs: ChatMsg[] = [...messages, { role: "user", content: msg }];
    setMessages(newMsgs);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMsgs.filter(m => m.role !== 'assistant' || newMsgs.indexOf(m) > 0), examId: id, userProfile: profile }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMessages([...newMsgs, { role: "assistant", content: data.response }]);
      setMsgUsed(prev => prev + 1);
    } catch {
      setMessages([...newMsgs, { role: "assistant", content: "⚠️ कुछ problem हो गई। कृपया दोबारा कोशिश करें।" }]);
    }
    setLoading(false);
  }

  if (!exam) return <div className="min-h-screen flex items-center justify-center bg-[#EEF2F8]"><p className="text-gray-500">लोड हो रहा है...</p></div>;

  const syllabus = SYLLABUS_DATA[id];
  const pyqs = PYQ_DATA[id] || [];
  const docs = (exam as any).step_by_step_form_guide || [];
  const tabs = [
    { id: 'overview', label: 'Overview', emoji: '📋' },
    { id: 'syllabus', label: 'Syllabus', emoji: '📚', locked: isGuest },
    { id: 'pyq', label: 'PYQ', emoji: '📝', locked: isGuest },
    { id: 'documents', label: 'Documents', emoji: '📄' },
    { id: 'links', label: 'Links', emoji: '🔗' },
  ];

  return (
    <main className="min-h-screen bg-[#EEF2F8] flex flex-col">
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF6B00] via-white to-[#138808] z-[60]" />

      {/* Header */}
      <div className="bg-[#0F2B5B] h-14 px-4 flex items-center fixed top-1 w-full z-50 shadow-lg">
        <button onClick={() => router.push("/results")} className="text-white font-semibold" style={{ fontFamily: "var(--font-noto)" }}>← वापस</button>
        <div className="flex-1 text-center">
          <h1 className="text-white text-base font-bold truncate px-4" style={{ fontFamily: "var(--font-noto)" }}>{exam.short_name || exam.name}</h1>
        </div>
        <a href={exam.official_url} target="_blank" rel="noopener noreferrer" className="text-white/80 text-sm">🌐</a>
      </div>

      <div className="pt-16 flex flex-col flex-1 max-w-2xl mx-auto w-full">
        {/* Chat Section */}
        <div className="bg-white border-b border-[#C5D0E0] flex flex-col" style={{ height: '55vh' }}>
          {/* Bot header */}
          <div className="bg-[#EEF2F8] px-4 py-2 flex items-center gap-2 border-b border-[#C5D0E0]">
            <div className="w-8 h-8 bg-[#0F2B5B] rounded-full flex items-center justify-center text-white text-sm">🏛️</div>
            <div>
              <p className="text-sm font-bold text-[#0F2B5B]" style={{ fontFamily: "var(--font-noto)" }}>सरकारी साथी</p>
              <p className="text-[10px] text-green-600">● Online</p>
            </div>
          </div>

          {/* Messages */}
          <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#E5EBF5]">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={m.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                  <p className="text-sm whitespace-pre-wrap" style={{ fontFamily: "var(--font-noto)" }}>{m.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="chat-bubble-ai flex gap-1.5 py-3">
                  <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
                </div>
              </div>
            )}
          </div>

          {/* Quick replies */}
          {messages.length <= 2 && (
            <div className="px-3 py-2 flex gap-2 overflow-x-auto scroll-hidden bg-white border-t border-[#C5D0E0]">
              {QUICK_REPLIES.map((q, i) => (
                <button key={i} onClick={() => sendMessage(q)} className="quick-reply-chip flex-shrink-0" style={{ fontFamily: "var(--font-noto)" }}>{q}</button>
              ))}
            </div>
          )}

          {/* Message Counter */}
          <MessageCounter used={msgUsed} limit={limit} tier={tier} onLoginClick={() => { setAuthReason('message_limit'); setShowAuthModal(true); }} onPayClick={() => router.push('/payment')} />

          {/* Input */}
          <div className="px-3 py-2 bg-white border-t border-[#C5D0E0] flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="अपना सवाल पूछें..."
              disabled={msgUsed >= limit}
              className="flex-1 h-11 border-2 border-[#C5D0E0] rounded-xl px-4 text-sm bg-[#F5F7FA] focus:border-[#1847A6] focus:bg-white outline-none disabled:opacity-50"
              style={{ fontFamily: "var(--font-noto)" }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading || msgUsed >= limit}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${input.trim() ? 'bg-[#FF6B00] text-white' : 'bg-[#E2E8F5] text-gray-400'}`}
            >
              ➤
            </button>
          </div>
        </div>

        {/* Scroll Arrow CTA */}
        {messages.length >= 2 && <ScrollArrowCTA />}

        {/* Exam Info Section */}
        <div id="exam-info" className="bg-white">
          {/* Tabs */}
          <div className="flex overflow-x-auto scroll-hidden border-b border-[#C5D0E0]">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.locked) { setAuthReason('study_material'); setShowAuthModal(true); return; }
                  setActiveTab(tab.id);
                }}
                className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id ? 'border-[#FF6B00] text-[#0F2B5B]' : 'border-transparent text-gray-400 hover:text-gray-600'
                } ${tab.locked ? 'opacity-60' : ''}`}
                style={{ fontFamily: "var(--font-noto)" }}
              >
                {tab.emoji} {tab.label} {tab.locked && '🔒'}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-5 min-h-[300px]">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-[#0F2B5B] mb-2" style={{ fontFamily: "var(--font-noto)" }}>{exam.name}</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-[#EEF2F8] rounded-lg p-3"><p className="text-gray-500 text-xs">बोर्ड</p><p className="font-bold text-[#0F2B5B]">{exam.board}</p></div>
                    <div className="bg-[#EEF2F8] rounded-lg p-3"><p className="text-gray-500 text-xs">Status</p><p className="font-bold text-[#0F2B5B]">{exam.status}</p></div>
                    <div className="bg-[#EEF2F8] rounded-lg p-3"><p className="text-gray-500 text-xs">शिक्षा</p><p className="font-bold text-[#0F2B5B] text-xs">{exam.eligibility.education}</p></div>
                    <div className="bg-[#EEF2F8] rounded-lg p-3"><p className="text-gray-500 text-xs">आयु</p><p className="font-bold text-[#0F2B5B]">{exam.eligibility.min_age}-{exam.eligibility.max_age}</p></div>
                  </div>
                </div>
                {exam.selection_process && (
                  <div>
                    <h4 className="font-bold text-sm text-[#0F2B5B] mb-2" style={{ fontFamily: "var(--font-noto)" }}>चयन प्रक्रिया</h4>
                    <div className="space-y-1">
                      {exam.selection_process.map((s, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm"><span className="w-6 h-6 bg-[#FF6B00] text-white rounded-full flex items-center justify-center text-xs font-bold">{i+1}</span><span style={{ fontFamily: "var(--font-noto)" }}>{s}</span></div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'syllabus' && syllabus && (
              <div className="space-y-3">
                <h3 className="font-bold text-[#0F2B5B]" style={{ fontFamily: "var(--font-noto)" }}>📚 विस्तृत पाठ्यक्रम</h3>
                {syllabus.subjects.map((s: any, i: number) => (
                  <div key={i} className="bg-[#EEF2F8] rounded-xl p-3">
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-bold text-sm text-[#0F2B5B]" style={{ fontFamily: "var(--font-noto)" }}>{s.name}</p>
                      <span className="bg-[#FF6B00] text-white text-xs px-2 py-0.5 rounded-full">{s.weightage}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {s.topics.map((t: string, ti: number) => (
                        <span key={ti} className="bg-white text-xs text-gray-600 px-2 py-1 rounded-lg" style={{ fontFamily: "var(--font-noto)" }}>{t}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'syllabus' && !syllabus && (
              <p className="text-gray-400 text-center py-8" style={{ fontFamily: "var(--font-noto)" }}>Syllabus जल्द उपलब्ध होगा</p>
            )}

            {activeTab === 'pyq' && (
              <div className="space-y-3">
                <h3 className="font-bold text-[#0F2B5B]" style={{ fontFamily: "var(--font-noto)" }}>📝 Previous Year Papers</h3>
                {pyqs.length > 0 ? pyqs.map((p: any, i: number) => (
                  <a key={i} href={p.url} target="_blank" rel="noopener noreferrer" className="block bg-[#EEF2F8] rounded-xl p-3 hover:shadow-md transition-all">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-sm text-[#0F2B5B]" style={{ fontFamily: "var(--font-noto)" }}>{p.name}</p>
                        <p className="text-xs text-gray-500">{p.source} • {p.year}</p>
                      </div>
                      <span className="text-[#FF6B00] text-sm">→</span>
                    </div>
                  </a>
                )) : <p className="text-gray-400 text-center py-8" style={{ fontFamily: "var(--font-noto)" }}>PYQ जल्द उपलब्ध होंगे</p>}
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-2">
                <h3 className="font-bold text-[#0F2B5B] mb-2" style={{ fontFamily: "var(--font-noto)" }}>📄 जरूरी दस्तावेज़</h3>
                {["SSO ID (mandatory)", "Jan Aadhaar / Aadhaar Card", "10th Certificate (age proof)", "Category Certificate (SC/ST/OBC/EWS)", "Domicile Certificate (Rajasthan)", "Passport Photo (white BG)", "Scanned Signature", "Bank Details"].map((d, i) => (
                  <div key={i} className="flex items-center gap-2 bg-[#EEF2F8] rounded-lg p-3 text-sm">
                    <span className="text-[#138808]">✅</span>
                    <span style={{ fontFamily: "var(--font-noto)" }}>{d}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'links' && (
              <div className="space-y-2">
                <h3 className="font-bold text-[#0F2B5B] mb-2" style={{ fontFamily: "var(--font-noto)" }}>🔗 महत्वपूर्ण लिंक</h3>
                {[
                  { label: "Official Website", url: exam.official_url, icon: "🏛️" },
                  { label: "Apply Online (SSO)", url: (exam as any).apply_url || "https://sso.rajasthan.gov.in", icon: "📝" },
                  { label: "SSO Helpdesk: 0141-5153222", url: "tel:01415153222", icon: "📞" },
                ].map((l, i) => (
                  <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-[#EEF2F8] rounded-lg p-3 hover:shadow-md transition-all">
                    <span className="text-lg">{l.icon}</span>
                    <span className="text-sm font-medium text-[#0F2B5B]" style={{ fontFamily: "var(--font-noto)" }}>{l.label}</span>
                    <span className="ml-auto text-[#FF6B00]">→</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-[#FFF3E8] border-l-4 border-[#FF6B00] p-3 m-4 rounded-r-lg">
          <p className="text-orange-800 text-xs" style={{ fontFamily: "var(--font-noto)" }}>
            ⚠️ {exam.disclaimer}
          </p>
        </div>
      </div>

      {showAuthModal && <AuthPromptModal onClose={() => setShowAuthModal(false)} reason={authReason} />}
    </main>
  );
}
