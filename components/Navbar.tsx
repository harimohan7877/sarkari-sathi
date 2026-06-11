"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-[hsl(214,32%,91%)]">
      {/* Top Bar (Contact & Language - similar to Envatx) */}
      <div className="bg-[hsl(210,40%,98%)] px-4 py-1.5 flex justify-between items-center text-xs text-[hsl(215,16%,40%)] border-b border-[hsl(214,32%,91%)]">
        <div className="flex items-center gap-2">
          <span>📞 +91 99999-00000</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="hover:text-[hsl(222,47%,12%)]">English ▾</button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="px-4 lg:px-10 py-3 flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-[hsl(24,100%,50%)] to-[hsl(348,83%,47%)] rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md">
            S
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[hsl(222,47%,12%)] leading-none font-outfit tracking-tight">
              Sarkari<span className="text-[hsl(348,83%,47%)]">Sathi</span>
            </h1>
            <p className="text-[9px] text-[hsl(215,16%,55%)] leading-tight tracking-wider uppercase font-semibold">
              Govt Exams Portal
            </p>
          </div>
        </Link>

        {/* Search Bar (Hidden on very small mobile, visible on tablet/desktop) */}
        <div className="hidden md:flex flex-1 max-w-2xl mx-8 relative">
          <input
            type="text"
            placeholder="Search for exams, mock tests, pdfs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-4 pr-12 border-2 border-[hsl(214,32%,91%)] rounded-xl bg-[hsl(210,40%,98%)] focus:bg-white focus:border-[hsl(348,83%,47%)] outline-none transition-all font-noto"
          />
          <button className="absolute right-1 top-1 bottom-1 w-10 bg-[hsl(348,83%,47%)] hover:bg-[hsl(348,83%,40%)] text-white rounded-lg flex items-center justify-center transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-3 shrink-0">
          <button className="w-10 h-10 rounded-full border border-[hsl(214,32%,91%)] flex items-center justify-center text-[hsl(222,47%,12%)] hover:bg-[hsl(210,40%,98%)] transition-colors relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[hsl(348,83%,47%)] text-white text-[10px] font-bold rounded-full flex items-center justify-center">0</span>
          </button>
          
          <Link href="/auth">
            <button className="w-10 h-10 rounded-full border border-[hsl(214,32%,91%)] flex items-center justify-center text-[hsl(222,47%,12%)] hover:bg-[hsl(210,40%,98%)] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          </Link>

          <button className="flex items-center gap-2 border border-[hsl(214,32%,91%)] px-3 py-2 rounded-xl hover:bg-[hsl(210,40%,98%)] transition-colors">
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[hsl(222,47%,12%)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="absolute -top-2 -right-2 w-4 h-4 bg-[hsl(348,83%,47%)] text-white text-[10px] font-bold rounded-full flex items-center justify-center">0</span>
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-[10px] text-[hsl(215,16%,55%)] leading-none">My cart</p>
              <p className="text-xs font-bold text-[hsl(222,47%,12%)] leading-none mt-0.5">₹0.00 ▾</p>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Search Bar (Visible only on small screens) */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for exams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-4 pr-12 border-2 border-[hsl(214,32%,91%)] rounded-xl bg-[hsl(210,40%,98%)] focus:bg-white focus:border-[hsl(348,83%,47%)] outline-none transition-all text-sm font-noto"
          />
          <button className="absolute right-1 top-1 bottom-1 w-10 bg-[hsl(348,83%,47%)] text-white rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Red Navigation Bar (Like Envatx) */}
      <div className="bg-[hsl(348,83%,47%)] text-white text-sm font-medium hidden md:block">
        <div className="max-w-7xl mx-auto px-4 lg:px-10 flex items-center">
          <button className="bg-[hsl(210,40%,98%)] text-[hsl(222,47%,12%)] px-6 py-3 font-bold flex items-center gap-2 hover:bg-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[hsl(348,83%,47%)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Categories ▾
          </button>
          <nav className="flex items-center gap-6 ml-8">
            <Link href="/" className="hover:text-white/80 transition-colors">Home</Link>
            <Link href="#" className="hover:text-white/80 transition-colors">Discounted Products</Link>
            <Link href="#" className="hover:text-white/80 transition-colors">Publication House</Link>
            <Link href="#" className="hover:text-white/80 transition-colors">All Vendors</Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
