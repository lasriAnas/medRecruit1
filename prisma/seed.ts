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
];
const SEED_PASSWORD = "password123";

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
    update: { name: user.name, role: user.role },
    create: { id: authUser.id, email: user.email, name: user.name, role: user.role },
  });
}

async function main() {
  const profiles = await Promise.all(SEED_USERS.map(upsertProfile));
  const doctors = profiles.filter((p) => p.role === "DOCTOR");

  const patient = await prisma.patient.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      name: "John Doe",
      dob: new Date("1990-01-01"),
      gender: "MALE",
      phone: "555-0100",
      address: "123 Main St",
    },
  });

  await prisma.appointment.create({
    data: {
      patientId: patient.id,
      doctorId: doctors[0].id,
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      status: "SCHEDULED",
      notes: "Initial consultation",
    },
  });

  console.log("Seed complete. Sample login: admin@medrecrut.dev / " + SEED_PASSWORD);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
