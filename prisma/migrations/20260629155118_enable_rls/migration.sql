-- Enable RLS with no policies on app tables. Prisma connects as the `postgres`
-- role (BYPASSRLS), so app access is unaffected. This blocks Supabase's
-- auto-generated PostgREST API from exposing these tables via the public anon key.
ALTER TABLE "Profile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Patient" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Appointment" ENABLE ROW LEVEL SECURITY;
