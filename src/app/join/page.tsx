"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Audience join lives on the home page */
export default function JoinRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/");
  }, [router]);
  return null;
}
