"use client";

import Navbar from "@/components/Navbar";
import HeroSlider from "@/components/HeroSlider";
import ExamGroups from "@/components/ExamGroups";
import AiAssistantWidget from "@/components/AiAssistantWidget";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white font-sans pb-20">
      <Navbar />
      <HeroSlider />

      {/* Featured Products (Envatx Style) */}
      <section className="max-w-[1400px] mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Featured Products</h2>
          <Link href="/products" className="text-[#e00000] font-medium text-sm flex items-center gap-1 hover:underline">
            View All <span className="text-lg leading-none">›</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="bg-white border border-gray-100 rounded-sm hover:shadow-lg transition-shadow duration-300 flex flex-col group">
              {/* Product Image Area */}
              <div className="relative p-4 flex items-center justify-center h-[240px] bg-white border-b border-gray-50">
                <span className="absolute top-4 left-4 bg-[#e00000] text-white text-[11px] font-bold px-2 py-1 rounded-sm shadow-sm z-10">
                  -50%
                </span>
                {/* Placeholder for Product Cover */}
                <div className="w-full h-full bg-gray-50 flex items-center justify-center rounded-sm group-hover:scale-105 transition-transform duration-300">
                  <span className="text-5xl">📘</span>
                </div>
              </div>

              {/* Product Details Area */}
              <div className="p-4 flex flex-col flex-1">
                <h3 className="text-[13px] md:text-[15px] font-medium text-gray-800 leading-snug mb-3 line-clamp-2 min-h-[44px]">
                  Bihar Police ASI (Operation) Mains Paper-II One...
                </h3>
                
                <div className="mt-auto flex items-end gap-2 mb-4">
                  <span className="text-[13px] text-gray-400 line-through">₹400.00</span>
                  <span className="text-lg font-bold text-gray-900 leading-none">₹199.00</span>
                </div>

                <div className="w-full border-t border-gray-100 pt-3 text-center">
                  <button className="text-[#e00000] text-sm font-medium hover:text-[#cc0000] flex items-center justify-center gap-1 w-full">
                    View All <span className="text-lg leading-none">›</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories (Exam Groups) */}
      <ExamGroups />

      {/* Floating AI Assistant Widget */}
      <AiAssistantWidget />
    </main>
  );
}
