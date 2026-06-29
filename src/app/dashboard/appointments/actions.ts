"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { appointmentSchema } from "@/lib/schemas/appointment";
import type { AppointmentStatus } from "@/generated/prisma/enums";

export async function createAppointment(formData: FormData) {
  const parsed = appointmentSchema.safeParse({
    patientId: formData.get("patientId"),
    doctorId: formData.get("doctorId"),
    scheduledAt: formData.get("scheduledAt"),
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid appointment data");
  }

  await prisma.appointment.create({
    data: {
      ...parsed.data,
      scheduledAt: new Date(parsed.data.scheduledAt),
    },
  });

  revalidatePath("/dashboard/appointments");
  redirect("/dashboard/appointments");
}

export async function updateAppointmentStatus(id: string, status: AppointmentStatus) {
  await prisma.appointment.update({ where: { id }, data: { status } });
  revalidatePath("/dashboard/appointments");
}
