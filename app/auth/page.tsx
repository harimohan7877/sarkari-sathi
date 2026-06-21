"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);

    // Mock Login Session for simplicity (Shopify style - no complex OTP screens)
    setTimeout(() => {
      const mockUser = {
        id: "00000000-0000-0000-0000-000000000000",
        email: email,
        name: name || email.split("@")[0],
        created_at: new Date().toISOString(),
      };
      localStorage.setItem("mock_user_session", JSON.stringify(mockUser));
      
      const returnTo = sessionStorage.getItem("returnTo") || "/";
      router.push(returnTo);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#fbfbf5] flex flex-col items-center justify-center p-6 font-sans">
      {/* Back Button */}
      <button
        onClick={() => router.push("/")}
        className="absolute top-6 left-6 text-xs text-gray-500 hover:text-black font-semibold uppercase tracking-wider font-mono flex items-center gap-1"
      >
        ← Home
      </button>

      {/* Main Container Card */}
      <div className="w-full max-w-md bg-white border border-gray-100 p-8 md:p-10 rounded-sm shadow-halo animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em] font-mono block mb-2">
            SARKARISATHI
          </span>
          <h1 className="text-3xl font-light text-black tracking-tight font-sans">
            Log in
          </h1>
          <p className="text-xs text-gray-500 mt-2 font-mono">
            Enter your credentials to access study materials
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1.5 font-mono">
              Your Name (Optional)
            </label>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-11 px-4 text-xs bg-gray-50/50 border border-gray-200 rounded-sm focus:bg-white focus:border-black outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1.5 font-mono">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="example@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-4 text-xs bg-gray-50/50 border border-gray-200 rounded-sm focus:bg-white focus:border-black outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="button-primary-pill w-full h-11 text-xs uppercase tracking-wider font-bold mt-4 shadow-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Logging in...
              </>
            ) : (
              "Continue"
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-[10px] text-gray-400 font-mono">
            Secure login. No password required.
          </p>
        </div>
      </div>
    </div>
  );
}
