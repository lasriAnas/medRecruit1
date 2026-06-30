import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/generated/prisma/enums";

export async function getCurrentProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const profile = await prisma.profile.findUnique({ where: { id: user.id } });
  if (!profile || !profile.active) return null;

  return profile;
}

/**
 * Throws if there's no logged-in user or their role isn't in `allowed`.
 * Use at the top of any server action that performs a privileged mutation —
 * UI-level hiding (nav items, buttons) is not sufficient on its own since
 * server actions can be invoked directly.
 */
export async function requireRole(allowed: Role[]) {
  const profile = await getCurrentProfile();
  if (!profile || !allowed.includes(profile.role)) {
    throw new Error("You don't have permission to perform this action.");
  }
  return profile;
}
