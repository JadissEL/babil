-- Observation verification + multi-source consensus metadata

CREATE TYPE "ObservationVerificationStatus" AS ENUM ('pending', 'verified', 'estimated', 'disputed');

ALTER TABLE "CountryObservation"
  ADD COLUMN "verificationStatus" "ObservationVerificationStatus" NOT NULL DEFAULT 'pending',
  ADD COLUMN "sourcesConfirmed" INTEGER NOT NULL DEFAULT 1;

CREATE INDEX "CountryObservation_countryId_fieldPath_verificationStatus_idx"
  ON "CountryObservation"("countryId", "fieldPath", "verificationStatus");
