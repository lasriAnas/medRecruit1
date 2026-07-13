"use client";

import { useEffect, useState } from "react";
import { fetchConversations, getAllProfiles } from "@/app/dashboard/messages/actions";
import { Button } from "@/components/ui/button";
import { PenSquare, X } from "lucide-react";
import type { Role } from "@/generated/prisma/enums";

type Conversation = {
  other: { id: string; name: string };
  lastMessage: { body: string; createdAt: Date; fromMe: boolean };
  unreadCount: number;
};

type StaffProfile = { id: string; name: string; role: Role };

interface ConversationsListProps {
  onSelect: (id: string, name: string) => void;
  activeId?: string | null;
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function relativeTime(date: Date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)  return "now";
  if (mins < 60) return `${mins}m`;
  if (hours < 24) return `${hours}h`;
  return `${days}d`;
}

export function ConversationsList({ onSelect, activeId }: ConversationsListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [profiles,      setProfiles]      = useState<StaffProfile[]>([]);
  const [picking,       setPicking]       = useState(false);

  const load = async () => {
    const data = await fetchConversations();
    setConversations(data as Conversation[]);
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, []);

  const handleNewMessage = async () => {
    if (profiles.length === 0) {
      const all = await getAllProfiles();
      setProfiles(all as StaffProfile[]);
    }
    setPicking(true);
  };

  if (picking) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-3 py-2 border-b shrink-0">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            New message
          </span>
          <button
            onClick={() => setPicking(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {profiles.map((p) => (
            <button
              key={p.id}
              onClick={() => { setPicking(false); onSelect(p.id, p.name); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/60 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                {initials(p.name)}
              </div>
              <div>
                <p className="text-sm font-medium leading-none">{p.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{p.role}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b shrink-0">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Conversations
        </span>
        <button
          onClick={handleNewMessage}
          className="text-muted-foreground hover:text-foreground transition-colors"
          title="New message"
        >
          <PenSquare className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 && (
          <div className="flex flex-col items-center gap-3 pt-10 px-4 text-center">
            <p className="text-sm text-muted-foreground">No messages yet</p>
            <Button variant="outline" size="sm" onClick={handleNewMessage}>
              Start a conversation
            </Button>
          </div>
        )}
        {conversations.map(({ other, lastMessage, unreadCount }) => (
          <button
            key={other.id}
            onClick={() => onSelect(other.id, other.name)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/60 transition-colors text-left border-l-2 ${
              activeId === other.id ? "border-primary bg-muted/40" : "border-transparent"
            }`}
          >
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-semibold">
                {initials(other.name)}
              </div>
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className={`text-sm leading-none truncate ${unreadCount > 0 ? "font-semibold" : "font-medium"}`}>
                  {other.name}
                </p>
                <span className="text-[10px] text-muted-foreground shrink-0 ml-1">
                  {relativeTime(lastMessage.createdAt)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {lastMessage.fromMe ? "You: " : ""}{lastMessage.body}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
