"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { withRetry } from "@/lib/with-retry";
import { passwordSchema } from "@/lib/schemas/password";

export async function changePassword(formData: FormData) {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login");
  }

  const parsed = passwordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid password");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    throw new Error(error.message);
  }

  await withRetry(() =>
    prisma.profile.update({ where: { id: profile.id }, data: { mustChangePassword: false } }),
  );

  redirect("/dashboard");
}
