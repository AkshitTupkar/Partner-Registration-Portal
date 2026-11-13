/*
  Warnings:

  - You are about to drop the `LeadCity` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `cityId` to the `Lead` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "LeadCity";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "referenceNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "mobileVerifiedAt" DATETIME NOT NULL,
    "stateCode" TEXT NOT NULL,
    "cityId" INTEGER NOT NULL,
    "statusCode" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'WEB',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Lead_stateCode_fkey" FOREIGN KEY ("stateCode") REFERENCES "State" ("code") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Lead_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Lead" ("createdAt", "id", "mobile", "mobileVerifiedAt", "name", "referenceNumber", "source", "stateCode", "statusCode", "updatedAt") SELECT "createdAt", "id", "mobile", "mobileVerifiedAt", "name", "referenceNumber", "source", "stateCode", "statusCode", "updatedAt" FROM "Lead";
DROP TABLE "Lead";
ALTER TABLE "new_Lead" RENAME TO "Lead";
CREATE UNIQUE INDEX "Lead_referenceNumber_key" ON "Lead"("referenceNumber");
CREATE UNIQUE INDEX "Lead_mobile_key" ON "Lead"("mobile");
CREATE INDEX "Lead_statusCode_idx" ON "Lead"("statusCode");
CREATE INDEX "Lead_stateCode_idx" ON "Lead"("stateCode");
CREATE INDEX "Lead_cityId_idx" ON "Lead"("cityId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
