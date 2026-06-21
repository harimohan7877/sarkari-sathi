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

  // Clean, high-end solid slate/charcoal covers (Shopify transactional track style)
  const coverColors = {
    Notes: "from-[#111111] to-[#222222]",
    MCQ: "from-[#1c1d21] to-[#2e3037]",
    "Mock Test": "from-[#0d1518] to-[#1a262a]",
  };

  return (
    <div className="bg-white border border-gray-100 rounded-sm shadow-halo card-micro flex flex-col group overflow-hidden">
      {/* Visual Cover Area */}
      <div className="relative p-5 flex items-center justify-center h-[240px] bg-gray-50/30 border-b border-gray-50 overflow-hidden">
        {/* Discount Badge */}
        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-black text-white text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wider uppercase z-10">
            -{discount}%
          </span>
        )}

        {/* Cover — subtle hover scale */}
        <div className={`w-[130px] h-[180px] rounded-r-md shadow-md bg-gradient-to-r ${coverColors[product.type]} p-4 flex flex-col justify-between border-l-3 border-black/25 group-hover:scale-[1.08] group-hover:-translate-y-1 transition-all duration-400 ease-out`}>
          <span className="text-[7px] text-gray-400 tracking-[0.2em] uppercase font-mono">{product.language}</span>

          <div className="my-auto text-center">
            <span className="text-white text-xs font-semibold font-devanagari leading-snug line-clamp-3">
              {product.examName}
            </span>
          </div>

          <span className="text-[7px] text-gray-500 font-mono">2026 EDITION</span>
        </div>
      </div>

      {/* Details Area */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-sm font-bold text-gray-900 leading-snug mb-2 font-mono uppercase tracking-wide">
          {product.title}
        </h3>

        <div className="flex items-center gap-2 mb-4 text-[10px] text-gray-500 font-medium">
          <span className="bg-gray-100 px-2 py-0.5 rounded-full">{product.language}</span>
          {product.pages && <span className="bg-gray-100 px-2 py-0.5 rounded-full">{product.pages} Pages</span>}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-3">
          <div className="flex items-end gap-1.5">
            <span className="text-xs text-gray-400 line-through">₹{product.price.toFixed(2)}</span>
            <span className="text-sm font-extrabold text-black">₹{product.salePrice.toFixed(2)}</span>
          </div>
          
          <button
            onClick={() => onBuyNow(product)}
            className="button-primary-pill text-[11px] px-4 py-1.5 shadow-sm uppercase tracking-wider font-semibold active:scale-95 transition-transform duration-100"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
