import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { withRetry } from "@/lib/with-retry";
import { getCurrentProfile } from "@/lib/auth";
import { UsersTable, type UserRow } from "@/components/users/users-table";
import { AccountCreateDialog } from "@/components/users/account-create-dialog";

export default async function UsersPage() {
  const profile = await getCurrentProfile();
  if (profile?.role !== "ADMIN") {
    redirect("/dashboard/patients");
  }

  const users = await withRetry(() =>
    prisma.profile.findMany({ orderBy: { createdAt: "asc" } }),
  );

  const ownerEmail = process.env.SUPER_ADMIN_EMAIL;

  const rows: UserRow[] = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    active: user.active,
    mustChangePassword: user.mustChangePassword,
    createdAt: user.createdAt.toISOString(),
    isOwner: ownerEmail ? user.email === ownerEmail : false,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Users</h1>
        <AccountCreateDialog />
      </div>
      <UsersTable data={rows} currentUserId={profile.id} />
    </div>
  );
}
