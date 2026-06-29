import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      appointments: {
        orderBy: { scheduledAt: "desc" },
        include: { doctor: true },
      },
    },
  });

  if (!patient) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{patient.name}</h1>

      <Card>
        <CardHeader>
          <CardTitle>Patient details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Date of birth</div>
            <div>{patient.dob.toISOString().slice(0, 10)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Gender</div>
            <div>{patient.gender}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Phone</div>
            <div>{patient.phone}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Address</div>
            <div>{patient.address ?? "—"}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appointment history</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {patient.appointments.length === 0 && (
            <p className="text-sm text-muted-foreground">No appointments yet.</p>
          )}
          {patient.appointments.map((appt) => (
            <div
              key={appt.id}
              className="flex items-center justify-between border-b pb-2 last:border-none"
            >
              <div>
                <div className="font-medium">Dr. {appt.doctor.name}</div>
                <div className="text-sm text-muted-foreground">
                  {appt.scheduledAt.toLocaleString()}
                </div>
              </div>
              <Badge variant="secondary">{appt.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
