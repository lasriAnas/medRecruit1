"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { withRetry } from "@/lib/with-retry";
import { profileSchema, settingsPasswordSchema } from "@/lib/schemas/profile";

export async function updateProfile(formData: FormData) {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error("Not authenticated");

  const parsed = profileSchema.safeParse({
    name:  formData.get("name"),
    email: formData.get("email"),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");

  const { name, email } = parsed.data;

  if (email !== profile.email) {
    // Use service-role client so the change is immediate (no confirmation email)
    const { error } = await supabaseAdmin.auth.admin.updateUserById(profile.id, { email });
    if (error) throw new Error(error.message);
  }

  await withRetry(() =>
    prisma.profile.update({ where: { id: profile.id }, data: { name, email } }),
  );

  revalidatePath("/dashboard", "layout");
}

export async function updatePassword(formData: FormData) {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error("Not authenticated");

  const parsed = settingsPasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword:     formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");

  const { currentPassword, newPassword } = parsed.data;

  // Verify the current password by attempting a sign-in
  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email:    profile.email,
    password: currentPassword,
  });
  if (signInError) throw new Error("Current password is incorrect");

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
}
