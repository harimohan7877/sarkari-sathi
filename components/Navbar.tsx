"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="w-full bg-white font-sans border-b border-gray-200">
      {/* Top Thin Bar */}
      <div className="border-b border-gray-100 py-1.5 hidden md:block">
        <div className="max-w-[1400px] mx-auto px-4 flex justify-between items-center text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
            <span>+919334096338</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1 hover:text-gray-800">
              <Image src="https://flagcdn.com/w20/us.png" alt="English" width={20} height={15} className="w-4 h-3" />
              English ▾
            </button>
          </div>
        </div>
      </div>

      {/* Main Middle Bar */}
      <div className="max-w-[1400px] mx-auto px-4 py-4 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/" className="shrink-0 flex items-center">
          <span className="text-3xl font-extrabold text-[#111827] tracking-tight">Sarkari<span className="text-[#e00000]">Sathi</span></span>
        </Link>

        {/* Large Search Bar */}
        <form
          action="/"
          method="GET"
          className="hidden lg:flex flex-1 max-w-3xl"
          onSubmit={(e) => {
            if (!searchQuery.trim()) e.preventDefault();
          }}
        >
          <div className="flex w-full border-2 border-gray-100 rounded-l-md bg-gray-50 focus-within:bg-white focus-within:border-gray-200 transition-colors">
            <input
              name="q"
              type="text"
              placeholder="Search for items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 px-4 bg-transparent outline-none text-gray-700"
            />
          </div>
          <button type="submit" className="h-12 px-6 bg-[#e00000] hover:bg-[#cc0000] text-white rounded-r-md transition-colors flex items-center justify-center -ml-1 border-2 border-[#e00000]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>

        {/* Icons Right */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Wishlist */}
          <button className="w-10 h-10 rounded-full bg-red-50 text-[#e00000] flex items-center justify-center relative hover:bg-red-100 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="absolute -top-1 -right-1 w-[18px] h-[18px] bg-black text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">0</span>
          </button>
          
          {/* Profile */}
          <Link href="/auth">
            <button className="w-10 h-10 rounded-full bg-red-50 text-[#e00000] flex items-center justify-center hover:bg-red-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </button>
          </Link>

          {/* Cart */}
          <button className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 text-[#e00000] flex items-center justify-center relative hover:bg-red-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="absolute -top-1 -right-1 w-[18px] h-[18px] bg-black text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">0</span>
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-[11px] text-gray-500 leading-none mb-1">My cart</p>
              <p className="text-sm font-bold text-gray-900 leading-none">₹0.00 ▾</p>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Search */}
      <form action="/" method="GET" className="lg:hidden px-4 pb-4">
        <div className="flex w-full border-2 border-gray-100 rounded-md overflow-hidden">
          <input
            name="q"
            type="text"
            placeholder="Search for items..."
            className="flex-1 h-10 px-3 outline-none"
          />
          <button type="submit" className="w-12 bg-[#e00000] text-white flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </form>

      {/* Bottom Red Navigation Bar */}
      <div className="bg-[#e00000] text-white">
        <div className="max-w-[1400px] mx-auto px-4 flex items-center">
          {/* Category Dropdown Button */}
          <div className="relative group">
            <button className="h-12 bg-white text-[#e00000] px-8 font-bold flex items-center gap-3 w-64 border-b-2 border-transparent">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              Categories
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-auto" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center ml-6">
            <Link href="/" className="px-5 py-3 hover:bg-black/10 transition-colors font-medium">Home</Link>
            <Link href="#" className="px-5 py-3 hover:bg-black/10 transition-colors font-medium">Discounted Products</Link>
            <Link href="#" className="px-5 py-3 hover:bg-black/10 transition-colors font-medium">Publication House</Link>
            <Link href="#" className="px-5 py-3 hover:bg-black/10 transition-colors font-medium">All Vendors</Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
