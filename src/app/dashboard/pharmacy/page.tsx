import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withRetry } from "@/lib/with-retry";
import { PharmacyTable } from "@/components/pharmacy/pharmacy-table";
import { MedicationCreateDialog } from "@/components/pharmacy/medication-create-dialog";

export default async function PharmacyPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const medications = await withRetry(() =>
    prisma.medication.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] }),
  );

  const canCreate = profile.role === "ADMIN";
  const canRestock = profile.role === "ADMIN" || profile.role === "RECEPTIONIST";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Pharmacy</h1>
        {canCreate && <MedicationCreateDialog />}
      </div>
      <PharmacyTable data={medications} canRestock={canRestock} canDelete={canCreate} />
    </div>
  );
}
