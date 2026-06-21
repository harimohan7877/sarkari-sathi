"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product } from "@/components/ProductCard";

function getPurchasedItems(): Product[] {
  if (typeof window === "undefined") return [];
  const raw = sessionStorage.getItem("purchased_items");
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export default function DownloadPage() {
  const [items] = useState<Product[]>(getPurchasedItems);

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#fbfbf5] flex items-center justify-center p-6">
        <div className="bg-white border border-gray-100 rounded-sm p-10 text-center max-w-md shadow-sm">
          <p className="text-5xl mb-4">📦</p>
          <h1 className="text-lg font-bold text-gray-900 font-mono uppercase tracking-wide mb-2">No purchases yet</h1>
          <p className="text-sm text-gray-500 mb-6">Complete a purchase to access your study materials here.</p>
          <Link href="/" className="button-primary-pill text-sm px-6 py-2.5">Browse Materials</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fbfbf5]">
      <div className="max-w-[800px] mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <p className="text-5xl mb-3">🎉</p>
          <h1 className="text-xl font-bold text-gray-900 font-mono uppercase tracking-wide">Payment Successful!</h1>
          <p className="text-sm text-gray-500 mt-1">Your study materials are ready to download</p>
        </div>

        {/* Items */}
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white border border-gray-100 rounded-sm p-5 shadow-sm flex items-center gap-5">
              {/* Mini book */}
              <div className="w-14 h-20 bg-gradient-to-r from-gray-900 to-black rounded-r-xs flex items-center justify-center p-1.5 shrink-0 shadow-sm border-l-2 border-black/20">
                <span className="text-[7px] text-white font-extrabold text-center leading-tight line-clamp-3 uppercase">
                  {item.examName}
                </span>
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-gray-900 font-mono uppercase tracking-wide">{item.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{item.language} {item.pages ? `• ${item.pages} Pages` : ''}</p>
              </div>
              {/* Download button */}
              <a
                href={item.drive_url || '#'}
                target={item.drive_url ? '_blank' : '_self'}
                rel="noopener noreferrer"
                className={`shrink-0 text-xs font-bold px-5 py-2.5 rounded-sm transition-all flex items-center gap-2 ${
                  item.drive_url
                    ? 'bg-black text-white hover:bg-gray-800 shadow-sm'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {item.drive_url ? '📥 Download' : 'Coming Soon'}
              </a>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-sm p-4 text-center">
          <p className="text-xs text-amber-800 font-medium">
            📧 Google Drive link se material download karein. Agar koi issue ho to WhatsApp pe contact karein.
          </p>
        </div>

        <div className="text-center mt-8">
          <Link href="/" className="text-xs text-gray-500 hover:text-black font-mono uppercase tracking-wider transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
