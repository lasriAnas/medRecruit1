import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { withRetry } from "@/lib/with-retry";
import { getCurrentProfile } from "@/lib/auth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const ACTION_LABELS: Record<string, string> = {
  ACCOUNT_CREATED: "Account created",
  ROLE_CHANGED: "Role changed",
  ACCOUNT_DEACTIVATED: "Account deactivated",
  ACCOUNT_REACTIVATED: "Account reactivated",
  PATIENT_DELETED: "Patient deleted",
  INVOICE_STATUS_CHANGED: "Invoice status changed",
};

export default async function AuditLogPage() {
  const profile = await getCurrentProfile();
  if (profile?.role !== "ADMIN") {
    redirect("/dashboard/patients");
  }

  const logs = await withRetry(() =>
    prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Audit log</h1>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No audit events yet.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap">
                    {log.createdAt.toLocaleString()}
                  </TableCell>
                  <TableCell>{log.actorName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{ACTION_LABELS[log.action] ?? log.action}</Badge>
                  </TableCell>
                  <TableCell>{log.targetType}</TableCell>
                  <TableCell className="text-muted-foreground">{log.details}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
