import { z } from "zod";

export const restockSchema = z.object({
  medicationId: z.string().min(1, "Medication is required"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
});

export type RestockFormValues = z.infer<typeof restockSchema>;
