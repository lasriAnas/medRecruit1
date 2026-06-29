import { z } from "zod";

export const patientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  dob: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().optional(),
});

export type PatientFormValues = z.infer<typeof patientSchema>;
