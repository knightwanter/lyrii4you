"use client";

import { useEffect } from "react";
import { LazyMotion, domAnimation } from "framer-motion";
import { AuthContext, useAuthProvider } from "@/hooks/use-auth";
import { ConfirmProvider } from "@/components/ui";
import { ToastProvider } from "@/components/ui/toast";
import { MobileNotice } from "@/components/mobile-notice";

export function Providers({ children }: { children: React.ReactNode }) {
  const auth = useAuthProvider();

  // One-shot recovery for ChunkLoadError + "MIME type text/plain" failures.
  // These occur in production when route chunks 500 (auth state collapse,
  // HA failover, deploy races, standby node traffic). The browser refuses
  // to execute the error response. A single controlled reload recovers the app.
  useEffect(() => {
    const isChunkFailure = (msg: string, name?: string) =>
      name === "ChunkLoadError" ||
      /ChunkLoadError|Loading chunk|Failed to load chunk/i.test(msg);

    const handler = (event: ErrorEvent | PromiseRejectionEvent) => {
      const error =
        (event as ErrorEvent).error || (event as PromiseRejectionEvent).reason;
      const message = String(error?.message || error || "");
      const name = error?.name as string | undefined;

      if (isChunkFailure(message, name)) {
        // Prevent reload loops across multiple chunks
        if (!sessionStorage.getItem("lyrii_chunk_reload")) {
          sessionStorage.setItem("lyrii_chunk_reload", "1");
          // tiny delay so logs can flush
          setTimeout(() => {
            window.location.reload();
          }, 60);
        }
      }
    };

    window.addEventListener("error", handler as EventListener);
    window.addEventListener("unhandledrejection", handler as EventListener);

    const clearFlag = () => sessionStorage.removeItem("lyrii_chunk_reload");
    window.addEventListener("beforeunload", clearFlag);

    return () => {
      window.removeEventListener("error", handler as EventListener);
      window.removeEventListener("unhandledrejection", handler as EventListener);
      window.removeEventListener("beforeunload", clearFlag);
    };
  }, []);

  return (
    <AuthContext.Provider value={auth}>
      <LazyMotion features={domAnimation} strict={false}>
        <ToastProvider>
          <ConfirmProvider>{children}</ConfirmProvider>
          <MobileNotice />
        </ToastProvider>
      </LazyMotion>
    </AuthContext.Provider>
  );
}
