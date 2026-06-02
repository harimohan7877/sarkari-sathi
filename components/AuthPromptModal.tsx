'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface AuthPromptModalProps {
  onClose: () => void;
  reason: 'message_limit' | 'study_material' | 'save_exam';
}

export default function AuthPromptModal({ onClose, reason }: AuthPromptModalProps) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setIsLoggedIn(true);
    });
  }, []);

  const titles: Record<string, string> = {
    message_limit: isLoggedIn ? 'अनलिमिटेड एक्सेस 💎' : '5 सवाल हो गए! 🎉',
    study_material: isLoggedIn ? 'प्रीमियम अनलॉक करें 💎' : 'Study Material देखें 📚',
    save_exam: isLoggedIn ? 'प्रीमियम अनलॉक करें 💎' : 'Exam Save करें ❤️'
  };

  const subtitles: Record<string, string> = {
    message_limit: isLoggedIn ? 'सभी स्टडी मटेरियल व अनलिमिटेड चैट अनलॉक करें' : 'Login करें और 5 और FREE सवाल पाएं',
    study_material: isLoggedIn ? 'सिलेबस और PYQ देखने के लिए प्रीमियम अनलॉक करें' : 'Login करें और पूरा Study Material पाएं',
    save_exam: isLoggedIn ? 'भर्तियों को सेव करने के लिए प्रीमियम अनलॉक करें' : 'Login करें और Exams Save करें'
  };

  function handleLogin() {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('returnTo', window.location.pathname);
    }
    router.push('/auth');
  }

  function handlePayment() {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('returnTo', window.location.pathname);
    }
    router.push('/payment');
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Blur overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Card */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0F2B5B] to-[#1847A6] p-5 text-center">
          <h2 className="text-white text-xl font-bold" style={{ fontFamily: 'var(--font-noto)' }}>
            {titles[reason]}
          </h2>
          <p className="text-white/80 text-sm mt-1" style={{ fontFamily: 'var(--font-noto)' }}>
            {subtitles[reason]}
          </p>
        </div>

        {/* Benefits */}
        <div className="p-5">
          <ul className="space-y-2 mb-5">
            {[
              '✅ अनलिमिटेड AI चैट',
              '✅ पूरा विस्तृत Syllabus (पाठ्यक्रम)',
              '✅ Previous Year Papers (PYQs)',
              '✅ सभी भर्तियों के सटीक दिशा-निर्देश',
              '✅ भर्तियों को डैशबोर्ड में सेव करें'
            ].map((item, i) => (
              <li key={i} className="text-sm text-[#0D1B2A] font-medium animate-fade-in" style={{ fontFamily: 'var(--font-noto)' }}>
                {item}
              </li>
            ))}
          </ul>

          {/* Login Button */}
          {!isLoggedIn && (
            <button
              onClick={handleLogin}
              className="w-full h-12 bg-gradient-to-r from-[#FF6B00] to-[#E55A00] text-white font-bold rounded-xl hover:from-[#E56200] hover:to-[#CC5500] active:scale-[0.98] transition-all mb-3 cursor-pointer text-sm shadow-md"
              style={{ fontFamily: 'var(--font-noto)' }}
            >
              Login / Sign Up करें 🔐
            </button>
          )}

          {/* Payment Button */}
          <button
            onClick={handlePayment}
            className="w-full h-12 font-bold rounded-xl active:scale-[0.98] transition-all mb-3 cursor-pointer text-sm shadow-md"
            style={{ 
              fontFamily: 'var(--font-noto)',
              background: isLoggedIn ? 'linear-gradient(to right, #FF6B00, #E55A00)' : '#f3f4f6', 
              color: isLoggedIn ? 'white' : '#0F2B5B'
            }}
          >
            ₹30 में Premium एक्टिवेट करें 💎
          </button>

          {/* Close link */}
          <button
            onClick={onClose}
            className="w-full text-center text-sm text-gray-400 hover:text-gray-600 cursor-pointer"
            style={{ fontFamily: 'var(--font-noto)' }}
          >
            बाद में
          </button>
        </div>
      </div>
    </div>
  );
}
