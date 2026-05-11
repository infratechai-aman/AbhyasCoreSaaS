import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  // ACCESSIBILITY: Removed maximumScale=1 — blocking pinch-to-zoom violates WCAG 1.4.4
};

import { generateSeoMetadata } from "@/lib/seo-utils";

export const metadata: Metadata = generateSeoMetadata({
  title: "AI-Powered Mock Tests for JEE & NEET",
  description: "India's most premium AI-powered mock test platform for JEE and NEET aspirants. Exam-real simulations, AI analytics, rank prediction, and intelligent revision.",
  url: "/",
});

import Analytics from "@/components/seo/Analytics";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "AbhyasCore",
    url: "https://abhyascore.com",
    logo: "https://abhyascore.com/favicon_white.png",
    description: "India's most premium AI-powered mock test platform for JEE and NEET aspirants.",
    sameAs: [
      "https://twitter.com/abhyascore",
      "https://linkedin.com/company/abhyascore"
    ]
  };

  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0f172a" />
        <link rel="apple-touch-icon" href="/favicon_white.png" />
      </head>
      <body>
        {/* ACCESSIBILITY: Skip-to-content link for keyboard navigation */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg focus:text-sm focus:font-bold focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          Skip to main content
        </a>
        <AuthProvider>
          <main id="main-content">
            {children}
          </main>
        </AuthProvider>
        <Analytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
