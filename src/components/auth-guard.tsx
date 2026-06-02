"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { LoadingScreen } from "@/components/loading-screen";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (pathname.startsWith("/admin") && !user?.isAdmin) {
      router.replace("/feed");
      return;
    }
  }, [isLoading, isAuthenticated, user, pathname, router]);

  // Show minimal spinner only when we have no cached user at all
  if (isLoading && !user) {
    return <LoadingScreen />;
  }

  // If we have a cached user, render immediately (background refresh will update if needed)
  if (!isLoading && !isAuthenticated) {
    return <LoadingScreen />;
  }

  if (pathname.startsWith("/admin") && !user?.isAdmin) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
