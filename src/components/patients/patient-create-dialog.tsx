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
import { PatientForm } from "@/components/patients/patient-form";
import { createPatient } from "@/app/dashboard/patients/actions";

export function PatientCreateDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>Register patient</Button>} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Register patient</DialogTitle>
        </DialogHeader>
        <PatientForm action={createPatient} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
