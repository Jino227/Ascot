"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import InfrastructurePage from "@/app/infrastructure/page";

export default function AboutRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/infrastructure");
  }, [router]);

  return <InfrastructurePage />;
}
