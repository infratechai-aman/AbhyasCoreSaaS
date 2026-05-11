import { Metadata } from "next";
import { generateSeoMetadata } from "@/lib/seo-utils";

export const metadata: Metadata = generateSeoMetadata({
  title: "Student Dashboard",
  description: "Your personalized JEE and NEET preparation hub. Track your rank, view analytics, and take tests.",
  url: "/dashboard",
  noIndex: true, // STRICTLY DO NOT INDEX INTERNAL DASHBOARD
});

export default function DashboardMetadataLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
