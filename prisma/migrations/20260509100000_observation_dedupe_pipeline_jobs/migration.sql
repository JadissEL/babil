-- C.43: idempotent World Bank writes via stable dedupeKey
-- C.45: async pipeline job queue for long-running workers

ALTER TABLE "CountryObservation" ADD COLUMN "dedupeKey" TEXT;

CREATE UNIQUE INDEX "CountryObservation_dedupeKey_key" ON "CountryObservation"("dedupeKey");

CREATE TABLE "IntelligencePipelineJob" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "payloadJson" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "errorSummary" TEXT,
    "resultJson" TEXT,

    CONSTRAINT "IntelligencePipelineJob_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "IntelligencePipelineJob_status_priority_createdAt_idx" ON "IntelligencePipelineJob"("status", "priority" DESC, "createdAt" ASC);
