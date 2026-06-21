import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sarkari Saathi | Premium Rajasthan Study Materials",
  description: "Rajasthan government exam preparation — notes, MCQs, and mock tests with immediate email delivery.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hi">
      <body className="min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
