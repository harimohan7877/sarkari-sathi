"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-black text-gray-400 py-12 md:py-16 mt-12 border-t border-gray-900 font-sans">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Info */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1 flex flex-col gap-4">
            <span className="text-white text-lg font-bold font-mono tracking-wider">
              SARKARI<span className="font-light text-gray-400">SATHI</span>
            </span>
            <p className="text-xs text-gray-500 leading-relaxed max-w-xs font-devanagari">
              Rajasthan state government exams ki taiyari ke liye premium study material — notes, MCQs, aur mock tests.
            </p>
            <div className="flex gap-3 mt-1">
              <a href="https://wa.me/919950252138" className="text-gray-500 hover:text-green-400 transition-colors" target="_blank" rel="noopener noreferrer">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.837-2.231-.261-.98-.524-.955-.724-.955-.173-.015-.388-.007-.573-.007-.198 0-.497.074-.698.372-.2.298-.998 1.016-.998 2.478 0 1.462 1.065 2.872 1.214 3.071.149.198 2.093 3.417 5.346 4.297 3.253.88 3.28.645 3.84.537 1.44-.276 2.134-1.013 2.414-1.553.28-.54.28-1.002.173-1.118-.097-.116-.36-.188-.657-.337z" fill="currentColor"/></svg>
              </a>
              <a href="mailto:support@sarkarisathi.com" className="text-gray-500 hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </a>
            </div>
          </div>

          {/* Popular Exams */}
          <div className="flex flex-col gap-2.5 text-xs">
            <h4 className="text-white font-bold font-mono uppercase tracking-wider text-[11px] mb-1">Popular Exams</h4>
            <Link href="/exam/5478" className="hover:text-white transition-colors">RSMSSB Patwari</Link>
            <Link href="/exam/5130" className="hover:text-white transition-colors">Rajasthan Police SI</Link>
            <Link href="/exam/5325" className="hover:text-white transition-colors">RPSC RAS</Link>
            <Link href="/exam/5260" className="hover:text-white transition-colors">REET Exam</Link>
            <Link href="/exam/5127" className="hover:text-white transition-colors">Police Constable</Link>
          </div>

          {/* Groups / Categories */}
          <div className="flex flex-col gap-2.5 text-xs">
            <h4 className="text-white font-bold font-mono uppercase tracking-wider text-[11px] mb-1">Categories</h4>
            <Link href="/category/rsmssb" className="hover:text-white transition-colors">RSMSSB Exams</Link>
            <Link href="/category/rpsc" className="hover:text-white transition-colors">RPSC Exams</Link>
            <Link href="/category/rajasthan-police" className="hover:text-white transition-colors">Police Exams</Link>
            <Link href="/category/rajasthan-teaching" className="hover:text-white transition-colors">Teaching Exams</Link>
            <Link href="/category/rajasthan-high-court" className="hover:text-white transition-colors">High Court Exams</Link>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-2.5 text-xs">
            <h4 className="text-white font-bold font-mono uppercase tracking-wider text-[11px] mb-1">Quick Links</h4>
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/exams" className="hover:text-white transition-colors">All Exams</Link>
            <Link href="/auth" className="hover:text-white transition-colors">Student Login</Link>
            <Link href="#" className="hover:text-white transition-colors">About Us</Link>
            <Link href="#" className="hover:text-white transition-colors">Contact Support</Link>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-2.5 text-xs">
            <h4 className="text-white font-bold font-mono uppercase tracking-wider text-[11px] mb-1">Help & Support</h4>
            <p className="text-gray-500 font-devanagari leading-relaxed">Immediate support ke liye WhatsApp ya email par contact karein:</p>
            <a href="https://wa.me/919950252138" className="text-green-400 hover:underline flex items-center gap-1.5 font-semibold" target="_blank" rel="noopener noreferrer">
              <span>💬 WhatsApp:</span> +91 9950252138
            </a>
            <span className="text-gray-500">📧 support@sarkarisathi.com</span>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-900 pt-6 flex flex-col md:flex-row md:items-center justify-between gap-4 text-[10px] text-gray-600">
          <div>
            © 2026 SarkariSathi. All rights reserved.
          </div>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-gray-400 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-gray-400 transition-colors">Terms of Use</Link>
            <Link href="#" className="hover:text-gray-400 transition-colors">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
