-- CreateEnum
CREATE TYPE "ConsultantGender" AS ENUM ('MALE', 'FEMALE', 'UNSPECIFIED');

-- CreateEnum
CREATE TYPE "ConsultantBookingStatus" AS ENUM ('PENDING_PAYMENT', 'PAID', 'CANCELLED');

-- CreateTable
CREATE TABLE "ConsultantExpert" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "title" TEXT,
    "bio" TEXT NOT NULL,
    "gender" "ConsultantGender" NOT NULL DEFAULT 'UNSPECIFIED',
    "specialties" TEXT[],
    "price30MinCents" INTEGER NOT NULL,
    "price60MinCents" INTEGER NOT NULL,
    "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "notifyEmail" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConsultantExpert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsultantSlot" (
    "id" TEXT NOT NULL,
    "expertId" TEXT NOT NULL,
    "startUtc" TIMESTAMP(3) NOT NULL,
    "endUtc" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsultantSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsultantBooking" (
    "id" TEXT NOT NULL,
    "expertId" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "customerEmail" TEXT,
    "durationMinutes" INTEGER NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'eur',
    "status" "ConsultantBookingStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "stripeSessionId" TEXT,
    "stripePaymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConsultantBooking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConsultantExpert_slug_key" ON "ConsultantExpert"("slug");

-- CreateIndex
CREATE INDEX "ConsultantSlot_expertId_startUtc_idx" ON "ConsultantSlot"("expertId", "startUtc");

-- CreateIndex
CREATE UNIQUE INDEX "ConsultantBooking_slotId_key" ON "ConsultantBooking"("slotId");

-- CreateIndex
CREATE UNIQUE INDEX "ConsultantBooking_stripeSessionId_key" ON "ConsultantBooking"("stripeSessionId");

-- CreateIndex
CREATE INDEX "ConsultantBooking_clerkUserId_idx" ON "ConsultantBooking"("clerkUserId");

-- CreateIndex
CREATE INDEX "ConsultantBooking_expertId_idx" ON "ConsultantBooking"("expertId");

-- AddForeignKey
ALTER TABLE "ConsultantSlot" ADD CONSTRAINT "ConsultantSlot_expertId_fkey" FOREIGN KEY ("expertId") REFERENCES "ConsultantExpert"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultantBooking" ADD CONSTRAINT "ConsultantBooking_expertId_fkey" FOREIGN KEY ("expertId") REFERENCES "ConsultantExpert"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultantBooking" ADD CONSTRAINT "ConsultantBooking_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "ConsultantSlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
