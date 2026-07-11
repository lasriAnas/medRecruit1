"use client";

import { useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { updateAppointmentStatus } from "@/app/dashboard/appointments/actions";
import type { AppointmentStatus } from "@/generated/prisma/enums";

const STATUSES: AppointmentStatus[] = ["SCHEDULED", "COMPLETED", "CANCELLED"];

export function AppointmentStatusSelect({
  appointmentId,
  status,
}: {
  appointmentId: string;
  status: AppointmentStatus;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      items={{ SCHEDULED: "SCHEDULED", COMPLETED: "COMPLETED", CANCELLED: "CANCELLED" }}
      value={status}
      disabled={isPending}
      onValueChange={(value) =>
        startTransition(async () => {
          if (!value) return;
          try {
            await updateAppointmentStatus(appointmentId, value as AppointmentStatus);
            toast.success(`Appointment marked as ${value.toLowerCase()}`);
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to update status");
          }
        })
      }
    >
      <SelectTrigger className="w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
