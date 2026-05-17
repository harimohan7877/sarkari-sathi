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
  const [userProfile, setUserProfile] = useState<{ age: string; education: string; category: string } | null>(null);

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

      const initialMessage: Message = {
        role: "assistant",
        content: `नमस्ते! 🙏\n\nमैं Sarkari Saathi हूं। आप ${found.name_hindi} के लिए apply करना चाहते हैं।\n\nआइए शुरू करते हैं:\n\nक्या आपके पास पहले से SSO ID है?`,
      };
      setMessages([initialMessage]);
    }
  }, [examId, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading || !userProfile) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

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
      <div className="bg-[#0F2B5B] h-16 px-4 flex items-center fixed top-0 w-full z-50 shadow-lg">
        <button
          onClick={() => router.push("/exams")}
          className="text-white hover:text-white/80 font-semibold"
          style={{ fontFamily: "var(--font-noto)" }}
        >
          ←
        </button>
        <div className="flex items-center gap-3 ml-2">
          {/* Avatar */}
          <div className="w-10 h-10 bg-[#FF6B00] rounded-full flex items-center justify-center text-white font-bold">
            स
          </div>
          <div>
            <h1 className="text-white text-base font-bold" style={{ fontFamily: "var(--font-noto)" }}>
              Sarkari Saathi
            </h1>
            <p className="text-white/60 text-xs" style={{ fontFamily: "var(--font-noto)" }}>
              {exam.name_hindi}
            </p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 pt-20 pb-24">
        <div className="max-w-md mx-auto space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-2xl ${
                  msg.role === "user"
                    ? "bg-[#DCF8C6] text-[#0D1B2A]"
                    : "bg-white text-[#0D1B2A] shadow-md"
                }`}
                style={{ fontFamily: "var(--font-noto)" }}
              >
                {/* Avatar for AI messages */}
                {msg.role === "assistant" && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs">🤖</span>
                    <span className="text-xs text-gray-500">Sarkari Saathi</span>
                  </div>
                )}
                <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white shadow-md p-3 rounded-2xl">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - WhatsApp style */}
      <div className="bg-white border-t border-[#C5D0E0] p-3 fixed bottom-0 w-full">
        <div className="max-w-md mx-auto flex gap-2 items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="अपना संदेश लिखें..."
            className="flex-1 h-12 px-4 border-2 border-[#C5D0E0] bg-[#F5F7FA] rounded-full text-base focus:bg-white focus:border-[#1847A6] outline-none"
            style={{ fontFamily: "var(--font-noto)" }}
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="w-12 h-12 bg-[#FF6B00] hover:bg-[#E56200] disabled:bg-gray-300 rounded-full flex items-center justify-center text-white text-xl transition-colors"
          >
            ➤
          </button>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="max-w-md mx-auto p-3 pb-20">
        <p className="text-xs text-gray-400 text-center" style={{ fontFamily: "var(--font-noto)" }}>
          ⚠️ {exam.last_verified} को verify • {exam.official_url}
        </p>
      </div>
    </main>
  );
}