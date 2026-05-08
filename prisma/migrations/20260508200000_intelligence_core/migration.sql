-- Country Intelligence System: sources, pipeline runs, append-only observations

CREATE TYPE "IntelligenceSourceTier" AS ENUM ('TIER_A_OFFICIAL', 'TIER_B_MULTILATERAL', 'TIER_C_CURATED');

CREATE TABLE "IntelligenceSource" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tier" "IntelligenceSourceTier" NOT NULL,
    "baseUrl" TEXT,
    "licenseNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntelligenceSource_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "IntelligenceSource_slug_key" ON "IntelligenceSource"("slug");

CREATE TABLE "EnrichmentRun" (
    "id" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "trigger" TEXT NOT NULL DEFAULT 'manual',
    "errorSummary" TEXT,
    "statsJson" TEXT,

    CONSTRAINT "EnrichmentRun_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "EnrichmentRun_startedAt_idx" ON "EnrichmentRun"("startedAt");
CREATE INDEX "EnrichmentRun_status_idx" ON "EnrichmentRun"("status");

CREATE TABLE "CountryObservation" (
    "id" TEXT NOT NULL,
    "countryId" INTEGER NOT NULL,
    "fieldPath" TEXT NOT NULL,
    "valueJson" TEXT NOT NULL,
    "valueNumeric" DOUBLE PRECISION,
    "unit" TEXT,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "observedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourceId" TEXT NOT NULL,
    "runId" TEXT,
    "rawPayload" TEXT,

    CONSTRAINT "CountryObservation_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CountryObservation_countryId_fieldPath_idx" ON "CountryObservation"("countryId", "fieldPath");
CREATE INDEX "CountryObservation_sourceId_idx" ON "CountryObservation"("sourceId");
CREATE INDEX "CountryObservation_runId_idx" ON "CountryObservation"("runId");
CREATE INDEX "CountryObservation_observedAt_idx" ON "CountryObservation"("observedAt");

ALTER TABLE "CountryObservation" ADD CONSTRAINT "CountryObservation_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CountryObservation" ADD CONSTRAINT "CountryObservation_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "IntelligenceSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CountryObservation" ADD CONSTRAINT "CountryObservation_runId_fkey" FOREIGN KEY ("runId") REFERENCES "EnrichmentRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;
