-- AlterTable
ALTER TABLE "Lead" ADD COLUMN "partnerId" TEXT;
ALTER TABLE "Lead" ADD COLUMN "userType" TEXT;

-- CreateTable
CREATE TABLE "LeadStatusEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leadId" TEXT NOT NULL,
    "statusCode" TEXT NOT NULL,
    "actor" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LeadStatusEvent_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "LeadStatusEvent_leadId_createdAt_idx" ON "LeadStatusEvent"("leadId", "createdAt");

-- Backfill: give every existing lead one history row for its current status,
-- dated when the lead was created.
INSERT INTO "LeadStatusEvent" ("id", "leadId", "statusCode", "actor", "reason", "createdAt")
SELECT lower(hex(randomblob(12))), "id", "statusCode", 'MIGRATION', NULL, "createdAt" FROM "Lead";
