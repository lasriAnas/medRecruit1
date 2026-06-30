"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { appointmentSchema } from "@/lib/schemas/appointment";
import { withRetry } from "@/lib/with-retry";
import { requireRole } from "@/lib/auth";
import type { AppointmentStatus } from "@/generated/prisma/enums";

export async function createAppointment(formData: FormData) {
  await requireRole(["ADMIN", "RECEPTIONIST"]);

  const parsed = appointmentSchema.safeParse({
    patientId: formData.get("patientId"),
    doctorId: formData.get("doctorId"),
    scheduledAt: formData.get("scheduledAt"),
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid appointment data");
  }

  const appointment = await withRetry(() =>
    prisma.appointment.create({
      data: {
        ...parsed.data,
        scheduledAt: new Date(parsed.data.scheduledAt),
      },
    }),
  );

  revalidatePath("/dashboard/appointments");
  return appointment;
}

export async function updateAppointmentStatus(id: string, status: AppointmentStatus) {
  await requireRole(["ADMIN", "DOCTOR", "RECEPTIONIST"]);

  await withRetry(() => prisma.appointment.update({ where: { id }, data: { status } }));
  revalidatePath("/dashboard/appointments");
}
