import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { withRetry } from "@/lib/with-retry";
import { getCurrentProfile } from "@/lib/auth";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { DoctorDashboard } from "@/components/dashboard/doctor-dashboard";
import { ReceptionistDashboard } from "@/components/dashboard/receptionist-dashboard";

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfWeek(date: Date) {
  const d = startOfDay(date);
  const diff = (d.getDay() + 6) % 7; // Monday
  d.setDate(d.getDate() - diff);
  return d;
}

export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const now = new Date();
  const todayStart = startOfDay(now);
  const tomorrowStart = new Date(todayStart.getTime() + 86_400_000);
  const weekStart = startOfWeek(now);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // ── ADMIN ────────────────────────────────────────────────────────────────
  if (profile.role === "ADMIN") {
    const [
      appointmentsToday,
      appointmentsThisWeek,
      revenueStats,
      unpaidInvoiceCount,
      totalPatients,
      newPatientsThisMonth,
      allMedications,
      recentAuditLogs,
      doctorWorkloadRaw,
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
        prisma.invoice.count({ where: { status: "UNPAID" } }),
        prisma.patient.count(),
        prisma.patient.count({ where: { createdAt: { gte: monthStart } } }),
        prisma.medication.findMany({
          select: { id: true, name: true, stock: true, reorderThreshold: true, unit: true },
        }),
        prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
        prisma.appointment.groupBy({
          by: ["doctorId"],
          where: { scheduledAt: { gte: weekStart } },
          _count: { _all: true },
          orderBy: { _count: { doctorId: "desc" } },
        }),
      ]),
    );

    const lowStockMeds = allMedications.filter((m) => m.stock <= m.reorderThreshold);

    const doctorIds = doctorWorkloadRaw.map((d) => d.doctorId);
    const doctors =
      doctorIds.length > 0
        ? await withRetry(() =>
            prisma.profile.findMany({
              where: { id: { in: doctorIds } },
              select: { id: true, name: true },
            }),
          )
        : [];
    const nameById = new Map(doctors.map((d) => [d.id, d.name]));

    const doctorWorkload = doctorWorkloadRaw.map((d) => ({
      doctorId: d.doctorId,
      doctorName: nameById.get(d.doctorId) ?? "Unknown",
      count: d._count._all,
    }));

    return (
      <AdminDashboard
        appointmentsToday={appointmentsToday.map((g) => ({
          status: g.status,
          _count: { _all: g._count._all },
        }))}
        appointmentsThisWeek={appointmentsThisWeek.map((g) => ({
          status: g.status,
          _count: { _all: g._count._all },
        }))}
        revenueStats={revenueStats.map((r) => ({
          status: r.status,
          _sum: { amount: r._sum.amount },
        }))}
        unpaidInvoiceCount={unpaidInvoiceCount}
        totalPatients={totalPatients}
        newPatientsThisMonth={newPatientsThisMonth}
        lowStockMeds={lowStockMeds}
        recentAuditLogs={recentAuditLogs}
        doctorWorkload={doctorWorkload}
      />
    );
  }

  // ── DOCTOR ───────────────────────────────────────────────────────────────
  if (profile.role === "DOCTOR") {
    const [todayAppointmentsRaw, completedThisWeek, prescriptionsThisWeek, unreadMessages] =
      await withRetry(() =>
        Promise.all([
          prisma.appointment.findMany({
            where: {
              doctorId: profile.id,
              scheduledAt: { gte: todayStart, lt: tomorrowStart },
            },
            orderBy: { scheduledAt: "asc" },
            include: { patient: { select: { name: true } } },
          }),
          prisma.appointment.findMany({
            where: {
              doctorId: profile.id,
              status: "COMPLETED",
              scheduledAt: { gte: weekStart },
            },
            select: { patientId: true },
          }),
          prisma.prescription.count({
            where: {
              appointment: { doctorId: profile.id },
              createdAt: { gte: weekStart },
            },
          }),
          prisma.message.count({
            where: { receiverId: profile.id, readAt: null },
          }),
        ]),
      );

    const patientsSeenThisWeek = new Set(completedThisWeek.map((a) => a.patientId)).size;

    return (
      <DoctorDashboard
        doctorName={profile.name}
        todayAppointments={todayAppointmentsRaw.map((a) => ({
          id: a.id,
          scheduledAt: a.scheduledAt,
          status: a.status,
          patientName: a.patient.name,
        }))}
        patientsSeenThisWeek={patientsSeenThisWeek}
        prescriptionsThisWeek={prescriptionsThisWeek}
        unreadMessages={unreadMessages}
      />
    );
  }

  // ── RECEPTIONIST ─────────────────────────────────────────────────────────
  const [todayAppointmentsRaw, unpaidStats, newPatientsThisWeek, unreadMessages] =
    await withRetry(() =>
      Promise.all([
        prisma.appointment.findMany({
          where: { scheduledAt: { gte: todayStart, lt: tomorrowStart } },
          orderBy: { scheduledAt: "asc" },
          include: {
            patient: { select: { name: true } },
            doctor: { select: { name: true } },
          },
        }),
        prisma.invoice.aggregate({
          where: { status: "UNPAID" },
          _count: { _all: true },
          _sum: { amount: true },
        }),
        prisma.patient.count({ where: { createdAt: { gte: weekStart } } }),
        prisma.message.count({ where: { receiverId: profile.id, readAt: null } }),
      ]),
    );

  return (
    <ReceptionistDashboard
      receptionistName={profile.name}
      todayAppointments={todayAppointmentsRaw.map((a) => ({
        id: a.id,
        scheduledAt: a.scheduledAt,
        status: a.status,
        patientName: a.patient.name,
        doctorName: a.doctor.name,
      }))}
      unpaidInvoiceCount={unpaidStats._count._all}
      outstandingAmount={unpaidStats._sum.amount ?? 0}
      newPatientsThisWeek={newPatientsThisWeek}
      unreadMessages={unreadMessages}
    />
  );
}
