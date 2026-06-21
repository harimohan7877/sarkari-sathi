"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="w-full bg-white font-sans border-b border-gray-100 sticky top-0 z-50">
      {/* Top Banner Message */}
      <div className="bg-black text-white text-[11px] font-medium py-2 px-4 text-center tracking-wider uppercase">
        ⚡ Rajasthan Exams study resources immediate email delivery
      </div>

      {/* Main Header Bar */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-3.5 flex items-center justify-between gap-6">
        {/* Brand Logo - Shopify Minimalist Style */}
        <Link href="/" className="shrink-0 flex items-center">
          <span className="text-xl md:text-2xl font-bold tracking-tight text-black uppercase font-mono">
            Sarkari<span className="font-light text-gray-500">Sathi</span>
          </span>
        </Link>

        {/* Minimalist Search Bar */}
        <form
          action="/"
          method="GET"
          className="hidden md:flex flex-1 max-w-xl"
          onSubmit={(e) => {
            if (!searchQuery.trim()) e.preventDefault();
          }}
        >
          <div className="relative w-full">
            <input
              name="q"
              type="text"
              placeholder="Search for exam materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-gray-50/50 hover:bg-gray-50 focus:bg-white text-xs text-gray-800 outline-none border border-gray-200 rounded-full transition-all focus:border-black"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-gray-400 absolute left-3.5 top-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </form>

        {/* Navigation & Cart/Login Action */}
        <div className="flex items-center gap-4 md:gap-6 shrink-0">
          {/* Cart Icon */}
          <button className="flex items-center gap-2 group relative p-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5.5 w-5.5 text-gray-800 hover:text-black transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] bg-black text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white">
              0
            </span>
          </button>

          {/* Shopify-Style Pill Login Button */}
          <Link href="/auth">
            <button className="button-primary-pill px-5 py-2 text-xs md:text-sm tracking-wide">
              Log in
            </button>
          </Link>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden px-4 pb-3">
        <form action="/" method="GET">
          <div className="relative w-full">
            <input
              name="q"
              type="text"
              placeholder="Search for exam materials..."
              className="w-full h-9 pl-9 pr-4 bg-gray-50 text-xs text-gray-800 outline-none border border-gray-200 rounded-full focus:bg-white focus:border-black transition-all"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5 text-gray-400 absolute left-3 top-2.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </form>
      </div>
    </header>
  );
}
