"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { patientSchema } from "@/lib/schemas/patient";

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

  const patient = await prisma.patient.create({
    data: {
      ...parsed.data,
      dob: new Date(parsed.data.dob),
    },
  });

  revalidatePath("/dashboard/patients");
  redirect(`/dashboard/patients/${patient.id}`);
}
