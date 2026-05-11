import { Metadata } from "next";
import { generateSeoMetadata } from "@/lib/seo-utils";

export const metadata: Metadata = generateSeoMetadata({
  title: "Admin Portal",
  description: "AbhyasCore administrative control panel.",
  url: "/admin",
  noIndex: true, // STRICTLY DO NOT INDEX
});

export default function AdminMetadataLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
