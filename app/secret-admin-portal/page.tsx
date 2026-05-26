"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Stats {
  totalUsers: number;
  totalPaidUsers: number;
  totalGuests: number;
  totalChats: number;
  totalRevenue: number;
  warning?: string;
}

interface UserProfile {
  id: string;
  name: string | null;
  city: string | null;
  state: string;
  age: number;
  education: string;
  category: string;
  gender: string;
  is_paid: boolean;
  ai_messages_used: number;
  created_at: string;
}

interface ChatMessage {
  id: string;
  user_id: string;
  exam_id: string;
  role: string;
  content: string;
  created_at: string;
}

interface ConfigSettings {
  active_provider: string;
  gemini_key: string;
  openai_key: string;
  claude_key: string;
  openrouter_key: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"dashboard" | "ai" | "users" | "chats" | "schema">("dashboard");
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalPaidUsers: 0, totalGuests: 0, totalChats: 0, totalRevenue: 0 });
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [chats, setChats] = useState<ChatMessage[]>([]);
  
  // AI Config States
  const [config, setConfig] = useState<ConfigSettings>({ active_provider: "openrouter", gemini_key: "", openai_key: "", claude_key: "", openrouter_key: "" });
  const [testResult, setTestResult] = useState<{ success?: boolean; text?: string; loading?: boolean }>({});
  const [saveStatus, setSaveStatus] = useState<{ success?: boolean; text?: string; loading?: boolean }>({});
  
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);

  // Get passcode from sessionStorage
  const getPasscode = () => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("sarkari-saathi-admin-verified") || "";
    }
    return "";
  };

  const getAuthHeaders = () => {
    return {
      "Content-Type": "application/json",
      "Authorization": getPasscode(),
    };
  };

  // Check auth
  useEffect(() => {
    const isVerified = document.cookie.includes("sarkari-saathi-admin-verified=true");
    if (!isVerified) {
      router.push("/secret-admin-portal/login");
    }
  }, [router]);

  // Load stats
  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch("/api/admin/stats", {
        headers: getAuthHeaders(),
      });
      if (res.status === 401) {
        router.push("/secret-admin-portal/login");
        return;
      }
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStats(false);
    }
  };

  // Load config
  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/admin/settings", {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Load users
  const fetchUsers = async (query = "") => {
    setLoadingUsers(true);
    try {
      const url = query ? `/api/admin/users?q=${encodeURIComponent(query)}` : "/api/admin/users";
      const res = await fetch(url, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Load chats
  const fetchChats = async () => {
    setLoadingChats(true);
    try {
      const res = await fetch("/api/admin/chats", {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setChats(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingChats(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchConfig();
  }, []);

  useEffect(() => {
    if (activeTab === "dashboard") fetchStats();
    if (activeTab === "users") fetchUsers(searchQuery);
    if (activeTab === "chats") fetchChats();
  }, [activeTab]);

  // Toggle user paid status
  const handleTogglePaid = async (userId: string, currentPaid: boolean) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          userId,
          action: "toggle_paid",
          isPaid: !currentPaid,
        }),
      });
      if (res.ok) {
        fetchUsers(searchQuery);
        fetchStats(); // Update counters
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Reset user messages count
  const handleResetMessages = async (userId: string) => {
    if (!confirm("क्या आप इस यूज़र के AI संदेशों की गिनती को शून्य (0) करना चाहते हैं?")) return;
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          userId,
          action: "reset_messages",
        }),
      });
      if (res.ok) {
        fetchUsers(searchQuery);
        alert("संदेश काउंटर रीसेट हो गया!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Test API Key
  const handleTestKey = async (provider: string) => {
    setTestResult({ loading: true });
    let key = "";
    if (provider === "gemini") key = config.gemini_key;
    if (provider === "openai") key = config.openai_key;
    if (provider === "claude") key = config.claude_key;
    if (provider === "openrouter") key = config.openrouter_key;

    if (!key) {
      setTestResult({ success: false, text: "कृपया पहले कुंजी (API Key) दर्ज करें।" });
      return;
    }

    try {
      const res = await fetch("/api/admin/test-key", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ provider, key }),
      });
      const data = await res.json();
      if (data.success) {
        setTestResult({ success: true, text: `सफल! AI जवाब: "${data.response}"` });
      } else {
        setTestResult({ success: false, text: `त्रुटि (Error): ${data.error}` });
      }
    } catch (err: any) {
      setTestResult({ success: false, text: `कनेक्शन विफल: ${err.message}` });
    }
  };

  // Save AI Config Settings
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus({ loading: true });

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(config),
      });

      if (res.ok) {
        setSaveStatus({ success: true, text: "सेटिंग्स सफलतापूर्वक सेव हो गईं! 🚀" });
        fetchConfig(); // Reload masked keys
        setTimeout(() => setSaveStatus({}), 3000);
      } else {
        const err = await res.json();
        setSaveStatus({ success: false, text: `सेव करने में विफल: ${err.error}` });
      }
    } catch (err: any) {
      setSaveStatus({ success: false, text: `त्रुटि: ${err.message}` });
    }
  };

  const handleLogout = () => {
    document.cookie = "sarkari-saathi-admin-verified=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    sessionStorage.removeItem("sarkari-saathi-admin-verified");
    router.push("/secret-admin-portal/login");
  };

  return (
    <div className="min-h-screen bg-[#0f1117] text-[#e8e8e8] flex">
      {/* Side Navigation */}
      <aside className="w-64 bg-[#1a1d27] border-r border-[#2a2d3a] flex flex-col">
        <div className="p-6 border-b border-[#2a2d3a]">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            🏛️ Sarkari Saathi
          </h1>
          <span className="text-[10px] text-[#10b981] font-semibold tracking-wider uppercase bg-emerald-500/10 px-2 py-0.5 rounded-full mt-1.5 inline-block">
            Admin Panel
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-1.5">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === "dashboard" ? "bg-[#10b981] text-white" : "hover:bg-[#2a2d3a] text-gray-400 hover:text-white"
            }`}
          >
            📊 Analytics Dashboard
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === "ai" ? "bg-[#10b981] text-white" : "hover:bg-[#2a2d3a] text-gray-400 hover:text-white"
            }`}
          >
            ⚙️ AI Configurations
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === "users" ? "bg-[#10b981] text-white" : "hover:bg-[#2a2d3a] text-gray-400 hover:text-white"
            }`}
          >
            👥 Registered Users
          </button>
          <button
            onClick={() => setActiveTab("chats")}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === "chats" ? "bg-[#10b981] text-white" : "hover:bg-[#2a2d3a] text-gray-400 hover:text-white"
            }`}
          >
            💬 Recent Conversations
          </button>
          <button
            onClick={() => setActiveTab("schema")}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === "schema" ? "bg-[#10b981] text-white" : "hover:bg-[#2a2d3a] text-gray-400 hover:text-white"
            }`}
          >
            🗄️ Supabase Schema Guide
          </button>
        </nav>

        <div className="p-4 border-t border-[#2a2d3a]">
          <button
            onClick={handleLogout}
            className="w-full h-11 bg-red-950/30 hover:bg-red-950/60 border border-red-500/20 hover:border-red-500/40 text-red-400 text-sm font-semibold rounded-xl transition-all"
          >
            Logout (लॉगआउट) 🚪
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Tab 1: Dashboard */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white">प्रणाली विश्लेषण (System Analytics)</h2>
              <p className="text-gray-400 text-sm">प्रोजेक्ट की कुल एक्टिविटी और यूज़र्स का सारांश।</p>
            </div>

            {stats.warning && (
              <div className="bg-amber-950/40 border border-amber-500/30 text-amber-300 p-4 rounded-xl text-sm">
                ⚠️ <strong>चेतावनी:</strong> {stats.warning}
              </div>
            )}

            {loadingStats ? (
              <div className="py-12 text-center text-gray-500">विश्लेषण लोड हो रहा है...</div>
            ) : (
              <>
                <div className="grid grid-cols-4 gap-6">
                  <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl p-5 shadow-sm">
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Registered Users</p>
                    <h3 className="text-3xl font-black text-white mt-1.5">{stats.totalUsers}</h3>
                    <p className="text-[10px] text-[#10b981] mt-1 font-semibold">पंजीकृत छात्र</p>
                  </div>
                  <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl p-5 shadow-sm">
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Premium (Paid) Users</p>
                    <h3 className="text-3xl font-black text-emerald-400 mt-1.5">{stats.totalPaidUsers}</h3>
                    <p className="text-[10px] text-emerald-400 mt-1 font-semibold">
                      Conversion: {stats.totalUsers > 0 ? Math.round((stats.totalPaidUsers / stats.totalUsers) * 100) : 0}%
                    </p>
                  </div>
                  <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl p-5 shadow-sm">
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Guest Sessions</p>
                    <h3 className="text-3xl font-black text-blue-400 mt-1.5">{stats.totalGuests}</h3>
                    <p className="text-[10px] text-blue-400 mt-1 font-semibold">बिना लॉगिन के यूज़र्स</p>
                  </div>
                  <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl p-5 shadow-sm">
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">AI Chats Conducted</p>
                    <h3 className="text-3xl font-black text-orange-400 mt-1.5">{stats.totalChats}</h3>
                    <p className="text-[10px] text-orange-400 mt-1 font-semibold">कुल AI वार्तालाप</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  {/* Revenue Card */}
                  <div className="bg-gradient-to-br from-[#1b2536] to-[#121620] border border-[#2d3a54] rounded-2xl p-6 shadow-md col-span-1 flex flex-col justify-between min-h-[180px]">
                    <div>
                      <span className="text-sm font-semibold text-blue-300 bg-blue-500/10 px-2.5 py-0.5 rounded-full">Collected Revenue</span>
                      <p className="text-gray-400 text-xs mt-2">Premium ₹30 अपग्रेड से कुल आय (मॉक / वास्तविक):</p>
                    </div>
                    <div className="mt-4">
                      <h4 className="text-4xl font-extrabold text-white">₹{stats.totalRevenue}</h4>
                      <p className="text-[10px] text-gray-500 mt-1">₹30 प्रति सफल अपग्रेड</p>
                    </div>
                  </div>

                  {/* Operational Notes */}
                  <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl p-6 shadow-sm col-span-2">
                    <h3 className="text-base font-bold text-white mb-2">📌 एडमिन निर्देश (Operational Notes)</h3>
                    <ul className="space-y-2 text-xs text-gray-400 list-disc pl-4">
                      <li>यह पैनल <strong>Vercel / Local Host</strong> पर सुरक्षित है, मुख्य यूज़र-साइट पर इसका कोई लिंक प्रदर्शित नहीं होता।</li>
                      <li><strong>AI Configurations</strong> टैब से आप किसी भी समय Google, OpenAI या Anthropic की API कुंजियों को डालकर उसे लाइव कर सकते हैं।</li>
                      <li>यदि कोई छात्र पेड लिमिट बाईपास करने की शिकायत करता है, तो आप <strong>Registered Users</strong> टैब में उसका ईमेल सर्च करके उसे मैन्युअली Paid चिह्नित कर सकते हैं या उसका AI सीमा काउंटर रीसेट कर सकते हैं।</li>
                    </ul>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Tab 2: AI Configurations */}
        {activeTab === "ai" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white">AI प्रदाता सेटिंग्स (AI Provider Configurations)</h2>
              <p className="text-gray-400 text-sm">प्रोजेक्ट में उपयोग होने वाले AI मॉडल और उनकी API चाबियों को बदलें और तुरंत टेस्ट करें।</p>
            </div>

            <form onSubmit={handleSaveConfig} className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl p-6 space-y-6 max-w-3xl">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Active AI Provider (सक्रिय AI प्रदाता)
                </label>
                <select
                  value={config.active_provider}
                  onChange={(e) => setConfig({ ...config, active_provider: e.target.value })}
                  className="w-full admin-select-field border border-[#2a2d3a] rounded-xl p-3 text-white focus:border-[#10b981] outline-none cursor-pointer"
                >
                  <option value="gemini">Gemini 2.0 Flash (Recommended & Free Tier)</option>
                  <option value="openai">OpenAI GPT-4o-mini</option>
                  <option value="claude">Anthropic Claude 3.5 (Haiku / Sonnet)</option>
                  <option value="openrouter">OpenRouter (Global Proxy)</option>
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  चैटबॉट रियल-टाइम में इसी सक्रिय प्रदाता (Active Provider) का उपयोग करके छात्रों के प्रश्नों का जवाब देगा।
                </p>
              </div>

              {/* Provider Key Inputs */}
              <div className="space-y-4 border-t border-[#2a2d3a] pt-4">
                <h3 className="text-sm font-semibold text-white">API Keys Management</h3>

                {/* Gemini */}
                <div className="grid grid-cols-4 gap-4 items-center">
                  <span className="text-xs text-gray-400 col-span-1 font-semibold">Gemini API Key:</span>
                  <div className="col-span-2">
                    <input
                      type="password"
                      value={config.gemini_key}
                      onChange={(e) => setConfig({ ...config, gemini_key: e.target.value })}
                      placeholder="AIzaSy..."
                      className="w-full admin-input-field border border-[#2a2d3a] rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-[#10b981] outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTestKey("gemini")}
                    className="h-10 bg-[#2a2d3a] hover:bg-[#3a3d4d] text-xs font-bold rounded-xl transition-all"
                  >
                    Test Connection
                  </button>
                </div>

                {/* OpenAI */}
                <div className="grid grid-cols-4 gap-4 items-center">
                  <span className="text-xs text-gray-400 col-span-1 font-semibold">OpenAI API Key:</span>
                  <div className="col-span-2">
                    <input
                      type="password"
                      value={config.openai_key}
                      onChange={(e) => setConfig({ ...config, openai_key: e.target.value })}
                      placeholder="sk-proj-..."
                      className="w-full admin-input-field border border-[#2a2d3a] rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-[#10b981] outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTestKey("openai")}
                    className="h-10 bg-[#2a2d3a] hover:bg-[#3a3d4d] text-xs font-bold rounded-xl transition-all"
                  >
                    Test Connection
                  </button>
                </div>

                {/* Claude */}
                <div className="grid grid-cols-4 gap-4 items-center">
                  <span className="text-xs text-gray-400 col-span-1 font-semibold">Claude API Key:</span>
                  <div className="col-span-2">
                    <input
                      type="password"
                      value={config.claude_key}
                      onChange={(e) => setConfig({ ...config, claude_key: e.target.value })}
                      placeholder="sk-ant-..."
                      className="w-full admin-input-field border border-[#2a2d3a] rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-[#10b981] outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTestKey("claude")}
                    className="h-10 bg-[#2a2d3a] hover:bg-[#3a3d4d] text-xs font-bold rounded-xl transition-all"
                  >
                    Test Connection
                  </button>
                </div>

                {/* OpenRouter */}
                <div className="grid grid-cols-4 gap-4 items-center">
                  <span className="text-xs text-gray-400 col-span-1 font-semibold">OpenRouter Key:</span>
                  <div className="col-span-2">
                    <input
                      type="password"
                      value={config.openrouter_key}
                      onChange={(e) => setConfig({ ...config, openrouter_key: e.target.value })}
                      placeholder="sk-or-v1-..."
                      className="w-full admin-input-field border border-[#2a2d3a] rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-[#10b981] outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTestKey("openrouter")}
                    className="h-10 bg-[#2a2d3a] hover:bg-[#3a3d4d] text-xs font-bold rounded-xl transition-all"
                  >
                    Test Connection
                  </button>
                </div>
              </div>

              {/* Status and Test Alerts */}
              {testResult.loading && <div className="text-xs text-blue-400">⏳ AI प्रदाता से संपर्क स्थापित किया जा रहा है...</div>}
              {testResult.text && (
                <div className={`p-3.5 rounded-xl text-xs border ${
                  testResult.success 
                    ? "bg-emerald-950/40 border-emerald-500/20 text-emerald-400" 
                    : "bg-red-950/40 border-red-500/20 text-red-400"
                }`}>
                  {testResult.text}
                </div>
              )}

              {saveStatus.text && (
                <div className={`p-3.5 rounded-xl text-sm border ${
                  saveStatus.success 
                    ? "bg-emerald-950/40 border-emerald-500/20 text-emerald-400" 
                    : "bg-red-950/40 border-red-500/20 text-red-400"
                }`}>
                  {saveStatus.text}
                </div>
              )}

              <div className="border-t border-[#2a2d3a] pt-4 flex gap-4">
                <button
                  type="submit"
                  disabled={saveStatus.loading}
                  className="px-6 py-2.5 bg-[#10b981] hover:bg-[#059669] text-white font-semibold rounded-xl text-sm transition-all disabled:opacity-50"
                >
                  {saveStatus.loading ? "सेव हो रहा है..." : "सेटिंग्स सेव करें (Save Configuration) 💾"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: Registered Users */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white">पंजीकृत छात्र (Registered Users Management)</h2>
                <p className="text-gray-400 text-sm">यूज़र्स का प्रोफाइल डेटा, पेड स्टेटस, और AI लिमिट का मैनेजमेंट।</p>
              </div>
              
              {/* Search Bar */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="नाम / शहर / श्रेणी सर्च करें..."
                  className="admin-input-field border border-[#2a2d3a] rounded-xl px-4 py-2 text-sm text-white focus:border-[#10b981] outline-none"
                  onKeyDown={(e) => e.key === "Enter" && fetchUsers(searchQuery)}
                />
                <button
                  onClick={() => fetchUsers(searchQuery)}
                  className="bg-[#10b981] hover:bg-[#059669] text-white text-sm font-semibold px-4 rounded-xl"
                >
                  खोजें
                </button>
              </div>
            </div>

            {loadingUsers ? (
              <div className="py-12 text-center text-gray-500">यूज़र्स डेटा लोड हो रहा है...</div>
            ) : users.length === 0 ? (
              <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl p-8 text-center text-gray-500">
                कोई यूज़र नहीं मिला।
              </div>
            ) : (
              <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-[#12151f] text-gray-400 text-xs border-b border-[#2a2d3a]">
                      <th className="p-4">Name (नाम)</th>
                      <th className="p-4">Profile details</th>
                      <th className="p-4">Registration Date</th>
                      <th className="p-4 text-center">AI Messages Used</th>
                      <th className="p-4 text-center">Premium Status</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2a2d3a]">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-[#1f2330]">
                        <td className="p-4">
                          <p className="font-bold text-white">{u.name || "Anonymous Student"}</p>
                          <p className="text-xs text-gray-500">{u.id.substring(0, 8)}...</p>
                        </td>
                        <td className="p-4 space-y-0.5">
                          <p className="text-xs text-gray-300">📍 {u.city || "Not Provided"}, {u.state}</p>
                          <p className="text-xs text-gray-400">🎂 {u.age} वर्ष | 🎓 {u.education}</p>
                          <p className="text-xs text-gray-500">🏷️ {u.category.toUpperCase()} | 🚻 {u.gender === "male" ? "पुरुष" : "महिला"}</p>
                        </td>
                        <td className="p-4 text-xs text-gray-400">
                          {new Date(u.created_at).toLocaleDateString("hi-IN")}
                        </td>
                        <td className="p-4 text-center font-semibold text-lg text-white">
                          {u.ai_messages_used}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleTogglePaid(u.id, u.is_paid)}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                              u.is_paid 
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                                : "bg-gray-800 text-gray-400 border border-gray-700"
                            }`}
                          >
                            {u.is_paid ? "💎 Paid (Premium)" : "🆓 Free Tier"}
                          </button>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleResetMessages(u.id)}
                            className="bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 text-xs px-3 py-1.5 rounded-xl transition-all"
                          >
                            🔄 Reset Counter
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Recent Chats */}
        {activeTab === "chats" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white">हाल के AI संवाद (Recent Conversations logs)</h2>
              <p className="text-gray-400 text-sm">यूज़र्स द्वारा पूछे गए प्रश्न और AI के उत्तर (लाइव मॉनिटरिंग)।</p>
            </div>

            {loadingChats ? (
              <div className="py-12 text-center text-gray-500">चैट हिस्ट्री लोड हो रही है...</div>
            ) : chats.length === 0 ? (
              <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl p-8 text-center text-gray-500">
                कोई चैट हिस्ट्री नहीं मिली।
              </div>
            ) : (
              <div className="space-y-4 max-w-4xl">
                {chats.map((c) => (
                  <div key={c.id} className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl p-5 space-y-3">
                    <div className="flex justify-between items-center text-xs text-gray-500 border-b border-[#2a2d3a]/50 pb-2">
                      <p>👤 User: <span className="text-gray-400">{c.user_id?.substring(0, 8)}...</span></p>
                      <p>🏛️ Exam ID: <span className="text-blue-400 font-semibold">{c.exam_id}</span></p>
                      <p>📅 Date: {new Date(c.created_at).toLocaleString("hi-IN")}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <span className="text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded h-fit">User Q</span>
                        <p className="text-sm font-semibold text-white">{c.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Supabase Schema Guide */}
        {activeTab === "schema" && (
          <div className="space-y-6 max-w-4xl">
            <div>
              <h2 className="text-2xl font-bold text-white">डेटाबेस स्कीमा निर्देशिका (Supabase Schema Guide)</h2>
              <p className="text-gray-400 text-sm">
                एडमिन पैनल सेटिंग्स और AI Providers को सक्रिय करने के लिए Supabase SQL Editor में निम्नांकित कोड चलाएं।
              </p>
            </div>

            <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl p-6 space-y-4">
              <p className="text-sm text-gray-300">
                यदि एडमिन पैनल खोलते समय <strong>"Relation does not exist"</strong> एरर मिलता है या AI कुंजियां डेटाबेस में सुरक्षित नहीं हो पा रही हैं, तो अपने 
                Supabase SQL Editor में यह पूरा स्क्रिप्ट चलाएं:
              </p>

              <pre className="bg-[#0f1117] border border-[#2a2d3a] rounded-xl p-5 overflow-x-auto text-xs text-emerald-400 font-mono leading-relaxed">
{`-- 1. Add is_admin column to user_profiles table if missing
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 2. Create Admin Settings Table for AI Provider & API Keys
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  active_provider TEXT NOT NULL DEFAULT 'openrouter',
  gemini_key TEXT DEFAULT '',
  openai_key TEXT DEFAULT '',
  claude_key TEXT DEFAULT '',
  openrouter_key TEXT DEFAULT '',
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- 4. Insert default row if settings table is empty
INSERT INTO admin_settings (active_provider)
SELECT 'openrouter'
WHERE NOT EXISTS (SELECT 1 FROM admin_settings);`}
              </pre>

              <div className="bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 text-xs p-4 rounded-xl">
                💡 <strong>नोट:</strong> RLS (Row Level Security) इनेबल करने के बाद, हमने कोई पब्लिक पॉलिसी नहीं बनाई है। इसका अर्थ यह है कि इस टेबल में मौजूद चाबियों को ब्राउज़र में कोई भी सामान्य यूज़र लीक या देख नहीं सकता। यह सेटिंग्स केवल सुरक्षित सर्वर-साइड नेक्स्ट.जेएस एपीआई (API Router) के माध्यम से नियंत्रित की जाती हैं।
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
