"use client";

import { useMemo, useState } from "react";
import { PatientDetailDialog } from "@/components/patients/patient-detail-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OptionCombobox } from "@/components/option-combobox";
import { AppointmentStatusSelect } from "@/components/appointments/appointment-status-select";
import { toCsv, downloadCsv } from "@/lib/csv";
import type { AppointmentStatus } from "@/generated/prisma/enums";

export type AppointmentRow = {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  scheduledAt: string;
  status: AppointmentStatus;
};

const ALL_DOCTORS = "ALL";

export function AppointmentsTable({
  data,
  doctors,
}: {
  data: AppointmentRow[];
  doctors: { id: string; name: string }[];
}) {
  const [doctorId, setDoctorId] = useState(ALL_DOCTORS);
  const [date, setDate] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  const doctorOptions = [{ id: ALL_DOCTORS, name: "All doctors" }, ...doctors.map((d) => ({ id: d.id, name: `Dr. ${d.name}` }))];

  const filtered = useMemo(() => {
    return data
      .filter((row) => doctorId === ALL_DOCTORS || row.doctorId === doctorId)
      .filter((row) => !date || row.scheduledAt.slice(0, 10) === date)
      .sort((a, b) =>
        sortAsc
          ? a.scheduledAt.localeCompare(b.scheduledAt)
          : b.scheduledAt.localeCompare(a.scheduledAt),
      );
  }, [data, doctorId, date, sortAsc]);

  function handleExport() {
    const rows = filtered.map((appt) => ({
      Patient: appt.patientName,
      Doctor: `Dr. ${appt.doctorName}`,
      "Scheduled at": new Date(appt.scheduledAt).toLocaleString(),
      Status: appt.status,
    }));
    downloadCsv(
      "appointments.csv",
      toCsv(rows, ["Patient", "Doctor", "Scheduled at", "Status"]),
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">Doctor</label>
          <OptionCombobox
            options={doctorOptions}
            value={doctorId}
            onChange={(value) => setDoctorId(value || ALL_DOCTORS)}
            placeholder="Search for a doctor..."
            className="w-48"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">Date</label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-44"
          />
        </div>
        {(doctorId !== ALL_DOCTORS || date) && (
          <button
            type="button"
            className="text-sm text-muted-foreground underline"
            onClick={() => {
              setDoctorId(ALL_DOCTORS);
              setDate("");
            }}
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
              <TableHead>
                <button
                  type="button"
                  className="flex items-center gap-1"
                  onClick={() => setSortAsc((v) => !v)}
                >
                  Scheduled at {sortAsc ? "↑" : "↓"}
                </button>
              </TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No appointments match these filters.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((appt) => (
                <TableRow key={appt.id}>
                  <TableCell>
                    <PatientDetailDialog patientId={appt.patientId} className="underline">
                      {appt.patientName}
                    </PatientDetailDialog>
                  </TableCell>
                  <TableCell>Dr. {appt.doctorName}</TableCell>
                  <TableCell>{new Date(appt.scheduledAt).toLocaleString()}</TableCell>
                  <TableCell>
                    <AppointmentStatusSelect appointmentId={appt.id} status={appt.status} />
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
