"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { withRetry } from "@/lib/with-retry";
import { getCurrentProfile } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isImageAttachment } from "@/lib/is-image-attachment";
import { createNotification } from "@/app/dashboard/notifications/actions";

export { isImageAttachment };

const BUCKET = "message-attachments";
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

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
    lastMessage: { body: string; attachmentName: string | null; createdAt: Date; fromMe: boolean };
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
      lastMessage: {
        body: msg.body,
        attachmentName: msg.attachmentName,
        createdAt: msg.createdAt,
        fromMe: msg.senderId === profile.id,
      },
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
      select: {
        id: true,
        body: true,
        senderId: true,
        createdAt: true,
        readAt: true,
        attachmentUrl: true,
        attachmentName: true,
      },
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

export async function uploadAttachment(formData: FormData) {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error("Not authenticated");

  const file = formData.get("file") as File | null;
  if (!file) throw new Error("No file provided");
  if (file.size > MAX_BYTES) throw new Error("File must be under 5 MB");

  // Create bucket if it doesn't exist yet
  await supabaseAdmin.storage
    .createBucket(BUCKET, { public: true })
    .catch(() => { /* already exists */ });

  const ext  = file.name.split(".").pop() ?? "bin";
  const path = `${profile.id}/${Date.now()}.${ext}`;

  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, await file.arrayBuffer(), { contentType: file.type });

  if (error) throw new Error(error.message);

  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);

  return { url: data.publicUrl, name: file.name };
}

export async function sendMessage(
  receiverId: string,
  body: string,
  attachmentUrl?: string,
  attachmentName?: string,
) {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error("Not authenticated");
  if (!body.trim() && !attachmentUrl) throw new Error("Message cannot be empty");
  if (receiverId === profile.id) throw new Error("Cannot message yourself");

  await withRetry(() =>
    prisma.message.create({
      data: {
        senderId: profile.id,
        receiverId,
        body: body.trim(),
        attachmentUrl:  attachmentUrl  ?? null,
        attachmentName: attachmentName ?? null,
      },
    }),
  );

  await createNotification({
    profileId: receiverId,
    type: "NEW_MESSAGE",
    body: `New message from ${profile.name}`,
    link: "/dashboard/messages",
  });

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
