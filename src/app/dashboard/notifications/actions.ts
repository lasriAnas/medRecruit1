"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { withRetry } from "@/lib/with-retry";
import { getCurrentProfile } from "@/lib/auth";

export async function getNotifications() {
  const profile = await getCurrentProfile();
  if (!profile) return [];

  return withRetry(() =>
    prisma.notification.findMany({
      where: { profileId: profile.id },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  );
}

export async function markAllNotificationsRead() {
  const profile = await getCurrentProfile();
  if (!profile) return;

  await withRetry(() =>
    prisma.notification.updateMany({
      where: { profileId: profile.id, read: false },
      data: { read: true },
    }),
  );
  revalidatePath("/dashboard");
}

export async function createNotification({
  profileId,
  type,
  body,
  link,
}: {
  profileId: string;
  type: string;
  body: string;
  link?: string;
}) {
  await withRetry(() =>
    prisma.notification.create({
      data: { profileId, type, body, link: link ?? null },
    }),
  );
}
