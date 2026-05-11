import { Metadata } from "next";
import { generateSeoMetadata } from "@/lib/seo-utils";

export const metadata: Metadata = generateSeoMetadata({
  title: "Login",
  description: "Sign in to AbhyasCore to access your AI-powered mock tests and personalized analytics.",
  url: "/login",
  noIndex: true, // We don't want Google passing pagerank to our auth wall
});

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
