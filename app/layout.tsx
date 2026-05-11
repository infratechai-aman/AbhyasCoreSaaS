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
  maximumScale: 1,
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
        <AuthProvider>
          {children}
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
