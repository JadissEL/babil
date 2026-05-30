-- Immigration intelligence platform: discovery, source scores, taxonomy v2, extended verification

-- CreateEnum
CREATE TYPE "SourceDiscoveryStatus" AS ENUM ('pending', 'mapping', 'complete', 'failed', 'procedural_no_fetch');

-- AlterEnum
ALTER TYPE "ObservationVerificationStatus" ADD VALUE 'partially_verified';
ALTER TYPE "ObservationVerificationStatus" ADD VALUE 'needs_review';
ALTER TYPE "ObservationVerificationStatus" ADD VALUE 'contradictory';
ALTER TYPE "ObservationVerificationStatus" ADD VALUE 'outdated';
ALTER TYPE "ObservationVerificationStatus" ADD VALUE 'archived';

-- AlterTable IntelligenceSource
ALTER TABLE "IntelligenceSource" ADD COLUMN "discoveryStatus" "SourceDiscoveryStatus" NOT NULL DEFAULT 'pending';
ALTER TABLE "IntelligenceSource" ADD COLUMN "requiresDiscoveryGate" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "IntelligenceSource" ADD COLUMN "datafileSourceId" TEXT;
ALTER TABLE "IntelligenceSource" ADD COLUMN "trustScore" DOUBLE PRECISION;
ALTER TABLE "IntelligenceSource" ADD COLUMN "authorityScore" DOUBLE PRECISION;
ALTER TABLE "IntelligenceSource" ADD COLUMN "reliabilityLevel" TEXT;
ALTER TABLE "IntelligenceSource" ADD COLUMN "updateFrequencyHint" TEXT;
ALTER TABLE "IntelligenceSource" ADD COLUMN "countryCoverage" TEXT;
ALTER TABLE "IntelligenceSource" ADD COLUMN "informationTypesJson" TEXT;
ALTER TABLE "IntelligenceSource" ADD COLUMN "lastVerificationAt" TIMESTAMP(3);
ALTER TABLE "IntelligenceSource" ADD COLUMN "capabilitiesJson" TEXT;

CREATE UNIQUE INDEX "IntelligenceSource_datafileSourceId_key" ON "IntelligenceSource"("datafileSourceId");

-- CreateTable SourceSiteInventory
CREATE TABLE "SourceSiteInventory" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "status" "SourceDiscoveryStatus" NOT NULL DEFAULT 'pending',
    "sitemapUrl" TEXT,
    "robotsPolicy" TEXT,
    "capabilitiesJson" TEXT,
    "pageCount" INTEGER NOT NULL DEFAULT 0,
    "discoveredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastMappedAt" TIMESTAMP(3),
    "errorSummary" TEXT,
    CONSTRAINT "SourceSiteInventory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SourceSiteInventory_sourceId_key" ON "SourceSiteInventory"("sourceId");

ALTER TABLE "SourceSiteInventory" ADD CONSTRAINT "SourceSiteInventory_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "IntelligenceSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable SourcePageIndex
CREATE TABLE "SourcePageIndex" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "pageType" TEXT NOT NULL DEFAULT 'other',
    "depth" INTEGER NOT NULL DEFAULT 0,
    "parentUrl" TEXT,
    "title" TEXT,
    "contentHash" TEXT,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SourcePageIndex_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SourcePageIndex_sourceId_url_key" ON "SourcePageIndex"("sourceId", "url");
CREATE INDEX "SourcePageIndex_sourceId_idx" ON "SourcePageIndex"("sourceId");
CREATE INDEX "SourcePageIndex_sourceId_pageType_idx" ON "SourcePageIndex"("sourceId", "pageType");

ALTER TABLE "SourcePageIndex" ADD CONSTRAINT "SourcePageIndex_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "IntelligenceSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable FieldDefinition
CREATE TABLE "FieldDefinition" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "valueType" TEXT NOT NULL,
    "unit" TEXT,
    "countryOptional" BOOLEAN NOT NULL DEFAULT false,
    "presentationPattern" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FieldDefinition_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "FieldDefinition_path_key" ON "FieldDefinition"("path");

-- CreateTable CountryKnowledgeProfile
CREATE TABLE "CountryKnowledgeProfile" (
    "id" TEXT NOT NULL,
    "countryId" INTEGER NOT NULL,
    "activeFieldPathsJson" TEXT NOT NULL,
    "categoryCountJson" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CountryKnowledgeProfile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CountryKnowledgeProfile_countryId_key" ON "CountryKnowledgeProfile"("countryId");

ALTER TABLE "CountryKnowledgeProfile" ADD CONSTRAINT "CountryKnowledgeProfile_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;
