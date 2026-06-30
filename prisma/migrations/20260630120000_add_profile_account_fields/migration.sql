-- AlterTable
ALTER TABLE "Profile" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Profile" ADD COLUMN "mustChangePassword" BOOLEAN NOT NULL DEFAULT true;
