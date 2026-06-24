"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const [status, setStatus] = useState("Completing sign in...");

  useEffect(() => {
    let cancelled = false;

    async function handleCallback() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const hash = window.location.hash;

      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (cancelled) return;
        if (!error && data?.session?.user) {
          localStorage.setItem("mock_user_session", JSON.stringify(data.session.user));
          const returnTo = sessionStorage.getItem("returnTo") || "/";
          sessionStorage.removeItem("returnTo");
          window.location.replace(returnTo);
          return;
        }
      }

      if (hash) {
        const hashParams = new URLSearchParams(hash.substring(1));
        const accessToken = hashParams.get("access_token");
        if (accessToken) {
          const { data: { session } } = await supabase.auth.getSession();
          if (cancelled) return;
          if (session?.user) {
            localStorage.setItem("mock_user_session", JSON.stringify(session.user));
            const returnTo = sessionStorage.getItem("returnTo") || "/";
            sessionStorage.removeItem("returnTo");
            window.location.replace(returnTo);
            return;
          }
        }
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;
      if (session?.user) {
        localStorage.setItem("mock_user_session", JSON.stringify(session.user));
        const returnTo = sessionStorage.getItem("returnTo") || "/";
        sessionStorage.removeItem("returnTo");
        window.location.replace(returnTo);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (cancelled) return;
      if (user) {
        localStorage.setItem("mock_user_session", JSON.stringify(user));
        const returnTo = sessionStorage.getItem("returnTo") || "/";
        sessionStorage.removeItem("returnTo");
        window.location.replace(returnTo);
        return;
      }

      setStatus("Redirecting to login...");
      setTimeout(() => window.location.replace("/auth"), 1500);
    }

    handleCallback();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled || event !== "SIGNED_IN" || !session?.user) return;
      localStorage.setItem("mock_user_session", JSON.stringify(session.user));
      const returnTo = sessionStorage.getItem("returnTo") || "/";
      sessionStorage.removeItem("returnTo");
      window.location.replace(returnTo);
    });

    return () => {
      cancelled = true;
      subscription?.unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#fbfbf5] flex items-center justify-center p-6 font-sans">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-black/20 border-t-black rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-gray-600 font-mono">{status}</p>
      </div>
    </div>
  );
}
