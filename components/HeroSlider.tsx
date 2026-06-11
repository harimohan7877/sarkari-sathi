"use client";

import { useState, useEffect } from "react";

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      image: "https://via.placeholder.com/1400x450/e00000/ffffff?text=Toughest+Exams+in+India", // Placeholder matching exact Envatx hero size
    },
    {
      id: 2,
      image: "https://via.placeholder.com/1400x450/111827/ffffff?text=UPSC+%26+State+PSC+Exams",
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="w-full bg-white relative group">
      {/* Container - matching Envatx max-width layout */}
      <div className="max-w-[1400px] mx-auto relative overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-in-out h-[200px] sm:h-[300px] md:h-[400px] lg:h-[450px]"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide) => (
            <div 
              key={slide.id} 
              className="w-full h-full flex-shrink-0 relative"
            >
              <img 
                src={slide.image} 
                alt="Banner" 
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* Navigation Dots - Envatx style (small blue/white circles) */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                currentSlide === idx ? "bg-blue-600 scale-125" : "bg-blue-400 opacity-60"
              }`}
            />
          ))}
        </div>

        {/* Left Arrow (Visible on hover) */}
        <button 
          onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#e00000] text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        {/* Right Arrow (Visible on hover) */}
        <button 
          onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#e00000] text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
