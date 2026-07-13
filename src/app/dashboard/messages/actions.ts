"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { withRetry } from "@/lib/with-retry";
import { getCurrentProfile } from "@/lib/auth";

// ─── Reads ────────────────────────────────────────────────────────────────────

export async function fetchConversations() {
  const profile = await getCurrentProfile();
  if (!profile) return [];

  const messages = await withRetry(() =>
    prisma.message.findMany({
      where: { OR: [{ senderId: profile.id }, { receiverId: profile.id }] },
      orderBy: { createdAt: "desc" },
      include: {
        sender:   { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } },
      },
    }),
  );

  const seen = new Set<string>();
  const conversations: {
    other: { id: string; name: string };
    lastMessage: { body: string; createdAt: Date; fromMe: boolean };
    unreadCount: number;
  }[] = [];

  for (const msg of messages) {
    const other  = msg.senderId === profile.id ? msg.receiver : msg.sender;
    if (seen.has(other.id)) continue;
    seen.add(other.id);

    const unread = messages.filter(
      (m) => m.senderId === other.id && m.receiverId === profile.id && !m.readAt,
    ).length;

    conversations.push({
      other,
      lastMessage: { body: msg.body, createdAt: msg.createdAt, fromMe: msg.senderId === profile.id },
      unreadCount: unread,
    });
  }

  return conversations;
}

export async function fetchMessages(otherId: string) {
  const profile = await getCurrentProfile();
  if (!profile) return [];

  return withRetry(() =>
    prisma.message.findMany({
      where: {
        OR: [
          { senderId: profile.id, receiverId: otherId },
          { senderId: otherId,    receiverId: profile.id },
        ],
      },
      orderBy: { createdAt: "asc" },
      select: { id: true, body: true, senderId: true, createdAt: true, readAt: true },
    }),
  );
}

export async function getUnreadCount() {
  const profile = await getCurrentProfile();
  if (!profile) return 0;

  return withRetry(() =>
    prisma.message.count({ where: { receiverId: profile.id, readAt: null } }),
  );
}

export async function getAllProfiles() {
  const profile = await getCurrentProfile();
  if (!profile) return [];

  return withRetry(() =>
    prisma.profile.findMany({
      where: { id: { not: profile.id }, active: true },
      select: { id: true, name: true, role: true },
      orderBy: { name: "asc" },
    }),
  );
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function sendMessage(receiverId: string, body: string) {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error("Not authenticated");
  if (!body.trim()) throw new Error("Message cannot be empty");
  if (receiverId === profile.id) throw new Error("Cannot message yourself");

  await withRetry(() =>
    prisma.message.create({
      data: { senderId: profile.id, receiverId, body: body.trim() },
    }),
  );

  revalidatePath("/dashboard/messages");
}

export async function markAsRead(senderId: string) {
  const profile = await getCurrentProfile();
  if (!profile) return;

  await withRetry(() =>
    prisma.message.updateMany({
      where: { senderId, receiverId: profile.id, readAt: null },
      data: { readAt: new Date() },
    }),
  );

  revalidatePath("/dashboard/messages");
}
