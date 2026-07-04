"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { invoiceSchema } from "@/lib/schemas/invoice";
import { withRetry } from "@/lib/with-retry";
import { requireRole } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import type { InvoiceStatus } from "@/generated/prisma/enums";

export async function createInvoice(formData: FormData) {
  await requireRole(["ADMIN", "RECEPTIONIST"]);

  const parsed = invoiceSchema.safeParse({
    appointmentId: formData.get("appointmentId"),
    amount: formData.get("amount"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid invoice data");
  }

  const invoice = await withRetry(() =>
    prisma.invoice.create({
      data: {
        appointmentId: parsed.data.appointmentId,
        amount: Number(parsed.data.amount),
      },
    }),
  );

  revalidatePath("/dashboard/billing");
  return invoice;
}

export async function updateInvoiceStatus(id: string, status: InvoiceStatus) {
  const actor = await requireRole(["ADMIN", "RECEPTIONIST"]);

  if (status === "PAID") {
    const invoice = await withRetry(() =>
      prisma.invoice.findUnique({
        where: { id },
        include: { appointment: { select: { status: true } } },
      }),
    );
    if (!invoice) throw new Error("Invoice not found");
    if (invoice.appointment.status !== "COMPLETED") {
      throw new Error("Cannot mark as paid until the appointment is completed.");
    }
  }

  await withRetry(() =>
    prisma.invoice.update({
      where: { id },
      data: { status, paidAt: status === "PAID" ? new Date() : null },
    }),
  );
  await logAudit({
    actor,
    action: "INVOICE_STATUS_CHANGED",
    targetType: "Invoice",
    targetId: id,
    details: `Status changed to ${status}`,
  });
  revalidatePath("/dashboard/billing");
}
