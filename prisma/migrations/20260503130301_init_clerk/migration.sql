/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- RedefineTables (PostgreSQL) — équivalent des RedefineTables Prisma pour SQLite (PRAGMA + table swap).
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_userId_fkey";
ALTER TABLE "UserProfile" DROP CONSTRAINT "UserProfile_userId_fkey";

ALTER TABLE "Comment" ADD COLUMN "userId_new" TEXT;
UPDATE "Comment" SET "userId_new" = "userId"::text;
ALTER TABLE "Comment" DROP COLUMN "userId";
ALTER TABLE "Comment" RENAME COLUMN "userId_new" TO "userId";
ALTER TABLE "Comment" ALTER COLUMN "userId" SET NOT NULL;

ALTER TABLE "UserProfile" ADD COLUMN "userId_new" TEXT;
UPDATE "UserProfile" SET "userId_new" = "userId"::text;
ALTER TABLE "UserProfile" DROP COLUMN "userId";
ALTER TABLE "UserProfile" RENAME COLUMN "userId_new" TO "userId";
ALTER TABLE "UserProfile" ALTER COLUMN "userId" SET NOT NULL;

CREATE TABLE "User_new" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_new_pkey" PRIMARY KEY ("id")
);

INSERT INTO "User_new" ("id", "email", "name", "role", "createdAt")
SELECT "id"::text, "email", "name", "role", "createdAt" FROM "User";

DROP TABLE "User";
ALTER TABLE "User_new" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
