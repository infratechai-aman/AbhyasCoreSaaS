import { Metadata } from "next";
import { generateSeoMetadata } from "@/lib/seo-utils";

export const metadata: Metadata = generateSeoMetadata({
  title: "Create Account",
  description: "Join AbhyasCore today. Get access to premium JEE and NEET mock tests with AI-driven analytics.",
  url: "/register",
  noIndex: true,
});

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
