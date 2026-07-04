import { z } from "zod";

export const prescriptionItemSchema = z.object({
  medicationName: z.string().min(1, "Medication name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  duration: z.string().min(1, "Duration is required"),
  notes: z.string().optional(),
});

export type PrescriptionItemFormValues = z.infer<typeof prescriptionItemSchema>;
