import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { PatientsTable, type PatientRow } from "@/components/patients/patients-table";

export default async function PatientsPage() {
  const patients = await prisma.patient.findMany({
    orderBy: { createdAt: "desc" },
  });

  const rows: PatientRow[] = patients.map((p) => ({
    id: p.id,
    name: p.name,
    dob: p.dob.toISOString().slice(0, 10),
    gender: p.gender,
    phone: p.phone,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Patients</h1>
        <Button render={<Link href="/dashboard/patients/new" />}>Register patient</Button>
      </div>
      <PatientsTable data={rows} />
    </div>
  );
}
