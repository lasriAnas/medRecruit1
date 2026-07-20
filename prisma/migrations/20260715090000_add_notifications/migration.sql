CREATE TABLE "Notification" (
  "id"        TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "profileId" TEXT NOT NULL,
  "type"      TEXT NOT NULL,
  "body"      TEXT NOT NULL,
  "link"      TEXT,
  "read"      BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Notification_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "Notification_profileId_read_idx" ON "Notification"("profileId", "read");
