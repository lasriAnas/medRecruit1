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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppointmentStatusSelect } from "@/components/appointments/appointment-status-select";
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-muted-foreground">Doctor</label>
          <Select
            items={{
              [ALL_DOCTORS]: "All doctors",
              ...Object.fromEntries(doctors.map((d) => [d.id, `Dr. ${d.name}`])),
            }}
            value={doctorId}
            onValueChange={(value) => setDoctorId(value ?? ALL_DOCTORS)}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_DOCTORS}>All doctors</SelectItem>
              {doctors.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  Dr. {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
