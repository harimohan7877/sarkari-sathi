"use client";

import Navbar from "@/components/Navbar";
import HeroSlider from "@/components/HeroSlider";
import ExamGroups from "@/components/ExamGroups";
import AiAssistantWidget from "@/components/AiAssistantWidget";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[hsl(210,40%,98%)] font-noto pb-20">
      <Navbar />
      <HeroSlider />
      <ExamGroups />

      {/* Featured Section (Placeholder for Products) */}
      <section className="max-w-7xl mx-auto px-4 lg:px-10 py-10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-extrabold text-[hsl(222,47%,12%)] font-outfit">Featured Study Material</h3>
          <Link href="/products" className="text-[hsl(348,83%,47%)] font-semibold text-sm hover:underline font-noto">
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="bg-white rounded-2xl border border-[hsl(214,32%,91%)] overflow-hidden hover:shadow-lg transition-all group">
              <div className="h-40 bg-[hsl(210,40%,96%)] flex items-center justify-center relative">
                <span className="text-4xl">📘</span>
                <div className="absolute top-2 left-2 bg-[hsl(348,83%,47%)] text-white text-[10px] font-bold px-2 py-1 rounded-md">
                  -50%
                </div>
              </div>
              <div className="p-4">
                <p className="text-[10px] text-[hsl(215,16%,55%)] font-bold uppercase tracking-wider mb-1">PDF eBook</p>
                <h4 className="font-bold text-[hsl(222,47%,12%)] leading-tight mb-2 group-hover:text-[hsl(348,83%,47%)] transition-colors">
                  Complete SSC CGL 2026 Previous Year Papers
                </h4>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-extrabold text-[hsl(222,47%,12%)]">₹99</span>
                  <span className="text-xs text-[hsl(215,16%,55%)] line-through">₹199</span>
                </div>
                <button className="w-full py-2 bg-white border border-[hsl(348,83%,47%)] text-[hsl(348,83%,47%)] font-bold rounded-xl hover:bg-[hsl(348,83%,97%)] transition-colors text-sm">
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Floating AI Assistant Widget */}
      <AiAssistantWidget />
    </main>
  );
}
