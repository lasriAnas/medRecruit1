"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BarChart2,
  Users,
  Calendar,
  CreditCard,
  Pill,
  MessageSquare,
  UserCog,
  ScrollText,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  "/dashboard/reports":      BarChart2,
  "/dashboard/patients":     Users,
  "/dashboard/appointments": Calendar,
  "/dashboard/billing":      CreditCard,
  "/dashboard/pharmacy":     Pill,
  "/dashboard/messages":     MessageSquare,
  "/dashboard/users":        UserCog,
  "/dashboard/audit-log":    ScrollText,
};

type NavItem = { href: string; label: string };

export function DashboardNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = ICONS[item.href];
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/60",
            )}
          >
            {active && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r-full bg-emerald-400" />
            )}
            {Icon && (
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  active ? "text-emerald-400" : "text-sidebar-foreground/40",
                )}
              />
            )}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
