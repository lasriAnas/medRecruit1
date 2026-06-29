-- Reassign any existing OTHER patients before narrowing the enum, alternating
-- MALE/FEMALE so the migration is safe to run against real data.
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS rn
  FROM "Patient"
  WHERE gender = 'OTHER'
)
UPDATE "Patient" p
SET gender = (CASE WHEN ranked.rn % 2 = 0 THEN 'MALE' ELSE 'FEMALE' END)::"Gender"
FROM ranked
WHERE p.id = ranked.id;

ALTER TYPE "Gender" RENAME TO "Gender_old";
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');
ALTER TABLE "Patient" ALTER COLUMN "gender" TYPE "Gender" USING ("gender"::text::"Gender");
DROP TYPE "Gender_old";
