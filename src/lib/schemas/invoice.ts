import { z } from "zod";

export const invoiceSchema = z.object({
  appointmentId: z.string().min(1, "Appointment is required"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .regex(/^[1-9]\d*$/, "Amount must be a positive whole number of MAD"),
});

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;
