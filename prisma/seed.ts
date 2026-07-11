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

const SEED_PASSWORD = "password123";

// ─── Staff ────────────────────────────────────────────────────────────────────

const SEED_USERS = [
  { name: "Alice Benali",       email: "admin@medrecrut.dev",      role: "ADMIN"         as const },
  { name: "Dr. Karim Idrissi",  email: "doctor1@medrecrut.dev",    role: "DOCTOR"        as const },
  { name: "Dr. Sara Tazi",      email: "doctor2@medrecrut.dev",    role: "DOCTOR"        as const },
  { name: "Dr. Youssef Amrani", email: "doctor3@medrecrut.dev",    role: "DOCTOR"        as const },
  { name: "Dr. Nadia Berrada",  email: "doctor4@medrecrut.dev",    role: "DOCTOR"        as const },
  { name: "Rachid Moussaoui",   email: "reception@medrecrut.dev",  role: "RECEPTIONIST"  as const },
  { name: "Imane Chaoui",       email: "reception2@medrecrut.dev", role: "RECEPTIONIST"  as const },
  { name: "You",                email: "you@medrecrut.dev",        role: "ADMIN"         as const },
];

// ─── Patients ─────────────────────────────────────────────────────────────────

const PATIENTS = [
  { name: "Mohammed Alaoui",      dob: "1978-03-12", gender: "MALE",   phone: "0661234501", address: "12 Rue Ibn Batouta, Rabat" },
  { name: "Fatima Zahra Benali",  dob: "1985-07-22", gender: "FEMALE", phone: "0662345602", address: "7 Ave Hassan II, Casablanca" },
  { name: "Hassan Idrissi",       dob: "1962-11-05", gender: "MALE",   phone: "0663456703", address: "34 Blvd Mohammed V, Fès" },
  { name: "Khadija Tazi",         dob: "1990-01-30", gender: "FEMALE", phone: "0664567804", address: "18 Rue des Oliviers, Meknès" },
  { name: "Youssef Chraibi",      dob: "1955-09-17", gender: "MALE",   phone: "0665678905", address: "5 Derb Sidi Bouloukate, Marrakech" },
  { name: "Aicha Sefrioui",       dob: "1993-04-08", gender: "FEMALE", phone: "0666789006", address: "22 Rue de la Liberté, Tanger" },
  { name: "Omar Bensouda",        dob: "1948-12-25", gender: "MALE",   phone: "0667890107", address: "9 Allée des Roses, Agadir" },
  { name: "Zineb Fassi",          dob: "1982-06-14", gender: "FEMALE", phone: "0668901208", address: "3 Quartier Palmier, Casablanca" },
  { name: "Mustapha Guessous",    dob: "1970-02-28", gender: "MALE",   phone: "0669012309", address: "56 Rue Patrice Lumumba, Rabat" },
  { name: "Loubna Kettani",       dob: "1988-08-19", gender: "FEMALE", phone: "0660123410", address: "14 Blvd Zerktouni, Casablanca" },
  { name: "Abdelhak Rhazali",     dob: "1975-05-03", gender: "MALE",   phone: "0661234511", address: "27 Rue Al Massira, Oujda" },
  { name: "Samira Ouali",         dob: "1996-10-11", gender: "FEMALE", phone: "0662345612", address: "8 Ave des FAR, Tétouan" },
  { name: "Driss Benhima",        dob: "1940-07-07", gender: "MALE",   phone: "0663456713", address: "11 Rue Moulay Ismail, Meknès" },
  { name: "Nour El Houda Fassi",  dob: "1999-03-25", gender: "FEMALE", phone: "0664567814", address: "4 Hay Riad, Rabat" },
  { name: "Khalid Bennani",       dob: "1966-09-01", gender: "MALE",   phone: "0665678915", address: "19 Quartier Gueliz, Marrakech" },
  { name: "Soukaina Lahlou",      dob: "1983-12-18", gender: "FEMALE", phone: "0666789016", address: "31 Rue Ibnou Khatib, Casablanca" },
  { name: "Amine Ziani",          dob: "1991-06-29", gender: "MALE",   phone: "0667890117", address: "6 Ave Mohammed VI, Agadir" },
  { name: "Hasnaa Bouzid",        dob: "1958-11-14", gender: "FEMALE", phone: "0668901218", address: "45 Hay Mohammadi, Casablanca" },
  { name: "Tarik El Filali",      dob: "1977-04-22", gender: "MALE",   phone: "0669012319", address: "88 Rue Chaouia, Fès" },
  { name: "Meriem Qatib",         dob: "1986-08-06", gender: "FEMALE", phone: "0660123420", address: "17 Blvd de Paris, Rabat" },
  { name: "Jean Dupont",          dob: "1952-01-15", gender: "MALE",   phone: "0661234521", address: "Résidence Atlas, Casablanca" },
  { name: "Sofia Martinez",       dob: "1994-07-30", gender: "FEMALE", phone: "0662345622", address: "Tour Anfa, Casablanca" },
  { name: "Luca Rossi",           dob: "1969-03-09", gender: "MALE",   phone: "0663456723", address: "Villa Majorelle, Marrakech" },
  { name: "Emma Clarke",          dob: "2001-11-27", gender: "FEMALE", phone: "0664567824", address: "Riad Yacout, Fès Medina" },
  { name: "Rachid Oubella",       dob: "1973-05-18", gender: "MALE",   phone: "0665678925", address: "23 Rue Ibn Sina, Kénitra" },
  { name: "Wafaa El Amrani",      dob: "1989-09-04", gender: "FEMALE", phone: "0666789026", address: "10 Av. Bir Anzarane, Laayoune" },
  { name: "Hamid Berrechid",      dob: "1945-02-20", gender: "MALE",   phone: "0667890127", address: "2 Rue des Acacias, Beni Mellal" },
  { name: "Chaimae Belkhadir",    dob: "1997-10-31", gender: "FEMALE", phone: "0668901228", address: "55 Rue Imam Malik, Rabat" },
  { name: "Abderrahim Sabir",     dob: "1960-07-16", gender: "MALE",   phone: "0669012329", address: "77 Hay Karima, Salé" },
  { name: "Houda Oukhouya",       dob: "1984-04-02", gender: "FEMALE", phone: "0660123430", address: "32 Quartier Industriel, Safi" },
] as const;

