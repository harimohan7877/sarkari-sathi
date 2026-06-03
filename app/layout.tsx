import type { Metadata } from "next";
import { Outfit, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  variable: "--font-noto",
  subsets: ["devanagari"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sarkari Saathi | राजस्थान सरकारी नौकरी गाइड",
  description: "Rajasthan ke government job seekers ke liye AI-powered Hindi form filling guide",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="hi"
      className={`${outfit.variable} ${notoSansDevanagari.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-[hsl(210,40%,98%)] text-[hsl(222,47%,12%)]">
        {children}
      </body>
    </html>
  );
}
