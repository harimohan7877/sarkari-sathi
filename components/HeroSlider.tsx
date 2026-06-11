"use client";

import { useState, useEffect } from "react";

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      title: "Toughest Exams in India",
      subtitle: "Crack UPSC, SSC, Banking & more with our AI Guided Study Material",
      bgFrom: "from-[hsl(348,83%,40%)]",
      bgTo: "to-[hsl(348,83%,25%)]",
      image: "🎯", // Placeholder for actual image
    },
    {
      id: 2,
      title: "Rajasthan CET 2026",
      subtitle: "Complete PDF Notes + Mock Tests (Hindi & English)",
      bgFrom: "from-[hsl(222,47%,30%)]",
      bgTo: "to-[hsl(222,47%,15%)]",
      image: "📚",
    },
    {
      id: 3,
      title: "Flash Sale: 50% OFF",
      subtitle: "On all Previous Year Paper PDFs. Use code: SATHI50",
      bgFrom: "from-[hsl(142,70%,35%)]",
      bgTo: "to-[hsl(142,70%,20%)]",
      image: "⚡",
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative w-full max-w-7xl mx-auto overflow-hidden bg-white mt-4 md:mt-6 rounded-2xl shadow-sm">
      <div 
        className="flex transition-transform duration-700 ease-in-out h-[200px] sm:h-[300px] md:h-[400px]"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide) => (
          <div 
            key={slide.id} 
            className={`w-full h-full flex-shrink-0 bg-gradient-to-r ${slide.bgFrom} ${slide.bgTo} flex items-center justify-between px-8 md:px-20 text-white relative overflow-hidden`}
          >
            {/* Background Decorations */}
            <div className="absolute top-10 left-10 text-white/20 text-4xl">✦</div>
            <div className="absolute bottom-10 right-1/2 text-white/20 text-5xl">✧</div>

            <div className="z-10 max-w-xl">
              <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold tracking-wider mb-4 border border-white/30 font-noto uppercase">
                Featured
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold mb-3 font-outfit leading-tight">
                {slide.title}
              </h2>
              <p className="text-sm md:text-lg text-white/90 font-noto mb-6 max-w-md">
                {slide.subtitle}
              </p>
              <button className="bg-white text-[hsl(222,47%,12%)] font-bold px-6 py-3 rounded-full hover:shadow-lg hover:scale-105 transition-all font-noto">
                Explore Now
              </button>
            </div>
            
            <div className="hidden md:flex text-9xl z-10 animate-pulse">
              {slide.image}
            </div>
          </div>
        ))}
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-2 rounded-full transition-all ${
              currentSlide === idx ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>

      {/* Arrows */}
      <button 
        onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors z-20"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button 
        onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors z-20"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
