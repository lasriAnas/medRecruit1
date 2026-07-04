"use client";

import { useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateInvoiceStatus } from "@/app/dashboard/billing/actions";
import type { InvoiceStatus } from "@/generated/prisma/enums";

const STATUSES: InvoiceStatus[] = ["UNPAID", "PAID", "CANCELLED"];

export function InvoiceStatusSelect({
  invoiceId,
  status,
  appointmentCompleted,
}: {
  invoiceId: string;
  status: InvoiceStatus;
  appointmentCompleted: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      items={{ UNPAID: "UNPAID", PAID: "PAID", CANCELLED: "CANCELLED" }}
      value={status}
      disabled={isPending}
      onValueChange={(value) =>
        startTransition(() => updateInvoiceStatus(invoiceId, value as InvoiceStatus))
      }
    >
      <SelectTrigger className="w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((s) => (
          <SelectItem key={s} value={s} disabled={s === "PAID" && !appointmentCompleted}>
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
