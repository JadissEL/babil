-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN "primary_objective_slug" TEXT;
ALTER TABLE "UserProfile" ADD COLUMN "secondary_objective_slugs" JSONB;
ALTER TABLE "UserProfile" ADD COLUMN "objective_wizard_completed_at" TIMESTAMP(3);
