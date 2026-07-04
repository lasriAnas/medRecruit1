import { z } from "zod";

export const medicationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  unit: z.string().min(1, "Unit is required"),
  stock: z.string().regex(/^\d+$/, "Stock must be a whole number"),
  reorderThreshold: z.string().regex(/^[1-9]\d*$/, "Reorder threshold must be at least 1"),
});

export type MedicationFormValues = z.infer<typeof medicationSchema>;
