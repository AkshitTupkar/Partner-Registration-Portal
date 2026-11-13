-- CreateTable
CREATE TABLE "Product" (
    "code" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "State" (
    "code" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "City" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "stateCode" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "City_stateCode_fkey" FOREIGN KEY ("stateCode") REFERENCES "State" ("code") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BlockedPartner" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mobile" TEXT,
    "pan" TEXT,
    "aadhaar" TEXT,
    "gst" TEXT,
    "reason" TEXT NOT NULL,
    "blockedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "OtpChallenge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mobile" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "consumedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "referenceNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "mobileVerifiedAt" DATETIME NOT NULL,
    "stateCode" TEXT NOT NULL,
    "statusCode" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'WEB',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Lead_stateCode_fkey" FOREIGN KEY ("stateCode") REFERENCES "State" ("code") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LeadProduct" (
    "leadId" TEXT NOT NULL,
    "productCode" TEXT NOT NULL,

    PRIMARY KEY ("leadId", "productCode"),
    CONSTRAINT "LeadProduct_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LeadProduct_productCode_fkey" FOREIGN KEY ("productCode") REFERENCES "Product" ("code") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LeadCity" (
    "leadId" TEXT NOT NULL,
    "cityId" INTEGER NOT NULL,

    PRIMARY KEY ("leadId", "cityId"),
    CONSTRAINT "LeadCity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LeadCity_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "City_stateCode_name_key" ON "City"("stateCode", "name");

-- CreateIndex
CREATE UNIQUE INDEX "BlockedPartner_mobile_key" ON "BlockedPartner"("mobile");

-- CreateIndex
CREATE UNIQUE INDEX "BlockedPartner_pan_key" ON "BlockedPartner"("pan");

-- CreateIndex
CREATE UNIQUE INDEX "BlockedPartner_aadhaar_key" ON "BlockedPartner"("aadhaar");

-- CreateIndex
CREATE UNIQUE INDEX "BlockedPartner_gst_key" ON "BlockedPartner"("gst");

-- CreateIndex
CREATE INDEX "OtpChallenge_mobile_createdAt_idx" ON "OtpChallenge"("mobile", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_referenceNumber_key" ON "Lead"("referenceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_mobile_key" ON "Lead"("mobile");

-- CreateIndex
CREATE INDEX "Lead_statusCode_idx" ON "Lead"("statusCode");

-- CreateIndex
CREATE INDEX "Lead_stateCode_idx" ON "Lead"("stateCode");
