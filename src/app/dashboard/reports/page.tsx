import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { withRetry } from "@/lib/with-retry";
import { getCurrentProfile } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExportReportButton } from "@/components/reports/export-report-button";

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfWeek(date: Date) {
  const d = startOfDay(date);
  const day = d.getDay();
  const diff = (day + 6) % 7; // Monday as start of week
  d.setDate(d.getDate() - diff);
  return d;
}

export default async function ReportsPage() {
  const profile = await getCurrentProfile();
  if (profile?.role !== "ADMIN") {
    redirect("/dashboard/patients");
  }

  const now = new Date();
  const todayStart = startOfDay(now);
  const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
  const weekStart = startOfWeek(now);

  const [
    appointmentsToday,
    appointmentsThisWeek,
    revenueAggregates,
    doctorWorkload,
    totalPatients,
    newPatientsThisWeek,
  ] = await withRetry(() =>
    Promise.all([
      prisma.appointment.groupBy({
        by: ["status"],
        where: { scheduledAt: { gte: todayStart, lt: tomorrowStart } },
        _count: { _all: true },
      }),
      prisma.appointment.groupBy({
        by: ["status"],
        where: { scheduledAt: { gte: weekStart } },
        _count: { _all: true },
      }),
      prisma.invoice.groupBy({
        by: ["status"],
        _sum: { amount: true },
      }),
      prisma.appointment.groupBy({
        by: ["doctorId"],
        where: { scheduledAt: { gte: weekStart } },
        _count: { _all: true },
      }),
      prisma.patient.count(),
      prisma.patient.count({ where: { createdAt: { gte: weekStart } } }),
    ]),
  );

  const doctorIds = doctorWorkload.map((d) => d.doctorId);
  const doctors = await withRetry(() =>
    prisma.profile.findMany({ where: { id: { in: doctorIds } } }),
  );
  const doctorNameById = new Map(doctors.map((d) => [d.id, d.name]));

  const STATUSES = ["SCHEDULED", "COMPLETED", "CANCELLED"] as const;

  function countFor(groups: typeof appointmentsToday, status: (typeof STATUSES)[number]) {
    return groups.find((g) => g.status === status)?._count._all ?? 0;
  }

  const revenueCollected = revenueAggregates.find((r) => r.status === "PAID")?._sum.amount ?? 0;
  const revenueOutstanding =
    revenueAggregates.find((r) => r.status === "UNPAID")?._sum.amount ?? 0;

  const workloadSorted = [...doctorWorkload].sort((a, b) => b._count._all - a._count._all);
  const maxWorkload = workloadSorted[0]?._count._all ?? 0;

  const exportData = {
    summary: [
      {
        Metric: "Appointments today",
        Value: appointmentsToday.reduce((sum, g) => sum + g._count._all, 0),
      },
      {
        Metric: "Appointments this week",
        Value: appointmentsThisWeek.reduce((sum, g) => sum + g._count._all, 0),
      },
      { Metric: "Revenue collected (MAD)", Value: revenueCollected },
      { Metric: "Revenue outstanding (MAD)", Value: revenueOutstanding },
      { Metric: "Total patients", Value: totalPatients },
      { Metric: "New patients this week", Value: newPatientsThisWeek },
    ],
    doctorWorkload: workloadSorted.map((entry) => ({
      Doctor: `Dr. ${doctorNameById.get(entry.doctorId) ?? "Unknown"}`,
      "Appointments this week": entry._count._all,
    })),
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Reports</h1>
        <ExportReportButton data={exportData} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Appointments today</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div className="text-3xl font-semibold">
              {appointmentsToday.reduce((sum, g) => sum + g._count._all, 0)}
            </div>
            <div className="flex flex-wrap gap-1">
              {STATUSES.map((status) => (
                <Badge key={status} variant="outline">
                  {status}: {countFor(appointmentsToday, status)}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appointments this week</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div className="text-3xl font-semibold">
              {appointmentsThisWeek.reduce((sum, g) => sum + g._count._all, 0)}
            </div>
            <div className="flex flex-wrap gap-1">
              {STATUSES.map((status) => (
                <Badge key={status} variant="outline">
                  {status}: {countFor(appointmentsThisWeek, status)}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue collected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{revenueCollected.toLocaleString()} MAD</div>
            <p className="text-sm text-muted-foreground">From paid invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{revenueOutstanding.toLocaleString()} MAD</div>
            <p className="text-sm text-muted-foreground">From unpaid invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{totalPatients}</div>
            <p className="text-sm text-muted-foreground">{newPatientsThisWeek} new this week</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Doctor workload (this week)</CardTitle>
        </CardHeader>
        <CardContent>
          {workloadSorted.length === 0 ? (
            <p className="text-sm text-muted-foreground">No appointments scheduled this week.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {workloadSorted.map((entry) => (
                <div key={entry.doctorId} className="flex items-center gap-3">
                  <div className="w-40 shrink-0 text-sm">
                    Dr. {doctorNameById.get(entry.doctorId) ?? "Unknown"}
                  </div>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{
                        width: `${maxWorkload > 0 ? (entry._count._all / maxWorkload) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <div className="w-8 shrink-0 text-right text-sm">{entry._count._all}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
