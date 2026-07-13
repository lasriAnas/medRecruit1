"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { medicationSchema } from "@/lib/schemas/medication";
import { prescriptionItemSchema } from "@/lib/schemas/prescription";
import { withRetry } from "@/lib/with-retry";
import { requireRole } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { restockSchema } from "@/lib/schemas/restock";

export async function createMedication(formData: FormData) {
  await requireRole(["ADMIN"]);

  const parsed = medicationSchema.safeParse({
    name: formData.get("name"),
    unit: formData.get("unit"),
    stock: formData.get("stock"),
    reorderThreshold: formData.get("reorderThreshold"),
    category: formData.get("category") ?? "MEDICATION",
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid medication data");
  }

  const medication = await withRetry(() =>
    prisma.medication.create({
      data: {
        ...parsed.data,
        stock: Number(parsed.data.stock),
        reorderThreshold: Number(parsed.data.reorderThreshold),
        category: parsed.data.category,
      },
    }),
  );

  revalidatePath("/dashboard/pharmacy");
  return medication;
}

export async function deleteMedication(id: string) {
  await requireRole(["ADMIN"]);
  await withRetry(() => prisma.medication.delete({ where: { id } }));
  revalidatePath("/dashboard/pharmacy");
}

export async function useStock(formData: FormData) {
  const actor = await requireRole(["ADMIN", "RECEPTIONIST"]);

  const parsed = restockSchema.safeParse({
    medicationId: formData.get("medicationId"),
    quantity: formData.get("quantity"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid data");
  }

  const { medicationId, quantity } = parsed.data;

  const med = await withRetry(() =>
    prisma.$transaction(async (tx) => {
      const medication = await tx.medication.findUniqueOrThrow({ where: { id: medicationId } });
      if (medication.stock < quantity) {
        throw new Error(`Only ${medication.stock} ${medication.unit}(s) in stock`);
      }
      await tx.medication.update({
        where: { id: medicationId },
        data: { stock: { decrement: quantity } },
      });
      await tx.stockMovement.create({
        data: { medicationId, delta: -quantity, reason: "USAGE" },
      });
      return medication;
    }),
  );

  await logAudit({
    actor,
    action: "MEDICATION_USED",
    targetType: "Medication",
    targetId: medicationId,
    details: `-${quantity} ${med.unit} of ${med.name} (was: ${med.stock})`,
  });

  revalidatePath("/dashboard/pharmacy");
}

export async function restockMedication(formData: FormData) {
  const actor = await requireRole(["ADMIN", "RECEPTIONIST"]);

  const parsed = restockSchema.safeParse({
    medicationId: formData.get("medicationId"),
    quantity: formData.get("quantity"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid restock data");
  }

  const { medicationId, quantity } = parsed.data;

  const med = await withRetry(() =>
    prisma.$transaction(async (tx) => {
      const medication = await tx.medication.update({
        where: { id: medicationId },
        data: { stock: { increment: quantity } },
        select: { name: true, unit: true, stock: true },
      });
      await tx.stockMovement.create({
        data: { medicationId, delta: quantity, reason: "RESTOCK" },
      });
      return medication;
    }),
  );

  await logAudit({
    actor,
    action: "MEDICATION_RESTOCKED",
    targetType: "Medication",
    targetId: medicationId,
    details: `+${quantity} ${med.unit} of ${med.name} (new stock: ${med.stock})`,
  });

  revalidatePath("/dashboard/pharmacy");
}

// Returns existing prescription for appointment, or creates a new one
export async function getOrCreatePrescription(appointmentId: string) {
  await requireRole(["ADMIN", "DOCTOR"]);

  return withRetry(() =>
    prisma.prescription.upsert({
      where: { appointmentId },
      create: { appointmentId },
      update: {},
      include: { items: { orderBy: { createdAt: "asc" } } },
    }),
  );
}

export async function addPrescriptionItem(prescriptionId: string, formData: FormData) {
  await requireRole(["ADMIN", "DOCTOR"]);

  const parsed = prescriptionItemSchema.safeParse({
    medicationName: formData.get("medicationName"),
    dosage: formData.get("dosage"),
    duration: formData.get("duration"),
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid item data");
  }

  await withRetry(() =>
    prisma.prescriptionItem.create({
      data: { prescriptionId, ...parsed.data },
    }),
  );

  revalidatePath("/dashboard/patients");
}

export async function removePrescriptionItem(itemId: string) {
  await requireRole(["ADMIN", "DOCTOR"]);
  await withRetry(() => prisma.prescriptionItem.delete({ where: { id: itemId } }));
  revalidatePath("/dashboard/patients");
}

export async function deletePrescription(id: string) {
  await requireRole(["ADMIN", "DOCTOR"]);
  await withRetry(() => prisma.prescription.delete({ where: { id } }));
  revalidatePath("/dashboard/patients");
}
