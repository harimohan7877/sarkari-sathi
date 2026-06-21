"use client";

import React from "react";

export interface Product {
  id: string;
  title: string;
  examName: string;
  groupName: string;
  type: "Notes" | "MCQ" | "Mock Test";
  price: number;
  salePrice: number;
  pages?: number;
  language: "Hindi" | "English" | "Bilingual";
}

interface ProductCardProps {
  product: Product;
  onBuyNow: (product: Product) => void;
}

export default function ProductCard({ product, onBuyNow }: ProductCardProps) {
  const discount = Math.round(((product.price - product.salePrice) / product.price) * 100);

  // Elegant color gradients for the stylized book covers based on product type
  const coverGradients = {
    Notes: "from-[#0f172a] via-[#1e293b] to-[#0f172a]", // Slate/Navy
    MCQ: "from-[#14532d] via-[#166534] to-[#14532d]",   // Forest/Green
    "Mock Test": "from-[#701a75] via-[#86198f] to-[#701a75]", // Purple/Grape
  };

  const badgeColors = {
    Notes: "bg-blue-600 text-white",
    MCQ: "bg-emerald-600 text-white",
    "Mock Test": "bg-fuchsia-600 text-white",
  };

  return (
    <div className="bg-white border border-gray-100 rounded-sm hover:shadow-lg transition-shadow duration-300 flex flex-col group overflow-hidden">
      {/* Visual Cover Area */}
      <div className="relative p-4 flex items-center justify-center h-[260px] bg-gray-50/50 border-b border-gray-100">
        {/* Discount Badge */}
        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-[#e00000] text-white text-[11px] font-bold px-2 py-0.5 rounded-sm shadow-sm z-10">
            -{discount}%
          </span>
        )}

        {/* Product Type Badge */}
        <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider z-10 ${badgeColors[product.type]}`}>
          {product.type}
        </span>

        {/* Premium CSS-based Book Cover */}
        <div className={`w-[140px] h-[200px] rounded-r-md shadow-md bg-gradient-to-r ${coverGradients[product.type]} p-3 flex flex-col justify-between border-l-4 border-black/30 group-hover:scale-105 transition-transform duration-300`}>
          {/* Cover Header */}
          <div className="flex flex-col gap-1">
            <span className="text-[8px] text-white/60 tracking-widest uppercase font-mono">{product.language} Edition</span>
            <div className="h-0.5 w-6 bg-amber-400 rounded-full"></div>
          </div>

          {/* Cover Title */}
          <div className="my-auto flex flex-col gap-1.5 text-center">
            <span className="text-white text-xs font-bold font-noto leading-snug line-clamp-3">
              {product.examName}
            </span>
            <span className="text-amber-400 text-[10px] font-bold uppercase tracking-wider font-mono">
              {product.type === "Notes" ? "Notes Book" : product.type === "MCQ" ? "Question Bank" : "Practice Set"}
            </span>
          </div>

          {/* Cover Footer */}
          <div className="flex items-center justify-between border-t border-white/10 pt-1.5 mt-auto">
            <span className="text-[8px] text-white/50">{product.pages ? `${product.pages} Pages` : "PDF format"}</span>
            <span className="text-[10px]">⭐ 4.9</span>
          </div>
        </div>
      </div>

      {/* Details Area */}
      <div className="p-4 flex flex-col flex-1">
        {/* Exam Tag */}
        <span className="text-[11px] text-[#e00000] font-bold uppercase tracking-wider mb-1 block">
          {product.examName}
        </span>

        {/* Title */}
        <h3 className="text-[13px] md:text-sm font-semibold text-gray-800 leading-snug mb-3 line-clamp-2 min-h-[40px]">
          {product.title}
        </h3>

        {/* Specs Row */}
        <div className="flex items-center gap-2 mb-3 text-[11px] text-gray-500 font-medium">
          <span className="bg-gray-100 px-2 py-0.5 rounded-sm">{product.language}</span>
          {product.pages && <span className="bg-gray-100 px-2 py-0.5 rounded-sm">{product.pages} Pages</span>}
          <span className="bg-gray-100 px-2 py-0.5 rounded-sm">Immediate Email Delivery</span>
        </div>

        {/* Pricing Row */}
        <div className="mt-auto flex items-end justify-between border-t border-gray-50 pt-3">
          <div className="flex items-end gap-1.5">
            <span className="text-xs text-gray-400 line-through mb-0.5">₹{product.price.toFixed(2)}</span>
            <span className="text-lg font-extrabold text-gray-900 leading-none">₹{product.salePrice.toFixed(2)}</span>
          </div>
          
          <button
            onClick={() => onBuyNow(product)}
            className="text-[12px] bg-[#e00000] hover:bg-[#cc0000] text-white px-3 py-1.5 rounded-sm font-semibold tracking-wide transition-colors"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
