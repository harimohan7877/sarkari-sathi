"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-black text-gray-400 py-12 md:py-16 mt-20 border-t border-gray-900 font-sans">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Info Column */}
          <div className="flex flex-col gap-4">
            <span className="text-white text-lg font-bold font-mono tracking-wider">
              SARKARI<span className="font-light text-gray-400">SATHI</span>
            </span>
            <p className="text-xs text-gray-500 leading-relaxed max-w-xs font-devanagari">
              Rajasthan state government exams ki taiyari ke liye sabse premium aur 10x fast study resource provider.
            </p>
          </div>

          {/* Popular Exams Column */}
          <div className="flex flex-col gap-3 text-xs">
            <h4 className="text-white font-bold font-mono uppercase tracking-wider text-[11px] mb-1">Popular Exams</h4>
            <Link href="/exam/5478" className="hover:text-white transition-colors">RSMSSB Patwari</Link>
            <Link href="/exam/5130" className="hover:text-white transition-colors">Rajasthan Police SI</Link>
            <Link href="/exam/5325" className="hover:text-white transition-colors">RPSC RAS</Link>
            <Link href="/exam/5260" className="hover:text-white transition-colors">REET Exam</Link>
          </div>

          {/* Quick Links Column */}
          <div className="flex flex-col gap-3 text-xs">
            <h4 className="text-white font-bold font-mono uppercase tracking-wider text-[11px] mb-1">Quick Links</h4>
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="#" className="hover:text-white transition-colors">Discounted Products</Link>
            <Link href="#" className="hover:text-white transition-colors">About Us</Link>
            <Link href="#" className="hover:text-white transition-colors">Contact Support</Link>
          </div>

          {/* Contact Support Column */}
          <div className="flex flex-col gap-3 text-xs">
            <h4 className="text-white font-bold font-mono uppercase tracking-wider text-[11px] mb-1">Help & Support</h4>
            <p className="text-gray-500 font-devanagari">Immediate support ke liye WhatsApp ya email par contact karein:</p>
            <a href="https://wa.me/919950252138" className="text-green-400 hover:underline flex items-center gap-1.5 font-semibold">
              <span>💬 WhatsApp:</span> +91 9950252138
            </a>
            <span className="text-gray-500">📧 support@sarkarisathi.com</span>
          </div>
        </div>

        {/* Hairline Divider */}
        <div className="border-t border-gray-900 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 text-[10px] text-gray-600">
          <div>
            © 2026 SarkariSathi. All rights reserved.
          </div>
          <div className="max-w-xl text-left md:text-right font-devanagari">
            <span className="text-gray-500 font-semibold block mb-0.5">Disclaimer:</span>
            SarkariSathi ek swatantra private educational portal hai. Hamara RPSC, RSMSSB ya kisi bhi sarkari board se koi adhikaarik sambandh nahi hai.
          </div>
        </div>
      </div>
    </footer>
  );
}
