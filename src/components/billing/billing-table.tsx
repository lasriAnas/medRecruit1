"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PatientDetailDialog } from "@/components/patients/patient-detail-dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InvoiceStatusSelect } from "@/components/billing/invoice-status-select";
import { toCsv, downloadCsv } from "@/lib/csv";
import type { InvoiceStatus } from "@/generated/prisma/enums";

export type InvoiceRow = {
  id: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  scheduledAt: string;
  amount: number;
  status: InvoiceStatus;
  createdAt: string;
};

const ALL_STATUSES = "ALL";

export function BillingTable({ data }: { data: InvoiceRow[] }) {
  const [status, setStatus] = useState(ALL_STATUSES);
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = useMemo(() => {
    return data
      .filter((row) => status === ALL_STATUSES || row.status === status)
      .sort((a, b) =>
        sortAsc
          ? a.createdAt.localeCompare(b.createdAt)
          : b.createdAt.localeCompare(a.createdAt),
      );
  }, [data, status, sortAsc]);

  function handleExport() {
    const rows = filtered.map((invoice) => ({
      Patient: invoice.patientName,
      Doctor: `Dr. ${invoice.doctorName}`,
      "Appointment date": new Date(invoice.scheduledAt).toLocaleString(),
      "Amount (MAD)": invoice.amount,
      "Created at": new Date(invoice.createdAt).toLocaleString(),
      Status: invoice.status,
    }));
    downloadCsv(
      "invoices.csv",
      toCsv(rows, [
        "Patient",
        "Doctor",
        "Appointment date",
        "Amount (MAD)",
        "Created at",
        "Status",
      ]),
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">Status</label>
          <Select
            items={{ [ALL_STATUSES]: "All statuses", UNPAID: "UNPAID", PAID: "PAID", CANCELLED: "CANCELLED" }}
            value={status}
            onValueChange={(value) => setStatus(value ?? ALL_STATUSES)}
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_STATUSES}>All statuses</SelectItem>
              <SelectItem value="UNPAID">UNPAID</SelectItem>
              <SelectItem value="PAID">PAID</SelectItem>
              <SelectItem value="CANCELLED">CANCELLED</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {status !== ALL_STATUSES && (
          <button
            type="button"
            className="text-sm text-muted-foreground underline"
            onClick={() => setStatus(ALL_STATUSES)}
          >
            Clear filters
          </button>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="ml-auto"
          onClick={handleExport}
        >
          Export CSV
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Appointment date</TableHead>
              <TableHead>Amount (MAD)</TableHead>
              <TableHead>
                <button
                  type="button"
                  className="flex items-center gap-1"
                  onClick={() => setSortAsc((v) => !v)}
                >
                  Created at {sortAsc ? "↑" : "↓"}
                </button>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Receipt</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No invoices match these filters.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>
                    <PatientDetailDialog patientId={invoice.patientId} className="underline">
                      {invoice.patientName}
                    </PatientDetailDialog>
                  </TableCell>
                  <TableCell>Dr. {invoice.doctorName}</TableCell>
                  <TableCell>{new Date(invoice.scheduledAt).toLocaleString()}</TableCell>
                  <TableCell>{invoice.amount}</TableCell>
                  <TableCell>{new Date(invoice.createdAt).toLocaleString()}</TableCell>
                  <TableCell>
                    <InvoiceStatusSelect invoiceId={invoice.id} status={invoice.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {invoice.status === "PAID" && (
                      <Button
                        size="sm"
                        variant="outline"
                        nativeButton={false}
                        render={
                          <Link
                            href={`/dashboard/billing/${invoice.id}/receipt`}
                            target="_blank"
                          />
                        }
                      >
                        View
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