// ─── Medications ──────────────────────────────────────────────────────────────

const MEDICATIONS: {
  name: string; unit: string; stock: number; reorderThreshold: number; category: "MEDICATION" | "SUPPLY";
}[] = [
  // Medications
  { name: "Paracétamol 500mg",     unit: "comprimé",   stock: 420, reorderThreshold: 50,  category: "MEDICATION" },
  { name: "Amoxicilline 500mg",    unit: "gélule",     stock: 180, reorderThreshold: 40,  category: "MEDICATION" },
  { name: "Ibuprofène 400mg",      unit: "comprimé",   stock: 18,  reorderThreshold: 30,  category: "MEDICATION" }, // LOW
  { name: "Métronidazole 250mg",   unit: "comprimé",   stock: 95,  reorderThreshold: 20,  category: "MEDICATION" },
  { name: "Oméprazole 20mg",       unit: "gélule",     stock: 12,  reorderThreshold: 25,  category: "MEDICATION" }, // LOW
  { name: "Vitamine C 1000mg",     unit: "comprimé",   stock: 600, reorderThreshold: 60,  category: "MEDICATION" },
  { name: "Azithromycine 500mg",   unit: "comprimé",   stock: 60,  reorderThreshold: 15,  category: "MEDICATION" },
  { name: "Doxycycline 100mg",     unit: "gélule",     stock: 8,   reorderThreshold: 20,  category: "MEDICATION" }, // LOW
  { name: "Prednisolone 5mg",      unit: "comprimé",   stock: 110, reorderThreshold: 20,  category: "MEDICATION" },
  { name: "Metformine 500mg",      unit: "comprimé",   stock: 240, reorderThreshold: 40,  category: "MEDICATION" },
  { name: "Aténolol 50mg",         unit: "comprimé",   stock: 5,   reorderThreshold: 25,  category: "MEDICATION" }, // LOW
  { name: "Furosémide 40mg",       unit: "comprimé",   stock: 130, reorderThreshold: 20,  category: "MEDICATION" },
  { name: "Amlodipine 5mg",        unit: "comprimé",   stock: 75,  reorderThreshold: 20,  category: "MEDICATION" },
  { name: "Salbutamol 100mcg",     unit: "inhalateur", stock: 22,  reorderThreshold: 10,  category: "MEDICATION" },
  { name: "Cetirizine 10mg",       unit: "comprimé",   stock: 160, reorderThreshold: 30,  category: "MEDICATION" },
  // Supplies / consumables
  { name: "Gants latex (S)",       unit: "paire",      stock: 250, reorderThreshold: 50,  category: "SUPPLY" },
  { name: "Gants latex (M)",       unit: "paire",      stock: 320, reorderThreshold: 50,  category: "SUPPLY" },
  { name: "Gants latex (L)",       unit: "paire",      stock: 180, reorderThreshold: 50,  category: "SUPPLY" },
  { name: "Abaisse-langue",        unit: "unité",      stock: 500, reorderThreshold: 100, category: "SUPPLY" },
  { name: "Gel échographie",       unit: "tube",       stock: 14,  reorderThreshold: 10,  category: "SUPPLY" },
  { name: "Compresses stériles",   unit: "paquet",     stock: 80,  reorderThreshold: 20,  category: "SUPPLY" },
  { name: "Seringues 5ml",         unit: "unité",      stock: 200, reorderThreshold: 50,  category: "SUPPLY" },
  { name: "Seringues 10ml",        unit: "unité",      stock: 150, reorderThreshold: 40,  category: "SUPPLY" },
  { name: "Bandelettes glycémie",  unit: "boîte",      stock: 8,   reorderThreshold: 5,   category: "SUPPLY" },
  { name: "Papier ECG",            unit: "rouleau",    stock: 4,   reorderThreshold: 5,   category: "SUPPLY" }, // LOW
  { name: "Alcool 70°",            unit: "flacon",     stock: 30,  reorderThreshold: 10,  category: "SUPPLY" },
  { name: "Sparadrap",             unit: "rouleau",    stock: 25,  reorderThreshold: 8,   category: "SUPPLY" },
  { name: "Masques chirurgicaux",  unit: "boîte",      stock: 12,  reorderThreshold: 5,   category: "SUPPLY" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysAgo(n: number, hour = 10): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, 0, 0, 0);
  return d;
}

