'use client';

import { useRouter } from 'next/navigation';

interface AuthPromptModalProps {
  onClose: () => void;
  reason: 'message_limit' | 'study_material' | 'save_exam';
}

export default function AuthPromptModal({ onClose, reason }: AuthPromptModalProps) {
  const router = useRouter();

  const titles: Record<string, string> = {
    message_limit: '5 सवाल हो गए! 🎉',
    study_material: 'Study Material देखें 📚',
    save_exam: 'Exam Save करें ❤️'
  };

  const subtitles: Record<string, string> = {
    message_limit: 'Login करें और 5 और FREE सवाल पाएं',
    study_material: 'Login करें और पूरा Study Material पाएं',
    save_exam: 'Login करें और Exams Save करें'
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
              '✅ 5 और AI सवाल FREE',
              '✅ पूरा Study Material',
              '✅ Previous Year Papers',
              '✅ Syllabus PDF',
              '✅ Exam save करें'
            ].map((item, i) => (
              <li key={i} className="text-sm text-[#0D1B2A] font-medium" style={{ fontFamily: 'var(--font-noto)' }}>
                {item}
              </li>
            ))}
          </ul>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            className="w-full h-12 bg-gradient-to-r from-[#FF6B00] to-[#E55A00] text-white font-bold rounded-xl hover:from-[#E56200] hover:to-[#CC5500] active:scale-[0.98] transition-all mb-3"
            style={{ fontFamily: 'var(--font-noto)' }}
          >
            Login / Sign Up करें 🔐
          </button>

          {/* Payment Button */}
          <button
            onClick={handlePayment}
            className="w-full h-12 bg-gray-100 text-[#0F2B5B] font-bold rounded-xl hover:bg-gray-200 active:scale-[0.98] transition-all mb-3"
            style={{ fontFamily: 'var(--font-noto)' }}
          >
            ₹30 दो और Unlimited पाएं 💎
          </button>

          {/* Close link */}
          <button
            onClick={onClose}
            className="w-full text-center text-sm text-gray-400 hover:text-gray-600"
            style={{ fontFamily: 'var(--font-noto)' }}
          >
            बाद में
          </button>
        </div>
      </div>
    </div>
  );
}
