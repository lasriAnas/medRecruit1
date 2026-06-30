"use server";

import { getCurrentProfile } from "@/lib/auth";

export async function getViewerRole() {
  const profile = await getCurrentProfile();
  return profile?.role ?? null;
}