function daysFromNow(n: number, hour = 10): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(hour, 0, 0, 0);
  return d;
}

function hoursFromNow(h: number): Date {
  return new Date(Date.now() + h * 3600_000);
}

// ─── Auth upsert ──────────────────────────────────────────────────────────────

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

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  // 1. Wipe non-user data so the seed is rerunnable with fresh state
  await prisma.auditLog.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.prescriptionItem.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.medication.deleteMany();

  // 2. Upsert staff
  const profiles = await Promise.all(SEED_USERS.map(upsertProfile));
  const doctors  = profiles.filter((p) => p.role === "DOCTOR");
  const admin    = profiles.find((p) => p.email === "admin@medrecrut.dev")!;
  const [dr0, dr1, dr2, dr3] = doctors;

  // 3. Patients
  const patients = await Promise.all(
    PATIENTS.map((p) =>
      prisma.patient.create({
        data: {
          name:    p.name,
          dob:     new Date(p.dob),
          gender:  p.gender,
          phone:   p.phone,
          address: p.address,
        },
      }),
    ),
  );

  // 4. Medications + initial stock movements
  const meds = await Promise.all(
    MEDICATIONS.map((m) =>
      prisma.medication.create({
        data: {
          name: m.name,
          unit: m.unit,
          stock: m.stock,
          reorderThreshold: m.reorderThreshold,
          category: m.category,
          stockMovements: {
            create: {
              delta:  m.stock,
              reason: "Initial stock",
            },
          },
        },
      }),
    ),
  );

  // A few restock movements (to show movement history)
  await prisma.stockMovement.createMany({
    data: [
      { medicationId: meds[0].id, delta:  200, reason: "Monthly reorder" },
      { medicationId: meds[1].id, delta:  100, reason: "Monthly reorder" },
      { medicationId: meds[5].id, delta:  300, reason: "Bulk purchase"   },
      { medicationId: meds[9].id, delta:  120, reason: "Monthly reorder" },
      { medicationId: meds[2].id, delta:  -50, reason: "Dispensed to ward" },
      { medicationId: meds[4].id, delta:  -15, reason: "Dispensed to ward" },
    ],
  });

  // 5. Appointments
  // Format: [patientIndex, doctorProfile, scheduledAt, status, notes?]
  type ApptSeed = {
    patient: typeof patients[number];
    doctor:  typeof doctors[number];
    at:      Date;
    status:  "SCHEDULED" | "COMPLETED" | "CANCELLED";
    notes?:  string;
  };

  const appts: ApptSeed[] = [
    // ── Past COMPLETED (3 months ago) ──────────────────────────────────────
    { patient: patients[0],  doctor: dr0, at: daysAgo(92, 9),  status: "COMPLETED", notes: "Routine checkup" },
    { patient: patients[1],  doctor: dr1, at: daysAgo(88, 10), status: "COMPLETED", notes: "Persistent cough" },
    { patient: patients[2],  doctor: dr2, at: daysAgo(85, 11), status: "COMPLETED", notes: "Hypertension follow-up" },
    { patient: patients[3],  doctor: dr3, at: daysAgo(80, 14), status: "COMPLETED" },
    { patient: patients[4],  doctor: dr0, at: daysAgo(76, 9),  status: "COMPLETED", notes: "Diabetic check" },
    { patient: patients[5],  doctor: dr1, at: daysAgo(72, 10), status: "COMPLETED" },
    { patient: patients[6],  doctor: dr2, at: daysAgo(68, 11), status: "COMPLETED", notes: "Post-op follow-up" },
    { patient: patients[7],  doctor: dr3, at: daysAgo(65, 15), status: "COMPLETED" },
    { patient: patients[8],  doctor: dr0, at: daysAgo(60, 9),  status: "COMPLETED", notes: "Back pain assessment" },
    { patient: patients[9],  doctor: dr1, at: daysAgo(58, 10), status: "COMPLETED" },
    { patient: patients[10], doctor: dr2, at: daysAgo(55, 11), status: "COMPLETED", notes: "Skin rash" },
    { patient: patients[11], doctor: dr3, at: daysAgo(50, 14), status: "COMPLETED" },

    // ── Past CANCELLED ──────────────────────────────────────────────────────
    { patient: patients[12], doctor: dr0, at: daysAgo(78, 9),  status: "CANCELLED", notes: "Patient no-show" },
    { patient: patients[13], doctor: dr1, at: daysAgo(64, 10), status: "CANCELLED" },
    { patient: patients[20], doctor: dr2, at: daysAgo(51, 11), status: "CANCELLED", notes: "Doctor unavailable" },
    { patient: patients[25], doctor: dr3, at: daysAgo(47, 14), status: "CANCELLED" },

    // ── Past COMPLETED (1-2 months ago) ─────────────────────────────────────
    { patient: patients[0],  doctor: dr1, at: daysAgo(45, 9),  status: "COMPLETED", notes: "Blood pressure recheck" },
    { patient: patients[2],  doctor: dr2, at: daysAgo(42, 10), status: "COMPLETED" },
    { patient: patients[4],  doctor: dr0, at: daysAgo(40, 11), status: "COMPLETED", notes: "HbA1c results review" },
    { patient: patients[6],  doctor: dr3, at: daysAgo(38, 14), status: "COMPLETED" },
    { patient: patients[14], doctor: dr1, at: daysAgo(35, 9),  status: "COMPLETED", notes: "Cardiac screening" },
    { patient: patients[15], doctor: dr2, at: daysAgo(33, 10), status: "COMPLETED" },
    { patient: patients[16], doctor: dr3, at: daysAgo(30, 11), status: "COMPLETED", notes: "Sports injury" },
    { patient: patients[17], doctor: dr0, at: daysAgo(28, 14), status: "COMPLETED" },

    // ── Past COMPLETED (last 3 weeks) ────────────────────────────────────────
    { patient: patients[18], doctor: dr1, at: daysAgo(20, 9),  status: "COMPLETED", notes: "Fever and fatigue" },
    { patient: patients[19], doctor: dr2, at: daysAgo(18, 10), status: "COMPLETED" },
    { patient: patients[21], doctor: dr3, at: daysAgo(15, 11), status: "COMPLETED", notes: "Allergy review" },
    { patient: patients[22], doctor: dr0, at: daysAgo(13, 14), status: "COMPLETED" },
    { patient: patients[23], doctor: dr1, at: daysAgo(11, 9),  status: "COMPLETED", notes: "UTI follow-up" },
    { patient: patients[24], doctor: dr2, at: daysAgo(9,  10), status: "COMPLETED" },
    { patient: patients[26], doctor: dr3, at: daysAgo(7,  11), status: "COMPLETED", notes: "Respiratory check" },
    { patient: patients[27], doctor: dr0, at: daysAgo(5,  14), status: "COMPLETED" },
    { patient: patients[28], doctor: dr1, at: daysAgo(4,  9),  status: "COMPLETED", notes: "Annual physical" },
    { patient: patients[29], doctor: dr2, at: daysAgo(3,  10), status: "COMPLETED" },
    { patient: patients[1],  doctor: dr3, at: daysAgo(2,  11), status: "COMPLETED", notes: "Wound re-dressing" },
    { patient: patients[3],  doctor: dr0, at: daysAgo(1,  14), status: "COMPLETED" },

    // ── Today / next 24h (shows on dashboard alert) ──────────────────────────
    { patient: patients[5],  doctor: dr1, at: hoursFromNow(2),  status: "SCHEDULED", notes: "First consultation" },
    { patient: patients[7],  doctor: dr2, at: hoursFromNow(4),  status: "SCHEDULED" },
    { patient: patients[9],  doctor: dr3, at: hoursFromNow(6),  status: "SCHEDULED", notes: "ECG review" },
    { patient: patients[11], doctor: dr0, at: hoursFromNow(20), status: "SCHEDULED" },

    // ── This week ────────────────────────────────────────────────────────────
    { patient: patients[13], doctor: dr1, at: daysFromNow(2, 9),  status: "SCHEDULED", notes: "Post-discharge check" },
    { patient: patients[15], doctor: dr2, at: daysFromNow(2, 11), status: "SCHEDULED" },
    { patient: patients[17], doctor: dr3, at: daysFromNow(3, 10), status: "SCHEDULED", notes: "Nutrition counselling" },
    { patient: patients[19], doctor: dr0, at: daysFromNow(3, 14), status: "SCHEDULED" },
    { patient: patients[21], doctor: dr1, at: daysFromNow(4, 9),  status: "SCHEDULED", notes: "Prescription renewal" },
    { patient: patients[23], doctor: dr2, at: daysFromNow(4, 11), status: "SCHEDULED" },
    { patient: patients[25], doctor: dr3, at: daysFromNow(5, 10), status: "SCHEDULED" },
    { patient: patients[27], doctor: dr0, at: daysFromNow(5, 14), status: "SCHEDULED", notes: "Blood work results" },

    // ── Next 2-4 weeks ───────────────────────────────────────────────────────
    { patient: patients[0],  doctor: dr2, at: daysFromNow(10, 9),  status: "SCHEDULED", notes: "3-month BP follow-up" },
    { patient: patients[2],  doctor: dr0, at: daysFromNow(12, 10), status: "SCHEDULED" },
    { patient: patients[4],  doctor: dr1, at: daysFromNow(14, 11), status: "SCHEDULED", notes: "Diabetes management" },
    { patient: patients[6],  doctor: dr3, at: daysFromNow(16, 14), status: "SCHEDULED" },
    { patient: patients[8],  doctor: dr2, at: daysFromNow(18, 9),  status: "SCHEDULED", notes: "Physiotherapy referral" },
    { patient: patients[10], doctor: dr0, at: daysFromNow(20, 10), status: "SCHEDULED" },
    { patient: patients[12], doctor: dr1, at: daysFromNow(22, 11), status: "SCHEDULED", notes: "Dermatology consult" },
    { patient: patients[14], doctor: dr3, at: daysFromNow(25, 14), status: "SCHEDULED" },
    { patient: patients[16], doctor: dr2, at: daysFromNow(28, 9),  status: "SCHEDULED" },
  ];

  const createdAppts = await Promise.all(
    appts.map((a) =>
      prisma.appointment.create({
        data: {
          patientId:   a.patient.id,
          doctorId:    a.doctor.id,
          scheduledAt: a.at,
          status:      a.status,
          notes:       a.notes,
        },
      }),
    ),
  );

  // 6. Invoices — one per COMPLETED appointment
  const completedAppts = createdAppts.filter((_, i) => appts[i].status === "COMPLETED");

  // invoice amounts vary by appointment
  const AMOUNTS = [300, 250, 450, 200, 500, 350, 400, 280, 320, 220,
                   380, 420, 260, 290, 480, 310, 370, 240, 460, 190,
                   330, 410, 270, 340, 390, 430, 360, 440, 210, 470,
                   300, 250];

  await Promise.all(
    completedAppts.map((appt, i) => {
      // First 22 are PAID, rest UNPAID (2 CANCELLED billing)
      const billing =
        i < 22 ? "PAID"
        : i < 30 ? "UNPAID"
        : "CANCELLED";
      return prisma.invoice.create({
        data: {
          appointmentId: appt.id,
          amount:  AMOUNTS[i % AMOUNTS.length],
          status:  billing,
          paidAt:  billing === "PAID" ? new Date(appt.scheduledAt.getTime() + 3_600_000) : null,
        },
      });
    }),
  );

  // 7. Prescriptions — ~60% of completed appointments
  const prescriptionSeeds: {
    apptIdx: number; // index into completedAppts
    items: { medicationName: string; dosage: string; duration: string; notes?: string }[];
  }[] = [
    {
      apptIdx: 0,
      items: [
        { medicationName: "Paracétamol 500mg", dosage: "500mg × 3/jour", duration: "5 jours", notes: "Après les repas" },
        { medicationName: "Ibuprofène 400mg",  dosage: "400mg × 2/jour", duration: "3 jours" },
      ],
    },
    {
      apptIdx: 1,
      items: [
        { medicationName: "Amoxicilline 500mg", dosage: "500mg × 3/jour", duration: "7 jours", notes: "Terminer la cure complète" },
        { medicationName: "Paracétamol 500mg",  dosage: "500mg × 2/jour", duration: "3 jours" },
        { medicationName: "Oméprazole 20mg",    dosage: "20mg × 1/jour",  duration: "7 jours", notes: "À jeun le matin" },
      ],
    },
    {
      apptIdx: 2,
      items: [
        { medicationName: "Aténolol 50mg",   dosage: "50mg × 1/jour",  duration: "30 jours", notes: "Tension à surveiller" },
        { medicationName: "Amlodipine 5mg",  dosage: "5mg × 1/jour",   duration: "30 jours" },
      ],
    },
    {
      apptIdx: 3,
      items: [
        { medicationName: "Métronidazole 250mg", dosage: "250mg × 3/jour", duration: "7 jours", notes: "Éviter l'alcool" },
      ],
    },
    {
      apptIdx: 4,
      items: [
        { medicationName: "Metformine 500mg", dosage: "500mg × 2/jour", duration: "30 jours", notes: "Avec les repas" },
        { medicationName: "Aténolol 50mg",    dosage: "50mg × 1/jour",  duration: "30 jours" },
      ],
    },
    {
      apptIdx: 5,
      items: [
        { medicationName: "Cetirizine 10mg",   dosage: "10mg × 1/jour le soir", duration: "14 jours" },
        { medicationName: "Prednisolone 5mg",  dosage: "5mg × 2/jour",          duration: "5 jours", notes: "Décroissance progressive" },
      ],
    },
    {
      apptIdx: 6,
      items: [
        { medicationName: "Doxycycline 100mg", dosage: "100mg × 2/jour", duration: "10 jours", notes: "Avec un grand verre d'eau" },
        { medicationName: "Paracétamol 500mg", dosage: "500mg × 3/jour", duration: "5 jours"  },
      ],
    },
    {
      apptIdx: 8,
      items: [
        { medicationName: "Ibuprofène 400mg",  dosage: "400mg × 3/jour", duration: "7 jours", notes: "Avec les repas" },
        { medicationName: "Paracétamol 500mg", dosage: "1g × 3/jour",    duration: "5 jours" },
      ],
    },
    {
      apptIdx: 9,
      items: [
        { medicationName: "Furosémide 40mg",  dosage: "40mg × 1/jour le matin", duration: "14 jours" },
        { medicationName: "Amlodipine 5mg",   dosage: "5mg × 1/jour",           duration: "30 jours" },
      ],
    },
    {
      apptIdx: 10,
      items: [
        { medicationName: "Prednisolone 5mg", dosage: "20mg/jour décroissant", duration: "10 jours", notes: "Schéma dégressif fourni" },
        { medicationName: "Cetirizine 10mg",  dosage: "10mg × 1/jour",         duration: "21 jours" },
      ],
    },
    {
      apptIdx: 12,
      items: [
        { medicationName: "Azithromycine 500mg", dosage: "500mg × 1/jour", duration: "3 jours" },
        { medicationName: "Paracétamol 500mg",   dosage: "500mg × 3/jour", duration: "3 jours" },
        { medicationName: "Salbutamol 100mcg",   dosage: "2 bouffées × 3/jour", duration: "7 jours", notes: "En cas de sifflement" },
      ],
    },
    {
      apptIdx: 14,
      items: [
        { medicationName: "Aténolol 50mg",    dosage: "50mg × 1/jour",  duration: "30 jours" },
        { medicationName: "Furosémide 40mg",  dosage: "40mg × 1/jour",  duration: "30 jours", notes: "Surveiller la kaliémie" },
        { medicationName: "Oméprazole 20mg",  dosage: "20mg × 1/jour",  duration: "30 jours" },
      ],
    },
    {
      apptIdx: 16,
      items: [
        { medicationName: "Ibuprofène 400mg",  dosage: "400mg × 3/jour", duration: "5 jours", notes: "Après les repas" },
        { medicationName: "Paracétamol 500mg", dosage: "500mg × 3/jour", duration: "5 jours" },
      ],
    },
    {
      apptIdx: 18,
      items: [
        { medicationName: "Paracétamol 500mg",   dosage: "500mg × 4/jour",  duration: "5 jours" },
        { medicationName: "Amoxicilline 500mg",  dosage: "500mg × 3/jour",  duration: "7 jours" },
        { medicationName: "Vitamine C 1000mg",   dosage: "1000mg × 1/jour", duration: "10 jours" },
      ],
    },
    {
      apptIdx: 20,
      items: [
        { medicationName: "Cetirizine 10mg",  dosage: "10mg le soir",  duration: "30 jours", notes: "En période pollinique" },
        { medicationName: "Salbutamol 100mcg", dosage: "2 bouffées si besoin", duration: "à garder sur soi" },
      ],
    },
    {
      apptIdx: 22,
      items: [
        { medicationName: "Métronidazole 250mg", dosage: "500mg × 2/jour", duration: "7 jours", notes: "Éviter l'alcool" },
        { medicationName: "Oméprazole 20mg",     dosage: "20mg × 1/jour",  duration: "7 jours" },
      ],
    },
    {
      apptIdx: 24,
      items: [
        { medicationName: "Doxycycline 100mg",   dosage: "100mg × 1/jour", duration: "7 jours" },
        { medicationName: "Azithromycine 500mg", dosage: "500mg × 1/jour", duration: "3 jours" },
      ],
    },
    {
      apptIdx: 26,
      items: [
        { medicationName: "Salbutamol 100mcg",   dosage: "2 bouffées × 4/jour", duration: "10 jours" },
        { medicationName: "Prednisolone 5mg",    dosage: "10mg/jour",            duration: "5 jours"  },
        { medicationName: "Azithromycine 500mg", dosage: "500mg × 1/jour",       duration: "3 jours"  },
      ],
    },
    {
      apptIdx: 28,
      items: [
        { medicationName: "Metformine 500mg", dosage: "500mg × 3/jour", duration: "30 jours", notes: "Avec les repas" },
        { medicationName: "Vitamine C 1000mg", dosage: "1000mg × 1/jour", duration: "30 jours" },
      ],
    },
    {
      apptIdx: 30,
      items: [
        { medicationName: "Amlodipine 5mg",  dosage: "5mg × 1/jour",  duration: "30 jours" },
        { medicationName: "Aténolol 50mg",   dosage: "50mg × 1/jour", duration: "30 jours" },
        { medicationName: "Furosémide 40mg", dosage: "40mg matin",    duration: "30 jours", notes: "Pesée quotidienne conseillée" },
      ],
    },
  ];

  for (const seed of prescriptionSeeds) {
    const appt = completedAppts[seed.apptIdx];
    if (!appt) continue;
    await prisma.prescription.create({
      data: {
        appointmentId: appt.id,
        items: { create: seed.items },
      },
    });
  }

  // 8. Audit log
  const actorAdmin = { id: admin.id, name: admin.name };

  await prisma.auditLog.createMany({
    data: [
      { actorId: actorAdmin.id, actorName: actorAdmin.name, action: "ACCOUNT_CREATED",     targetType: "Profile", details: `Created account for ${SEED_USERS[1].name}` },
      { actorId: actorAdmin.id, actorName: actorAdmin.name, action: "ACCOUNT_CREATED",     targetType: "Profile", details: `Created account for ${SEED_USERS[2].name}` },
      { actorId: actorAdmin.id, actorName: actorAdmin.name, action: "ACCOUNT_CREATED",     targetType: "Profile", details: `Created account for ${SEED_USERS[3].name}` },
      { actorId: actorAdmin.id, actorName: actorAdmin.name, action: "ACCOUNT_CREATED",     targetType: "Profile", details: `Created account for ${SEED_USERS[4].name}` },
      { actorId: actorAdmin.id, actorName: actorAdmin.name, action: "ACCOUNT_CREATED",     targetType: "Profile", details: `Created account for ${SEED_USERS[5].name}` },
      { actorId: actorAdmin.id, actorName: actorAdmin.name, action: "ACCOUNT_CREATED",     targetType: "Profile", details: `Created account for ${SEED_USERS[6].name}` },
      { actorId: actorAdmin.id, actorName: actorAdmin.name, action: "ROLE_CHANGED",        targetType: "Profile", details: "Changed Dr. Sara Tazi from RECEPTIONIST to DOCTOR" },
      { actorId: actorAdmin.id, actorName: actorAdmin.name, action: "ACCOUNT_DEACTIVATED", targetType: "Profile", details: "Deactivated former staff account" },
      { actorId: actorAdmin.id, actorName: actorAdmin.name, action: "ACCOUNT_REACTIVATED", targetType: "Profile", details: "Reactivated Dr. Nadia Berrada" },
      { actorId: actorAdmin.id, actorName: actorAdmin.name, action: "INVOICE_STATUS_CHANGED", targetType: "Invoice", details: "Marked invoice as PAID — Mohammed Alaoui" },
      { actorId: actorAdmin.id, actorName: actorAdmin.name, action: "INVOICE_STATUS_CHANGED", targetType: "Invoice", details: "Marked invoice as PAID — Fatima Zahra Benali" },
      { actorId: actorAdmin.id, actorName: actorAdmin.name, action: "INVOICE_STATUS_CHANGED", targetType: "Invoice", details: "Marked invoice as CANCELLED — Hassan Idrissi" },
      { actorId: actorAdmin.id, actorName: actorAdmin.name, action: "PATIENT_DELETED",     targetType: "Patient", details: "Deleted test patient record" },
    ],
  });

  // ── Summary ─────────────────────────────────────────────────────────────────
  const totals = {
    patients:      patients.length,
    appointments:  createdAppts.length,
    completed:     completedAppts.length,
    scheduled:     createdAppts.filter((_, i) => appts[i].status === "SCHEDULED").length,
    cancelled:     createdAppts.filter((_, i) => appts[i].status === "CANCELLED").length,
    invoices:      completedAppts.length,
    prescriptions: prescriptionSeeds.length,
    medications:   meds.length,
  };

  console.log("\n✓ Seed complete\n");
  console.log(`  Patients:      ${totals.patients}`);
  console.log(`  Appointments:  ${totals.appointments} (${totals.completed} completed · ${totals.scheduled} scheduled · ${totals.cancelled} cancelled)`);
  console.log(`  Invoices:      ${totals.invoices}`);
  console.log(`  Prescriptions: ${totals.prescriptions}`);
  console.log(`  Medications:   15 · Supplies: 13 (5 below reorder threshold)`);
  console.log("\n  Logins (password: " + SEED_PASSWORD + ")");
  console.log("  Admin:         admin@medrecrut.dev");
  console.log("  Doctors:       doctor1-4@medrecrut.dev");
  console.log("  Receptionists: reception@medrecrut.dev, reception2@medrecrut.dev");
  console.log("  Personal:      you@medrecrut.dev\n");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
