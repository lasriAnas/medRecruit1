"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AppointmentForm } from "@/components/appointments/appointment-form";
import { createAppointment } from "@/app/dashboard/appointments/actions";

type Option = { id: string; name: string };

export function AppointmentCreateDialog({
  patients,
  doctors,
}: {
  patients: Option[];
  doctors: Option[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>Schedule appointment</Button>} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule appointment</DialogTitle>
        </DialogHeader>
        <AppointmentForm
          action={createAppointment}
          patients={patients}
          doctors={doctors}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
