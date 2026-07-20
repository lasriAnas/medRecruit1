"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getNotifications, markAllNotificationsRead } from "@/app/dashboard/notifications/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { relativeTime } from "@/lib/relative-time";

type Notification = {
  id: string;
  type: string;
  body: string;
  link: string | null;
  read: boolean;
  createdAt: Date;
};

export function NotificationBell({ profileId }: { profileId: string }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isPending, startTransition] = useTransition();
  const supabase = useRef(createClient());

  async function load() {
    const data = await getNotifications();
    setNotifications(data as Notification[]);
  }

  useEffect(() => {
    load();

    const channel = supabase.current
      .channel(`notifications:${profileId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Notification",
          filter: `profileId=eq.${profileId}`,
        },
        () => load(),
      )
      .subscribe();

    return () => { supabase.current.removeChannel(channel); };
  }, [profileId]);

  function handleOpen(isOpen: boolean) {
    setOpen(isOpen);
    if (isOpen && unread > 0) {
      startTransition(async () => {
        await markAllNotificationsRead();
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      });
    }
  }

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <DropdownMenu open={open} onOpenChange={handleOpen}>
      <DropdownMenuTrigger
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="text-sm font-semibold">Notifications</span>
          {unread > 0 && (
            <span className="text-xs text-muted-foreground">{unread} unread</span>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">No notifications yet.</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`flex flex-col gap-0.5 border-b px-4 py-3 last:border-0 ${
                  !n.read ? "bg-muted/50" : ""
                }`}
              >
                <span className="text-sm leading-snug">{n.body}</span>
                <span className="text-xs text-muted-foreground">
                  {relativeTime(new Date(n.createdAt))}
                </span>
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
