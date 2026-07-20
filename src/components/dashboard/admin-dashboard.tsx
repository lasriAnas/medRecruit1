import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type AppointmentGroup = { status: string; _count: { _all: number } };
type RevenueGroup = { status: string; _sum: { amount: number | null } };
type DoctorWorkload = { doctorId: string; doctorName: string; count: number };
type LowStockMed = { id: string; name: string; stock: number; reorderThreshold: number; unit: string };
type AuditEntry = { id: string; actorName: string; action: string; targetType: string; createdAt: Date };

interface AdminDashboardProps {
  appointmentsToday: AppointmentGroup[];
  appointmentsThisWeek: AppointmentGroup[];
  revenueStats: RevenueGroup[];
  unpaidInvoiceCount: number;
  totalPatients: number;
  newPatientsThisMonth: number;
  lowStockMeds: LowStockMed[];
  recentAuditLogs: AuditEntry[];
  doctorWorkload: DoctorWorkload[];
}

function countByStatus(groups: AppointmentGroup[], status: string) {
  return groups.find((g) => g.status === status)?._count._all ?? 0;
}

const STATUSES = ["SCHEDULED", "COMPLETED", "CANCELLED"] as const;

export function AdminDashboard({
  appointmentsToday,
  appointmentsThisWeek,
  revenueStats,
  unpaidInvoiceCount,
  totalPatients,
  newPatientsThisMonth,
  lowStockMeds,
  recentAuditLogs,
  doctorWorkload,
}: AdminDashboardProps) {
  const totalToday = appointmentsToday.reduce((s, g) => s + g._count._all, 0);
  const totalThisWeek = appointmentsThisWeek.reduce((s, g) => s + g._count._all, 0);
  const collected = revenueStats.find((r) => r.status === "PAID")?._sum.amount ?? 0;
  const outstanding = revenueStats.find((r) => r.status === "UNPAID")?._sum.amount ?? 0;
  const maxWorkload = Math.max(1, ...doctorWorkload.map((d) => d.count));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {/* Alerts */}
      {(unpaidInvoiceCount > 0 || lowStockMeds.length > 0) && (
        <div className="flex flex-col gap-3 sm:flex-row">
          {unpaidInvoiceCount > 0 && (
            <Link
              href="/dashboard/billing"
              className="flex-1 rounded-lg border border-red-300 bg-red-50 dark:bg-red-950/30 dark:border-red-800 p-4 hover:brightness-95 transition-[filter]"
            >
              <p className="font-semibold text-red-800 dark:text-red-300">
                {unpaidInvoiceCount} unpaid invoice{unpaidInvoiceCount !== 1 ? "s" : ""}
              </p>
              <p className="text-sm text-red-700 dark:text-red-400 mt-0.5">
                {outstanding.toLocaleString()} MAD outstanding
              </p>
            </Link>
          )}
          {lowStockMeds.length > 0 && (
            <Link
              href="/dashboard/pharmacy"
              className="flex-1 rounded-lg border border-orange-300 bg-orange-50 dark:bg-orange-950/30 dark:border-orange-800 p-4 hover:brightness-95 transition-[filter]"
            >
              <p className="font-semibold text-orange-800 dark:text-orange-300">
                {lowStockMeds.length} medication{lowStockMeds.length !== 1 ? "s" : ""} low on stock
              </p>
              <ul className="mt-1 flex flex-col gap-0.5">
                {lowStockMeds.slice(0, 3).map((m) => (
                  <li key={m.id} className="text-sm text-orange-700 dark:text-orange-400">
                    {m.name} — {m.stock} {m.unit}s left
                  </li>
                ))}
                {lowStockMeds.length > 3 && (
                  <li className="text-sm text-orange-600 dark:text-orange-500">
                    +{lowStockMeds.length - 3} more
                  </li>
                )}
              </ul>
            </Link>
          )}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground">Appointments today</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{totalToday}</div>
            <div className="mt-1 flex flex-wrap gap-1">
              {STATUSES.map((s) => (
                <Badge key={s} variant="outline" className="text-xs">
                  {s[0]}{s.slice(1).toLowerCase()}: {countByStatus(appointmentsToday, s)}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground">This week</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{totalThisWeek}</div>
            <div className="mt-1 flex flex-wrap gap-1">
              {STATUSES.map((s) => (
                <Badge key={s} variant="outline" className="text-xs">
                  {s[0]}{s.slice(1).toLowerCase()}: {countByStatus(appointmentsThisWeek, s)}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground">Revenue collected</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{collected.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground mt-0.5">MAD all time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground">Patients</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{totalPatients}</div>
            <p className="text-sm text-muted-foreground mt-0.5">+{newPatientsThisMonth} this month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Doctor workload */}
        <Card>
          <CardHeader><CardTitle>Doctor workload this week</CardTitle></CardHeader>
          <CardContent>
            {doctorWorkload.length === 0 ? (
              <p className="text-sm text-muted-foreground">No appointments this week.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {doctorWorkload.map((d) => (
                  <div key={d.doctorId} className="flex items-center gap-3">
                    <span className="w-36 shrink-0 text-sm truncate">Dr. {d.doctorName}</span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${(d.count / maxWorkload) * 100}%` }}
                      />
                    </div>
                    <span className="w-6 shrink-0 text-right text-sm tabular-nums">{d.count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent audit log */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent activity</CardTitle>
              <Link href="/dashboard/audit-log" className="text-sm text-muted-foreground hover:underline">
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentAuditLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity yet.</p>
            ) : (
              <div className="flex flex-col divide-y">
                {recentAuditLogs.map((log) => (
                  <div key={log.id} className="py-2 flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">
                        <span className="font-medium">{log.actorName}</span>
                        {" "}
                        <span className="text-muted-foreground">{log.action.toLowerCase().replace(/_/g, " ")} {log.targetType.toLowerCase()}</span>
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                      {log.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
