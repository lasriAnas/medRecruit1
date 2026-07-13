"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConversationsList } from "./conversations-list";
import { ChatThread } from "./chat-thread";

interface MessagesLayoutProps {
  currentProfileId: string;
  initialActiveId:  string | null;
  initialActiveName: string;
}

export function MessagesLayout({
  currentProfileId,
  initialActiveId,
  initialActiveName,
}: MessagesLayoutProps) {
  const router = useRouter();
  const [activeId,   setActiveId]   = useState<string | null>(initialActiveId);
  const [activeName, setActiveName] = useState(initialActiveName);

  const handleSelect = (id: string, name: string) => {
    setActiveId(id);
    setActiveName(name);
    router.push(`/dashboard/messages?with=${id}`, { scroll: false });
  };

  return (
    <div className="flex h-[calc(100vh-10rem)] border rounded-lg overflow-hidden">
      {/* Sidebar */}
      <div className="w-72 border-r flex flex-col shrink-0">
        <ConversationsList
          onSelect={handleSelect}
          activeId={activeId}
        />
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeId ? (
          <>
            <div className="px-5 py-3 border-b font-medium text-sm shrink-0">
              {activeName}
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatThread
                currentProfileId={currentProfileId}
                otherId={activeId}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 text-muted-foreground p-8">
            <p className="text-sm">Select a conversation or start a new one</p>
          </div>
        )}
      </div>
    </div>
  );
}
