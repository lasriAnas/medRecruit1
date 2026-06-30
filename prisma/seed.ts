import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const SEED_USERS = [
  { name: "Alice Admin", email: "admin@medrecrut.dev", role: "ADMIN" as const },
  { name: "Dana Doctor", email: "doctor1@medrecrut.dev", role: "DOCTOR" as const },
  { name: "Sam Surgeon", email: "doctor2@medrecrut.dev", role: "DOCTOR" as const },
  { name: "Reese Reception", email: "reception@medrecrut.dev", role: "RECEPTIONIST" as const },
  { name: "You", email: "you@medrecrut.dev", role: "ADMIN" as const },
];
const SEED_PASSWORD = "password123";

const FIRST_NAMES = [
  "John", "Jane", "Carlos", "Maria", "Wei", "Fatima", "Liam", "Olivia",
  "Noah", "Emma", "Ravi", "Priya", "Kenji", "Yuki", "Omar", "Layla",
  "Lucas", "Sofia", "Ahmed", "Chloe",
];
const LAST_NAMES = [
  "Smith", "Johnson", "Garcia", "Lee", "Khan", "Brown", "Müller", "Dubois",
  "Rossi", "Tanaka", "Silva", "Kim", "Ali", "Nguyen", "Andersson", "Costa",
  "Hassan", "Park", "Novak", "Ferreira",
];

function seededPatientId(i: number) {
  return `00000000-0000-0000-0000-${String(i + 100).padStart(12, "0")}`;
}

async function upsertProfile(user: (typeof SEED_USERS)[number]) {
  const { data: existing } = await supabaseAdmin.auth.admin.listUsers();
  let authUser = existing.users.find((u) => u.email === user.email);

  if (!authUser) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: user.email,
      password: SEED_PASSWORD,
      email_confirm: true,
    });
    if (error || !data.user) throw error ?? new Error("Failed to create auth user");
    authUser = data.user;
  }

  return prisma.profile.upsert({
    where: { id: authUser.id },
    update: { name: user.name, role: user.role, active: true, mustChangePassword: false },
    create: {
      id: authUser.id,
      email: user.email,
      name: user.name,
      role: user.role,
      active: true,
      mustChangePassword: false,
    },
  });
}

async function main() {
  const profiles = await Promise.all(SEED_USERS.map(upsertProfile));
  const doctors = profiles.filter((p) => p.role === "DOCTOR");

  const GENDERS = ["MALE", "FEMALE"] as const;
  const STATUSES = ["SCHEDULED", "COMPLETED", "CANCELLED"] as const;

  const patients = await Promise.all(
    FIRST_NAMES.map((first, i) => {
      const last = LAST_NAMES[i];
      const year = 1950 + ((i * 7) % 60);
      const month = (i % 12) + 1;
      const day = (i % 27) + 1;
      const phone = `0${["5", "6", "7"][i % 3]}${String(10000000 + i).padStart(8, "0")}`;
      return prisma.patient.upsert({
        where: { id: seededPatientId(i) },
        update: { phone },
        create: {
          id: seededPatientId(i),
          name: `${first} ${last}`,
          dob: new Date(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`),
          gender: GENDERS[i % GENDERS.length],
          phone,
          address: `${100 + i} Main St`,
        },
      });
    }),
  );

  for (let i = 0; i < patients.length; i++) {
    const existingCount = await prisma.appointment.count({
      where: { patientId: patients[i].id },
    });
    if (existingCount > 0) continue;

    await prisma.appointment.create({
      data: {
        patientId: patients[i].id,
        doctorId: doctors[i % doctors.length].id,
        scheduledAt: new Date(Date.now() + (i - 10) * 24 * 60 * 60 * 1000),
        status: STATUSES[i % STATUSES.length],
        notes: i % 3 === 0 ? "Follow-up checkup" : undefined,
      },
    });
  }

  const completedAppointments = await prisma.appointment.findMany({
    where: { status: "COMPLETED" },
    orderBy: { scheduledAt: "asc" },
    take: 3,
  });

  const invoiceStatuses = ["PAID", "PAID", "UNPAID"] as const;
  for (let i = 0; i < completedAppointments.length; i++) {
    const status = invoiceStatuses[i % invoiceStatuses.length];
    await prisma.invoice.upsert({
      where: { appointmentId: completedAppointments[i].id },
      update: { status, paidAt: status === "PAID" ? new Date() : null },
      create: {
        appointmentId: completedAppointments[i].id,
        amount: 200 + i * 50,
        status,
        paidAt: status === "PAID" ? new Date() : null,
      },
    });
  }

  console.log("Seed complete.");
  console.log("Admin login: admin@medrecrut.dev / " + SEED_PASSWORD);
  console.log("Your personal login: you@medrecrut.dev / " + SEED_PASSWORD);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
