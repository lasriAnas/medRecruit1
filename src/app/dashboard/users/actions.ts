"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { accountSchema } from "@/lib/schemas/account";
import { withRetry } from "@/lib/with-retry";
import { requireRole } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/audit";
import type { Role } from "@/generated/prisma/enums";

export async function createUserAccount(formData: FormData) {
  const actor = await requireRole(["ADMIN"]);

  const parsed = accountSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid account data");
  }

  const { name, email, role } = parsed.data;

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: name,
    email_confirm: true,
  });

  if (error || !data.user) {
    throw new Error(error?.message ?? "Failed to create account");
  }

  try {
    const profile = await withRetry(() =>
      prisma.profile.create({
        data: { id: data.user.id, email, name, role, mustChangePassword: true },
      }),
    );
    await logAudit({
      actor,
      action: "ACCOUNT_CREATED",
      targetType: "Profile",
      targetId: profile.id,
      details: `Created ${role} account for ${email}`,
    });
    revalidatePath("/dashboard/users");
    return profile;
  } catch (err) {
    await supabaseAdmin.auth.admin.deleteUser(data.user.id);
    throw err;
  }
}

export async function updateUserRole(profileId: string, role: Role) {
  const actor = await requireRole(["ADMIN"]);

  if (actor.id === profileId) {
    throw new Error("You can't change your own role.");
  }

  const target = await withRetry(() =>
    prisma.profile.update({ where: { id: profileId }, data: { role } }),
  );
  await logAudit({
    actor,
    action: "ROLE_CHANGED",
    targetType: "Profile",
    targetId: profileId,
    details: `Changed ${target.email}'s role to ${role}`,
  });
  revalidatePath("/dashboard/users");
}

export async function setUserActive(profileId: string, active: boolean) {
  const actor = await requireRole(["ADMIN"]);

  if (actor.id === profileId) {
    throw new Error("You can't deactivate your own account.");
  }

  const target = await withRetry(() =>
    prisma.profile.update({ where: { id: profileId }, data: { active } }),
  );
  await supabaseAdmin.auth.admin.updateUserById(profileId, {
    ban_duration: active ? "none" : "876000h",
  });
  await logAudit({
    actor,
    action: active ? "ACCOUNT_REACTIVATED" : "ACCOUNT_DEACTIVATED",
    targetType: "Profile",
    targetId: profileId,
    details: `${active ? "Reactivated" : "Deactivated"} ${target.email}`,
  });

  revalidatePath("/dashboard/users");
}
