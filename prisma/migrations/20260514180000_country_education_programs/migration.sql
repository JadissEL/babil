-- CreateEnum
CREATE TYPE "EducationProgramKind" AS ENUM ('LANGUAGE_STUDY', 'SHORT_COURSES', 'TECHNICAL_TRAINING');

-- CreateEnum
CREATE TYPE "EducationBacBucket" AS ENUM ('NOT_REQUIRED', 'REQUIRED', 'SCHOOL_DEPENDENT', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "EducationCostBucket" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "EducationWorkRightsBucket" AS ENUM ('ALLOWED', 'LIMITED', 'FORBIDDEN', 'UNKNOWN');

-- CreateTable
CREATE TABLE "CountryEducationProgram" (
    "id" SERIAL NOT NULL,
    "countryId" INTEGER NOT NULL,
    "kind" "EducationProgramKind" NOT NULL,
    "bacBucket" "EducationBacBucket" NOT NULL DEFAULT 'UNKNOWN',
    "costBucket" "EducationCostBucket" NOT NULL DEFAULT 'UNKNOWN',
    "workRightsBucket" "EducationWorkRightsBucket" NOT NULL DEFAULT 'UNKNOWN',
    "programType" TEXT,
    "visaType" TEXT,
    "durationText" TEXT,
    "costText" TEXT,
    "estimatedCostText" TEXT,
    "bacRequiredText" TEXT,
    "workRightsText" TEXT,
    "access" TEXT,
    "insight" TEXT,
    "typesJson" JSONB,
    "accessBac" BOOLEAN NOT NULL DEFAULT false,
    "accessNoBac" BOOLEAN NOT NULL DEFAULT false,
    "sourceVersion" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CountryEducationProgram_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CountryEducationProgram_countryId_kind_key" ON "CountryEducationProgram"("countryId", "kind");

-- CreateIndex
CREATE INDEX "CountryEducationProgram_kind_idx" ON "CountryEducationProgram"("kind");

-- CreateIndex
CREATE INDEX "CountryEducationProgram_kind_bacBucket_idx" ON "CountryEducationProgram"("kind", "bacBucket");

-- CreateIndex
CREATE INDEX "CountryEducationProgram_kind_costBucket_idx" ON "CountryEducationProgram"("kind", "costBucket");

-- AddForeignKey
ALTER TABLE "CountryEducationProgram" ADD CONSTRAINT "CountryEducationProgram_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;
