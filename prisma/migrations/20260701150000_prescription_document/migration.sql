-- Drop FK on old Prescription table
ALTER TABLE "Prescription" DROP CONSTRAINT "Prescription_appointmentId_fkey";

-- Rename old flat table and its primary key index (index names are schema-scoped in PG)
ALTER TABLE "Prescription" RENAME TO "OldPrescription";
ALTER INDEX "Prescription_pkey" RENAME TO "OldPrescription_pkey";

-- Create new Prescription document table (one per appointment)
CREATE TABLE "Prescription" (
  "id" TEXT NOT NULL,
  "appointmentId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Prescription_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Prescription_appointmentId_key" ON "Prescription"("appointmentId");
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_appointmentId_fkey"
  FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create PrescriptionItem table
CREATE TABLE "PrescriptionItem" (
  "id" TEXT NOT NULL,
  "prescriptionId" TEXT NOT NULL,
  "medicationName" TEXT NOT NULL,
  "dosage" TEXT NOT NULL,
  "duration" TEXT NOT NULL DEFAULT '',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PrescriptionItem_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "PrescriptionItem" ADD CONSTRAINT "PrescriptionItem_prescriptionId_fkey"
  FOREIGN KEY ("prescriptionId") REFERENCES "Prescription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate existing data: one Prescription document per unique appointmentId
INSERT INTO "Prescription" ("id", "appointmentId", "createdAt")
SELECT gen_random_uuid()::text, "appointmentId", MIN("createdAt")
FROM "OldPrescription"
GROUP BY "appointmentId";

-- Migrate old rows into PrescriptionItems
INSERT INTO "PrescriptionItem" ("id", "prescriptionId", "medicationName", "dosage", "duration", "notes", "createdAt")
SELECT op."id", p."id", op."medicationName", op."dosage", '', op."notes", op."createdAt"
FROM "OldPrescription" op
JOIN "Prescription" p ON p."appointmentId" = op."appointmentId";

-- Drop old table
DROP TABLE "OldPrescription";
