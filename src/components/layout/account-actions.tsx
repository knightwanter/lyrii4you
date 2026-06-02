"use client";

import Link from "next/link";
import { LogOut, Settings } from "lucide-react";
import { Button, Avatar } from "@/components/ui";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

interface AccountActionsProps {
  compact?: boolean;
  className?: string;
}

export function AccountActions({ compact = false, className }: AccountActionsProps) {
  const { user, logout } = useAuth();

  if (!user) return null;

  if (compact) {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        <Link
          href={`/profile/${user.id}`}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-text-secondary transition-colors hover:bg-primary-ghost hover:text-text-primary"
          title="Profile"
        >
          <Avatar name={user.username} src={user.profilePic} size="sm" className="h-8 w-8 ring-0" />
        </Link>
        <Link href="/settings" title="Settings">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Settings size={18} />
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-text-secondary hover:text-danger hover:bg-danger/10"
          onClick={logout}
          title="Log out"
        >
          <LogOut size={18} />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <Link href={`/profile/${user.id}`}>
        <Button variant="secondary" size="sm" className="h-9 pl-2.5 pr-3.5">
          <Avatar name={user.username} src={user.profilePic} size="sm" className="ring-0" />
          Profile
        </Button>
      </Link>
      <Link href="/settings">
        <Button variant="secondary" size="sm" className="h-9 px-3.5">
          <Settings size={16} />
          Settings
        </Button>
      </Link>
      <Button variant="ghost" size="sm" className="h-9 px-3 text-text-secondary hover:text-danger hover:bg-danger/10" onClick={logout}>
        <LogOut size={16} />
        Log out
      </Button>
    </div>
  );
}
