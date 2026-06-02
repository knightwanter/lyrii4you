"use client";

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-bg-root">
      <div className="w-10 h-10 rounded-xl bg-primary/20 animate-pulse" />
    </div>
  );
}
