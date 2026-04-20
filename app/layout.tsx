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

export const metadata: Metadata = {
  title: "AbhyasCore — AI-Powered Mock Tests for JEE & NEET",
  description:
    "India's most premium AI-powered mock test platform for JEE and NEET aspirants. Exam-real simulations, AI analytics, rank prediction, and intelligent revision — all in one place.",
  keywords: ["JEE mock test", "NEET mock test", "AI exam prep", "JEE preparation", "NEET preparation", "rank prediction"],
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
