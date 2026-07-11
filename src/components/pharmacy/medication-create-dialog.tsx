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
import { MedicationForm } from "@/components/pharmacy/medication-form";
import { createMedication } from "@/app/dashboard/pharmacy/actions";

export function MedicationCreateDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>Add item</Button>} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add item</DialogTitle>
        </DialogHeader>
        <MedicationForm action={createMedication} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
