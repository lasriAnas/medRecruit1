"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X, ChevronLeft } from "lucide-react";
import { getUnreadCount } from "@/app/dashboard/messages/actions";
import { ConversationsList } from "./conversations-list";
import { ChatThread } from "./chat-thread";

interface ChatWidgetProps {
  currentProfileId: string;
}

export function ChatWidget({ currentProfileId }: ChatWidgetProps) {
  const pathname          = usePathname();
  const [open, setOpen]   = useState(false);
  const [activeId,   setActiveId]   = useState<string | null>(null);
  const [activeName, setActiveName] = useState("");
  const [unread, setUnread]         = useState(0);

  useEffect(() => {
    const poll = async () => setUnread(await getUnreadCount());
    poll();
    const id = setInterval(poll, 5000);
    return () => clearInterval(id);
  }, []);

  // Hide widget on the dedicated messages page
  if (pathname === "/dashboard/messages") return null;

  const handleSelect = (id: string, name: string) => {
    setActiveId(id);
    setActiveName(name);
  };

  const handleBack = () => {
    setActiveId(null);
    setActiveName("");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 print:hidden">
      {open && (
        <div className="w-80 h-[500px] bg-background border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground shrink-0">
            <div className="flex items-center gap-2">
              {activeId && (
                <button
                  onClick={handleBack}
                  className="opacity-80 hover:opacity-100 transition-opacity"
                  aria-label="Back"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              )}
              <span className="font-semibold text-sm truncate">
                {activeId ? activeName : "Messages"}
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="opacity-80 hover:opacity-100 transition-opacity"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-hidden">
            {activeId ? (
              <ChatThread
                currentProfileId={currentProfileId}
                otherId={activeId}
                compact
              />
            ) : (
              <ConversationsList onSelect={handleSelect} />
            )}
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle messages"
        className="w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity relative"
      >
        {open ? (
          <X className="h-5 w-5" />
        ) : (
          <MessageCircle className="h-5 w-5" />
        )}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
    </div>
  );
}
