"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "@/lib/motion";
import {
  Compass, Edit3, MessageCircle,
  BarChart3, Waves,
  Menu, X, Bell, Shield,
  BookOpen, Lock, Users, PanelsTopLeft, Rss, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { LogoIcon } from "@/components/logo";
import { AccountActions } from "@/components/layout/account-actions";

interface NavItem {
  href: string;
  icon: React.ElementType;
  label: string;
  badge?: number;
}

const mainNavBase: NavItem[] = [
  { href: "/feed", icon: Rss, label: "Feed" },
  { href: "/explore", icon: Compass, label: "Explore" },
  { href: "/people", icon: Users, label: "People" },
  { href: "/write", icon: Edit3, label: "Write" },
  { href: "/messages", icon: MessageCircle, label: "Messages" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/notifications", icon: Bell, label: "Notifications" },
];

const featuresNav: NavItem[] = [
  { href: "/features", icon: PanelsTopLeft, label: "Feature Feed" },
  { href: "/bottles", icon: Waves, label: "Bottles" },
  { href: "/collections", icon: BookOpen, label: "Collections" },
  { href: "/journals", icon: Lock, label: "Journals" },
];

function NavLink({ item, collapsed, onClick }: { item: NavItem; collapsed: boolean; onClick?: () => void }) {
  const pathname = usePathname();
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-primary/15 text-primary-light shadow-sm"
          : "text-text-secondary hover:text-text-primary hover:bg-primary-ghost",
        collapsed && "justify-center px-2"
      )}
      title={collapsed ? item.label : undefined}
    >
      <span className="relative">
        <item.icon size={20} className={cn(isActive && "text-primary-light")} />
        {collapsed && item.badge != null && item.badge > 0 && (
          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-accent" />
        )}
      </span>
      {!collapsed && <span>{item.label}</span>}
      {!collapsed && item.badge != null && item.badge > 0 && (
        <span className="ml-auto text-xs bg-accent/20 text-accent-light px-2 py-0.5 rounded-full min-w-[1.5rem] text-center">
          {item.badge > 99 ? "99+" : item.badge}
        </span>
      )}
    </Link>
  );
}

export function Sidebar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unread, setUnread] = useState({ messages: 0, notifications: 0 });

  // Fetch unread totals from /api/me/unread-count, polling every 30s.
  useEffect(() => {
    if (!user) return;
    let active = true;
    let initialTimer: ReturnType<typeof setTimeout> | null = null;
    const fetchCounts = async () => {
      try {
        const data = await api.get<{ messages: number; notifications: number }>("/me/unread-count");
        if (active) setUnread(data);
      } catch {
        // ignore
      }
    };

    initialTimer = setTimeout(() => {
      void fetchCounts();
    }, 1500);

    const interval = setInterval(fetchCounts, 30_000);
    return () => {
      active = false;
      if (initialTimer) clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [user]);

  // Hide badges while user is already on that destination.
  const messagesBadge = pathname.startsWith("/messages") ? 0 : unread.messages;
  const notificationsBadge = pathname.startsWith("/notifications") ? 0 : unread.notifications;

  const mainNav: NavItem[] = mainNavBase.map((item) => {
    if (item.href === "/messages") return { ...item, badge: messagesBadge };
    if (item.href === "/notifications") return { ...item, badge: notificationsBadge };
    return item;
  });

  const closeMobile = () => setMobileOpen(false);

  const sidebarContent = (onNav?: () => void) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-border">
        <Link href="/feed" onClick={onNav} className="flex items-center gap-2">
          <LogoIcon size={32} className="flex-shrink-0" />
          {!collapsed && <span className="text-xl font-bold gradient-text">Lyrii</span>}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-primary-ghost transition-colors"
        >
          <Menu size={18} />
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="space-y-1">
          {mainNav.map((item) => (
            <NavLink key={item.href} item={item} collapsed={collapsed} onClick={onNav} />
          ))}
        </div>

        {!collapsed && (
          <div className="mt-6 mb-2 px-3">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Features</span>
          </div>
        )}
        {collapsed && <div className="my-3 border-t border-border" />}

        <div className="space-y-1">
          {featuresNav.map((item) => (
            <NavLink key={item.href} item={item} collapsed={collapsed} onClick={onNav} />
          ))}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-border p-3 space-y-1">
        {user?.isAdmin && (
          <NavLink
            item={{ href: "/admin", icon: Shield, label: "Admin" }}
            collapsed={collapsed}
            onClick={onNav}
          />
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-40 border-r border-border bg-bg-primary/80 backdrop-blur-xl transition-all duration-300",
          collapsed ? "w-[72px]" : "w-[260px]"
        )}
      >
        {sidebarContent()}
      </aside>

      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 glass-strong border-b border-border flex items-center justify-between px-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-primary-ghost transition-colors"
        >
          <Menu size={20} />
        </button>
        <Link href="/feed" className="flex items-center gap-2">
          <LogoIcon size={28} />
          <span className="text-lg font-bold gradient-text">Lyrii</span>
        </Link>
        <AccountActions compact />
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-[280px] border-r border-border bg-bg-primary"
            >
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-primary-ghost transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              {sidebarContent(closeMobile)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div className={cn("hidden lg:block flex-shrink-0 transition-all duration-300", collapsed ? "w-[72px]" : "w-[260px]")} />
    </>
  );
}
