-- Add free-text medication name, backfill from Medication table
ALTER TABLE "Prescription" ADD COLUMN "medicationName" TEXT;
UPDATE "Prescription" SET "medicationName" = m.name FROM "Medication" m WHERE m.id = "Prescription"."medicationId";
ALTER TABLE "Prescription" ALTER COLUMN "medicationName" SET NOT NULL;

-- Add optional notes field
ALTER TABLE "Prescription" ADD COLUMN "notes" TEXT;

-- Drop the medication FK
ALTER TABLE "Prescription" DROP CONSTRAINT "Prescription_medicationId_fkey";
ALTER TABLE "Prescription" DROP COLUMN "medicationId";
