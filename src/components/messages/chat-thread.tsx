"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { fetchMessages, sendMessage, markAsRead } from "@/app/dashboard/messages/actions";
import { Button } from "@/components/ui/button";
import { SendHorizontal } from "lucide-react";

type Msg = {
  id: string;
  body: string;
  senderId: string;
  createdAt: Date;
  readAt: Date | null;
};

interface ChatThreadProps {
  currentProfileId: string;
  otherId: string;
  compact?: boolean;
}

export function ChatThread({ currentProfileId, otherId, compact }: ChatThreadProps) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput]       = useState("");
  const [isPending, start]      = useTransition();
  const bottomRef               = useRef<HTMLDivElement>(null);

  const load = async () => {
    const msgs = await fetchMessages(otherId);
    setMessages(msgs as Msg[]);
  };

  useEffect(() => {
    load();
    markAsRead(otherId);
    const id = setInterval(load, 3000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otherId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const body = input.trim();
    if (!body) return;
    setInput("");
    start(async () => {
      await sendMessage(otherId, body);
      await load();
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className={`flex-1 overflow-y-auto p-3 flex flex-col gap-2 ${compact ? "text-sm" : ""}`}>
        {messages.length === 0 && (
          <p className="text-muted-foreground text-center text-xs pt-8">
            No messages yet — say hello!
          </p>
        )}
        {messages.map((msg) => {
          const fromMe = msg.senderId === currentProfileId;
          return (
            <div key={msg.id} className={`flex ${fromMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm leading-snug ${
                  fromMe
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted rounded-bl-sm"
                }`}
              >
                <p>{msg.body}</p>
                <p className={`text-[10px] mt-0.5 opacity-60 ${fromMe ? "text-right" : ""}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="border-t p-2 flex gap-2 shrink-0">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type a message…"
          disabled={isPending}
          className="flex-1 text-sm bg-background border rounded-md px-3 py-1.5 outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        />
        <Button
          size="icon"
          className="shrink-0"
          onClick={handleSend}
          disabled={isPending || !input.trim()}
        >
          <SendHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
