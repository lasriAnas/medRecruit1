import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardNav } from "@/components/dashboard-nav";
import { ChatWidget } from "@/components/messages/chat-widget";
import { signOut } from "./actions";
import type { Role } from "@/generated/prisma/enums";

const NAV_ITEMS: { href: string; label: string; roles: Role[] }[] = [
  { href: "/dashboard/reports",      label: "Reports",      roles: ["ADMIN"] },
  { href: "/dashboard/patients",     label: "Patients",     roles: ["ADMIN", "DOCTOR", "RECEPTIONIST"] },
  { href: "/dashboard/appointments", label: "Appointments", roles: ["ADMIN", "DOCTOR", "RECEPTIONIST"] },
  { href: "/dashboard/billing",      label: "Billing",      roles: ["ADMIN", "RECEPTIONIST"] },
  { href: "/dashboard/pharmacy",     label: "Pharmacy",     roles: ["ADMIN", "DOCTOR", "RECEPTIONIST"] },
  { href: "/dashboard/messages",     label: "Messages",     roles: ["ADMIN", "DOCTOR", "RECEPTIONIST"] },
  { href: "/dashboard/users",        label: "Users",        roles: ["ADMIN"] },
  { href: "/dashboard/audit-log",    label: "Audit log",    roles: ["ADMIN"] },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.mustChangePassword) {
    redirect("/change-password");
  }

  const visibleNavItems = NAV_ITEMS.filter((item) => item.roles.includes(profile.role));

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 border-r bg-muted/30 p-4 flex flex-col gap-4 print:hidden">
        <div className="text-lg font-semibold px-2">medRecrut</div>
        <DashboardNav items={visibleNavItems} />
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between border-b px-6 py-3 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{profile.name}</span>
            <Badge variant="secondary">{profile.role}</Badge>
          </div>
          <form action={signOut}>
            <Button type="submit" variant="outline" size="sm">
              Sign out
            </Button>
          </form>
        </header>
        <main className="flex-1 p-6 print:p-0">{children}</main>
      </div>
      <ChatWidget currentProfileId={profile.id} />
    </div>
  );
}
