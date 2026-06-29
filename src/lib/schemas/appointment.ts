import { z } from "zod";

export const appointmentSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  doctorId: z.string().min(1, "Doctor is required"),
  scheduledAt: z.string().min(1, "Date and time is required"),
  notes: z.string().optional(),
});

export type AppointmentFormValues = z.infer<typeof appointmentSchema>;
