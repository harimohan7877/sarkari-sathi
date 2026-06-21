"use client";

import { useState, useEffect } from "react";

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      title: "Rajasthan Exams Master Study Guide 2026",
      subtitle: "Get handwritten notes, topic-wise MCQs, and full mock tests for RSMSSB, Police & Teaching exams.",
      badge: "🔥 BEST SELLING",
      cta: "Explore Notes",
      gradient: "from-[#0f172a] via-[#1e3a8a] to-[#1e1b4b]", // Slate to Royal Blue
      accentColor: "text-amber-400",
    },
    {
      id: 2,
      title: "10x Faster Preparation Material",
      subtitle: "Curated by experts. Get immediate delivery directly via email and start preparing instantly.",
      badge: "⚡ FAST DELIVERY",
      cta: "Browse Practice Papers",
      gradient: "from-[#111827] via-[#311042] to-[#180828]", // Dark grey to purple
      accentColor: "text-rose-400",
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="w-full bg-white relative group">
      {/* Container */}
      <div className="max-w-[1400px] mx-auto relative overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-in-out h-[240px] sm:h-[300px] md:h-[360px] lg:h-[400px]"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide) => (
            <div 
              key={slide.id} 
              className={`w-full h-full flex-shrink-0 bg-gradient-to-r ${slide.gradient} relative px-6 sm:px-12 md:px-16 flex flex-col justify-center text-left text-white overflow-hidden`}
            >
              {/* Floating Decorative Glow Backgrounds */}
              <div className="absolute right-[-10%] top-[-20%] w-[300px] h-[300px] md:w-[450px] md:h-[450px] rounded-full bg-blue-600/20 blur-[60px] pointer-events-none"></div>
              <div className="absolute left-[30%] bottom-[-30%] w-[250px] h-[250px] rounded-full bg-indigo-500/10 blur-[50px] pointer-events-none"></div>

              {/* Banner Content */}
              <div className="max-w-[650px] z-10 flex flex-col items-start gap-3 sm:gap-4 animate-slide-up">
                {/* Tag Badge */}
                <span className="inline-block bg-white/10 backdrop-blur-md border border-white/20 text-white text-[9px] sm:text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {slide.badge}
                </span>

                {/* Main Heading */}
                <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                  {slide.title}
                </h1>

                {/* Subtitle description */}
                <p className="text-xs sm:text-sm md:text-base text-gray-300 font-normal leading-relaxed">
                  {slide.subtitle}
                </p>

                {/* Action button */}
                <button className="mt-2 text-[12px] sm:text-sm bg-[#e00000] hover:bg-[#cc0000] text-white px-5 sm:px-6 py-2 sm:py-2.5 rounded-sm font-semibold tracking-wide shadow-lg hover:shadow-red-900/20 transition-all active:scale-95">
                  {slide.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Dots */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2.5 z-20">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                currentSlide === idx ? "bg-white scale-110" : "bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>

        {/* Navigation Arrows */}
        <button 
          onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 bg-white/10 hover:bg-[#e00000] text-white border border-white/15 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 shadow-md backdrop-blur-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button 
          onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 bg-white/10 hover:bg-[#e00000] text-white border border-white/15 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 shadow-md backdrop-blur-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
