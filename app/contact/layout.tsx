import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | AbhyasCore",
  description: "Get in touch with the AbhyasCore team.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
