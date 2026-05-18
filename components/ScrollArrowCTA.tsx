'use client';

export default function ScrollArrowCTA() {
  return (
    <div
      className="bg-gradient-to-r from-[#0F2B5B] to-[#1847A6] text-white text-center py-4 px-6 cursor-pointer hover:from-[#0D2550] hover:to-[#1540A0] transition-colors"
      onClick={() => document.getElementById('exam-info')?.scrollIntoView({ behavior: 'smooth' })}
    >
      <div className="animate-bounce text-2xl mb-1">⬇️</div>
      <p className="font-bold text-sm" style={{ fontFamily: 'var(--font-noto)' }}>
        नीचे देखें — Complete Syllabus, Papers और सब कुछ
      </p>
      <p className="text-white/70 text-xs mt-1" style={{ fontFamily: 'var(--font-noto)' }}>
        Eligibility • Documents • Syllabus • Previous Papers • Important Links
      </p>
    </div>
  );
}
