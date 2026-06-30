import { prisma } from "@/lib/prisma";
import { withRetry } from "@/lib/with-retry";
import type { Profile } from "@/generated/prisma/client";

export async function logAudit({
  actor,
  action,
  targetType,
  targetId,
  details,
}: {
  actor: Profile;
  action: string;
  targetType: string;
  targetId?: string;
  details?: string;
}) {
  await withRetry(() =>
    prisma.auditLog.create({
      data: { actorId: actor.id, actorName: actor.name, action, targetType, targetId, details },
    }),
  );
}
