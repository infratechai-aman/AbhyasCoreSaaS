"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ResultsIndexPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/institute/exams");
  }, [router]);
  return null;
}
