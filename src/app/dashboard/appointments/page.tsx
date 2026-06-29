import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AppointmentStatusSelect } from "@/components/appointments/appointment-status-select";

export default async function AppointmentsPage() {
  const appointments = await prisma.appointment.findMany({
    orderBy: { scheduledAt: "asc" },
    include: { patient: true, doctor: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Appointments</h1>
        <Button render={<Link href="/dashboard/appointments/new" />}>
          Schedule appointment
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Scheduled at</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No appointments scheduled.
                </TableCell>
              </TableRow>
            ) : (
              appointments.map((appt) => (
                <TableRow key={appt.id}>
                  <TableCell>
                    <Link href={`/dashboard/patients/${appt.patientId}`} className="underline">
                      {appt.patient.name}
                    </Link>
                  </TableCell>
                  <TableCell>Dr. {appt.doctor.name}</TableCell>
                  <TableCell>{appt.scheduledAt.toLocaleString()}</TableCell>
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
