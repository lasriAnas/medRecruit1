import { z } from "zod";

export const appointmentSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  doctorId: z.string().min(1, "Doctor is required"),
  scheduledAt: z
    .string()
    .min(1, "Date and time is required")
    .refine((value) => new Date(value) >= new Date(), {
      message: "Date and time cannot be in the past",
    }),
  notes: z.string().optional(),
});

export type AppointmentFormValues = z.infer<typeof appointmentSchema>;
