import { prisma } from "@/lib/prisma";
import { AppointmentForm } from "@/components/appointments/appointment-form";
import { createAppointment } from "../actions";

export default async function NewAppointmentPage() {
  const [patients, doctors] = await Promise.all([
    prisma.patient.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.profile.findMany({
      where: { role: "DOCTOR" },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Schedule appointment</h1>
      <AppointmentForm action={createAppointment} patients={patients} doctors={doctors} />
    </div>
  );
}
