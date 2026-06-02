"use client";

import { AccountActions } from "@/components/layout/account-actions";

export function AppHeader() {
  return (
    <header className="hidden lg:block mb-4">
      <div className="rounded-xl border border-border/70 bg-bg-card/70 px-3 py-2 backdrop-blur-md">
        <div className="flex items-center justify-end">
          <AccountActions />
        </div>
      </div>
    </header>
  );
}
