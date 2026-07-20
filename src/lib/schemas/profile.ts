import { z } from "zod";

export const profileSchema = z.object({
  name:  z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
});

export const settingsPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword:     z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ProfileFormValues         = z.infer<typeof profileSchema>;
export type SettingsPasswordFormValues = z.infer<typeof settingsPasswordSchema>;
