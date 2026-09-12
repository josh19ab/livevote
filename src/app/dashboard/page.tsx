"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Old host URL — send hosts to /host */
export default function DashboardRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/host");
  }, [router]);
  return (
    <div className="flex min-h-screen items-center justify-center text-muted">
      Opening host dashboard…
    </div>
  );
}
