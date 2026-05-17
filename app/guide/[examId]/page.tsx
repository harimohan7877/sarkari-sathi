"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { getExamById, type Exam, type UserProfile } from "@/lib/eligibility";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function GuidePage() {
  const router = useRouter();
  const params = useParams();
  const examId = params.examId as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [exam, setExam] = useState<Exam | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Quick reply options
  const quickReplies = [
    "📝 SSO ID कैसे बनाएं?",
    "📋 Form कैसे भरें?",
    "📅 Last Date क्या है?",
    "💰 Fees कितनी है?",
    "📄 Documents क्या चाहिए?",
    "🎥 Free पढ़ाई कहाँ से करें?",
  ];

  useEffect(() => {
    const found = getExamById(examId);
    if (!found) {
      router.push("/exams");
      return;
    }
    setExam(found);

    const storedProfile = localStorage.getItem("userProfile");
    if (storedProfile) {
      const profile = JSON.parse(storedProfile);
      setUserProfile(profile);

      // Enhanced initial message with profile info
      const initialMessage: Message = {
        role: "assistant",
        content: `नमस्ते! 🙏 मैं सरकारी साथी हूं।

📊 आपकी प्रोफाइल:
• उम्र: ${profile.age} साल
• शिक्षा: ${profile.education === 'graduation' ? 'स्नातक' : profile.education === '12th' ? '12वीं पास' : profile.education === '10th' ? '10वीं पास' : profile.education}
• श्रेणी: ${profile.category === 'general_ews' ? 'सामान्य/EWS' : profile.category === 'obc_sbc' ? 'OBC/SBC' : profile.category === 'sc' ? 'SC' : 'ST'}
• लिंग: ${profile.gender === 'male' ? 'पुरुष' : 'महिला'}

आप ${found.name_hindi} के लिए apply करना चाहते हैं।

आप मुझसे पूछ सकते हैं:
• SSO ID कैसे बनाएं?
• Form कैसे भरें?
• Documents क्या चाहिए?
• Fees कितनी है?
• तैयारी कैसे करें?

क्या जानना है? 👇`,
      };
      setMessages([initialMessage]);
    }
  }, [examId, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim() || loading || !userProfile) return;

    const userMessage: Message = { role: "user", content: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setMessageCount(prev => prev + 1);

    try {
      const allMessages = [...messages, userMessage];

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: allMessages,
          examId: examId,
          userProfile,
        }),
      });

      if (!response.ok) throw new Error("API error");

      const data = await response.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "कुछ तकनीकी समस्या हो गई। कृपया फिर से कोशिश करें। 🙏",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Free messages remaining
  const freeLimit = 5;
  const messagesRemaining = freeLimit - messageCount;

  if (!exam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E5EBF5]">
        <p className="text-gray-500">लोड हो रहा है...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#E5EBF5]">
      {/* Header - WhatsApp style */}
      <div className="bg-[#0F2B5B] h-16 px-4 flex items-center justify-between fixed top-0 w-full z-50 shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/exams")}
            className="text-white hover:text-white/80 font-semibold text-xl"
          >
            ←
          </button>
          {/* Avatar */}
          <div className="w-10 h-10 bg-gradient-to-r from-[#FF6B00] to-[#E55A00] rounded-full flex items-center justify-center text-white font-bold text-lg">
            🏛️
          </div>
          <div>
            <h1 className="text-white text-base font-bold" style={{ fontFamily: "var(--font-noto)" }}>
              सरकारी साथी
            </h1>
            <p className="text-white/60 text-xs flex items-center gap-1" style={{ fontFamily: "var(--font-noto)" }}>
              <span className="w-2 h-2 bg-[#138808] rounded-full"></span>
              आपका सरकारी मार्गदर्शक
            </p>
          </div>
        </div>

        {/* Free counter */}
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
          messagesRemaining > 0
            ? "bg-[#E8F5E9] text-[#138808]"
            : "bg-red-100 text-red-600"
        }`}>
          {messagesRemaining > 0 ? `🆓 ${messagesRemaining}/${freeLimit}` : '❌ Limit complete'}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 pt-20 pb-28">
        <div className="max-w-md mx-auto space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-2xl ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-[#0F2B5B] to-[#1847A6] text-white"
                    : "bg-white text-[#0D1B2A] shadow-md"
                }`}
                style={{
                  fontFamily: "var(--font-noto)",
                  borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "4px 18px 18px 18px"
                }}
              >
                {/* Avatar for AI messages */}
                {msg.role === "assistant" && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">🏛️</span>
                    <span className="text-xs text-gray-500">सरकारी साथी</span>
                    {/* Verified tick */}
                    <span className="text-blue-400">✓</span>
                  </div>
                )}
                <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                {/* Timestamp */}
                <div className={`text-[10px] mt-1 ${msg.role === "user" ? "text-white/60" : "text-gray-400"}`}>
                  {new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })}
                  {msg.role === "user" && <span className="ml-1">✓✓</span>}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white shadow-md p-4 rounded-2xl rounded-tl-none">
                <div className="flex gap-2">
                  <span className="w-3 h-3 bg-[#C5D0E0] rounded-full typing-dot" style={{ animationDelay: '0s' }}></span>
                  <span className="w-3 h-3 bg-[#C5D0E0] rounded-full typing-dot" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-3 h-3 bg-[#C5D0E0] rounded-full typing-dot" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Reply Chips */}
      {messagesRemaining > 0 && !loading && (
        <div className="bg-white border-t border-[#C5D0E0] px-4 py-3 overflow-x-auto scroll-hidden">
          <div className="flex gap-2 min-w-max">
            {quickReplies.map((reply, i) => (
              <button
                key={i}
                onClick={() => sendMessage(reply)}
                className="whitespace-nowrap px-4 py-2 bg-[#F5F7FA] border border-[#C5D0E0] rounded-full text-sm font-medium text-[#0F2B5B] hover:bg-[#FFF3E8] hover:border-[#FF6B00] transition-colors"
                style={{ fontFamily: "var(--font-noto)" }}
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area - WhatsApp style */}
      <div className="bg-white border-t border-[#C5D0E0] p-3 fixed bottom-0 w-full">
        <div className="max-w-md mx-auto flex gap-2 items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={messagesRemaining > 0 ? "अपना संदेश लिखें..." : "आज के 5 मुफ्त सवाल हो गए। कल फिर आना। 🙏"}
            disabled={loading || messagesRemaining <= 0}
            className="flex-1 h-12 px-4 border-2 border-[#C5D0E0] bg-[#F5F7FA] rounded-full text-base focus:bg-white focus:border-[#1847A6] outline-none disabled:bg-gray-100 disabled:text-gray-400"
            style={{ fontFamily: "var(--font-noto)" }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim() || messagesRemaining <= 0}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-xl transition-colors ${
              input.trim() && messagesRemaining > 0
                ? "bg-[#FF6B00] hover:bg-[#E56200]"
                : "bg-[#E2E8F5]"
            }`}
          >
            ➤
          </button>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="max-w-md mx-auto p-3 pb-24">
        <p className="text-xs text-gray-400 text-center" style={{ fontFamily: "var(--font-noto)" }}>
          ⚠️ {exam.last_verified} को verify • {exam.official_url}
        </p>
      </div>
    </main>
  );
}