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
    <div className="w-full bg-black relative group overflow-hidden">
      {/* Container */}
      <div className="max-w-[1400px] mx-auto relative">
        <div 
          className="flex transition-transform duration-500 ease-in-out h-[220px] sm:h-[300px] md:h-[360px] lg:h-[400px]"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide) => (
            <div 
              key={slide.id} 
              className="w-full h-full flex-shrink-0 bg-black relative px-6 sm:px-12 md:px-20 flex flex-col justify-center text-left text-white"
            >
              {/* Subtle design grid pattern and soft circular glow for contrast */}
              <div className="absolute right-0 top-0 w-full h-full opacity-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>
              <div className="absolute right-[10%] top-[10%] w-[350px] h-[350px] rounded-full bg-blue-500/10 blur-[80px] pointer-events-none"></div>

              {/* Banner Content - Neue Haas Grotesk inspired thin typography */}
              <div className="max-w-[700px] z-10 flex flex-col items-start gap-2.5 sm:gap-3.5">
                {/* Eyebrow */}
                <span className="text-[10px] text-gray-400 font-semibold tracking-[0.15em] uppercase font-mono">
                  {slide.badge}
                </span>

                {/* Main Heading (weight 300 equivalent for display, tight tracking) */}
                <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-[52px] font-light tracking-tight leading-[1.05] text-white">
                  {slide.title}
                </h1>

                {/* Subtitle */}
                <p className="text-[11px] sm:text-xs md:text-sm text-gray-400 font-normal leading-relaxed max-w-[550px]">
                  {slide.subtitle}
                </p>

                {/* Shopify outline pill CTA */}
                <button className="button-outline-on-dark mt-2.5 text-xs tracking-wider uppercase font-medium">
                  {slide.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Dots */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                currentSlide === idx ? "bg-white scale-125" : "bg-white/30"
              }`}
            />
          ))}
        </div>

        {/* Arrows (Visible on hover) */}
        <button 
          onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-white/20 bg-black/40 hover:bg-white hover:text-black text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button 
          onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-white/20 bg-black/40 hover:bg-white hover:text-black text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
