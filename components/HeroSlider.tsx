"use client";

import { useState, useEffect } from "react";

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      badge: "EXAM RESOURCE CENTER",
      title: "Rajasthan Exams Master Guide",
      subtitle: "Handwritten notes, detailed MCQs, and complete mock tests for State level recruitments.",
      cta: "Browse Categories",
    },
    {
      id: 2,
      badge: "DIGITAL PDF DELIVERY",
      title: "10x Faster Resource Access",
      subtitle: "Secure order processing and manual delivery sent directly to your registered email address.",
      cta: "Explore Store",
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="w-full bg-gradient-to-br from-[#0a1128] via-[#111d44] to-[#162447] relative group overflow-hidden">
      {/* Ambient glowing blobs for depth */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[15%] -left-[10%] w-[55%] h-[55%] rounded-full bg-[#4f46e5]/10 blur-[120px]" />
        <div className="absolute -bottom-[25%] right-[5%] w-[45%] h-[45%] rounded-full bg-[#0ea5e9]/10 blur-[100px]" />
        <div className="absolute top-[25%] right-[15%] w-[25%] h-[25%] rounded-full bg-[#6366f1]/8 blur-[80px]" />
      </div>

      <div className="max-w-[1400px] mx-auto relative">
        <div 
          className="flex transition-transform duration-700 ease-out h-[220px] sm:h-[300px] md:h-[360px] lg:h-[400px]"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div 
              key={slide.id} 
              className="w-full h-full flex-shrink-0 relative px-6 sm:px-12 md:px-20 flex flex-col justify-center text-left text-white"
            >
              {/* Subtle grid overlay */}
              <div className="absolute right-0 top-0 w-full h-full opacity-[0.06] bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

              {/* Per-slide decorative glow orbs */}
              {index % 2 === 0 && (
                <div className="absolute left-[35%] top-[10%] w-[300px] h-[300px] rounded-full bg-[#818cf8]/8 blur-[110px] pointer-events-none" />
              )}
              {index % 2 !== 0 && (
                <div className="absolute right-[15%] bottom-[5%] w-[280px] h-[280px] rounded-full bg-[#38bdf8]/8 blur-[100px] pointer-events-none" />
              )}

              {/* Banner Content */}
              <div className="max-w-[700px] z-10 flex flex-col items-start gap-2.5 sm:gap-3.5">
                <span className="text-[10px] text-indigo-300/80 font-semibold tracking-[0.15em] uppercase font-mono animate-hero-fade-in">
                  {slide.badge}
                </span>

                <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-[52px] font-light tracking-tight leading-[1.05] text-white animate-hero-fade-in-delayed">
                  {slide.title}
                </h1>

                <p className="text-[11px] sm:text-xs md:text-sm text-gray-300/80 font-normal leading-relaxed max-w-[550px] animate-hero-fade-in-delayed-2">
                  {slide.subtitle}
                </p>

                <button className="button-outline-on-dark mt-2.5 text-xs tracking-wider uppercase font-medium hover:scale-[1.03] active:scale-[0.97] transition-transform duration-150">
                  {slide.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Dots — pill shape for active */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2.5 z-20">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`rounded-full transition-all duration-300 ${
                currentSlide === idx
                  ? "bg-indigo-400 w-6 h-1.5"
                  : "bg-white/30 w-1.5 h-1.5 hover:bg-white/50"
              }`}
            />
          ))}
        </div>

        {/* Arrows — glass-morphism */}
        <button 
          onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
          className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-white/15 bg-white/5 hover:bg-white/15 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 backdrop-blur-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button 
          onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
          className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-white/15 bg-white/5 hover:bg-white/15 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 backdrop-blur-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
