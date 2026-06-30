import { z } from "zod";

export const accountSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  role: z.enum(["ADMIN", "DOCTOR", "RECEPTIONIST"]),
});

export type AccountFormValues = z.infer<typeof accountSchema>;
