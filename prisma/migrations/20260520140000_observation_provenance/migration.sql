-- Field-level provenance for audit / HITL review (best practice: citations at ingestion)

ALTER TABLE "CountryObservation"
  ADD COLUMN "sourceUrl" TEXT,
  ADD COLUMN "rawExcerpt" TEXT;

CREATE INDEX "CountryObservation_verificationStatus_observedAt_idx"
  ON "CountryObservation"("verificationStatus", "observedAt");
