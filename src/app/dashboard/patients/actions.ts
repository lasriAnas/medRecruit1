"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { patientSchema } from "@/lib/schemas/patient";
import { withRetry } from "@/lib/with-retry";

export async function createPatient(formData: FormData) {
  const parsed = patientSchema.safeParse({
    name: formData.get("name"),
    dob: formData.get("dob"),
    gender: formData.get("gender"),
    phone: formData.get("phone"),
    address: formData.get("address") || undefined,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid patient data");
  }

  const patient = await withRetry(() =>
    prisma.patient.create({
      data: {
        ...parsed.data,
        dob: new Date(parsed.data.dob),
      },
    }),
  );

  revalidatePath("/dashboard/patients");
  return patient;
}

export async function getPatientDetail(id: string) {
  const patient = await withRetry(() =>
    prisma.patient.findUnique({
      where: { id },
      include: {
        appointments: {
          orderBy: { scheduledAt: "desc" },
          include: { doctor: true },
        },
      },
    }),
  );

  if (!patient) return null;

  return {
    id: patient.id,
    name: patient.name,
    dob: patient.dob.toISOString().slice(0, 10),
    gender: patient.gender,
    phone: patient.phone,
    address: patient.address,
    appointments: patient.appointments.map((appt) => ({
      id: appt.id,
      doctorName: appt.doctor.name,
      scheduledAt: appt.scheduledAt.toISOString(),
      status: appt.status,
    })),
  };
}

export async function deletePatient(id: string) {
  await withRetry(() => prisma.patient.delete({ where: { id } }));
  revalidatePath("/dashboard/patients");
  revalidatePath("/dashboard/appointments");
}
